/**
 * ORIP Advisor Chat — Palantir AIP TypeScript Function
 *
 * Deploy this to the `orip-functions` TypeScript v2 Functions repository in Foundry.
 * Once deployed and registered as a ChatCompletion, it will be callable via:
 *   foundryClient(advisorChat).executeFunction({ message, context })
 *
 * After deploying:
 * 1. Run `generate_new_ontology_sdk_version` to publish a new OSDK version
 * 2. Run `npm install @orip-frontend/sdk@latest` in the frontend
 * 3. In /api/advisor/route.ts, uncomment the executeFunction call and remove the
 *    direct Anthropic API call
 */

import { isErr, UserFacingError } from "@foundry/functions-api";
import { ChatCompletion } from "@palantir/languagemodelservice/contracts";
import {
  FunctionsGenericChatCompletionRequestMessages,
  FunctionsGenericChatCompletionResponse,
  GenericCompletionParams,
} from "@palantir/languagemodelservice/api";

// The system prompt is injected from the Next.js API route as part of the
// messages array so all Foundry ontology data stays server-side.
export class AdvisorFunctions {
  @ChatCompletion()
  public async advisorChat(
    messages: FunctionsGenericChatCompletionRequestMessages,
    params: GenericCompletionParams
  ): Promise<FunctionsGenericChatCompletionResponse> {
    // Replace "ClaudeHaikuSource" with the name of your AIP webhook source
    // configured in Foundry Data Connection (pointing to Anthropic or OpenAI).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AIPSource = (globalThis as any).ClaudeHaikuSource;

    const res = await AIPSource.webhooks.CreateChatCompletion.call({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: messages.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    if (isErr(res)) {
      throw new UserFacingError(
        "The advisor is temporarily unavailable. Please try again in a moment."
      );
    }

    return {
      completion: res.value.output.choices?.[0]?.message?.content ?? "No response generated.",
      tokenUsage: {
        promptTokens: res.value.output.usage?.input_tokens ?? 0,
        maxTokens: 1024,
        completionTokens: res.value.output.usage?.output_tokens ?? 0,
      },
    };
  }
}
