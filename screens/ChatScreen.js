import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import ChatContent from '../components/chat/ChatContent';
import Sender from '../components/chat/Sender';

const ChatScreen = ({route, navigation}) => {
  const {email} = route.params;
  const [user, setUser] = useState();

  useEffect(() => {
    try {
      let isSubcribed = true;

      firestore()
        .collection('users')
        .doc(email)
        .onSnapshot(snapshot => {
          if (isSubcribed) {
            setUser(snapshot.data());
          }
        });

      return () => {
        isSubcribed = false;
        // console.log('[SYS] Clean up - Chat');
      };
    } catch (error) {
      console.log('[SYS] Permission denied - Chat');
    }
  }, [email]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height '}
        style={styles.flex1}>
        <View style={styles.flex1} onPress={Keyboard.dismiss}>
          <View style={styles.flex1}>
            <Header email={email} user={user} navigation={navigation} />

            <ChatContent user={user} email={email} />

            <Sender email={email} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const exitChat = async (email, navigation) => {
  await firestore()
    .collection('users')
    .doc(auth().currentUser.email)
    .collection('chats')
    .doc(email)
    .get()
    .then(snapshot => {
      if (snapshot.data().lastSender) {
        firestore()
          .collection('users')
          .doc(auth().currentUser.email)
          .collection('chats')
          .doc(email)
          .update({inChat: false})
          .then(() => navigation.goBack());
      } else {
        firestore()
          .collection('users')
          .doc(auth().currentUser.email)
          .collection('chats')
          .doc(email)
          .delete()
          .then(() => {
            firestore()
              .collection('users')
              .doc(email)
              .collection('chats')
              .doc(auth().currentUser.email)
              .delete()
              .then(() => navigation.goBack());
          });
      }
    });
};

const videoCall = (email, navigation) => {
  firestore()
    .collection('users')
    .doc(email)
    .update({
      inCall: auth().currentUser.email,
    })
    .then(() => {
      firestore()
        .collection('users')
        .doc(auth().currentUser.email)
        .update({
          inCall: 'connecting',
        })
        .then(() => navigation.push('OutgoingCallScreen', {email: email}));
    });
};

const Header = ({email, user, navigation}) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity
      style={styles.backIconContainer}
      onPress={() => exitChat(email, navigation)}>
      <Image
        source={require('../assets/back-color.png')}
        style={styles.backIconImage}
      />
    </TouchableOpacity>

    <View style={styles.headerImageContainer}>
      <Image
        source={{
          uri: user && user.profilePicture,
        }}
        style={styles.headerImage}
      />
    </View>

    <View style={styles.headerContent}>
      <Text style={styles.headerUsername} numberOfLines={1}>
        {user && String(user.username).slice(0, 17)}
        {user && String(user.username).length > 17 && '...'}
      </Text>
      {user && user.online && (
        <Text style={styles.headerStatus}>Đang hoạt động</Text>
      )}
    </View>

    <View style={styles.headerButtonContainer}>
      {/* <TouchableOpacity style={styles.headerButton}>
        <Image
          source={require('../assets/call.png')}
          style={styles.headerButtonImage}
        />
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => videoCall(email, navigation)}
        disabled={
          user && user.online && user.inCall === undefined ? false : true
        }>
        <Image
          source={require('../assets/video.png')}
          style={styles.headerButtonImage}
        />
      </TouchableOpacity>

      {user && user.online && user.inCall === undefined && (
        <View style={styles.onlineIcon} />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header section
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.2,
    paddingBottom: 10,
  },

  backIconImage: {
    width: 50,
    height: 50,
  },

  hasStoryHeaderImageContainer: {
    width: 45,
    height: 45,
    borderRadius: 100,
    justifyContent: 'center',
    position: 'relative',
    padding: 2,
    borderColor: '#1978F2',
    borderWidth: 2,
  },

  headerImageContainer: {
    width: 45,
    height: 45,
    borderRadius: 50,
    justifyContent: 'center',
    position: 'relative',
  },

  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  headerContent: {
    height: 43,
    marginLeft: 10,
    justifyContent: 'center',
  },

  headerUsername: {
    fontSize: 18,
    fontWeight: '700',
  },

  headerStatus: {
    color: '#444',
    marginTop: 4,
  },

  headerButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    paddingHorizontal: 15,
  },

  headerButtonImage: {
    width: 30,
    height: 30,
    marginLeft: 15,
  },

  onlineIcon: {
    width: 15,
    height: 15,
    backgroundColor: '#5EC027',
    borderRadius: 10,
    marginLeft: 4,
  },
});

export default ChatScreen;
