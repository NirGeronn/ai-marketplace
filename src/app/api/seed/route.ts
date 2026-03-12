import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";
import { startOperation } from "@/lib/sync-lock";

export async function POST() {
  // Abort any in-flight Jira sync before seeding
  startOperation();

  try {
    const result = await seedDatabase(prisma);
    return NextResponse.json({ status: "success", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: "Seed failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
