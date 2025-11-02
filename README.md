<div align="center">
  <img src="logo/trayce_logo.png" alt="Trayce Logo" width="200"/>



  > Automatically generate procedure documentation from your clipboard history using AI
</div>

Transform your workflow into clear, shareable documentation with a single command. Trayce captures what you copy, analyzes your actions, and generates structured procedure guides.

## Features

- **📋 Smart Clipboard Tracking** - Automatically captures and categorizes clipboard items (commands, code, URLs, text)
- **🤖 AI-Powered Analysis** - Uses Claude AI to understand your workflow and generate clear documentation
- **📝 Structured Output** - Produces well-formatted Markdown procedure documents
- **💾 Procedure Library** - Save and manage your generated procedures for future reference
- **⚡ Quick Access** - Generate documentation directly from Raycast in seconds

## Installation

1. Install the extension from the [Raycast Store](https://www.raycast.com/ota1022/trayce)
2. Open Raycast and search for "Trayce"
3. Enter your Anthropic API key when prompted

### Getting an Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)
6. Paste it into Trayce extension preferences in Raycast

## Usage

### Create Procedures

1. Copy workflow steps to your clipboard (commands, code snippets, etc.)
2. Open Raycast (`⌘ Space`)
3. Type "Create Procedures"
4. Review your clipboard history
5. Press `Enter` to generate documentation
6. Copy or save the generated Markdown

### View Your Procedures

1. Open Raycast (`⌘ Space`)
2. Type "My Procedures"
3. Browse your saved procedures
4. Copy, edit, or delete as needed

## Configuration

Customize in Raycast Extension Preferences:

- **Anthropic API Key** (required) - Your Claude API key for procedure generation
- **Max Clipboard Items** (optional) - Maximum clipboard items to process (default: 50)

## How It Works

1. **Capture** - Trayce monitors your clipboard as you work
2. **Categorize** - Automatically detects content types (commands, code, URLs, text)
3. **Generate** - Claude AI analyzes your workflow and creates structured documentation
4. **Save** - Store procedures for future reference and sharing

## Examples

Perfect for documenting:
- Development workflows and build processes
- DevOps and deployment procedures
- Data analysis pipelines
- Design system usage
- API integration steps
- Troubleshooting guides

## Privacy & Security

- All clipboard data is processed locally
- API calls are made directly to Anthropic (no third-party servers)
- Procedures are stored locally on your machine
- Your API key is securely stored in Raycast preferences

## Support

- **Issues**: [GitHub Issues](https://github.com/Ota1022/trayce/issues)
- **Source Code**: [GitHub Repository](https://github.com/Ota1022/trayce)

## License

MIT License - see [LICENSE](LICENSE) for details
