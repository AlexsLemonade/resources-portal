import { useLocalStorage } from 'hooks/useLocalStorage'
import React from 'react'

export const SignInContext = React.createContext({})

export const SignInContextProvider = ({ children }) => {
  const [errorHasFired, setErrorHasFired] = React.useState(false)
  const [error, setError] = React.useState('')
  const [email, setEmail] = useLocalStorage('email')
  const [needsEmail, setNeedsEmail] = useLocalStorage('needsEmail', false)
  const [orcidInfo, setOrcidInfo] = useLocalStorage('orcidInfo')

  // Cleanup localstorage without triggering events
  const cleanup = () => {
    window.localStorage.removeItem('email')
    window.localStorage.removeItem('needsEmail')
    window.localStorage.removeItem('orcidInfo')
  }

  return (
    <SignInContext.Provider
      value={{
        errorHasFired,
        setErrorHasFired,
        orcidInfo,
        setOrcidInfo,
        email,
        setEmail,
        needsEmail,
        setNeedsEmail,
        error,
        setError,
        cleanup
      }}
    >
      {children}
    </SignInContext.Provider>
  )
}
