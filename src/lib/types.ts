/**
 * Type definitions for database tables (replaces @prisma/client types).
 *
 * Field types use `string | Date` because Supabase returns ISO strings for
 * timestamptz columns, but our code may pass Date objects on insert/update.
 */

export type SiteSetting = {
  id: string
  siteName: string
  tagline: string
  logoUrl: string | null
  faviconUrl: string | null
  contactEmail: string
  contactAddress: string
  contactPhone: string | null
  socialFacebook: string | null
  socialInstagram: string | null
  socialYoutube: string | null
  authorName: string
  newsletterHeadline: string
  newsletterSubtext: string
  footerCopyright: string
  primaryColor: string
  gaMeasurementId: string | null
  gtmId: string | null
  verificationGoogle: string | null
  verificationBing: string | null
  updatedAt: string | Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  order: number
  createdAt: string | Date
  updatedAt: string | Date
}

export type Tag = {
  id: string
  name: string
  slug: string
  createdAt: string | Date
}

export type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  contentMarkdown: string | null
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  categoryId: string
  authorName: string
  authorId: string | null
  status: string // DRAFT | PUBLISHED | ARCHIVED
  isFeatured: boolean
  isBreaking: boolean
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  ogImageUrl: string | null
  targetKeyword: string | null
  readingTimeMinutes: number
  wordCount: number
  viewCount: number
  shareCount: number
  publishedAt: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

export type ArticleVersion = {
  id: string
  articleId: string
  versionNumber: number
  title: string
  content: string
  excerpt: string | null
  editedBy: string
  editedByUserId: string | null
  editNote: string | null
  createdAt: string | Date
}

export type Comment = {
  id: string
  articleId: string
  authorName: string
  authorEmail: string
  content: string
  status: string // PENDING | APPROVED | REJECTED | SPAM
  parentId: string | null
  ipAddress: string | null
  createdAt: string | Date
}

export type Faq = {
  id: string
  question: string
  answer: string
  order: number
  isPublished: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export type Subscriber = {
  id: string
  email: string
  status: string // ACTIVE | UNSUBSCRIBED
  source: string | null
  subscribedAt: string | Date
  unsubscribedAt: string | Date | null
}

export type Profile = {
  id: string
  email: string
  fullName: string | null
  role: string // admin | editor | writer
  avatarUrl: string | null
  isActive: boolean
  lastLoginAt: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

// Composite types with relations (for queries that include relations)

export type ArticleWithCategory = Article & {
  category: Category
}

export type ArticleWithRelations = Article & {
  category: Category
  tags: Tag[]
  author?: Profile | null
}

export type ArticleVersionWithUser = ArticleVersion & {
  editedByUser?: Profile | null
}

export type ProfileWithCounts = Profile & {
  _count?: { articles: number }
}

/**
 * Product — Parent product (induk) untuk Section 4 (Paket Layanan).
 * Satu Product punya banyak ProductVariant (Basic, Normal, Best Buy, Recommended).
 * Di-manage via admin dashboard /admin/products.
 */
export type Product = {
  id: string
  name: string                    // "Simple Upgrade"
  slug: string                    // "simple-upgrade" (unique)
  category: string                // "Paket Upgrade Audio"
  shortDescription: string | null // 1-line summary untuk card fallback
  imageUrl: string | null         // gambar utama parent (fallback kalau variant tidak ada)
  imageAlt: string | null
  waNumber: string                // "6282211222399"
  sortOrder: number               // urutan tampil (ASC)
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

/**
 * Variant Tier enum — 4 tingkat varian.
 * Urutan prioritas: basic < normal < best_buy < recommended
 */
export type VariantTier = 'basic' | 'normal' | 'best_buy' | 'recommended'

/**
 * ProductVariant — Anak varian dari Product.
 * Contoh: Product "Simple Upgrade" punya 3 varian (Basic, Normal, Best Buy).
 *
 * Setiap varian punya:
 *  - Harga sendiri
 *  - Ribbon/badge sendiri (warna + label)
 *  - Konten card sendiri (judul, deskripsi, gambar)
 *  - Konten detail page sendiri (artikel panjang + structured sections)
 *  - Gallery gambar (4+ images untuk mini carousel di card)
 */
export type ProductVariant = {
  id: string
  productId: string               // FK → Product.id
  product?: Product               // relation (joined by adapter)

  // === Identitas Varian ===
  name: string                    // "Best Buy" | "Recommended" | "Basic" | "Normal"
  slug: string                    // "simple-upgrade-best-buy" (unique)
  tier: VariantTier               // "basic" | "normal" | "best_buy" | "recommended"
  sortOrder: number               // 1=basic, 2=normal, 3=best_buy, 4=recommended

  // === Harga ===
  price: string                   // "Rp 6.500.000" atau "Hubungi Admin"
  priceValue: number | null       // 6500000 (untuk sorting/filter)
  priceNote: string | null        // "Harga non-diskon mengikuti brosur"

  // === Ribbon / Badge ===
  ribbonLabel: string | null      // "BEST BUY" | "RECOMMENDED" | "POPULAR" | "BASIC"
  ribbonColor: string | null      // "amber" | "emerald" | "blue" | "slate"

  // === Konten Card (untuk carousel landing) ===
  cardTitle: string | null        // "2 WAY 6.5\" + DSP + SUBWOOFER 8\""
  cardDescription: string | null   // 2-line summary untuk card
  imageUrl: string | null         // gambar utama varian
  imageAlt: string | null
  galleryImages: string[]         // 4+ images untuk mini carousel di card

  // === Konten Detail Page (artikel panjang) ===
  tagline: string | null          // "Innovation Car Audio Jakarta"
  introMarkdown: string | null    // paragraf intro
  sections: ProductVariantSection[] | null  // structured sections (A/B/C + optional)
  closingTagline: string | null    // "RECOMMENDED — PHD MF 6.1 KIT..."
  closingComponents: string[] | null // ["PHD MF 6.1 KIT", "Rainbow DSP EL-PA4.6", ...]
  disclaimer: string | null        // "Harga non-diskon mengikuti brosur"

  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

/**
 * Section di artikel varian — bisa naratif (markdown), list, atau subsections.
 */
export type ProductVariantSection = {
  title: string                                  // "A. PRODUK UTAMA"
  type: 'markdown' | 'list' | 'subsections'
  markdown?: string                              // untuk type="markdown"
  items?: string[]                               // untuk type="list"
  subsections?: ProductVariantSubsection[]       // untuk type="subsections"
}

export type ProductVariantSubsection = {
  title: string              // "1. PHD MF 6.1 KIT"
  subtitle?: string | null   // "2 Way 6.5\" Pasif"
  markdown: string           // konten naratif
}
