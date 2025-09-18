import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletContextProvider } from "@/components/wallet-provider"
import { ReduxProvider } from "@/components/providers/ReduxProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gorbagana Token LaunchPad - The Premier Token & NFT Creation Platform",
  description:
    "Launch tokens and NFTs on the Gorbchain network with zero coding required. The official launchpad for the Gorbagana ecosystem featuring instant deployment, professional-grade security, and seamless wallet integration.",
  keywords: [
    "Gorb blockchain",
    "token launchpad",
    "NFT creation",
    "cryptocurrency",
    "DeFi platform",
    "blockchain development",
    "token generator",
    "NFT marketplace",
    "Web3 application",
    "Solana ecosystem",
    "crypto launchpad",
    "decentralized finance",
    "digital assets",
    "blockchain technology",
    "smart contracts",
    "token economics",
    "NFT minting",
    "crypto startup",
    "blockchain startup",
    "DeFi tools"
  ],
  authors: [{ name: "Gorblin Gabana Team", url: "https://gorbchain.xyz" }],
  creator: "Gorblin Gabana Team",
  publisher: "Gorbagana Token LaunchPad",
  category: "Technology",
  classification: "Blockchain Platform",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Gorbagana Token LaunchPad - Launch Your Tokens Onchain",
    description: "The most user-friendly platform to create tokens and NFTs on Gorbchain network. No coding required, instant deployment, enterprise-grade security.",
    siteName: "Gorbagana Token LaunchPad",
    images: [
      {
        url: "/goblin-mascot.png",
        width: 1200,
        height: 630,
        alt: "Gorb Launchpad - Token & NFT Creation Platform",
        type: "image/png"
      }
    ],
    url: "https://launch.gorbchain.xyz"
  },
  twitter: {
    card: "summary_large_image",
    site: "@GorbChain",
    creator: "@GorbChain",
    title: "Gorbagana Token LaunchPad - Launch Your Crypto Dreams",
    description: "Create tokens & NFTs on Gorbchain network with zero coding. Professional-grade security, instant deployment, seamless wallet integration.",
    images: ["/goblin-mascot.png"]
  },
  alternates: {
    canonical: "https://launch.gorbchain.xyz"
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-16x16.png"
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "your-google-site-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code"
  },
  other: {
    'msapplication-TileColor': '#2b5797',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#ffffff'
  },
  generator: 'Next.js',
  applicationName: 'Gorbagana Token LaunchPad',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Gorbagana Token LaunchPad",
              "description": "The premier platform for launching tokens and NFTs on the Gorbchain network",
              "url": "https://launch.gorbchain.xyz",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Token Creation",
                "NFT Minting",
                "Wallet Integration",
                "Blockchain Deployment",
                "Metadata Management",
                "Transaction Monitoring"
              ],
              "author": {
                "@type": "Organization",
                "name": "Gorblin Gabana Team",
                "url": "https://gorbchain.xyz"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Gorbagana Token LaunchPad",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://launch.gorbchain.xyz/goblin-mascot.png"
                }
              },
              "screenshot": "https://launch.gorbchain.xyz/goblin-mascot.png",
              "softwareVersion": "1.0.0"
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <WalletContextProvider>
              {children}
              <Toaster />
            </WalletContextProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
