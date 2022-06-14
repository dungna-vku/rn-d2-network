import React from 'react';
import {View, Image, TouchableOpacity, Text, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

const Info = ({navigation, id, user, notAuth, isFollowing}) => {
  const authEmail = auth().currentUser.email;

  const signOutHandler = () =>
    firestore()
      .collection('users')
      .doc(authEmail)
      .update({online: false})
      .then(() => {
        auth()
          .signOut()
          .then(() => {
            firestore()
              .disableNetwork()
              .then(() => console.log('[USER] Sign out'));
          })
          .catch(err => console.log(err.message));
      });

  const editProfileHandler = () => {
    navigation.navigate('EditProfileScreen', {id: id, user: user});
  };

  const followHandler = () => {
    firestore()
      .collection('users')
      .doc(authEmail)
      .update({following: firebase.firestore.FieldValue.arrayUnion(id)})
      .then(() => {
        firestore()
          .collection('users')
          .doc(id)
          .update({
            followers: firebase.firestore.FieldValue.arrayUnion(authEmail),
          })
          .then(() => {
            // Notify user about following
            firestore()
              .collection('users')
              .doc(id)
              .collection('notifications')
              .add({
                userEmail: authEmail,
                time: new Date().getTime(),
                type: 'follow',
                relatedId: authEmail,
                seen: false,
              })
              .then(() => {
                // Increase new notifications of user
                firestore()
                  .collection('users')
                  .doc(id)
                  .update({
                    newNotifications:
                      firebase.firestore.FieldValue.increment(1),
                  });
              });
          });
      });
  };

  const unfollowHandler = () => {
    firestore()
      .collection('users')
      .doc(authEmail)
      .update({
        following: firebase.firestore.FieldValue.arrayRemove(id),
      })
      .then(() => {
        firestore()
          .collection('users')
          .doc(id)
          .update({
            followers: firebase.firestore.FieldValue.arrayRemove(authEmail),
          })
          .then(() => {
            // Notify user about unfollowing
            firestore()
              .collection('users')
              .doc(id)
              .collection('notifications')
              .add({
                userEmail: authEmail,
                time: new Date().getTime(),
                type: 'unfollow',
                relatedId: auth().currentUser.email,
                seen: false,
              })
              .then(() => {
                // Increase new notifications of user
                firestore()
                  .collection('users')
                  .doc(id)
                  .update({
                    newNotifications:
                      firebase.firestore.FieldValue.increment(1),
                  });
              });
          });
      });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.infoContainer}>
        <View style={styles.backgroundContainer}>
          <Image
            style={styles.background}
            source={{uri: user && user.background}}
          />
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={
              user && user.hasStory
                ? styles.profilePictureHasStoryContainer
                : styles.profilePictureContainer
            }>
            <Image
              style={styles.profilePicture}
              source={{uri: user && user.profilePicture}}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.username}>{user && user.username}</Text>
        {user && user.biography !== '' && (
          <Text style={styles.biography}>{user && user.biography}</Text>
        )}
        <View style={styles.infoRow}>
          <View style={styles.cell}>
            <Text style={styles.number}>{user && user.posts}</Text>
            <Text style={styles.title}>Bài viết</Text>
          </View>

          <View style={styles.cellBorder}>
            <Text style={styles.number}>
              {user && user.followers ? user.followers.length : 0}
            </Text>
            <Text style={styles.title}>Người theo dõi</Text>
          </View>

          <View style={styles.cell}>
            <Text style={styles.number}>
              {user && user.following ? user.following.length : 0}
            </Text>
            <Text style={styles.title}>Đang theo dõi</Text>
          </View>
        </View>

        {!notAuth ? (
          <View style={styles.infoRow}>
            <TouchableOpacity
              style={styles.editInfoButton}
              onPress={editProfileHandler}>
              <Text style={styles.editInfoText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={signOutHandler}>
              <Image
                source={require('../../assets/sign-out.png')}
                style={styles.signOutIcon}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            {isFollowing ? (
              <TouchableOpacity
                style={styles.editInfoButton}
                onPress={unfollowHandler}>
                <Text style={styles.editInfoText}>Bỏ theo dõi</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editInfoButton}
                onPress={followHandler}>
                <Text style={styles.editInfoText}>Theo dõi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    elevation: 5,
  },

  infoContainer: {
    height: 150,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  backgroundContainer: {
    width: '100%',
    height: '100%',
  },

  background: {
    width: '100%',
    height: '100%',
  },

  avatarContainer: {
    width: 140,
    height: 140,
    padding: 4,
    borderRadius: 100,
    position: 'absolute',
    bottom: '-40%',
    backgroundColor: 'white',
  },

  profilePictureContainer: {
    width: '100%',
    height: '100%',
    padding: 4,
    borderRadius: 100,
  },

  profilePictureHasStoryContainer: {
    width: '100%',
    height: '100%',
    padding: 4,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#1978F2',
  },

  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 100,
  },

  // Header content
  contentContainer: {
    paddingTop: 65,
    paddingBottom: 20,
    alignItems: 'center',
  },

  username: {
    paddingHorizontal: 15,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },

  biography: {
    fontSize: 20,
    paddingTop: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  cell: {
    flex: 1,
    alignItems: 'center',
  },

  cellBorder: {
    flex: 1,
    alignItems: 'center',
    borderLeftColor: 'lightgray',
    borderLeftWidth: 1,
    borderRightColor: 'lightgray',
    borderRightWidth: 1,
  },

  number: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 5,
  },

  title: {
    color: 'gray',
    fontSize: 15,
  },

  editInfoButton: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#896AF3',
  },

  editInfoText: {
    fontSize: 16,
    color: 'white',
  },

  signOutButton: {
    marginLeft: 20,
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#DDD',
  },

  signOutIcon: {
    width: 30,
    height: 30,
  },
});

export default Info;
