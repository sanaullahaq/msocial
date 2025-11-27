// import React, { useEffect, useState } from "react";
// import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
// import { writeAsStringAsync, readAsStringAsync, getInfoAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";
// import AlertBox from "../modals/alertbox";

// const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";

// type PageSetting = { pageName: string; pageId: string; accessToken: string };
// type AlertType = 'success' | 'warning' | 'error';

// export default function SettingsScreen() {
//   const [subscriptionKey, setSubscriptionKey] = useState("");
//   const [pages, setPages] = useState<PageSetting[]>([]);
//   const [newPageName, setNewPageName] = useState("");
//   const [newPageId, setNewPageId] = useState("");
//   const [newAccessToken, setNewAccessToken] = useState("");
//   const [editIndex, setEditIndex] = useState<number | null>(null);
//   const [editPage, setEditPage] = useState<PageSetting | null>(null);

//   const [showAlert, setShowAlert] = useState(false);
//   const [alertType, setAlertType] = useState<AlertType>('success');
//     // Use state for custom title/message
//   const [alertTitle, setAlertTitle] = useState('Operation Successful');
//   const [alertMessage, setAlertMessage] = useState('Your post was published.');

//   useEffect(() => {
//     const loadSettings = async () => {
//       try {
//         const info = await getInfoAsync(SETTINGS_FILE);
//         if (!info.exists) return;
//         const content = await readAsStringAsync(SETTINGS_FILE);
//         const data = JSON.parse(content);
//         setSubscriptionKey(data.subscriptionKey || "");
//         setPages(data.pages || []);
//       } catch (e) {
//         console.log("Load error:", e);
//       }
//     };
//     loadSettings();
//   }, []);

//   const isFirstLoad = React.useRef(true);

//   useEffect(() => {
//     if (isFirstLoad.current) {
//       isFirstLoad.current = false;
//       return;
//     }
//     saveSettings();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pages]);

//   const saveSettings = async () => {
//     try {
//       const data = { subscriptionKey, pages };
//       await writeAsStringAsync(SETTINGS_FILE, JSON.stringify(data));
//     } catch (e) {
//       console.log(e);
//       setAlertTitle('Error!');
//       setAlertType('error');
//       setAlertMessage("Failed to save settings.");
//       setShowAlert(true);
//     }
//   };

//   const addPage = () => {
//     if (newPageName.trim() && newPageId.trim() && newAccessToken.trim()) {
//       setPages([...pages, {
//         pageName: newPageName.trim(),
//         pageId: newPageId.trim(),
//         accessToken: newAccessToken.trim()
//       }]);
//       setNewPageName("");
//       setNewPageId("");
//       setNewAccessToken("");
//     }
//   };

//   const removePage = (index: number) => {
//     setPages(pages.filter((_, i) => i !== index));
//     if (editIndex === index) {
//       setEditIndex(null);
//       setEditPage(null);
//     }
//   };

//   // Start editing a page
//   const startEdit = (index: number) => {
//     setEditIndex(index);
//     setEditPage({ ...pages[index] });
//   };

//   // Save the edited page
//   const saveEdit = () => {
//     if (!editPage?.pageName || !editPage?.pageId || !editPage?.accessToken) {
//       setAlertTitle('Warning!');
//       setAlertType('warning');
//       setAlertMessage("All fields are required.");
//       setShowAlert(true);
//       return;
//     }
//     setPages(pages.map((p, i) => (i === editIndex ? { ...editPage } : p)));
//     setEditIndex(null);
//     setEditPage(null);
//   };

//   // Cancel editing
//   const cancelEdit = () => {
//     setEditIndex(null);
//     setEditPage(null);
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//       keyboardVerticalOffset={70}
//     >
//       <ScrollView style={settingsStyles.container}>
//         <AlertBox
//           visible={showAlert}
//           type={alertType}
//           title={alertTitle}         // Custom title
//           message={alertMessage}     // Custom message
//           onClose={() => setShowAlert(false)}
//         />
//         <Text style={settingsStyles.header}>Settings</Text>
//         <Text style={settingsStyles.label}>Subscription Key:</Text>
//         <TextInput
//           value={subscriptionKey}
//           onChangeText={setSubscriptionKey}
//           placeholder="Enter Subscription Key"
//           placeholderTextColor="#90a4ae"
//           style={settingsStyles.input}
//         />
//         <TextInput
//           value={newPageName}
//           onChangeText={setNewPageName}
//           placeholder="Page Name"
//           placeholderTextColor="#90a4ae"
//           style={settingsStyles.input}
//         />
//         <TextInput
//           value={newPageId}
//           onChangeText={setNewPageId}
//           placeholder="Page ID"
//           placeholderTextColor="#90a4ae"
//           style={settingsStyles.input}
//         />
//         <TextInput
//           value={newAccessToken}
//           onChangeText={setNewAccessToken}
//           placeholder="Access Token"
//           placeholderTextColor="#90a4ae"
//           style={settingsStyles.input}
//         />
//         <Button title="Add Page" color="#107913ff" onPress={addPage} />

