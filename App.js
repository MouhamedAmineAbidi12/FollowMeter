
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Linking,
} from "react-native";

const API_BASE_URL = "http://localhost:3000";

export default function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function cleanUsername(value) {
    return value
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .split(/[/?#]/)[0];
  }

  async function analyzeProfile() {
    Keyboard.dismiss();
    setError("");
    setProfile(null);

    const name = cleanUsername(username);

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(name)) {
      setError("Please enter a valid Instagram username.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/profile/${encodeURIComponent(name)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Could not retrieve profile information."
        );
      }

      setProfile(data);
    } catch (err) {
      setError(
        `${err.message}\n\nCheck your backend and network connection.`
      );
    } finally {
      setLoading(false);
    }
  }

  async function openInstagram() {
    const name = cleanUsername(username);

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(name)) {
      setError("Enter a valid Instagram username first.");
      return;
    }

    try {
      await Linking.openURL(
        `https://www.instagram.com/${encodeURIComponent(name)}/`
      );
    } catch {
      setError("Unable to open Instagram.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>FM</Text>
        </View>

        <Text style={styles.title}>FollowMeter</Text>
        <Text style={styles.subtitle}>
          Your Instagram profile explorer
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Instagram username</Text>

          <TextInput
            style={styles.input}
            placeholder="@username"
            placeholderTextColor="#88839D"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
            onSubmitEditing={analyzeProfile}
            returnKeyType="search"
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
            onPress={analyzeProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Analyze profile
              </Text>
            )}
          </Pressable>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {profile && (
          <View style={styles.resultCard}>
            {!!profile.image && (
              <Image
                source={{ uri: profile.image }}
                style={styles.avatar}
                onError={() => {}}
              />
            )}

            <Text style={styles.resultLabel}>
              PUBLIC PAGE METADATA
            </Text>

            <Text style={styles.profileTitle}>
              {profile.title || `@${profile.username}`}
            </Text>

            <Text style={styles.username}>
              @{profile.username}
            </Text>

            <Text style={styles.description}>
              {profile.description ||
                "No public description was returned."}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              Profile data availability
            </Text>

            <Text style={styles.dataText}>
              Display name:{" "}
              {profile.dataAvailable?.displayName ? "Detected" : "Unavailable"}
            </Text>

            <Text style={styles.dataText}>
              Biography:{" "}
              {profile.dataAvailable?.description ? "Detected" : "Unavailable"}
            </Text>

            <Text style={styles.dataText}>
              Profile image:{" "}
              {profile.dataAvailable?.profileImage ? "Detected" : "Unavailable"}
            </Text>

            <Text style={styles.warning}>
              Follower counts and complete follower lists are
              not provided by this endpoint.
            </Text>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                Linking.openURL(profile.profileUrl)
              }
            >
              <Text style={styles.secondaryText}>
                View on Instagram ↗
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About FollowMeter</Text>
          <Text style={styles.infoText}>
            Enter a username to request public profile
            metadata through your backend. Instagram may
            restrict these requests, so results are not
            guaranteed.
          </Text>
        </View>

        <Text style={styles.footer}>
          FollowMeter · Independent project
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0B18",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 40,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#7945E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#AAA4BD",
    marginTop: 8,
    marginBottom: 28,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#191629",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#342B49",
    padding: 20,
  },
  label: {
    color: "#F4F1FF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#100E1C",
    borderWidth: 1,
    borderColor: "#453755",
    borderRadius: 12,
    color: "#FFFFFF",
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    minHeight: 52,
    backgroundColor: "#7945E8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
  errorBox: {
    marginTop: 14,
    backgroundColor: "#351D2B",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: "#FFB0BA",
    fontSize: 13,
    lineHeight: 20,
  },
  resultCard: {
    width: "100%",
    backgroundColor: "#191629",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#514075",
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 18,
    backgroundColor: "#302945",
  },
  resultLabel: {
    color: "#BDA5FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  profileTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  username: {
    color: "#BDA5FF",
    fontSize: 14,
    marginTop: 6,
  },
  description: {
    color: "#D2CDE1",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    alignSelf: "stretch",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#342B49",
    marginVertical: 18,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    alignSelf: "stretch",
  },
  dataText: {
    color: "#D2CDE1",
    fontSize: 13,
    marginBottom: 8,
    alignSelf: "stretch",
  },
  warning: {
    color: "#F0C987",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    alignSelf: "stretch",
  },
  secondaryButton: {
    padding: 14,
    marginTop: 8,
  },
  secondaryText: {
    color: "#C4B5FD",
    fontWeight: "700",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#191629",
    borderRadius: 18,
    padding: 20,
    marginTop: 18,
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoText: {
    color: "#AAA4BD",
    fontSize: 13,
    lineHeight: 21,
  },
  footer: {
    color: "#777187",
    fontSize: 12,
    marginTop: 26,
    marginBottom: 20,
  },
});
