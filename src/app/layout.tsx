import { Spectral, Noto_Sans } from "next/font/google";

import "@/styles/globals.css";
import { TRPCReactProvider } from "@/utils/trpc/client";

const NotoSansFont = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const SpectralFont = Spectral({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </div>
      </body>
    </html>
  );
}
