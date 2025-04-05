// claudeClient.ts
// Author: Joshua Motoaki Lau '26

import { Anthropic } from "@anthropic-ai/sdk";

/**
 * A simple client for the Claude API using the official Anthropic library
 */
class ClaudeClient {
    private client: Anthropic;
    private model: string;

    /**
     * Creates a new Claude API client
     * @param model - The Claude model to use (e.g. 'claude-3-5-haiku-20241022')
     * @param apiKey - Your Anthropic API key
     */
    constructor(model: string, apiKey: string) {
        this.model = model;
        this.client = new Anthropic({
            apiKey: apiKey
        });
    }

    /**
     * Sends a message to Claude and returns the response
     * @param systemPrompt - The system prompt for Claude
     * @param userPrompt - The user message to send to Claude
     * @returns The response text from Claude
     */
    public async createMessage(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                max_tokens: 4096
            });

            if (response.content[0].type === "text") {
                return response.content[0].text;
            } else {
                throw new Error(`Unexpected response from Claude: ${response.content[0].type}`);
            }
        } catch (error) {
            throw new Error(`Error calling Claude API: ${error}`);
        }
    }
}

export default ClaudeClient;
