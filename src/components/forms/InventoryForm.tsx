import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';

interface Props {
  onSave: (
    data: {
      productName: string;
      purchasingPrice: string;
      quantity: string;
      unit: string;
    },
    editRowIndex?: number,
  ) => void;

  onClose: () => void;

  initialValues?: {
    productName: string;
    purchasingPrice: string;
    quantity: string;
    unit: string;
  };

  editRowIndex?: number; // add this here
}

const InventorySchema = Yup.object().shape({
  productName: Yup.string().required('Product Name is required'),
  purchasingPrice: Yup.number().typeError('Must be a number'),
  quantity: Yup.number()
    .required('Quantity is required')
    .typeError('Must be a number'),
});

const InventoryForm: React.FC<Props> = ({
  onSave,
  onClose,
  initialValues,
  editRowIndex,
}) => {
  const defaultValues = {
    productName: '',
    purchasingPrice: '',
    quantity: '',
    unit: 'pcs',
  };

  return (
    <Formik
      initialValues={initialValues || defaultValues}
      validationSchema={InventorySchema}
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
      }) => (
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

          <Picker
            selectedValue={values.unit}
            onValueChange={handleChange('unit')}
            style={styles.picker}
          >
            <Picker.Item label="pcs" value="pcs" />
            <Picker.Item label="kg" value="kg" />
            <Picker.Item label="liters" value="liters" />
          </Picker>
          {touched.unit && errors.unit && (
            <Text style={styles.error}>{errors.unit}</Text>
          )}

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

export default InventoryForm;

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
  picker: {
    height: 50,
    marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  cancelText: { color: 'red', marginTop: 15, textAlign: 'center' },
  error: { color: 'red', fontSize: 12, marginBottom: 5 },
});
