import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ChevronRight,
  MessageCircle,
  Share2,
  CheckCircle2,
  Package,
  Layers,
  Tag,
} from 'lucide-react'
import { db } from '@/lib/db'
import {
  getVariantBySlug,
  getSiblingVariants,
  getRelatedVariants,
  getAllVariantSlugs,
  type PortalVariant,
  type PortalVariantCard,
} from '@/lib/portal'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'
import { ProductGallery } from '@/components/portal/product-gallery'
import { ProductContent } from '@/components/portal/product-content'
import { ProductJsonLd } from '@/components/seo/product-json-ld'

/**
 * Detail page ProductVariant — /produk/[slug]
 *
 * SEO Strategy:
 *  - generateStaticParams: pre-render semua variant slug
 *  - generateMetadata: title, description, keywords, OG, Twitter, canonical
 *  - JSON-LD Product schema: rich snippet harga di Google
 *  - JSON-LD BreadcrumbList: breadcrumb di SERP
 *  - robots: index, follow (boleh di-index)
 *
 * Page sections:
 *  1. Breadcrumb
 *  2. Header (Ribbon, H1, Tagline)
 *  3. Gallery (main image + thumbnails)
 *  4. Price + CTA buttons (WhatsApp + Share)
 *  5. Article content (sections JSON)
 *  6. Closing section (tagline + components + disclaimer)
 *  7. Sibling variants (Basic/Normal/Best Buy/Recommended dari produk yg sama)
 *  8. Related products (4 varian dari produk lain)
 */

// Always render at request time — env vars (Supabase) are runtime-injected.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://peredammobiljakarta.com')

const WA_NUMBER = '6282211222399'

// ============================================================
// Ribbon styles (mirror dari products-list.tsx)
// ============================================================
const RIBBON_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-700',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
}

function getRibbonStyle(color: string | null) {
  if (!color) return RIBBON_STYLES.slate
  return RIBBON_STYLES[color] || RIBBON_STYLES.slate
}

// ============================================================
// generateStaticParams — pre-render semua variant slug
// ============================================================
export async function generateStaticParams() {
  const slugs = await getAllVariantSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ============================================================
// generateMetadata — SEO meta tags
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const variant = await getVariantBySlug(slug)

  if (!variant) {
    return {
      title: 'Produk tidak ditemukan',
      robots: { index: false, follow: false },
    }
  }

  const parentName = variant.parentName || ''
  const variantName = variant.name
  const category = variant.category || 'Paket Layanan'
  const displayName = parentName ? `${parentName} — ${variantName}` : variantName

  // SEO title: prioritaskan cardTitle kalau ada (lebih keyword-rich)
  const title = `${variant.cardTitle || displayName} — ${category} | Innovation Car Audio Jakarta`
  const description =
    variant.cardDescription ||
    variant.introMarkdown?.slice(0, 160) ||
    `Paket ${displayName} dari Innovation Car Audio Jakarta. ${variant.price}`

  // Keywords: closing components + tier + brand + parent + category
  const keywords = [
    ...(variant.closingComponents || []),
    variant.tier.replace('_', ' '),
    variantName,
    parentName,
    category,
    'Innovation Car Audio Jakarta',
    'peredam mobil jakarta',
    'upgrade audio mobil',
  ].filter(Boolean)

  const imageUrl = variant.imageUrl || variant.galleryImages[0] || undefined
  const url = `/produk/${variant.slug}`
  const fullUrl = `${SITE_URL}${url}`

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Innovation Car Audio Jakarta' }],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url: fullUrl,
      siteName: 'Peredam Mobil Jakarta',
      locale: 'id_ID',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: variant.imageAlt || displayName,
            },
          ]
        : [{ url: '/og-default.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : ['/og-default.png'],
    },
    robots: { index: true, follow: true },
  }
}

