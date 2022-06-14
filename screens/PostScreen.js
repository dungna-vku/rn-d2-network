/* eslint-disable react-hooks/exhaustive-deps */
import {
  SafeAreaView,
  View,
  Image,
  Text,
  SectionList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import Comment from '../components/postDetail/Comment';
import Panel from '../components/postDetail/Panel';
import AddComment from '../components/postDetail/AddComment';

const MAX_WIDTH = Dimensions.get('window').width - 30;

const PostScreen = ({navigation, route}) => {
  const {id, userEmail, createdAt} = route.params;
  const [user, setUser] = useState();
  const [post, setPost] = useState();
  const [comments, setComments] = useState([]);
  const userRef = firestore().collection('users').doc(userEmail);

  // Get user information
  useEffect(() => {
    const subcribe = userRef.onSnapshot(snapshot => {
      setUser(snapshot.data());
    });

    return () => {
      subcribe();
    };
  }, []);

  // Get post detail
  useEffect(() => {
    const subcribe = userRef
      .collection('posts')
      .doc(id)
      .onSnapshot(snapshot => {
        const data = snapshot.data();

        setPost(data);
        setComments(data.comments);
      });

    return () => {
      subcribe();
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height '}
        style={styles.flex1}>
        <View style={styles.flex1}>
          <Header
            navigation={navigation}
            userEmail={userEmail}
            user={user}
            createdAt={createdAt}
          />

          {post && (
            <SectionList
              keyExtractor={(item, index) => index.toString()}
              sections={[
                {
                  title: 'Content',
                  data: [post],
                  renderItem: () => <Content post={post} />,
                },
                {
                  title: 'Panel',
                  data: [post],
                  renderItem: () => <Panel id={id} post={post} />,
                },
                {
                  title: 'Comments',
                  data: comments,
                  renderItem: ({item}) => (
                    <Comment navigation={navigation} id={id} comment={item} />
                  ),
                },
              ]}
              ListFooterComponent={() =>
                comments.length ? (
                  <></>
                ) : (
                  <Text style={styles.noComment}>Chưa có bình luận</Text>
                )
              }
            />
          )}

          {user && post && <AddComment user={user} id={id} post={post} />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Header = ({navigation, userEmail, user, createdAt}) => {
  const arr = new Date(createdAt).toLocaleDateString().split('/');
  const date = `${arr[1]}/${arr[0]}/${arr[2]}`;

  const gotoProfile = () => {
    navigation.navigate('UserProfileScreen', {id: userEmail});
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backIconContainer}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../assets/back.png')}
          style={styles.backIconImage}
        />
      </TouchableOpacity>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={gotoProfile}>
          <Image
            source={{uri: user && user.profilePicture}}
            style={styles.headerPicture}
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <TouchableOpacity onPress={gotoProfile}>
            <Text style={styles.headerName}>{user && user.username}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTime}>
            {`${new Date(createdAt).toLocaleTimeString()}, ${date}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const Content = ({post}) => (
  <View style={styles.contentContainer}>
    {post.caption !== '' && <Text style={styles.caption}>{post.caption}</Text>}

    {post.imageURL !== '' && (
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: post.imageURL,
          }}
          style={[
            styles.image,
            {
              width: MAX_WIDTH,
              height: Math.round(
                (MAX_WIDTH * post.imageHeight) / post.imageWidth,
              ),
            },
          ]}
        />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  flex1: {
    flex: 1,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 50,
  },

  backIconContainer: {
    position: 'absolute',
    left: 0,
  },

  backIconImage: {
    width: 50,
    height: 50,
  },

  headerLeft: {
    flexDirection: 'row',
    marginLeft: 50,
  },

  headerPicture: {
    width: 50,
    height: 50,
    resizeMode: 'cover',
    borderRadius: 50,
  },

  headerInfo: {
    marginLeft: 15,
    justifyContent: 'space-between',
  },

  headerName: {
    fontWeight: '700',
    fontSize: 16,
  },

  headerTime: {
    color: 'gray',
  },

  // Content
  contentContainer: {
    marginVertical: 15,
  },

  caption: {
    fontSize: 16,
    marginHorizontal: 15,
  },

  imageContainer: {
    width: MAX_WIDTH,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 15,
  },

  image: {
    borderRadius: 15,
  },

  noComment: {
    fontWeight: 'bold',
    fontSize: 16,
    margin: 15,
  },
});

export default PostScreen;
