import { NextRequest, NextResponse } from "next/server";
import { searchSolutions } from "@/lib/search";

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const solutions = await searchSolutions(query);

  return NextResponse.json({ solutions, query });
}
