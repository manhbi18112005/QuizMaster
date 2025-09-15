import { document } from "@/modules/api";
import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET() {
  return NextResponse.json(document);
}