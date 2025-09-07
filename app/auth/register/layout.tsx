import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free RenovateBudget account and start planning your renovation like a pro.',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}