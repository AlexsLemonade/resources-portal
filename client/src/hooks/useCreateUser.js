import React from 'react'
import { string } from 'yup'
import api from '../api'
import {
  CreateAccountStep,
  EnterEmailStep,
  NextStepsStep,
  VerifyGrantStep
} from '../components/CreateAccount'
import { useLocalStorage } from './useLocalStorage'
import { useUser } from './useUser'

export const useCreateUser = (email, grants, ORCID) => {
  const [createUser, setCreateUser] = useLocalStorage('createUser', {})
  const [currentStep, setCurrentStep] = useLocalStorage('currentStep', '')
  const [steps, setSteps] = useLocalStorage('steps', [])
  const { user, setUser, setToken, setLoginRedirectUrl } = useUser()

  const save = () => {
    setCreateUser({ ...createUser })
  }

  let needsSave = false

  if (email && !createUser.email) {
    createUser.email = email
    needsSave = true
  }

  if (grants && !createUser.grants) {
    createUser.grants = grants
    needsSave = true
  }

  if (needsSave) {
    save()
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

  const getStepDict = (instance) => {
    return {
      'Create Account': (
        <CreateAccountStep
          ORCID={ORCID}
          nextStep={steps[steps.indexOf(currentStep) + 1]}
        />
      ),
      'Enter Email': <EnterEmailStep createUser={instance} />,
      'Verify Grant Information': <VerifyGrantStep createUser={instance} />,
      'Next Steps': <NextStepsStep />
    }
  }

  const callCreateUser = async (code, originUrl, loginEmail, loginGrants) => {
    const [tokenRequest, userRequest] = await api.user.create(
      code,
      originUrl,
      loginEmail,
      JSON.stringify(loginGrants)
    )

    if (!tokenRequest.isOk) {
      console.log('error', tokenRequest)
      return { error: tokenRequest }
    }

    const { token } = tokenRequest.response
    const redirectUrl = originUrl

    if (!userRequest.isOk) {
      console.log('error', userRequest)
      return { error: userRequest }
    }

    const authenticatedUser = userRequest.response

    return { authenticatedUser, token, redirectUrl }
  }

  const createAndLoginUser = (code, originUrl) => {
    callCreateUser(code, originUrl, createUser.email, createUser.grants).then(
      ({ authenticatedUser, token, redirectUrl }) => {
        if (authenticatedUser && authenticatedUser.id) {
          setUser(authenticatedUser)
        }
        if (token) {
          setToken(token)
        }
        if (redirectUrl) {
          setLoginRedirectUrl(redirectUrl)
        }
      }
    )
  }

  const generateSteps = () => {
    React.useEffect(() => {
      // Generate initial steps
      const stepsArray = []
      if (!createUser.email || createUser.needsEmail) {
        stepsArray.push('Enter Email')
      }
      stepsArray.push('Create Account')
      if (createUser.grants) {
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
  }

  const setEmail = (newEmail, needsEmail) => {
    createUser.email = newEmail
    createUser.needsEmail = needsEmail
  }

  const setGrants = (newGrants) => {
    createUser.grants = newGrants
  }

  const validEmail = () => {
    const schema = string().email().required()
    try {
      schema.validateSync(createUser.email)
    } catch (e) {
      return false
    }
    return true
  }

  const getStepComponent = (step, instance) => {
    return getStepDict(instance)[step]
  }

  return {
    createUser,
    user,
    steps,
    currentStep,
    setCurrentStep,
    generateSteps,
    createAndLoginUser,
    stepForward,
    stepBack,
    getStepComponent,
    setGrants,
    setEmail,
    save,
    validEmail
  }
}
