import React from 'react'
import { useRouter } from 'next/router'
import { useLocalStorage } from 'hooks/useLocalStorage'

//  defaults={{ ORCID, email, grants, code, originUrl, stepName }}

export const CreateUserContext = React.createContext({})

export const CreateUserContextProvider = ({ defaultUser, children }) => {
  const router = useRouter()
  // these come from the query parameters when the create-user page is first loaded
  const [newUser, setNewUser] = useLocalStorage('create-user', {})
  const [steps, setSteps] = useLocalStorage('create-user-steps', [])
  const [currentStep, setCurrentStep] = useLocalStorage('create-user-step', '')
  const [error, setError] = React.useState('')

  // when the page using the context changes clean up if appropriate
  const handleRouteChangeStart = (url) => {
    if (!url.includes('orcid.org') && !url.includes('create-account')) {
      cleanup()
    }
  }

  React.useEffect(() => {
    if (defaultUser) setNewUser(defaultUser)

    router.events.on('routeChangeStart', handleRouteChangeStart)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  })

  // Cleanup localstorage without triggering events
  const cleanup = () => {
    window.localStorage.removeItem('create-user')
    window.localStorage.removeItem('create-user-steps')
    window.localStorage.removeItem('create-user-step')
  }

  return (
    <CreateUserContext.Provider
      value={{
        newUser,
        setNewUser,
        steps,
        setSteps,
        currentStep,
        setCurrentStep,
        error,
        setError,
        cleanup
      }}
    >
      {children}
    </CreateUserContext.Provider>
  )
}
