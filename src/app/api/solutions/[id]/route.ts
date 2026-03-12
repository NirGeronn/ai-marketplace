import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifySlack } from "@/lib/slack";
import { findSolutionByIdWithRelations } from "@/lib/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const solution = await findSolutionByIdWithRelations(id);

  if (!solution) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(solution);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.solution.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check permissions: admin or owner
  const isAdmin = session.user.role === "ADMIN";
  const isOwner = existing.ownerId === session.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { tags, ...data } = body;

  await prisma.solution.update({
    where: { id },
    data: {
      ...data,
      ...(tags
        ? {
            tags: {
              set: [],
              connectOrCreate: tags.map((tag: string) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
          }
        : {}),
    },
  });
  const solution = await findSolutionByIdWithRelations(id);
  if (!solution) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Notify if status changed
  if (data.status && data.status !== existing.status) {
    await notifySlack({
      type: "solution_updated",
      name: solution.name,
      field: "status",
      oldValue: existing.status,
      newValue: data.status,
      url: `${process.env.AUTH_URL}/solutions/${solution.id}`,
    });
  }

  return NextResponse.json(solution);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.solution.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
