import { IExecuteFunctions, IHookFunctions, IHttpRequestOptions, ILoadOptionsFunctions, IWebhookFunctions, NodeOperationError } from "n8n-workflow";

export async function getModels(this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions): Promise<string[]> {
    const credentials = await this.getCredentials('geminiApi');
    if (!credentials) {
        throw new NodeOperationError(this.getNode(), 'No Gemini API credentials found');
    }

    const apiKey = credentials.apiKey;
    const host = 'https://generativelanguage.googleapis.com';

    const options: IHttpRequestOptions = {
        method: 'GET',
        url: `${host}/v1beta/models`,
        qs: {
            key: apiKey
        },
        json: true
    }

    try {
        if (!this.helpers) {
            throw new NodeOperationError(this.getNode(), 'No helpers found');
        }
        const response = await this.helpers.httpRequest(options);
        return response.models.filter((model: any) => model.supportedGenerationMethods?.includes('generateContent')).map((model: any) => model.name.replace('models/', ''))
    } catch (error) {
        throw new NodeOperationError(this.getNode(), 'Error getting models', error);
    }


}