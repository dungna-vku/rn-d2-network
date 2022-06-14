/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  // ActivityIndicator,
  // View,
} from 'react-native';
import Post from '../components/home/Post';
import Stories from '../components/home/Stories';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = ({navigation}) => {
  const authEmail = auth().currentUser.email;
  const [acceptedEmail, setAcceptedEmail] = useState([]);
  const [posts, setPosts] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [offset, setOffset] = useState(0);
  // const [currentPosts, setCurrentPosts] = useState([]);

  // Get information of current user
  // useEffect(() => {
  //   const subcribe = firestore()
  //     .collection('users')
  //     .doc(authEmail)
  //     .onSnapshot(snapshot => setUser(snapshot.data()));

  //   return () => {
  //     subcribe();
  //   };
  // }, []);

  // Get all accepted users
  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(authEmail)
      .onSnapshot(snapshot =>
        setAcceptedEmail([...snapshot.data().following, authEmail]),
      );

    return () => {
      subcribe();
    };
  }, []);

  // Get all posts of accepted users
  useEffect(() => {
    const subcribe = firestore()
      .collectionGroup('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        setPosts(
          snapshot.docs
            .filter(doc => acceptedEmail.includes(doc.data().userEmail))
            .map(post => {
              return {id: post.id, data: post.data()};
            }),
        );
      });

    return () => {
      subcribe();
    };
  }, [acceptedEmail]);

  // Load more
  // useEffect(() => {
  //   console.log('useEffect offset', offset);

  //   setIsLoading(true);
  //   getNewPosts();

  //   return () => {};
  // }, [offset]);

  // const getNewPosts = () => {
  //   console.log('----getNewPosts----');

  //   setCurrentPosts(currentPosts.concat(posts.slice(offset, offset + 5)));
  //   setIsLoading(false);
  // };

  // const handleLoadMore = () => {
  //   if (posts && offset < posts.length) {
  //     console.log('handleLoadMore');

  //     setOffset(offset + 5);
  //     setIsLoading(true);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.postList}
        ListEmptyComponent={() => (
          <Text style={styles.noPost}>Bạn chưa có bài viết nào</Text>
        )}
        ListHeaderComponent={() => <Stories />}
        renderItem={({item}) => {
          return <Post post={item} navigation={navigation} />;
        }}
        // onEndReached={handleLoadMore}
        // onEndReachedThreshold={0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  postList: {
    paddingBottom: 75,
  },

  loader: {
    marginTop: 15,
    alignItems: 'center',
  },

  noPost: {
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
