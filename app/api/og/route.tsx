import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "#09090b",
          padding: "80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#a1a1aa",
            fontSize: "20px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          nextcheck
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Audit your Next.js repo</span>
            <span style={{ color: "#71717a" }}>before your auditor does.</span>
          </div>
          <div style={{ fontSize: "26px", color: "#a1a1aa" }}>
            10 production-grade security checks · ~30s · PDF included
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            color: "#71717a",
            fontSize: "20px",
          }}
        >
          <div>Built 100% via AI orchestration</div>
          <div style={{ color: "#10b981" }}>nextcheck-six.vercel.app</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
