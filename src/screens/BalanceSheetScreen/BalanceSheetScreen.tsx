import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import styles from './BalanceSheetScreen.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from 'react-native-pdf';
import { GoogleSheetService } from '../../services/spreadsheet/google/GoogleSheetService';
import { generatePDF } from '../../services/documents/PDFGenerator';
import { getBalanceSheetHTML } from '../../services/documents/BalanceSheetHTML';
import LoaderOverlay from '../../components/common/loaderOverlay/LoaderOverlay';

const BalanceSheetScreen = () => {
  const [balanceData, setBalanceData] = useState<{
    totalPurchase: number;
    totalSales: number;
    inventoryValue: number;
    profit: number;
  } | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const spreadsheetId = await AsyncStorage.getItem('spreadsheetId');

      if (!token || !spreadsheetId) {
        Alert.alert('Error', 'Google Sheet not initialized.');
        return;
      }

      const data = await GoogleSheetService.getBalanceSheet(
        spreadsheetId,
        token,
      );
      setBalanceData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch balance sheet.');
    }
  };

  const handleDownload = async () => {
    if (!balanceData) return;
    setLoading(true);
    try {
      const filePath = await generatePDF(getBalanceSheetHTML(balanceData));
      if (filePath) {
        setPdfPath(filePath);
      }
    } catch {
      Alert.alert('Error', 'Failed to generate PDF.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Balance Sheet</Text>

      <TouchableOpacity style={styles.button} onPress={handleDownload}>
        <Text style={styles.buttonText}>Generate & Show PDF</Text>
      </TouchableOpacity>

      {loading && <LoaderOverlay visible={loading} />}

      {pdfPath && (
        <View style={styles.pdfContainer}>
          <Pdf source={{ uri: `file://${pdfPath}` }} style={styles.pdfViewer} />
        </View>
      )}
    </ScrollView>
  );
};

export default BalanceSheetScreen;
