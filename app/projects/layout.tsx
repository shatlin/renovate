import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Projects',
  description: 'Manage all your renovation projects, track budgets, and monitor progress in one place.',
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}