import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import ChatScreen from './src/screens/ChatScreen';
import BuildScreen from './src/screens/BuildScreen';
import ImportScreen from './src/screens/ImportScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProjectScreen from './src/screens/ProjectScreen';
import LogsScreen from './src/screens/LogsScreen';
import ArtifactsScreen from './src/screens/ArtifactsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { SettingsProvider } from './src/contexts/SettingsContext';
import { ProjectsProvider } from './src/contexts/ProjectsContext';
import { BuildQueueProvider } from './src/contexts/BuildQueueContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <SettingsProvider>
        <ProjectsProvider>
          <BuildQueueProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Chat">
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="Import" component={ImportScreen} />
                <Stack.Screen name="Build" component={BuildScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Project" component={ProjectScreen} />
                <Stack.Screen name="Logs" component={LogsScreen} />
                <Stack.Screen name="Artifacts" component={ArtifactsScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </BuildQueueProvider>
        </ProjectsProvider>
      </SettingsProvider>
    </PaperProvider>
  );
}

