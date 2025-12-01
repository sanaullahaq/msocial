import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { TabParamList } from "../App";
import { colors, spacing, typography, card } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = BottomTabScreenProps<TabParamList, "Home">;

import Feather from "@expo/vector-icons/Feather";

const features = [
  { key: "Post", title: "Post", icon: "send" as const },
  { key: "Logs", title: "Logs", icon: "file-text" as const },
  { key: "Page Settings", title: "Page Settings", icon: "settings" as const },
  { key: "User Settings", title: "User Settings", icon: "user" as const },
  { key: "Manual", title: "Manual", icon: "info" as const },
];


export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={styles.container}>
        {/* Top welcome area similar to Canva 3rd image */}
        <View style={styles.headerCard}>
            <Text style={styles.welcomeSmall}>Welcome back,</Text>
            <Text style={styles.welcomeBig}>Manage Your Posts</Text>
            <Text style={styles.welcomeBody}>
            Quickly jump into posting, check logs, update settings or read the manual.
            </Text>
        </View>

        {/* Feature cards below “Featured Food” area analogy */}
        <Text style={styles.sectionTitle}>Featured Actions</Text>

        <View style={styles.grid}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(item.key as keyof TabParamList)}
            >
              <Feather
                name={item.icon}
                size={28}
                color={colors.primary}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  headerCard: {
    ...card.base,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceSoft,
  },
  welcomeSmall: {
    ...typography.muted,
    marginBottom: spacing.xs,
  },
  welcomeBig: {
    ...typography.title,
    fontSize: 24,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  welcomeBody: {
    ...typography.body,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    ...card.base,
    width: "48%",
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  cardIcon: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 16,
    textAlign: "center",
  },
  cardBody: {
    ...typography.body,
    fontSize: 13,
  },
});
