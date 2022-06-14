import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

const MAX_WIDTH = Dimensions.get('window').width - 60;

const Post = ({post, navigation}) => {
  const authEmail = auth().currentUser.email;
  const data = post.data;
  const [user, setUser] = useState();

  // Get avatar and username of the author of the post
  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(data.userEmail)
      .onSnapshot(snapshot => {
        const snapData = snapshot.data();
        setUser({
          profilePicture: snapData.profilePicture,
          username: snapData.username,
        });
      });

    return () => {
      subcribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const likeHandler = () => {
    const currentLikeStatus = !data.likesByUsers.includes(
      auth().currentUser.email,
    );

    firestore()
      .collection('users')
      .doc(data.userEmail)
      .collection('posts')
      .doc(post.id)
      .update({
        likesByUsers: currentLikeStatus
          ? firebase.firestore.FieldValue.arrayUnion(authEmail)
          : firebase.firestore.FieldValue.arrayRemove(authEmail),
      })
      .then(() => {
        // Notify user about liking the post
        if (data.userEmail !== authEmail) {
          if (currentLikeStatus) {
            firestore()
              .collection('users')
              .doc(data.userEmail)
              .collection('notifications')
              .add({
                userEmail: authEmail,
                time: new Date().getTime(),
                type: 'like post',
                relatedId: post.id,
                seen: false,
              })
              .then(() => {
                firestore()
                  .collection('users')
                  .doc(data.userEmail)
                  .update({
                    newNotifications:
                      firebase.firestore.FieldValue.increment(1),
                  });
              });
          }
        }
      });
  };

  const shadowLeftBottomStyle = {
    ios: {
      shadowColor: '#CCC',
      shadowOffset: {width: -4, height: 4},
      shadowOpacity: 0.4,
    },
    android: {
      elevation: 4,
    },
  };

  const shadowRightTopStyle = {
    ios: {
      shadowColor: '#CCC',
      shadowOffset: {width: 4, height: -4},
      shadowOpacity: 0.4,
    },
    android: {},
  };

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'ios'
          ? shadowLeftBottomStyle.ios
          : shadowLeftBottomStyle.android,
      ]}>
      <View
        style={[
          styles.innerContainer,
          Platform.OS === 'ios'
            ? shadowRightTopStyle.ios
            : shadowRightTopStyle.android,
        ]}>
        <PostHeader navigation={navigation} user={user} post={post.data} />
        <PostCaption post={post.data} />
        {data && data.imageURL !== '' && <PostImage post={post.data} />}
        <PostFooter
          id={post.id}
          post={post.data}
          likeHandler={likeHandler}
          navigation={navigation}
        />
      </View>
    </View>
  );
};

const PostHeader = ({navigation, user, post}) => {
  const arr = new Date(post.createdAt).toLocaleDateString().split('/');
  const date = `${arr[1]}/${arr[0]}/${arr[2]}`;

  const gotoProfile = () => {
    navigation.navigate('UserProfileScreen', {id: post.userEmail});
  };

  return (
    <View style={styles.header}>
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
            {`${new Date(post.createdAt).toLocaleTimeString()}, ${date}`}
          </Text>
        </View>
      </View>

      {/* <TouchableOpacity>
        <Text style={styles.headerMenu}>...</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const PostCaption = ({post}) => (
  <Text style={styles.caption}>{post.caption}</Text>
);

const PostImage = ({post}) => {
  return (
    <View style={styles.imageContainer}>
      <Image
        source={{uri: post.imageURL}}
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
  );
};

const PostFooter = ({id, post, likeHandler, navigation}) => (
  <View style={styles.footer}>
    <View style={styles.footerIconPanel}>
      <View style={styles.footerLeftIcon}>
        <View style={styles.footerIconContainer}>
          <TouchableOpacity onPress={() => likeHandler()}>
            <Image
              source={
                post.likesByUsers.includes(auth().currentUser.email)
                  ? require('../../assets/heart-filled.png')
                  : require('../../assets/heart.png')
              }
              style={styles.footerIconImage}
            />
          </TouchableOpacity>
          <Text style={styles.footerIconText}>{post.likesByUsers.length}</Text>
        </View>

        <View style={styles.footerIconContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PostScreen', {
                id: id,
                userEmail: post.userEmail,
                createdAt: post.createdAt,
              })
            }>
            <Image
              source={require('../../assets/comment.png')}
              style={styles.footerIconImage}
            />
          </TouchableOpacity>
          <Text style={styles.footerIconText}>{post.comments.length}</Text>
        </View>
      </View>

      {/* <TouchableOpacity>
        <Image
          source={require('../../assets/bookmark.png')}
          style={styles.footerLastIcon}
        />
      </TouchableOpacity> */}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 15,
    backgroundColor: 'white',
  },

  innerContainer: {
    flex: 1,
    borderRadius: 15,
    paddingBottom: 15,
    backgroundColor: 'white',
  },

  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },

  headerLeft: {
    flexDirection: 'row',
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

  headerMenu: {
    color: '#666',
    fontSize: 20,
    fontWeight: '900',
  },

  // Caption section
  caption: {
    fontSize: 16,
    marginHorizontal: 15,
  },

  // Image section
  imageContainer: {
    width: MAX_WIDTH,
    marginTop: 15,
    marginHorizontal: 15,
  },

  image: {
    borderRadius: 15,
  },

  // Footer section
  footer: {
    marginTop: 15,
  },

  footerIconPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerLeftIcon: {
    flexDirection: 'row',
  },

  footerIconContainer: {
    width: '33%',
    flexDirection: 'row',
  },

  footerIconImage: {
    width: 25,
    height: 25,
    marginLeft: 15,
  },

  footerIconText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
    marginHorizontal: 7,
  },

  footerLastIcon: {
    width: 25,
    height: 25,
    marginRight: 15,
  },

  footerLike: {
    margin: 15,
  },

  footerLikeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Comment section
  comment: {
    color: 'gray',
    fontSize: 16,
    marginHorizontal: 15,
  },
});

export default Post;
