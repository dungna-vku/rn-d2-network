import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import InboxItem from '../components/inbox/InboxItem';
import OnlineUser from '../components/inbox/OnlineUser';

const InboxScreen = ({navigation}) => {
  const [inboxItems, setInboxItems] = useState([]);

  useEffect(() => {
    try {
      let isSubcribed = true;

      firestore()
        .collection('users')
        .doc(auth().currentUser.email)
        .collection('chats')
        .orderBy('newMsg', 'desc')
        .orderBy('lastMsgAt', 'desc')
        .onSnapshot(snapshot => {
          if (isSubcribed) {
            setInboxItems(
              snapshot.docs.map(item => {
                return {id: item.id, data: item.data()};
              }),
            );
          }
        });

      return () => {
        isSubcribed = false;
        console.log('[SYS] Clean up - Inbox');
      };
    } catch (error) {
      console.log('[SYS] Permission denied - Inbox');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView>
        {inboxItems.map((item, index) => (
          <InboxItem item={item} key={index} navigation={navigation} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Header = ({navigation}) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerTop}>
      <TouchableOpacity
        style={styles.backIconContainer}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/back.png')}
          style={styles.backIconImage}
        />
      </TouchableOpacity>

      <Text style={styles.headerText}>Tin nhắn</Text>
    </View>

    <View style={styles.searchContainer}>
      <Image
        source={require('../assets/searchChat.png')}
        style={styles.searchChatIcon}
      />

      <TextInput
        autoFocus={false}
        placeholderTextColor="#444"
        placeholder="Tìm kiếm cuộc trò chuyện"
        autoCapitalize="none"
        style={styles.textSize}
      />
    </View>

    <OnlineUser navigation={navigation} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Header section
  headerContainer: {
    marginTop: 15,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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

  newChatIconContainer: {
    position: 'absolute',
    right: 15,
  },

  newChatIconImage: {
    width: 40,
    height: 40,
  },

  searchContainer: {
    margin: 15,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#EDEDEF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textSize: {fontSize: 16, width: '88%'},

  searchChatIcon: {
    height: 25,
    width: 25,
    marginRight: 10,
  },
});

export default InboxScreen;
