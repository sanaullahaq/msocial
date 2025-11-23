import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { writeAsStringAsync, readAsStringAsync, getInfoAsync, documentDirectory, cacheDirectory } from "expo-file-system/legacy";

const SETTINGS_FILE = (documentDirectory || cacheDirectory) + "settings.json";

type PageSetting = { pageName: string; pageId: string; accessToken: string };

export default function SettingsScreen() {
  const [subscriptionKey, setSubscriptionKey] = useState("");
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [newPageName, setNewPageName] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newAccessToken, setNewAccessToken] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editPage, setEditPage] = useState<PageSetting | null>(null);

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

  const saveSettings = async () => {
    try {
      const data = { subscriptionKey, pages };
      await writeAsStringAsync(SETTINGS_FILE, JSON.stringify(data));
      Alert.alert("Success", "Settings saved!");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to save settings.");
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
      // saveSettings()
    }
  };

  const removePage = (index: number) => {
    setPages(pages.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditPage(null);
      // saveSettings()
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
      Alert.alert("All fields are required.");
      return;
    }
    setPages(pages.map((p, i) => (i === editIndex ? { ...editPage } : p)));
    setEditIndex(null);
    setEditPage(null);
    // saveSettings();
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditIndex(null);
    setEditPage(null);
  };

  return (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    keyboardVerticalOffset={70}
  >
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Settings</Text>
      <Text>Subscription Key:</Text>
      <TextInput
        value={subscriptionKey}
        onChangeText={setSubscriptionKey}
        placeholder="Enter Subscription Key"
        placeholderTextColor="#aaa"
        style={{
          borderWidth: 1, borderColor: "#888", backgroundColor: "#fff", color: "#111",
          padding: 10, borderRadius: 5, fontSize: 16, marginVertical: 6
        }}
      />
      <TextInput
        value={newPageName}
        onChangeText={setNewPageName}
        placeholder="Page Name"
        placeholderTextColor="#aaa"
        style={{
          borderWidth: 1, borderColor: "#888", backgroundColor: "#fff", color: "#111",
          padding: 10, borderRadius: 5, fontSize: 16, marginVertical: 6
        }}
      />
      <TextInput
        value={newPageId}
        onChangeText={setNewPageId}
        placeholder="Page ID"
        placeholderTextColor="#aaa"
        style={{
          borderWidth: 1, borderColor: "#888", backgroundColor: "#fff", color: "#111",
          padding: 10, borderRadius: 5, fontSize: 16, marginVertical: 6
        }}
      />
      <TextInput
        value={newAccessToken}
        onChangeText={setNewAccessToken}
        placeholder="Access Token"
        placeholderTextColor="#aaa"
        style={{
          borderWidth: 1, borderColor: "#888", backgroundColor: "#fff", color: "#111",
          padding: 10, borderRadius: 5, fontSize: 16, marginVertical: 6
        }}
      />
      <Button title="Add Page" onPress={addPage} />

      <View style={{ marginVertical: 16 }}>
        <Button title="Save Settings" onPress={saveSettings} />
      </View>

      <Text style={{ marginVertical: 8 }}>Pages:</Text>
      {pages.length === 0 && (
        <Text style={{ color: "#888", textAlign: "center", marginVertical: 20 }}>
          No pages added yet. Please add a Page Name, Page ID, and Access Token.
        </Text>
      )}
      {pages.map((page, index) => (
        <View
          key={index}
          style={{ marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 6, width: "100%" }}
        >
          {editIndex === index && editPage ? (
            <>
              <TextInput
                value={editPage.pageName}
                onChangeText={val => setEditPage({ ...editPage, pageName: val })}
                placeholder="Page Name"
                placeholderTextColor="#aaa"
                style={{ borderWidth: 1, borderColor: '#555', borderRadius: 4, padding: 6, margin: 1, fontSize: 13 }}
              />
              <TextInput
                value={editPage.pageId}
                onChangeText={val => setEditPage({ ...editPage, pageId: val })}
                placeholder="Page ID"
                placeholderTextColor="#aaa"
                style={{ borderWidth: 1, borderColor: '#555', borderRadius: 4, padding: 6, margin: 1, fontSize: 13 }}
              />
              <TextInput
                value={editPage.accessToken}
                onChangeText={val => setEditPage({ ...editPage, accessToken: val })}
                placeholder="Access Token"
                placeholderTextColor="#aaa"
                style={{ borderWidth: 1, borderColor: '#555', borderRadius: 4, padding: 6, margin: 1, fontSize: 13 }}
              />
              <View style={{flexDirection: "row"}}>
                <TouchableOpacity onPress={saveEdit} style={{ marginRight: 8 }}>
                  <Text style={{ color: "#189d17", fontWeight: "bold" }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelEdit} style={{
                }}>
                  <Text style={{ color: "#c70000" }}>Cancel</Text>
                </TouchableOpacity>
                </View>
            </>
          ) : (
            <>
              <Text style={{fontWeight: "bold"}}>{page.pageName}</Text>
              <Text>{page.pageId}</Text>
              <Text>{page.accessToken ? page.accessToken.slice(0, 40) + "..." : ''}</Text>
              <View style={{flexDirection: "row"}}>
                <TouchableOpacity onPress={() => startEdit(index)} style={{ marginRight: 8 }}>
                  <Text style={{ color: "#0056c7" }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removePage(index)}>
                  <Text style={{ color: "#c70000" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  </KeyboardAvoidingView>
  );
}