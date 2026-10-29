import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-sans)",
        textAlign: "center",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontWeight: 800,
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: 40, letterSpacing: "-0.04em", margin: "10px 0" }}>
          This page is missing
        </h1>
        <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>
          The page you are looking for does not exist or has moved.
        </p>
        <Link className="btn btn-primary btn-lg" href="/">
          Back to the playground
        </Link>
      </div>
    </main>
  );
}
