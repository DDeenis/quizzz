import { Spectral, Noto_Sans } from "next/font/google";

import "@/styles/globals.css";

const NotoSansFont = Noto_Sans({
  weight: ["400", "600"],
  variable: "--font-body",
});

const SpectralFont = Spectral({
  weight: ["400", "600"],
  variable: "--font-fancy",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <main
          className={`${NotoSansFont.variable} ${SpectralFont.variable} font-body`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
