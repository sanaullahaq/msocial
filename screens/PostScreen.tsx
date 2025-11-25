import React, { useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, Button, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from 'expo-image-picker';
import { writeAsStringAsync, getInfoAsync, readAsStringAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";
import { validateSubsKey } from "../utils/utils";
import AlertBox from "../modals/alertbox";

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
        const loadedPages = settings.pages || [];
        setPages(loadedPages);
        setSelectedPageIds(loadedPages.map((p: PageEntry) => p.pageId)); // Select all by default
      } catch {
        setPages([]);
        setSelectedPageIds([]);
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

  const selectAll = () => setSelectedPageIds(pages.map(p => p.pageId));
  const unselectAll = () => setSelectedPageIds([]);

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

  async function appendLog(entry: { pageId: any; success: boolean; response: any; caption: string; imageName: string; }) {
    let logs = [];
    try {
      const info = await getInfoAsync(LOG_FILE);
      if (info.exists) {
        const logText = await readAsStringAsync(LOG_FILE);
        logs = JSON.parse(logText);
      }
    } catch {}
    // logs.push({ ...entry, timestamp: new Date().toISOString() });
    logs.push({ ...entry, timestamp: new Date().toLocaleString() });
    await writeAsStringAsync(LOG_FILE, JSON.stringify(logs));
  }

  // Main submission logic, filtered to only selected pages
  const submitPostToFacebook = async () => {
    setLoading(true);

    // // SUBSCRIPTION KEY CHECKING
    // const isValid = await validateSubsKey();
    // if (!isValid) {
    //   setLoading(false);
    //   Alert.alert("Invalid Subscription Key", "Please check your Subscription Key and try again.");
    //   return;
    // }

    try {
      if (images.length === 0 && !caption) {
        setLoading(false);
        // Alert.alert("Please select at least one image or enter a caption.");
        // To show alert:
        setAlertTitle('Error!');
        setAlertType('error');
        setAlertMessage("Please select at least one image or enter a caption.");
        setShowAlert(true);
        return;
      }

      const chosenPages = pages.filter(p => selectedPageIds.includes(p.pageId));

      if (chosenPages.length === 0) {
        setLoading(false);
        // Alert.alert("Please select at least one Facebook page.");
        setAlertTitle('Error!');
        setAlertType('error');
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
            await appendLog({
              pageId,
              success: !!uploadJson.id,
              response: uploadJson,
              caption,
              imageName: name,
            });
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
        // Alert.alert(
        //   "Some posts failed",
        //   `Failed for: ${[
        //       ...new Set(
        //         postErrors
        //           .map((e) => pageNameMap[e.pageId] || "Unknown")
        //           .filter(Boolean)
        //       )
        //     ].join(", ")}`
        // );
        setAlertTitle('"Some posts failed"!');
        setAlertType('warning');
        setAlertMessage(
          `Failed for: ${[
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
        // Alert.alert("Error", error.message);
        setAlertTitle('Error!');
        setAlertType('error');
        setAlertMessage(error.message);
        setShowAlert(true);
      } else {
        // Alert.alert("Error", String(error));
        setAlertTitle('Error!');
        setAlertType('error');
        setAlertMessage(String(error));
        setShowAlert(true);
      }
    }
    setLoading(false);
  };

  return (
    <ScrollView style={postStyles.container}>
      <AlertBox
        visible={showAlert}
        type={alertType}
        title={alertTitle}         // Custom title
        message={alertMessage}     // Custom message
        onClose={() => setShowAlert(false)}
      />
      <Text style={postStyles.header}>Create a Post</Text>
      {pages.length > 0 && (
      <TextInput
        multiline
        numberOfLines={5}
        style={postStyles.input}
        placeholder="Enter caption..."
        placeholderTextColor="#90a4ae"
        value={caption}
        onChangeText={setCaption}
      />
      )}

      <Text style={postStyles.sectionTitle}>Select Pages to Post</Text>
      {pages.length === 0 && (
        <Text style={{ color: "#a00", marginBottom: 10 }}>No Facebook pages configured in Settings.</Text>
      )}
      <View style={postStyles.pageList}>
        {pages.map(({ pageId, pageName }) => (
          <TouchableOpacity
            key={pageId}
            style={[postStyles.pageItem, isSelected(pageId) && postStyles.pageSelected]}
            onPress={() => toggleSelect(pageId)}
          >
            <Text style={postStyles.pageText}>{pageName}</Text>
            <Text style={postStyles.check}>{isSelected(pageId) ? "✅" : "⬜"}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {pages.length > 0 && (
        <View style={postStyles.buttonsRow}>
          <Button title="Select All" color="#04a7f3ff" onPress={selectAll} />
          <View style={{ width: 12 }} />
          <Button title="Unselect All" color="#f5c228ff" onPress={unselectAll} />
        </View>
      )}

      {pages.length > 0 && (
        <Button title="Attach Image" color="#a4b4bbff" onPress={pickImage} />
      )}
      {pages.length > 0 && (
        <View style={postStyles.imagePreviewRow}>
          {images.map((img, idx) => (
            <Image
            key={idx}
            source={{ uri: img.uri }}
            style={postStyles.imagePreview}
            />
          ))}
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#002a4dff" style={{ marginVertical: 20 }} />
      )}
      {/* {pages.length > 0 && ( */}
      {selectedPageIds.length > 0 && (
        <Button
          title="Submit Post"
          color="#04a7f3ff"
          onPress={submitPostToFacebook}
          disabled={loading || selectedPageIds.length === 0}
        />
      )}
    </ScrollView>
  );
}

const postStyles = StyleSheet.create({
  container: { backgroundColor: "#f9fbe7", padding: 20, flex: 1, marginTop: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 18, color: "#1976d2" },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6, color: "#388e3c" },
  input: { borderColor: '#bdbdbd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#fff', fontSize: 18, marginBottom: 18, minHeight: 80, color: "#222"},
  pageList: { marginBottom: 10 },
  pageItem: {paddingLeft: 10, paddingRight: 10, flexDirection: "row", alignItems: "center", paddingVertical: 8, borderRadius: 8, marginVertical: 2, backgroundColor: "#e1f5fe" },
  pageSelected: { backgroundColor: "#b2ebf2" },
  pageText: { fontSize: 16, flex: 1, color: "#222" },
  check: { fontSize: 16 },
  buttonsRow: { flexDirection: "row", marginBottom: 20 },
  imagePreviewRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 8 },
  imagePreview: { width: 80, height: 80, margin: 4, borderRadius: 10, borderColor: "#bdbdbd", borderWidth: 1 },
});