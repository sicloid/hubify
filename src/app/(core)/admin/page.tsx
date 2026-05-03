import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import RoleSelect from "./RoleSelect";
import { UserRole } from "@prisma/client";
import { Shield, Users as UsersIcon } from "lucide-react";
import { LiveShipmentMap } from "@/components/admin/LiveShipmentMap";
import { LiveSystemLogs } from "@/components/admin/LiveSystemLogs";
import { AdminDashboardStats } from "@/components/admin/AdminDashboardStats";

export default async function AdminPage() {
  // 1. Guard Katmanı: Sadece ADMIN girebilir
  const session = await requireAdmin();

  // 2. Veri Çekimi
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const roles = Object.values(UserRole);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-secondary" />
            Güvenlik Komuta Merkezi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Platformdaki tüm operasyonları ve sistem güvenliğini yönetin.</p>
        </div>
      </div>

      {/* Live Stats */}
      <AdminDashboardStats />

      {/* Security Dashboards (Radar & Logs) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <LiveShipmentMap />
        <LiveSystemLogs />
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Kullanıcı Listesi ({users.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Ad Soyad</th>
                <th className="px-6 py-4 font-medium">E-posta</th>
                <th className="px-6 py-4 font-medium">Kayıt Tarihi</th>
                <th className="px-6 py-4 font-medium text-right">Rol / Yetki</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RoleSelect 
                      userId={user.id} 
                      currentRole={user.role} 
                      roles={roles} 
                    />
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Kayıtlı kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
