import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PurchaseForm from '../forms/PurchaseForm';
import TransactionForm from '../forms/TransactionForm';
import InventoryForm from '../forms/InventoryForm';

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onSave: (data: {
//     name: string;
//     number: string;
//     amount: string;
//     message: string;
//   }) => void;
//   activeTab: string;
// }
interface Props {
  visible: boolean;
  onClose: () => void;
  activeTab: string;
  onSave: (data: any) => void; // Or type it more specifically
}

// const TransactionSchema = Yup.object().shape({
//   name: Yup.string().required('Name is required'),
//   amount: Yup.number()
//     .required('Amount is required')
//     .typeError('Amount must be a number')
//     .min(1, 'Amount must be at least 1')
//     .max(1000000, 'Amount must not exceed 1,000,000'),
//   number: Yup.string(),
//   message: Yup.string(),
// });
// {
// }

const TransactionModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  activeTab,
}) => {
  {
    console.log(activeTab);
  }

  return (
    // <Modal visible={visible} animationType="slide" transparent>
    //   {/* <View style={styles.overlay}>
    //     <View style={styles.modal}>
    //       <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    //         <Ionicons name="close" size={24} color="#333" />
    //       </TouchableOpacity>

    //       <Text style={styles.title}>Transaction ({activeTab})</Text>

    //       <Formik
    //         initialValues={{
    //           name: '',
    //           number: '',
    //           amount: '',
    //           message: '',
    //         }}
    //         validationSchema={TransactionSchema}
    //         onSubmit={(values, { resetForm }) => {
    //           onSave(values);
    //           resetForm();
    //         }}
    //       >
    //         {({
    //           handleChange,
    //           handleBlur,
    //           handleSubmit,
    //           values,
    //           errors,
    //           touched,
    //         }) => (
    //           <>
    //             <View style={styles.inputContainer}>
    //               <Ionicons
    //                 name="person-outline"
    //                 size={20}
    //                 color="#666"
    //                 style={styles.icon}
    //               />
    //               <TextInput
    //                 placeholder="Name"
    //                 style={styles.input}
    //                 onChangeText={handleChange('name')}
    //                 onBlur={handleBlur('name')}
    //                 value={values.name}
    //               />
    //             </View>
    //             {touched.name && errors.name && (
    //               <Text style={styles.error}>{errors.name}</Text>
    //             )}

    //             <View style={styles.inputContainer}>
    //               <Ionicons
    //                 name="call-outline"
    //                 size={20}
    //                 color="#666"
    //                 style={styles.icon}
    //               />
    //               <TextInput
    //                 placeholder="Number"
    //                 style={styles.input}
    //                 onChangeText={handleChange('number')}
    //                 onBlur={handleBlur('number')}
    //                 value={values.number}
    //               />
    //             </View>

    //             <View style={styles.inputContainer}>
    //               <Ionicons
    //                 name="cash-outline"
    //                 size={20}
    //                 color="#666"
    //                 style={styles.icon}
    //               />
    //               <TextInput
    //                 placeholder="Amount"
    //                 style={styles.input}
    //                 keyboardType="numeric"
    //                 maxLength={7}
    //                 onChangeText={handleChange('amount')}
    //                 onBlur={handleBlur('amount')}
    //                 value={values.amount}
    //               />
    //             </View>
    //             {touched.amount && errors.amount && (
    //               <Text style={styles.error}>{errors.amount}</Text>
    //             )}

    //             <View style={styles.inputContainer}>
    //               <Ionicons
    //                 name="chatbubble-ellipses-outline"
    //                 size={20}
    //                 color="#666"
    //                 style={styles.icon}
    //               />
    //               <TextInput
    //                 placeholder="Message"
    //                 style={styles.input}
    //                 onChangeText={handleChange('message')}
    //                 onBlur={handleBlur('message')}
    //                 value={values.message}
    //               />
    //             </View>

    //             <TouchableOpacity
    //               onPress={() => handleSubmit()}
    //               style={styles.button}
    //             >
    //               <Text style={styles.buttonText}>Save</Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity onPress={onClose}>
    //               <Text style={styles.cancelText}>Cancel</Text>
    //             </TouchableOpacity>
    //           </>
    //         )}
    //       </Formik>
    //     </View>
    //   </View> */}
    //   <View style={styles.modal}>
    //     <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    //       <Ionicons name="close" size={24} color="#333" />
    //     </TouchableOpacity>

    //     <Text style={styles.title}>
    //       {activeTab === 'Purchase'
    //         ? 'Add Purchase'
    //         : activeTab === 'Sale'
    //         ? 'Add Sale'
    //         : activeTab === 'Inventory'
    //         ? 'Add Inventory'
    //         : 'Transaction'}
    //     </Text>

    //     {activeTab === 'Purchase' && (
    //       <PurchaseForm onSave={onSave} onClose={onClose} />
    //     )}
    //     {activeTab === 'Sales' && (
    //       <TransactionForm onSave={onSave} onClose={onClose} />
    //     )}
    //     {activeTab === 'Inventory' && (
    //       <InventoryForm onSave={onSave} onClose={onClose} />
    //     )}
    //   </View>
    // </Modal>
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.popupModal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {activeTab === 'Purchase'
              ? 'Add Purchase'
              : activeTab === 'Sales'
              ? 'Add Sale'
              : activeTab === 'Inventory'
              ? 'Add Inventory'
              : 'Transaction'}
          </Text>

          {activeTab === 'Purchase' && (
            <PurchaseForm onSave={onSave} onClose={onClose} />
          )}
          {activeTab === 'Sales' && (
            <TransactionForm onSave={onSave} onClose={onClose} />
          )}
          {activeTab === 'Inventory' && (
            <InventoryForm onSave={onSave} onClose={onClose} />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  // overlay: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  //   padding: 20,
  // },
  // modal: {
  //   backgroundColor: 'white',
  //   borderRadius: 15,
  //   padding: 20,
  //   position: 'relative',
  // },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  popupModal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
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
    marginBottom: 5,
    fontSize: 12,
    marginLeft: 5,
  },
});
