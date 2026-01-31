import { useEffect, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { options } from "./chatkit-options";

const COLLAPSED_SIZE = { width: 100, height: 100 };
const EXPANDED_SIZE = { width: 420, height: 720 };

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

  useEffect(() => {
    const size = open ? EXPANDED_SIZE : COLLAPSED_SIZE;
    window.parent?.postMessage(
      { type: "chatkit-bubble-resize", width: size.width, height: size.height },
      "*"
    );
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#444",
            }}
          >
            Načítavam chat…
          </div>
          <ChatKit control={control} />
        </div>
      )}
    </>
  );
}
