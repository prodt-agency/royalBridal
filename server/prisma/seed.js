import bcrypt from "bcrypt";
import {
  PrismaClient,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  AdminRole,
} from "@prisma/client";
const prisma = new PrismaClient();
const categoryNames = [
  "Bridal Chura",
  "Kaleere",
  "Bangles",
  "Necklace Sets",
  "Hair Accessories",
];
const productNames = [
  "Noor Chura",
  "Meher Kaleere",
  "Gulzar Bangles",
  "Rani Haar",
  "Saanjh Hair Jewel",
];
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
async function main() {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productSize.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.admin.deleteMany(),
  ]);
  const passwordHash = await bcrypt.hash("RoyalBridal!2026", 12);
  await prisma.admin.createMany({
    data: [
      {
        name: "Royal Bridal Owner",
        email: "owner@royalbridal.test",
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
      },
      {
        name: "Royal Bridal Admin",
        email: "admin@royalbridal.test",
        passwordHash,
        role: AdminRole.ADMIN,
      },
    ],
  });
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: { name, slug: slug(name), active: true },
      }),
    ),
  );
  const products = [];
  for (let index = 0; index < 25; index += 1) {
    const name = `${productNames[index % productNames.length]} ${String(index + 1).padStart(2, "0")}`;
    products.push(
      await prisma.product.create({
        data: {
          name,
          slug: slug(name),
          sku: `RB-${String(index + 1).padStart(4, "0")}`,
          description: `A handcrafted ${categoryNames[index % categoryNames.length].toLowerCase()} piece for a bridal celebration.`,
          price: 2400 + index * 350,
          salePrice: index % 3 === 0 ? 2100 + index * 300 : null,
          stock: 5 + (index % 10),
          featured: index < 8,
          active: true,
          categoryId: categories[index % categories.length].id,
          images: {
            create: [
              { imageUrl: `/images/products/${slug(name)}.webp`, sortOrder: 0 },
            ],
          },
          sizes: {
            create: ["2.4", "2.6", "2.8"].map((size, sizeIndex) => ({
              size,
              stock: 2 + sizeIndex,
            })),
          },
        },
      }),
    );
  }
  const customers = await Promise.all(
    [
      "Aarohi Sharma",
      "Diya Kapoor",
      "Meera Singh",
      "Ananya Gupta",
      "Isha Verma",
    ].map((name, index) =>
      prisma.customer.create({
        data: {
          name,
          email: `${slug(name)}@example.test`,
          phone: `90000000${String(index + 10).padStart(2, "0")}`,
        },
      }),
    ),
  );
  for (let index = 0; index < 10; index += 1) {
    const product = products[index];
    const customer = customers[index % customers.length];
    const totalAmount = Number(product.salePrice ?? product.price);
    const paymentStatus =
      index % 2 === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING;
    const order = await prisma.order.create({
      data: {
        orderNumber: `RB-2026-${String(index + 1).padStart(5, "0")}`,
        customerId: customer.id,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        addressLine1: `${index + 10} Celebration Road`,
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        totalAmount,
        paymentMethod:
          index % 2 === 0 ? PaymentMethod.RAZORPAY : PaymentMethod.COD,
        paymentStatus,
        orderStatus:
          index % 3 === 0 ? OrderStatus.DELIVERED : OrderStatus.PENDING,
        orderItems: {
          create: [
            {
              productId: product.id,
              selectedSize: "2.6",
              quantity: 1,
              price: totalAmount,
            },
          ],
        },
      },
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: order.paymentMethod,
        status: paymentStatus,
        amount: totalAmount,
        razorpayOrderId:
          order.paymentMethod === PaymentMethod.RAZORPAY
            ? `order_seed_${index + 1}`
            : null,
        razorpayPaymentId:
          paymentStatus === PaymentStatus.PAID ? `pay_seed_${index + 1}` : null,
      },
    });
  }
}
main()
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
