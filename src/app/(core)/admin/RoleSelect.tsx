"use client";

import { useTransition } from "react";
import { UserRole } from "@prisma/client";
import { updateUserRole } from "./actions";

interface RoleSelectProps {
  userId: string;
  currentRole: UserRole;
  roles: UserRole[];
}

export default function RoleSelect({ userId, currentRole, roles }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="text-sm bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-2 py-1 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none disabled:opacity-50"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
