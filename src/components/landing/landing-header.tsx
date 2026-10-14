'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, ChevronRight, Package } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/portal/theme-toggle'
import { cn } from '@/lib/utils'
import { ICALogo } from '@/components/landing/ica-logo'

/**
 * Landing header — sticky top, backdrop blur, nav ke section landing + WA button.
 * Mobile: hamburger menu (Sheet).
 *
 * Fitur:
 *  - Navbar dengan submenu dropdown (Paket Audio → 4 kategori)
 *  - Desktop: hover dropdown dengan kategori paket
 *  - Mobile: expandable accordion di sheet menu
 *  - Link "Paket Audio" utama scroll ke #paket-audio (section summary)
 *  - Submenu link ke /paket/[slug] (halaman kategori)
 */

type NavLink = { anchor: string; label: string; submenu?: SubMenuItem[] }
type SubMenuItem = { slug: string; label: string; shortLabel: string; description: string; color: string }

// Submenu untuk "Paket Audio" — 4 kategori paket
const PAKET_SUBMENU: SubMenuItem[] = [
  {
    slug: 'simple-upgrade',
    label: 'Simple Upgrade',
    shortLabel: 'Simple',
    description: 'Rp 3.3jt - 9.3jt · 4 varian',
    color: 'text-slate-500',
  },
  {
    slug: 'entry',
    label: 'Entry Level',
    shortLabel: 'Entry',
    description: 'Rp 10jt - 26.6jt · 16 varian',
    color: 'text-blue-500',
  },
  {
    slug: 'daily-use',
    label: 'Daily Use',
    shortLabel: 'Daily',
    description: 'Rp 21.7jt - 54jt · 32 varian',
    color: 'text-amber-500',
  },
  {
    slug: 'affordable-high-end',
    label: 'Affordable High End',
    shortLabel: 'AHE',
    description: 'Rp 31jt - 80jt · 32 varian',
    color: 'text-emerald-500',
  },
]

// Nav links — "Paket Audio" punya submenu
const NAV_LINKS: NavLink[] = [
  { anchor: 'about', label: 'About' },
  { anchor: 'awards', label: 'Award' },
  { anchor: 'why-us', label: 'Why Us' },
  {
    anchor: 'paket-audio',
    label: 'Paket Audio',
    submenu: PAKET_SUBMENU,
  },
  { anchor: 'video', label: 'Video' },
  { anchor: 'recommender', label: 'Recommender' },
  { anchor: 'lokasi', label: 'Kontak' },
  { anchor: 'faq', label: 'FAQ' },
]

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [paketExpanded, setPaketExpanded] = React.useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow',
        scrolled && 'shadow-sm',
      )}
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-3 sm:gap-4">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-9"
                aria-label="Buka menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
              <SheetTitle className="sr-only">
                Innovation Car Audio Jakarta — Navigasi
              </SheetTitle>
              <SheetDescription className="sr-only">
                Menu utama landing page Innovation Car Audio Jakarta.
              </SheetDescription>
              <div className="px-4 py-3 border-b border-border">
                <ICALogo className="h-8 w-8" />
              </div>
              <nav className="px-2 py-2">
                {NAV_LINKS.map((l) => {
                  const href = isHome ? `#${l.anchor}` : `/#${l.anchor}`

                  // Jika ada submenu (Paket Audio), render sebagai expandable accordion
                  if (l.submenu && l.submenu.length > 0) {
                    return (
                      <div key={l.anchor}>
                        {/* Parent link — klik scroll ke #paket-audio, plus expand button */}
                        <div className="flex items-center">
                          <Link
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors flex-1"
                          >
                            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                            {l.label}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPaketExpanded(!paketExpanded)}
                            className="p-2 mr-1 rounded-md hover:bg-muted transition-colors"
                            aria-label={paketExpanded ? 'Tutup submenu' : 'Buka submenu'}
                            aria-expanded={paketExpanded}
                          >
                            <ChevronDown
                              className={cn(
                                'size-4 text-muted-foreground transition-transform',
                                paketExpanded && 'rotate-180',
                              )}
                            />
                          </button>
                        </div>

                        {/* Submenu items — expandable */}
                        {paketExpanded && (
                          <div className="ml-4 border-l border-border pl-2 mb-1">
                            {l.submenu.map((sub) => (
                              <Link
                                key={sub.slug}
                                href={`/paket/${sub.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                              >
                                <span className={cn('size-2 rounded-full mt-1.5 shrink-0 bg-current', sub.color)} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium">{sub.label}</div>
                                  <div className="text-[10px] text-muted-foreground">{sub.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Normal link (no submenu)
                  return (
                    <Link
                      key={l.anchor}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                      {l.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-auto px-4 py-3 border-t border-border space-y-2">
                <Link
                  href="/admin/login"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-brand dark:text-brand-light hover:bg-brand/10 text-center"
                >
                  Masuk Admin
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 size-8 grid place-items-center rounded hover:bg-muted lg:hidden"
                aria-label="Tutup menu"
              >
                <X className="size-4" />
              </button>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="Innovation Car Audio Jakarta — Beranda"
          >
            <ICALogo className="h-8 w-8" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_LINKS.map((l) => {
              const href = isHome ? `#${l.anchor}` : `/#${l.anchor}`

              // Jika ada submenu (Paket Audio), render sebagai dropdown
              if (l.submenu && l.submenu.length > 0) {
                return (
                  <div key={l.anchor} className="relative group">
                    {/* Parent button */}
                    <Link
                      href={href}
                      className={cn(
                        'relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-muted hover:text-brand text-foreground/80 flex items-center gap-1',
                      )}
                    >
                      {l.label}
                      <ChevronDown className="size-3.5 text-muted-foreground group-hover:rotate-180 transition-transform duration-200" />
                    </Link>

                    {/* Dropdown menu — show on hover */}
                    <div className="absolute top-full left-0 mt-1 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                        {/* Dropdown header */}
                        <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <Package className="size-3.5" />
                            Pilih Kategori Paket
                          </div>
                        </div>
                        {/* Submenu items */}
                        <div className="p-2">
                          {l.submenu.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/paket/${sub.slug}`}
                              className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors group/item"
                            >
                              <span className={cn('size-2.5 rounded-full mt-1.5 shrink-0 bg-current', sub.color)} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground group-hover/item:text-brand transition-colors">
                                  {sub.label}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  {sub.description}
                                </div>
                              </div>
                              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              // Normal link
              return (
                <Link
                  key={l.anchor}
                  href={href}
                  className={cn(
                    'relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-muted hover:text-brand text-foreground/80',
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
