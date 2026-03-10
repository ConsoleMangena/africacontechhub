import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: 'command_key',
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: 'gallery_thumbnail',
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: 'audio_waveform',
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Admin Workspace',
      items: [
        {
          title: 'Overview',
          url: '/admin',
          icon: 'security',
        },
        {
          title: 'User Management',
          url: '/admin/users',
          icon: 'group',
        },
        {
          title: 'Knowledge Base',
          url: '/admin/knowledge-base',
          icon: 'menu_book',
        },
        {
          title: 'Floor Plans',
          url: '/admin/floor-plans',
          icon: 'image',
        },
      ],
    },
    {
      title: 'Aspirational Builder',
      items: [
        {
          title: 'Overview',
          url: '/builder',
          icon: 'dashboard',
        },
        {
          title: 'Floor Plans',
          url: '/builder/floor-plans',
          icon: 'image',
        },
        {
          title: 'BOQ & Measurements',
          url: '/builder/measurements',
          icon: 'receipt_long',
        },
      ],
    },
    {
      title: 'Contractor Workspace',
      items: [
        {
          title: 'Overview',
          url: '/contractor',
          icon: 'dashboard',
        },
        {
          title: 'Bids',
          url: '/contractor',
          icon: 'description',
        },
        {
          title: 'WIPAA',
          url: '/contractor',
          icon: 'audio_waveform',
        },
        {
          title: 'Projects',
          url: '/contractor',
          icon: 'construction',
        },
      ],
    },
    {
      title: 'Supplier Workspace',
      items: [
        {
          title: 'Overview',
          url: '/supplier',
          icon: 'dashboard',
        },
        {
          title: 'Orders',
          url: '/supplier',
          icon: 'shopping_cart',
        },
        {
          title: 'Products',
          url: '/supplier',
          icon: 'inventory_2',
        },
        {
          title: 'Deliveries',
          url: '/supplier',
          icon: 'local_shipping',
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: 'settings',
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: 'person',
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: 'manage_accounts',
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: 'palette',
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: 'notifications',
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: 'help',
        },
        {
          title: 'Billing',
          url: '/billing',
          icon: 'credit_card',
        },
      ],
    },
  ],
}
