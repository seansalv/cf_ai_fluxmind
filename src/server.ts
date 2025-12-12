import { routeAgentRequest, type Schedule } from "agents";
import { getSchedulePrompt } from "agents/schedule";
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
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";

/**
 * FluxMind Study Agent - A personal AI study assistant
 * Built on Cloudflare Workers using Llama 3.3 on Workers AI
 */

// System prompt for the study assistant
const STUDY_ASSISTANT_PROMPT = `You are FluxMind, a friendly and knowledgeable AI study assistant. Your role is to help users learn effectively by:

1. **Explaining Concepts**: Break down complex topics into easy-to-understand explanations
2. **Creating Study Materials**: Generate flashcards, summaries, and practice questions
3. **Answering Questions**: Provide clear, accurate answers with examples when helpful
4. **Encouraging Learning**: Be supportive and motivating while maintaining academic rigor

Guidelines:
- Use clear, concise language appropriate for the topic
- Provide examples when explaining abstract concepts
- When asked about a topic, structure your response with headers and bullet points for readability
- If you don't know something, admit it honestly
- Encourage curiosity and deeper exploration of topics

You have access to tools that can help with scheduling study sessions and other tasks.`;

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

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.getAITools()
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions
        });

        const result = streamText({
          system: `${STUDY_ASSISTANT_PROMPT}

${getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a study session or task, use the schedule tool to schedule it.
`,
          messages: convertToModelMessages(processedMessages),
          model,
          tools: allTools,
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
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
