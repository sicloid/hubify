import { requireAuth } from "@/lib/auth-utils";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FinBelgeSubnav from "./_components/FinBelgeSubnav";

export default async function FinansBelgeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar session={session} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <FinBelgeSubnav role={session.role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
