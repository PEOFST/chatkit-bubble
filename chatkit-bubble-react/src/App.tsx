import { ChatBubble } from "./ChatBubble";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Moja stránka</h1>
      <p>Vpravo dole je ChatKit bublina.</p>

      <ChatBubble />
    </div>
  );
}
