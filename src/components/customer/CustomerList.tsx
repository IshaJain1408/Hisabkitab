// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

// interface CustomerListProps {
//   customers: string[][];
//   onCardPress: () => void;
//   activeTab: string;
// }

// const CustomerList: React.FC<CustomerListProps> = ({
//   customers,
//   onCardPress,
//   activeTab,
// }) => {
//   const groupedBySheet: { [key: string]: string[][] } = {};

//   customers.forEach(row => {
//     const sheetName = row[0];
//     if (!groupedBySheet[sheetName]) {
//       groupedBySheet[sheetName] = [];
//     }
//     groupedBySheet[sheetName].push(row);
//   });

//   const sectionTitles: { [key: string]: string } = {
//     Purchase: 'Purchase History',
//     Sales: 'Sales History',
//     Inventory: 'Inventory Items',
//     'Inventory Log': 'Inventory Logs',
//   };

//   const filteredData = groupedBySheet[activeTab] || [];

//   const formatDateTime = (input: string) => {
//     try {
//       const [datePart, timePart] = input.split(',').map(part => part.trim());
//       const [month, day, year] = datePart.split('/').map(Number);
//       const [hour, minute] = timePart.split(':').map(Number);

//       const date = new Date(year, month - 1, day, hour, minute);

//       const dayStr = String(day).padStart(2, '0');
//       const monthStr = date.toLocaleString('en-US', { month: 'long' });
//       const yearStr = year;
//       const timeStr = date.toLocaleString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true,
//       });

