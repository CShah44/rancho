"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Gamepad2,
  RefreshCcw,
  Maximize,
  Minimize,
} from "lucide-react";

// Define the GameData interface based on the backend structure
interface GameData {
  title: string;
  concept: string;
  difficulty: string;
  gameType: string;
  instructions: string;
  description: string;
  code: string;
}

// Dynamically import the PhaserWrapper component with no SSR
const PhaserWrapper = dynamic(() => import("./PhaserWrapper"), {
  ssr: false,
});

export default function GameClient({
  gameData,
}: {
  gameData: GameData | null;
}) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;

    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle game restart
  const handleRestart = () => {
    // Re-fetch the game data to restart the game
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white pb-12">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
            <h1 className="text-xl font-bold ml-4 text-white">
              {gameData?.title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              className="text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        {/* Game Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Game Details */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow-lg h-full">
              <div className="flex items-center mb-4">
                <Gamepad2 className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">Game Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400">Concept</h3>
                  <p className="text-white">{gameData?.concept}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400">
                    Difficulty
                  </h3>
                  <span className="inline-block px-2 py-1 bg-zinc-700 rounded-full text-xs capitalize mt-1">
                    {gameData?.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400">
                    Game Type
                  </h3>
                  <span className="inline-block px-2 py-1 bg-zinc-700 rounded-full text-xs capitalize mt-1">
                    {gameData?.gameType}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400">
                    Description
                  </h3>
                  <p className="text-zinc-300 text-sm mt-1">
                    {gameData?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">How to Play</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300">{gameData?.instructions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div
          ref={gameContainerRef}
          className="bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 bg-zinc-800 border-b border-zinc-700">
            <h2 className="text-lg font-medium">Game Canvas</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div
            className={`phaser-container-wrapper ${
              isFullscreen ? "fullscreen" : ""
            }`}
            style={{ height: "600px", width: "100%" }}
          >
            {gameData?.code && <PhaserWrapper gameCode={gameData.code} />}
          </div>
        </div>
      </div>

      {/* Add some custom styles for fullscreen mode */}
      <style jsx global>{`
        .fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: #18181b;
          width: 100vw !important;
          height: 100vh !important;
        }
      `}</style>
    </div>
  );
}
