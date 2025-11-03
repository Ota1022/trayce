/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Anthropic API Key - Required for procedure generation. Get your key from https://console.anthropic.com/ */
  "anthropicApiKey": string,
  /** Max Clipboard Items - Maximum number of clipboard items to process */
  "maxClipboardItems": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `generate-procedure` command */
  export type GenerateProcedure = ExtensionPreferences & {}
  /** Preferences accessible in the `generated-procedures` command */
  export type GeneratedProcedures = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `generate-procedure` command */
  export type GenerateProcedure = {}
  /** Arguments passed to the `generated-procedures` command */
  export type GeneratedProcedures = {}
}

