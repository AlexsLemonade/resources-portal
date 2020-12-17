import React from 'react'
import { useRouter } from 'next/router'
import { CreateUserContext } from 'contexts/CreateUserContext'
import { useUser } from 'hooks/useUser'
import api from 'api'
import getRedirectQueryParam from 'helpers/getRedirectQueryParam'

export const useCreateUser = (code, clientPath) => {
  const router = useRouter()
  const { user, fetchUserWithNewToken, fetchUserWithOrcidDetails } = useUser()
  const {
    newUser,
    setNewUser,
    steps,
    setSteps,
    currentStep,
    setCurrentStep,
    required,
    setRequired,
    codeRef,
    requiredRef,
    error,
    setError,
    clientRedirectUrl
  } = React.useContext(CreateUserContext)

  React.useEffect(() => {
    const asyncGetORCID = async () => {
      const orcidRequest = await api.orcid.create(
        code,
        getRedirectQueryParam(clientPath)
      )
      if (orcidRequest.isOk) {
        setNewUser({ ...newUser, ...orcidRequest.response })
      }
    }

    // If we have the auth code, get the ORCID info
    if (code && !newUser.access_token && !codeRef.current) {
      codeRef.current = true
      asyncGetORCID()
    }

    //  Once we have that info, login the user if possible
    const hasRequired =
      !required ||
      required.length === 0 ||
      required.every((r) => Object.keys(newUser).includes(r))

    if (code && !user && newUser.access_token && hasRequired) {
      createAndLoginUser()
    }

    // we have a user and somewhere to go
    if (
      user &&
      clientRedirectUrl &&
      !clientRedirectUrl.includes('create-account')
    ) {
      router.replace(clientRedirectUrl)
    }

    // Generate initial steps
    const stepsArray = ['Create an Account']
    if (!newUser.email) {
      stepsArray.push('Enter Details')
    }
    if (newUser.grants) {
      stepsArray.push('Verify Grant Information')
    }
    stepsArray.push('Next Steps')

    if (steps.length === 0) {
      setSteps(stepsArray)
    }

    if (currentStep === '') {
      setCurrentStep(stepsArray[0])
    }
  })

  const createAndLoginUser = async () => {
    const createUserRequest = await api.users.create(newUser)

    if (!createUserRequest.isOk) {
      if (createUserRequest.status === 401) {
        const {
          response: { required: newRequired }
        } = createUserRequest

        if (newRequired) {
          requiredRef.current = true
          setRequired(newRequired)
        }
        return createUserRequest
      }

      if (createUserRequest.status === 400) {
        const {
          response: { error_code: errorCode }
        } = createUserRequest

        if (errorCode === 'USER_EXISTS') {
          return fetchUserWithOrcidDetails(newUser)
        }
      }

      // TODO:: SENTRY
      console.log('error', createUserRequest)
      return createUserRequest
    }

    const {
      response: { user_id: userId, token }
    } = createUserRequest

    return fetchUserWithNewToken(userId, token)
  }

  const getNextStep = () => {
    const nextStepIndex = Math.min(
      steps.length - 1,
      steps.indexOf(currentStep) + 1
    )
    return steps[nextStepIndex]
  }

  const stepForward = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const stepBack = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  return {
    createAndLoginUser,
    newUser,
    setNewUser,
    user,
    steps,
    currentStep,
    setCurrentStep,
    stepForward,
    stepBack,
    getNextStep,
    required,
    setRequired,
    error,
    setError
  }
}
