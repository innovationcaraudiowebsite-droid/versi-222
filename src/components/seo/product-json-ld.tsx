import { JsonLd } from '@/components/seo/json-ld'
import type { PortalVariant } from '@/lib/portal'

/**
 * ProductJsonLd — schema.org Product + BreadcrumbList untuk SEO.
 *
 * Outputs 2 JSON-LD schemas:
 *  1. Product schema (name, description, image, brand, offers)
 *     → Rich snippet harga di Google Search
 *  2. BreadcrumbList schema (Home > Produk > Parent > Variant)
 *     → Breadcrumb di SERP
 *
 * Props:
 *  - variant: PortalVariant (with parentName, parentSlug, category, waNumber)
 *  - siteUrl: base URL (e.g. https://peredammobiljakarta.com)
 */

interface ProductJsonLdProps {
  variant: PortalVariant
  siteUrl: string
}

export function ProductJsonLd({ variant, siteUrl }: ProductJsonLdProps) {
  const url = `${siteUrl}/produk/${variant.slug}`
  const displayName = `${variant.parentName || ''} ${variant.name}`.trim()
  const description =
    variant.cardDescription || variant.introMarkdown?.slice(0, 160) || displayName

  // Gallery images (up to 4 for schema)
  const images =
    variant.galleryImages.length > 0
      ? variant.galleryImages.slice(0, 4)
      : variant.imageUrl
        ? [variant.imageUrl]
        : []

  // Build Product schema
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: displayName,
    description: description.slice(0, 300),
    url,
    category: variant.category || 'Paket Layanan',
    brand: {
      '@type': 'Brand',
      name: 'Innovation Car Audio Jakarta',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Innovation Car Audio Jakarta',
    },
  }

  // Add images array if available
  if (images.length > 0) {
    productSchema.image = images
  }

  // Add offers (price)
  if (variant.priceValue) {
    productSchema.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'IDR',
      price: variant.priceValue,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Innovation Car Audio Jakarta',
      },
    }
  } else {
    // No price, use aggregateRating placeholder (or skip offers)
    productSchema.offers = {
      '@type': 'Offer',
      url,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Innovation Car Audio Jakarta',
      },
    }
  }

  // Build BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produk',
        item: `${siteUrl}/#paket`,
      },
      ...(variant.parentName
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: variant.parentName,
              item: `${siteUrl}/#paket`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: variant.name,
              item: url,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: variant.name,
              item: url,
            },
          ]),
    ],
  }

  return <JsonLd schema={[productSchema, breadcrumbSchema]} />
}
