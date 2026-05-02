import { requireAuth } from "@/lib/auth-utils";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Edge middleware handles redirects, but this fetches session data for SSR
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar session={session} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header session={session} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
