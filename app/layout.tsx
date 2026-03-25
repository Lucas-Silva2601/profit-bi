import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmProvider } from "@/components/ConfirmDialog";

export const metadata: Metadata = {
  title: {
    default: "Profit BI",
    template: "%s | Profit BI",
  },
  description:
    "Business Intelligence simplificado para PMEs. Transforme seus dados em dashboards inteligentes com IA.",
  openGraph: {
    title: "Profit BI",
    description:
      "Business Intelligence simplificado para PMEs. Transforme seus dados em dashboards inteligentes com IA.",
    type: "website",
    locale: "pt_BR",
    siteName: "Profit BI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profit BI",
    description: "Business Intelligence simplificado para PMEs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className="bg-gray-50 font-sans text-gray-900 antialiased"
        suppressHydrationWarning
      >
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
