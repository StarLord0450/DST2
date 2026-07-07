export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <div className="font-display font-bold text-ink mb-2">DROPSHIPTROOPERS</div>
          <p className="text-muted font-mono text-xs leading-relaxed">
            Catalog refreshes daily. Trending products, sourced and shipped
            automatically.
          </p>
        </div>

        <div>
          <div className="text-muted font-mono text-xs uppercase tracking-wider mb-3">
            Fulfillment — coming online
          </div>
          <ul className="space-y-2 font-mono text-xs">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warn animate-pulse" />
              <span className="text-muted">CJDropshipping API — not connected</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warn animate-pulse" />
              <span className="text-muted">Zendrop — not connected</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warn animate-pulse" />
              <span className="text-muted">Spocket — not connected</span>
            </li>
          </ul>
          <p className="text-muted/60 text-[11px] mt-3">
            Orders currently record to the database only. Wire a supplier API
            in <code className="text-cyan">/api/webhook</code> to auto-place
            fulfillment orders.
          </p>
        </div>

        <div>
          <div className="text-muted font-mono text-xs uppercase tracking-wider mb-3">
            Store
          </div>
          <ul className="space-y-2 font-mono text-xs text-muted">
            <li>Test mode — no real charges yet</li>
            <li>&copy; {new Date().getFullYear()} DropshipTroopers</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
