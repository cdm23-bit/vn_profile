import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Profile",
  description: "A visual novel profile experience",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
