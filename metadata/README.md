# Screenshots Guide for Trayce Extension

This folder contains screenshots for the Raycast Store submission.

## Requirements (from reviewer feedback)

You need to add at least one screenshot of the extension in action. The screenshot must be properly formatted using Raycast's screenshot tool.

## How to Capture Screenshots

### 1. Install Raycast's Screenshot Tool

```bash
npm install -g @raycast/screenshot
```

### 2. Take Screenshots

Run your extension in Raycast and capture screenshots showing:

**Recommended screenshots:**

1. **Create Procedures view** - Showing clipboard items with notes
2. **Procedure generation form** - Showing the title and configuration options
3. **Generated procedure** - Showing the final Markdown output
4. **My Procedures view** - Showing saved procedures list

### 3. Format Screenshots with Raycast Tool

After taking raw screenshots, process them with the Raycast tool to add proper padding:

```bash
# Process a single screenshot
raycast-screenshot input.png output.png

# Or use the NPX command
npx @raycast/screenshot input.png output.png
```

### 4. Save Screenshots

Save the processed screenshots in this `metadata` folder with descriptive names:

- `trayce-1.png` - Primary screenshot (required)
- `trayce-2.png` - Additional screenshot (optional)
- `trayce-3.png` - Additional screenshot (optional)
- etc.

## Screenshot Guidelines

From Raycast documentation: https://developers.raycast.com/basics/prepare-an-extension-for-store#screenshots

- Screenshots should showcase the extension's key features
- Use the screenshot tool to ensure proper dimensions and padding
- Choose clear, representative examples of your extension in use
- Avoid including sensitive or personal information

## What to Show

For Trayce specifically, good screenshots would demonstrate:

1. **Workflow capture** - The main interface showing clipboard items with user notes
2. **AI generation** - The procedure generation form with title and custom instructions
3. **Generated output** - A sample of the Markdown procedure document
4. **Saved procedures** - The procedures management view

## Next Steps

1. Run the extension in development mode: `npm run dev`
2. Use the extension to create some example procedures
3. Take screenshots of the key screens
4. Process them with the @raycast/screenshot tool
5. Save them in this metadata folder
6. Commit and push the screenshots
7. Request re-review on the PR

## Current Status

⚠️ **ACTION REQUIRED**: Screenshots need to be added before re-requesting review.
