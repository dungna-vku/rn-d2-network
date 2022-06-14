import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';
import BottomTabs from '../components/navigation/BottomTabs';
import Header from '../components/navigation/Header';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewPostScreen from '../screens/NewPostScreen';
import InboxScreen from '../screens/InboxScreen';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import IncomingCallScreen from '../screens/IncomingCallScreen';
import OutgoingCallScreen from '../screens/OutgoingCallScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PostScreen from '../screens/PostScreen';
// import PostScreen from '../screens/PostScreen';

const screenOptions = {headerShown: false};

const Tab = createBottomTabNavigator();

const MyTabs = () => (
  <Tab.Navigator
    tabBar={props => <BottomTabs {...props} />}
    initialRouteName="HomeScreen"
    screenOptions={screenOptions}>
    <Tab.Screen name="HomeScreen" component={HomeScreen} />
    <Tab.Screen name="SearchScreen" component={SearchScreen} />
    <Tab.Screen name="NotificationScreen" component={NotificationScreen} />
    <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
  </Tab.Navigator>
);

const Stack = createNativeStackNavigator();

const SignInStack = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="MyTabs">
      <Stack.Screen
        name="MyTabs"
        component={MyTabs}
        options={{
          header: props => <Header {...props} />,
          headerShadowVisible: false,
          headerStyle: {padding: 15},
        }}
      />
      <Stack.Screen
        name="NewPostScreen"
        component={NewPostScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="InboxScreen"
        component={InboxScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="IncomingCallScreen"
        component={IncomingCallScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="OutgoingCallScreen"
        component={OutgoingCallScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="VideoCallScreen"
        component={VideoCallScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="UserProfileScreen"
        component={ProfileScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="PostScreen"
        component={PostScreen}
        options={screenOptions}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const SignOutStack = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={screenOptions}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

const Navigation = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    return auth().onAuthStateChanged(user =>
      user ? setCurrentUser(user) : setCurrentUser(null),
    );
  }, []);

  return <>{currentUser ? <SignInStack /> : <SignOutStack />}</>;
};

export default Navigation;
