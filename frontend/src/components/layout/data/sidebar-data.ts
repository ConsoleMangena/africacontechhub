import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '',
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
          icon: 'admin_panel_settings',
        },
        {
          title: 'Projects',
          url: '/admin/projects',
          icon: 'folder',
        },
        {
          title: 'AI Command Center',
          url: '/admin/ai-command-center',
          icon: 'auto_awesome',
        },
        {
          title: 'User Management',
          url: '/admin/users',
          icon: 'people',
        },
        {
          title: 'Team Management',
          url: '/admin/team',
          icon: 'groups',
        },
        {
          title: 'Procurement',
          url: '/admin/procurement',
          icon: 'shopping_cart',
        },
        {
          title: 'Knowledge Base',
          url: '/admin/knowledge-base',
          icon: 'library_books',
        },
        {
          title: 'Floor Plans',
          url: '/admin/floor-plans',
          icon: 'architecture',
        },
        {
          title: 'Activity Log',
          url: '/admin/activity-log',
          icon: 'manage_history',
        },
        {
          title: 'Platform Billing',
          url: '/admin/billing',
          icon: 'credit_card',
        },
        {
          title: 'System Settings',
          url: '/admin/settings',
          icon: 'settings',
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
          title: 'Design Drafting',
          url: '/builder/design-drafting',
          icon: 'draw',
        },
        {
          title: 'Construction Budget',
          url: '/builder/measurements',
          icon: 'request_quote',
        },
        {
          title: 'Procurement',
          url: '/builder/procurement',
          icon: 'shopping_cart',
        },
        {
          title: 'Building the Project',
          url: '/builder/building',
          icon: 'construction',
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
          icon: 'gavel',
        },
        {
          title: 'WIPAA',
          url: '/contractor',
          icon: 'analytics',
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
          icon: 'receipt',
        },
        {
          title: 'Products',
          url: '/supplier',
          icon: 'category',
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
          title: 'SQB Building Team',
          url: '/sqb-team',
          icon: 'engineering',
        },
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
