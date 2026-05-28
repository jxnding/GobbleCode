import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("Welcome to GobbleCode Mobile!");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🦃 GobbleCode</Text>
        <Text style={styles.subtitle}>Mobile Companion</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setMessage("Gobble! 🦃")}
        >
          <Text style={styles.buttonText}>Say Gobble!</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <Text style={styles.feature}>📱 View Agents</Text>
          <Text style={styles.feature}>🔍 Search Code</Text>
          <Text style={styles.feature}>⚙️ Settings</Text>
          <Text style={styles.feature}>☁️ Sync</Text>
        </View>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 8,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  message: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  features: {
    width: "100%",
  },
  feature: {
    fontSize: 16,
    color: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    marginBottom: 10,
  },
});
