import { useState } from "react";
import { Linking, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { webUrl } from "@/api/config";
import {
  chromeFreeUrl,
  embedThemeLockScript,
  nextEmbedUrl,
  withEmbedTheme,
} from "@/content/embed-url";
import { themeStorageKey, type ColorScheme } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

const themedDocumentUrl = (url: string, scheme: ColorScheme): string => {
  return withEmbedTheme(chromeFreeUrl(url, webUrl), scheme);
};

export function ContentWebView({ uri }: { readonly uri: string }) {
  const { scheme } = useTheme();
  const [sourceUri, setSourceUri] = useState(uri);
  const [appliedScheme, setAppliedScheme] = useState(scheme);
  const [location, setLocation] = useState(() =>
    themedDocumentUrl(uri, scheme),
  );
  if (uri !== sourceUri) {
    setSourceUri(uri);
    setAppliedScheme(scheme);
    setLocation(themedDocumentUrl(uri, scheme));
  }
  const schemeLocation = themedDocumentUrl(location, scheme);
  if (uri === sourceUri && scheme !== appliedScheme) {
    setAppliedScheme(scheme);
  }
  if (
    uri === sourceUri &&
    scheme !== appliedScheme &&
    schemeLocation !== location
  ) {
    setLocation(schemeLocation);
  }

  const onShouldStartLoadWithRequest = (request: {
    readonly url: string;
  }): boolean => {
    const next = nextEmbedUrl(request.url, webUrl, scheme);
    if (next === null) {
      void Linking.openURL(request.url);
      return false;
    }
    if (next !== request.url) {
      setLocation(next);
      return false;
    }
    return true;
  };

  return (
    <WebView
      forceDarkOn={false}
      injectedJavaScriptBeforeContentLoaded={embedThemeLockScript(
        scheme,
        themeStorageKey,
      )}
      key={scheme}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      originWhitelist={["*"]}
      setSupportMultipleWindows={false}
      source={{ uri: location }}
      style={[
        styles.web,
        { backgroundColor: scheme === "dark" ? "#0a0a0a" : "#ffffff" },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  web: {
    flex: 1,
  },
});
