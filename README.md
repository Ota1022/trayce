# Trayce - AI-Powered Procedure Documentation Generator

<div align="center">
  <img src="logo/trayce_logo.png" alt="Trayce Logo" width="200"/>

  > Automatically generate procedure documentation from your clipboard history using AI
</div>

Transform your workflow into clear, shareable documentation with a single command. Trayce captures what you copy, analyzes your actions, and generates structured procedure guides.

## Use Cases

### When Colleagues Ask About Your Work

Quickly create shareable documentation when teammates ask "How did you do that?" or "Can you document this process?" Generate professional procedure guides from your recent work without starting from scratch.

### Remember Complex Commands

Capture unfamiliar or rarely-used commands with explanations as you learn them. Build your personal knowledge base of procedures so you never have to look up the same command twice.

### Standardize Team Documentation

Create consistent, well-formatted procedure manuals across your team. Trayce generates documentation in a uniform style, making it easier for everyone to read and follow procedures regardless of who created them.

### Knowledge Transfer Made Easy

Document your workflows before going on vacation, changing roles, or onboarding new team members. Turn implicit knowledge into explicit, shareable guides.

## Features

- **📋 Smart Clipboard Tracking** - Automatically captures and categorizes clipboard items (commands, code, URLs, text)
- **📝 Contextual Notes** - Add notes to clipboard items to provide context and improve documentation accuracy
- **🤖 AI-Powered Analysis** - Uses Claude AI to understand your workflow and generate clear documentation
- **📄 Structured Output** - Produces well-formatted Markdown procedure documents
- **💾 Procedure Library** - Save and manage your generated procedures for future reference
- **⚡ Quick Access** - Generate documentation directly from Raycast in seconds

## Installation

1. Install the extension from the [Raycast Store](https://www.raycast.com/ota1022/trayce)
2. Open Raycast and search for "Trayce - Procedure Documentation"
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

1. **Copy commands**: Copy commands, code snippets, URLs, or text as you work through your task
2. **Open Trayce**: Launch Raycast (`⌘ Space`) and type "Create Procedures"
3. **Add notes**: Select a copied command and press `⌘ N` to add an explanation
   - Describe what the command does and why you're using it
   - Add context that isn't obvious from the command itself
   - Notes are essential for generating accurate, meaningful documentation
4. **Select and order notes**: Choose which notes to include and arrange them in the correct sequence for your procedure
5. **Configure generation options**: Select language preference and other settings for your documentation
6. **Generate**: Create your procedure document with AI-powered analysis
7. **View in My Procedures**: Access, edit, copy, or share your saved procedure documentation

### View Your Procedures

1. Open Raycast (`⌘ Space`)
2. Type "My Procedures"
3. Browse your saved procedures
4. Copy, edit, or delete as needed

## How It Works

1. **Capture** - Trayce monitors your clipboard as you work
2. **Annotate** - Add explanatory notes to each clipboard item to provide context
3. **Organize** - Select and order your notes to match your procedure flow
4. **Generate** - Claude AI analyzes your annotated workflow and creates structured documentation
5. **Save** - Store procedures for future reference and sharing

## Examples

Perfect for documenting:

- Development workflows and build processes
- DevOps and deployment procedures
- Data analysis pipelines
- Design system usage
- API integration steps
- Troubleshooting guides

## Configuration

Customize in Raycast Extension Preferences:

- **Anthropic API Key** (required) - Your Claude API key for procedure generation
- **Max Clipboard Items** (optional) - Maximum clipboard items to process (default: 50)

## Privacy & Security

- Clipboard data is captured locally and sent directly to Anthropic API for procedure generation
- No third-party servers or intermediaries (only you → Anthropic)
- Procedures are stored locally on your machine
- Your API key is securely stored in Raycast preferences

## Support

- **Issues**: [GitHub Issues](https://github.com/Ota1022/trayce/issues)
- **Source Code**: [GitHub Repository](https://github.com/Ota1022/trayce)

## License

MIT License - see [LICENSE](LICENSE) for details
