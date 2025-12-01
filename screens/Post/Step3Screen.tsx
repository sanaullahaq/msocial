import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  readAsStringAsync,
  getInfoAsync,
  writeAsStringAsync,
  documentDirectory,
  cacheDirectory,
} from "expo-file-system/legacy";
import { ImagePickerAsset } from "expo-image-picker";

import { PostStackParamList } from "../../App";
import { colors, spacing, radii, typography, card } from "../../theme/theme";
import AlertBox from "../../components/AlertBox";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";
const LOG_FILE = (documentDirectory || cacheDirectory) + "logs.json";

type PageEntry = { pageId: string; pageName: string; accessToken: string };
type AlertType = "success" | "warning" | "error";

type Props = NativeStackScreenProps<PostStackParamList, "PostStep3">;

export default function PostStep3Screen({ route, navigation }: Props) {
  const { caption, images, pageIds } = route.params;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // start progress animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    // start posting logic
    const run = async () => {
      try {
        const settingsContent = await readAsStringAsync(SETTINGS_FILE);
        const settings = JSON.parse(settingsContent);
        const allPages: PageEntry[] = settings.pages || [];
        const pages = allPages.filter((p) => pageIds.includes(p.pageId));

        const postErrors: { pageId: string; error: any }[] = [];

        for (const { pageId, pageName, accessToken } of pages) {
          const mediaIds: string[] = [];

          // upload images
          for (const image of images as ImagePickerAsset[]) {
            const uri = image.uri;
            const name =
              (image as any).fileName ||
              uri.split("/").pop() ||
              `photo-${Date.now()}.jpg`;

            const type =
              (image as any).mimeType ||
              (() => {
                const extension = uri.split(".").pop()?.toLowerCase();
                if (extension === "png") return "image/png";
                if (extension === "jpg" || extension === "jpeg")
                  return "image/jpeg";
                return "application/octet-stream";
              })();

            const formData = new FormData();
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

          const feedFormData = new FormData();
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
                headers: { "Content-Type": "multipart/form-data" },
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
              caption: caption ?? "",
            });
          } catch (err) {
            postErrors.push({ pageId, error: err });
          }
        }

        const pageNameMap: { [key: string]: string } = {};
        pages.forEach(({ pageId, pageName }) => {
          pageNameMap[pageId] = pageName;
        });

        if (postErrors.length === 0) {
          setAlertType("success");
          setAlertTitle("Post published");
          setAlertMessage("Post published to all selected pages.");
        } else {
          const failedNames = [
            ...new Set(
              postErrors
                .map((e) => pageNameMap[e.pageId] || "Unknown")
                .filter(Boolean)
            ),
          ].join(", ");

          setAlertType("warning");
          setAlertTitle("Post Failed");
          setAlertMessage(`For page(s): ${failedNames}`);
        }
      } catch (error) {
        setAlertType("error");
        setAlertTitle("Error");
        setAlertMessage(
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        setAlertVisible(true);
      }
    };

    run();
  }, [caption, images, pageIds, progress]);

  const handleCloseAlert = () => {
    setAlertVisible(false);
    navigation.navigate("PostStep1");
  };

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <AlertBox
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />

      <View style={styles.card}>
        <Text style={styles.header}>Posting to Facebook</Text>
        <Text style={styles.helper}>
          Please wait while your post is being sent to selected pages.
        </Text>

        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: widthInterpolate },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

async function appendLog(entry: {
  pageId: string;
  success: boolean;
  response: any;
  caption: string;
}) {
  let logs: any[] = [];
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

const BAR_HEIGHT = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    justifyContent: "center",
  },
  card: {
    ...card.base,
  },
  header: {
    ...typography.title,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  helper: {
    ...typography.muted,
    marginBottom: spacing.lg,
  },
  progressBarBackground: {
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.borderSoft,
    overflow: "hidden",
  },
  progressBarFill: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.primary,
  },
});
