import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import GradientText from '../../utils/GradientText';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';

const Header = ({navigation}) => {
  const [newMsg, setNewMsg] = useState(0);
  const re = /[\w.+-]+@[\w-]+\.[\w.-]+/;

  // Nếu có người gọi đến thì chuyển sang màn hình Incoming
  useEffect(() => {
    let isSubcribed = true;

    firestore()
      .collection('users')
      .doc(auth().currentUser.email)
      .onSnapshot(snapshot => {
        if (isSubcribed && snapshot) {
          const inCall = snapshot.data().inCall;
          if (inCall && re.test(inCall)) {
            navigation.push('IncomingCallScreen', {email: inCall});
          }
        }
      });

    return () => {
      isSubcribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lấy tổng số tin nhắn mới từ collection chats
  useEffect(() => {
    let isSubcribed = true;

    firestore()
      .collection('users')
      .doc(auth().currentUser.email)
      .collection('chats')
      .onSnapshot(snapshot => {
        if (isSubcribed && snapshot) {
          let count = 0;
          snapshot.docs.map(doc => {
            count += doc.data().newMsg;
          });
          setNewMsg(count);
        }
      });

    return () => {
      isSubcribed = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.headerWrap}>
      <View style={styles.container}>
        {/* <Text style={styles.logo}>D2 Network</Text> */}
        <GradientText style={styles.logo}>D2 Network</GradientText>

        <View style={styles.iconsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('InboxScreen')}
            style={styles.button}>
            {newMsg !== 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {newMsg <= 9 ? newMsg : '9+'}
                </Text>
              </View>
            )}

            <Image
              style={styles.icon}
              source={require('../../assets/message.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    width: '100%',
    height: Platform.OS === 'ios' ? 100 : 55,
    paddingTop: 5,
    backgroundColor: 'white',
  },

  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },

  iconsContainer: {
    flexDirection: 'row',
  },

  logo: {
    fontSize: 30,
    fontWeight: '700',
  },

  button: {
    width: 40,
    height: 40,
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#DDD',
    marginLeft: 10,
  },

  icon: {
    width: '100%',
    height: '100%',
  },

  unreadBadge: {
    backgroundColor: '#FF3250',
    position: 'absolute',
    right: -5,
    bottom: 20,
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

export default Header;
