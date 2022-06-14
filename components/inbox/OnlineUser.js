import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const OnlineUser = ({navigation}) => {
  const [onlineUser, setOnlineUser] = useState([]);

  useEffect(() => {
    try {
      let isSubcribed = true;

      firestore()
        .collection('users')
        .where('online', '==', true)
        .onSnapshot(snapshot => {
          if (isSubcribed) {
            setOnlineUser(
              snapshot.docs.map(item => {
                if (item.id !== auth().currentUser.email) {
                  return {
                    id: item.id,
                    data: item.data(),
                  };
                }
              }),
            );
          }
        });

      return () => {
        isSubcribed = false;
        console.log('[SYS] Clean up - Inbox');
      };
    } catch (error) {
      console.log('[SYS] Permission denied - Inbox');
    }
  }, []);

  const enterChat = email => {
    firestore()
      .collection('users')
      .doc(auth().currentUser.email)
      .collection('chats')
      .get()
      .then(snapshot => {
        let found = false;
        for (let index = 0; index < snapshot.docs.length; index++) {
          if (snapshot.docs[index].id === email) {
            found = true;
            break;
          }
        }
        if (found) {
          firestore()
            .collection('users')
            .doc(auth().currentUser.email)
            .collection('chats')
            .doc(email)
            .update({
              inChat: true,
              newMsg: 0,
            })
            .then(() => navigation.navigate('ChatScreen', {email: email}));
        } else {
          firestore()
            .collection('users')
            .doc(auth().currentUser.email)
            .collection('chats')
            .doc(email)
            .set({
              inChat: true,
              newMsg: 0,
            })
            .then(() => {
              firestore()
                .collection('users')
                .doc(email)
                .collection('chats')
                .doc(auth().currentUser.email)
                .set({
                  inChat: false,
                  newMsg: 0,
                })
                .then(() => navigation.navigate('ChatScreen', {email: email}));
            });
        }
      });
  };

  return (
    <View style={styles.onlineUserContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.userOnline}>
          <View style={styles.newMsgIconContainer}>
            <Image
              source={require('../../assets/new-message.png')}
              style={styles.newMsgIcon}
            />
          </View>

          <Text style={styles.text}>Tạo mới</Text>
        </TouchableOpacity>
        {onlineUser.map(
          (user, index) =>
            user && (
              <TouchableOpacity
                key={index}
                style={styles.userOnline}
                onPress={() => enterChat(user.id)}>
                <View style={styles.userImageContainer}>
                  <Image
                    source={{uri: user.data.profilePicture}}
                    style={styles.userImage}
                  />
                  <View style={styles.onlineIconContainer}>
                    <View style={styles.onlineIcon} />
                  </View>
                </View>

                <Text numberOfLines={1} style={styles.text}>
                  {user.data.username}
                </Text>
              </TouchableOpacity>
            ),
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Online user
  onlineUserContainer: {
    flexDirection: 'row',
    paddingBottom: 15,
    borderBottomWidth: 0.2,
    borderBottomColor: 'gray',
  },

  newMsgIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEDEF',
  },

  newMsgIcon: {
    width: 30,
    height: 30,
  },

  userOnline: {
    width: 70,
    marginLeft: 15,
    alignItems: 'center',
  },

  userImageContainer: {
    width: 70,
    height: 70,
    padding: 2,
    borderRadius: 50,
  },

  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  addIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    bottom: 2,
    right: 0,
    zIndex: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
  },

  onlineIconContainer: {
    padding: 4,
    position: 'absolute',
    bottom: -5,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 13,
  },

  onlineIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#5EC027',
    borderRadius: 10,
  },

  text: {
    marginTop: 5,
    textAlign: 'center',
  },
});

export default OnlineUser;
