import { routeAgentRequest, type Schedule } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { cleanupMessages } from "./utils";

/**
 * FluxMind Study Agent - A personal AI study assistant
 * Built on Cloudflare Workers using Llama 3.3 on Workers AI
 */

// System prompt for the study assistant
const STUDY_ASSISTANT_PROMPT = `You are FluxMind, a friendly and knowledgeable AI study assistant. Your role is to help users learn effectively.

When a user asks you a question:
1. Provide a clear, helpful explanation
2. Use examples when appropriate
3. Break down complex topics into simpler parts
4. Be encouraging and supportive

You can help with:
- Explaining any topic or concept
- Creating study materials and flashcards
- Providing study tips
- Answering questions about any subject

Always respond directly and helpfully to the user's question. Do not ask for clarification unless absolutely necessary. Just answer the question to the best of your ability.`;

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 * Uses Cloudflare Workers AI with Llama 3.3 for inference
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // Initialize Workers AI provider with Llama 3.3
    const workersAI = createWorkersAI({ binding: this.env.AI });
    const model = workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast");

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        const result = streamText({
          system: STUDY_ASSISTANT_PROMPT,
          messages: convertToModelMessages(cleanedMessages),
          model,
          onFinish,
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }

  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`
          }
        ],
        metadata: {
          createdAt: new Date()
        }
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Health check endpoint for Workers AI
    if (url.pathname === "/check-open-ai-key") {
      // Workers AI doesn't require an API key - it uses bindings
      return Response.json({
        success: true
      });
    }

    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
