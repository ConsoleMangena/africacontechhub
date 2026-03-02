import { Outlet } from '@tanstack/react-router'
import { Bell, Palette, Wrench, UserCog } from 'lucide-react'
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
    icon: <UserCog size={16} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={16} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={16} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell size={16} />,
  },

]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div>
          <h1 className='text-lg font-bold font-display tracking-tight text-foreground'>
            Settings
          </h1>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-3 lg:my-4' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex-1 w-full overflow-y-auto p-1 pb-16'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
