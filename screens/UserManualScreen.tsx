import { colors, spacing, radii, typography, card } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import Markdown from "react-native-markdown-display";

// You can style bullets, links, and paragraphs for good alignment.
const markdownStyles = {
  body: {
    ...typography.body,
  },
  heading1: {
    ...typography.title,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading2: {
    ...typography.subtitle,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bullet_list: { marginLeft: spacing.md },
  paragraph: { marginVertical: spacing.xs },
  link: { color: colors.primary, textDecorationLine: "underline" },
};

// const manualMD = `
// # Posting to Facebook Pages
// ## Step-1
// - Open **Home > Post**.
// - Enter a caption for your post in the caption box.
// - Tap **Attach Image** to pick images from your device. Selected images will appear as previews below the button.
// - A caption or image or both can be post at the same time.
// ## Step-2
// - Select which Facebook pages to post to by tapping their names (\`✅\` means selected). Use **Select All** or **Unselect All** for quick actions.
// ## Step-3
// - Press **Submit Post** to publish to all selected pages.
// - If posting fails for any page, an alert lists those pages.

// # Viewing & Managing Post Logs
// - Open **Home > Logs** to review your post history.
//   - Successful posts are shown under *Successful Posts*.
//   - Failed attempts are shown under *Failed Posts* with error details.
// - Use the **trash-icon** at the top to clear either successful or failed logs.
// - Logs auto-update when you enter this tab.

// # Setting Facebook Pages
// - Open **Home > Page Settings**
// - In the **Page Settings**, add a new page by filling:
//   1. Page Name
//   2. Page ID
//   3. Page Access Token
// - Press **Add Page** once fields are filled; you can edit or remove pages later.
// - All changes are saved automatically.

// # User Settings
// - Open **Home > User Settings**
// - In the **User Settings**, update **user info/ subscription key** and change password, if needed.

// # Facebook App & Access Token
// 1. Go to [Facebook Developers](https://developers.facebook.com/).
// 2. Register (if new), then “My Apps” → **Create App** (*Choose “Business” type*).
// 3. Add **Facebook Login** and **Pages API** products to your app.
// 4. Use [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to log in and request permissions:
//    - \`pages_show_list\`
//    - \`pages_manage_posts\`
//    - \`pages_read_engagement\`
//    - \`pages_read_user_content\`
// 5. Generate a user access token, upgrade to long-lived in [Access Token Debugger](https://developers.facebook.com/tools/access_token/).
// 6. With the long-lived token, call \`/me/accounts\` for your Page's access token:
//    \`\`\`
//    GET https://graph.facebook.com/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN
//    \`\`\`
// 7. Add the found Page Name, Page ID, and Page Access Token into your app Settings.

// # Other Info
// - Internet connection is needed for posting.
// - If errors occur, open Logs for details.
// - Refresh/renew access tokens when permissions change or expire.
// - You can post to as many pages as desired at once—success/failure shows per page.
// `;

const manualMD = `
# Posting to Facebook Pages
**Step-1**
- Open **Home > Post**.
- Enter a caption for your post in the caption box.
- Tap **Attach Image** to pick images from your device. Selected images will appear as previews below the button.
- A caption or image or both can be post at the same time.

**Step-2**
- Select which Facebook pages to post to by tapping their names (\`✅\` means selected). Use **Select All** or **Unselect All** for quick actions.

**Step-3**
- Press **Submit Post** to publish to all selected pages.
- A progress screen will appear while posting. When finished, an alert will show whether all pages succeeded or if any failed.


# Viewing & Managing Post Logs
- Open **Home > Logs** to review your post history.
  - Successful posts are shown under *Successful Posts*.
  - Failed attempts are shown under *Failed Posts* with error details.
- Use the **trash-icon** at the top to clear either successful or failed logs.
- Logs auto-update when you enter this tab.


# Setting Facebook Pages
- Open **Home > Page Settings**.
- In **Page Settings**, add a new page by filling:
  1. Page Name
  2. Page ID
  3. Page Access Token (long‑lived page token)
- Press **Add Page** once fields are filled; you can edit or remove pages later.
- All changes are saved automatically.


# User Settings
- Open **Home > User Settings**.
- In **User Settings**, update **user info / subscription key** and change password, if needed.


# Facebook App & Permissions (one-time)
1. Go to [Facebook Developers](https://developers.facebook.com/).
2. Create a Business app: **My Apps → Create App → Business**.
3. In your app, add the **Facebook Login** and **Pages API / Pages** related products (or “Add Product” → **Facebook Login**, **Pages API**).
4. Under **App Dashboard → Settings → Basic**, note your **App ID** and **App Secret** (needed for long‑lived tokens).
5. Make sure your Facebook user is an **Admin** of the Pages you want to post to.


# Get a Short‑Lived User Access Token
1. Open [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. In the top-right of the explorer:
   - Select your app in the **Application** dropdown.
   - In **User or Page**, keep it as **User Token**.
3. Under **Permissions**, select at least:
   - \`pages_show_list\`
   - \`pages_manage_posts\`
   - \`pages_read_engagement\`
   - \`pages_read_user_content\`.
4. Click **Generate Access Token**, log in to Facebook if needed, and approve the requested permissions for the right Pages.
5. Copy this token somewhere safe – this is your **short‑lived user access token** (valid ~1 hour).


# Convert to a Long‑Lived User Access Token
1. Open the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/).
2. Paste your **short‑lived user token** into the box and click **Debug**.
3. Check the **Expires** information – it should show a short lifetime (a few hours).
4. Click **Extend Access Token** at the bottom of the page. Facebook may ask for your password again.
5. Copy the new token shown in green – this is your **long‑lived user access token** (usually valid for about 60 days).


# Get a Long‑Lived Page Access Token
1. With your **long‑lived user token**, call the **/me/accounts** endpoint to list Pages you manage:
   \`\`\`
   GET https://graph.facebook.com/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN
   \`\`\`
   This returns a list of Pages with their **name**, **id**, and **access_token**.
2. From the response, find the Page you want to use in this app and copy:
   - **Page Name**
   - **Page ID**
   - **Page Access Token** (this is a long‑lived page token derived from your long‑lived user token).
3. Paste these values into **Home > Page Settings**:
   - Page Name → *Page Name*
   - id → *Page ID*
   - access_token → *Page Access Token* field.
4. Save the page. MSocial will now use this token to post to that Page.


# Maintaining Tokens
- Long‑lived **user** tokens usually last up to ~60 days. When the user token expires, repeat the **short‑lived → long‑lived** steps and then regenerate Page tokens if needed.
- If posts suddenly start failing for all Pages, check:
  - Whether the long‑lived token is expired in the **Access Token Debugger**.
  - Whether permissions were removed from your Facebook account or app.


# Other Info
- Internet connection is needed for posting.
- If errors occur, open **Logs** for details.
- You can post to as many pages as desired at once—success/failure shows per page.
`;


export default function UserManualScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={styles.container}>
      <Markdown style={markdownStyles}>{manualMD}</Markdown>

      {/* Footer credit */}
      <Text style={styles.footerCredit}>
        © MSocial · Powered by Neurosoft Technologies
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    // paddingTop: spacing.xl,
  },
  footerCredit: {
    ...typography.muted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
