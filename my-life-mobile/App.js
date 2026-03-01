import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, FlatList, StyleSheet } from 'react-native';

const API = 'http://192.168.0.223:8787/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []))
      .catch(() => setTasks([]));
  }, []);

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.title}>My Life Mobile Board</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>Owner: {item.owner || 'Unassigned'} · {item.status}</Text>
            {item.nextMilestone ? <Text style={styles.meta}>Next: {item.nextMilestone}</Text> : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0f172a', padding: 14 },
  title: { color: '#e2e8f0', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  meta: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
});
