import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { Character, Worldbook, Message, Config } from "./database";


export class AIService {
  private cleanAIResponse(content: string): string {
    if (!content) return "";

    return (
      content
        // Clean thinking tags
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        // Clean code blocks
        .replace(/```[\s\S]*?```/g, "")
        // Replace English Narration with Chinese
        .replace(/\[?Narration:/gi, "旁白:")
        // Clean extra newlines
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        // Trim
        .trim()
    );
  }

  private createChatModel(config: Config) {
    if (config.provider === 'gemini') {
      return new ChatGoogleGenerativeAI({
        apiKey: config.apiKey.trim(), // Ensure no hidden characters
        model: config.model || "gemini-pro",
        maxOutputTokens: 2048,
      });
    }
    
    // Default to OpenAI compatible
    return new ChatOpenAI({
      openAIApiKey: config.apiKey.trim(), // Ensure no hidden characters
      modelName: config.model || "gpt-3.5-turbo",
      temperature: 0.7,
      configuration: {
        baseURL: config.apiUrl,
      },
    });
  }

  async constructPrompt(
    participants: Character[],
    history: Message[],
    worldbooks: Worldbook[],
    playerCharacter: Character | null,
    targetCharacterName: string | null,
    isGroup: boolean
  ): Promise<string> {
    // Get conversation text for keyword matching
    const recentHistory = history.slice(-15);
    const convoText = recentHistory.map((h) => h.content).join("\n");

    // 1. Keyword Matching for Worldbooks
    const triggeredWorlds = worldbooks.filter((w) => {
      const keywords = w.keywords.split(/[,，]/).map((k) => k.trim().toLowerCase());
      return keywords.some((keyword) => convoText.toLowerCase().includes(keyword));
    });

    // 2. Vector Search for RAG (Semantic Memory)
    // We use the last user message for query
    const lastUserMsg = recentHistory.reverse().find(m => m.role === 'user');
    // const vectorContext = "";
    
    if (lastUserMsg) {
      // Note: In a real app, we need an embedding model here to convert text to vector.
      // Since we don't have a local embedding model running in the browser easily without heavy deps,
      // we might need to rely on an API for embeddings or skip this for now if not provided.
      // However, the user asked to "enhance", so we should at least structure it.
      // For now, we will skip actual vector query unless we have embeddings.
      // If the user provides an embedding API (e.g. OpenAI Embeddings), we could use it.
      // For this iteration, I will leave a placeholder or use a simple mock if needed, 
      // but the VectorDB is ready.
      
      // Assuming we might store text-only for now or use a simple hash for demo? 
      // No, real vector search needs real embeddings. 
      // I will add a TODO or check if config has embedding key.
    }

    // Build prompt
    let prompt = `
  == 系统提示 ==
  - 这是一个角色扮演对话
  == 这个场景中的人物 ==
  `;
    participants.forEach((p) => {
      prompt += `Name: ${p.name}\nPersona: ${p.persona}\n\n`;
    });

    // Add world settings
    if (triggeredWorlds.length > 0) {
      prompt += "== RELEVANT WORLDBOOK ENTRIES ==\n";
      triggeredWorlds.forEach((w) => {
        prompt += `Content for "${w.keywords}": ${w.content}\n\n`;
      });
    }

    // Add history
    prompt += "== RECENT CONVERSATION HISTORY ==\n";
    const hasPlayerCharacter = !!playerCharacter;

    // Restore order for history display
    recentHistory.reverse().forEach((msg) => {
      let speakerName;
      if (msg.role === "user") {
        speakerName = hasPlayerCharacter
          ? msg.characterName || "User"
          : "User";
      } else {
        speakerName = msg.characterName || "旁白";
      }
      prompt += `${speakerName}: ${msg.content}\n`;
    });

    // Build instructions
    let roleplayInstruction = "";
    let aiControlRules =
      "IMPORTANT: AI can only control the behaviors and dialogues of non-player characters, and must never speak or act on behalf of the player character.";
    
    if (hasPlayerCharacter) {
      aiControlRules += ` The player character is ${playerCharacter.name}, and the AI must never control this character.`;
    }

    if (isGroup) {
      if (targetCharacterName) {
        if (hasPlayerCharacter) {
          roleplayInstruction = `${aiControlRules} ${playerCharacter!.name} speaks directly to ${targetCharacterName}. ${targetCharacterName} MUST respond. Format: '${targetCharacterName}: Their dialogue'.`;
        } else {
          roleplayInstruction = `${aiControlRules} The User speaks directly to ${targetCharacterName}. ${targetCharacterName} MUST respond. Format: '${targetCharacterName}: Their dialogue'.`;
        }
      } else {
        roleplayInstruction = `${aiControlRules} You are the roleplay master, responsible for driving the story forward. Based on the characters and world setting, you MUST decide who speaks next OR provide narration. Narration is crucial for describing the environment, introducing new events, or revealing challenges. For example, 'A cold wind blows through the trees, carrying the scent of decay.' Use narration to make the story dynamic and interesting. For character dialogue, use the format 'CharacterName: Their dialogue'. For narration, omit the prefix.`;
      }
    } else {
      // Single character chat
      const charName = participants[0]?.name;
      if (hasPlayerCharacter && charName === playerCharacter!.name) {
         roleplayInstruction = `${aiControlRules} Wait for the input from the player character ${playerCharacter!.name}. The AI cannot speak on behalf of the player.`;
      } else {
        roleplayInstruction = `${aiControlRules} Continue as ${charName}. Do not include your name as a prefix.`;
      }
    }

    prompt += `\n[严格规则：玩家角色的发言包含过去式词汇（如：以前、上次、当初、想想、记得、想当初、还记得吗、之前）或 推测性提示词（如：你想想、是不是说过、应该提过），必须调用"chatHistory"工具搜索历史记录；`;
    
    if (hasPlayerCharacter) {
      prompt += `玩家角色是 ${playerCharacter!.name}，AI绝不能代替此角色说话或行动。剧情只能根据 ${playerCharacter!.name} 的对话来推进。如果没有说明角色应该互相不认识，应该随着角色之间的对话来缓慢推进剧情。`;
    }
    
    prompt += roleplayInstruction + "]";
    
    return prompt;
  }

  async getAIResponse(prompt: string, config: Config): Promise<string> {
    try {
      const chatModel = this.createChatModel(config);
      const response = await chatModel.invoke([new HumanMessage(prompt)]);
      
      let content = "";
      if (typeof response.content === "string") {
        content = response.content;
      } else {
        content = JSON.stringify(response.content);
      }

      return this.cleanAIResponse(content);
    } catch (error) {
      console.error("AI Response Error:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
