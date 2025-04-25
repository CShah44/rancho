import type { ComponentProps } from "react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SidebarIcon as SidebarLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className={cn("z-10", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            className="md:px-2 md:h-fit text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 border-0"
          >
            <SidebarLeftIcon size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          align="start"
          className="bg-zinc-800 text-zinc-100 border-zinc-700"
        >
          Toggle Sidebar
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
