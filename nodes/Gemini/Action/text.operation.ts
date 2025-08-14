import { Content, GoogleGenAI } from "@google/genai";
import { IExecuteFunctions, INodeExecutionData, NodeApiError } from "n8n-workflow";

export async function execute(
    this: IExecuteFunctions,
    _items: INodeExecutionData[]
): Promise<INodeExecutionData[][]> {
    const model = this.getNodeParameter('model', 0) as string;
    const credentials = await this.getCredentials('geminiApi') as { apiKey: string };
    const simplifyOutput = this.getNodeParameter('simplifyOutput', 0) as boolean;
    const options = this.getNodeParameter('options', 0) as Record<string, any>;
    const messages = this.getNodeParameter('messages', 0) as { message: { role: 'user' | 'model', prompt: string }[] };

    const contents: Content[] = (messages.message || []).map(item => ({
        role: item.role,
        parts: [{ text: item.prompt }]
    }))

    const genAI = new GoogleGenAI({ apiKey: credentials.apiKey });
    const genConfig = {
        model: model,
        contents: contents,
        config: {
            systemInstruction: options.systemInstruction ? {
                parts: [{
                    text: options.systemInstruction,
                }]
            } : undefined,
            temperature: options.temperature,
            maxOutputTokens: options.maxOutputTokens,
            topP: options.topP,
            topK: options.topK,
            frequencyPenalty: options.frequencyPenalty,
            presencePenalty: options.presencePenalty,
            thinkingConfig: options.thinkingConfig,
            safetySettings: options.safetySettings?.settings
        },
    }

    const result = await genAI.models.generateContent(genConfig)
    const { candidates, usageMetadata } = result

    if (!result.text) {
        throw new NodeApiError(this.getNode(), {
            message: 'No text in response',
            description: 'The model did not return any text in the response. This is common problem while using gemini with complex prompts. You can try activating Retry On Fail for multiple times to avoid this error.',
            code: 'NO_TEXT_IN_RESPONSE',
        })
    }

    if (simplifyOutput) {
        return this.prepareOutputData([{
            json: {
                response: result.text,
            }
        }]);
    }

    return this.prepareOutputData([{
        json: {
            candidates,
            usageMetadata,
            modelVersion: result.modelVersion,
            responseId: result.responseId
        }
    }]);
}