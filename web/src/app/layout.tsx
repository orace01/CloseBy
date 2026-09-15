import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  axes: ["wdth"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "CloseBy · Trouvez vos prochains clients",
    template: "%s · CloseBy",
  },
  description:
    "CloseBy repère les entreprises qui ont besoin de vos services près de chez vous, trouve comment les contacter et prépare le premier e-mail. Vous n’avez plus qu’à valider.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${instrumentSans.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
