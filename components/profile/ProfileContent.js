import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import Post from '../home/Post';
import firestore from '@react-native-firebase/firestore';

const IMAGE_SIZE = (Dimensions.get('window').width - 60) / 3;

const ProfileContent = ({navigation, id}) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .doc(id)
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        setPosts(
          snapshot.docs.map(doc => {
            return {id: doc.id, data: doc.data()};
          }),
        );
      });

    return () => subscriber();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ảnh</Text>
      <View style={styles.imageSection}>
        {posts.length !== 0 &&
          posts.map(
            (post, index) =>
              post.data.imageURL !== '' &&
              index < 10 && (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{uri: post.data.imageURL}}
                    style={styles.image}
                  />
                  <Text>{post.data.content}</Text>
                </View>
              ),
          )}
      </View>
      <Text style={styles.title}>Bài viết</Text>
      <View style={styles.postSection}>
        {posts.length !== 0 &&
          posts.map((post, index) => (
            <Post post={post} key={index} navigation={navigation} />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 90,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15,
  },

  imageSection: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },

  imageContainer: {
    width: '33.33%',
    paddingLeft: 15,
  },

  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    resizeMode: 'cover',
    borderRadius: 15,
  },

  postSection: {
    flex: 1,
  },
});

export default ProfileContent;