// ============================================================
// Helper components
// ============================================================
function Breadcrumb({ variant }: { variant: PortalVariant }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link href="/" className="hover:text-brand dark:hover:text-brand-light transition-colors">
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3" />
        </li>
        <li>
          <Link href="/#paket" className="hover:text-brand dark:hover:text-brand-light transition-colors">
            Produk
          </Link>
        </li>
        {variant.parentName && (
          <>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li>
              <span className="text-foreground/70">{variant.parentName}</span>
            </li>
          </>
        )}
        <li aria-hidden="true">
          <ChevronRight className="size-3" />
        </li>
        <li>
          <span className="text-foreground font-medium">{variant.name}</span>
        </li>
      </ol>
    </nav>
  )
}

function VariantCard({ v, isCurrent }: { v: PortalVariantCard; isCurrent?: boolean }) {
  const ribbon = getRibbonStyle(v.ribbonColor)
  const displayTitle = v.cardTitle || v.name
  const href = `/produk/${v.slug}`
  const displayImage = v.imageUrl

  return (
    <Link
      href={href}
      className={`group block rounded-xl border overflow-hidden transition-all hover:shadow-md ${
        isCurrent
          ? 'border-brand ring-2 ring-brand/30 bg-brand/5'
          : 'border-border bg-card hover:border-brand/40'
      }`}
      aria-label={`${v.parentName || ''} ${displayTitle}`}
    >
      {/* Gambar */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={v.imageAlt || displayTitle}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand/30 to-brand-dark/40">
            <Package className="size-8 text-white/60" />
          </div>
        )}
        {v.ribbonLabel && (
          <div className={`absolute top-2 right-2 z-10 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm ${ribbon.bg} ${ribbon.text} ${ribbon.border}`}>
            {v.ribbonLabel}
          </div>
        )}
      </div>
      {/* Konten */}
      <div className="p-3">
        {v.parentName && (
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {v.parentName}
          </div>
        )}
        <h4 className="mt-0.5 text-sm font-bold leading-snug line-clamp-1 group-hover:text-brand dark:group-hover:text-brand-light transition-colors">
          {displayTitle}
        </h4>
        <div className="mt-1 text-xs font-semibold text-brand dark:text-brand-light truncate">
          {v.price}
        </div>
      </div>
    </Link>
  )
}

