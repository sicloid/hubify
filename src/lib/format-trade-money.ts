/** Prisma Decimal veya sayı için güvenli para formatı (sunucu bileşenleri). */
export function formatTradeMoney(
  amount: { toString(): string } | null | undefined,
  currency: string,
): string {
  if (amount == null) return "—";
  const n = Number(amount.toString());
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "USD",
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

/** DB'deki ürün görseli yolu → tarayıcıda kullanılabilir src */
export function tradeProductImageSrc(productImage: string | null | undefined): string | null {
  if (!productImage?.trim()) return null;
  const s = productImage.trim();
  if (s.startsWith("http")) return s;
  return s.startsWith("/") ? s : `/${s}`;
}
