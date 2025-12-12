/**
 * Tool definitions for FluxMind Study Agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

/**
 * Flashcard generator tool - creates study flashcards from topics
 * This executes automatically to help users create study materials
 */
const createFlashcard = tool({
  description: "Create a flashcard with a question and answer for studying",
  inputSchema: z.object({
    topic: z.string().describe("The topic or subject for the flashcard"),
    question: z.string().describe("The question side of the flashcard"),
    answer: z.string().describe("The answer side of the flashcard")
  }),
  execute: async ({ topic, question, answer }) => {
    console.log(`Creating flashcard for topic: ${topic}`);
    return {
      type: "flashcard",
      topic,
      question,
      answer,
      createdAt: new Date().toISOString()
    };
  }
});

/**
 * Study tip generator - provides study tips based on the subject
 */
const getStudyTip = tool({
  description: "Get a helpful study tip for a specific subject or learning goal",
  inputSchema: z.object({
    subject: z.string().describe("The subject or topic the user is studying")
  }),
  execute: async ({ subject }) => {
    const tips = [
      `For ${subject}: Try the Feynman Technique - explain the concept as if teaching a child.`,
      `For ${subject}: Use spaced repetition to review material at increasing intervals.`,
      `For ${subject}: Create mind maps to visualize connections between concepts.`,
      `For ${subject}: Practice active recall by testing yourself without looking at notes.`,
      `For ${subject}: Take breaks using the Pomodoro Technique (25 min work, 5 min break).`
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
});

/**
 * Quiz question generator - creates practice questions
 */
const generateQuizQuestion = tool({
  description: "Generate a practice quiz question on a given topic",
  inputSchema: z.object({
    topic: z.string().describe("The topic to create a quiz question about"),
    difficulty: z.enum(["easy", "medium", "hard"]).describe("The difficulty level")
  }),
  execute: async ({ topic, difficulty }) => {
    console.log(`Generating ${difficulty} quiz question for: ${topic}`);
    return {
      type: "quiz_question",
      topic,
      difficulty,
      instruction: `Here's a ${difficulty} question about ${topic}. Think about it carefully before answering!`,
      createdAt: new Date().toISOString()
    };
  }
});

/**
 * Schedule a study session tool
 * Uses the agent's scheduling capability
 */
const scheduleStudySession = tool({
  description: "Schedule a study session or reminder for later",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date
        : when.type === "delayed"
          ? when.delayInSeconds
          : when.type === "cron"
            ? when.cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling study session", error);
      return `Error scheduling study session: ${error}`;
    }
    return `📚 Study session scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled study sessions
 */
const getScheduledSessions = tool({
  description: "List all scheduled study sessions and reminders",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled study sessions found. Would you like to schedule one?";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled sessions", error);
      return `Error listing scheduled sessions: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled study session
 */
const cancelStudySession = tool({
  description: "Cancel a scheduled study session using its ID",
  inputSchema: z.object({
    sessionId: z.string().describe("The ID of the study session to cancel")
  }),
  execute: async ({ sessionId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(sessionId);
      return `Study session ${sessionId} has been cancelled.`;
    } catch (error) {
      console.error("Error canceling study session", error);
      return `Error canceling session ${sessionId}: ${error}`;
    }
  }
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  createFlashcard,
  getStudyTip,
  generateQuizQuestion,
  scheduleStudySession,
  getScheduledSessions,
  cancelStudySession
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * Currently all tools auto-execute, but this pattern allows for human-in-the-loop
 */
export const executions = {};
