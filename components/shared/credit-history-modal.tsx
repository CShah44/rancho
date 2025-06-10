"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown, X } from "lucide-react";
import { format } from "date-fns";

interface CreditTransaction {
  id: string;
  type: "purchase" | "usage" | "bonus";
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

interface CreditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditHistoryModal({
  isOpen,
  onClose,
}: CreditHistoryModalProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/credits/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === "purchase" || type === "bonus") {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
    return <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800 border-green-200";
      case "usage":
        return "bg-red-100 text-red-800 border-red-200";
      case "bonus":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Coins className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Credit History
              </h2>
              <p className="text-sm text-gray-500">
                Track your credit transactions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Coins className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-500">
                Your credit transactions will appear here
              </p>
            </div>
          ) : (
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {transaction.description}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(transaction.createdAt),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={`${getTransactionColor(
                              transaction.type
                            )} font-medium px-3 py-1 text-xs uppercase tracking-wide`}
                          >
                            {transaction.type}
                          </Badge>
                          <span
                            className={`text-lg font-semibold ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Balance:{" "}
                          <span className="font-medium text-gray-700">
                            {transaction.balanceAfter}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>All transactions are recorded and cannot be modified</p>
            <p>
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
