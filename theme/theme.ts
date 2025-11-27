// theme.ts
export const colors = {
  background: "#f4f6fb",
  surface: "#ffffff",
  surfaceSoft: "#f9fbe7",

  primary: "#2563eb",
  primarySoft: "#e3f2fd",
  success: "#107913ff",
  danger: "#d32f2f",
  warning: "#f5c228ff",

  textMain: "#111827",
  textMuted: "#9ca3af",
  textOnPrimary: "#ffffff",

  borderSoft: "#e5e7eb",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
};

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textMain,
  },
  body: {
    fontSize: 15,
    color: colors.textMain,
  },
  muted: {
    fontSize: 12,
    color: colors.textMuted,
  },
};

export const card = {
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
};
