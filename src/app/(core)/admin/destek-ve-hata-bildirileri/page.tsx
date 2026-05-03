import { requireAdmin } from "@/lib/auth-utils";
import { SupportTicketsTable } from "@/components/admin/SupportTicketsTable";
import { getSupportTickets } from "../actions";
import { LifeBuoy } from "lucide-react";

export default async function AdminSupportTicketsPage() {
  await requireAdmin();
  const supportTickets = await getSupportTickets();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-rose-500" />
          Destek ve Hata Bildirileri
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Üst çubuktaki &quot;Destek / Hata Bildir&quot;, alıcıların Taleplerim / sipariş ekranından gönderdiği mesajlar ve diğer sistem bildirimleri burada toplanır.
        </p>
      </div>

      <SupportTicketsTable tickets={supportTickets} />
    </div>
  );
}
