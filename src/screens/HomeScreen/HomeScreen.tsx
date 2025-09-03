import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import styles from './HomeScreen.styles';
import Header from '../../components/common/Header/Header';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/Store';
import { setUser } from '../../redux/slices/UserSlice';
import { useNavigation } from '@react-navigation/native';
import DownloadBalanceSheetButton from '../../components/common/DownloadBalanceSheetButton/DownloadBalanceSheetButton';
import { useTransactionLogic } from '../../hooks/UseTransactionLogic';

type CardProps = {
  title: string;
  color: string;
  image: any;
  onPress: () => void;
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state?.user);
  const { handleLogout } = useTransactionLogic();

  const handleCardPress = (tab: string) => {
    navigation.push('TransactionScreen', { selectedTab: tab });
    dispatch(setUser(user));
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          userName={user?.user?.data?.user?.name || user?.user?.user?.name}
          handleLogout={handleLogout}
        />
        <DownloadBalanceSheetButton />

        <View style={styles.cardContainer}>
          <Card
            title="Purchase"
            color="#FEC27E"
            image={require('../../assets/purchase.png')}
            onPress={() => handleCardPress('Purchase')}
          />
          <Card
            title="Sales"
            color="#E2B6FF"
            image={require('../../assets/sales.png')}
            onPress={() => handleCardPress('Sales')}
          />
          <Card
            title="Inventory"
            color="#F4F1ED"
            image={require('../../assets/Ivt.png')}
            onPress={() => handleCardPress('Inventory')}
          />
          <Card
            title="Inventory Log"
            color="#FFCB91"
            image={require('../../assets/history.png')}
            onPress={() => handleCardPress('Inventory Log')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const Card: React.FC<CardProps> = ({ title, color, image, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Image source={image} style={styles.cardImage} />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

export default HomeScreen;
