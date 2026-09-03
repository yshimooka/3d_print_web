// 受注の型・定数(クライアント/サーバ共用。fs依存を持たないこと)

// 設計書 5.2 の6段階ステータス
export const ORDER_STATUSES = [
  "received", // 1. 注文確定
  "data_check", // 2. データチェック完了
  "printing", // 3. 製造中
  "in_transit", // 4. 製造完了・輸送中
  "shipped", // 5. 検品完了・発送
  "delivered", // 6. お届け完了
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "注文確定",
  data_check: "データチェック完了",
  printing: "製造中",
  in_transit: "製造完了・輸送中",
  shipped: "検品完了・発送済み",
  delivered: "お届け完了",
  cancelled: "キャンセル",
};

export interface OrderRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  file: { name: string; size: number; storedPath: string; s3Key?: string };
  item: {
    materialId: string;
    materialName: string;
    colorName: string;
    quantity: number;
    volumeCm3: number;
    bboxMm: { x: number; y: number; z: number };
  };
  quote: {
    unitPrice: number;
    printSubtotal: number;
    handlingFee: number;
    shippingFee: number;
    total: number;
  };
  customer: {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    zip: string;
    prefecture: string;
    city: string;
    address: string;
  };
  deliveryEstimate: string;
  // MVP: 決済はモック。Stripe導入時に paymentIntentId 等へ置き換える。
  payment: { method: "card_mock"; status: "authorized_mock" };
  // Notion連携(未設定/失敗時は undefined のまま)
  notionPageId?: string;
}
