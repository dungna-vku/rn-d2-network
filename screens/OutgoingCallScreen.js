/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const OutgoingCallScreen = ({route, navigation}) => {
  const {email} = route.params;
  const [user, setUser] = useState();
  const [seconds, setSeconds] = useState(0);

  // Nếu sau 30s người nhận không phản hồi thì tính là cuộc gọi nhỡ
  useEffect(() => {
    let interval = setInterval(() => {
      if (seconds >= 30) {
        cancel();
      }
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // Lấy thông tin của người nhận
  useEffect(() => {
    let isSubcribed = true;

    firestore()
      .collection('users')
      .doc(email)
      .get()
      .then(snapshot => {
        if (isSubcribed && snapshot) {
          setUser(snapshot.data());
        }
      });

    return () => {
      isSubcribed = false;
    };
  }, [email]);

  // Xử lý phản hồi từ người dùng
  useEffect(() => {
    let isSubcribed = true;

    firestore()
      .collection('users')
      .doc(email)
      .onSnapshot(snapshot => {
        if (isSubcribed && snapshot) {
          const inCall = snapshot.data().inCall;
          // Nếu người nhận từ chối cuộc gọi
          if (inCall === 'reject') {
            firestore()
              .collection('users')
              .doc(email)
              .update({inCall: firestore.FieldValue.delete()})
              .then(() => navigation.goBack());
            // Nếu người nhận chấp nhận cuộc gọi thì chuyển đến màn hình gọi video
          } else if (
            inCall &&
            inCall !== 'connecting' &&
            inCall !== auth().currentUser.email
          ) {
            navigation.replace('VideoCallScreen', {
              email: email,
              remotePeerID: inCall,
              action: 'call',
            });
          }
        }
      });

    return () => {
      isSubcribed = false;
    };
  }, [email]);

  // Huỷ cuộc gọi
  const cancel = () => {
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

      <TouchableOpacity style={styles.buttonReject} onPress={cancel}>
        <Image
          style={styles.buttonIcon}
          source={require('../assets/reject.png')}
        />
      </TouchableOpacity>
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

  buttonReject: {
    position: 'absolute',
    bottom: '15%',
    backgroundColor: 'tomato',
    borderRadius: 100,
    padding: 15,
  },

  buttonIcon: {
    width: 50,
    height: 50,
  },
});

export default OutgoingCallScreen;
