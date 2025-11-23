import React, { useEffect, useState } from "react";
  import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, Button, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from 'expo-image-picker';
import { writeAsStringAsync, getInfoAsync, readAsStringAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";
import { validateSubsKey } from "../utils/utils";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";
const LOG_FILE = (documentDirectory || cacheDirectory) + "logs.json";

type PageEntry = { pageId: string; pageName: string; accessToken: string };

export default function FacebookPostTab() {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

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
      if (images.length === 0) {
        setLoading(false);
        Alert.alert("Please select at least one image.");
        return;
      }

      const chosenPages = pages.filter(p => selectedPageIds.includes(p.pageId));

      if (chosenPages.length === 0) {
        setLoading(false);
        Alert.alert("Please select at least one Facebook page.");
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

        if (mediaIds.length > 0) {
          let feedFormData = new FormData();
          feedFormData.append("message", caption);
          feedFormData.append("access_token", accessToken);

          mediaIds.forEach((mediaId, idx) => {
            feedFormData.append(
              `attached_media[${idx}]`,
              JSON.stringify({ media_fbid: mediaId })
            );
          });

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
        }
      }

      const pageNameMap: { [key: string]: string } = {};
      pages.forEach(({ pageId, pageName }: { pageId: string; pageName: string }) => {
        pageNameMap[pageId] = pageName;
      });

      if (postErrors.length === 0) {
        Alert.alert("Post published to selected pages!");
        setCaption("");
        setImages([]);
      } else {
        Alert.alert(
          "Some posts failed",
          `Failed for: ${postErrors
            .map((e) => pageNameMap[e.pageId] || "Unknown")
            .filter(name => name)
            .join(", ")}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", String(error));
      }
    }
    setLoading(false);
  };

  return (
    <ScrollView style={{ backgroundColor: "#fff", paddingTop: 10, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
      {/* Caption input */}
      <TextInput
        multiline={true}
        numberOfLines={5}
        style={{
          // height: 50,
          borderColor: '#cccccc',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          backgroundColor: '#fff',
          color: '#000',
          fontSize: 18,
          marginBottom: 18,
          minHeight: 80
        }}
        placeholder="Enter caption..."
        placeholderTextColor="#aaa"
        value={caption}
        onChangeText={setCaption}
      />

      {/* Pages selection */}
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Select Pages to Post</Text>
      {pages.length === 0 && (
        <Text style={{ color: "#a00", marginBottom: 10 }}>No Facebook pages configured in Settings.</Text>
      )}
      <View style={{ marginBottom: 10 }}>
        {pages.map(({ pageId, pageName }) => (
          <TouchableOpacity
            key={pageId}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              backgroundColor: isSelected(pageId) ? "#eef" : "#fff"
            }}
            onPress={() => toggleSelect(pageId)}
          >
            <Text style={{ fontSize: 16, flex: 1 }}>{pageName}</Text>
            <Text style={{ fontSize: 16 }}>
              {isSelected(pageId) ? "✅" : "⬜"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: "row", marginBottom: 24 }}>
        <Button title="Select All" onPress={selectAll} />
        <View style={{ width: 12 }} />
        <Button title="Unselect All" onPress={unselectAll} />
      </View>

      {/* Images preview */}
      <Button title="Attach Image" onPress={pickImage} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img.uri }}
            style={{ width: 80, height: 80, margin: 4, borderRadius: 8 }}
          />
        ))}
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginVertical: 20 }}
        />
      )}
      <Button
        title="Submit Post"
        onPress={submitPostToFacebook}
        disabled={loading || selectedPageIds.length === 0}
        // color="#007AFF"
      />
    </ScrollView>
  );
}