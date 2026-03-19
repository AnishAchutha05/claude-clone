import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapFolio – AI Chat Assistant",
  description: "CapFolio is a warm, intelligent AI assistant that helps you write, learn, code, and explore life's questions — beautifully.",
  keywords: ["AI", "chatbot", "assistant", "CapFolio"],
  openGraph: {
    title: "CapFolio – AI Chat Assistant",
    description: "Your warm, intelligent AI companion for any task.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
