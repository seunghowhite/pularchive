import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "pularchive · 샘플 2",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
