'use client'

import { useState } from 'react'
import type { ProductVariantSection, ProductVariantSubsection } from '@/lib/types'
import { Check, ChevronDown } from 'lucide-react'

/**
 * ProductContent — render structured sections dari variant.sections JSON.
 *
 * ACCORDION MODE:
 *  - Setiap section bisa di-expand/collapse (klik judul untuk toggle)
 *  - Section pertama open by default
 *  - Section lain collapsed by default (halaman lebih ringkas)
 *  - Smooth animation via CSS transition + max-height
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
  /** Index section yang default open (default: 0 = section pertama). -1 untuk semua collapsed. */
  defaultOpenIndex?: number
}

// ============================================================
// Helper: Render minimal inline markdown (bold + italic)
// ============================================================
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
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
      <p key={idx} className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4 last:mb-0 whitespace-pre-line">
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

// ============================================================
// Section Content Renderer (tergantung type)
// ============================================================
function SectionContent({ section }: { section: ProductVariantSection }) {
  if (section.type === 'markdown' && section.markdown) {
    return (
      <div className="prose prose-sm sm:prose-base max-w-none">
        {renderParagraphs(section.markdown)}
      </div>
    )
  }

  if (section.type === 'list' && section.items && section.items.length > 0) {
    const isKeunggulan = section.title.toUpperCase().includes('KEUNGGULAN')

    return (
      <ul className="space-y-2 mt-3">
        {section.items.map((item, idx) => {
          // Detect sub-group header pattern
          const isHeader =
            /^.+:\s*$/.test(item) ||
            /^[A-Z][A-Z\s&\-]+:\s*$/.test(item.trim())

          if (isHeader) {
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
  }

  if (section.type === 'subsections' && section.subsections) {
    return (
      <div className="space-y-6 mt-3">
        {section.subsections.map((sub, idx) => (
          <SubsectionBlock key={idx} sub={sub} />
        ))}
      </div>
    )
  }

  return null
}

// ============================================================
// Accordion Section Block (klik untuk expand/collapse)
// ============================================================
interface AccordionSectionProps {
  section: ProductVariantSection
  index: number
  isOpen: boolean
  onToggle: (idx: number) => void
}

function AccordionSection({ section, index, isOpen, onToggle }: AccordionSectionProps) {
  return (
    <section className="border-b border-border last:border-b-0">
      {/* Header button (clickable) */}
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`section-content-${index}`}
        className="w-full flex items-center justify-between gap-3 py-4 sm:py-5 text-left group"
      >
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-brand dark:group-hover:text-brand-light transition-colors">
          {section.title}
        </h2>
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Content (animated max-height) */}
      <div
        id={`section-content-${index}`}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[10000px] opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="border-l-2 border-brand/30 pl-4 sm:pl-6">
          <SectionContent section={section} />
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Main ProductContent Component
// ============================================================
export function ProductContent({
  sections,
  defaultOpenIndex = 0,
}: ProductContentProps) {
  // Track open state per index — Set of indexes that are open
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(
    () => new Set([defaultOpenIndex].filter((i) => i >= 0))
  )

  function toggleSection(idx: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  function expandAll() {
    setOpenIndexes(new Set(sections?.map((_, idx) => idx) ?? []))
  }

  function collapseAll() {
    setOpenIndexes(new Set())
  }

  if (!sections || sections.length === 0) {
    return null
  }

  const allOpen = openIndexes.size === sections.length
  const noneOpen = openIndexes.size === 0

  return (
    <article className="space-y-0">
      {/* Toolbar: Expand/Collapse all */}
      {sections.length > 1 && (
        <div className="flex items-center justify-end gap-3 pb-3 text-xs">
          <button
            type="button"
            onClick={expandAll}
            disabled={allOpen}
            className="text-muted-foreground hover:text-foreground hover:underline disabled:opacity-30 disabled:no-underline"
          >
            Buka Semua
          </button>
          <span aria-hidden="true" className="text-muted-foreground/50">·</span>
          <button
            type="button"
            onClick={collapseAll}
            disabled={noneOpen}
            className="text-muted-foreground hover:text-foreground hover:underline disabled:opacity-30 disabled:no-underline"
          >
            Tutup Semua
          </button>
        </div>
      )}

      {/* Accordion sections */}
      <div className="rounded-xl border border-border bg-card px-4 sm:px-6">
        {sections.map((section, idx) => (
          <AccordionSection
            key={idx}
            section={section}
            index={idx}
            isOpen={openIndexes.has(idx)}
            onToggle={toggleSection}
          />
        ))}
      </div>

      {/* Footer hint */}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Klik judul section untuk buka / tutup • {openIndexes.size} dari {sections.length} section terbuka
      </p>
    </article>
  )
}
