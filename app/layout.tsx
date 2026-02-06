import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CodeComments Translator | Translate Code Comments Instantly",
    description: "Translate code comments from any language to your preferred language. Perfect for reading Chinese, Japanese, Korean, and other non-English codebases.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
