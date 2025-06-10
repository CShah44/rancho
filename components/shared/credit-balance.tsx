"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";

interface CreditBalanceProps {
  showLabel?: boolean;
  className?: string;
}

export function CreditBalance({
  showLabel = true,
  className = "",
}: CreditBalanceProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Coins className="h-4 w-4 animate-pulse" />
        {showLabel && <span className="text-sm">Loading...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coins className="h-4 w-4 text-yellow-500" />
      {showLabel && <span className="text-sm">Credits:</span>}
      <span className="font-medium">{credits ?? 0}</span>
    </div>
  );
}
