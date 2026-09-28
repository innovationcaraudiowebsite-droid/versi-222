'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductVariantSubsection {
  title: string
  subtitle?: string | null
  markdown: string
}

interface ProductVariantSection {
  title: string
  type: 'markdown' | 'list' | 'subsections'
  markdown?: string
  items?: string[]
  subsections?: ProductVariantSubsection[]
}

interface SectionBuilderProps {
  sections: ProductVariantSection[]
  onChange: (sections: ProductVariantSection[]) => void
}

export function SectionBuilder({ sections, onChange }: SectionBuilderProps) {
  function addSection() {
    onChange([
      ...sections,
      { title: 'Section Baru', type: 'list', items: [] },
    ])
  }

  function updateSection(idx: number, updates: Partial<ProductVariantSection>) {
    const next = [...sections]
    next[idx] = { ...next[idx], ...updates }
    onChange(next)
  }

  function removeSection(idx: number) {
    const next = [...sections]
    next.splice(idx, 1)
    onChange(next)
  }

  function moveSection(idx: number, dir: 'up' | 'down') {
    const target = dir === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Label className="text-sm font-semibold">Sections (Article Konten)</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tambah / reorder / hapus sections. Tiap section bisa markdown, list, atau subsections.
          </p>
        </div>
        <Button type="button" size="sm" onClick={addSection}>
          <Plus className="size-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Belum ada section. Klik &quot;Add Section&quot; untuk mulai.
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <SectionEditor
              key={idx}
              section={section}
              index={idx}
              total={sections.length}
              onChange={(updates) => updateSection(idx, updates)}
              onRemove={() => removeSection(idx)}
              onMove={(dir) => moveSection(idx, dir)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SectionEditorProps {
  section: ProductVariantSection
  index: number
  total: number
  onChange: (updates: Partial<ProductVariantSection>) => void
  onRemove: () => void
  onMove: (dir: 'up' | 'down') => void
}

function SectionEditor({ section, index, total, onChange, onRemove, onMove }: SectionEditorProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      {/* Section header */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            aria-label="Geser section ke atas"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <GripVertical className="size-3.5 text-muted-foreground/40" aria-hidden />
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            aria-label="Geser section ke bawah"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr,180px] gap-2">
          <Input
            placeholder="Judul section, contoh: 'A. PRODUK UTAMA'"
            value={section.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="bg-background"
          />
          <Select
            value={section.type}
            onValueChange={(val) => {
              const newType = val as 'markdown' | 'list' | 'subsections'
              const updates: Partial<ProductVariantSection> = { type: newType }
              // Reset content field sesuai type baru
              if (newType === 'markdown') {
                updates.markdown = section.markdown || ''
                updates.items = undefined
                updates.subsections = undefined
              } else if (newType === 'list') {
                updates.items = section.items || []
                updates.markdown = undefined
                updates.subsections = undefined
              } else if (newType === 'subsections') {
                updates.subsections = section.subsections || []
                updates.markdown = undefined
                updates.items = undefined
              }
              onChange(updates)
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="list">List (bullet)</SelectItem>
              <SelectItem value="subsections">Subsections</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          aria-label="Hapus section"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Section content based on type */}
      {section.type === 'markdown' && (
        <Textarea
          placeholder="Tulis paragraf markdown di sini. Pakai **bold** atau *italic* untuk emphasis."
          value={section.markdown || ''}
          onChange={(e) => onChange({ markdown: e.target.value })}
          rows={4}
          className="bg-background font-mono text-xs"
        />
      )}

      {section.type === 'list' && (
        <ListEditor
          items={section.items || []}
          onChange={(items) => onChange({ items })}
        />
      )}

      {section.type === 'subsections' && (
        <SubsectionsEditor
          subsections={section.subsections || []}
          onChange={(subsections) => onChange({ subsections })}
        />
      )}
    </div>
  )
}

function ListEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  function addItem() {
    onChange([...items, ''])
  }

  function updateItem(idx: number, val: string) {
    const next = [...items]
    next[idx] = val
    onChange(next)
  }

  function removeItem(idx: number) {
    const next = [...items]
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Belum ada item. Klik &quot;Add Item&quot; untuk mulai.</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs w-4 shrink-0">•</span>
            <Input
              placeholder={`Item ${idx + 1}, contoh: &quot;Box kayu simple&quot;`}
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              className="bg-background text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 shrink-0"
              onClick={() => removeItem(idx)}
              aria-label="Hapus item"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-3.5" />
        Add Item
      </Button>
    </div>
  )
}

function SubsectionsEditor({
  subsections,
  onChange,
}: {
  subsections: ProductVariantSubsection[]
  onChange: (subsections: ProductVariantSubsection[]) => void
}) {
  function addSubsection() {
    onChange([...subsections, { title: '', subtitle: '', markdown: '' }])
  }

  function updateSubsection(idx: number, updates: Partial<ProductVariantSubsection>) {
    const next = [...subsections]
    next[idx] = { ...next[idx], ...updates }
    onChange(next)
  }

  function removeSubsection(idx: number) {
    const next = [...subsections]
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {subsections.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Belum ada subsection. Klik &quot;Add Subsection&quot; untuk mulai.</p>
      ) : (
        subsections.map((sub, idx) => (
          <div key={idx} className="rounded-md border border-border bg-background p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{idx + 1}.</span>
              <Input
                placeholder="Judul subsection, contoh: &quot;1. PHD MF 6.1 KIT&quot;"
                value={sub.title}
                onChange={(e) => updateSubsection(idx, { title: e.target.value })}
                className="text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removeSubsection(idx)}
                aria-label="Hapus subsection"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Input
              placeholder="Subtitle (opsional), contoh: &quot;2 Way 6.5&quot; Pasif&quot;"
              value={sub.subtitle || ''}
              onChange={(e) => updateSubsection(idx, { subtitle: e.target.value })}
              className="text-xs italic"
            />
            <Textarea
              placeholder="Markdown content untuk subsection ini. Pakai **bold** untuk emphasis."
              value={sub.markdown}
              onChange={(e) => updateSubsection(idx, { markdown: e.target.value })}
              rows={3}
              className="text-xs font-mono"
            />
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={addSubsection}>
        <Plus className="size-3.5" />
        Add Subsection
      </Button>
    </div>
  )
}
