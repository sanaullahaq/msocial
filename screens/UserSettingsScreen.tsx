// screens/UserSettingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, spacing, radii, typography, card } from "../theme/theme";
import {
  loadUser,
  loadSubscriptionKey,
  saveSubscriptionKey,
  passwordToBinary,
  updateUser,
  StoredUser,
} from "../utils/utils";
import AppButton from "../components/AppButton";
import AlertBox from "../components/AlertBox";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  UserSettings: undefined;
  // add others if you want this in a stack, or use a different nav type
};

type Props = NativeStackScreenProps<RootStackParamList, "UserSettings"> | any;

export default function UserSettingsScreen({ navigation }: Props) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [subscriptionKey, setSubscriptionKeyState] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "warning" | "error">(
    "success"
  );
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (
    type: "success" | "warning" | "error",
    title: string,
    message: string
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const loadData = async () => {
      const storedUser = await loadUser();
      const storedSub = await loadSubscriptionKey();

      if (storedUser) {
        setUser(storedUser);
        setName(storedUser.name);
        setEmail(storedUser.email);
      }
      if (storedSub) {
        setSubscriptionKeyState(storedSub);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) {
      showAlert("error", "No user", "No stored user found. Please sign up again.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      showAlert("warning", "Missing info", "Name and email are required.");
      return;
    }

    setLoadingProfile(true);
    try {
      const updated = await updateUser({
        name: name.trim(),
        email: email.trim(),
      });
      if (updated) {
        setUser(updated);
      }

      await saveSubscriptionKey(subscriptionKey.trim());
      showAlert("success", "Saved", "Profile and subscription key updated.");
    } catch {
      showAlert("error", "Error", "Failed to update user settings.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      showAlert("error", "No user", "No stored user found. Please sign up again.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showAlert(
        "warning",
        "Missing info",
        "Please fill current, new and confirm password."
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert("warning", "Password mismatch", "New passwords do not match.");
      return;
    }

    setLoadingPassword(true);
    try {
      const currentBinary = passwordToBinary(currentPassword);
      if (currentBinary !== user.passwordBinary) {
        showAlert("error", "Incorrect password", "Current password is incorrect.");
        setLoadingPassword(false);
        return;
      }

      const newBinary = passwordToBinary(newPassword);
      const updated = await updateUser({ passwordBinary: newBinary });
      if (updated) {
        setUser(updated);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      showAlert("success", "Password updated", "Your password has been changed.");
    } catch {
      showAlert("error", "Error", "Failed to change password.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <AlertBox
            visible={alertVisible}
            type={alertType}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />

          {/* Profile + subscription card */}
          <View style={styles.card}>
            <Text style={styles.header}>User Settings</Text>
            <Text style={styles.helper}>
              Update your profile information and subscription key.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Subscription Key"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={subscriptionKey}
              onChangeText={setSubscriptionKeyState}
            />

            <AppButton
              title="Save Profile"
              variant="primary"
              onPress={handleSaveProfile}
              loading={loadingProfile}
              style={{ marginTop: spacing.md }}
            />
          </View>

          {/* Change password card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />

            <AppButton
              title="Update Password"
              variant="success"
              onPress={handleChangePassword}
              loading={loadingPassword}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  card: {
    ...card.base,
    marginBottom: spacing.lg,
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
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.textMain,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.sm,
  },
});
