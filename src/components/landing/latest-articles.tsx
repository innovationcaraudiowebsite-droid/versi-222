import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { db } from '@/lib/db'
import { ArticlesList, type ArticleItem } from '@/components/landing/articles-list'

/**
 * LatestArticles section landing — section id="artikel".
 *
 * CAROUSEL MODE (bukan pagination):
 *  - Server fetch 100 artikel PUBLISHED terbaru sekali saja di SSR.
 *  - Pass ke ArticlesList client component yang render semua artikel di DOM.
 *  - Container overflow:hidden, hanya 2 card visible.
 *  - Scroll/swipe → CSS transform translateY → slide ke 2 card berikutnya.
 *  - NO API reload — pure CSS animation, instant.
 *
 * Tambahan (Opsi D):
 *  - Limit naik dari 30 → 100 (lebih banyak artikel untuk browse).
 *  - Link "Lihat Semua Artikel →" di bawah carousel yang link ke /berita.
 */
export const dynamic = 'force-dynamic'

const MAX_ARTICLES = 100 // naik dari 30 → 100 supaya user bisa browse lebih banyak

type LatestArticle = ArticleItem

async function getAllArticles(): Promise<LatestArticle[]> {
  try {
    const items = (await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: MAX_ARTICLES,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        featuredImageAlt: true,
        authorName: true,
        readingTimeMinutes: true,
        viewCount: true,
        publishedAt: true,
        isFeatured: true,
        isBreaking: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
          },
        },
        tags: { select: { id: true, name: true, slug: true } },
      },
    } as never)) as LatestArticle[]

    return items
  } catch (err) {
    console.error('[latest-articles] DB error:', err)
    return []
  }
}

export async function LatestArticles() {
  const articles = await getAllArticles()

  return (
    <section
      id="artikel"
      className="border-t border-border bg-muted/30"
    >
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
        {/* Section header */}
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Artikel Terbaru
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Tips &amp; panduan seputar peredam mobil. Scroll untuk menggeser artikel.
          </p>
        </div>

        {/* Articles carousel — pre-load all, slide animation (no reload) */}
        <ArticlesList articles={articles as ArticleItem[]} />

        {/* Link to all articles page */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-bold text-gold hover:bg-gold/10 hover:border-gold/40 transition-colors"
          >
            Lihat Semua Artikel ({articles.length}+ artikel)
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Re-export untuk konsistensi API
export type { ArticleItem } from '@/components/landing/articles-list'
