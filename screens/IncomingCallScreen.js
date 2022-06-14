/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const IncomingCallScreen = ({route, navigation}) => {
  const {email} = route.params;
  const [user, setUser] = useState();
  const [seconds, setSeconds] = useState(0);

  // Nếu sau 30s người nhận không phản hồi thì tính là cuộc gọi nhỡ
  useEffect(() => {
    let interval = setInterval(() => {
      if (seconds >= 30) {
        missCall();
      }
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // Lắng nghe người gửi có huỷ cuộc gọi hay không
  useEffect(() => {
    let isSubcribed = true;

    firestore()
      .collection('users')
      .doc(email)
      .onSnapshot(snapshot => {
        if (isSubcribed && snapshot) {
          // Nếu người gửi huỷ cuộc gọi
          if (snapshot.data().inCall === 'cancel') {
            firestore()
              .collection('users')
              .doc(email)
              .update({inCall: firestore.FieldValue.delete()})
              .then(() => navigation.goBack());
          } else {
            setUser(snapshot.data());
          }
        }
      });

    return () => {
      isSubcribed = false;
    };
  }, [email]);

  // Hàm chấp nhận cuộc gọi
  const accept = () => {
    firestore()
      .collection('users')
      .doc(auth().currentUser.email)
      .update({
        inCall: 'connecting',
      })
      .then(() =>
        navigation.replace('VideoCallScreen', {
          email: email,
          action: 'listen',
        }),
      );
  };

  // Hàm thêm cuộc gọi nhỡ vào tin nhắn
  const missCall = () => {
    const time = new Date().getTime();
    const content = 'Cuộc gọi nhỡ';

    firestore()
      .collection('users')
      .doc(email)
      .update({inCall: firestore.FieldValue.delete()})
      .then(() => {
        firestore()
          .collection('users')
          .doc(auth().currentUser.email)
          .update({
            inCall: 'cancel',
          })
          .then(() => {
            // Thêm tin nhắn mới vào messages của người gửi
            firestore()
              .collection('users')
              .doc(auth().currentUser.email)
              .collection('chats')
              .doc(email)
              .collection('messages')
              .add({
                sender: auth().currentUser.uid,
                sentAt: time,
                content: content,
                type: 'video',
                imageURL: '',
                imageWidth: 0,
                imageHeight: 0,
              })
              .then(async docRef => {
                // Thêm tin nhắn mới vào messages của người nhận
                await firestore()
                  .collection('users')
                  .doc(email)
                  .collection('chats')
                  .doc(auth().currentUser.email)
                  .collection('messages')
                  .doc(docRef.id)
                  .set({
                    sender: auth().currentUser.uid,
                    sentAt: time,
                    content: content,
                    type: 'video',
                    imageURL: '',
                    imageWidth: 0,
                    imageHeight: 0,
                  });

                // Cập nhật lại phần tin nhắn mới nhất của người gửi
                await firestore()
                  .collection('users')
                  .doc(auth().currentUser.email)
                  .collection('chats')
                  .doc(email)
                  .update({
                    imageURL: false,
                    lastMsg: content,
                    lastMsgAt: time,
                    lastSender: auth().currentUser.uid,
                  });

                // Cập nhật lại phần tin nhắn mới nhất của người nhận
                await firestore()
                  .collection('users')
                  .doc(email)
                  .collection('chats')
                  .doc(auth().currentUser.email)
                  .get()
                  .then(snapshot => {
                    firestore()
                      .collection('users')
                      .doc(email)
                      .collection('chats')
                      .doc(auth().currentUser.email)
                      .update({
                        imageURL: false,
                        lastMsg: content,
                        lastMsgAt: time,
                        lastSender: auth().currentUser.uid,
                        // Nếu người nhận đang trong đoạn chat thì số tin nhắn mới sẽ bằng 0
                        newMsg: snapshot.data().inChat
                          ? 0
                          : snapshot.data().newMsg + 1,
                      })
                      .then(() => navigation.goBack());
                  });
              });
          });
      });
  };

  // Hàm từ chối cuộc gọi
  const reject = () => {
    firestore()
      .collection('users')
      .doc(email)
      .update({inCall: firestore.FieldValue.delete()})
      .then(() => {
        firestore()
          .collection('users')
          .doc(auth().currentUser.email)
          .update({
            inCall: 'reject',
          })
          .then(missCall);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.profilePicture}
        source={{
          uri: user && user.profilePicture,
        }}
      />
      <Text style={styles.username} numberOfLines={3}>
        {user && user.username}
      </Text>
      <View style={styles.buttonPanel}>
        <TouchableOpacity style={styles.buttonAccept} onPress={accept}>
          <Image
            style={styles.buttonIcon}
            source={require('../assets/accept-video-call.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonReject} onPress={reject}>
          <Image
            style={styles.buttonIcon}
            source={require('../assets/reject.png')}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1978F2',
  },

  profilePicture: {
    marginTop: '45%',
    width: 180,
    height: 180,
    borderRadius: 100,
  },

  username: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
    marginTop: 15,
    paddingHorizontal: 15,
    textAlign: 'center',
  },

  buttonPanel: {
    width: '65%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: '15%',
  },

  buttonAccept: {
    backgroundColor: '#5EC027',
    borderRadius: 100,
    padding: 15,
  },

  buttonReject: {
    backgroundColor: 'tomato',
    borderRadius: 100,
    padding: 15,
  },

  buttonIcon: {
    width: 50,
    height: 50,
  },
});

export default IncomingCallScreen;
