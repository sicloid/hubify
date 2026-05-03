'use server';

import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/serialize";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

import { uploadFileToS3 } from "@/lib/s3-upload";

export async function createTradeRequest(formData: FormData) {
  const session = await requireRole([UserRole.EXPORTER, UserRole.ADMIN]);
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const weight = parseFloat(formData.get("weight") as string);
  const unitPrice = parseFloat(formData.get("unitPrice") as string);
  const currency = formData.get("currency") as string || "USD";
  const destinationCity = formData.get("destinationCity") as string;
  const imageFile = formData.get("productImage") as File | null;

  const referenceNumber = `HUB-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalPrice = unitPrice * weight;

  try {
    let productImage = null;
    if (imageFile && imageFile.size > 0) {
      productImage = await uploadFileToS3(imageFile, "products");
    }

    const request = await prisma.tradeRequest.create({
      data: {
        referenceNumber,
        title,
        description,
        weight,
        unitPrice,
        currency,
        totalPrice,
        destinationCity,
        status: TradeStatus.PENDING,
        exporterId: session.id,
      },
    });

    // Bypassing Prisma Client validation if the generated client is not updated
    if (productImage) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "TradeRequest" SET "productImage" = $1 WHERE id = $2::uuid`,
          productImage,
          request.id
        );
      } catch (sqlError) {
        console.error("SQL ile productImage güncelleme hatası:", sqlError);
        // Ana işlem başarılı olduğu için burada sessizce devam edebiliriz 
        // veya kullanıcıyı uyarabiliriz.
      }
    }

    revalidatePath("/ihracatci");
    revalidatePath("/pazaryeri");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true, id: request.id };
  } catch (error: any) {
    console.error("Talep oluşturma hatası detayları:", error);
    return { 
      success: false, 
      error: error.message || "Talep oluşturulurken veritabanı hatası oluştu. Lütfen 'npx prisma migrate dev' komutunu çalıştırdığınızdan emin olun." 
    };
  }
}

export async function getTradeRequests() {
  const session = await requireAuth();
  
  try {
    // Using Raw SQL to bypass old Prisma Client field map
    const data = await prisma.$queryRawUnsafe<any[]>(
      `SELECT t.*, (SELECT COUNT(*)::int FROM "LogisticsQuote" q WHERE q."tradeRequestId" = t.id) as "quoteCount"
       FROM "TradeRequest" t 
       WHERE t."exporterId" = $1::uuid 
       ORDER BY t."createdAt" DESC`,
      session.id
    );

    // Map Raw SQL results to match expected structure
    const formattedData = data.map(t => ({
      ...t,
      _count: { quotes: t.quoteCount }
    }));

    return serializeDecimal(formattedData);
  } catch (error) {
    console.error("Talepler çekilirken hata oluştu:", error);
    return [];
  }
}
export async function getTradeRequestDetail(id: string) {
  const session = await requireAuth();
  
  const getCachedDetail = unstable_cache(
    async () => {
      const request = await prisma.tradeRequest.findUnique({
        where: { id },
        include: {
          exporter: { select: { fullName: true } },
          quotes: {
            include: {
              logistics: {
                select: { fullName: true }
              }
            }
          }
        }
      });

      if (!request) return null;

      return serializeDecimal(request);
    },
    [`trade-detail-${id}`],
    { tags: ['trade-requests'], revalidate: 30 }
  );

  try {
    return await getCachedDetail();
  } catch (error) {
    return null;
  }
}

export async function acceptQuote(quoteId: string, tradeRequestId: string) {
  const session = await requireRole([UserRole.EXPORTER, UserRole.ADMIN]);
  
  try {
    // 1. Tüm teklifleri reddet (isAccepted = false) - opsiyonel, zaten default false
    // 2. Seçilen teklifi kabul et
    await prisma.logisticsQuote.update({
      where: { id: quoteId },
      data: { isAccepted: true }
    });

    // 3. Talebin durumunu güncelle
    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: { status: TradeStatus.LOGISTICS_APPROVED }
    });

    revalidatePath(`/ihracatci/${tradeRequestId}`);
    revalidatePath("/ihracatci");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Teklif onaylama hatası:", error);
    return { success: false };
  }
}
