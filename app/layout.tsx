import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "MoveBeat – AI Activity Coach", description: "Music-powered timers, smart coaching and estimated calorie tracking for games, workouts, HIIT and boxing.", manifest: "/manifest.webmanifest", themeColor: "#121127", appleWebApp: { capable: true, title: "MoveBeat", statusBarStyle: "black-translucent" }, icons: { icon: "/app-icon.svg", apple: "/app-icon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><head><link rel="manifest" href="/manifest.webmanifest"/><meta name="mobile-web-app-capable" content="yes" /><meta name="application-name" content="MoveBeat"/></head><body>{children}</body></html>; }
