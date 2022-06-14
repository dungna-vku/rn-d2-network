import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const defaultAvatar =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Google_Contacts_icon.svg/1024px-Google_Contacts_icon.svg.png';

const InboxItem = ({item, navigation}) => {
  const datetime = new Date(item.data.lastMsgAt);
  const newDatetime = new Date();
  const date = datetime.getDate();
  const month = datetime.getMonth() + 1;
  const year = datetime.getFullYear();
  const lastMsgAt =
    date === newDatetime.getDate() &&
    month === newDatetime.getMonth() + 1 &&
    year === newDatetime.getFullYear()
      ? `${datetime.getHours()}:${
          datetime.getMinutes() < 10 ? '0' : ''
        }${datetime.getMinutes()}`
      : `${date}/${month}/${year}`;
  const [user, setUser] = useState();

  useEffect(() => {
    try {
      let isSubcribed = true;

      firestore()
        .collection('users')
        .doc(item.id)
        .onSnapshot(snapshot => {
          if (isSubcribed) {
            setUser(snapshot.data());
          }
        });

      return () => {
        isSubcribed = false;
        // console.log('[SYS] Clean up - Inbox Item');
      };
    } catch (error) {
      console.log('[SYS] Permission denied - Inbox Item');
    }
  }, [item]);

  const enterChat = () => {
    firestore()
      .collection('users')
      .doc(auth().currentUser.email)
      .collection('chats')
      .doc(item.id)
      .update({
        inChat: true,
        newMsg: 0,
      })
      .then(() => navigation.navigate('ChatScreen', {email: item.id}));
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={enterChat}>
      <View style={styles.userImageContainer}>
        <Image
          source={{
            uri: user ? user.profilePicture : defaultAvatar,
          }}
          style={styles.userImage}
        />
        {user && user.online && (
          <View style={styles.onlineIconContainer}>
            <View style={styles.onlineIcon} />
          </View>
        )}
      </View>

      <View style={styles.msgContent}>
        <Text
          style={item.data.newMsg === 0 ? styles.usernameSeen : styles.username}
          numberOfLines={1}>
          {user && String(user.username).slice(0, 25)}
          {user && String(user.username).length > 25 && '...'}
        </Text>

        <View style={styles.main}>
          <Text
            style={[
              item.data.newMsg === 0 ? styles.contentSeen : styles.content,
              // eslint-disable-next-line react-native/no-inline-styles
              {maxWidth: lastMsgAt.includes(':') ? '76%' : '60%'},
            ]}
            numberOfLines={1}>
            {item.data.lastSender === auth().currentUser.uid && 'Bạn: '}
            {item.data.imageURL === true ? 'Đã gửi 1 ảnh' : item.data.lastMsg}
          </Text>

          <Text style={styles.contentSeen}>
            {' - '}
            {lastMsgAt}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    margin: 15,
    flexDirection: 'row',
  },

  userHasStoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 100,
    justifyContent: 'center',
    position: 'relative',
    padding: 3,
    borderColor: '#1978F2',
    borderWidth: 3,
  },

  userImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 50,
    justifyContent: 'center',
    position: 'relative',
  },

  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  onlineIconContainer: {
    padding: 4,
    position: 'absolute',
    bottom: -5,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 13,
  },

  onlineIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#5EC027',
    borderRadius: 10,
  },

  msgContent: {
    height: 65,
    marginLeft: 10,
    paddingVertical: 5,
    justifyContent: 'space-between',
  },

  main: {
    width: '100%',
    flexDirection: 'row',
  },

  username: {
    fontSize: 18,
    fontWeight: '800',
  },

  usernameSeen: {
    fontSize: 18,
    fontWeight: '500',
  },

  content: {
    fontSize: 16,
    fontWeight: '700',
  },

  contentSeen: {
    fontSize: 16,
    color: '#444',
  },
});

export default InboxItem;
