import type { ChatKitOptions } from "@openai/chatkit";

export const options: Partial<ChatKitOptions> = {
  locale: "en",
  theme: {
    colorScheme: "light",
    radius: "pill",
    density: "spacious",
    color: {
      accent: {
        primary: "#0c45ed",
        level: 1,
      },
    },
    typography: {
      baseSize: 16,
      fontFamily:
        '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontFamilyMono:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
      fontSources: [
        {
          family: "OpenAI Sans",
          src: "https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2",
          weight: 400,
          style: "normal",
          display: "swap",
        },
      ],
    },
  },
  composer: {
    attachments: {
      enabled: false,
    },
  },
  startScreen: {
    greeting: "Let's pick your kayak !",
    prompts: [],
  },
  // Optional fields not shown: locale, initialThread, threadItemActions, header, onClientTool, entities, widgets
};
