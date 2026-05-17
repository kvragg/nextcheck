export function Hero() {
  return (
    <header className="text-center space-y-4 mb-12 animate-fade-in">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-pass animate-pulse" />
        10 production-grade checks · ~30s · PDF included
      </div>
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
        Audit your Next.js repo
        <br />
        <span className="text-muted">before your auditor does.</span>
      </h1>
      <p className="text-muted max-w-xl mx-auto text-lg">
        Paste a public GitHub URL. Get a security score, ten production checks,
        and a downloadable PDF — built by someone who&apos;s seen these break from
        inside the bank.
      </p>
    </header>
  );
}
