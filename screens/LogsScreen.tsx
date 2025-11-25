import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { readAsStringAsync, getInfoAsync, writeAsStringAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";

const LOG_FILE = (documentDirectory || cacheDirectory) + "logs.json";
const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";

type PostLog = {
  pageId: string;
  success: boolean;
  response: any;
  caption: string;
  imageName: string;
  timestamp: string;
};

type PageSetting = {
  pageName: string;
  pageId: string;
  accessToken: string;
};

export default function LogTab() {
  const [logs, setLogs] = useState<PostLog[]>([]);
  const [pageMap, setPageMap] = useState<{ [pageId: string]: string }>({});

  // Reload data when Logs tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadLogs = async () => {
        try {
          const info = await getInfoAsync(LOG_FILE);
          if (info.exists) {
            const logText = await readAsStringAsync(LOG_FILE);
            setLogs(JSON.parse(logText).reverse()); // Most recent at top
          } else {
            setLogs([]);
          }
        } catch {
          setLogs([]);
        }
      };

      const loadPageSettings = async () => {
        try {
          const info = await getInfoAsync(SETTINGS_FILE);
          if (info.exists) {
            const settingsText = await readAsStringAsync(SETTINGS_FILE);
            const data = JSON.parse(settingsText);
            const idMap: { [pageId: string]: string } = {};
            for (let page of (data.pages || [])) {
              idMap[page.pageId] = page.pageName;
            }
            setPageMap(idMap);
          } else {
            setPageMap({});
          }
        } catch {
          setPageMap({});
        }
      };

      loadLogs();
      loadPageSettings();
    }, [])
  );

  const successLogs = logs.filter(l => l.success);
  const failedLogs = logs.filter(l => !l.success);

  function getPageNameLabel(pageId: string) {
    const pageName = pageMap[pageId];
    return pageName ? `${pageName} (${pageId})` : pageId;
  }

  const clearSuccessfulLogs = () => {
    Alert.alert(
      "Clear Successful Logs",
      "Are you sure you want to delete ONLY successful logs?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: async () => {
            const onlyFailed = logs.filter(l => !l.success);
            await writeAsStringAsync(LOG_FILE, JSON.stringify([...onlyFailed].reverse()));
            setLogs(onlyFailed);
          }
        }
      ]
    );
  };

  const clearFailedLogs = () => {
    Alert.alert(
      "Clear Failed Logs",
      "Are you sure you want to delete ONLY failed logs?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: async () => {
            const onlySuccess = logs.filter(l => l.success);
            await writeAsStringAsync(LOG_FILE, JSON.stringify([...onlySuccess].reverse()));
            setLogs(onlySuccess);
          }
        }
      ]
    );
  };

  return (
    <View style={logStyles.container}>
      <Text style={logStyles.section}>Successful Posts</Text>
      <FlatList
        style={logStyles.list}
        data={successLogs}
        keyExtractor={(_, idx) => "success" + idx}
        renderItem={({ item }) => (
          <View style={logStyles.logRow}>
            <Text style={logStyles.pageId}>{getPageNameLabel(item.pageId)}</Text>
            <Text style={logStyles.caption}>{item.caption}</Text>
            <Text style={logStyles.timestamp}>{item.timestamp}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={logStyles.empty}>No successful logs.</Text>}
      />

      <Text style={logStyles.section}>Failed Posts</Text>
      <FlatList
        style={logStyles.list}
        data={failedLogs}
        keyExtractor={(_, idx) => "failed" + idx}
        renderItem={({ item }) => (
          <View style={logStyles.logRowError}>
            <Text style={logStyles.pageId}>{getPageNameLabel(item.pageId)}</Text>
            <Text style={logStyles.caption}>{item.caption}</Text>
            <Text style={logStyles.timestamp}>{item.timestamp}</Text>
            <Text style={logStyles.error}>{JSON.stringify(item.response)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={logStyles.empty}>No failed logs.</Text>}
      />
      <View style={logStyles.buttonRow}>
        <Button title="Clear Successful Logs" color="#107913ff" onPress={clearSuccessfulLogs} />
        <Button title="Clear Failed Logs" color="#f38564ff" onPress={clearFailedLogs} />
      </View>
    </View>
  );
}

const logStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f8e9", padding: 20, marginTop: 20,},
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  section: { fontSize: 20, fontWeight: "bold", color: "#388e3c", marginTop: 16, marginBottom: 5 },
  list: { backgroundColor: "#fff", borderRadius: 10, padding: 6, marginBottom: 12 },
  logRow: { padding: 8, marginVertical: 2, borderRadius: 10, backgroundColor: "#e3f2fd" },
  logRowError: { padding: 8, marginVertical: 2, borderRadius: 10, backgroundColor: "#ffebee" },
  pageId: { fontWeight: "bold", color: "#1976d2", fontSize: 15 },
  caption: { color: "#222", fontSize: 15, marginTop: 2 },
  timestamp: { fontSize: 10, color: "#9e9e9e", marginTop: 1 },
  error: { color: "#d32f2f", fontSize: 11 },
  empty: { color: "#bdbdbd", paddingVertical: 16, textAlign: "center" },
});
