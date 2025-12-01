import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  readAsStringAsync,
  getInfoAsync,
  documentDirectory,
  cacheDirectory,
} from "expo-file-system/legacy";
import { ImagePickerAsset } from "expo-image-picker";

import { PostStackParamList } from "../../App";
import { colors, spacing, radii, typography, card } from "../../theme/theme";
import AppButton from "../../components/AppButton";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import AlertBox from "../../components/AlertBox";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";

type PageEntry = { pageId: string; pageName: string; accessToken: string };

type Props = NativeStackScreenProps<PostStackParamList, "PostStep2">;
type AlertType = "success" | "warning" | "error";

export default function PostStep2Screen({ route, navigation }: Props) {
  const { caption, images } = route.params;

  const [pages, setPages] = useState<PageEntry[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Load pages and select all by default
  useEffect(() => {
    const loadPages = async () => {
      try {
        const info = await getInfoAsync(SETTINGS_FILE);
        if (!info.exists) {
          setPages([]);
          setSelectedPageIds([]);
          setAllSelected(false);
          return;
        }
        const settingsContent = await readAsStringAsync(SETTINGS_FILE);
        const settings = JSON.parse(settingsContent);
        const loadedPages: PageEntry[] = settings.pages || [];
        setPages(loadedPages);
        const allIds = loadedPages.map((p) => p.pageId);
        setSelectedPageIds(allIds);
        setAllSelected(loadedPages.length > 0);
      } catch {
        setPages([]);
        setSelectedPageIds([]);
        setAllSelected(false);
      }
    };
    loadPages();
  }, []);

  const isSelected = (pageId: string) => selectedPageIds.includes(pageId);

  const toggleSelect = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId];
      setAllSelected(next.length > 0 && next.length === pages.length);
      return next;
    });
  };

  const selectAll = () => {
    const allIds = pages.map((p) => p.pageId);
    setSelectedPageIds(allIds);
    setAllSelected(pages.length > 0);
  };

  const unselectAll = () => {
    setSelectedPageIds([]);
    setAllSelected(false);
  };

  // Now only navigates to Step 3 with data; Step 3 will do posting + progress
  const goToStep3 = () => {
    if (selectedPageIds.length === 0) {
      setAlertType("warning");
      setAlertTitle("No pages selected");
      setAlertMessage("Please select at least one Facebook page.");
      setAlertVisible(true);
      return;
    }
    navigation.navigate("PostStep3", {
      caption,
      images: images as ImagePickerAsset[],
      pageIds: selectedPageIds,
    });
  };
  const handleCloseAlert = () => {
    setAlertVisible(false);
    // navigation.navigate("PostStep2");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AlertBox
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Pages</Text>
          <Text style={styles.subtitle}>
            Choose which pages should receive this post.
          </Text>

          {pages.length > 0 && (
            <View style={styles.sectionRow}>
              <TouchableOpacity
                onPress={() => {
                  if (allSelected) unselectAll();
                  else selectAll();
                }}
                style={styles.toggleAll}
                >
                <Text style={styles.toggleText}>
                  {allSelected ? "Unselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {pages.length === 0 && (
            <Text style={styles.helper}>
              No Facebook pages configured. Please add pages in Page Settings.
            </Text>
          )}

          <ScrollView style={styles.pageList}>
            {pages.map(({ pageId, pageName }) => (
              <TouchableOpacity
                key={pageId}
                style={[
                  styles.pageItem,
                  // isSelected(pageId) && styles.pageSelected,
                ]}
                onPress={() => toggleSelect(pageId)}
              >
                <Text style={styles.check}>
                  {isSelected(pageId) ? "✅" : "⬜"}
                </Text>
                <Text style={styles.pageText}>{pageName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.navRow}>
          <AppButton
            title="Back"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <AppButton
            title="Submit Post"
            variant="primary"
            onPress={goToStep3}
            style={{ flex: 1, marginLeft: spacing.sm }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  card: {
    ...card.base,
    flex: 1,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  subtitle: {
    ...typography.muted,
    marginBottom: spacing.md,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.sm,
  },
  toggleAll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  toggleText: {
    ...typography.body,
    color: colors.primary,
    fontSize: 13,
  },
  helper: {
    ...typography.muted,
    marginBottom: spacing.sm,
  },
  pageList: {
    marginTop: spacing.sm,
  },
  pageItem: {
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginVertical: 2,
    backgroundColor: colors.primarySoft,
  },
  // pageSelected: {
    // backgroundColor: "#b2ebf2",
  // },
  pageText: {
    ...typography.body,
    flex: 1,
    paddingLeft: spacing.sm,
  },
  check: {
    fontSize: 16,
  },
  navRow: {
    flexDirection: "row",
  },
});
