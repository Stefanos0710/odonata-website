import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Newsreader } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-sans" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "Odonata, an autonomous forest drone", template: "%s · Odonata" },
  description:
    "Odonata is a self-built autonomous drone, documented session by session. Next goal: flying through forests and spotting bark beetle damage (Jugend forscht 2027).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${newsreader.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-header">
          <Link href="/" className="wordmark">Odonata</Link>
          <nav aria-label="Main">
            <Link href="/#build">Build</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/#forest">Forest goal</Link>
            <a href="https://github.com/Stefanos0710/Odonata" target="_blank" rel="noopener">GitHub</a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="contact">
            <h2>Questions, ideas, or want to build one too?</h2>
            <a href="mailto:stefanoskoufogazos@outlook.com">stefanoskoufogazos@outlook.com</a>
            <a href="https://x.com/Stefanos0710" target="_blank" rel="noopener">@Stefanos0710 on X</a>
          </div>
          <p>
            Built by Stefanos. Started for <a href="https://fallout.hackclub.com/projects/130">Hack Club Fallout</a>,
            continued for Jugend forscht 2027.
          </p>
          <p>
            Code, CAD and PCB files are on <a href="https://github.com/Stefanos0710/Odonata">GitHub</a>.
          </p>
        </footer>
      </body>
    </html>
  );
}
