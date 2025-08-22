import { Alert } from "react-native";
import { logInventoryChange } from "./LogInventoryChange";
import { appendData } from "./AppendData";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { getSheetData } from "./GetSheetData";
import { updateInventoryStock } from "./UpdateInventoryStock";

export async function handlePurchase(
  spreadsheetId: string | null,
  accessToken: string,
  data: {
    productName: string;
    purchasingPrice: string;
    quantity: string;
    unit: string;
    file?: { uri: string; name: string; type: string };
  },
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void
) {
  if (!spreadsheetId || !accessToken) return Alert.alert('Sheet not initialized');

  const timestamp = new Date().toLocaleString('en-IN');
  const newQty = parseInt(data.quantity, 10);
  const rowValues = [
    data.productName,
    data.purchasingPrice,
    data.quantity,
    data.unit,
    'No Attachment',
    timestamp,
    '',
    'FALSE',
  ];

  try {
    const purchaseData = await getSheetData(spreadsheetId, accessToken, 'Purchase');
    if (!purchaseData) return Alert.alert('Failed to load purchase data');

    let oldQty = 0;
    const newName = data.productName.trim();

    if (editRowIndex !== undefined) {
      const oldRow = purchaseData[editRowIndex - 2];
      oldQty = parseInt(oldRow?.[2] || '0', 10);
      const oldName = oldRow?.[0]?.trim();

      await markRowAsUpdated(spreadsheetId, accessToken, 'Purchase', editRowIndex);

      if (oldName === newName) {
        // ✅ Update same product row in Inventory with new quantity + new price
        await updateInventoryStock(spreadsheetId, accessToken, {
          productName: newName,
          purchasingPrice: data.purchasingPrice,
          quantity: newQty.toString(), // final stock, not change
          unit: data.unit,
        });
      } else {
        // ✅ Reduce stock of old product
        await updateInventoryStock(spreadsheetId, accessToken, {
          productName: oldName,
          purchasingPrice: data.purchasingPrice,
          quantity: "0", // reset to 0 if product changed
          unit: data.unit,
        });

        // ✅ Add stock to new product
        await updateInventoryStock(spreadsheetId, accessToken, {
          productName: newName,
          purchasingPrice: data.purchasingPrice,
          quantity: newQty.toString(),
          unit: data.unit,
        });
      }
    } else if (newQty > 0) {
      // ✅ New Purchase → add/update Inventory
      await updateInventoryStock(spreadsheetId, accessToken, {
        productName: newName,
        purchasingPrice: data.purchasingPrice,
        quantity: newQty.toString(),
        unit: data.unit,
      });
    }

    // Save/Update purchase row
    const success = await appendData(spreadsheetId, accessToken, 'Purchase', [rowValues]);
    if (!success) return Alert.alert('Failed to save purchase');

    await logInventoryChange(
      spreadsheetId,
      accessToken,
      newName,
      editRowIndex !== undefined ? newQty - oldQty : newQty,
      'Purchase'
    );

    Alert.alert(editRowIndex !== undefined ? 'Purchase updated!' : 'Purchase saved!');
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    console.error('Purchase save/update error:', error);
    Alert.alert('An error occurred while saving the purchase');
  }
}

