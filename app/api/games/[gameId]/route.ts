import { NextResponse } from "next/server";
// import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const gameId = (await params).gameId;

    // Fetch the game data from Cloudinary
    const cloudinaryUrl = `https://res.cloudinary.com/deykgmo5q/raw/upload/games/${gameId}.json`;

    // Fetch the game data from Cloudinary
    const response = await fetch(cloudinaryUrl);

    if (!response.ok) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gameData = await response.json();

    return NextResponse.json(gameData);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game data" },
      { status: 500 }
    );
  }
}
