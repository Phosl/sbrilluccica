export const INVENTORY_RESERVATION_MINUTES = 30;

export interface InventoryReservationItem {
  variantId: string;
  quantity: number;
}

export interface ReserveInventoryInput {
  checkoutAttemptId: string;
  items: InventoryReservationItem[];
  expiresAt: string;
}

export interface InventoryReservationResult {
  reservationId: string;
  variantId: string;
  quantity: number;
  expiresAt: string;
}

export interface CommitInventoryInput {
  checkoutAttemptId: string;
  orderId: string;
}

export interface ReleaseInventoryInput {
  checkoutAttemptId: string;
  reason: string;
}
