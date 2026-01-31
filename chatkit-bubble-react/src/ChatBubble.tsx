import { useEffect, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { options } from "./chatkit-options";

const COLLAPSED_SIZE = { width: 100, height: 100 };
const EXPANDED_SIZE = { width: 420, height: 720 };

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [loaderOpacity, setLoaderOpacity] = useState(0);

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

  useEffect(() => {
    if (!open) {
      setPanelVisible(false);
      setLoaderVisible(false);
      setLoaderOpacity(0);
      return;
    }

    setLoaderVisible(true);
    setLoaderOpacity(1);
    const raf = requestAnimationFrame(() => setPanelVisible(true));
    const fade = setTimeout(() => setLoaderOpacity(0), 700);
    const hide = setTimeout(() => setLoaderVisible(false), 950);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fade);
      clearTimeout(hide);
    };
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
          background: "#0c45ed",
          color: "#fff",
          fontSize: 22,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/chat-icon.png"
          alt="Chat"
          style={{
            width: 30,
            height: 30,
            display: "block",
          }}
        />
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
            opacity: panelVisible ? 1 : 0,
            transform: panelVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 220ms ease, transform 220ms ease",
          }}
        >
          {loaderVisible && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                opacity: loaderOpacity,
                transition: "opacity 260ms ease",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "3px solid #e5e5e5",
                  borderTopColor: "#0c45ed",
                  animation: "chatkit-spin 0.8s linear infinite",
                }}
              />
            </div>
          )}
          <style>
            {`
              @keyframes chatkit-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
          <ChatKit control={control} />
        </div>
      )}
    </>
  );
}
