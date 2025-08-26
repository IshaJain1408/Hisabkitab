import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  unit: string;
  availableQuantity?: string | number;
}

const ProductInfo: React.FC<Props> = ({ unit, availableQuantity }) => {
  if (!unit) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cube-outline" size={18} color="#CC8FEC" />
      <Text style={styles.text}>
        per <Text style={styles.highlight}>{unit}</Text>
      </Text>

      <Ionicons
        name="checkmark-circle-outline"
        size={18}
        color="#CC8FEC"
        style={{ marginLeft: 10 }}
      />
      <Text style={styles.text}>
        Available:{' '}
        <Text style={styles.highlight}>{availableQuantity || 0}</Text>
      </Text>
    </View>
  );
};

export default ProductInfo;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FFA500',
  },
});
