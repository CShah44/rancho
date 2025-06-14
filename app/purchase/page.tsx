"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, Check, Star, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: string;
  currency: string;
  isActive: boolean;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function PurchasePage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPackages();
    loadRazorpayScript();
  }, []);

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

      // Initialize Razorpay with mobile-optimized settings
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
              router.push("/");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setPurchasing(null);
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
          confirm_close: true,
          ondismiss: () => {
            setPurchasing(null);
          },
          animation: true,
          backdrop_close: true,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "Most Used Methods",
                instruments: [
                  {
                    method: "card",
                  },
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: true,
            },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <Coins className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Purchase Credits
                </h1>
                <p className="text-blue-100 text-base sm:text-lg">
                  Choose the perfect plan for your needs
                </p>
              </div>
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-6 text-lg text-gray-600">Loading packages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const isPopular = pkg.id === getPopularPackage();
              const bestValue = getBestValuePackage();
              const isBestValue = bestValue?.id === pkg.id;
              const isPurchasing = purchasing === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`relative group rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isPopular
                      ? "border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-lg"
                      : isBestValue
                      ? "border-green-500 bg-gradient-to-b from-green-50 to-white shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {/* Popular/Best Value Badge */}
                  {(isPopular || isBestValue) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge
                        className={`px-4 py-1 text-xs font-semibold ${
                          isPopular
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {isPopular ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>Most Popular</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span>Best Value</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Package Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Coins
                          className={`h-6 w-6 ${
                            isPopular
                              ? "text-blue-500"
                              : isBestValue
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                        />
                        <span className="text-3xl font-bold text-gray-900">
                          {pkg.credits.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">credits</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {formatPrice(pkg.price, pkg.currency)}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-1 bg-green-100 rounded-full">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">
                          <span className="font-semibold">
                            {Math.floor(pkg.credits / 5)}
                          </span>{" "}
                          video generations
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-1 bg-green-100 rounded-full">
                          <Check className="h-3 w-3 text-green-600" />
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
                      className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-200 ${
                        isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                          : isBestValue
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg"
                      }`}
                    >
                      {isPurchasing ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          <span>Purchase Now</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
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
            <div className="text-sm text-gray-500 space-y-2">
              <p>
                Credits are added instantly to your account and never expire.
              </p>
              <p>
                Video generation costs 5 credits • Game generation costs 10
                credits
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
