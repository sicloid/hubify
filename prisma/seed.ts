import { PrismaClient, TradeStatus, UserRole, DocumentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding veritabanı başlatılıyor...');

  const passwordHash = await bcrypt.hash('Hubify123!', 10);

  const users = [
    { email: 'admin@hubify.test', fullName: 'Sistem Yöneticisi', role: UserRole.ADMIN },
    { email: 'ihracatci@hubify.test', fullName: 'Ayşe İhracat', role: UserRole.EXPORTER },
    { email: 'alici@hubify.test', fullName: 'Mehmet Alıcı', role: UserRole.BUYER },
    { email: 'lojistik@hubify.test', fullName: 'Bora Lojistik', role: UserRole.LOGISTICS },
    { email: 'icc-uzmani@hubify.test', fullName: 'Hakan Uzman', role: UserRole.ICC_EXPERT },
    { email: 'mali-musavir@hubify.test', fullName: 'Cemal Müşavir', role: UserRole.FINANCIAL_ADV },
    { email: 'sigorta@hubify.test', fullName: 'Efe Sigorta', role: UserRole.INSURER }
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          passwordHash: passwordHash,
        },
      });
      console.log(`Eklendi: ${user.email} (${user.role})`);
    } else {
      console.log(`Zaten var: ${user.email}`);
    }
  }

  const exporter = await prisma.user.findUnique({ where: { email: 'ihracatci@hubify.test' } });
  const buyer = await prisma.user.findUnique({ where: { email: 'alici@hubify.test' } });
  const logistics = await prisma.user.findUnique({ where: { email: 'lojistik@hubify.test' } });
  const iccExpert = await prisma.user.findUnique({ where: { email: 'icc-uzmani@hubify.test' } });
  const financialAdv = await prisma.user.findUnique({ where: { email: 'mali-musavir@hubify.test' } });
  const insurer = await prisma.user.findUnique({ where: { email: 'sigorta@hubify.test' } });

  if (!exporter || !buyer || !logistics || !iccExpert || !financialAdv || !insurer) {
    throw new Error('Temel rol kullanıcıları bulunamadı.');
  }

  // Sipariş alınmış ürünler (buyer atanmış, pipeline'a girmiş)
  const orderedRequests = [
    {
      referenceNumber: 'HZ-2026-001',
      title: 'Berlin Tekstil Mikro-Ihracat',
      description: 'Konsolide tekstil urunleri sevkiyati',
      status: TradeStatus.LOGISTICS_APPROVED,
      buyerId: buyer.id,
    },
    {
      referenceNumber: 'HZ-2026-002',
      title: 'Rotterdam Deri Aksesuar',
      description: 'Belgeleri kismen yuklenmis dosya',
      status: TradeStatus.DOCUMENTS_PENDING,
      buyerId: buyer.id,
    },
    {
      referenceNumber: 'HZ-2026-003',
      title: 'Hamburg Gida Numune Sevki',
      description: 'ICC onayi tamam, finans islemleri bekleniyor',
      status: TradeStatus.DOCUMENTS_APPROVED,
      buyerId: buyer.id,
    },
    {
      referenceNumber: 'HZ-2026-004',
      title: 'Paris Kozmetik Mini Parti',
      description: 'Lojistik onayi aldi, ICC belge yuklemesi bekliyor',
      status: TradeStatus.LOGISTICS_APPROVED,
      buyerId: buyer.id,
    },
    {
      referenceNumber: 'HZ-2026-005',
      title: 'Madrid Endustriyel Yedek Parca',
      description: 'Konşimento yuklenmis, gumruk beyannamesi bekliyor',
      status: TradeStatus.DOCUMENTS_PENDING,
      buyerId: buyer.id,
    },
    {
      referenceNumber: 'HZ-2026-006',
      title: 'Varşova Medikal Sarf',
      description: 'Belgeler yuklu fakat ICC onayi alinmamis',
      status: TradeStatus.DOCUMENTS_PENDING,
      buyerId: buyer.id,
    },
  ];

  // Alıcı bekleyen ürün ilanları (PENDING – pazaryerinde görünecek)
  const pendingListings = [
    {
      referenceNumber: 'HZ-2026-007',
      title: 'Londra Seramik Sanat Eseri',
      description: 'El yapımı seramik ürünler, 30 adet',
      status: TradeStatus.PENDING,
      weight: 120,
    },
    {
      referenceNumber: 'HZ-2026-008',
      title: 'Dubai Organik Zeytinyağı',
      description: 'Soğuk sıkım organik zeytinyağı, 500ml x 200 şişe',
      status: TradeStatus.PENDING,
      weight: 250,
    },
    {
      referenceNumber: 'HZ-2026-009',
      title: 'Tokyo Baharat Koleksiyonu',
      description: 'Antep pul biberi, kekik, sumak karma seti',
      status: TradeStatus.PENDING,
      weight: 80,
    },
  ];

  const baseRequests = [...orderedRequests, ...pendingListings];

  for (const request of baseRequests) {
    const existing = await prisma.tradeRequest.findUnique({ where: { referenceNumber: request.referenceNumber } });

    if (!existing) {
      await prisma.tradeRequest.create({
        data: {
          referenceNumber: request.referenceNumber,
          title: request.title,
          description: request.description,
          status: request.status,
          weight: (request as any).weight || Math.floor(Math.random() * 500 + 50),
          exporterId: exporter.id,
          buyerId: (request as any).buyerId || null,
          ...((request as any).buyerId ? {
            quotes: {
              create: {
                price: '1250.00',
                currency: 'USD',
                estimatedDays: 7,
                notes: 'Konsolide rota teklifidir.',
                logisticsId: logistics.id,
                isAccepted: true,
              }
            }
          } : {})
        }
      });
      console.log(`Talep eklendi: ${request.referenceNumber} (${request.status})`);
    } else {
      console.log(`Talep zaten var: ${request.referenceNumber}`);
    }
  }

  const requestPending = await prisma.tradeRequest.findUnique({ where: { referenceNumber: 'HZ-2026-002' } });
  const requestApproved = await prisma.tradeRequest.findUnique({ where: { referenceNumber: 'HZ-2026-003' } });
  const requestLogisticsOnly = await prisma.tradeRequest.findUnique({ where: { referenceNumber: 'HZ-2026-004' } });
  const requestHalfReady = await prisma.tradeRequest.findUnique({ where: { referenceNumber: 'HZ-2026-005' } });
  const requestWaitingApproval = await prisma.tradeRequest.findUnique({ where: { referenceNumber: 'HZ-2026-006' } });

  if (requestPending) {
    const hasBill = await prisma.document.findFirst({
      where: { tradeRequestId: requestPending.id, type: DocumentType.BILL_OF_LADING }
    });
    if (!hasBill) {
      await prisma.document.create({
        data: {
          name: 'konsimento-hz-2026-002.pdf',
          fileUrl: 'internal://seed/hz-2026-002/bill-of-lading.pdf',
          type: DocumentType.BILL_OF_LADING,
          isApproved: true,
          tradeRequestId: requestPending.id,
          uploadedById: iccExpert.id,
        }
      });
    }
  }

  if (requestApproved) {
    const docsToEnsure = [
      { type: DocumentType.BILL_OF_LADING, name: 'konsimento-hz-2026-003.pdf', uploadedById: iccExpert.id },
      { type: DocumentType.CUSTOMS_DECLARATION, name: 'gumruk-beyan-hz-2026-003.pdf', uploadedById: iccExpert.id },
      { type: DocumentType.COMMERCIAL_INVOICE, name: 'e-fatura-hz-2026-003.pdf', uploadedById: financialAdv.id },
    ];

    for (const doc of docsToEnsure) {
      const existingDoc = await prisma.document.findFirst({
        where: { tradeRequestId: requestApproved.id, type: doc.type }
      });
      if (!existingDoc) {
        await prisma.document.create({
          data: {
            name: doc.name,
            fileUrl: `internal://seed/hz-2026-003/${doc.type.toLowerCase()}.pdf`,
            type: doc.type,
            isApproved: true,
            tradeRequestId: requestApproved.id,
            uploadedById: doc.uploadedById,
          }
        });
      }
    }
  }

  if (requestLogisticsOnly) {
    // Bilinçli olarak belge eklemiyoruz: panelde "Belgeyi Yükle" butonları net görünsün.
  }

  if (requestHalfReady) {
    const hasBill = await prisma.document.findFirst({
      where: { tradeRequestId: requestHalfReady.id, type: DocumentType.BILL_OF_LADING }
    });
    if (!hasBill) {
      await prisma.document.create({
        data: {
          name: 'konsimento-hz-2026-005.pdf',
          fileUrl: 'internal://seed/hz-2026-005/bill-of-lading.pdf',
          type: DocumentType.BILL_OF_LADING,
          isApproved: true,
          tradeRequestId: requestHalfReady.id,
          uploadedById: iccExpert.id,
        }
      });
    }
  }

  if (requestWaitingApproval) {
    const docsToEnsure = [
      { type: DocumentType.BILL_OF_LADING, name: 'konsimento-hz-2026-006.pdf' },
      { type: DocumentType.CUSTOMS_DECLARATION, name: 'gumruk-beyan-hz-2026-006.pdf' },
    ];

    for (const doc of docsToEnsure) {
      const existingDoc = await prisma.document.findFirst({
        where: { tradeRequestId: requestWaitingApproval.id, type: doc.type }
      });
      if (!existingDoc) {
        await prisma.document.create({
          data: {
            name: doc.name,
            fileUrl: `internal://seed/hz-2026-006/${doc.type.toLowerCase()}.pdf`,
            type: doc.type,
            isApproved: false,
            tradeRequestId: requestWaitingApproval.id,
            uploadedById: iccExpert.id,
          }
        });
      }
    }
  }

  console.log('Seeding işlemi başarıyla tamamlandı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
