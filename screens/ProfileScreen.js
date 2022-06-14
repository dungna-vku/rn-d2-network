import React, {useState, useEffect, Fragment} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import ProfileContent from '../components/profile/ProfileContent';
import Info from '../components/profile/Info';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ProfileScreen = ({navigation, route}) => {
  const [user, setUser] = useState();
  const [isFollowing, setIsFollowing] = useState(false);
  const notAuth =
    !!route.params && route.params.id !== auth().currentUser.email;
  const id = notAuth ? route.params.id : auth().currentUser.email;

  // Get user data
  useEffect(() => {
    const subcribe = firestore()
      .collection('users')
      .doc(id)
      .onSnapshot(doc => {
        setUser(doc.data());
      });

    return () => {
      subcribe();
      console.log('[SYS] Clean up - Profile 1');
    };
  }, [id, notAuth]);

  // If not main user then check this user is in following list or not
  useEffect(() => {
    if (notAuth) {
      const subcribe = firestore()
        .collection('users')
        .doc(auth().currentUser.email)
        .onSnapshot(doc => {
          const authFollowing = doc.data().following;
          setIsFollowing(authFollowing.includes(id));
        });
      return () => {
        subcribe();
        console.log('[SYS] Clean up - Profile 2');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Fragment>
      <SafeAreaView style={styles.flex_0}>
        {(notAuth || !!route.params) && <Back navigation={navigation} />}
      </SafeAreaView>
      <ScrollView style={styles.container}>
        <Info
          navigation={navigation}
          id={id}
          user={user}
          notAuth={notAuth}
          isFollowing={isFollowing}
        />
        {!notAuth || isFollowing ? (
          <ProfileContent navigation={navigation} id={id} />
        ) : (
          <View style={styles.privateContainer}>
            <Text style={styles.privateText}>Đây là tài khoản riêng tư</Text>
            <Text style={styles.followText}>
              Hãy theo dõi để thấy ảnh và bài viết của họ
            </Text>
          </View>
        )}
      </ScrollView>
    </Fragment>
  );
};

const Back = ({navigation}) => (
  <View style={styles.backContainer}>
    <TouchableOpacity
      style={styles.backIconContainer}
      onPress={() => navigation.goBack()}>
      <Image
        source={require('../assets/back.png')}
        style={styles.backIconImage}
      />
    </TouchableOpacity>
    <Text style={styles.backText}>Trang cá nhân</Text>
  </View>
);

const styles = StyleSheet.create({
  flex_0: {
    flex: 0,
    backgroundColor: 'white',
  },

  flex_1: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Back panel
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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

  backText: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Private section
  privateContainer: {
    alignItems: 'center',
    marginTop: 15,
  },

  privateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  followText: {
    fontSize: 16,
    marginTop: 15,
  },
});

export default ProfileScreen;
