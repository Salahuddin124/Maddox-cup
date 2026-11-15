"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_STYLES, LOGIN_STYLES } from "../admin-styles";

export default function LoginForm() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ passphrase }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Couldn't unlock the admin view.");
      }

      setPassphrase("");
      // The JWT cookie is set now, so the server component can render.
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Couldn't unlock the admin view.",
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{BASE_STYLES}</style>
      <style>{LOGIN_STYLES}</style>

      <main className="admin-shell centered-shell">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="lock-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
              <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
            </svg>
          </div>
          <p className="eyebrow">MADDOXX CUP</p>
          <h1>Admin access</h1>
          <p className="login-copy">
            Enter the pass phrase to view registered teams and MMR charts.
          </p>

          <label className="login-label" htmlFor="admin-passphrase">
            Pass phrase
          </label>
          <input
            id="admin-passphrase"
            className="login-input"
            type="password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            placeholder="Enter pass phrase"
            autoComplete="current-password"
            autoFocus
            required
          />

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </form>
      </main>
    </>
  );
}
