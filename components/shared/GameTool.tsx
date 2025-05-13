import { Button } from "@/components/ui/button";
import { MemoizedMarkdown } from "./memoized-markdown";
import { Gamepad2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface GameToolResult {
  type: string;
  status: string;
  title: string;
  gameId: string;
  playUrl: string;
  concept: string;
  description: string;
  instructions: string;
}

const GameTool = ({ game, id }: { game: GameToolResult; id: string }) => {
  return (
    <div className="my-4 rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
      {/* Game Preview Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Gamepad2 className="h-6 w-6 text-white mr-2" />
          <h3 className="text-lg font-semibold text-white">{game.title}</h3>
        </div>
        <Link href={game.playUrl} target="_blank">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Play Game <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Game Info */}
      <div className="p-4 bg-zinc-800 text-white">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-zinc-700 rounded-full text-xs">
              {game.concept}
            </span>
            <span className="px-2 py-1 bg-zinc-700 rounded-full text-xs capitalize">
              {game.status === "success"
                ? "Ready to Play"
                : "Error! Please try again"}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-zinc-300 mb-1">
              Description
            </h4>
            <div className="text-sm text-zinc-400">
              <MemoizedMarkdown
                id={`${id}-game-description`}
                content={game.description || "No description available."}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-1">
              Instructions
            </h4>
            <div className="text-sm text-zinc-400">
              <MemoizedMarkdown
                id={`${id}-game-instructions`}
                content={game.instructions || "No instructions available."}
              />
            </div>
          </div>
        </div>

        {/* Game Preview Frame */}
        <div className="mt-4 bg-zinc-900 rounded-lg p-4 border border-zinc-700 flex flex-col items-center justify-center">
          <div className="w-full h-32 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded flex items-center justify-center mb-3">
            <Gamepad2 className="h-10 w-10 text-indigo-400 opacity-70" />
          </div>
          <Link href={game.playUrl}>
            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              Launch Game
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameTool;
