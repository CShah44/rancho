import { db } from ".";
import {
  users,
  creditPackages,
  creditTransactions,
  paymentTransactions,
  type CreditPackage,
  type CreditTransaction,
  type PaymentTransaction,
  CREDIT_COSTS,
} from "./schema";
import { eq, desc } from "drizzle-orm";

// User credit operations
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));

    return user?.credits || 0;
  } catch (error) {
    console.error("Failed to get user credits:", error);
    throw error;
  }
}

export async function addCredits({
  userId,
  amount,
  description,
  relatedId,
}: {
  userId: string;
  amount: number;
  description: string;
  relatedId?: string; // paymentTransactionId
}): Promise<{ success: boolean; newBalance: number }> {
  try {
    // Get current balance
    const [user] = await db
      .select({
        credits: users.credits,
        totalCreditsPurchased: users.totalCreditsPurchased,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = user.credits + amount;
    const newTotalPurchased = user.totalCreditsPurchased + amount;

    // Update user credits
    await db
      .update(users)
      .set({
        credits: newBalance,
        totalCreditsPurchased: newTotalPurchased,
      })
      .where(eq(users.id, userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      type: "purchase",
      amount,
      description,
      relatedId,
      balanceAfter: newBalance,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("Failed to add credits:", error);
    throw error;
  }
}

export async function deductCredits({
  userId,
  amount,
  description,
  relatedId,
}: {
  userId: string;
  amount: number;
  description: string;
  relatedId?: string;
}): Promise<{ success: boolean; newBalance: number }> {
  try {
    // Get current balance
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || user.credits < amount) {
      throw new Error("Insufficient credits");
    }

    const newBalance = user.credits - amount;

    // Update user credits
    await db
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.id, userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      type: "usage",
      amount: -amount,
      description,
      relatedId,
      balanceAfter: newBalance,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    throw error;
  }
}

// Credit packages
export async function getActiveCreditPackages(): Promise<CreditPackage[]> {
  try {
    return await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.isActive, true))
      .orderBy(creditPackages.credits);
  } catch (error) {
    console.error("Failed to get credit packages:", error);
    throw error;
  }
}

export async function getCreditPackageById(
  id: string
): Promise<CreditPackage | null> {
  try {
    const [package_] = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.id, id));

    return package_ || null;
  } catch (error) {
    console.error("Failed to get credit package:", error);
    throw error;
  }
}

// Credit transactions
export async function getCreditTransactionHistory({
  userId,
  limit = 20,
  offset = 0,
}: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<CreditTransaction[]> {
  try {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Failed to get credit transaction history:", error);
    throw error;
  }
}

// Payment transactions
export async function createPaymentTransaction({
  userId,
  razorpayOrderId,
  packageId,
  amount,
  currency = "INR",
}: {
  userId: string;
  razorpayOrderId: string;
  packageId: string;
  amount: number;
  currency?: string;
}): Promise<PaymentTransaction> {
  try {
    const [transaction] = await db
      .insert(paymentTransactions)
      .values({
        userId,
        razorpayOrderId,
        packageId,
        amount: amount.toString(),
        currency,
        status: "created",
      })
      .returning();

    return transaction;
  } catch (error) {
    console.error("Failed to create payment transaction:", error);
    throw error;
  }
}

export async function updatePaymentTransaction({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  status,
  creditsAwarded,
}: {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  creditsAwarded?: number;
}): Promise<PaymentTransaction> {
  try {
    const updateData: any = {
      status,
      ...(razorpayPaymentId && { razorpayPaymentId }),
      ...(razorpaySignature && { razorpaySignature }),
      ...(creditsAwarded && { creditsAwarded }),
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const [transaction] = await db
      .update(paymentTransactions)
      .set(updateData)
      .where(eq(paymentTransactions.razorpayOrderId, razorpayOrderId))
      .returning();

    return transaction;
  } catch (error) {
    console.error("Failed to update payment transaction:", error);
    throw error;
  }
}

export async function getPaymentTransactionByOrderId(
  razorpayOrderId: string
): Promise<PaymentTransaction | null> {
  try {
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.razorpayOrderId, razorpayOrderId));

    return transaction || null;
  } catch (error) {
    console.error("Failed to get payment transaction:", error);
    throw error;
  }
}

// Utility functions
export async function hasEnoughCredits(
  userId: string,
  requiredCredits: number
): Promise<boolean> {
  try {
    const userCredits = await getUserCredits(userId);
    return userCredits >= requiredCredits;
  } catch (error) {
    console.error("Failed to check credits:", error);
    return false;
  }
}

export async function getVideoGenerationCost(): Promise<number> {
  return CREDIT_COSTS.VIDEO;
}

export async function getGameGenerationCost(): Promise<number> {
  return CREDIT_COSTS.GAME;
}

// Initialize default credit packages (run this once)
export async function initializeCreditPackages(): Promise<void> {
  try {
    const existingPackages = await getActiveCreditPackages();

    if (existingPackages.length === 0) {
      await db.insert(creditPackages).values([
        {
          name: "Starter Pack",
          credits: 50,
          price: "99.00", // ₹99
          currency: "INR",
          isActive: true,
        },
        {
          name: "Popular Pack",
          credits: 150,
          price: "249.00", // ₹249
          currency: "INR",
          isActive: true,
        },
        {
          name: "Pro Pack",
          credits: 350,
          price: "499.00", // ₹1499
          currency: "INR",
          isActive: true,
        },
        {
          name: "Business Pack",
          credits: 1000,
          price: "1799.00", // ₹3999
          currency: "INR",
          isActive: true,
        },
      ]);
    }
  } catch (error) {
    console.error("Failed to initialize credit packages:", error);
    throw error;
  }
}
