import { PUBLIC_NAV_GROUPS, isNavGroup, type NavLink } from "@/lib/constants";
import { HostSubNav } from "./host-subnav";

// Derive the host tabs from the "Host" group so links never drift.
const HOST_ITEMS: readonly NavLink[] =
  (PUBLIC_NAV_GROUPS.find((e) => isNavGroup(e) && e.label === "Host") as
    | { items: readonly NavLink[] }
    | undefined)?.items ?? [];

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HostSubNav items={HOST_ITEMS} />
      {children}
    </>
  );
}
