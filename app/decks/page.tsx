import React from 'react'
import DecksClient from '../../components/DecksClient'

// This function is required when using 'output: export' in next.config.js
export function generateStaticParams() {
  // Since this is a static page with no dynamic segments,
  // we return an empty array
  return []
}

export default function DecksPage() {
  return <DecksClient />
}