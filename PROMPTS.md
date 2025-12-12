# AI Prompts Used in Development

This document contains the AI prompts used during the development of FluxMind, as required by the assignment guidelines.

## Initial Project Planning Prompt

```
I'm tasked with the following for a cloudflare optional assignment:
Optional Assignment: See instructions below for Cloudflare AI app assignment. SUBMIT GitHub repo URL for the AI project here.

Optional Assignment Instructions: We plan to fast track review of candidates who complete an assignment to build a type of AI-powered application on Cloudflare. An AI-powered application should include the following components:
- LLM (recommend using Llama 3.3 on Workers AI), or an external LLM of your choice
- Workflow / coordination (recommend using Workflows, Workers or Durable Objects)
- User input via chat or voice (recommend using Pages or Realtime)
- Memory or state

visit the following site for more information on this project: https://agents.cloudflare.com/ then, additional documentation will be here: https://developers.cloudflare.com/agents/

before implementing any type of code, please explain how you want to implement this, how we can implement this, etc. I would like to get into cloudflare
```

## Project Scaffolding Prompt

```
i would like to go with option a, as i simply want to have a baseline submission for this. i do have a cloudflare account, node js, but fluxmind study agent would be fine. nothing complex should be input, a simple submittable project. if you need anything please tell me
```

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

