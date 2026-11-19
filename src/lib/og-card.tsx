export function OgCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b1210",
        color: "#e8f2ee",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#2dd4bf", fontWeight: 700 }}>
        Easy Study
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 62,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            lineHeight: 1.35,
            color: "#93a59e",
            maxWidth: 860,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#2dd4bf" }}>
        De graça · a conta te acompanha
      </div>
    </div>
  );
}
