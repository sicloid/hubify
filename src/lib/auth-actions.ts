"use server";

import { clearSession } from "./auth-utils";

export async function logoutAction() {
  await clearSession();
}
