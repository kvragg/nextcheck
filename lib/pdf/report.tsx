import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CheckResult } from "@/lib/checks/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 22, marginBottom: 6 },
  subtitle: { fontSize: 11, color: "#666", marginBottom: 20 },
  row: { flexDirection: "row", paddingVertical: 6, borderBottom: "1pt solid #eee" },
  status: { width: 60, fontWeight: "bold" },
  pass: { color: "#10b981" },
  warn: { color: "#f59e0b" },
  fail: { color: "#ef4444" },
  name: { width: 160, fontSize: 11 },
  message: { flex: 1, fontSize: 10, color: "#444" },
});

export function Report({
  owner,
  repo,
  results,
}: {
  owner: string;
  repo: string;
  results: CheckResult[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>nextcheck — Security Audit</Text>
        <Text style={styles.subtitle}>
          {owner}/{repo} · {new Date().toISOString().split("T")[0]}
        </Text>
        {results.map((r) => (
          <View key={r.id} style={styles.row}>
            <Text
              style={[
                styles.status,
                r.status === "PASS" ? styles.pass : r.status === "WARN" ? styles.warn : styles.fail,
              ]}
            >
              {r.status}
            </Text>
            <Text style={styles.name}>{r.name}</Text>
            <Text style={styles.message}>{r.message}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
