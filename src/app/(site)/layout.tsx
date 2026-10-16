import type { ReactNode } from "react";
import { AppHeader } from "@/components/dashboard/app-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
