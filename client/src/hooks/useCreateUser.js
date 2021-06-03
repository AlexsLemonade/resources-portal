import React from 'react'
import { useRouter } from 'next/router'
import { CreateUserContext } from 'contexts/CreateUserContext'
import { useUser } from 'hooks/useUser'
import api from 'api'
import getRedirectQueryParam from 'helpers/getRedirectQueryParam'
import arraysMatch from 'helpers/arraysMatch'
import { ResourcesPortalContext } from 'ResourcesPortalContext'

export const useCreateUser = (code, clientPath) => {
  const router = useRouter()
  const {
    user,
    fetchUserWithNewToken,
    fetchUserWithOrcidDetails,
    handleLoginError
  } = useUser()
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

  const { skipAccountRedirectRef } = React.useContext(ResourcesPortalContext)

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
      // allow this action to take place
      // by skipping the default account -> basic-information redirect
      skipAccountRedirectRef.current = true
      router.replace(clientRedirectUrl)
    }

    // Generate initial steps
    const stepsArray = ['Create an Account', 'Enter Details']

    if (newUser.grants) {
      stepsArray.push('Verify Grant Information')
    }
    stepsArray.push('Next Steps')

    if (!arraysMatch(stepsArray, steps)) {
      setSteps(stepsArray)
    }

    if (currentStep === '') {
      setCurrentStep(stepsArray[0])
    }
  })

  const createAndLoginUser = async () => {
    const createUserRequest = await api.users.create(newUser)

    if (!createUserRequest.isOk) {
      if (createUserRequest.status === 422) {
        const {
          response: { required: newRequired }
        } = createUserRequest

        if (newRequired) {
          requiredRef.current = true
          setRequired(newRequired)
        }
        return createUserRequest
      }

      if (createUserRequest.status === 409) {
        const {
          response: { error_code: errorCode }
        } = createUserRequest

        if (errorCode === 'USER_EXISTS') {
          return fetchUserWithOrcidDetails(newUser)
        }
      }

      // an error occurred that we dont know how to handle
      // clear their session and tell them to try again later
      newUser.access_token = false // prevent firing request again with same creds
      return handleLoginError(
        'Unable to create account at this time. Please try again later.',
        clientRedirectUrl
      )
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
    requiredRef,
    required,
    setRequired,
    error,
    setError
  }
}
