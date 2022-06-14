import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {USERS} from '../../data/users';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';

const Stories = () => {
  // const [currentUserAvatar, setCurrentUserAvatar] = useState(null);
  // // const [users, setUsers] = useState([]);

  // // Lấy thông tin người dùng
  // useEffect(() => {
  //   try {
  //     let isSubcribed = true;

  //     firestore()
  //       .collection('users')
  //       .where('uid', '==', auth().currentUser.uid)
  //       .onSnapshot(snapshot => {
  //         if (isSubcribed && snapshot) {
  //           snapshot.docs.map(document => {
  //             setCurrentUserAvatar(document.data().profilePicture);
  //           });
  //         }
  //       });

  //     return () => {
  //       isSubcribed = false;
  //       console.log('[SYS] Clean up - Stories');
  //     };
  //   } catch (error) {
  //     console.log('[SYS] Permission denied - Stories');
  //   }
  // }, []);

  // Lấy danh sách người dùng đang online
  // useEffect(() => {
  //   let isSubcribed = true;

  //   firestore().collection('users').where()

  //   return () => {
  //     isSubcribed = false;
  //   }
  // }, [input])

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.story}>
          <View style={styles.newStoryContainer}>
            <View style={styles.newStoryInnerContainer}>
              <Text style={styles.newStoryIcon}>+</Text>
            </View>
          </View>

          <Text style={styles.text}>Thêm tin</Text>
        </TouchableOpacity>
        {USERS.map((story, index) => (
          <TouchableOpacity key={index} style={styles.story}>
            <LinearGradient
              colors={['#896AF3', '#53B8F7']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.storyImageContainer}>
              <View style={styles.innerContainer}>
                <Image source={{uri: story.image}} style={styles.storyImage} />
              </View>
            </LinearGradient>

            <Text numberOfLines={1} style={styles.text}>
              {story.user.length > 9
                ? story.user.slice(0, 8) + '...'
                : story.user.slice(0)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 15,
    // borderBottomWidth: 0.2,
    // borderBottomColor: 'gray',
  },

  newStoryContainer: {
    width: 70,
    height: 70,
    padding: 2,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#848484',
  },

  newStoryInnerContainer: {
    flex: 1,
    margin: 2,
    padding: 2,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#848484',
    justifyContent: 'center',
    alignItems: 'center',
  },

  story: {
    width: 70,
    marginLeft: 15,
    alignItems: 'center',
  },

  storyImageContainer: {
    width: '100%',
    height: 70,
    borderRadius: 15,
  },

  innerContainer: {
    flex: 1,
    borderRadius: 15,
    margin: 2,
    padding: 2,
    backgroundColor: 'white',
  },

  newStoryIcon: {
    fontSize: 36,
    color: '#848484',
  },

  storyImage: {
    flex: 1,
    borderRadius: 15,
  },

  text: {
    marginTop: 5,
  },
});

export default Stories;
