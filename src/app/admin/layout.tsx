import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | SPAGHETTI EXPRESSO",
  description: "Painel administrativo do Spaghetti Expresso",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
