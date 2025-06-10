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
import { Plus, History, ChevronDown } from "lucide-react";
import { CreditBalance } from "./credit-balance";
import { CreditPurchaseModal } from "./credit-purchase-modal";
import { CreditHistoryModal } from "./credit-history-modal";

export function SidebarCreditSection() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);

  const handlePurchaseComplete = (creditsAdded: number) => {
    setCreditBalance((prev) => prev + creditsAdded);
  };

  console.log(creditBalance);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <CreditBalance />
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Credit Management</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowPurchaseModal(true)}>
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

      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
      />

      <CreditHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </>
  );
}
