import { NextRequest, NextResponse } from "next/server";
import {
  hasEnoughCredits,
  getVideoGenerationCost,
  getGameGenerationCost,
} from "@/lib/db/credit-queries";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await request.json();

    if (!type || !["video", "game"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid generation type" },
        { status: 400 }
      );
    }

    const requiredCredits =
      type === "video"
        ? await getVideoGenerationCost()
        : await getGameGenerationCost();

    const hasCredits = await hasEnoughCredits(session.user.id, requiredCredits);

    return NextResponse.json({
      hasEnoughCredits: hasCredits,
      requiredCredits,
      type,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
