"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackOrderForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/suivi?ref=${encodeURIComponent(ref)}&email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={submit} className="card mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
      <input
        className="input"
        placeholder="Référence (FB-XXXX-XXXX)"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Email de la commande"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn-primary">Suivre</button>
    </form>
  );
}
