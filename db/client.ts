import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export const getUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const createUser = (data: {
  email: string;
  name: string;
  type: string;
  company: string;
}) => prisma.user.create({ data });

export const getBriefsByBrand = (brandId: string) =>
  prisma.brief.findMany({
    where: { brandId },
    include: { proposals: true },
    orderBy: { createdAt: "desc" },
  });

export const createBrief = (data: {
  title: string;
  description: string;
  category: string;
  budget: number;
  quantity: number;
  brandId: string;
}) => prisma.brief.create({ data });

export const updateBriefStatus = (id: string, status: string) =>
  prisma.brief.update({ where: { id }, data: { status } });
