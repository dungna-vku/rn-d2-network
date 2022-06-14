import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

const Panel = ({id, post}) => {
  const authEmail = auth().currentUser.email;
  const userRef = firestore().collection('users').doc(post.userEmail);

  const likeHandler = () => {
    const currentLikeStatus = !post.likesByUsers.includes(authEmail);

    userRef
      .collection('posts')
      .doc(id)
      .update({
        likesByUsers: currentLikeStatus
          ? firebase.firestore.FieldValue.arrayUnion(authEmail)
          : firebase.firestore.FieldValue.arrayRemove(authEmail),
      })
      .then(() => {
        // Notify user about liking the post
        if (post.userEmail !== authEmail) {
          if (currentLikeStatus) {
            userRef
              .collection('notifications')
              .add({
                userEmail: authEmail,
                time: new Date().getTime(),
                type: 'like post',
                relatedId: post.id,
                seen: false,
              })
              .then(() => {
                userRef.update({
                  newNotifications: firebase.firestore.FieldValue.increment(1),
                });
              });
          }
        }
      });
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelIconPanel}>
        <View style={styles.panelLeftIcon}>
          <View style={styles.panelIconContainer}>
            <TouchableOpacity onPress={likeHandler}>
              <Image
                source={
                  post.likesByUsers.includes(authEmail)
                    ? require('../../assets/heart-filled.png')
                    : require('../../assets/heart.png')
                }
                style={styles.panelIconImage}
              />
            </TouchableOpacity>
            <Text style={styles.panelIconText}>{post.likesByUsers.length}</Text>
          </View>

          <View style={styles.panelIconContainer}>
            <View>
              <Image
                source={require('../../assets/comment.png')}
                style={styles.panelIconImage}
              />
            </View>
            <Text style={styles.panelIconText}>{post.comments.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 15,
    paddingBottom: 15,
    borderBottomColor: '#CCC',
    borderBottomWidth: 1,
  },

  panelIconPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  panelLeftIcon: {
    flexDirection: 'row',
  },

  panelIconContainer: {
    width: '33%',
    flexDirection: 'row',
  },

  panelIconImage: {
    width: 25,
    height: 25,
    marginLeft: 15,
  },

  panelIconText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
    marginHorizontal: 7,
  },

  panelLastIcon: {
    width: 25,
    height: 25,
    marginRight: 15,
  },

  panelLike: {
    margin: 15,
  },

  panelLikeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Panel;
