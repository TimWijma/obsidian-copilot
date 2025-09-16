import { ItemView, WorkspaceLeaf } from "obsidian";
import CopilotPlugin from "./main";
import { generateText, ModelMessage, streamText } from "ai";
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
    const mainContainer = container.createDiv({ cls: "container" });
    mainContainer.createEl("h4", { text: "AI Chat" });

    const chatContainer = mainContainer.createDiv({ cls: "chat-container" });

    const input = mainContainer.createEl("input", { type: "text", cls: "chat-input", placeholder: "Ask a question..." });
    const sendButton = mainContainer.createEl("button", { text: "Send", cls: "chat-send-button" });

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

          // const response = await generateText({
          //   model: openai(this.plugin.settings.modelName),
          //   messages: this.messages,
          // });
          const { textStream } = streamText({
            model: openai(this.plugin.settings.modelName),
            messages: this.messages,
          });

          const botMessage = chatContainer.createDiv({ cls: "chat-message bot-message" });
          const botParagraph = botMessage.createEl("p", { text: "" });

          let response = { text: "" };
          for await (const chunk of textStream) {
            console.log("Received chunk:", chunk);
            response.text += chunk;
            botParagraph.setText(response.text); // Update the text as chunks arrive
          }
          
          this.messages.push({ role: "assistant", content: response.text });

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
