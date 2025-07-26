import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { GoogleSheetService } from '../services/GoogleSheetService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BalanceSheetScreen = () => {
  const [balanceData, setBalanceData] = useState<{
    totalPurchase: number;
    totalSales: number;
    inventoryValue: number;
    profit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const spreadsheetId = await AsyncStorage.getItem('spreadsheetId');

      if (!token || !spreadsheetId) {
        Alert.alert('Error', 'Google Sheet not initialized.');
        setLoading(false);
        return;
      }

      const data = await GoogleSheetService.getBalanceSheet(
        spreadsheetId,
        token,
      );
      setBalanceData(data);
      console.log(data, 'data');
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch balance sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
  console.log("download")
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007b83" />
        <Text style={styles.loadingText}>Loading Balance Sheet...</Text>
      </View>
    );
  }

  if (!balanceData) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>No balance sheet data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Balance Sheet</Text>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Purchase</Text>
            <Text style={styles.value}>₹{balanceData.totalPurchase}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Sales</Text>
            <Text style={styles.value}>₹{balanceData.totalSales}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inventory Value</Text>
            <Text style={styles.value}>₹{balanceData.inventoryValue}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profit & Loss</Text>
          <View style={styles.profitRow}>
            {balanceData.profit >= 0 ? (
              <Text style={styles.label}>Profit</Text>
            ) : (
              <Text style={styles.label}>Loss</Text>
            )}
            <Text
              style={[
                styles.value,
                balanceData.profit >= 0 ? styles.profit : styles.loss,
              ]}
            >
              ₹{balanceData.profit}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleDownload}>
        <Text style={styles.buttonText}>Download Balance Sheet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BalanceSheetScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 42,
    backgroundColor: '#f1f3f6',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 25,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ca8eed',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ececec',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  profit: {
    color: '#27ae60',
    fontSize: 18,
    fontWeight: '700',
  },
  loss: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#FC991A',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f6',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  },
  errorText: {
    color: '#e63946',
    fontSize: 16,
    fontWeight: '500',
  },
});
