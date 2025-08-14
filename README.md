# n8n-nodes-gemini

<p align="center">
  <img src="./nodes/Gemini/Gemini.light.svg" alt="Gemini Logo" width="125" height="125">
</p>

<p align="center">
  <b>Integrate Google Gemini AI into your n8n workflows</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@raisaroj/n8n-nodes-gemini"><img src="https://img.shields.io/npm/v/@raisaroj/n8n-nodes-gemini.svg?color=brightgreen" alt="NPM Version"></a>
  <a href="https://github.com/dioveath/n8n-nodes-gemini/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

## Overview

This package provides n8n nodes for integrating Google Gemini AI into your workflows. It offers enhanced features like multi-API key support and improved stability through retries for empty responses.

## Features

- 🔑 **Multi-API Key Support**: Distribute API calls across multiple keys to avoid rate limits
- 🔄 **Improved Stability**: Handles empty responses gracefully with retry mechanisms
- 🛠️ **Advanced Configuration**: Fine-tune model parameters including temperature, top-k, top-p, and more
- 🔒 **Safety Settings**: Configure content filtering with customizable safety thresholds

## Installation

### Community Nodes (Recommended)

For users with n8n v0.187+, you can install via the Community Nodes panel in your n8n instance:

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Type "@raisaroj/n8n-nodes-gemini"
4. Click **Install**

## Usage

### Authentication

1. Obtain a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In n8n, create a new credential of type **GeminiAPI Key API**
3. Enter your API key

### Basic Text Generation

1. Add a **Gemini** node to your workflow
2. Select the **Text** resource and **Generate Text** operation
3. Choose a model (e.g., `gemini-1.5-pro`)
4. Add your messages in the conversation format
5. Configure additional options as needed

### Using Multiple API Keys

1. Enable **Round Robin Keys** in the node configuration
2. Add additional API keys in the **Additional API Keys** section
3. The node will automatically distribute requests across all provided keys

## Configuration Options

### Model Parameters

- **Temperature**: Controls randomness (0-2)
- **Max Output Tokens**: Limits response length
- **Top K**: Number of highest probability tokens to consider
- **Top P**: Cumulative probability threshold for token selection
- **Frequency Penalty**: Reduces repetition of tokens
- **Presence Penalty**: Encourages use of new tokens

### Safety Settings

Configure content filtering across multiple harm categories:

- Harassment
- Hate Speech
- Sexually Explicit Content
- Dangerous Content
- And more

## Empty Responses

If you encounter empty responses, try:

1. Simplifying your prompt
2. Using a different model
3. Enabling the retry mechanism in n8n-workflow settings

### Rate Limiting

If you hit rate limits:

1. Enable **Round Robin Keys** and add multiple API keys
2. Implement delay nodes between Gemini API calls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Author

- **rAi** - [GitHub](https://github.com/dioveath)

## Acknowledgements

- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [n8n Community](https://community.n8n.io/)