import { useEffect, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { options } from "./chatkit-options";

const COLLAPSED_SIZE = { width: 100, height: 100 };
const EXPANDED_SIZE = { width: 420, height: 720 };

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [loaderOpacity, setLoaderOpacity] = useState(0);
  const [initialThreadId, setInitialThreadId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const sessionPromiseRef = useRef<Promise<{ client_secret: string; thread_id: string | null }> | null>(null);

  const loadSession = () => {
    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = fetch("/api/chatkit/session", { method: "POST" })
        .then(async (res) => {
          const data = await res.json();
          setInitialThreadId(data.thread_id ?? null);
          setSessionReady(true);
          return data;
        })
        .catch((err) => {
          console.error("Failed to load ChatKit session", err);
          sessionPromiseRef.current = null;
          setSessionReady(true);
          throw err;
        });
    }
    return sessionPromiseRef.current;
  };

  const { control } = useChatKit({
    ...options,
    initialThread: initialThreadId ?? null,
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;
        const session = await loadSession();
        return session.client_secret;
      },
    },
    onClientTool: async (toolCall) => {
      if (toolCall.name !== "sleep") {
        return { ok: false, error: "Unknown tool" };
      }

      const seconds = Number(toolCall.params?.seconds ?? 0);
      const res = await fetch("/api/tools/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds }),
      });
      return await res.json();
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
    if (open) {
      loadSession();
    }
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
          {(loaderVisible || !sessionReady) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                opacity: loaderVisible ? loaderOpacity : 1,
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
          {sessionReady && <ChatKit control={control} />}
        </div>
      )}
    </>
  );
}
