import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FormikPostUploader from './FormikPostUploader';

const AddNewPost = ({navigation}) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height '}
    style={styles.flex_1}>
    <TouchableWithoutFeedback style={styles.flex_1} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <FormikPostUploader navigation={navigation} />
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);

const Header = ({navigation}) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity
      style={styles.backIconContainer}
      onPress={() => navigation.goBack()}>
      <Image
        source={require('../../assets/back.png')}
        style={styles.backIconImage}
      />
    </TouchableOpacity>
    <Text style={styles.headerText}>Tạo bài viết</Text>
  </View>
);

const styles = StyleSheet.create({
  flex_1: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  // Header section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 15,
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
});

export default AddNewPost;