// ============================================================
// Main Page Component
// ============================================================
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const variant = await getVariantBySlug(slug)

  if (!variant) {
    notFound()
  }

  // Fetch sibling variants (from same parent) & related variants (other products)
  const [siblings, related] = await Promise.all([
    getSiblingVariants(variant.productId, variant.id),
    getRelatedVariants(variant.productId, 4),
  ])

  const ribbon = getRibbonStyle(variant.ribbonColor)
  const displayName = variant.parentName
    ? `${variant.parentName} — ${variant.name}`
    : variant.name
  const galleryImages =
    variant.galleryImages.length > 0
      ? variant.galleryImages
      : variant.imageUrl
        ? [variant.imageUrl]
        : []

  // WhatsApp CTA link dengan pesan prefill
  const waMessage = `Halo Innovation Car Audio Jakarta, saya tertarik dengan paket *${displayName}* (${variant.price}). Mohon info lebih lanjut.`
  const waLink = `https://wa.me/${variant.waNumber || WA_NUMBER}?text=${encodeURIComponent(waMessage)}`

  // Share links
  const pageUrl = `${SITE_URL}/produk/${variant.slug}`
  const shareText = `${displayName} — ${variant.price}`
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`,
    copy: pageUrl,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
          {/* Breadcrumb */}
          <Breadcrumb variant={variant} />

          {/* === HEADER SECTION === */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* LEFT: Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                images={galleryImages}
                alt={variant.imageAlt || displayName}
              />
            </div>

            {/* RIGHT: Header info */}
            <div>
              {/* Ribbon */}
              {variant.ribbonLabel && (
                <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${ribbon.bg} ${ribbon.text} ${ribbon.border}`}>
                  {variant.ribbonLabel}
                </div>
              )}

              {/* H1 */}
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                {displayName}
              </h1>

              {/* Tagline */}
              {variant.tagline && (
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  {variant.tagline}
                </p>
              )}

              {/* Card title (konfigurasi) — secondary heading */}
              {variant.cardTitle && variant.cardTitle !== displayName && (
                <p className="mt-3 text-base sm:text-lg font-semibold text-foreground/80">
                  {variant.cardTitle}
                </p>
              )}

              {/* Price block */}
              <div className="mt-6 p-4 sm:p-5 rounded-lg border border-border bg-muted/30">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Harga
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-brand dark:text-brand-light">
                    {variant.price}
                  </span>
                </div>
                {variant.priceNote && (
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    *{variant.priceNote}
                  </p>
                )}

                {/* Meta info */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Kategori</div>
                      <div className="font-medium text-foreground">
                        {variant.category || 'Paket Layanan'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Tier</div>
                      <div className="font-medium text-foreground capitalize">
                        {variant.tier.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 text-sm transition-colors"
                >
                  <MessageCircle className="size-4" />
                  Tanya via WhatsApp
                </a>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card hover:bg-muted text-foreground font-semibold px-5 py-3 text-sm transition-colors"
                >
                  <Share2 className="size-4" />
                  Bagikan
                </a>
              </div>

              {/* Share buttons row */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Bagikan ke:</span>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Facebook
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Twitter
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* === ARTICLE CONTENT === */}
          {(variant.introMarkdown || (variant.sections && variant.sections.length > 0)) && (
            <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
              {/* Intro */}
              {variant.introMarkdown && (
                <div className="text-base sm:text-lg text-foreground/90 leading-relaxed space-y-4 mb-10">
                  {variant.introMarkdown
                    .split(/\n\n+/)
                    .filter((p) => p.trim().length > 0)
                    .map((para, idx) => (
                      <p key={idx}>{para.trim()}</p>
                    ))}
                </div>
              )}

              {/* Sections (structured) */}
              <ProductContent sections={variant.sections} />
            </div>
          )}

          {/* === CLOSING SECTION === */}
          {variant.closingTagline && (
            <div className="mt-12 sm:mt-16 max-w-3xl mx-auto p-6 sm:p-8 rounded-xl border-2 border-brand/30 bg-brand/5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {variant.closingTagline}
              </h2>
              {variant.closingComponents && variant.closingComponents.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    Komponen Utama
                  </div>
                  {variant.closingComponents.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm sm:text-base text-foreground/90">
                      <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-emerald-500" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
              {variant.disclaimer && (
                <p className="mt-5 text-xs text-muted-foreground italic">
                  *{variant.disclaimer}
                </p>
              )}
            </div>
          )}

          {/* === SIBLING VARIANTS === */}
          {siblings.length > 0 && (
            <section className="mt-12 sm:mt-16">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-4">
                Varian Lain dari {variant.parentName || 'Produk Ini'}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Lihat varian lain dengan tingkatan berbeda dari produk yang sama.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Current variant (highlighted) */}
                <VariantCard
                  v={{
                    id: variant.id,
                    productId: variant.productId,
                    name: variant.name,
                    slug: variant.slug,
                    tier: variant.tier,
                    sortOrder: variant.sortOrder,
                    price: variant.price,
                    priceValue: variant.priceValue,
                    ribbonLabel: variant.ribbonLabel,
                    ribbonColor: variant.ribbonColor,
                    cardTitle: variant.cardTitle,
                    cardDescription: variant.cardDescription,
                    imageUrl: variant.imageUrl,
                    imageAlt: variant.imageAlt,
                    parentName: variant.parentName,
                  }}
                  isCurrent
                />
                {siblings.map((s) => (
                  <VariantCard key={s.id} v={s} />
                ))}
              </div>
            </section>
          )}

          {/* === RELATED PRODUCTS === */}
          {related.length > 0 && (
            <section className="mt-12 sm:mt-16">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-4">
                Produk Terkait
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Paket lain yang mungkin sesuai dengan kebutuhan Anda.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {related.map((r) => (
                  <VariantCard key={r.id} v={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <LandingFooter />

      {/* JSON-LD SEO schemas */}
      <ProductJsonLd variant={variant} siteUrl={SITE_URL} />
    </div>
  )
}
