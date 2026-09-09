import prisma from "../config/database";
import { AppError } from "../utils/AppError";

export const createProduct = async (data: any) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      sku: data.sku,
    },
  });

  if (existingProduct) {
    throw new AppError("SKU already exists", 409);
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice.toString(),
      currentStock: data.currentStock,
      minStockAlert: data.minStockAlert,
      warehouse: data.warehouse,
    },
  });

  return product;
};

export const getProducts = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            sku: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            category: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const updateProduct = async (
  id: string,
  data: any
) => {
  await getProductById(id);

  if (data.sku) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku: data.sku,
        NOT: {
          id,
        },
      },
    });

    if (existingProduct) {
      throw new AppError("SKU already exists", 409);
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      unitPrice:
        data.unitPrice !== undefined
          ? data.unitPrice.toString()
          : undefined,
    },
  });
};

export const createStockMovement = async (
  productId: string,
  quantity: number,
  type: "IN" | "OUT",
  reason: string,
  createdBy: string
) => {
  const product = await getProductById(productId);

  if (type === "OUT" && product.currentStock < quantity) {
    throw new AppError(
      `Insufficient stock. Available stock: ${product.currentStock}`,
      400
    );
  }

  const newStock =
    type === "IN"
      ? product.currentStock + quantity
      : product.currentStock - quantity;

  return prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: newStock,
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        createdBy,
      },
    });

    return {
      product: updatedProduct,
      movement,
    };
  });
};

export const getStockMovements = async (
  productId: string
) => {
  await getProductById(productId);

  return prisma.stockMovement.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};