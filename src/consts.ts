import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'ZHTのWebsite',
  description:
    'Useless things',
  href: '/',
  author: 'ZHT',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/authors',
    label: 'authors',
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
    href: '/',
    label: 'Twitter',
  },
  {
    href: 'ZvHivTa@gmail.com',
    label: 'Email',
  },
  {
    href: '/',
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
