import { CreateUserContext } from 'contexts/CreateUserContext'
import React from 'react'
import { string } from 'yup'
import api from '../api'
import { useUser } from './useUser'

export const useCreateUser = (
  email,
  grants,
  ORCID,
  queryCode,
  initialRedirectUrl
) => {
  const { user, setUser, setToken } = useUser()
  const {
    createUser,
    setCreateUser,
    orcidInfo,
    setOrcidInfo,
    steps,
    setSteps,
    currentStep,
    setCurrentStep,
    needsEmail,
    setNeedsEmail,
    authCodeUsed,
    setAuthCodeUsed
  } = React.useContext(CreateUserContext)

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
    needsSave = false
  }

  React.useEffect(() => {
    // If we have the auth code, get the ORCID info
    if (queryCode && Object.keys(orcidInfo).length === 0 && !authCodeUsed) {
      api.user.getORCID(queryCode, initialRedirectUrl).then((response) => {
        setOrcidInfo({ ...response.response })
      })
      setAuthCodeUsed(true)
    }

    //  Once we have that info, login the user
    if (
      queryCode &&
      Object.keys(orcidInfo).length !== 0 &&
      !user &&
      !needsEmail
    ) {
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

    if (tokenRequest.status === 401) {
      setNeedsEmail(true)
      return { error: tokenRequest }
    }

    if (!tokenRequest.isOk) {
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

  const createAndLoginUser = async (orcid, accessToken, refreshToken) => {
    const { authenticatedUser, token } = await callCreateUser(
      orcid,
      accessToken,
      refreshToken,
      createUser.email,
      createUser.grants
    )
    if (authenticatedUser && authenticatedUser.id) {
      setUser(authenticatedUser)
    }
    if (token) {
      setToken(token)
    }
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

  const getNextStep = () => {
    const nextStepIndex = Math.min(
      steps.length - 1,
      steps.indexOf(currentStep) + 1
    )
    return steps[nextStepIndex]
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
    getNextStep,
    setGrants,
    setEmail,
    save,
    validEmail
  }
}
