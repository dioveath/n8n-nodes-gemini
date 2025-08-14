import {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    NodeOperationError,
} from 'n8n-workflow';
import { getModels } from './Action/helpers.operation';
import * as textOperation from './Action/text.operation';


export class Gemini implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Gemini',
        name: 'gemini',
        icon: { dark: 'file:Gemini.dark.svg', light: 'file:Gemini.light.svg' },
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"] }}',
        description: 'Interact with Gemini API',
        defaults: {
            name: 'Run Gemini',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'geminiApi',
                required: true,
            }
        ],
        properties: [
            {
                displayName: 'Round Robin Keys',
                name: 'roundRobinKeys',
                type: 'boolean',
                default: false,
            },
            {
                displayName: 'Additional API Keys',
                name: 'additionalKeys',
                type: 'fixedCollection',
                placeholder: 'Add API key',
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        roundRobinKeys: [true],
                    }
                },
                options: [
                    {
                        displayName: 'Key',
                        name: 'keys',
                        values: [
                            {
                                displayName: 'API Key',
                                name: 'key',
                                type: 'string',
                                typeOptions: {
                                    password: true,
                                },
                                default: '',
                                description: 'An additional API key to use with the Gemini API'
                            }
                        ]
                    }
                ],
                default: {
                    keys: []
                },
            },
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Text',
                        value: 'text',
                    },
                    {
                        name: 'Audio',
                        value: 'audio',
                    }
                ],
                default: 'text',
                description: 'The resource to use with the Gemini API',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Generate Text',
                        value: 'generateText',
                        action: 'Generate a text',
                    },
                ],
                displayOptions: {
                    show: {
                        resource: ['text'],
                    }
                },
                default: 'generateText',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['audio'],
                    }
                },
                options: [
                    {
                        name: 'Generate Audio',
                        value: 'generateAudio',
                        displayName: 'Generate Audio',
                        action: 'Generate an audio',
                    },
                ],
                default: 'generateAudio',
            },
            {
                displayName: 'Model Name or ID',
                name: 'model',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getModels'
                },
                default: '',
                description: 'The model to use with the Gemini API. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            },
            {
                displayName: 'Messages',
                name: 'messages',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                    sortable: true
                },
                default: {
                    message: [
                        {
                            role: 'user',
                            prompp: ''
                        }
                    ]
                },
                placeholder: 'Add Message',
                description: 'The messages to send to the model. The conversation history.',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['generateText'],
                    }
                },
                options: [
                    {
                        displayName: 'Message',
                        name: 'message',
                        values: [
                            {
                                displayName: 'Role',
                                name: 'role',
                                type: 'options',
                                options: [
                                    {
                                        name: 'User',
                                        value: 'user',
                                    },
                                    {
                                        name: 'Model',
                                        value: 'model',
                                    }
                                ],
                                default: 'user',
                                description: 'The role of the message sender',
                            },
                            {
                                displayName: 'Prompt',
                                name: 'prompt',
                                type: 'string',
                                typeOptions: {
                                    rows: 4
                                },
                                default: '',
                                placeholder: 'What is the meaning of life?',
                                description: 'The content of the message',
                            }
                        ]
                    }
                ]
            },
            {
                displayName: 'Simplify Output',
                name: 'simplifyOutput',
                type: 'boolean',
                default: false,
                description: 'Whether to simplify the output to only return the text of the response',
            },
            {
                displayName: 'Options',
                name: 'options',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                options: [
                    {
                        displayName: 'Frequency Penalty',
                        name: 'frequencyPenalty',
                        type: 'number',
                        default: 0,
                        description: 'Penalizes repeated tokens in the response. Use a higher value to reduce the likelihood of repeated tokens.',
                    },
                    {
                        displayName: 'Max Output Tokens',
                        name: 'maxOutputTokens',
                        type: 'number',
                        default: 16384,
                        description: 'The maximum number of tokens to generate in the response',
                    },
                    {
                        displayName: 'Presence Penalty',
                        name: 'presencePenalty',
                        type: 'number',
                        default: 0,
                        description: 'Penalizes new tokens based on whether they appear in the text so far. Use a higher value to encourage the model to use new tokens.',
                    },
                    {
                        displayName: 'Saftey Settings',
                        name: 'safetySettings',
                        type: 'fixedCollection',
                        typeOptions: {
                            multipleValues: true,
                            sortable: true
                        },
                        placeholder: 'Add Safety Setting',
                        description: 'Safety settings in the request to block unsafe content in the response',
                        default: {},
                        options: [
                            {
                                displayName: 'Safety Setting',
                                name: 'settings',
                                values: [
                                    {
                                        displayName: 'Harm Category',
                                        name: 'category',
                                        type: 'options',
                                        options: [
                                            {
                                                name: "HARM_CATEGORY_CIVIC_INTEGRITY",
                                                value: "HARM_CATEGORY_CIVIC_INTEGRITY",
                                            },
                                            {
                                                name: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                value: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                            },
                                            {
                                                name: "HARM_CATEGORY_HARASSMENT",
                                                value: "HARM_CATEGORY_HARASSMENT",
                                            },
                                            {
                                                name: "HARM_CATEGORY_HATE_SPEECH",
                                                value: "HARM_CATEGORY_HATE_SPEECH",
                                            },
                                            {
                                                name: "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT",
                                                value: "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT",
                                            },
                                            {
                                                name: "HARM_CATEGORY_IMAGE_HARASSMENT",
                                                value: "HARM_CATEGORY_IMAGE_HARASSMENT",
                                            },
                                            {
                                                name: "HARM_CATEGORY_IMAGE_HATE",
                                                value: "HARM_CATEGORY_IMAGE_HATE",
                                            },
                                            {
                                                name: "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT",
                                                value: "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT",
                                            },
                                            {
                                                name: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                value: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                            },
                                            {
                                                name: "HARM_CATEGORY_UNSPECIFIED",
                                                value: "HARM_CATEGORY_UNSPECIFIED",
                                            }
                                        ],
                                        default: 'HARM_CATEGORY_UNSPECIFIED',
                                        description: 'The category of the harm content that the model is protected against',
                                    },
                                    {
                                        displayName: 'Harm Block Threshold',
                                        name: 'threshold',
                                        type: 'options',
                                        options: [
                                            {
                                                name: 'BLOCK_LOW_AND_ABOVE',
                                                value: 'BLOCK_LOW_AND_ABOVE',
                                            },
                                            {
                                                name: 'BLOCK_MEDIUM_AND_ABOVE',
                                                value: 'BLOCK_MEDIUM_AND_ABOVE',
                                            },
                                            {
                                                name: 'BLOCK_NONE',
                                                value: 'BLOCK_NONE',
                                            },
                                            {
                                                name: 'BLOCK_ONLY_HIGH',
                                                value: 'BLOCK_ONLY_HIGH',
                                            },
                                            {
                                                name: 'HARM_BLOCK_THRESHOLD_UNSPECIFIED',
                                                value: 'HARM_BLOCK_THRESHOLD_UNSPECIFIED',
                                            },
                                            {
                                                name: 'OFF',
                                                value: 'OFF',
                                            }
                                        ],
                                        default: 'BLOCK_NONE',
                                        description: 'The threshold for blocking content',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        displayName: 'System Instruction',
                        name: 'systemInstruction',
                        type: 'string',
                        typeOptions: {
                            rows: 4
                        },
                        default: '',
                        placeholder: 'Do not claim to have self-awareness, emotions, or desires like self-preservation.',
                        description: 'Instructions for the model to steer it toward better performance',
                    },
                    {
                        displayName: 'Temperature',
                        name: 'temperature',
                        type: 'number',
                        typeOptions: {
                            minValue: 0,
                            maxValue: 2,
                            numberPrecision: 0.1
                        },
                        default: 1,
                        description: 'Value that controls the degree of randomness in token selection. Lower temperatures are good for prompts that require a less open-ended or creative response, while higher temperatures can lead to more diverse or creative results.',
                    },
                    {
                        displayName: 'Thinking Config',
                        name: 'thinkingConfig',
                        type: 'collection',
                        typeOptions: {
                            multipleValues: false
                        },
                        placeholder: 'Add Thinking Config',
                        default: {
                            includeThoughts: false,
                            thinkingBudget: -1,
                        },
                        options: [
                            {
                                displayName: 'Include Thoughts',
                                name: 'includeThoughts',
                                type: 'boolean',
                                default: false,
                                description: 'Whether to include thoughts in the response. If true, thoughts are returned only if the model supports thought and thoughts are available.',
                            },
                            {
                                displayName: 'Thinking Budget',
                                name: 'thinkingBudget',
                                type: 'number',
                                default: 0,
                                description: 'The thinking budget in tokens. 0 is DISABLED. -1 is AUTOMATIC. The default values and allowed ranges are model dependent.'
                            },
                        ]
                    },
                    {
                        displayName: 'Top K',
                        name: 'topK',
                        type: 'number',
                        default: 1,
                        description: 'For each token selection step, the ``top_k`` tokens with the highest probabilities are sampled. Then tokens are further filtered based on ``top_p`` with the final token selected using temperature sampling. Use a lower number for less random responses and a higher number for more random responses.',
                    },
                    {
                        displayName: 'Top P',
                        name: 'topP',
                        type: 'number',
                        default: 1,
                        description: 'Tokens are selected from the most to least probable until the sum of their probabilities equals this value. Use a lower value for less random responses and a higher value for more random responses.',
                    }
                ]
            }
        ]
    }

    methods = {
        loadOptions: {
            async getModels(this: ILoadOptionsFunctions) {
                const models = await getModels.call(this)
                return models.map((model) => ({
                    name: model,
                    value: model
                }))
            }
        },

    }

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const resource = this.getNodeParameter('resource', 0) as string;
        const items = this.getInputData();
        let returnData: INodeExecutionData[][] = [];

        if (resource === 'audio') {
            throw new NodeOperationError(this.getNode(), 'Audio resource is not supported yet.')
        } else if (resource === 'text') {
            returnData = await textOperation.execute.call(this, items);
        }

        return returnData;
    }
}

