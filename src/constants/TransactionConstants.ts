export const SHEET_NAMES = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];

export const SECTION_TITLES: Record<string, string> = {
  Purchase: 'Purchase History',
  Sales: 'Sales History',
  Inventory: 'Inventory Items',
  'Inventory Log': 'Inventory Logs',
};

export const DELETED_COLUMN_INDEX: Record<string, number> = {
  Purchase: 7,
  Sales: 9,
  Inventory: 4,
};

export const UPDATED_COLUMN_INDEX: Record<string, number> = {
  Sales: 10,
  Inventory: 7,
  Purchase: 8,
};

export const TAB_BUTTON_TEXT: Record<string, string> = {
  Purchase: 'Add Purchase',
  Sales: 'Add Sale',
  Inventory: 'Add Inventory',
};
