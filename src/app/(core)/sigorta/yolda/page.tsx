import { redirect } from "next/navigation";

/** Eski rota: sevkiyat artık Ulaşmamış poliçeler ekranından. */
export default function SigortaYoldaRedirect() {
  redirect("/sigorta/ulasmayan-police");
}
