import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'ZHT / Fieldwork',
  description: 'Research, software, data products and field notes by ZHT.',
  href: '/',
  author: 'ZHT',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/#selected-work',
    label: 'work',
  },
  {
    href: '/blog',
    label: 'writing',
  },
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/ZvHivTa',
    label: 'GitHub',
  },
  {
    href: 'mailto:ZvHivTa@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
