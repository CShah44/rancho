import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getPaymentTransactionByOrderId,
  updatePaymentTransaction,
  getCreditPackageById,
  addCredits,
} from "@/lib/db/credit-queries";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Update payment as failed
      await updatePaymentTransaction({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "failed",
      });

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get payment transaction
    const paymentTransaction = await getPaymentTransactionByOrderId(
      razorpay_order_id
    );

    if (!paymentTransaction) {
      return NextResponse.json(
        { error: "Payment transaction not found" },
        { status: 404 }
      );
    }

    if (paymentTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized payment verification" },
        { status: 403 }
      );
    }

    if (paymentTransaction.status === "completed") {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    // Get package details
    const creditPackage = await getCreditPackageById(
      paymentTransaction.packageId
    );

    if (!creditPackage) {
      return NextResponse.json(
        { error: "Credit package not found" },
        { status: 404 }
      );
    }

    // Add credits to user account
    const { newBalance } = await addCredits({
      userId: session.user.id,
      amount: creditPackage.credits,
      description: `Purchased ${creditPackage.name}`,
      relatedId: paymentTransaction.id,
    });

    // Update payment transaction as completed
    await updatePaymentTransaction({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "completed",
      creditsAwarded: creditPackage.credits,
    });

    return NextResponse.json({
      success: true,
      creditsAdded: creditPackage.credits,
      newBalance,
      packageName: creditPackage.name,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
