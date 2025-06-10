import { NextResponse } from "next/server";
import { getActiveCreditPackages } from "@/lib/db/credit-queries";

export async function GET() {
  try {
    const packages = await getActiveCreditPackages();
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching credit packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit packages" },
      { status: 500 }
    );
  }
}
