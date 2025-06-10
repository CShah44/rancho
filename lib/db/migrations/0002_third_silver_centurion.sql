CREATE TABLE "creditPackages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"credits" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creditTransactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" varchar NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"relatedId" text,
	"balanceAfter" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paymentTransactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"razorpayOrderId" text NOT NULL,
	"razorpayPaymentId" text,
	"razorpaySignature" text,
	"packageId" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" varchar DEFAULT 'created' NOT NULL,
	"creditsAwarded" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	CONSTRAINT "paymentTransactions_razorpayOrderId_unique" UNIQUE("razorpayOrderId")
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "credits" SET DEFAULT 100;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "totalCreditsPurchased" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentTransactions" ADD CONSTRAINT "paymentTransactions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentTransactions" ADD CONSTRAINT "paymentTransactions_packageId_creditPackages_id_fk" FOREIGN KEY ("packageId") REFERENCES "public"."creditPackages"("id") ON DELETE no action ON UPDATE no action;