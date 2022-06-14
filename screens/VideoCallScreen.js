/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import {WebView} from 'react-native-webview';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const VideoCallScreen = ({route, navigation}) => {
  const {email, remotePeerID, action} = route.params;
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableVideo, setEnableVideo] = useState(true);
  const [webRef, setWebRef] = useState();
  const [seconds, setSeconds] = useState(0);

  // Đếm thời gian trong cuộc gọi
  useEffect(() => {
    let interval = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  // Lắng nghe đối phương có kết thúc cuộc gọi hay không
  useEffect(() => {
    let isSubcribed = true;

    firestore()
      .collection('users')
      .doc(email)
      .onSnapshot(snapshot => {
        if (isSubcribed && snapshot) {
          const inCall = snapshot.data().inCall;
          if (inCall && inCall === 'end') {
            firestore()
              .collection('users')
              .doc(email)
              .update({inCall: firestore.FieldValue.delete()})
              .then(() => navigation.goBack());
          }
        }
      });

    return () => {
      isSubcribed = false;
      // console.log('[SYS] Clean up - Video Call');
    };
  }, [email]);

  // Bật/tắt video
  useEffect(() => {
    let isSubcribed = true;
    if (isSubcribed && webRef) {
      webRef.injectJavaScript(`toggleVideo(${enableVideo})`);
    }
    return () => (isSubcribed = false);
  }, [enableVideo]);

  // Bật/tắt tiếng
  useEffect(() => {
    let isSubcribed = true;
    if (isSubcribed && webRef) {
      webRef.injectJavaScript(`toggleAudio(${enableAudio})`);
    }
    return () => (isSubcribed = false);
  }, [enableAudio]);

  // Script cho người gọi
  const call = `
    peer = new Peer();

    peer.on('open', id => {
      if (!navigator.mediaDevices) {
        window.ReactNativeWebView.postMessage('Not supported');
        return;
      }

      window.ReactNativeWebView.postMessage('#' + id);

      navigator.mediaDevices
        .getUserMedia({video: true, audio: true})
        .then(async stream => {
          localStream = stream;
          addLocalVideo(stream);

          startCall("${remotePeerID}");
        });
    });

    true;
  `;

  // Script cho người nghe
  const listen = `
    peer = new Peer();

    peer.on('open', id => {
      if (!navigator.mediaDevices) {
        window.ReactNativeWebView.postMessage('Not supported');
        return;
      }

      window.ReactNativeWebView.postMessage('#' + id);

      navigator.mediaDevices
        .getUserMedia({video: true, audio: true})
        .then(async stream => {
          localStream = stream;
          addLocalVideo(stream);

          listen();
        });
    });

    true;
  `;

  // Cập nhật peerId khi đã khởi tạo thành công
  const onMessage = event => {
    const msg = event.nativeEvent.data;
    console.log(msg);

    if (msg[0] === '#') {
      firestore()
        .collection('users')
        .doc(auth().currentUser.email)
        .update({
          inCall: msg.substring(1),
        })
        .then(async () => {
          console.log('Listening...');
        });
    }
  };

  // Hàm kết thúc cuộc gọi
  const endCall = () => {
    const time = new Date().getTime();
    const content = 'Video chat';
    const length = seconds;

    // Cập nhật trạng thái đối phương không còn trong cuộc gọi nữa
    firestore()
      .collection('users')
      .doc(email)
      .update({inCall: firestore.FieldValue.delete()})
      .then(() => {
        // Cập nhật trạng thái của người kết thúc cuộc gọi
        firestore()
          .collection('users')
          .doc(auth().currentUser.email)
          .update({inCall: 'end'})
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
                length: length,
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
                    length: length,
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
      <WebView
        ref={ref => setWebRef(ref)}
        source={{uri: 'https://d2-videocall.herokuapp.com/'}}
        javaScriptEnabled={true}
        injectedJavaScript={action === 'call' ? call : listen}
        allowsInlineMediaPlayback={true}
        scrollEnabled={false}
        onMessage={onMessage}
      />

      <View style={styles.buttonPanel}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => setEnableVideo(!enableVideo)}>
          <Image
            style={styles.buttonIcon}
            source={
              enableVideo
                ? require('../assets/enable-video.png')
                : require('../assets/disable-video.png')
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => setEnableAudio(!enableAudio)}>
          <Image
            style={styles.buttonIcon}
            source={
              enableAudio
                ? require('../assets/enable-audio.png')
                : require('../assets/disable-audio.png')
            }
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endButton} onPress={endCall}>
          <Image
            style={styles.buttonIcon}
            source={require('../assets/end-call.png')}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },

  buttonPanel: {
    width: '100%',
    paddingHorizontal: 40,
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  mediaButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 50,
  },

  buttonIcon: {
    width: 40,
    height: 40,
  },

  endButton: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 50,
  },
});

export default VideoCallScreen;
