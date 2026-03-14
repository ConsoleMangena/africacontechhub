import { Icon } from '@/components/ui/material-icon'
import { Outlet } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <Icon name="manage_accounts" size={16} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Icon name="build" size={16} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Icon name="palette" size={16} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Icon name="notifications" size={16} />,
  },

]

export function Settings() {
  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="flex flex-col gap-6 pb-8">
          {/* Page Header */}
          <div>
            <h1 className='text-xl font-bold font-display tracking-tight text-foreground'>
              Settings
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Manage your account settings and preferences.
            </p>
          </div>

          <Separator />

          {/* Content Layout */}
          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            {/* Sidebar */}
            <aside className='lg:w-64 flex-shrink-0 w-full'>
              <div className="bg-white rounded-lg border border-slate-200 p-2 sticky top-0">
                <SidebarNav items={sidebarNavItems} />
              </div>
            </aside>

            {/* Main Content */}
            <div className='flex-1 min-w-0 w-full'>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
