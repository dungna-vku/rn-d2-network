import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

const EditProfileScreen = ({navigation, route}) => {
  const {id, user} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height '}
        style={styles.flex_1}>
        <View style={styles.flex_1} onPress={Keyboard.dismiss}>
          <View style={styles.flex_1}>
            <Header navigation={navigation} />
            <Content id={id} user={user} navigation={navigation} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Header = ({navigation}) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity
      style={styles.backIconContainer}
      onPress={() => navigation.goBack()}>
      <Image
        source={require('../assets/back.png')}
        style={styles.backIconImage}
      />
    </TouchableOpacity>
    <Text style={styles.headerText}>Chỉnh sửa trang cá nhân</Text>
  </View>
);

const Content = ({id, user, navigation}) => {
  const [editUser, setEditUser] = useState(user);
  const [newBio, setNewBio] = useState(user.biography);
  const [newName, setNewName] = useState(user.username);

  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(id)
      .onSnapshot(snapshot => setEditUser(snapshot.data()));

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openGallery = async option => {
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

        uploadImage(uploadUri, option);
      }
    });
  };

  const uploadImage = async (uploadUri, option) => {
    const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    const storageRef = storage().ref(`users/${id}/${option}/${filename}`);

    await storageRef.putFile(uploadUri).then(() => {
      storageRef.getDownloadURL().then(url => {
        return url;
      });
    });
  };

  const updateInfo = () => {
    firestore()
      .collection('users')
      .doc(id)
      .update({biography: newBio, username: newName})
      .then(() => navigation.goBack());
  };

  return (
    <ScrollView style={styles.flex_1}>
      <View style={styles.secion}>
        <Text style={styles.title}>Ảnh đại diện</Text>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => openGallery('profilePicture')}>
          <Image
            source={{
              uri: editUser.profilePicture,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.secion}>
        <Text style={styles.title}>Ảnh bìa</Text>
        <TouchableOpacity
          style={styles.backgroundContainer}
          onPress={() => openGallery('background')}>
          <Image
            source={{
              uri: editUser.background,
            }}
            style={styles.background}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.secion}>
        <Text style={styles.title}>Tiểu sử</Text>
        <View style={styles.inputContainer}>
          <TextInput
            maxLength={2000}
            value={newBio}
            onChangeText={text => setNewBio(text)}
            style={styles.input}
            multiline={true}
          />
        </View>
      </View>

      <View style={styles.secion}>
        <Text style={styles.title}>Tên hiển thị</Text>
        <View style={styles.inputContainer}>
          <TextInput
            maxLength={100}
            value={newName}
            onChangeText={text => setNewName(text)}
            style={styles.input}
            multiline
          />
        </View>
      </View>

      <TouchableOpacity style={styles.buttonContainer} onPress={updateInfo}>
        <LinearGradient
          colors={['#896AF3', '#53B8F7']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.button}>
          <Text style={styles.textButton}>Xác nhận thay đổi</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 50,
    borderBottomColor: '#DDD',
    borderBottomWidth: 1,
  },

  backIconContainer: {
    position: 'absolute',
    left: 0,
  },

  backIconImage: {
    width: 50,
    height: 50,
  },

  headerText: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Content section
  secion: {
    marginHorizontal: 15,
    borderBottomColor: '#DDD',
    borderBottomWidth: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15,
  },

  avatarContainer: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 70,
  },

  avatar: {
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 70,
  },

  backgroundContainer: {
    height: 150,
    width: '100%',
    borderRadius: 15,
  },

  background: {
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 15,
  },

  inputContainer: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: '#EDEDEF',
  },

  input: {
    width: '100%',
    fontSize: 16,
  },

  buttonContainer: {
    marginVertical: 15,
    backgroundColor: 'red',
    alignSelf: 'center',
    borderRadius: 15,
  },

  button: {
    padding: 15,
    borderRadius: 15,
  },

  textButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default EditProfileScreen;
