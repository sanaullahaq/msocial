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
import {
  passwordToBinary,
  saveUser,
  saveSubscriptionKey,
} from "../utils/utils";
import AppButton from "../components/AppButton";
import AlertBox from "../components/AlertBox";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionKey, setSubscriptionKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showAlert("warning", "Missing info", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("warning", "Password mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const passwordBinary = passwordToBinary(password);
      await saveUser({ name: name.trim(), email: email.trim(), passwordBinary });
      if (subscriptionKey.trim()) {
        await saveSubscriptionKey(subscriptionKey.trim());
      }

      showAlert(
        "success",
        "Account created",
        "Your account has been created. Please sign in."
      );
    } catch (e) {
      showAlert(
        "error",
        "Error",
        "Failed to save your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertType === "success") {
      navigation.replace("Login");
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
          <Text style={styles.title}>Key Registration</Text>
          <Text style={styles.subtitle}>
            Sign up to start posting to your Facebook pages.
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
            onChangeText={setSubscriptionKey}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <AppButton
            title="Save"
            variant="primary"
            onPress={handleSignUp}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />

          <Text style={styles.footerText}>
            Already registered?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.replace("Login")}
            >
              Sign In
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
