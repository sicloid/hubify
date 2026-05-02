import { Decimal } from "@prisma/client/runtime/library";

/**
 * Prisma Decimal alanlarını Number'a çevirir.
 * Server Component → Client Component geçişlerinde Decimal serialize edilemez.
 */
export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  // Decimal tespiti (Prisma nesnesi veya ona benzeyen düz obje)
  if (
    obj instanceof Decimal || 
    (typeof obj === "object" && ("d" in obj || "s" in obj) && ("toNumber" in obj || (obj as any).constructor?.name === "Decimal"))
  ) {
    try {
      return Number(obj.toString()) as unknown as T;
    } catch (e) {
      return 0 as unknown as T;
    }
  }

  // Date koruması
  if (obj instanceof Date) return obj;

  // Array işleme
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal) as unknown as T;
  }

  // Obje işleme (Sadece plain object olarak kopyala, fonksiyonları ve prototype'ı temizle)
  if (typeof obj === "object") {
    const result: any = {};
    for (const key of Object.keys(obj as any)) {
      result[key] = serializeDecimal((obj as any)[key]);
    }
    return result as T;
  }

  return obj;
}
