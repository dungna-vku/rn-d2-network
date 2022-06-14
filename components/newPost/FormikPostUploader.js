import React, {useState, useEffect} from 'react';
import {
  Image,
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import * as Yup from 'yup';
import {Formik} from 'formik';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';

const PLACEHOLDER_AVATAR =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Google_Contacts_icon.svg/1024px-Google_Contacts_icon.svg.png';
const PLACEHOLDER_IMG =
  'https://phocode.com/wp-content/uploads/2020/10/placeholder-1.png';

const uploadPostSchema = Yup.object().shape({
  caption: Yup.string().max(2222, 'Bạn đã nhập quá 2222 ký tự'),
});

const FormikPostUploader = ({navigation}) => {
  const email = auth().currentUser.email;
  const [thumbnailURL, setThumbnailURL] = useState(PLACEHOLDER_IMG);
  const [authUser, setAuthUser] = useState();

  // Lấy thông tin người đăng
  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(email)
      .onSnapshot(doc => {
        const docData = doc.data();
        setAuthUser({
          username: docData.username,
          profilePicture: docData.profilePicture,
          posts: docData.posts,
        });
      });

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm mở thư viện ảnh
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
        const uploadUri =
          Platform.OS === 'ios'
            ? response.assets[0].uri.replace('file://', '')
            : response.assets[0].uri;
        setThumbnailURL(uploadUri);
      }
    });
  };

  // Hàm tải ảnh lên storage
  const uploadImage = async postID => {
    if (thumbnailURL !== PLACEHOLDER_IMG) {
      try {
        const filename = thumbnailURL.substring(
          thumbnailURL.lastIndexOf('/') + 1,
        );

        const storageRef = storage().ref(`users/${email}/posts/${filename}`);

        await storageRef
          .putFile(thumbnailURL)
          .catch(err => console.log(err.message))
          .then(async () => {
            const url = await storageRef.getDownloadURL();
            Image.getSize(url, (width, height) => {
              firestore()
                .collection('users')
                .doc(email)
                .collection('posts')
                .doc(postID)
                .update({
                  imageURL: url,
                  imageWidth: width,
                  imageHeight: height,
                });
            });
          })
          .then(() => setThumbnailURL(PLACEHOLDER_IMG));
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  // Thêm bài viết mới vào Firestore
  const uploadPostToFirestore = async caption => {
    return firestore()
      .collection('users')
      .doc(email)
      .collection('posts')
      .add({
        caption: caption,
        imageURL: '',
        imageWidth: 0,
        imageHeight: 0,
        userUID: auth().currentUser.uid,
        userEmail: email,
        createdAt: new Date().getTime(),
        likesByUsers: [],
        comments: [],
      })
      .then(docRef => {
        uploadImage(docRef.id).then(() => {
          firestore()
            .collection('users')
            .doc(email)
            .update({posts: authUser.posts + 1})
            .then(() => navigation.goBack());
        });
      })
      .catch(err => console.log(err.message));
  };

  return (
    <Formik
      initialValues={{caption: ''}}
      onSubmit={values => {
        uploadPostToFirestore(values.caption, values.imageURL);
      }}
      validationSchema={uploadPostSchema}
      validateOnMount={true}>
      {({handleBlur, handleChange, handleSubmit, values, errors, isValid}) => (
        <View style={styles.container}>
          <View style={styles.userContainer}>
            <Image
              source={{
                uri:
                  authUser && authUser.profilePicture
                    ? authUser.profilePicture
                    : PLACEHOLDER_AVATAR,
              }}
              style={styles.profilePicture}
            />

            <Text numberOfLines={1} style={styles.username}>
              {authUser && authUser.username}
            </Text>

            <TouchableOpacity
              disabled={!(values.caption || values.imageURL)}
              style={styles.createButton(values.caption || values.imageURL)}
              onPress={handleSubmit}>
              <Text
                style={styles.createText(values.caption || values.imageURL)}>
                Đăng
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postContent}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={openGallery}>
              <Image
                source={{
                  uri: thumbnailURL,
                }}
                style={styles.image}
              />
            </TouchableOpacity>

            <TextInput
              placeholder="Bạn đang nghĩ gì thế?"
              placeholderTextColor="gray"
              autoCorrect={false}
              multiline={true}
              onChangeText={handleChange('caption')}
              onBlur={handleBlur('caption')}
              maxLength={2222}
              style={styles.textInput}
            />
            {errors.caption && (
              <Text style={styles.errorText}>{errors.caption}</Text>
            )}
          </View>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  userContainer: {
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  username: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '60%',
  },

  createButton: isValid => ({
    height: 45,
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    backgroundColor: isValid ? '#1987f2' : '#eee',
  }),

  createText: isValid => ({
    color: isValid ? 'white' : '#555',
    fontSize: 18,
    fontWeight: '600',
  }),

  postContent: {
    flexDirection: 'row',
  },

  textInput: {
    width: Dimensions.get('window').width - 160,
    maxHeight: Dimensions.get('window').height * 0.4,
    fontSize: 20,
    marginTop: 10,
    marginRight: 15,
  },

  errorText: {
    fontSize: 18,
    color: 'red',
    marginHorizontal: 15,
  },

  imageContainer: {
    width: 100,
    height: 100,
    margin: 15,
  },

  image: {
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 15,
  },
});

export default FormikPostUploader;
