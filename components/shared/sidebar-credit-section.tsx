"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, History, ChevronDown, Coins } from "lucide-react";
import { CreditBalance } from "./credit-balance";
import { CreditHistoryModal } from "./credit-history-modal";
import { useRouter } from "next/navigation";

export function SidebarCreditSection() {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            {/* <CreditBalance /> */}
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-300 h-4 w-4" />
              <span>Manage Credits</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Credit Management</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Display credit balance */}
          <div className="px-2 py-1 text-xs ">
            <div className="flex items-center gap-2">
              <CreditBalance className="text-sm" />
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => router.push("/purchase")}>
            <Plus className="h-4 w-4 mr-2" />
            Purchase Credits
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowHistoryModal(true)}>
            <History className="h-4 w-4 mr-2" />
            Transaction History
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="px-2 py-1 text-xs text-muted-foreground">
            <div>Video: 5 credits</div>
            <div>Game: 10 credits</div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreditHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </>
  );
}
