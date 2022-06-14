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

// Kiểm tra điều kiện input
const LoginFormchema = Yup.object().shape({
  email: Yup.string().email().required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu cần có ít nhất 6 kí tự')
    .required('Vui lòng nhập mật khẩu'),
});

const LoginForm = ({navigation}) => {
  // Hàm Login
  const onLogin = async (email, password) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      firestore()
        .enableNetwork()
        .then(async () => {
          Keyboard.dismiss();

          await firestore()
            .collection('users')
            .doc(email)
            .update({online: true});
        });
    } catch (error) {
      Alert.alert(
        String(error.message).includes('user-not-found')
          ? 'Email chưa được đăng ký'
          : 'Mật khẩu chưa đúng',
      );
    }
  };

  return (
    <Formik
      initialValues={{email: '', password: ''}}
      onSubmit={values => {
        onLogin(values.email, values.password);
      }}
      validationSchema={LoginFormchema}
      validateOnMount={true}>
      {({handleBlur, handleChange, handleSubmit, values, isValid}) => (
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
              autoCorrect={false}
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

          <View style={styles.forgotContainer}>
            <TouchableOpacity onPress={() => console.log('forgot')}>
              <Text style={[styles.forgotText, styles.textSize]}>
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton(isValid)}
            onPress={handleSubmit}
            disabled={!isValid}>
            <Text style={[styles.loginText, styles.textSize]}>Đăng nhập</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.textSize}>Chưa có tài khoản?</Text>
            <TouchableOpacity>
              <Text
                onPress={() => navigation.push('SignupScreen')}
                style={[styles.signUpText, styles.textSize]}>
                {' '}
                Đăng ký
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

export default LoginForm;
