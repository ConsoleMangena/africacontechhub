import { createFileRoute } from '@tanstack/react-router'
import { AdminUserDetails } from '@/features/dashboards/admin/user-details'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: UserDetailsRoute,
})

function UserDetailsRoute() {
  const { userId } = Route.useParams()
  return <AdminUserDetails userId={Number(userId)} />
}

