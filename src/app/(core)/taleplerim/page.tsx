import { requireAuth } from "@/lib/auth-utils";
import { getTradeRequests } from "../ihracatci/actions";
import { getMyOrders } from "../pazaryeri/actions";
import { getMyQuotes } from "../lojistik/actions";
import TaleplerimClient from "./TaleplerimClient";

export default async function TaleplerimPage() {
  const session = await requireAuth();
  let initialData = [];
  const role = session.role;

  try {
    if (role === 'EXPORTER') {
      initialData = await getTradeRequests();
    } else if (role === 'BUYER') {
      initialData = await getMyOrders();
    } else if (role === 'LOGISTICS') {
      initialData = await getMyQuotes();
    } else if (role === 'ICC_EXPERT' || role === 'FINANCIAL_ADV') {
      const { getApprovedHistory } = await import('../lojistik/actions');
      initialData = await getApprovedHistory();
    } else if (role === 'INSURER') {
      const { getActiveShipments } = await import('../lojistik/actions');
      initialData = await getActiveShipments();
    }

  } catch (error) {
    console.error("Veri yükleme hatası:", error);
  }

  return (
    <TaleplerimClient 
      initialData={initialData} 
      userRole={role} 
    />
  );
}
