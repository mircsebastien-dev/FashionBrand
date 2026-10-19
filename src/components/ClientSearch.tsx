"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientSearch({ q, segment }: { q: string; segment: string }) {
  const router = useRouter();
  const [input, setInput] = useState(q);

  function go(nextSegment?: string) {
    const params = new URLSearchParams();
    if (input) params.set("q", input);
    const seg = nextSegment ?? segment;
    if (seg && seg !== "all") params.set("segment", seg);
    router.push(`/admin/clients?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="flex flex-1 gap-2"
      >
        <input
          className="input flex-1"
          placeholder="Rechercher par nom ou email…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary">Rechercher</button>
      </form>
      <div className="flex gap-2">
        {[
          ["all", "Tous"],
          ["Nouveau", "Nouveaux"],
          ["Fidèle", "Fidèles"],
          ["Occasionnel", "Occasionnels"],
          ["Inactif", "Inactifs"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => go(value)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              segment === value ? "bg-brand-black text-white" : "bg-white hover:bg-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
