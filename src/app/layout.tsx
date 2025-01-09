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
      <head>
        <title>Quiz App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div
          className={`${NotoSansFont.variable} ${SpectralFont.variable} font-body`}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
