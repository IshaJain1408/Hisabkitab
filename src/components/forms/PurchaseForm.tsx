import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface Props {
  onSave: (data: {
    productName: string;
    purchasingPrice: string;
    sellingPrice: string;
    quantity: string;
  }) => void;
  onClose: () => void;
}

const FormSchema = Yup.object().shape({
  productName: Yup.string().required('Product Name is required'),
  purchasingPrice: Yup.number()
    .required('Purchasing Price is required')
    .typeError('Must be a number'),
  sellingPrice: Yup.number()
    .required('Selling Price is required')
    .typeError('Must be a number'),
  quantity: Yup.number()
    .required('Quantity is required')
    .typeError('Must be a number'),
});

const TransactionForm: React.FC<Props> = ({ onSave }) => (
  <Formik
    initialValues={{
      productName: '',
      purchasingPrice: '',
      sellingPrice: '',
      quantity: '',
    }}
    validationSchema={FormSchema}
    onSubmit={(values, { resetForm }) => {
      onSave(values);
      resetForm();
    }}
  >
    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
      <>
        <TextInput
          placeholder="Product Name"
          style={styles.input}
          onChangeText={handleChange('productName')}
          onBlur={handleBlur('productName')}
          value={values.productName}
        />
        {touched.productName && errors.productName && (
          <Text style={styles.error}>{errors.productName}</Text>
        )}

        <TextInput
          placeholder="Purchasing Price"
          style={styles.input}
          keyboardType="numeric"
          onChangeText={handleChange('purchasingPrice')}
          onBlur={handleBlur('purchasingPrice')}
          value={values.purchasingPrice}
        />
        {touched.purchasingPrice && errors.purchasingPrice && (
          <Text style={styles.error}>{errors.purchasingPrice}</Text>
        )}

        <TextInput
          placeholder="Selling Price"
          style={styles.input}
          keyboardType="numeric"
          onChangeText={handleChange('sellingPrice')}
          onBlur={handleBlur('sellingPrice')}
          value={values.sellingPrice}
        />
        {touched.sellingPrice && errors.sellingPrice && (
          <Text style={styles.error}>{errors.sellingPrice}</Text>
        )}

        <TextInput
          placeholder="Quantity"
          style={styles.input}
          keyboardType="numeric"
          onChangeText={handleChange('quantity')}
          onBlur={handleBlur('quantity')}
          value={values.quantity}
        />
        {touched.quantity && errors.quantity && (
          <Text style={styles.error}>{errors.quantity}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </>
    )}
  </Formik>
);

export default TransactionForm;

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
});
