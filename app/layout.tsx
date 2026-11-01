import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:
    "BALIZA · Jogo de nonogramas originais, validação de linhas e dicas pelo servidor",
  description:
    "Jogo de nonogramas originais, validação de linhas e dicas pelo servidor",
  metadataBase: new URL("https://baliza-gustapaz.starrylinen.chatgpt.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "BALIZA",
    description:
      "Jogo de nonogramas originais, validação de linhas e dicas pelo servidor",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
