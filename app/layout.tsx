import { Inter } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "../context/AdminContext"; // Import the Brain

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EITP Portal - RGUKT",
  description: "Engineering Internship & Training Program",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider> {/* <--- WRAP EVERYTHING HERE */}
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
