"use client";

import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/shared/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";

export default function PureChatHeader() {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header
      className={cn(
        "flex sticky top-0 py-2 sm:py-3 items-center px-3 sm:px-4 lg:px-6 gap-3 w-full",
        "bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 z-50",
        "shadow-sm"
      )}
    >
      <div className="flex-1 flex items-center">
        <SidebarToggle />
      </div>

      {/* Logo/Brand - visible on larger screens */}
      <div className="hidden md:flex items-center justify-center flex-1">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm sm:text-base">R</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white font-semibold text-sm sm:text-base tracking-wide">
              Rancho
            </span>
            <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
              BETA
            </span>
          </div>
        </div>
      </div>

      {(!open || windowWidth < 768) && (
        <div className="flex-1 flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 sm:h-9 px-2 sm:px-3 rounded-xl",
                  "text-zinc-300 hover:text-white hover:bg-zinc-800/60",
                  "border border-zinc-700/50 hover:border-zinc-600/50",
                  "transition-all duration-200 shadow-sm hover:shadow-md"
                )}
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
              >
                <PlusIcon size={16} />
                <span className="hidden sm:inline ml-2 text-sm">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-zinc-800 text-zinc-100 border-zinc-700 text-xs"
              side="bottom"
            >
              Start a new conversation
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </header>
  );
}
