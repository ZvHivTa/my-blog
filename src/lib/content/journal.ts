import { getCollection, type CollectionEntry } from 'astro:content'

export async function getJournalPosts() {
  return (await getJournalEntries())
    .filter((post) => !isJournalChapter(post.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getJournalEntries() {
  return (await getCollection('journal')).filter((post) => !post.data.draft)
}

export function isJournalChapter(id: string) {
  return id.includes('/')
}

export function getJournalParentId(id: string) {
  return id.split('/')[0]
}

export async function getJournalEntry(id: string) {
  return (await getJournalEntries()).find((post) => post.id === id) ?? null
}

export async function getJournalSeries(parentId: string) {
  return (await getJournalEntries())
    .filter(
      (post) =>
        isJournalChapter(post.id) && getJournalParentId(post.id) === parentId,
    )
    .sort((a, b) => {
      const order = (a.data.order ?? 0) - (b.data.order ?? 0)
      return order || a.data.date.valueOf() - b.data.date.valueOf()
    })
}

export async function getJournalSeriesCount(parentId: string) {
  return (await getJournalSeries(parentId)).length
}

export async function getJournalNavigation(currentId: string): Promise<{
  previous: CollectionEntry<'journal'> | null
  next: CollectionEntry<'journal'> | null
  parent: CollectionEntry<'journal'> | null
}> {
  if (isJournalChapter(currentId)) {
    const parentId = getJournalParentId(currentId)
    const [parent, chapters] = await Promise.all([
      getJournalEntry(parentId),
      getJournalSeries(parentId),
    ])
    const index = chapters.findIndex((post) => post.id === currentId)
    return {
      previous: index > 0 ? chapters[index - 1] : null,
      next: index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null,
      parent,
    }
  }

  const posts = await getJournalPosts()
  const index = posts.findIndex((post) => post.id === currentId)
  return {
    previous: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
    parent: null,
  }
}
