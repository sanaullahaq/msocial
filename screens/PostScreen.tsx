import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radii, typography, card } from "../theme/theme";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, Button, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from 'expo-image-picker';
import { writeAsStringAsync, getInfoAsync, readAsStringAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";
import { validateSubsKey } from "../utils/utils";
import AlertBox from "../components/AlertBox";
import AppButton from "../components/AppButton";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";
const LOG_FILE = (documentDirectory || cacheDirectory) + "logs.json";

type PageEntry = { pageId: string; pageName: string; accessToken: string };
type AlertType = 'success' | 'warning' | 'error';

export default function FacebookPostTab() {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

const [showAlert, setShowAlert] = useState(false);
const [alertType, setAlertType] = useState<AlertType>('success');
// Use state for custom title/message
const [alertTitle, setAlertTitle] = useState('Operation Successful');
const [alertMessage, setAlertMessage] = useState('Your post was published.');

  // Inside your PostTab component
  useFocusEffect(
    React.useCallback(() => {
      // Reload pages from settings.json
      const loadPages = async () => {
        const settingsContent = await readAsStringAsync(SETTINGS_FILE);
        const settings = JSON.parse(settingsContent);
        setPages(settings.pages || []);
      };
      loadPages();
    }, [])
  );

  // Load saved pages from settings on mount
  useEffect(() => {
    const loadPages = async () => {
      try {
        const settingsContent = await readAsStringAsync(SETTINGS_FILE);
        const settings = JSON.parse(settingsContent);
        const loadedPages: PageEntry[] = settings.pages || [];

        setPages(loadedPages);

        // Select all by default
        const allIds = loadedPages.map((p: PageEntry) => p.pageId);
        setSelectedPageIds(allIds);

        // Keep toggle state in sync
        setAllSelected(loadedPages.length > 0);
      } catch {
        setPages([]);
        setSelectedPageIds([]);
        setAllSelected(false);
      }
    };
    loadPages();
  }, []);


  // For toggling page selection
  const isSelected = (pageId: string) => selectedPageIds.includes(pageId);

  const toggleSelect = (pageId: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const selectAll = () => {
    setSelectedPageIds(pages.map(p => p.pageId));
    setAllSelected(true);
  };

  const unselectAll = () => {
    setSelectedPageIds([]);
    setAllSelected(false);
  };

  // Pick image from device
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  async function appendLog(entry: { pageId: any; success: boolean; response: any; caption: string | null | undefined; }) {
    let logs = [];
    try {
      const info = await getInfoAsync(LOG_FILE);
      if (info.exists) {
        const logText = await readAsStringAsync(LOG_FILE);
        logs = JSON.parse(logText);
      }
    } catch {}
    logs.push({ ...entry, timestamp: new Date().toLocaleString() });
    await writeAsStringAsync(LOG_FILE, JSON.stringify(logs));
  }

  // Main submission logic, filtered to only selected pages
  const submitPostToFacebook = async () => {
    setLoading(true);
    try {
      if (images.length === 0 && !caption) {
        setLoading(false);
        // To show alert:
        setAlertTitle('Warning!');
        setAlertType('warning');
        setAlertMessage("Please select at least one image or enter a caption or both.");
        setShowAlert(true);
        return;
      }

      const chosenPages = pages.filter(p => selectedPageIds.includes(p.pageId));

      if (chosenPages.length === 0) {
        setLoading(false);
        // Alert.alert("Please select at least one Facebook page.");
        setAlertTitle('Warning!');
        setAlertType('warning');
        setAlertMessage("Please select at least one Facebook page.");
        setShowAlert(true);
        return;
      }

      let postErrors = [];

      for (const { pageId, pageName, accessToken } of chosenPages) {
        let mediaIds = [];

        for (const image of images) {
          const uri = image.uri;
          const name =
            image.fileName ||
            uri.split('/').pop() ||
            `photo-${Date.now()}.jpg`;

          const type =
            image.mimeType ||
            (() => {
              const extension = uri.split('.').pop()?.toLowerCase();
              if (extension === 'png') return 'image/png';
              if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
              return 'application/octet-stream';
            })();

          let formData = new FormData();
          formData.append("published", "false");
          formData.append("access_token", accessToken);
          formData.append("source", {
            uri,
            name,
            type,
          } as any);

          try {
            const uploadRes = await fetch(
              `https://graph.facebook.com/${pageId}/photos`,
              {
                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
                body: formData,
              }
            );
            const uploadJson = await uploadRes.json();
            if (uploadJson.id) {
              mediaIds.push(uploadJson.id);
            } else {
              postErrors.push({ pageId, error: uploadJson });
            }
          } catch (err) {
            postErrors.push({ pageId, error: err });
          }
        }

        let feedFormData = new FormData();
        feedFormData.append("message", caption);
        feedFormData.append("access_token", accessToken);
        
        if (mediaIds.length > 0) {
          mediaIds.forEach((mediaId, idx) => {
            feedFormData.append(
              `attached_media[${idx}]`,
              JSON.stringify({ media_fbid: mediaId })
            );
          });
        }

        try {
          const feedRes = await fetch(
            `https://graph.facebook.com/${pageId}/feed`,
            {
              method: "POST",
              headers: {
                "Content-Type": "multipart/form-data"
              },
              body: feedFormData,
            }
          );
          const feedJson = await feedRes.json();
          const isSuccess = !!feedJson.id;
          if (!isSuccess) {
            postErrors.push({ pageId, error: feedJson });
          }
          await appendLog({
            pageId,
            success: isSuccess,
            response: feedJson,
            caption: (caption ?? "")
        });
        } catch (err) {
          postErrors.push({ pageId, error: err });
        }
        // }
      }

      const pageNameMap: { [key: string]: string } = {};
      pages.forEach(({ pageId, pageName }: { pageId: string; pageName: string }) => {
        pageNameMap[pageId] = pageName;
      });

      if (postErrors.length === 0) {
        // Alert.alert("Post published to selected pages!");
        setAlertTitle('Success!');
        setAlertType('success');
        setAlertMessage("Post published to selected pages!");
        setShowAlert(true);
        setCaption("");
        setImages([]);
      } else {
        setAlertTitle('Post failed!');
        setAlertType('warning');
        setAlertMessage(
          `For page(s): ${[
              ...new Set(
                postErrors
                  .map((e) => pageNameMap[e.pageId] || "Unknown")
                  .filter(Boolean)
              )
            ].join(", ")}`
        );
        setShowAlert(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setAlertTitle('Error!');
        setAlertType('error');
        setAlertMessage(error.message);
        setShowAlert(true);
      } else {
        setAlertTitle('Error!');
        setAlertType('error');
        setAlertMessage(String(error));
        setShowAlert(true);
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={postStyles.container}>
      <AlertBox
        visible={showAlert}
        type={alertType}
        title={alertTitle}         // Custom title
        message={alertMessage}     // Custom message
        onClose={() => setShowAlert(false)}
      />
      <Text style={postStyles.header}>Create a Post</Text>
      <Text style={postStyles.headerSub}>
        Compose and publish to multiple Facebook pages at once.
      </Text>

      {pages.length > 0 && (
        <View style={postStyles.card}>
          <Text style={postStyles.sectionTitle}>Content</Text>
          <TextInput
            multiline
            numberOfLines={5}
            style={postStyles.input}
            placeholder="Enter caption..."
            placeholderTextColor="#90a4ae"
            value={caption}
            onChangeText={setCaption}
          />
          {/* <Button title="Attach Image" color={colors.textMuted} onPress={pickImage} /> */}
          <AppButton title="Attach Image" variant="ghost" onPress={pickImage} />
          <View style={postStyles.imagePreviewRow}>
            {images.map((img, idx) => (
              <View key={idx} style={postStyles.imagePreviewContainer}>
                <Image
                  source={{ uri: img.uri }}
                  style={postStyles.imagePreview}
                />
                <TouchableOpacity
                  style={postStyles.removeButton}
                  onPress={() => {
                    // Remove the image at index idx
                    setImages(prevImages => prevImages.filter((_, i) => i !== idx));
                  }}
                >
                <Text style={postStyles.removeButtonIcon}>ⓧ</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={postStyles.card}>
        <View style={postStyles.sectionRow}>
          <TouchableOpacity
            onPress={() => {
              if (allSelected) {
                unselectAll();
              } else {
                selectAll();
              }
            }}
            style={postStyles.sectionIconButton}
          >
            {allSelected ? (
              <Feather name="x-square" size={18} color={colors.textMain} />
            ) : (
              <Feather name="check-square" size={18} color={colors.textMain} />
            )}
          </TouchableOpacity>

          <Text style={postStyles.sectionTitle}>Select Pages to Post</Text>
        </View>

        {pages.length === 0 && (
          <Text style={{ color: "#a00", marginBottom: 10 }}>No Facebook pages configured in Settings.</Text>
        )}
        <View style={postStyles.pageList}>
          {pages.map(({ pageId, pageName }) => (
            <TouchableOpacity
              key={pageId}
              style={postStyles.pageItem}
              onPress={() => toggleSelect(pageId)}
            >
              <Text style={postStyles.check}>{isSelected(pageId) ? "☑" : "☐"}</Text>
              <Text style={postStyles.pageText}>{pageName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && (
        <ActivityIndicator size="large" color="#002a4dff" style={{ marginVertical: 20 }} />
      )}
      {/* {pages.length > 0 && ( */}
      {selectedPageIds.length > 0 && (
        // <Button
        //   title="Submit Post"
        //   color="#04a7f3ff"
        //   onPress={submitPostToFacebook}
        //   disabled={loading || selectedPageIds.length === 0}
        // />
        <AppButton title="Submit Post" variant="primary" onPress={submitPostToFacebook} />
      )}
    </ScrollView>
    </SafeAreaView>
  );
}


const postStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    // paddingTop: spacing.xl,
  },
  header: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  headerSub: {
    ...typography.muted,
    marginBottom: spacing.lg,
  },
  card: {
    ...card.base,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  input: {
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.lg,
    color: colors.textMain,
    minHeight: 80,
  },
  pageList: { marginBottom: spacing.sm },
  pageItem: {
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginVertical: 2,
    backgroundColor: colors.primarySoft,
  },
  // pageSelected: { backgroundColor: "#b2ebf2" },
  pageText: {
    ...typography.body,
    flex: 1,
    paddingLeft: spacing.sm,
  },
  check: { fontSize: 16 },
  buttonsRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  imagePreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: spacing.sm,
  },
  imagePreviewContainer: {
    position: "relative",
    margin: 4,
    width: 80,
    height: 80,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: radii.sm,
    borderColor: colors.borderSoft,
    borderWidth: 1,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -4,
    borderRadius: 10,
    padding: 2,
    elevation: 2,
    shadowColor: "#ccc",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  removeButtonIcon: {
    fontSize: 18,
    color: colors.textMain,
  },
  // NEW:
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionIconButton: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
});
