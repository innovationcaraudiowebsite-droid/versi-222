import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingAdminButton } from "@/components/landing/floating-admin-button";
import { db } from "@/lib/db";
import {
  JsonLd,
  OrganizationSchema,
  WebSiteSchema,
  LocalBusinessSchema,
} from "@/components/seo/json-ld";
import { Analytics } from "@/components/seo/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Default fallback metadata — akan di-override oleh generateMetadata di bawah.
const SITE_NAME_FALLBACK = "Innovation Car Audio Jakarta";
const TAGLINE_FALLBACK = "Workshop Audio Mobil & Peredam Suara Terbaik Jakarta";

const DESCRIPTION =
  "Innovation Car Audio Jakarta — workshop audio mobil & peredam suara terbaik dengan pengalaman 20+ tahun. Spesialis upgrade audio mobil, DSP tuning, instalasi speaker, subwoofer, dan peredam suara. Paket audio Simple Upgrade, Entry, Daily Use, dan Affordable High End. Melayani Jabodetabek.";

const KEYWORDS = [
  // === Brand ===
  "innovation car audio",
  "innovation car audio jakarta",
  "innovationcaraudio",
  "innovation-caraudio.com",
  // === Keyword Utama Audio ===
  "audio mobil jakarta",
  "upgrade audio mobil jakarta",
  "audio car jakarta",
  "workshop audio mobil jakarta",
  "bengkel audio mobil jakarta",
  "spesialis audio mobil jakarta",
  "instalasi audio mobil jakarta",
  "jasa audio mobil jakarta",
  "upgrade sound system mobil",
  "upgrade audio mobil",
  "upgrade sound mobil",
  "audio mobil terbaik jakarta",
  "audio mobil premium jakarta",
  "audio mobil SQ jakarta",
  "audio mobil harian jakarta",
  "custom audio mobil jakarta",
  "custom audio car jakarta",
  "tuning audio mobil jakarta",
  "setting audio mobil jakarta",
  "audio system mobil jakarta",
  // === Keyword Speaker ===
  "speaker mobil jakarta",
  "speaker aftermarket mobil",
  "speaker mobil terbaik jakarta",
  "speaker 2 way mobil",
  "speaker 3 way mobil",
  "instalasi speaker mobil jakarta",
  "tweeter mobil jakarta",
  "speaker rainbow",
  "speaker gz mercy",
  "speaker blam relax",
  "speaker phd",
  "speaker infinity",
  "speaker morel",
  // === Keyword Subwoofer ===
  "subwoofer mobil jakarta",
  "subwoofer aktif mobil jakarta",
  "subwoofer kolong mobil",
  "subwoofer bawah jok",
  "subwoofer bagasi",
  "subwoofer 8 inch",
  "subwoofer 10 inch",
  "subwoofer quarto",
  "subwoofer prototype",
  "subwoofer zevox",
  "subwoofer phd",
  "subwoofer cresscendo",
  // === Keyword DSP & Amplifier ===
  "DSP mobil jakarta",
  "DSP audio mobil",
  "tuning DSP mobil jakarta",
  "processor audio mobil jakarta",
  "rainbow DSP",
  "rainbow EL-PA4.6",
  "amplifier mobil jakarta",
  "power amplifier mobil",
  "power mono mobil",
  "prototype quarto",
  // === Keyword Paket Audio ===
  "paket audio mobil jakarta",
  "paket upgrade audio mobil",
  "paket audio mobil terbaik",
  "paket audio mobil harian",
  "paket audio mobil SQ",
  "paket audio mobil premium",
  "paket 2 way audio mobil",
  "paket 3 way audio mobil",
  "paket subwoofer mobil",
  "paket DSP audio mobil",
  "paket speaker mobil jakarta",
  "simple upgrade audio",
  "entry audio mobil",
  "daily use audio mobil",
  "affordable high end audio",
  // === Keyword Peredam (untuk audio) ===
  "peredam mobil untuk audio",
  "peredam pintu untuk speaker",
  "peredam mobil jakarta",
  "soundproofing mobil jakarta",
  // === Keyword Lokasi ===
  "audio mobil jakarta barat",
  "audio mobil jakarta selatan",
  "audio mobil jakarta timur",
  "audio mobil jakarta utara",
  "audio mobil jakarta pusat",
  "audio mobil tangerang",
  "audio mobil bekasi",
  "audio mobil depok",
  "audio mobil bogor",
  // === Keyword Instalasi ===
  "instalasi audio mobil",
  "pemasangan audio mobil",
  "biaya instalasi audio mobil",
  "harga upgrade audio mobil",
  "garansi audio mobil",
  "workshop audio terpercaya jakarta",
  "bengkel audio terbaik jakarta",
];

