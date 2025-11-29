// screens/LoginScreen.tsx
import React, { useState } from "react";
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
import { RootStackParamList } from "../App";
import { colors, spacing, radii, typography, card } from "../theme/theme";
import { passwordToBinary, loadUser } from "../utils/utils";
import AppButton from "../components/AppButton";
import AlertBox from "../components/AlertBox";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert("warning", "Missing info", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const stored = await loadUser();
      if (!stored) {
        showAlert(
          "error",
          "No account found",
          "Please sign up before trying to sign in."
        );
        return;
      }

      const enteredBinary = passwordToBinary(password);
      if (
        stored.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        stored.passwordBinary === enteredBinary
      ) {
        showAlert("success", "Welcome back", "Login successful.");
      } else {
        showAlert(
          "error",
          "Invalid credentials",
          "Email or password is incorrect."
        );
      }
    } catch (e) {
      showAlert("error", "Error", "Failed to read stored credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    const wasSuccess = alertType === "success";
    setAlertVisible(false);
    if (wasSuccess) {
      navigation.replace("MainTabs");
    }
  };

  return (
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
          onClose={handleCloseAlert}
        />

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage posts across your Facebook pages.
          </Text>

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
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <AppButton
            title="Sign In"
            variant="primary"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />

          {/* Forgot password intentionally ignored for now */}

          <Text style={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.replace("SignUp")}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    justifyContent: "center",
  },
  card: {
    ...card.base,
  },
  title: {
    ...typography.title,
    textAlign: "center",
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  subtitle: {
    ...typography.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
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
  footerText: {
    ...typography.muted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "600",
  },
});
