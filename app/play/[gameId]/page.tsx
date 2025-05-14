import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameClient from "@/components/shared/GameClient";

// Define the GameData interface based on the backend structure
interface GameData {
  title: string;
  concept: string;
  difficulty: string;
  gameType: string;
  instructions: string;
  description: string;
  code: string;
  id: string;
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  // Server-side data fetching
  let gameData: GameData | null = null;
  const error: string | null = null;

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/games/${gameId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load game data");
    }

    gameData = await response.json();
  } catch (err) {
    console.error("Error fetching game:", err);
    // error = "Failed to load game data";
  }

  // If there's an error, render error UI on the server
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="bg-red-500/20 p-6 rounded-lg border border-red-500/40 mb-6 max-w-md text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <p className="text-zinc-400 mb-6">
            Unable to load the game. Please try again later or return to chat.
          </p>
          <Button
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  // Pass the data to the client component
  return <GameClient gameData={gameData} />;
}
