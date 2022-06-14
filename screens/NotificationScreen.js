import React, {useState, useEffect} from 'react';
import {SafeAreaView, Text, ScrollView, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import NotifItem from '../components/notification/NotifItem';

const NotificationScreen = ({navigation, route}) => {
  const email = auth().currentUser.email;
  const [notifAmount, setNotifAmount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(email)
      .collection('notifications')
      .orderBy('time', 'desc')
      .onSnapshot(snapshot => {
        setNotifications(
          snapshot.docs.map(doc => {
            setNotifAmount(notifAmount + 1);
            return {id: doc.id, data: doc.data()};
          }),
        );
      });

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {notifAmount > 0 ? (
          notifications.map(notif => (
            <NotifItem notif={notif} key={notif.id} navigation={navigation} />
          ))
        ) : (
          <Text style={styles.noNotif}>Bạn chưa có thông báo nào</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  header: {
    width: '100%',
    paddingHorizontal: 15,
    alignItems: 'center',
  },

  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  notifItem: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#CCC',
    shadowOffset: {width: -4, height: 4},
    shadowOpacity: 0.25,
  },

  shadow: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    paddingBottom: 15,
    shadowColor: '#CCC',
    shadowOffset: {width: 4, height: -4},
    shadowOpacity: 0.25,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  shadowWhite: {
    backgroundColor: 'white',
  },

  shadowPurple: {
    backgroundColor: 'rgba(137, 106, 243, 0.25)',
  },

  new: {
    position: 'absolute',
    top: -10,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: '#896AF3',
  },

  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 15,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  contentContainer: {
    flex: 1,
  },

  contentView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    fontSize: 16,
  },

  username: {fontWeight: 'bold'},

  time: {
    marginTop: 10,
    color: '#666',
  },

  noNotif: {
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;