type SiteSettingLite = {
  siteName: string
  tagline: string
  logoUrl: string | null
  faviconUrl: string | null
  gaMeasurementId: string | null
  gtmId: string | null
  verificationGoogle: string | null
  verificationBing: string | null
}

async function getSettings(): Promise<SiteSettingLite> {
  const fallback: SiteSettingLite = {
    siteName: SITE_NAME_FALLBACK,
    tagline: TAGLINE_FALLBACK,
    logoUrl: null,
    faviconUrl: null,
    gaMeasurementId: null,
    gtmId: null,
    verificationGoogle: null,
    verificationBing: null,
  }
  try {
    const s = (await db.siteSetting.upsert({
      where: { id: "global" },
      update: {},
      create: {},
    })) as {
      siteName?: string | null
      tagline?: string | null
      logoUrl?: string | null
      faviconUrl?: string | null
      gaMeasurementId?: string | null
      gtmId?: string | null
      verificationGoogle?: string | null
      verificationBing?: string | null
    }
    return {
      siteName: s.siteName || fallback.siteName,
      tagline: s.tagline || fallback.tagline,
      logoUrl: s.logoUrl ?? null,
      faviconUrl: s.faviconUrl ?? null,
      gaMeasurementId: s.gaMeasurementId ?? null,
      gtmId: s.gtmId ?? null,
      verificationGoogle: s.verificationGoogle ?? null,
      verificationBing: s.verificationBing ?? null,
    }
  } catch {
    return fallback
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const title = `${s.siteName} — ${s.tagline}`
  // Use production URL for OG/canonical (VERCEL_URL is preview-specific)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.innovation-caraudio.com")
  const ogImage = "/og-default.jpg"

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${s.siteName}`,
    },
    description: DESCRIPTION,
    keywords: KEYWORDS,
    authors: [{ name: "Innovation Car Audio Jakarta" }],
    creator: "Innovation Car Audio Jakarta",
    publisher: "Innovation Car Audio Jakarta",
    applicationName: s.siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl,
      siteName: s.siteName,
      title,
      description: DESCRIPTION,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: 1200,
          height: 630,
          alt: s.siteName,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DESCRIPTION,
      images: [ogImage],
    },
    icons: {
      icon: s.faviconUrl || "/favicon.ico",
      apple: s.faviconUrl || "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    category: "automotive",
    // Bing & Google verification meta are added via `other` if present.
    other: {
      ...(s.verificationGoogle
        ? { "google-site-verification": s.verificationGoogle }
        : {}),
      ...(s.verificationBing
        ? { "msvalidate.01": s.verificationBing }
        : {}),
    },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#467C45" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = await getSettings();
  // Build root JSON-LD (Organization + WebSite + LocalBusiness).
  const [organization, website, localBusiness] = await Promise.all([
    OrganizationSchema(),
    WebSiteSchema(),
    LocalBusinessSchema(),
  ]);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* JSON-LD for Organization, WebSite, LocalBusiness sitewide. */}
        <JsonLd schema={organization} />
        <JsonLd schema={website} />
        <JsonLd schema={localBusiness} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <FloatingAdminButton />
          <Toaster />
          <Sonner position="top-center" richColors closeButton />
        </ThemeProvider>

        {/* Google Analytics 4 + Tag Manager (only when configured). */}
        <Analytics
          gaMeasurementId={s.gaMeasurementId}
          gtmId={s.gtmId}
        />
      </body>
    </html>
  );
}
