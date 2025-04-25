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
        "flex sticky top-0 py-1.5 items-center px-2 md:px-4 gap-2 w-full",
        "bg-zinc-900 border-b border-zinc-800 z-10"
      )}
    >
      <div className="flex-1 flex items-center">
        <SidebarToggle />
      </div>

      {(!open || windowWidth < 768) && (
        <div className="flex-1 flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "order-2 md:order-1 px-2 md:h-fit",
                  "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                )}
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
              >
                <PlusIcon />
                <span className="md:sr-only ml-2">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-800 text-zinc-100 border-zinc-700">
              New Chat
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </header>
  );
}
