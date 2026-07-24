"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "veypri_flagged";

function readFlaggedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function FlagButton({ id }: { id: number }) {
  const [flagged, setFlagged] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFlagged(readFlaggedIds().includes(id));
  }, [id]);

  async function handleFlag() {
    setLoading(true);
    try {
      await fetch(`/api/signalements/${id}/flag`, { method: "POST" });
      const ids = readFlaggedIds();
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]));
      setFlagged(true);
    } catch {
      // Échec silencieux : ce n'est qu'un signal de modération secondaire,
      // pas une action critique pour l'utilisateur.
    } finally {
      setLoading(false);
    }
  }

  if (flagged) {
    return (
      <span className="text-xs text-veypri-ink/40">
        Signalé comme douteux — merci
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleFlag}
      disabled={loading}
      className="text-xs text-veypri-ink/50 underline decoration-dotted hover:text-veypri-ink/80 disabled:opacity-50"
    >
      Signaler comme douteux
    </button>
  );
}
