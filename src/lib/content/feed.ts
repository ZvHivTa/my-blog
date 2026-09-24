import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { SITE } from '@/consts'
import { getAllPosts } from './studies'
import { getJournalPosts } from './journal'

export async function createFeed(
  context: APIContext,
  section?: 'studies' | 'journal',
) {
  const studies = section === 'journal' ? [] : await getAllPosts()
  const journal = section === 'studies' ? [] : await getJournalPosts()
  const posts = [...studies, ...journal].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )
  return rss({
    title: `${SITE.title}${section === 'studies' ? ' / 学习与研究' : section === 'journal' ? ' / 日常' : ''}`,
    description: SITE.description,
    site: context.site ?? SITE.href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${post.id}/`,
    })),
  })
}
