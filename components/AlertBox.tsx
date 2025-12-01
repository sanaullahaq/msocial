import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, radii, typography, card } from "../theme/theme";

type AlertType = "success" | "warning" | "error";

interface AlertBoxProps {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  onClose: () => void;
}

const VARIANT: Record<
  AlertType,
  { color: string; bg: string; icon: string }
> = {
  success: { color: colors.success, bg: colors.background, icon: "✅" },
  warning: { color: colors.warning, bg: colors.background, icon: "⚠️" },
  error: { color: colors.danger, bg: colors.background, icon: "❌" },
};

const AlertBox: React.FC<AlertBoxProps> = ({
  visible,
  type = "success",
  title = "",
  message = "",
  onClose,
}) => {
  const style = VARIANT[type];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.alert,
            {
              backgroundColor: style.bg,
              borderTopColor: style.color,
            },
          ]}
        >
          <Text style={[styles.icon, { color: style.color }]}>
            {style.icon}
          </Text>

          {title ? (
            <Text style={[styles.title, { color: style.color }]}>{title}</Text>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: style.color }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.35)",
    paddingHorizontal: spacing.xl, // add this
  },
  alert: {
    ...card.base,               // if you’re spreading this
    width: "80%",               // fixed relative width
    maxWidth: 360,              // optional hard cap on large screens
    minHeight: 170,
    alignItems: "center",
    // borderTopWidth: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  icon: {
    fontSize: 34,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
    minWidth: 100,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: "center",
  },
  buttonText: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: "700",
  },
});

export default AlertBox;
