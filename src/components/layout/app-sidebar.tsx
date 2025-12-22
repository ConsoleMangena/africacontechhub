import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useAuthStore } from '@/stores/auth-store'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((state) => state.auth.user)

  // Get user data from auth store
  const getUserName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.first_name) {
      return user.first_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const currentUser = {
    name: getUserName(),
    email: user?.email || 'No email',
    avatar: '/avatars/shadcn.jpg',
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => {
          const role = user?.profile?.role

          // Always show 'Other' group
          if (props.title === 'Other') {
            return <NavGroup key={props.title} {...props} />
          }

          // Show role-specific workspace
          if (role === 'BUILDER' && props.title === 'Builder Workspace') {
            return <NavGroup key={props.title} {...props} />
          }
          if (role === 'CONTRACTOR' && props.title === 'Contractor Workspace') {
            return <NavGroup key={props.title} {...props} />
          }
          if (role === 'SUPPLIER' && props.title === 'Supplier Workspace') {
            return <NavGroup key={props.title} {...props} />
          }
          if (role === 'ADMIN') {
            // Admin sees everything for now, or specific admin view
            return <NavGroup key={props.title} {...props} />
          }

          return null
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
