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
import { Images } from '../../assets/Assets';

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
            title="Purchases"
            color="#FEC27E"
            image={Images.purchase}
            onPress={() => handleCardPress('Purchase')}
          />
          <Card
            title="Sales"
            color="#E2B6FF"
            image={Images.sales}
            onPress={() => handleCardPress('Sales')}
          />
          <Card
            title="Inventory"
            color="#F4F1ED"
            image={Images.inventory}
            onPress={() => handleCardPress('Inventory')}
          />
          <Card
            title="Inventory Logs"
            color="#FFCB91"
            image={Images.history}
            onPress={() => handleCardPress('Inventory Logs')}
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
