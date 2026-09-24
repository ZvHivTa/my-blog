import type { APIContext } from 'astro'
import { createFeed } from '@/lib/content/feed'
export const GET = (context: APIContext) => createFeed(context, 'journal')
