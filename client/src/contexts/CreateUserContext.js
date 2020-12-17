import React from 'react'
import { useRouter } from 'next/router'
import { useLocalStorage } from 'hooks/useLocalStorage'

export const CreateUserContext = React.createContext({})

export const CreateUserContextProvider = ({ defaultUser, children }) => {
  const router = useRouter()
  // these come from the query parameters when the create-account page is first loaded
  const [newUser, setNewUser] = useLocalStorage('create-account-new-user', {})

  // get redirect url
  const [clientRedirectUrl] = useLocalStorage('client-redirect-url')

  // manage steps
  const [steps, setSteps] = useLocalStorage('create-account-steps', [])
  const [currentStep, setCurrentStep] = useLocalStorage(
    'create-account-step',
    ''
  )
  const [required, setRequired] = React.useState()
  const [error, setError] = React.useState([])
  const codeRef = React.useRef(false)
  const requiredRef = React.useRef(false)

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

  // Cleanup localStorage without triggering events
  const cleanup = () => {
    window.localStorage.removeItem('create-account-new-user')
    window.localStorage.removeItem('create-account-steps')
    window.localStorage.removeItem('create-account-step')
    window.localStorage.removeItem('client-redirect-url')
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
        required,
        setRequired,
        codeRef,
        requiredRef,
        error,
        setError,
        cleanup,
        clientRedirectUrl
      }}
    >
      {children}
    </CreateUserContext.Provider>
  )
}
