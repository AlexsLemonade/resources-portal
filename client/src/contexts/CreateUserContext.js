import { useLocalStorage } from 'hooks/useLocalStorage'
import React from 'react'

export const CreateUserContext = React.createContext({})

export const CreateUserContextProvider = ({ children }) => {
  const [createUser, setCreateUser] = useLocalStorage('createUser', {})
  const [orcidInfo, setOrcidInfo] = useLocalStorage('orcidInfo', {})
  const [currentStep, setCurrentStep] = useLocalStorage('currentStep', '')
  const [steps, setSteps] = useLocalStorage('steps', [])
  const [needsEmail, setNeedsEmail] = useLocalStorage('needsEmail', false)
  const [authCodeUsed, setAuthCodeUsed] = React.useState(false)
  const [error, setError] = React.useState('')

  // Cleanup localstorage without triggering events
  const cleanup = () => {
    window.localStorage.removeItem('createUser')
    window.localStorage.removeItem('orcidInfo')
    window.localStorage.removeItem('currentStep')
    window.localStorage.removeItem('steps')
    window.localStorage.removeItem('needsEmail')
  }

  return (
    <CreateUserContext.Provider
      value={{
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
        setAuthCodeUsed,
        error,
        setError,
        cleanup
      }}
    >
      {children}
    </CreateUserContext.Provider>
  )
}