//         <Text style={settingsStyles.sectionTitle}>Configured Pages:</Text>
//         {pages.length === 0 && (
//           <Text style={settingsStyles.empty}>No pages added yet. Please add a Page Name, Page ID, and Access Token.</Text>
//         )}
//         {pages.map((page, index) => (
//           <View key={index} style={settingsStyles.pageCard}>
//             {editIndex === index && editPage ? (
//               <>
//                 <TextInput
//                   value={editPage.pageName}
//                   onChangeText={val => setEditPage({ ...editPage, pageName: val })}
//                   placeholder="Page Name"
//                   placeholderTextColor="#aaa"
//                   style={settingsStyles.inputSmall}
//                 />
//                 <TextInput
//                   value={editPage.pageId}
//                   onChangeText={val => setEditPage({ ...editPage, pageId: val })}
//                   placeholder="Page ID"
//                   placeholderTextColor="#aaa"
//                   style={settingsStyles.inputSmall}
//                 />
//                 <TextInput
//                   value={editPage.accessToken}
//                   onChangeText={val => setEditPage({ ...editPage, accessToken: val })}
//                   placeholder="Access Token"
//                   placeholderTextColor="#aaa"
//                   style={settingsStyles.inputSmall}
//                 />
//                 <View style={settingsStyles.buttonRow}>
//                   <TouchableOpacity onPress={saveEdit}>
//                     <Text style={{ color: "#388e3c", fontWeight: "bold", marginRight: 22 }}>Save</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={cancelEdit}>
//                     <Text style={{ color: "#d32f2f" }}>Cancel</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             ) : (
//               <>
//                 <Text style={settingsStyles.pageName}>{page.pageName}</Text>
//                 <Text style={settingsStyles.pageId}>{page.pageId}</Text>
//                 <Text style={settingsStyles.pageToken}>{page.accessToken ? page.accessToken.slice(0, 24) + "..." : ''}</Text>
//                 <View style={settingsStyles.buttonRow}>
//                   <TouchableOpacity onPress={() => startEdit(index)}>
//                     <Text style={{ color: "#1976d2", marginRight: 18 }}>Edit</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={() => removePage(index)}>
//                     <Text style={{ color: "#d32f2f" }}>Remove</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </View>
//         ))}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const settingsStyles = StyleSheet.create({
//   container: { backgroundColor: "#f1f8e9", padding: 24, flex: 1, marginTop: 20},
//   header: { fontSize: 25, fontWeight: "bold", color: "#1976d2", marginBottom: 14 },
//   label: { fontSize: 16, color: "#1976d2" },
//   input: { borderWidth: 1, borderColor: "#bdbdbd", backgroundColor: "#fff", color: "#222", padding: 12, borderRadius: 10, fontSize: 17, marginBottom: 10 },
//   sectionTitle: { fontWeight: "bold", fontSize: 16, color: "#388e3c", marginVertical: 10 },
//   empty: { color: "#90a4ae", textAlign: "center", marginVertical: 20 },
//   pageCard: { marginBottom: 13, backgroundColor: "#f9fbe7", borderRadius: 12, padding: 12, borderLeftWidth: 5, borderColor: "#90caf9", elevation: 2 },
//   pageName: { fontWeight: "bold", fontSize: 15, color: "#1976d2" },
//   pageId: { fontSize: 13, color: "#444" },
//   pageToken: { fontSize: 10, color: "#90a4ae" },
//   buttonRow: { flexDirection: "row", marginTop: 4 },
//   inputSmall: { borderWidth: 1, borderColor: "#bdbdbd", backgroundColor: "#fff", color: "#222", padding: 7, borderRadius: 8, fontSize: 14, marginBottom: 5 },
// });



