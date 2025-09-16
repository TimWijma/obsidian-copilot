import { ItemView, WorkspaceLeaf } from "obsidian";

export const AI_CHAT_VIEW_TYPE = "ai-chat-view";

export class AIChatView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
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
  }

  async onClose() {
    // Nothing to clean up.
  }
}
