import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  // ScrollView,
  FlatList,
  Image,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const SearchScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .onSnapshot(snapshot => {
        setUsers(
          snapshot.docs.map(doc => {
            return {
              id: doc.id,
              username: doc.data().username,
              profilePicture: doc.data().profilePicture,
              uid: doc.data().uid,
            };
          }),
        );
      });

    return () => subscriber();
  }, []);

  useEffect(() => {
    if (searchUser) {
      const results = users.filter(user =>
        user.username.toLowerCase().includes(searchUser.toLowerCase()),
      );

      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchUser]);

  const viewProfile = id => navigation.navigate('UserProfileScreen', {id: id});

  const Item = ({user}) => (
    <TouchableOpacity
      onPress={() => viewProfile(user.id)}
      style={styles.searchItem}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.profilePicture}
          source={{uri: user.profilePicture}}
        />
      </View>
      <Text style={styles.username}>{user.username}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height '}
        style={styles.flex1}>
        <View style={styles.flex1}>
          <View style={styles.flex1}>
            <View style={styles.searchContainer}>
              <Image
                source={require('../assets/searchChat.png')}
                style={styles.searchChatIcon}
              />

              <TextInput
                autoFocus={false}
                placeholderTextColor="#444"
                placeholder="Tìm kiếm bạn bè"
                autoCapitalize="none"
                style={styles.textSize}
                onChangeText={text => setSearchUser(text)}
                value={searchUser}
              />
            </View>

            {/* <ScrollView>
              {searchResults.map((user, index) => (
                <View style={styles.searchItem} key={index}>
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.profilePicture}
                      source={{uri: user.profilePicture}}
                    />
                  </View>
                  <Text style={styles.username}>{user.username}</Text>
                </View>
              ))}
            </ScrollView> */}

            <FlatList
              data={searchResults}
              renderItem={({item}) => <Item user={item} />}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listItem}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
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

  listItem: {
    paddingBottom: 75,
  },

  searchItem: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 15,
  },

  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  username: {
    fontSize: 17,
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default SearchScreen;
