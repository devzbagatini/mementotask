import type { Metadata } from "next";
import { Geist, Geist_Mono, Gentium_Plus, Fira_Code } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gentium = Gentium_Plus({
  variable: "--font-gentium",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mementotask - Gerenciamento de Projetos",
  description: "Sistema de gerenciamento de projetos hierárquico para desenvolvimento tecnológico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Theme mode (dark/light) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mementotask_theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{document.documentElement.setAttribute('data-theme',window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark')}}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`,
          }}
        />
        {/* Settings: apply preset colors + fonts before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('mementotask_settings')||'{}');if(s.fonts){var slots={body:{fallback:'monospace'},headings:{fallback:'Georgia,serif'},interface:{fallback:'Arial,sans-serif'}};var fontMap={'JetBrains Mono':'JetBrains+Mono','IBM Plex Mono':'IBM+Plex+Mono','Source Code Pro':'Source+Code+Pro','Inconsolata':'Inconsolata','Space Mono':'Space+Mono','Victor Mono':'Victor+Mono','IBM Plex Sans':'IBM+Plex+Sans','Crimson Text':'Crimson+Text','Playfair Display':'Playfair+Display','Cormorant Garamond':'Cormorant+Garamond','Libre Baskerville':'Libre+Baskerville','EB Garamond':'EB+Garamond','Space Grotesk':'Space+Grotesk','Sora':'Sora','Inter':'Inter','DM Sans':'DM+Sans','Plus Jakarta Sans':'Plus+Jakarta+Sans','Manrope':'Manrope','Outfit':'Outfit'};for(var k in slots){if(s.fonts[k]){var g=fontMap[s.fonts[k]];if(g){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+g+':wght@400;500;600;700&display=swap';document.head.appendChild(l)}document.documentElement.style.setProperty('--font-'+k,"'"+s.fonts[k]+"', "+slots[k].fallback)}}}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gentium.variable} ${firaCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
