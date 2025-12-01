import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import { PostStackParamList } from "../../App";
import { colors, spacing, radii, typography, card } from "../../theme/theme";
import AppButton from "../../components/AppButton";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertBox from "../../components/AlertBox";

type Props = NativeStackScreenProps<PostStackParamList, "PostStep1">;

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width - spacing.xl * 2;
type AlertType = "success" | "warning" | "error";

export default function PostStep1Screen({ navigation }: Props) {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const handleNext = () => {
    if ((images?.length ?? 0) === 0 && !caption) {
      setAlertType("warning");
      setAlertTitle("Missing content");
      setAlertMessage(
        "Please select at least one image or enter a caption or both."
      );
      setAlertVisible(true);
      return;
    }
    navigation.navigate("PostStep2", { caption, images });
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    // navigation.navigate("PostStep1");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <AlertBox
          visible={alertVisible}
          type={alertType}
          title={alertTitle}
          message={alertMessage}
          onClose={handleCloseAlert}
        />

        {/* Top Canva-like card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create a Post</Text>
          <Text style={styles.slogan}>Make post that goes everywhere</Text>
          <Text style={styles.subtitle}>
            Write your caption and attach images before choosing pages.
          </Text>

          <TextInput
            multiline
            numberOfLines={6}
            style={styles.captionInput}
            placeholder="Write your caption here..."
            placeholderTextColor={colors.textMuted}
            value={caption}
            onChangeText={setCaption}
          />

          <AppButton
            title="Attach Image"
            variant="ghost"
            onPress={pickImage}
          />

          {images.length > 0 && (
            <View style={styles.imageScrollContainer}>
              <ScrollView>
                <View style={styles.imageList}>
                  {images.map((img, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: img.uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Text style={styles.removeButtonIcon}>ⓧ</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Fixed navigation buttons */}
        <View style={styles.navRow}>
          <AppButton
            title="Back"
            variant="ghost"
            onPress={() => navigation.getParent()?.navigate("Home")}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <AppButton
            title="Next"
            variant="primary"
            onPress={handleNext}
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
    flex: 1,                // takes all space above buttons
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  slogan: {
    ...typography.muted,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.muted,
    marginBottom: spacing.lg,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.textMain,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    fontSize: typography.body.fontSize,
    minHeight: 130, // big box like Canva
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  imageScrollContainer: {
    marginTop: spacing.sm,
    // height: 320,            // fixed viewport for images
    flex: 1
  },
  imageList: {
    // marginTop: spacing.sm,
      paddingBottom: spacing.sm,
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  removeButtonIcon: {
    fontSize: 14,
    color: colors.textMain,
  },
  navRow: {
    flexDirection: "row",
  },
});
