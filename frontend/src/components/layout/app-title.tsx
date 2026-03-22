import { Link } from '@tanstack/react-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-2 py-2 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <Link
            to='/'
            onClick={() => setOpenMobile(false)}
            className='flex items-center gap-2'
          >
            <img
              src='/images/logo.png'
              alt='Dzenhare SQB Logo'
              className='h-12 w-12 object-contain shrink-0'
            />
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-bold text-gray-900'>Dzenhare SQB</span>
              <span className='truncate text-xs text-gray-600'>Construction Platform</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
