import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/r2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/r2"!</div>
}
