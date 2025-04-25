"use client";
import { ChevronUp } from "lucide-react";
import Image from "next/image";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarUserNav({ user }: { user: User }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "data-[state=open]:bg-zinc-800",
                "bg-zinc-950",
                "data-[state=open]:text-zinc-100",
                "text-zinc-300",
                "hover:bg-zinc-800",
                "hover:text-zinc-100",
                "h-10"
              )}
            >
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? "User Avatar"}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className={cn(
              "w-[--radix-popper-anchor-width]",
              "bg-zinc-800",
              "text-zinc-100",
              "border-zinc-700"
            )}
          >
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer hover:bg-zinc-700 hover:text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100"
                onClick={() => {
                  signOut({
                    redirectTo: "/",
                  });
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
