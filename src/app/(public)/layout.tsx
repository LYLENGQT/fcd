import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="grid-bg flex-1 bg-bone text-ink">{children}</main>
      <SiteFooter />
    </div>
  );
}
