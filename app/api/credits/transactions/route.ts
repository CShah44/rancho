import { NextRequest, NextResponse } from "next/server";
import { getCreditTransactionHistory } from "@/lib/db/credit-queries";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const transactions = await getCreditTransactionHistory({
      userId: session.user.id,
      limit,
      offset,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching credit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit history" },
      { status: 500 }
    );
  }
}
