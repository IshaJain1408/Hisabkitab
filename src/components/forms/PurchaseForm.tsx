import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import InputField from '../common/inputField/InputField';
import PickerField from '../common/pickerField/PickerField';
import SubmitButton from '../common/submitButton/SubmitButton';

interface Props {
  onSave: (
    data: {
      productName: string;
      purchasingPrice: string;
      quantity: string;
      unit: string;
      file?: any;
    },
    editRowIndex?: number,
  ) => void;
  onClose: () => void;
  initialValues?: {
    productName: string;
    purchasingPrice: string;
    quantity: string;
    unit: string;
    file?: any;
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
    .typeError('Must be a number')
    .moreThan(0, 'Quantity must be greater than 0'),
  unit: Yup.string().required('Unit is required'),
});

const PurchaseForm: React.FC<Props> = ({
  onSave,
  // onClose,
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
        onSave(values, editRowIndex);
        resetForm();
        // onClose();
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
          <InputField
            icon="pricetag-outline"
            placeholder="Product Name"
            value={values.productName}
            onChangeText={handleChange('productName')}
            onBlur={handleBlur('productName')}
            error={
              touched.productName && errors.productName
                ? errors.productName
                : undefined
            }
          />
          <InputField
            icon="cash-outline"
            placeholder="Purchasing Price"
            value={values.purchasingPrice}
            onChangeText={handleChange('purchasingPrice')}
            onBlur={handleBlur('purchasingPrice')}
            error={
              touched.purchasingPrice && errors.purchasingPrice
                ? errors.purchasingPrice
                : undefined
            }
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

          <PickerField
            icon="layers-outline"
            selectedValue={values.unit}
            onValueChange={value => setFieldValue('unit', value)}
            options={[
              { label: 'pcs', value: 'pcs' },
              { label: 'kg', value: 'kg' },
              { label: 'litre', value: 'litre' },
              { label: 'box', value: 'box' },
            ]}
            error={touched.unit && errors.unit ? errors.unit : undefined}
          />

          <SubmitButton
            title={editRowIndex !== undefined ? 'Update' : 'Save'}
            onPress={handleSubmit}
          />
        </>
      )}
    </Formik>
  );
};

export default PurchaseForm;
