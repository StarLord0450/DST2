"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const supabase = createClient();

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="font-display text-2xl font-bold text-ink mb-2">Sign in</h1>
      <p className="text-muted text-sm font-mono mb-8">
        No password. We'll email you a one-time link.
      </p>

      {status === "sent" ? (
        <div className="border border-cyan/40 rounded-lg p-6 text-sm font-mono text-cyan">
          Check {email} for your sign-in link.
        </div>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-panel border border-line rounded px-4 py-3 text-ink font-mono text-sm focus:outline-none focus:border-cyan"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-cyan text-void font-mono text-sm font-bold py-3 rounded hover:bg-ink transition-colors disabled:opacity-50"
          >
            {status === "sending" ? "sending..." : "send magic link"}
          </button>
          {status === "error" && (
            <p className="text-magenta text-xs font-mono">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
