import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { GoogleSheetService } from '../services/GoogleSheetService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generatePDF } from '../services/PDFGenerator';
import Pdf from 'react-native-pdf';
import { getBalanceSheetHTML } from '../services/BalanceSheetHTML';

const BalanceSheetScreen = () => {
  const [balanceData, setBalanceData] = useState<{
    totalPurchase: number;
    totalSales: number;
    inventoryValue: number;
    profit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

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
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch balance sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!balanceData) return;
    const filePath = await generatePDF(getBalanceSheetHTML(balanceData));
    if (filePath) {
      setPdfPath(filePath);
      Alert.alert('Success', `PDF saved:\n${filePath}`);
    }
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Balance Sheet</Text>

      <TouchableOpacity style={styles.button} onPress={handleDownload}>
        <Text style={styles.buttonText}>Generate & Show PDF</Text>
      </TouchableOpacity>

      {pdfPath && (
        <View
          style={{
            height: Dimensions.get('window').height * 0.7,
            marginTop: 20,
          }}
        >
          <Pdf source={{ uri: `file://${pdfPath}` }} style={{ flex: 1 }} />
        </View>
      )}
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
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  button: {
    backgroundColor: '#FC991A',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
});
