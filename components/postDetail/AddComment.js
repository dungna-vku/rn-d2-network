import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

const AddComment = ({id, post}) => {
  const [comment, setComment] = useState('');
  const [avatar, setAvatar] = useState('');
  const authEmail = auth().currentUser.email;
  const userRef = firestore().collection('users').doc(post.userEmail);

  const addComment = () => {
    const currentTime = new Date().getTime();

    userRef
      .collection('posts')
      .doc(id)
      .update({
        comments: firebase.firestore.FieldValue.arrayUnion({
          email: authEmail,
          content: comment,
          time: currentTime,
        }),
      })
      .then(() => {
        if (post.userEmail !== authEmail) {
          userRef
            .collection('notifications')
            .add({
              userEmail: authEmail,
              time: currentTime,
              type: 'comment post',
              relatedId: post.id,
              seen: false,
            })
            .then(() => {
              userRef.update({
                newNotifications: firebase.firestore.FieldValue.increment(1),
              });
            });
        }

        setComment('');
      });
  };

  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(authEmail)
      .onSnapshot(snapshot => setAvatar(snapshot.data().profilePicture));

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.sender}>
      <TouchableOpacity style={styles.bottomButton}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.avatar} />
        ) : (
          <></>
        )}
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          autoFocus={false}
          placeholderTextColor="#444"
          placeholder="Viết bình luận..."
          autoCapitalize="none"
          style={styles.input}
          multiline={true}
          onChangeText={text => setComment(text)}
          value={comment}
        />
      </View>

      <TouchableOpacity style={styles.bottomButton} onPress={addComment}>
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
    marginVertical: 7,
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 22,
  },

  bottomButton: {
    marginBottom: 7,
  },

  bottomButtonImage: {
    width: 35,
    height: 35,
  },

  inputContainer: {
    flex: 1,
    marginHorizontal: 7,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    borderColor: '#DDD',
    borderWidth: 1,
  },

  input: {
    fontSize: 16,
    width: '100%',
  },
});

export default AddComment;
