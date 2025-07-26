import React from 'react';
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

interface Props {
  onSave: (data: {
    name: string;
    productName: string;
    number: string;
    amount: string;
    quantity: string;
    message: string;
  }) => void;
  onClose: () => void;
}

const TransactionSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  productName: Yup.string().required('Product name is required'),
  // number: Yup.string().required('Number is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .required('Quantity is required'),
  // message: Yup.string(),
});

const TransactionForm: React.FC<Props> = ({ onSave }) => (
  <Formik
    initialValues={{
      name: '',
      productName: '',
      number: '',
      amount: '',
      quantity: '',
      message: '',
    }}
    validationSchema={TransactionSchema}
    onSubmit={(values, { resetForm }) => {
      onSave(values);
      resetForm();
    }}
  >
    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
      <>
        {[
          { name: 'name', icon: 'person-outline', placeholder: 'Name' },
          {
            name: 'productName',
            icon: 'pricetag-outline',
            placeholder: 'Product Name',
          },
          { name: 'number', icon: 'call-outline', placeholder: 'Number' },
          {
            name: 'amount',
            icon: 'cash-outline',
            placeholder: 'Amount',
            keyboardType: 'numeric',
          },
          {
            name: 'quantity',
            icon: 'cube-outline',
            placeholder: 'Quantity',
            keyboardType: 'numeric',
          },
          {
            name: 'message',
            icon: 'chatbubble-outline',
            placeholder: 'Message',
          },
        ].map(({ name, icon, placeholder, keyboardType }) => (
          <View key={name}>
            <View style={styles.inputContainer}>
              <Ionicons
                name={icon as any}
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                placeholder={placeholder}
                style={styles.input}
                keyboardType={keyboardType as any}
                onChangeText={handleChange(name)}
                onBlur={handleBlur(name)}
                value={values[name as keyof typeof values]}
              />
            </View>
            {touched[name as keyof typeof touched] &&
              errors[name as keyof typeof errors] && (
                <Text style={styles.error}>
                  {errors[name as keyof typeof errors]}
                </Text>
              )}
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </>
    )}
  </Formik>
);

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
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  cancelText: { color: 'red', marginTop: 15, textAlign: 'center' },
  error: { color: 'red', fontSize: 12, marginBottom: 5, marginLeft: 5 },
});
