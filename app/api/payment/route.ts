import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import {
  getCreditPackageById,
  createPaymentTransaction,
} from "@/lib/db/credit-queries";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    // Get package details
    const creditPackage = await getCreditPackageById(packageId);

    if (!creditPackage || !creditPackage.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive package" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(parseFloat(creditPackage.price) * 100), // Convert to paise
      currency: creditPackage.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        packageId: creditPackage.id,
        userId: session.user.id,
        credits: creditPackage.credits.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    // Save payment transaction
    await createPaymentTransaction({
      userId: session.user.id,
      razorpayOrderId: order.id,
      packageId: creditPackage.id,
      amount: parseFloat(creditPackage.price),
      currency: creditPackage.currency,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packageName: creditPackage.name,
      credits: creditPackage.credits,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
