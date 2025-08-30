import { useState } from "react";
import { AgentRequest, AgentResponse } from "../types/api";

/**
 * Sends a user message to the AgentKit backend API and retrieves the agent's response.
 *
 * @async
 * @function callAgentAPI
 * @param {string} userMessage - The message sent by the user.
 * @returns {Promise<string | null>} The agent's response message or `null` if an error occurs.
 *
 * @throws {Error} Logs an error if the request fails.
 */
async function messageAgent(userMessage: string): Promise<string | null> {
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage } as AgentRequest),
    });

    const data = (await response.json()) as AgentResponse;
    return data.response ?? data.error ?? null;
  } catch (error) {
    console.error("Error communicating with agent:", error);
    return null;
  }
}

/**
 *
 * This hook manages interactions with the AI agent by making REST calls to the backend.
 * It also stores the local conversation state, tracking messages sent by the user and
 * responses from the agent.
 *
 * #### How It Works
 * - `sendMessage(input)` sends a message to `/api/agent` and updates state.
 * - `messages` stores the chat history.
 * - `isThinking` tracks whether the agent is processing a response.
 *
 * #### See Also
 * - The API logic in `/api/agent.ts`
 *
 * @returns {object} An object containing:
 * - `messages`: The conversation history.
 * - `sendMessage`: A function to send a new message.
 * - `isThinking`: Boolean indicating if the agent is processing a response.
 */
export function useAgent() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "agent" }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "confirmed" | "failed">("pending");

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    const responseMessage = await messageAgent(input);

    if (responseMessage) {
      setMessages(prev => [...prev, { text: responseMessage, sender: "agent" }]);
    }

    setIsThinking(false);
  };

  return { messages, sendMessage, isThinking };
}


const handlePaymentRequired = async () => {
  try {
    // Send payment request to backend
    const response = await fetch("/api/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        messageCount: messages.length + 1,
        userId: "user_123" // Replace with actual user ID
      }),
    });

    if (response.status === 402) {
      // Payment required - show payment modal
      setPaymentStatus("pending");
      // You'll implement a payment modal here
    } else if (response.ok) {
      const data = await response.json();
      if (data.paymentConfirmed) {
        setPaymentStatus("confirmed");
        // Continue with the message
        const responseMessage = await messageAgent(input);
        if (responseMessage) {
          setMessages(prev => [...prev, { text: responseMessage, sender: "agent" }]);
        }
      }
    }
  } catch (error) {
    console.error("Payment error:", error);
    setPaymentStatus("failed");
  };

  return { 
    messages, 
    sendMessage, 
    isThinking, 
    paymentStatus,
    setPaymentStatus 
  };
}