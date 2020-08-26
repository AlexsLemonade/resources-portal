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

export const useCreateUser = (
  email,
  grants,
  ORCID,
  queryCode,
  initialRedirectUrl
) => {
  const [createUser, setCreateUser] = useLocalStorage('createUser', {})
  const [orcidInfo, setOrcidInfo] = useLocalStorage('orcidInfo', {})
  const [currentStep, setCurrentStep] = useLocalStorage('currentStep', '')
  const [steps, setSteps] = useLocalStorage('steps', [])
  const [needsEmail, setNeedsEmail] = useLocalStorage('needsEmail', false)
  const { user, setUser, setToken, setLoginRedirectUrl } = useUser()

  const save = () => {
    setCreateUser({ ...createUser })
  }

  React.useEffect(() => {
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

    // If ORCID has returned the auth code to this page, sign the user in
    if (queryCode && !user && !needsEmail) {
      if (Object.keys(orcidInfo).length === 0) {
        api.user.getORCID(queryCode, initialRedirectUrl).then((response) => {
          setOrcidInfo({ ...response.response })
        })
      }
      createAndLoginUser(
        orcidInfo.orcid,
        orcidInfo.access_token,
        orcidInfo.refresh_token
      )
    }

    // Generate initial steps
    const stepsArray = ['Create Account']
    if (!createUser.email) {
      stepsArray.push('Enter Email')
    }
    if (createUser.grants) {
      stepsArray.push('Verify Grant Information')
    }
    stepsArray.push('Next Steps')

    if (steps.length === 0) {
      setSteps(stepsArray)
    }

    if (currentStep === '') {
      setCurrentStep(stepsArray[0])
      setNeedsEmail(false)
    }
  })

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

  const callCreateUser = async (
    orcid,
    accessToken,
    refreshToken,
    loginEmail,
    loginGrants
  ) => {
    const [tokenRequest, userRequest] = await api.user.create(
      orcid,
      accessToken,
      refreshToken,
      loginEmail,
      JSON.stringify(loginGrants)
    )

    console.log(tokenRequest)

    if (tokenRequest.status === 401) {
      setNeedsEmail(true)
      return { error: tokenRequest }
    }

    if (tokenRequest.error) {
      console.log('error', tokenRequest)
      return { error: tokenRequest }
    }

    const { token } = tokenRequest.response

    if (!userRequest.status === 200) {
      console.log('error', userRequest)
      return { error: userRequest }
    }

    const authenticatedUser = userRequest.response

    return { authenticatedUser, token }
  }

  const createAndLoginUser = (orcid, accessToken, refreshToken) => {
    callCreateUser(
      orcid,
      accessToken,
      refreshToken,
      createUser.email,
      createUser.grants
    ).then(({ authenticatedUser, token, redirectUrl }) => {
      if (authenticatedUser && authenticatedUser.id) {
        setUser(authenticatedUser)
      }
      if (token) {
        setToken(token)
      }
      if (redirectUrl) {
        setLoginRedirectUrl(redirectUrl)
      }
    })
  }

  const setEmail = (newEmail) => {
    createUser.email = newEmail
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
    createAndLoginUser,
    setNeedsEmail,
    stepForward,
    stepBack,
    getStepComponent,
    setGrants,
    setEmail,
    save,
    validEmail
  }
}
