import { ItemView, WorkspaceLeaf } from "obsidian";
import CopilotPlugin from "./main";
import { generateText, ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const AI_CHAT_VIEW_TYPE = "ai-chat-view";

export class AIChatView extends ItemView {
  private plugin: CopilotPlugin;
  private messages: ModelMessage[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: CopilotPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return AI_CHAT_VIEW_TYPE;
  }

  getDisplayText() {
    return "AI Chat";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "AI Chat" });

    const chatContainer = container.createDiv({ cls: "chat-container" });

    const input = container.createEl("input", { type: "text", placeholder: "Ask a question..." });
    const sendButton = container.createEl("button", { text: "Send" });

    sendButton.onClickEvent(async () => {
      const message = input.value;
      if (message) {
        const userMessage = chatContainer.createDiv({ cls: "chat-message user-message" });
        userMessage.createEl("p", { text: message });
        input.value = "";

        try {
          const openai = createOpenAI({
            apiKey: this.plugin.settings.openAIapiKey,
          });

          this.messages.push({ role: "user", content: message });

          const response = await generateText({
            model: openai(this.plugin.settings.modelName),
            messages: this.messages,
          });

          console.log("AI response:", response);

          this.messages.push({ role: "assistant", content: response.text });

          const botMessage = chatContainer.createDiv({ cls: "chat-message bot-message" });
          botMessage.createEl("p", { text: response.text });
        } catch (error) {
          console.error("Error calling AI:", error);
          const botMessage = chatContainer.createDiv({ cls: "chat-message bot-message" });
          botMessage.createEl("p", { text: "Error: Could not get a response from the AI." });
        }
      }
    });
  }

  async onClose() {
    // Nothing to clean up.
  }
}
