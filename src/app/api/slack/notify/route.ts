import { NextRequest, NextResponse } from "next/server";
import { notifySlack } from "@/lib/slack";

export async function POST(request: NextRequest) {
  const body = await request.json();

  await notifySlack(body);

  return NextResponse.json({ status: "sent" });
}
