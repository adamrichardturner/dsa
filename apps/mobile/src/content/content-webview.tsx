import { useState } from "react";
import { Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { webUrl } from "@/api/config";
import { chromeFreeUrl, shouldOpenOutside } from "@/content/embed-url";
import { useTheme } from "@/theme/theme";

export function ContentWebView({ uri }: { readonly uri: string }) {
  const { scheme } = useTheme();
  const initial = chromeFreeUrl(uri, webUrl);
  const [sourceUri, setSourceUri] = useState(uri);
  const [location, setLocation] = useState(initial);
  if (uri !== sourceUri) {
    setSourceUri(uri);
    setLocation(chromeFreeUrl(uri, webUrl));
  }

  const onShouldStartLoadWithRequest = (request: { readonly url: string }): boolean => {
    const next = chromeFreeUrl(request.url, webUrl);
    if (next !== request.url) {
      setLocation(next);
      return false;
    }
    if (shouldOpenOutside(request.url, webUrl)) {
      void Linking.openURL(request.url);
      return false;
    }
    return true;
  };

  return (
    <WebView
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      originWhitelist={["*"]}
      setSupportMultipleWindows={false}
      source={{ uri: location }}
      style={[styles.web, { backgroundColor: scheme === "dark" ? "#0a0a0a" : "#ffffff" }]}
    />
  );
}

const styles = StyleSheet.create({
  web: {
    flex: 1,
  },
});
