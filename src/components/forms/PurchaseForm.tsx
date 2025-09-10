import React from 'react';
import { Formik } from 'formik';
import InputField from '../common/InputField/InputField';
import PickerField from '../common/PickerField/PickerField';
import SubmitButton from '../common/SubmitButton/SubmitButton';
import {
  PurchaseFormDefaults,
  PurchaseFormSchema,
} from '../../constants/FormConstants';

interface Props {
  onSave: (data: typeof PurchaseFormDefaults, editRowIndex?: number) => void;
  initialValues?: typeof PurchaseFormDefaults;
  editRowIndex?: number;
}

const PurchaseForm: React.FC<Props> = ({
  onSave,
  initialValues,
  editRowIndex,
}) => {
  return (
    <Formik
      initialValues={initialValues || PurchaseFormDefaults}
      enableReinitialize
      validationSchema={PurchaseFormSchema}
      onSubmit={(values, { resetForm }) => {
        onSave(values, editRowIndex);
        resetForm();
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
