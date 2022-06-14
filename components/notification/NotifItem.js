import React, {useState, useEffect} from 'react';
import {TouchableOpacity, View, Text, Image, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const NotifItem = ({notif, navigation}) => {
  const email = auth().currentUser.email;
  const arr = new Date(notif.data.time).toLocaleDateString().split('/');
  const date = `${arr[1]}/${arr[0]}/${arr[2]}`;

  let content = '',
    screen = '';
  switch (notif.data.type) {
    case 'follow':
      content = 'đã bắt đầu theo dõi bạn';
      screen = 'UserProfileScreen';
      break;
    case 'unfollow':
      content = 'đã bỏ theo dõi bạn';
      screen = 'UserProfileScreen';
      break;
    case 'like post':
      content = 'đã thích bài viết của bạn';
      screen = 'PostScreen';
      break;
    case 'comment post':
      content = 'đã bình luận về bài viết của bạn';
      screen = 'PostScreen';
      break;
    case 'like story':
      content = 'đã thích tin của bạn';
      screen = 'StoryScreen';
      break;
    default:
      break;
  }

  const [notifUser, setNotifUser] = useState();

  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(notif.data.userEmail)
      .onSnapshot(snapshot => {
        const userData = snapshot.data();
        setNotifUser({
          profilePicture: userData.profilePicture,
          username: userData.username,
        });
      });

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateHandler = () => {
    firestore()
      .collection('users')
      .doc(email)
      .collection('notifications')
      .doc(notif.id)
      .update({seen: true})
      .then(() =>
        firestore()
          .collection('users')
          .doc(email)
          .get()
          .then(doc => {
            const newNotifications = doc.data().newNotifications;

            firestore()
              .collection('users')
              .doc(email)
              .update({
                newNotifications:
                  newNotifications > 0
                    ? newNotifications - 1
                    : newNotifications,
              })
              .then(() =>
                navigation.navigate(screen, {
                  id: notif.data.relatedId,
                }),
              );
          }),
      );
  };

  return (
    <TouchableOpacity
      style={styles.notifItem}
      onPress={navigateHandler}
      key={notif.id}>
      <View
        style={[
          styles.shadow,
          !notif.data.seen ? styles.shadowPurple : styles.shadowWhite,
        ]}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{uri: notifUser && notifUser.profilePicture}}
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.contentView}>
            <Text style={styles.username}>
              {notifUser && notifUser.username}{' '}
            </Text>
            {content}
          </Text>
          <Text style={styles.time}>{`${new Date(
            notif.data.time,
          ).toLocaleTimeString()}, ${date}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notifItem: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#CCC',
    shadowOffset: {width: -4, height: 4},
    shadowOpacity: 0.25,
  },

  shadow: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    paddingBottom: 15,
    shadowColor: '#CCC',
    shadowOffset: {width: 4, height: -4},
    shadowOpacity: 0.25,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  shadowWhite: {
    backgroundColor: 'white',
  },

  shadowPurple: {
    backgroundColor: 'rgba(137, 106, 243, 0.25)',
  },

  new: {
    position: 'absolute',
    top: -10,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: '#896AF3',
  },

  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 15,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  contentContainer: {
    flex: 1,
  },

  contentView: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    fontSize: 16,
  },

  username: {fontWeight: 'bold'},

  time: {
    marginTop: 10,
    color: '#666',
  },

  noNotif: {
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NotifItem;
