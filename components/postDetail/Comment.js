import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

const Comment = ({navigation, id, comment}) => {
  const [user, setUser] = useState();
  const userRef = firestore().collection('users').doc(comment.email);

  // Get information of user's comment
  useEffect(() => {
    const subcribe = userRef.onSnapshot(snapshot => setUser(snapshot.data()));

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gotoProfile = () => {
    navigation.navigate('UserProfileScreen', {id: comment.email});
  };

  const deleteHandler = () => {
    userRef
      .collection('posts')
      .doc(id)
      .update({
        comments: firebase.firestore.FieldValue.arrayRemove({
          email: auth().currentUser.email,
          content: comment.content,
          time: comment.time,
        }),
      });
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={gotoProfile} style={styles.avatarContainer}>
        <Image
          source={{uri: user && user.profilePicture}}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <View style={styles.main}>
        <TouchableOpacity onPress={gotoProfile}>
          <Text style={styles.name}>{user && user.username}</Text>
        </TouchableOpacity>
        <Text style={styles.content}>{comment.content}</Text>
      </View>

      {comment.email === auth().currentUser.email && (
        <TouchableOpacity onPress={deleteHandler}>
          <Image
            source={require('../../assets/delete.png')}
            style={styles.delete}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginTop: 15,
    marginHorizontal: 15,
    alignItems: 'center',
  },

  avatarContainer: {
    alignSelf: 'flex-start',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  main: {
    flexShrink: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 7,
    backgroundColor: '#EEE',
    borderRadius: 15,
  },

  name: {
    width: '100%',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 7,
  },

  content: {
    width: '100%',
    fontSize: 16,
  },

  delete: {
    width: 25,
    height: 25,
    marginLeft: 7,
  },
});

export default Comment;
