"use client";

import type { User } from "next-auth";
import { useRouter } from "next/navigation";

import { PlusIcon } from "lucide-react";
import { SidebarHistory } from "@/components/shared/sidebar-history";
import { SidebarUserNav } from "@/components/shared/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { SidebarToggle } from "./sidebar-toggle";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { data: session } = useSession();
  const user = session?.user as User;
  const router = useRouter();
  const { setOpenMobile, open } = useSidebar();

  return (
    <div className="flex relative">
      <Sidebar
        className={cn(
          "group-data-[side=left]:border-r-0",
          "bg-zinc-950 text-zinc-100"
        )}
      >
        <SidebarHeader className="border-b border-zinc-800 bg-zinc-950">
          <SidebarMenu>
            <div className="flex flex-row justify-between items-center">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="flex flex-row gap-3 items-center"
              >
                <span className="text-lg font-semibold px-2 hover:bg-zinc-800 rounded-md cursor-pointer text-zinc-100">
                  RANCHO
                </span>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/");
                      router.refresh();
                    }}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  align="end"
                  className="bg-zinc-800 text-zinc-100 border-zinc-700"
                >
                  New Chat
                </TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="bg-zinc-950">
          <SidebarHistory user={user} />
        </SidebarContent>
        <SidebarFooter className="border-t border-zinc-800 bg-zinc-900">
          {user && <SidebarUserNav user={user} />}
        </SidebarFooter>
      </Sidebar>

      {/* Position the toggle button relative to the sidebar */}
      <SidebarToggle
        className={cn(
          "absolute top-4 z-20 bg-zinc-950 rounded-md",
          open ? "left-[calc(100%+7px)]" : "left-4 md:left-6"
        )}
      />
    </div>
  );
}
