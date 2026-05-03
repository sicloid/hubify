require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.tradeRequest.findMany({
    where: {
      title: { contains: "zeytin", mode: "insensitive" }
    }
  });
  
  if (products.length > 0) {
    const product = products[0];
    await prisma.tradeRequest.update({
      where: { id: product.id },
      data: { productImage: "/uploads/dubai_olive_oil.png" }
    });
    console.log("Updated product:", product.title);
  } else {
    // try to find any product just to be safe
    const any = await prisma.tradeRequest.findFirst();
    if (any) {
      await prisma.tradeRequest.update({
        where: { id: any.id },
        data: { productImage: "/uploads/dubai_olive_oil.png" }
      });
      console.log("Updated first product found:", any.title);
    } else {
      console.log("No products found in DB.");
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
