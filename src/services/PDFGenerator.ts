import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, Alert } from 'react-native';

export const generatePDF = async (htmlContent: string) => {
  try {
    const fileName = 'HisabKitab_Report.pdf';
    const downloadsPath = Platform.OS === 'android' 
      ? RNFS.DownloadDirectoryPath 
      : RNFS.DocumentDirectoryPath;

    const file = await RNHTMLtoPDF.convert({
      html: htmlContent,
      fileName: 'HisabKitab_Report',
      directory: 'Documents',
    });

    if (!file.filePath) {
      Alert.alert('Error', 'Failed to generate PDF.');
      return null;
    }

    const destPath = `${downloadsPath}/${fileName}`;

    await RNFS.moveFile(file.filePath, destPath);

    Alert.alert('Success', `PDF saved to Downloads:\n${destPath}`);
    return destPath;
  } catch (error) {
    console.error('PDF generation error:', error);
    Alert.alert('Error', 'Failed to save PDF');
    return null;
  }
};
