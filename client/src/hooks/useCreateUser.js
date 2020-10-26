import React from 'react'
import { CreateUserContext } from 'contexts/CreateUserContext'
import { useUser } from 'hooks/useUser'
import api from 'api'

export const useCreateUser = (code, originUrl) => {
  const { user, fetchUserWithNewToken } = useUser()
  const {
    newUser,
    setNewUser,
    steps,
    setSteps,
    currentStep,
    setCurrentStep
  } = React.useContext(CreateUserContext)
  const orcidRef = React.useRef(false)

  React.useEffect(() => {
    const asyncGetORCID = async () => {
      const orcidRequest = await api.orcid.create(code, originUrl)
      if (orcidRequest.isOk) {
        setNewUser({ ...newUser, ...orcidRequest.response })
      }
    }

    // If we have the auth code, get the ORCID info
    if (code && !newUser.access_token && !orcidRef.current) {
      orcidRef.current = true
      asyncGetORCID()
    }

    //  Once we have that info, login the user
    if (code && !user && newUser.access_token) {
      createAndLoginUser()
    }

    // Generate initial steps
    const stepsArray = ['Create an Account']
    if (!newUser.email) {
      stepsArray.push('Enter Email')
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

    if (createUserRequest.status === 401) {
      return { error: createUserRequest }
    }

    if (!createUserRequest.isOk) {
      // TODO::SENTRY
      console.log('error', createUserRequest)
      return { error: createUserRequest }
    }

    const {
      response: { user_id: userId, token }
    } = createUserRequest

    await fetchUserWithNewToken(userId, token)

    return {}
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
    newUser,
    setNewUser,
    user,
    steps,
    currentStep,
    setCurrentStep,
    createAndLoginUser,
    stepForward,
    stepBack,
    getNextStep
  }
}
