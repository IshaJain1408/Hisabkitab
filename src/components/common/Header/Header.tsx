import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import styles from './Header.styles';

const { width } = Dimensions.get('window');
const drawerWidth = width * 0.75;

interface HeaderProps {
  userName: string;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, handleLogout }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const navigation = useNavigation<any>();

  const menuItems = [
    { label: 'Purchase', icon: 'cart-outline' },
    { label: 'Sales', icon: 'cash-outline' },
    { label: 'Inventory', icon: 'cube-outline' },
    { label: 'Inventory Log', icon: 'document-text-outline' },
  ];

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: drawerVisible ? 0 : -drawerWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [drawerVisible, slideAnim]);

  useEffect(() => {
    const fetchUserPhoto = async () => {
      const photo = await AsyncStorage.getItem('user_photo');
      setUserPhoto(photo);
    };
    fetchUserPhoto();
  }, []);

  const onMenuItemPress = (tab: string) => {
    setDrawerVisible(false);
    navigation.navigate('TransactionScreen', { selectedTab: tab });
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      {drawerVisible && (
        <View style={styles.drawerContainer}>
          <Pressable
            style={styles.overlay}
            onPress={() => setDrawerVisible(false)}
          />
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={styles.profileSection}>
              <Image
                source={
                  userPhoto
                    ? { uri: userPhoto }
                    : require('../../../assets/Vector.png')
                }
                style={styles.profileImage}
              />
              <View style={styles.nameLocation}>
                <Text style={styles.drawerName}>{userName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDrawerVisible(false)}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {menuItems.map(({ label, icon }) => (
              <TouchableOpacity
                key={label}
                style={styles.menuItem}
                onPress={() => onMenuItemPress(label)}
              >
                <Ionicons
                  name={icon}
                  size={18}
                  color="#000"
                  style={styles.menuIconLeft}
                />
                <Text style={styles.menuItemText}>{label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={18}
                color="#000"
                style={styles.menuIconLeft}
              />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </>
  );
};

export default Header;
