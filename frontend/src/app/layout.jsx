import './globals.css';

export const metadata = {
  title: 'Aetheris — Minecraft Cloud Hosting',
  description: 'High-performance multi-tenant Minecraft hosting powered by Oracle Cloud ARM. Instant server creation, live console, and RCON player management.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
