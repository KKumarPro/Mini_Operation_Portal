import prisma from "../config/database";
import { AppError } from "../utils/AppError";

export const createCustomer = async (data: any) => {
  return prisma.customer.create({
    data: {
      ...data,
      followUpDate: data.followUpDate
        ? new Date(data.followUpDate)
        : undefined,
    },
  });
};

export const getCustomers = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          {
            businessName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          { mobile: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      challans: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
};

export const updateCustomer = async (id: string, data: any) => {
  await getCustomerById(id);

  return prisma.customer.update({
    where: { id },
    data: {
      ...data,
      followUpDate: data.followUpDate
        ? new Date(data.followUpDate)
        : undefined,
    },
  });
};

export const addFollowUp = async (
  id: string,
  notes: string,
  followUpDate?: string
) => {
  const customer = await getCustomerById(id);

  const updatedNotes = customer.notes
    ? `${customer.notes}\n${new Date().toISOString()} - ${notes}`
    : `${new Date().toISOString()} - ${notes}`;

  return prisma.customer.update({
    where: { id },
    data: {
      notes: updatedNotes,
      followUpDate: followUpDate
        ? new Date(followUpDate)
        : customer.followUpDate,
    },
  });
};