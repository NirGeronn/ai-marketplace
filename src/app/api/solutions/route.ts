import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findSolutionsWithRelations } from "@/lib/queries";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const type = searchParams.get("type")?.split(",").filter(Boolean);
  const department = searchParams.get("department")?.split(",").filter(Boolean);
  const status = searchParams.get("status")?.split(",").filter(Boolean);
  const tags = searchParams.get("tags")?.split(",").filter(Boolean);
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "mau_desc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));

  const where: Prisma.SolutionWhereInput = {};
  const conditions: Prisma.SolutionWhereInput[] = [];

  if (type?.length) {
    conditions.push({ solutionType: { in: type as Prisma.EnumSolutionTypeFilter["in"] } });
  }
  if (department?.length) {
    conditions.push({ department: { in: department } });
  }
  if (status?.length) {
    conditions.push({ status: { in: status as Prisma.EnumSolutionStatusFilter["in"] } });
  }
  if (tags?.length) {
    conditions.push({ tags: { some: { name: { in: tags } } } });
  }
  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
      ],
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  let orderBy: Prisma.SolutionOrderByWithRelationInput;
  switch (sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "name_desc":
      orderBy = { name: "desc" };
      break;
    default:
      orderBy = { mau: "desc" };
  }

  // Sequential queries to avoid PrismaPg adapter concurrency bug
  const solutions = await findSolutionsWithRelations({ where, orderBy, skip: (page - 1) * limit, take: limit });
  const total = await prisma.solution.count({ where });
  const lastSync = await prisma.syncLog.findFirst({
    where: { status: { in: ["success", "partial"] } },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  return NextResponse.json({
    solutions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    lastSyncedAt: lastSync?.completedAt || null,
  });
}
