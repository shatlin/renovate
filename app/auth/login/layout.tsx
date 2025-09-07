import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your RenovateBudget account to manage your renovation projects.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}