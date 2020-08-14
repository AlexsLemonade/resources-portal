import React from 'react'
import termsOfUse from '../markdown/TermsOfUse.md'
import { MarkdownPage } from '../components/MarkdownPage'

export const TermsOfUse = () => {
  return <MarkdownPage markdown={termsOfUse} />
}

export default TermsOfUse
