import React from 'react'
import NewDeckClient from '../../../components/NewDeckClient'

// Note: We don't need generateStaticParams() here because this is a simple static page
// with no dynamic segments. The client component handles all dynamic content.

export default function NewDeckPage() {
  return <NewDeckClient />
}