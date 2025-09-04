export const parseRowData = (
  activeTab: string,
  rowData: string[]
): Record<string, any> => {
  switch (activeTab) {
    case 'Purchase':
      return {
        productName: rowData[1] || '',
        purchasingPrice: rowData[2] || '',
        quantity: rowData[3] || '',
        unit: rowData[4] || 'pcs',
      };
    case 'Sales':
      return {
        name: rowData[3] || '',
        productName: rowData[4] || '',
        number: rowData[5] || '',
        amount: rowData[6] || '',
        quantity: rowData[7] || '',
        message: rowData[8] || '',
      };
    case 'Inventory':
      return {
        productName: rowData[1] || '',
        purchasingPrice: rowData[5] || '',
        quantity: rowData[2] || '',
        unit: rowData[6] || 'pcs',
      };
    default:
      return {};
  }
};
