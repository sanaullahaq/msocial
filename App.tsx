// // import { StatusBar } from 'expo-status-bar';
// // import { StyleSheet, Text, View } from 'react-native';

// // export default function App() {
// //   return (
// //     <View style={styles.container}>
// //       <Text>Open up App.tsx to start working on your app!</Text>
// //       <StatusBar style="auto" />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });


// import * as React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';

// // Import your screens (replace with correct paths)
// import PostScreen from './screens/PostScreen';
// import LogsScreen from './screens/LogsScreen';
// import SettingsScreen from './screens/SettingsScreen';
// import UserManualScreen from './screens/UserManualScreen';

// const Tab = createBottomTabNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Tab.Navigator>
//         <Tab.Screen
//           name="Post"
//           component={PostScreen}
//           options={{
//             tabBarLabel: 'Post',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="send" color={color} size={size} />
//             ),
//           }}
//         />
//         <Tab.Screen
//           name="Logs"
//           component={LogsScreen}
//           options={{
//             tabBarLabel: 'Logs',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="document-text" color={color} size={size} />
//             ),
//           }}
//         />
//         <Tab.Screen
//           name="Settings"
//           component={SettingsScreen}
//           options={{
//             tabBarLabel: 'Settings',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="settings" color={color} size={size} />
//             ),
//           }}
//         />
//         <Tab.Screen
//           name="Manual"
//           component={UserManualScreen}
//           options={{
//             tabBarLabel: 'Manual',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="information-circle-sharp" color={color} size={size} />
//             ),
//           }}
//         />
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PostScreen from './screens/PostScreen';
import LogsScreen from './screens/LogsScreen';
import SettingsScreen from './screens/SettingsScreen';
import UserManualScreen from './screens/UserManualScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          // Removes top header
          headerShown: false,
          // Tab bar style
          tabBarStyle: {
            // paddingTop: 20,
            backgroundColor: '#c5c5abff', // light yellow/pastel
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            // height: 68, // optional, for a taller bar
            borderTopWidth: 0, // removes border line
            elevation: 12, // optional: shadow
            shadowColor: "#029be5",
          },
          tabBarActiveTintColor: '#1976d2',   // active icon/text
          tabBarInactiveTintColor: '#90a4ae', // inactive icon/text
        }}
      >
        <Tab.Screen
          name="Post"
          component={PostScreen}
          options={{
            tabBarLabel: 'Post',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="send" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Logs"
          component={LogsScreen}
          options={{
            tabBarLabel: 'Logs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Manual"
          component={UserManualScreen}
          options={{
            tabBarLabel: 'Manual',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="information-circle-sharp" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

