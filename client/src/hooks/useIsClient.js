import React from 'react'

// Some things are only available on the cliet like window and localStorage
// Other times we dont want to SSR certain pages
// This hook helps with that.
//
// Exp:
//
//  const MyComponent = () => {
//    const isClient = useIsClient()
//    return isClient(<DefaultPageToRender>, <MyPageThatUsesLocalStorage>)
//  }

export const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => setIsClient(true))

  return (fallback, page) => (isClient ? page : fallback)
}
