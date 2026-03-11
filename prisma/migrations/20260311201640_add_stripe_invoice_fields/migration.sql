-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "invoicePdfUrl" TEXT,
ADD COLUMN     "stripeInvoiceId" TEXT;
