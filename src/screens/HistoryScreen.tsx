import React from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useProjects } from '@/contexts/ProjectsContext';
import { useNavigation } from '@react-navigation/native';

export default function HistoryScreen() {
  const { projects } = useProjects();
  const nav = useNavigation<any>();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))}
        keyExtractor={x => x.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate('Project', { id: item.id })} style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ddd' }}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text>Status: {item.status}</Text>
            {item.repoUrl ? <Text>{item.repoUrl}</Text> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

