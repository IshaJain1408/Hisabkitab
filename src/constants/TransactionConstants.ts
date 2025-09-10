export const SheetNames = ['Purchases', 'Sales', 'Inventory', 'Inventory Logs'];

export const SectionTitles: Record<string, string> = {
  Purchases: 'Purchase History',
  Sales: 'Sales History',
  Inventory: 'Inventory Items',
  'Inventory Logs': 'Inventory Logs',
};

export const DeletedColumnIndex: Record<string, number> = {
  Purchases: 7,
  Sales: 9,
  Inventory: 4,
};

export const UpdatedColumnIndex: Record<string, number> = {
  Sales: 10,
  Inventory: 7,
  Purchases: 8,
};

export const TabButtonText: Record<string, string> = {
  Purchases: 'Add Purchase',
  Sales: 'Add Sale',
  Inventory: 'Add Inventory',
};
