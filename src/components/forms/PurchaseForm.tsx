import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface Props {
  onSave: (
    data: {
      productName: string;
      purchasingPrice: string;
      quantity: string;
      unit: string;
      file?: { uri: string; name: string; type: string };
    },
    editRowIndex?: number,
  ) => void;
  onClose: () => void;
  initialValues?: {
    productName: string;
    purchasingPrice: string;
    quantity: string;
    unit: string;
    file?: { uri: string; name: string; type: string };
  };
  editRowIndex?: number;
}

const FormSchema = Yup.object().shape({
  productName: Yup.string().required('Product Name is required'),
  purchasingPrice: Yup.number()
    .required('Purchasing Price is required')
    .typeError('Must be a number'),
  quantity: Yup.number()
    .required('Quantity is required')
    .typeError('Must be a number'),
  unit: Yup.string().required('Unit is required'),
});

const PurchaseForm: React.FC<Props> = ({
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
    file: undefined,
  };

  return (
    <Formik
      initialValues={initialValues || defaultValues}
      enableReinitialize
      validationSchema={FormSchema}
      onSubmit={(values, { resetForm }) => {
        console.log(values, 'values');
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

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={values.unit}
              onValueChange={itemValue => setFieldValue('unit', itemValue)}
            >
              <Picker.Item label="pcs" value="pcs" />
              <Picker.Item label="kg" value="kg" />
              <Picker.Item label="litre" value="litre" />
              <Picker.Item label="box" value="box" />
            </Picker>
          </View>
          {touched.unit && errors.unit && (
            <Text style={styles.error}>{errors.unit}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSubmit()}
          >
            <Text style={styles.buttonText}>
              {editRowIndex !== undefined ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </Formik>
  );
};

export default PurchaseForm;

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
});
