import { ICredentialType, INodeProperties } from "n8n-workflow";

export class GeminiApi implements ICredentialType {
    name = 'geminiApi';
    displayName = 'Gemini API Key';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true
            },
            default: '',
            required: true,
        },
    ];
}
