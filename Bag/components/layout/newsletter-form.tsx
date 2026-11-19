"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

type Status = { kind: "idle" | "error" | "success"; message: string };

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setStatus({ kind: "error", message: "Enter your email address." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }
    setStatus({
      kind: "success",
      message: "Thank you — you're on the list for the first VYRO letter.",
    });
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor="vyro-letter-email" className="label label-light">
        Email address
      </label>
      <div className="mt-2 flex items-end gap-4">
        <input
          id="vyro-letter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status.kind !== "idle") setStatus({ kind: "idle", message: "" });
          }}
          aria-invalid={status.kind === "error"}
          aria-describedby="vyro-letter-status"
          className="field"
        />
        <button
          type="submit"
          aria-label="Subscribe to the VYRO Letter"
          className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center bg-ink text-ivory transition-colors hover:bg-charcoal"
        >
          <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
        </button>
      </div>
      <p
        id="vyro-letter-status"
        role="status"
        aria-live="polite"
        className={`mt-3 text-[0.75rem] leading-relaxed ${
          status.kind === "error" ? "text-ink" : "text-graphite"
        }`}
      >
        {status.message ||
          "Notes on design, everyday objects, and what's next."}
      </p>
      {status.kind === "success" && (
        <p className="mt-1 text-[0.6875rem] leading-relaxed text-graphite/80">
          Prototype form — no email address is stored until a mailing provider is
          connected.
        </p>
      )}
    </form>
  );
}
