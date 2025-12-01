import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";

import LogsScreen from "./screens/LogsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import UserManualScreen from "./screens/UserManualScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import UserSettingsScreen from "./screens/UserSettingsScreen";
import PostStep1Screen from "./screens/Post/Step1Screen";
import PostStep2Screen from "./screens/Post/Step2Screen";
import PostStep3Screen from "./screens/Post/Step3Screen";
import { ImagePickerAsset } from 'expo-image-picker';


export type PostStackParamList = {
  PostStep1: undefined;
  PostStep2: {
    caption: string;
    images: ImagePickerAsset[];
  };
  PostStep3: {
    caption: string;
    images: ImagePickerAsset[];
    pageIds: string[]; // selected pages
  };
};

const PostStack = createNativeStackNavigator<PostStackParamList>();

function PostFlow() {
  return (
    <PostStack.Navigator screenOptions={{ headerShown: false }}>
      <PostStack.Screen name="PostStep1" component={PostStep1Screen} />
      <PostStack.Screen name="PostStep2" component={PostStep2Screen} />
      <PostStack.Screen name="PostStep3" component={PostStep3Screen} />
    </PostStack.Navigator>
  );
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export type TabParamList = {
  Home: undefined;
  Post: undefined;
  Logs: undefined;
  "Page Settings": undefined;
  "User Settings": undefined;
  Manual: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {display: "none"}
        // tabBarStyle: {
        //   backgroundColor: colors.surface,
        //   borderTopLeftRadius: 18,
        //   borderTopRightRadius: 18,
        //   height: 70,
        //   paddingBottom: 8,
        //   paddingTop: 6,
        //   position: "absolute",
        //   left: 0,
        //   right: 0,
        //   bottom: 0,
        //   elevation: 12,
        //   shadowColor: "#000",
        //   shadowOpacity: 0.08,
        //   shadowRadius: 8,
        //   shadowOffset: { width: 0, height: -2 },
        //   borderTopWidth: 0,
        // },
        // tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        // tabBarActiveTintColor: colors.primary,
        // tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Post"
              // component={PostScreen}
              component={PostFlow}
              options={{
                tabBarLabel: "Post",
                tabBarIcon: ({ color, size }) => (
                  // <Ionicons name="send" color={color} size={size} />
                  <Feather name="send" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Logs"
              component={LogsScreen}
              options={{
                tabBarLabel: "Logs",
                tabBarIcon: ({ color, size }) => (
                  // <Ionicons name="document-text" color={color} size={size} />
                  <Feather name="file-text" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Page Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: "Page Settings",
                tabBarIcon: ({ color, size }) => (
                  // <Ionicons name="settings" color={color} size={size} />
                    <Feather name="settings" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="User Settings"
              component={UserSettingsScreen}
              options={{
                tabBarLabel: "User Settings",
                tabBarIcon: ({ color, size }) => (
                  // <Ionicons name="" color={color} size={size} />
                  <Feather name="user" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Manual"
              component={UserManualScreen}
              options={{
                tabBarLabel: "Manual",
                tabBarIcon: ({ color, size }) => (
                  // <Ionicons name="information-circle-sharp" color={color} size={size} />
                  <Feather name="info" color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
