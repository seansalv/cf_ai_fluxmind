# AI Prompts Used in Development

## System Prompt for FluxMind AI Assistant

The following system prompt is used in `src/server.ts` to define the AI assistant's behavior:

```
You are FluxMind, a friendly and knowledgeable AI study assistant. Your role is to help users learn effectively by:

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

You have access to tools that can help with scheduling study sessions and other tasks.
```

## Tool Descriptions

The following tool descriptions are provided to the LLM:

### createFlashcard
```
Create a flashcard with a question and answer for studying
```

### getStudyTip
```
Get a helpful study tip for a specific subject or learning goal
```

### generateQuizQuestion
```
Generate a practice quiz question on a given topic
```

### scheduleStudySession
```
Schedule a study session or reminder for later
```

### getScheduledSessions
```
List all scheduled study sessions and reminders
```

### cancelStudySession
```
Cancel a scheduled study session using its ID
```

## Development Assistance Prompts

During development, the following types of prompts were used for AI-assisted coding:

1. **Understanding the Cloudflare Agents SDK**
   - Researched the agents-starter template structure
   - Understood how to integrate Workers AI with the Vercel AI SDK

2. **Switching from OpenAI to Workers AI**
   - Modified the server.ts to use `workers-ai-provider` instead of `@ai-sdk/openai`
   - Used the model identifier `@cf/meta/llama-3.3-70b-instruct-fp8-fast`

3. **Customizing the UI**
   - Updated branding from generic "AI Chat Agent" to "FluxMind"
   - Added amber/gold color scheme for study-focused aesthetic
   - Removed OpenAI API key check (not needed with Workers AI)

## Model Used

- **Primary Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
  - Cloudflare Workers AI
  - 70B parameter model with FP8 quantization
  - Fast inference optimized for production use

---

*This document was created to comply with the requirement to include AI prompts used in development.*

