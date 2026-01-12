import { useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { options } from "./chatkit-options";

export function ChatBubble() {
  const [open, setOpen] = useState(false);

  const { control } = useChatKit({
  ...options,
  api: {
    async getClientSecret(existing) {
      if (existing) return existing;
      const res = await fetch("/api/chatkit/session", { method: "POST" });
      const { client_secret } = await res.json();
      return client_secret;
    },
  },
});


  return (
    <>
      {/* BUBLINA */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          borderRadius: 999,
          padding: "14px 18px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          zIndex: 9999,
          background: "#f20226",
          color: "#fff",
        }}
      >
        Chat
      </button>

      {/* CHAT PANEL */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 380,
            height: 620,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 6px 25px rgba(0,0,0,.25)",
            zIndex: 9999,
            background: "#fff",
          }}
        >
          {/* 👇 PRESNE SEM PATRÍ TOTO */}
          <ChatKit control={control} />
        </div>
      )}
    </>
  );
}
