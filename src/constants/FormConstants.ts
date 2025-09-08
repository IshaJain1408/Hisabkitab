import  * as Yup from 'yup';
import { InventoryData, PurchaseData, TransactionFormValues } from '../types/Index';

export const PurchaseFormDefaults :PurchaseData= {
  productName: '',
  purchasingPrice: '',
  quantity: '',
  unit: 'pcs',
  file: undefined,
};

export const InventoryFormDefaults:InventoryData = {
  productName: '',
  purchasingPrice: '',
  quantity: '',
  unit: 'pcs',
};

export const SaleFormDefaults: TransactionFormValues = {
  name: '',
  productName: '',
  number: '',
  amount: '',
  quantity: '',
  unit: '',
  message: '',
  availableQuantity: '',
};

export const PurchaseFormSchema = Yup.object().shape({
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

export const InventoryFormSchema = Yup.object().shape({
  productName: Yup.string().required('Product Name is required'),
  purchasingPrice: Yup.number().typeError('Must be a number'),
  quantity: Yup.number()
    .required('Quantity is required')
    .typeError('Must be a number')
    .moreThan(0, 'Quantity must be greater than 0'),
});

export const SaleFormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  productName: Yup.string().required('Product name is required'),
  amount: Yup.number()
    .typeError('Selling Price must be a number')
    .required('Selling Price is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .required('Quantity is required')
    .moreThan(0, 'Quantity must be greater than 0'),
});
