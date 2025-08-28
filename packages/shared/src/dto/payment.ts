export type PaymentStatus = "PENDING" | "SUCCEEDED" | "CANCELED" | "FAILED";

export type PaymentDTO = {
  id: string;
  orderId: string;
  provider: "kaspi";
  status: PaymentStatus;
  amountKzt: number;
  externalId?: string | null;
  paymentUrl?: string | null;
  qrImageUrl?: string | null;
};

export type KaspiInitResponse = {
  paymentId: string;
  status: PaymentStatus;
  qrImageUrl?: string | null;
  paymentUrl?: string | null;
};

export type PaymentStatusResponse = {
  status: PaymentStatus;
};

export type CancelPaymentResponse = {
  status: "CANCELED";
};

export type RefundRequest = {
  amountKzt?: number;
};

export type RefundResponse = {
  refundId: string;
  status: "REFUND_PENDING" | "REFUNDED";
};
