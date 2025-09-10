import React from 'react';
import { View, Text } from 'react-native';
import styles from './ProductInfo.styles';
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
        style={styles.statusIcon}
      />
      <Text style={styles.text}>
        Available:{' '}
        <Text style={styles.highlight}>{availableQuantity || 0}</Text>
      </Text>
    </View>
  );
};

export default ProductInfo;
