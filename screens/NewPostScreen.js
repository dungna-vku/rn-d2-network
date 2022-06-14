import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AddNewPost from '../components/newPost/AddNewPost';

const NewPostScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <AddNewPost navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default NewPostScreen;
