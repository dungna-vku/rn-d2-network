import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import * as Yup from 'yup';
import {Formik} from 'formik';
import Validator from 'email-validator';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SignupFormchema = Yup.object().shape({
  email: Yup.string().email().required('Vui lòng nhập email'),
  username: Yup.string()
    .required('Vui lòng nhập tài khoản')
    .min(2, 'Tên tài khoản cần có ít nhất 2 ký tự'),
  password: Yup.string()
    .min(6, 'Mật khẩu cần có ít nhất 6 kí tự')
    .required('Vui lòng nhập mật khẩu'),
});

const SignupForm = ({navigation}) => {
  const onSignup = async (email, password, username) => {
    try {
      await auth()
        .createUserWithEmailAndPassword(email, password)
        .then(data => {
          firestore()
            .enableNetwork()
            .then(async () => {
              Keyboard.dismiss();

              await firestore().collection('users').doc(email).set({
                uid: data.user.uid,
                username: username,
                profilePicture:
                  'https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/default-avatar.png?alt=media&token=a26e761f-deef-4c0c-9219-85331ae59fe8',
                background:
                  'https://firebasestorage.googleapis.com/v0/b/d2-network.appspot.com/o/default-background.jpeg?alt=media&token=46da1447-5e6d-41f5-832f-a725d0de6a9b',
                posts: 0,
                newNotifications: 0,
                biography: '',
                online: true,
                hasStory: false,
                followers: [],
                following: [],
              });
            });
        });
    } catch (error) {
      Alert.alert('Email đã được sử dụng');
    }
  };

  return (
    <Formik
      initialValues={{email: '', username: '', password: ''}}
      onSubmit={values => {
        onSignup(values.email, values.password, values.username);
      }}
      validationSchema={SignupFormchema}
      validateOnMount={true}>
      {({handleBlur, handleChange, handleSubmit, values, errors, isValid}) => (
        <>
          <View
            style={[
              styles.inputField,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                borderColor:
                  values.email.length < 1 || Validator.validate(values.email)
                    ? '#CCC'
                    : 'red',
              },
            ]}>
            <TextInput
              placeholderTextColor="#444"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              style={styles.textSize}
            />
          </View>

          <View
            style={[
              styles.inputField,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                borderColor:
                  values.username.length < 1 || values.username.length >= 2
                    ? '#CCC'
                    : 'red',
              },
            ]}>
            <TextInput
              placeholderTextColor="#444"
              placeholder="Tên tài khoản"
              autoCapitalize="none"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
              style={styles.textSize}
            />
          </View>

          <View
            style={[
              styles.inputField,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                borderColor:
                  values.password.length < 1 || values.password.length >= 6
                    ? '#CCC'
                    : 'red',
              },
            ]}>
            <TextInput
              placeholderTextColor="#444"
              placeholder="Mật khẩu"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              textContentType="password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              style={styles.textSize}
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton(isValid)}
            onPress={handleSubmit}
            disabled={!isValid}>
            <Text style={[styles.loginText, styles.textSize]}>Đăng ký</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.textSize}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.signUpText, styles.textSize]}>
                {' '}
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: '#EDEDEF',
    padding: 15,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 15,
    marginHorizontal: 15,
  },

  textSize: {
    fontSize: 16,
  },

  forgotContainer: {
    alignItems: 'flex-end',
    marginRight: 15,
    marginBottom: 30,
  },

  forgotText: {
    color: '#1978F2',
  },

  loginButton: isValid => ({
    marginTop: 30,
    marginHorizontal: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isValid ? '#1990F2' : '#9ACAF7',
    borderRadius: 7,
  }),

  loginText: {
    color: 'white',
    fontWeight: '600',
  },

  signUpContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  signUpText: {
    color: '#1978F2',
  },
});

export default SignupForm;
