"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackingForm({
  orderId,
  currentTracking,
}: {
  orderId: string;
  currentTracking: string | null;
}) {
  const [value, setValue] = useState(currentTracking ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/orders/${orderId}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking_number: value }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste CJ tracking number"
        className="flex-1 bg-transparent border border-line rounded px-2 py-1 text-sm font-mono text-ink"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs font-mono px-3 py-1 border border-cyan text-cyan rounded hover:bg-cyan hover:text-black transition disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}