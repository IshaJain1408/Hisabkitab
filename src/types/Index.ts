export interface PurchaseData {
  productName: string;
  purchasingPrice: string;
  quantity: string;
  unit: string;
  file?: { uri: string; name: string; type: string };
}

export interface SaleData {
  name: string;
  productName: string;
  number: string;
  amount: string;
  quantity: string;
  message: string;
}

export interface InventoryData {
  productName: string;
  purchasingPrice: string;
  quantity: string;
  unit?: string;
}


export interface TransactionFormValues {
  name: string;
  productName: string;
  number: string;
  amount: string;
  quantity: string;
  unit: string;
  message: string;
  availableQuantity: string;
}
