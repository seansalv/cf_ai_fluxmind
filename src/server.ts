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
const STUDY_ASSISTANT_PROMPT = `You are FluxMind, a friendly AI study assistant.

IMPORTANT: Keep your responses concise and focused. Aim for 200-300 words maximum per response. If a topic is complex, offer to explain specific parts in follow-up messages.

When answering:
- Give clear, direct explanations
- Use bullet points for lists
- Provide 1-2 examples maximum
- End with a complete thought

You help with explaining concepts, study tips, and answering questions. Be helpful and encouraging!`;

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
    // Initialize Workers AI provider with Llama 3.1 8B (faster and more reliable)
    const workersAI = createWorkersAI({ binding: this.env.AI });
    const model = workersAI("@cf/meta/llama-3.1-8b-instruct");

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        const result = streamText({
          system: STUDY_ASSISTANT_PROMPT,
          messages: convertToModelMessages(cleanedMessages),
          model,
          maxTokens: 4096, // Allow much longer responses
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
