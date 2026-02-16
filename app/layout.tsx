import { Inter } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "../context/AdminContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EITP Portal - RGUKT",
  description: "Engineering Internship & Training Program",
};

// --- FIX IS HERE: Added type definition for 'children' ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
