import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

// You can style bullets, links, and paragraphs for good alignment.
const markdownStyles = {
  bullet_list: { marginLeft: 12 },
  bullet_list_icon: { marginRight: 8 },
  bullet_list_content: { marginLeft: 0 },
  ordered_list_icon: { marginRight: 8 },
  link: { color: "#1a0dab", textDecorationLine: "underline" },
  paragraph: { marginVertical: 4 },
};

const manualMD = `
## Posting to Facebook Pages

- Enter a caption for your post in the caption box.
- Tap **Attach Image** to pick images from your device. Selected images will appear as previews below the button.
- A caption or image or both can be post at the same time.
- Select which Facebook pages to post to by tapping their names (\`✅\` means selected). Use **Select All** or **Unselect All** for quick actions.
- Press **Submit Post** to publish to all selected pages.
- If posting fails for any page, an alert lists those pages.

## Viewing & Managing Post Logs

- Open the **Logs** tab to review your post history:
  - Successful posts are shown under *Successful Posts*.
  - Failed attempts are shown under *Failed Posts* with error details.
- Use the buttons at the top to clear either successful or failed logs.
- Logs auto-update when you enter this tab.

## Setting Facebook Pages

- In the **Settings** tab, add a new page by filling:
  1. Page Name
  2. Page ID
  3. Page Access Token
- Press **Add Page** once fields are filled; you can edit or remove pages later.
- All changes are saved automatically.

## Facebook App & Access Token

1. Go to [Facebook Developers](https://developers.facebook.com/).
2. Register (if new), then “My Apps” → **Create App** (*Choose “Business” type*).
3. Add **Facebook Login** and **Pages API** products to your app.
4. Use [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to log in and request permissions:
   - \`pages_show_list\`
   - \`pages_manage_posts\`
   - \`pages_read_engagement\`
   - \`pages_read_user_content\`
5. Generate a user access token, upgrade to long-lived in [Access Token Debugger](https://developers.facebook.com/tools/access_token/).
6. With the long-lived token, call \`/me/accounts\` for your Page's access token:
   \`\`\`
   GET https://graph.facebook.com/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN
   \`\`\`
7. Add the found Page Name, Page ID, and Page Access Token into your app Settings.

## Other Info

- Internet connection is needed for posting.
- If errors occur, open Logs for details.
- Refresh/renew access tokens when permissions change or expire.
- You can post to as many pages as desired at once—success/failure shows per page.
- 
`;

export default function UserManualScreen() {
  return (
    <ScrollView style={styles.container}>
      <Markdown style={markdownStyles}>{manualMD}</Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f1f8e9", padding: 20, marginTop: 20},
});
