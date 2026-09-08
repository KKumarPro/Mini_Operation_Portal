import prisma from "../config/database";
import { AppError } from "../utils/AppError";

const generateChallanNumber = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);

  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `SC-${timestamp}-${random}`;
};

export const createChallan = async (
  customerId: string,
  status: "DRAFT" | "CONFIRMED",
  items: { productId: string; quantity: number }[],
  createdBy: string
) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const productIds = items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  if (products.length !== productIds.length) {
    throw new AppError("One or more products were not found", 404);
  }

  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  for (const item of items) {
    const product = productMap.get(item.productId)!;

    if (
      status === "CONFIRMED" &&
      product.currentStock < item.quantity
    ) {
      throw new AppError(
        `Insufficient stock for ${product.name}. Available stock: ${product.currentStock}`,
        400
      );
    }
  }

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.create({
      data: {
        challanNumber: generateChallanNumber(),
        customerId,
        totalQuantity,
        status,
        createdBy,
      },
    });

    for (const item of items) {
      const product = productMap.get(item.productId)!;

      await tx.challanItem.create({
        data: {
          challanId: challan.id,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
        },
      });

      if (status === "CONFIRMED") {
        const updated = await tx.product.updateMany({
          where: {
            id: product.id,
            currentStock: {
              gte: item.quantity,
            },
          },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new AppError(
            `Insufficient stock for ${product.name}`,
            400
          );
        }

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            type: "OUT",
            reason: `Sales Challan ${challan.challanNumber}`,
            createdBy,
          },
        });
      }
    }

    return tx.challan.findUnique({
      where: { id: challan.id },
      include: {
        customer: true,
        items: true,
      },
    });
  });
};

export const getChallans = async () => {
  return prisma.challan.findMany({
    include: {
      customer: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getChallanById = async (id: string) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!challan) {
    throw new AppError("Challan not found", 404);
  }

  return challan;
};

export const updateChallanStatus = async (
  id: string,
  status: "CONFIRMED" | "CANCELLED"
) => {
  const challan = await getChallanById(id);

  if (challan.status !== "DRAFT") {
    throw new AppError(
      "Only draft challans can be confirmed or cancelled",
      400
    );
  }

  if (status === "CANCELLED") {
    return prisma.challan.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  return prisma.$transaction(async (tx) => {
    for (const item of challan.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          currentStock: {
            gte: item.quantity,
          },
        },
        data: {
          currentStock: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new AppError(
          `Insufficient stock for ${item.productName}`,
          400
        );
      }

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "OUT",
          reason: `Sales Challan ${challan.challanNumber}`,
          createdBy: challan.createdBy,
        },
      });
    }

    return tx.challan.update({
      where: { id },
      data: {
        status: "CONFIRMED",
      },
      include: {
        customer: true,
        items: true,
      },
    });
  });
};