//       return `${dayStr} ${monthStr} ${yearStr}, ${timeStr}`;
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   return (
//     <ScrollView style={{ flex: 1, padding: 10 }}>
//       {filteredData.length > 0 ? (
//         <View key={activeTab}>
//           <Text style={styles.sectionTitle}>
//             {sectionTitles[activeTab] || activeTab}
//           </Text>

//           {filteredData.map((row, index) => (
//             <View key={index}>
//               {activeTab === 'Inventory Log' && (
//                 <View
//                   style={[
//                     styles.statusContainer,
//                     row[4] === 'Purchase' || row[4] === 'Inventory'
//                       ? styles.added
//                       : styles.removed,
//                   ]}
//                 >
//                   <Text style={styles.statusText}>
//                     {row[4] === 'Purchase' || row[4] === 'Inventory'
//                       ? `Item Added ${formatDateTime(row[3])}`
//                       : `Item Removed ${formatDateTime(row[3])}`}
//                   </Text>
//                 </View>
//               )}

//               <View style={styles.customerCard}>
//                 <View style={{ flex: 1, marginLeft: 10 }}>
//                   {activeTab === 'Purchase' && (
//                     <>
//                       <Text>
//                         {row[4] === 'Purchase' || row[4] === 'Inventory' ? (
//                           <Text style={styles.productName}>
//                             {row[1] || 'No Name'}
//                           </Text>
//                         ) : (
//                           <Text style={styles.productName}>
//                             {row[1] || 'No Name'}
//                           </Text>
//                         )}
//                       </Text>
//                     </>
//                   )}

//                   {activeTab === 'Sales' && (
//                     <>
//                       <Text style={styles.productName}>{row[4]}</Text>
//                     </>
//                   )}

//                   {activeTab === 'Inventory' && (
//                     <>
//                       <Text style={styles.productName}>{row[1]}</Text>
//                     </>
//                   )}

//                   {activeTab === 'Inventory Log' && (
//                     <>
//                       <View style={styles.contentRow}>
//                         <Text style={styles.productName}>{row[1]}</Text>
//                       </View>
//                     </>
//                   )}
//                 </View>

//                 <View style={styles.amountBox}>
//                   <Text style={styles.amountText}>
//                     {activeTab === 'Purchase' && `₹ ${row[2]}`}
//                     {activeTab === 'Sales' && `₹ ${row[6]}`}
//                     {activeTab === 'Inventory' && `Qty ${row[2]}`}
//                     {activeTab === 'Inventory Log' && (`Qty ${row[2]}` || '')}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>
//       ) : (
//         <View style={styles.imageContainer}>
//           <Image
//             source={require('../../assets/empty.png')}
//             style={styles.image}
//             resizeMode="contain"
//           />
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginVertical: 12,
//     marginLeft: 8,
//     color: '#1A1A1A',
//   },

//   customerCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     paddingVertical: 18,
//     paddingHorizontal: 20,
//     marginVertical: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },

//   productName: {
//     fontSize: 17,
//     fontWeight: 600,
//     color: '#1A1A1A',
//   },

//   amountBox: {
//     backgroundColor: '#FFF2E0',
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     minWidth: 80,
//     alignItems: 'center',
//   },

//   amountText: {
//     color: '#F78C1F',
//     fontWeight: '700',
//     fontSize: 15,
//   },

//   customerEmail: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//   },

//   imageContainer: {
//     alignItems: 'center',
//     marginTop: 80,
//   },

//   image: {
//     width: 200,
//     height: 200,
//     resizeMode: 'contain',
//   },

//   statusContainer: {
//     alignSelf: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginTop: 5,
//   },

//   added: {
//     backgroundColor: '#FEEBCB',
//   },

//   removed: {
//     backgroundColor: '#FECBCB',
//   },

//   statusText: {
//     fontWeight: '600',
//     color: '#000',
//   },

//   contentRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   qtyLabel: {
//     color: '#F78C1F',
//     fontWeight: '600',
//     marginRight: 4,
//   },

//   qtyValue: {
//     color: '#F78C1F',
//     fontWeight: '700',
//     fontSize: 14,
//   },
// });

// export default CustomerList;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

interface CustomerListProps {
  customers: string[][];
  onCardPress: () => void;
  activeTab: string;
}

const sectionTitles: Record<string, string> = {
  Purchase: 'Purchase History',
  Sales: 'Sales History',
  Inventory: 'Inventory Items',
  'Inventory Log': 'Inventory Logs',
};

const parseDate = (input: string): Date => {
  try {
    const [datePart, timePart] = input.split(',').map(part => part.trim());
    const [month, day, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return new Date(0); // fallback date for invalid input
  }
};

const formatDateTime = (input: string): string => {
  try {
    const date = parseDate(input);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return 'Invalid Date';
  }
};

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onCardPress,
  activeTab,
}) => {
  const groupedBySheet: Record<string, string[][]> = {};

  customers.forEach(row => {
    const sheet = row[0];
    if (!groupedBySheet[sheet]) groupedBySheet[sheet] = [];
    groupedBySheet[sheet].push(row);
  });

  const filteredData = groupedBySheet[activeTab] || [];

  const sortedData = [...filteredData].sort(
    (a, b) => parseDate(b[3]).getTime() - parseDate(a[3]).getTime(),
  );

  if (sortedData.length === 0) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/empty.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Text style={styles.sectionTitle}>
        {sectionTitles[activeTab] || activeTab}
      </Text>

      {sortedData.map((row, index) => {
        const [sheet, name, qtyOrAmount, dateStr, type, , saleAmount] = row;

        const isAdded = type === 'Purchase' || type === 'Inventory';
        const statusLabel = isAdded ? 'Item Added' : 'Item Removed';

        return (
          <View key={index}>
            {activeTab === 'Inventory Log' && (
              <View
                style={[
                  styles.statusContainer,
                  isAdded ? styles.added : styles.removed,
                ]}
              >
                <Text style={styles.statusText}>
                  {`${statusLabel} ${formatDateTime(dateStr)}`}
                </Text>
              </View>
            )}

            <View style={styles.customerCard}>
              <View style={{ flex: 1, marginLeft: 10 }}>
                {['Purchase', 'Inventory'].includes(activeTab) && (
                  <Text style={styles.productName}>{name || 'No Name'}</Text>
                )}
                {activeTab === 'Sales' && (
                  <Text style={styles.productName}>{type}</Text>
                )}
                {activeTab === 'Inventory Log' && (
                  <Text style={styles.productName}>{name}</Text>
                )}
              </View>

              <View style={styles.amountBox}>
                <Text style={styles.amountText}>
                  {activeTab === 'Purchase' && `₹ ${qtyOrAmount}`}
                  {activeTab === 'Sales' && `₹ ${saleAmount}`}
                  {activeTab === 'Inventory' && `Qty ${qtyOrAmount}`}
                  {activeTab === 'Inventory Log' && `Qty ${qtyOrAmount}`}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 12,
    marginLeft: 8,
    color: '#1A1A1A',
  },
  customerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  amountBox: {
    backgroundColor: '#FFF2E0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  amountText: {
    color: '#F78C1F',
    fontWeight: '700',
    fontSize: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  image: {
    width: 200,
    height: 200,
  },
  statusContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  added: {
    backgroundColor: '#FEEBCB',
  },
  removed: {
    backgroundColor: '#FECBCB',
  },
  statusText: {
    fontWeight: '600',
    color: '#000',
  },
});

export default CustomerList;