import { colors, spacing, radii, typography, card } from "../theme/theme";
import AppButton from "../components/AppButton";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { writeAsStringAsync, readAsStringAsync, getInfoAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";
import AlertBox from "../components/AlertBox";
import { SafeAreaView } from "react-native-safe-area-context";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";

type PageSetting = { pageName: string; pageId: string; accessToken: string };
type AlertType = 'success' | 'warning' | 'error';

export default function SettingsScreen() {
  const [subscriptionKey, setSubscriptionKey] = useState("");
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [newPageName, setNewPageName] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newAccessToken, setNewAccessToken] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editPage, setEditPage] = useState<PageSetting | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('success');
    // Use state for custom title/message
  const [alertTitle, setAlertTitle] = useState('Operation Successful');
  const [alertMessage, setAlertMessage] = useState('Your post was published.');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const info = await getInfoAsync(SETTINGS_FILE);
        if (!info.exists) return;
        const content = await readAsStringAsync(SETTINGS_FILE);
        const data = JSON.parse(content);
        setSubscriptionKey(data.subscriptionKey || "");
        setPages(data.pages || []);
      } catch (e) {
        console.log("Load error:", e);
      }
    };
    loadSettings();
  }, []);

  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    saveSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  const saveSettings = async () => {
    try {
      const data = { subscriptionKey, pages };
      await writeAsStringAsync(SETTINGS_FILE, JSON.stringify(data));
    } catch (e) {
      console.log(e);
      setAlertTitle('Error!');
      setAlertType('error');
      setAlertMessage("Failed to save settings.");
      setShowAlert(true);
    }
  };

  const addPage = () => {
    if (newPageName.trim() && newPageId.trim() && newAccessToken.trim()) {
      setPages([...pages, {
        pageName: newPageName.trim(),
        pageId: newPageId.trim(),
        accessToken: newAccessToken.trim()
      }]);
      setNewPageName("");
      setNewPageId("");
      setNewAccessToken("");
    }
  };

  const removePage = (index: number) => {
    setPages(pages.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditPage(null);
    }
  };

  // Start editing a page
  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditPage({ ...pages[index] });
  };

  // Save the edited page
  const saveEdit = () => {
    if (!editPage?.pageName || !editPage?.pageId || !editPage?.accessToken) {
      setAlertTitle('Warning!');
      setAlertType('warning');
      setAlertMessage("All fields are required.");
      setShowAlert(true);
      return;
    }
    setPages(pages.map((p, i) => (i === editIndex ? { ...editPage } : p)));
    setEditIndex(null);
    setEditPage(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditIndex(null);
    setEditPage(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={70}
    >
      <ScrollView style={settingsStyles.container}>
        <AlertBox
          visible={showAlert}
          type={alertType}
          title={alertTitle}         // Custom title
          message={alertMessage}     // Custom message
          onClose={() => setShowAlert(false)}
        />
        <Text style={settingsStyles.header}>Settings</Text>
        <Text style={settingsStyles.helper}>
          Configure your subscription and Facebook pages for posting.
        </Text>
        {/* Subscription card */}
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.sectionTitle}>Subscription</Text>
          <Text style={settingsStyles.label}>Subscription Key</Text>
          <TextInput
            value={subscriptionKey}
            onChangeText={setSubscriptionKey}
            placeholder="Enter Subscription Key"
            placeholderTextColor={colors.textMuted}
            style={settingsStyles.input}
          />
        </View>

        {/* Add Page card */}
        <View style={settingsStyles.card}>
          <Text style={settingsStyles.sectionTitle}>Add Page</Text>
          <TextInput
            value={newPageName}
            onChangeText={setNewPageName}
            placeholder="Page Name"
            placeholderTextColor={colors.textMuted}
            style={settingsStyles.input}
          />
          <TextInput
            value={newPageId}
            onChangeText={setNewPageId}
            placeholder="Page ID"
            placeholderTextColor={colors.textMuted}
            style={settingsStyles.input}
          />
          <TextInput
            value={newAccessToken}
            onChangeText={setNewAccessToken}
            placeholder="Access Token"
            placeholderTextColor={colors.textMuted}
            style={settingsStyles.input}
          />
          {/* <Button
            title="Add Page"
            color={colors.primary} // primary blue
            onPress={addPage}
          /> */}
          <AppButton title="Add Page" variant="ghost" onPress={addPage} />
        </View>

        {/* Configured pages list */}
        <Text style={settingsStyles.sectionTitle}>Configured Pages</Text>
        {pages.length === 0 && (
          <Text style={settingsStyles.empty}>
            No pages added yet. Please add a Page Name, Page ID, and Access Token.
          </Text>
        )}

        {pages.map((page, index) => (
          <View key={index} style={settingsStyles.pageCard}>
            {editIndex === index && editPage ? (
              <>
                <TextInput
                  value={editPage.pageName}
                  onChangeText={val => setEditPage({ ...editPage, pageName: val })}
                  placeholder="Page Name"
                  placeholderTextColor={colors.textMuted}
                  style={settingsStyles.inputSmall}
                />
                <TextInput
                  value={editPage.pageId}
                  onChangeText={val => setEditPage({ ...editPage, pageId: val })}
                  placeholder="Page ID"
                  placeholderTextColor={colors.textMuted}
                  style={settingsStyles.inputSmall}
                />
                <TextInput
                  value={editPage.accessToken}
                  onChangeText={val => setEditPage({ ...editPage, accessToken: val })}
                  placeholder="Access Token"
                  placeholderTextColor={colors.textMuted}
                  style={settingsStyles.inputSmall}
                />
                {/* <View style={settingsStyles.buttonRow}>
                  <TouchableOpacity onPress={saveEdit} style={{ marginRight: spacing.lg }}>
                    <Text style={{ color: colors.success, fontWeight: "bold" }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEdit}>
                    <Text style={{ color: colors.danger }}>Cancel</Text>
                  </TouchableOpacity>
                </View> */}
                <View style={settingsStyles.buttonRow}>
                  <AppButton
                    title="Save"
                    variant="success"
                    onPress={saveEdit}
                    style={{ marginRight: spacing.md }}
                  />
                  <AppButton title="Cancel" variant="ghost" onPress={cancelEdit} />
                </View>
              </>
            ) : (
              <>
                <Text style={settingsStyles.pageName}>{page.pageName}</Text>
                <Text style={settingsStyles.pageId}>{page.pageId}</Text>
                <Text style={settingsStyles.pageToken}>
                  {page.accessToken ? page.accessToken.slice(0, 24) + "..." : ""}
                </Text>
                {/* <View style={settingsStyles.buttonRow}>
                  <TouchableOpacity onPress={() => startEdit(index)} style={{ marginRight: spacing.lg }}>
                    <Text style={{ color: colors.primary }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removePage(index)}>
                    <Text style={{ color: colors.danger }}>Remove</Text>
                  </TouchableOpacity>
                </View> */}
                {/* <View style={settingsStyles.buttonRow}>
                  <AppButton
                    title="Edit"
                    variant="primary"
                    onPress={() => startEdit(index)}
                    style={{ marginRight: spacing.md }}
                  />
                  <AppButton title="Remove" variant="danger" onPress={() => removePage(index)} />
                </View> */}
                <View style={settingsStyles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => startEdit(index)}
                    style={[settingsStyles.iconButton, settingsStyles.iconEdit]}
                  >
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removePage(index)}
                    style={[settingsStyles.iconButton, settingsStyles.iconRemove]}
                  >
                    <Ionicons name="trash" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    // paddingTop: spacing.xl,
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
  card: {
    ...card.base,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    marginBottom: spacing.xs,
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
  empty: {
    ...typography.muted,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  // pageCard: {
  //   ...card.base,
  //   marginBottom: spacing.md,
  //   borderLeftWidth: 4,
  //   borderColor: colors.primarySoft,
  //   paddingVertical: spacing.md,
  // },
  pageCard: {
    ...card.base,
    marginBottom: spacing.md,
    // borderLeftWidth: 4,
    borderColor: colors.primarySoft,
    paddingVertical: spacing.md,
    position: "relative", // important for absolute actionsRow
  },
  pageName: {
    ...typography.subtitle,
    fontSize: 15,
    color: colors.primary,
  },
  pageId: {
    ...typography.body,
    fontSize: 13,
  },
  pageToken: {
    ...typography.muted,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    color: colors.textMain,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  actionsRow: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center", // vertical center
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  iconEdit: {
    backgroundColor: "#e3f2fd", // soft blue
  },
  iconRemove: {
    backgroundColor: "#ffebee", // soft red
  },

});
