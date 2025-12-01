import { colors, spacing, radii, typography, card } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  readAsStringAsync,
  getInfoAsync,
  writeAsStringAsync,
  documentDirectory,
  cacheDirectory,
} from "expo-file-system/legacy";

const LOG_FILE = (documentDirectory || cacheDirectory) + "logs.json";
const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";

type PostLog = {
  pageId: string;
  success: boolean;
  response: any;
  caption: string;
  // imageName: string;
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
            for (let page of data.pages || []) {
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

  const successLogs = logs.filter((l) => l.success);
  const failedLogs = logs.filter((l) => !l.success);

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
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            const onlyFailed = logs.filter((l) => !l.success);
            await writeAsStringAsync(
              LOG_FILE,
              JSON.stringify([...onlyFailed].reverse())
            );
            setLogs(onlyFailed);
          },
        },
      ]
    );
  };

  const clearFailedLogs = () => {
    Alert.alert(
      "Clear Failed Logs",
      "Are you sure you want to delete ONLY failed logs?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            const onlySuccess = logs.filter((l) => l.success);
            await writeAsStringAsync(
              LOG_FILE,
              JSON.stringify([...onlySuccess].reverse())
            );
            setLogs(onlySuccess);
          },
        },
      ]
    );
  };

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={logStyles.container}>
      <View style={logStyles.sectionRow}>
        <Text style={logStyles.section}>Successful Posts</Text>
        <TouchableOpacity
          onPress={clearSuccessfulLogs}
          style={logStyles.sectionIconButton}
        >
          <Ionicons name="trash" size={18} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <View style={logStyles.listCard}>
        <FlatList
          scrollEnabled={false}
          data={successLogs}
          keyExtractor={(_, idx) => "success" + idx}
          renderItem={({ item }) => (
            <View style={logStyles.logRow}>
              <Text style={logStyles.pageId}>
                {getPageNameLabel(item.pageId)}
              </Text>
              <Text style={logStyles.caption}>{item.caption}</Text>
              <Text style={logStyles.timestamp}>{item.timestamp}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={logStyles.empty}>No successful logs.</Text>
          }
        />
      </View>

      <View style={logStyles.sectionRow}>
        <Text style={logStyles.section}>Failed Posts</Text>
        <TouchableOpacity
          onPress={clearFailedLogs}
          style={logStyles.sectionIconButton}
        >
          <Ionicons name="trash" size={18} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <View style={logStyles.listCard}>
        <FlatList
          scrollEnabled={false}
          data={failedLogs}
          keyExtractor={(_, idx) => "failed" + idx}
          renderItem={({ item }) => (
            <View style={logStyles.logRowError}>
              <Text style={logStyles.pageId}>
                {getPageNameLabel(item.pageId)}
              </Text>
              <Text style={logStyles.caption}>{item.caption}</Text>
              <Text style={logStyles.timestamp}>{item.timestamp}</Text>
              <Text style={logStyles.error}>
                {JSON.stringify(item.response)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={logStyles.empty}>No failed logs.</Text>
          }
        />
      </View>
    </ScrollView>
  </SafeAreaView>
);

}

const logStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  section: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  listCard: {
    ...card.base,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  logRow: {
    padding: spacing.sm,
    marginVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  logRowError: {
    padding: spacing.sm,
    marginVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: "#ffebee",
  },
  pageId: {
    fontWeight: "bold",
    color: colors.primary,
    fontSize: 15,
  },
  caption: {
    ...typography.body,
    marginTop: 2,
  },
  timestamp: {
    ...typography.muted,
    fontSize: 10,
    marginTop: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  error: { 
    color: "#d32f2f", 
    fontSize: 11
  },
  empty: { 
    color: "#bdbdbd", 
    paddingVertical: 16, 
    textAlign: "center"
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 5,
  },
  sectionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffebee",
  },
});
