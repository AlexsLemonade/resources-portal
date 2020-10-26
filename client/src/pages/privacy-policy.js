import React from 'react'
import { MarkdownPage } from '../components/MarkdownPage'
import privacyPolicy from '../markdown/privacyPolicy.md'

export const PrivacyPolicy = () => {
  return <MarkdownPage markdown={privacyPolicy} />
}

export default PrivacyPolicy
