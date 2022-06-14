import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';

const Sender = ({email}) => {
  const [msgContent, setMsgContent] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    try {
      let isSubcribed = true;

      if (isSubcribed && image) {
        const {uri} = image;
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri =
          Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        const storageRef = storage().ref(
          `users/${auth().currentUser.email}/chats/${email}/${filename}`,
        );

        storageRef
          .putFile(uploadUri)
          .catch(err => console.log(err.message))
          .then(async () => {
            const url = await storageRef.getDownloadURL();
            console.log('File available at', url);

            Image.getSize(url, (width, height) => {
              const time = new Date().getTime();

              // Thêm tin nhắn mới vào messages của người gửi
              firestore()
                .collection('users')
                .doc(auth().currentUser.email)
                .collection('chats')
                .doc(email)
                .collection('messages')
                .add({
                  content: '',
                  imageURL: url,
                  sender: auth().currentUser.uid,
                  sentAt: time,
                  imageWidth: width,
                  imageHeight: height,
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
                      content: '',
                      imageURL: url,
                      imageWidth: width,
                      imageHeight: height,
                    });

                  // Cập nhật lại phần tin nhắn mới nhất của người gửi
                  await firestore()
                    .collection('users')
                    .doc(auth().currentUser.email)
                    .collection('chats')
                    .doc(email)
                    .update({
                      imageURL: true,
                      lastMsg: '',
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
                    .then(async snapshot => {
                      await firestore()
                        .collection('users')
                        .doc(email)
                        .collection('chats')
                        .doc(auth().currentUser.email)
                        .update({
                          imageURL: true,
                          lastMsg: '',
                          lastMsgAt: time,
                          lastSender: auth().currentUser.uid,
                          // Nếu người nhận đang trong đoạn chat thì số tin nhắn mới sẽ bằng 0
                          newMsg: snapshot.data().inChat
                            ? 0
                            : snapshot.data().newMsg + 1,
                        });
                    });
                });
            });
          });
      }
      setImage();

      return () => {
        isSubcribed = false;
      };
    } catch (error) {
      console.log(error.message);
    }
  }, [image, email]);

  const openGallery = async () => {
    const options = {
      title: 'Chọn ảnh',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    await launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancel image picker');
      } else if (response.error) {
        console.log('ImagePicker error: ', response.error);
      } else if (response.customButton) {
        console.log('User tap custom button');
      } else {
        setImage({uri: response.assets[0].uri});
      }
    });
  };

  const handleOnChange = text => {
    setMsgContent(text);
  };

  const sendMsg = async () => {
    const time = new Date().getTime();
    const content = msgContent;

    setMsgContent('');

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
          .then(async snapshot => {
            console.log(snapshot.data().inChat);

            await firestore()
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
                newMsg: snapshot.data().inChat ? 0 : snapshot.data().newMsg + 1,
              });
          });
      });
  };

  return (
    <View style={styles.sender}>
      <TouchableOpacity style={styles.bottomButton} onPress={openGallery}>
        <Image
          source={require('../../assets/picture.png')}
          style={styles.bottomButtonImage}
        />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          autoFocus={false}
          placeholderTextColor="#444"
          placeholder="Nhập tin nhắn..."
          autoCapitalize="none"
          style={styles.input}
          multiline={true}
          onChangeText={text => handleOnChange(text)}
          value={msgContent}
        />
      </View>

      <TouchableOpacity style={styles.bottomButton} onPress={() => sendMsg()}>
        <Image
          source={require('../../assets/sentMsg.png')}
          style={styles.bottomButtonImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sender: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    marginTop: 10,
  },

  bottomButton: {
    marginBottom: 10,
  },

  bottomButtonImage: {
    width: 35,
    height: 35,
  },

  inputContainer: {
    flex: 1,
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    flexDirection: 'row',
  },

  input: {
    fontSize: 16,
    width: '100%',
  },
});

export default Sender;
