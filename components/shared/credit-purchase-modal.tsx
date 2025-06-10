"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Check, X, Star, Zap } from "lucide-react";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: string;
  currency: string;
  isActive: boolean;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (creditsAdded: number) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function CreditPurchaseModal({
  isOpen,
  onClose,
  onPurchaseComplete,
}: CreditPurchaseModalProps) {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      loadRazorpayScript();
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

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/credits/packages");
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load credit packages");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasing(packageId);

      // Create order
      const orderResponse = await fetch("/api/payment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Rancho Credits",
        description: `Purchase ${orderData.packageName}`,
        order_id: orderData.orderId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              toast.success(
                `Successfully purchased ${verifyData.creditsAdded} credits!`
              );
              onPurchaseComplete?.(verifyData.creditsAdded);
              onClose();
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setPurchasing(null);
            onClose();
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: () => {
            setPurchasing(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to initiate purchase");
      setPurchasing(null);
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${parseFloat(price).toLocaleString()}`;
  };

  const getPopularPackage = () => {
    return packages.find((pkg) => pkg.name.toLowerCase().includes("popular"))
      ?.id;
  };

  const getBestValuePackage = () => {
    if (packages.length === 0) return null;
    return packages.reduce((best, current) => {
      const bestValue = parseFloat(best.price) / best.credits;
      const currentValue = parseFloat(current.price) / current.credits;
      return currentValue < bestValue ? current : best;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 pr-12 sm:pr-0">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl w-fit">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Purchase Credits
              </h2>
              <p className="text-blue-100 text-base sm:text-lg">
                Choose the perfect plan for your needs
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Instant activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>No expiration</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Secure payment</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600">
                Loading packages...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {packages.map((pkg) => {
                const isPopular = pkg.id === getPopularPackage();
                const bestValue = getBestValuePackage();
                const isBestValue = bestValue?.id === pkg.id;
                const isPurchasing = purchasing === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className={`relative group rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isPopular
                        ? "border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-lg"
                        : isBestValue
                        ? "border-green-500 bg-gradient-to-b from-green-50 to-white shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Popular/Best Value Badge */}
                    {(isPopular || isBestValue) && (
                      <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                        <Badge
                          className={`px-2 sm:px-4 py-1 text-xs font-semibold ${
                            isPopular
                              ? "bg-blue-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {isPopular ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                Most Popular
                              </span>
                              <span className="sm:hidden">Popular</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                Best Value
                              </span>
                              <span className="sm:hidden">Best</span>
                            </div>
                          )}
                        </Badge>
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {/* Package Header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {pkg.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                          <Coins
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              isPopular
                                ? "text-blue-500"
                                : isBestValue
                                ? "text-green-500"
                                : "text-yellow-500"
                            }`}
                          />
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {pkg.credits.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          credits
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                          {formatPrice(pkg.price, pkg.currency)}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="p-1 bg-green-100 rounded-full">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                          </div>
                          <span className="text-gray-700">
                            <span className="font-semibold">
                              {Math.floor(pkg.credits / 5)}
                            </span>{" "}
                            video generations
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="p-1 bg-green-100 rounded-full">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                          </div>
                          <span className="text-gray-700">
                            <span className="font-semibold">
                              {Math.floor(pkg.credits / 10)}
                            </span>{" "}
                            game generations
                          </span>
                        </div>
                      </div>

                      {/* Purchase Button */}
                      <Button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={isPurchasing}
                        className={`w-full h-10 sm:h-12 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all duration-200 ${
                          isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                            : isBestValue
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg"
                        }`}
                      >
                        {isPurchasing ? (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                            <span className="hidden sm:inline">
                              Processing...
                            </span>
                            <span className="sm:hidden">...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">
                              Purchase Now
                            </span>
                            <span className="sm:hidden">Buy</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 border-t border-gray-100">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Razorpay Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Instant Delivery</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 space-y-1">
              <p>
                Credits are added instantly to your account and never expire.
              </p>
              <p className="hidden sm:block">
                Video generation costs 5 credits • Game generation costs 10
                credits
              </p>
              <p className="sm:hidden">Video: 5 credits • Game: 10 credits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
