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
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 5, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Button title="Clear Successful Logs" color="#2e8b57" onPress={clearSuccessfulLogs} />
        <Button title="Clear Failed Logs" color="#d11d1d" onPress={clearFailedLogs} />
      </View>

      <Text style={styles.header}>Successful Posts</Text>
      <FlatList
        data={successLogs}
        keyExtractor={(_, idx) => "success" + idx}
        renderItem={({ item }) => (
          <View style={styles.logRow}>
            <Text style={styles.pageId}>{getPageNameLabel(item.pageId)}</Text>
            <Text numberOfLines={1} style={styles.caption}>{item.caption}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#444" }}>No successful logs.</Text>}
      />

      <Text style={styles.header}>Failed Posts</Text>
      <FlatList
        data={failedLogs}
        keyExtractor={(_, idx) => "failed" + idx}
        renderItem={({ item }) => (
          <View style={[styles.logRow, { backgroundColor: "#fee" }]}>
            <Text style={styles.pageId}>{getPageNameLabel(item.pageId)}</Text>
            <Text numberOfLines={1} style={styles.caption}>{item.caption}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            <Text style={{ color: "red", fontSize: 10 }}>{JSON.stringify(item.response)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#444" }}>No failed logs.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: "bold", marginVertical: 8, color: "#222" },
  logRow: { padding: 6, borderBottomColor: "#ddd", borderBottomWidth: 1 },
  pageId: { fontWeight: "bold", color: "#555" },
  caption: { color: "#333", fontSize: 14 },
  timestamp: { fontSize: 10, color: "#888" }
});