import type { ProductVariantSection, ProductVariantSubsection } from '@/lib/types'
import { Check } from 'lucide-react'

/**
 * ProductContent — render structured sections dari variant.sections JSON.
 *
 * Section types:
 *  - markdown    → paragraf naratif (wrap dengan <p>)
 *  - list        → bullet list (ul + li)
 *  - subsections → section dengan sub-sections (nested h3 + paragraphs)
 *
 * SPECIAL HANDLING:
 *  - Section dengan title mengandung "KEUNGGULAN" → render dengan ✓ prefix (bukan bullet)
 *  - List item yang diawali "=== HEADER ===" atau format "TEXT:" (header pattern)
 *    → render sebagai sub-group header (bold, tanpa bullet/✓)
 */

interface ProductContentProps {
  sections: ProductVariantSection[] | null
}

/**
 * Render minimal markdown (bold + paragraphs).
 * Cukup untuk konten variant yang sudah terstruktur di sections JSON.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split by **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    // Split by *italic* markers
    const italicParts = part.split(/(\*[^*]+\*)/g)
    return italicParts.map((ip, i) => {
      if (ip.startsWith('*') && ip.endsWith('*') && ip.length > 2) {
        return (
          <em key={`${idx}-${i}`} className="italic">
            {ip.slice(1, -1)}
          </em>
        )
      }
      return <span key={`${idx}-${i}`}>{ip}</span>
    })
  })
}

function renderParagraphs(markdown: string): React.ReactNode {
  return markdown
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((para, idx) => (
      <p key={idx} className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4 last:mb-0">
        {renderInlineMarkdown(para.trim())}
      </p>
    ))
}

function SubsectionBlock({ sub }: { sub: ProductVariantSubsection }) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
        {sub.title}
      </h3>
      {sub.subtitle && (
        <p className="mt-1 text-sm italic text-muted-foreground">{sub.subtitle}</p>
      )}
      <div className="mt-2">
        {renderParagraphs(sub.markdown)}
      </div>
    </div>
  )
}

function SectionBlock({ section }: { section: ProductVariantSection }) {
  return (
    <section className="mt-10 first:mt-0">
      {/* Section title */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b-2 border-brand pb-2 mb-4">
        {section.title}
      </h2>

      {/* Render by type */}
      {section.type === 'markdown' && section.markdown && (
        <div className="prose prose-sm sm:prose-base max-w-none">
          {renderParagraphs(section.markdown)}
        </div>
      )}

      {section.type === 'list' && section.items && section.items.length > 0 && (
        (() => {
          // Detect jika section title mengandung "KEUNGGULAN" → pakai ✓ prefix
          const isKeunggulan = section.title.toUpperCase().includes('KEUNGGULAN')

          return (
            <ul className="space-y-2 mt-3">
              {section.items.map((item, idx) => {
                // Detect sub-group header pattern:
                // - Item yang diakhiri ":" (mis. "BOX:", "KABEL POWER:")
                // - Atau item yang diawali "===" atau semua kapital + ":"
                const isHeader =
                  /^.+:\s*$/.test(item) ||
                  /^[A-Z][A-Z\s&\-]+:\s*$/.test(item.trim())

                if (isHeader) {
                  // Render sebagai sub-group header (bold, no bullet)
                  return (
                    <li
                      key={idx}
                      className="pt-3 first:pt-0 text-xs font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      {item.replace(/:\s*$/, '')}
                    </li>
                  )
                }

                return (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm sm:text-base text-foreground/90"
                  >
                    {isKeunggulan ? (
                      <Check className="mt-0.5 shrink-0 size-4 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <span className="mt-2 shrink-0 size-1.5 rounded-full bg-brand" aria-hidden="true" />
                    )}
                    <span>{renderInlineMarkdown(item)}</span>
                  </li>
                )
              })}
            </ul>
          )
        })()
      )}

      {section.type === 'subsections' && section.subsections && (
        <div className="space-y-6 mt-3">
          {section.subsections.map((sub, idx) => (
            <SubsectionBlock key={idx} sub={sub} />
          ))}
        </div>
      )}
    </section>
  )
}

export function ProductContent({ sections }: ProductContentProps) {
  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <article className="space-y-0">
      {sections.map((section, idx) => (
        <SectionBlock key={idx} section={section} />
      ))}
    </article>
  )
}
