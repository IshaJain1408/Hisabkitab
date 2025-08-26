import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/Store';
import { getSheetData } from '../../services/sheetMethods/GetSheetData';
import InputField from '../common/InputField';
import PickerField from '../common/PickerField';
import SubmitButton from '../common/SubmitButton';
import { TransactionFormValues } from '../../types/Index';
import ProductInfo from '../common/ProductInfo';

interface Props {
  onSave: (data: TransactionFormValues, editRowIndex?: number) => void;
  initialValues?: TransactionFormValues;
  onClose: () => void;
  editRowIndex?: number;
}

const TransactionSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  productName: Yup.string().required('Product name is required'),
  amount: Yup.number()
    .typeError('Selling Price must be a number')
    .required('Selling Price is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .required('Quantity is required'),
});

const TransactionForm: React.FC<Props> = ({
  onSave,
  onClose,
  initialValues,
  editRowIndex,
}) => {
  const [inventory, setInventory] = useState<
    { productName: string; unit: string; quantity: string }[]
  >([]);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const spreadsheetId = useSelector(
    (state: RootState) => state.sheet.spreadsheetId,
  );

  useEffect(() => {
    const fetchInventory = async () => {
      if (!accessToken || !spreadsheetId) return;
      const data = await getSheetData(spreadsheetId, accessToken, 'Inventory');
      if (data) {
        const formatted = data
          .filter(row => row.length && row[0] && row[6] === 'FALSE')
          .map(row => ({
            productName: row[0],
            unit: row[5],
            quantity: row[1] || '',
          }));
        setInventory(formatted);
      }
    };
    fetchInventory();
  }, [accessToken, spreadsheetId]);

  const computedInitialValues = React.useMemo(() => {
    const defaultValues: TransactionFormValues = {
      name: '',
      productName: '',
      number: '',
      amount: '',
      quantity: '',
      unit: '',
      message: '',
      availableQuantity: '',
    };
    if (!initialValues) return defaultValues;
    const selected = inventory.find(
      item => item.productName === initialValues.productName,
    );
    return {
      ...defaultValues,
      ...initialValues,
      unit: selected?.unit || initialValues.unit,
      availableQuantity: selected?.quantity || initialValues.availableQuantity,
    };
  }, [initialValues, inventory]);

  return (
    <Formik
      initialValues={computedInitialValues}
      enableReinitialize
      validationSchema={TransactionSchema}
      onSubmit={(values, { resetForm }) => {
        onSave(values, editRowIndex);
        resetForm();
        onClose();
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
      }) => (
        <View>
          <InputField
            icon="person-outline"
            placeholder="Name"
            value={values.name}
            onChangeText={handleChange('name')}
            onBlur={handleBlur('name')}
            error={touched.name && errors.name ? errors.name : undefined}
          />

          <PickerField
            icon="pricetag-outline"
            selectedValue={values.productName}
            onValueChange={value => {
              setFieldValue('productName', value);
              const selected = inventory.find(
                item => item.productName === value,
              );
              setFieldValue('unit', selected?.unit || '');
              setFieldValue('availableQuantity', selected?.quantity || '');
            }}
            options={[
              { label: 'Select a product', value: '' },
              ...inventory.map(item => ({
                label: item.productName,
                value: item.productName,
              })),
            ]}
            error={
              touched.productName && errors.productName
                ? errors.productName
                : undefined
            }
          />

          <ProductInfo
            unit={values.unit}
            availableQuantity={values.availableQuantity}
          />

          <InputField
            icon="call-outline"
            placeholder="Number"
            value={values.number}
            onChangeText={handleChange('number')}
            onBlur={handleBlur('number')}
          />
          <InputField
            icon="cash-outline"
            placeholder="Selling Price"
            value={values.amount}
            onChangeText={handleChange('amount')}
            onBlur={handleBlur('amount')}
            error={touched.amount && errors.amount ? errors.amount : undefined}
            keyboardType="numeric"
          />
          <InputField
            icon="cube-outline"
            placeholder="Quantity"
            value={values.quantity}
            onChangeText={handleChange('quantity')}
            onBlur={handleBlur('quantity')}
            error={
              touched.quantity && errors.quantity ? errors.quantity : undefined
            }
            keyboardType="numeric"
          />
          <InputField
            icon="chatbubble-outline"
            placeholder="Message"
            value={values.message}
            onChangeText={handleChange('message')}
            onBlur={handleBlur('message')}
          />

          <SubmitButton
            title={editRowIndex !== undefined ? 'Update' : 'Save'}
            onPress={handleSubmit}
          />
        </View>
      )}
    </Formik>
  );
};

export default TransactionForm;
