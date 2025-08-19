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

  const getHTMLContent = () => {
    if (!balanceData) return '';

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Balance Sheet</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
      h1 { text-align: center; margin-bottom: 5px; }
      .header { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #444; padding: 6px 8px; font-size: 12px; }
      th { background-color: #f2e6ff; text-align: center; }
      .section-title { font-weight: bold; background: #fce5cd; text-align: left; }
      .sub-section { font-weight: bold; background: #f9f9f9; }
      .right { text-align: right; }
    </style>
  </head>
  <body>
    <h1>BALANCE SHEET</h1>
    <div class="header">
      <p><b>Balance Sheet as at:</b> ${new Date().toLocaleDateString()}</p>
    </div>

    <table>
      <tr>
        <th colspan="2">Particulars</th>
        <th>Figures as at the end of current reporting period</th>
        <th>Figures as at the end of previous reporting period</th>
        <th colspan="2">Particulars</th>
        <th>Figures as at the end of current reporting period</th>
        <th>Figures as at the end of previous reporting period</th>
      </tr>

      <!-- EQUITY & LIABILITIES -->
      <tr>
        <td colspan="4" class="section-title">I. EQUITY AND LIABILITIES</td>
        <td colspan="4" class="section-title">II. ASSETS</td>
      </tr>

      <!-- Shareholder's funds -->
      <tr>
        <td colspan="4" class="sub-section">(1) Shareholder’s Funds</td>
        <td colspan="4" class="sub-section">(1) Non-current Assets</td>
      </tr>
      <tr>
        <td>(a) Share Capital</td><td></td><td class="right">₹${
          balanceData.totalPurchase
        }</td><td class="right">-</td>
        <td>(a) Fixed Assets</td><td>(i) Tangible Assets</td><td class="right">₹${
          balanceData.inventoryValue
        }</td><td class="right">-</td>
      </tr>
      <tr>
        <td>(b) Reserves & Surplus</td><td></td><td class="right">₹${
          balanceData.profit
        }</td><td class="right">-</td>
        <td></td><td>(ii) Intangible Assets</td><td></td><td></td>
      </tr>

      <!-- Non-current liabilities -->
      <tr>
        <td colspan="4" class="sub-section">(2) Non-current Liabilities</td>
        <td colspan="4" class="sub-section">(2) Current Assets</td>
      </tr>
      <tr>
        <td>(a) Long-term borrowings</td><td></td><td></td><td></td>
        <td>(a) Inventories</td><td></td><td class="right">₹${
          balanceData.inventoryValue
        }</td><td>-</td>
      </tr>
      <tr>
        <td>(b) Deferred tax liabilities</td><td></td><td></td><td></td>
        <td>(b) Cash & Bank</td><td></td><td class="right">₹${
          balanceData.totalSales
        }</td><td>-</td>
      </tr>

      <!-- Current liabilities -->
      <tr>
        <td colspan="4" class="sub-section">(3) Current Liabilities</td>
        <td></td><td></td><td></td><td></td>
      </tr>
      <tr>
        <td>(a) Trade Payables</td><td></td><td class="right">₹${
          balanceData.totalPurchase
        }</td><td>-</td>
        <td></td><td></td><td></td><td></td>
      </tr>

      <!-- Totals -->
      <tr>
        <td colspan="2"><b>Total Liabilities & Equity</b></td><td class="right"><b>₹${
          balanceData.totalPurchase + balanceData.profit
        }</b></td><td>-</td>
        <td colspan="2"><b>Total Assets</b></td><td class="right"><b>₹${
          balanceData.inventoryValue + balanceData.totalSales
        }</b></td><td>-</td>
      </tr>
    </table>

    <p style="text-align:center; font-size:12px; color:#555; margin-top:30px;">Generated by Hisab Kitab App</p>
  </body>
  </html>
  `;
  };

  const handleDownload = async () => {
    if (!balanceData) return;
    const filePath = await generatePDF(getHTMLContent());
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
