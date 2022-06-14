import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ICONS = [
  {
    name: 'Home',
    inactive: require('../../assets/home.png'),
    active: require('../../assets/home-filled.png'),
    navigation: 'HomeScreen',
  },
  {
    name: 'Search',
    inactive: require('../../assets/search.png'),
    active: require('../../assets/search-filled.png'),
    navigation: 'SearchScreen',
  },
  {
    name: 'New Post',
    inactive: require('../../assets/add.png'),
    active: require('../../assets/add.png'),
    navigation: 'NewPostScreen',
  },
  {
    name: 'Notification',
    inactive: require('../../assets/notification.png'),
    active: require('../../assets/notification-filled.png'),
    navigation: 'NotificationScreen',
  },
  {
    name: 'Profile',
    inactive: require('../../assets/profile.png'),
    active: require('../../assets/profile-filled.png'),
    navigation: 'ProfileScreen',
  },
];

const BottomTabs = ({navigation}) => {
  const email = auth().currentUser.email;
  const [activeTab, setActiveTab] = useState('Home');
  const [newNotif, setNewNotif] = useState(0);

  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(email)
      .onSnapshot(snapshot => {
        setNewNotif(snapshot.data().newNotifications);
      });

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shadowStyle = {
    ios: {
      shadowColor: '#896AF3',
      shadowOffset: {
        width: 0,
        height: -5,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
    },
    android: {
      borderColor: '#CCC',
      borderWidth: 2,
    },
  };

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'ios' ? shadowStyle.ios : shadowStyle.android,
      ]}>
      {ICONS.map((icon, index) => {
        if (icon.name !== 'Notification') {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (icon.name !== 'New Post') {
                  setActiveTab(icon.name);
                }
                navigation.navigate(icon.navigation);
              }}>
              <Image
                style={[
                  icon.name === 'New Post' ? styles.addIcon : styles.tabIcon,
                ]}
                source={activeTab === icon.name ? icon.active : icon.inactive}
              />
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setActiveTab(icon.name);
                navigation.navigate(icon.navigation);
              }}>
              {newNotif > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {newNotif > 9 ? '9+' : newNotif}
                  </Text>
                </View>
              )}

              <Image
                style={styles.tabIcon}
                source={activeTab === icon.name ? icon.active : icon.inactive}
              />
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // left: 15,
    // right: 15,
    bottom: 0,
    height: 75,
    width: '100%',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    // paddingBottom: 15,
    // borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },

  tabIcon: {
    width: 30,
    height: 30,
  },

  addIcon: {
    width: 70,
    height: 70,
    top: -37,
  },

  unreadBadge: {
    backgroundColor: '#FF3250',
    position: 'absolute',
    left: 20,
    bottom: 18,
    width: 25,
    height: 25,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },

  unreadBadgeText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default BottomTabs;
