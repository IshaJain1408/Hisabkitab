import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/Store';
import { getSheetData } from '../../services/sheetMethods/GetSheetData';
import { Picker } from '@react-native-picker/picker';

interface Props {
  onSave: (
    data: {
      name: string;
      productName: string;
      number: string;
      amount: string;
      quantity: string;
      unit: string;
      message: string;
    },
    editRowIndex?: number,
  ) => void;
  initialValues?: {
    name: string;
    productName: string;
    number: string;
    amount: string;
    quantity: string;
    unit: string;
    message: string;
  };
  onClose: () => void;
  editRowIndex?: number;
}

const TransactionSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  productName: Yup.string().required('Product name is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required'),
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
  const defaultValues = {
    name: '',
    productName: '',
    number: '',
    amount: '',
    quantity: '',
    unit: '',
    message: '',
  };
  const [inventory, setInventory] = useState<
    { productName: string; unit: string }[]
  >([]);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const spreadsheetId = useSelector(
    (state: RootState) => state.sheet.spreadsheetId,
  );

  useEffect(() => {
    const fetchInventory = async () => {
      if (!accessToken || !spreadsheetId) return;
      try {
        const data = await getSheetData(
          spreadsheetId,
          accessToken,
          'Inventory',
        );
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
      } catch (error) {
        console.error('Fetch inventory error:', error);
      }
    };
    fetchInventory();
  }, [accessToken, spreadsheetId]);

  return (
    <Formik
      initialValues={initialValues || defaultValues}
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
        <>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Name"
              style={styles.input}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
          </View>
          {touched.name && errors.name && (
            <Text style={styles.error}>{errors.name}</Text>
          )}

          <View style={styles.inputContainer}>
            <Ionicons
              name="pricetag-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <Picker
              style={{ flex: 1 }}
              selectedValue={values.productName}
              onValueChange={value => {
                setFieldValue('productName', value);
                const selected = inventory.find(
                  item => item.productName === value,
                );
                if (selected) setFieldValue('unit', selected.unit);
                else setFieldValue('unit', '');
              }}
            >
              <Picker.Item label="Select a product" value="" />
              {inventory.map(item => (
                <Picker.Item
                  key={item.productName}
                  label={item.productName}
                  value={item.productName}
                />
              ))}
            </Picker>
          </View>
          {touched.productName && errors.productName && (
            <Text style={styles.error}>{errors.productName}</Text>
          )}

          {values.unit ? (
            <Text style={styles.unitText}>
              Unit: per {values.unit} {values.quantity || 0}
            </Text>
          ) : null}

          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Number"
              style={styles.input}
              onChangeText={handleChange('number')}
              onBlur={handleBlur('number')}
              value={values.number}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="cash-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Amount"
              style={styles.input}
              keyboardType="numeric"
              onChangeText={handleChange('amount')}
              onBlur={handleBlur('amount')}
              value={values.amount}
            />
          </View>
          {touched.amount && errors.amount && (
            <Text style={styles.error}>{errors.amount}</Text>
          )}

          <View style={styles.inputContainer}>
            <Ionicons
              name="cube-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Quantity"
              style={styles.input}
              keyboardType="numeric"
              onChangeText={handleChange('quantity')}
              onBlur={handleBlur('quantity')}
              value={values.quantity}
            />
          </View>
          {touched.quantity && errors.quantity && (
            <Text style={styles.error}>{errors.quantity}</Text>
          )}

          <View style={styles.inputContainer}>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              placeholder="Message"
              style={styles.input}
              onChangeText={handleChange('message')}
              onBlur={handleBlur('message')}
              value={values.message}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSubmit()}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </>
      )}
    </Formik>
  );
};

export default TransactionForm;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10 },
  button: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 30,
    marginTop: 10,
  },
  unitText: { marginVertical: 5, fontSize: 14, color: '#333' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  cancelText: { color: 'red', marginTop: 15, textAlign: 'center' },
  error: { color: 'red', fontSize: 12, marginBottom: 5, marginLeft: 5 },
});
