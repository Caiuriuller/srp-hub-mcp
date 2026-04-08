# srp-hub-mcp

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that exposes Hub API operations as tools for AI agents and MCP-compatible clients (e.g. Claude Desktop, GitHub Copilot, Cursor).

## Overview

`srp-hub-mcp` acts as a bridge between AI assistants and the Hub API. It runs as a local stdio-based MCP server, allowing AI agents to interact with Hub resources — such as creating customer leads — using structured, validated inputs.

## Requirements

- Node.js >= 18
- A valid `HUB_API_TOKEN` for authenticating against the Hub API

## Installation

```bash
npm install
npm run build
```

## Configuration

The server is configured via environment variables:

| Variable        | Required | Default                        | Description                          |
|-----------------|----------|--------------------------------|--------------------------------------|
| `HUB_API_TOKEN` | Yes      | —                              | Bearer token for Hub API auth        |
| `HUB_API_BASE`  | No       | `http://localhost:3001/v2`     | Base URL of the Hub API              |

## Usage

### Running directly

```bash
HUB_API_TOKEN=your_token node build/index.js
```

### MCP client configuration

Add the following to your MCP client config (e.g. `mcp.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "srp-hub-mcp": {
      "command": "npx",
      "args": ["srp-hub-mcp"],
      "env": {
        "HUB_API_TOKEN": "your_token_here",
        "HUB_API_BASE": "https://your-hub-api.example.com/v2"
      }
    }
  }
}
```

---

## Running on Claude Desktop (Windows) via NPX

### Step 1 — Install Node.js

Download and install **Node.js >= 18** from [https://nodejs.org](https://nodejs.org).  
Choose the **LTS** installer for Windows (`.msi`).

Verify the installation by opening **Command Prompt** or **PowerShell**:

```powershell
node -v   # should print v18.x.x or higher
npm -v
npx -v
```

### Step 2 — Install Claude Desktop

Download and install Claude Desktop from [https://claude.ai/download](https://claude.ai/download).  
Open it at least once so it creates its configuration folder.

### Step 3 — Open the Claude Desktop config file

The configuration file is located at:

```
%APPDATA%\Claude\claude_desktop_config.json
```

You can open it quickly by pressing **Win + R**, pasting the path below, and pressing **Enter**:

```
%APPDATA%\Claude\claude_desktop_config.json
```

Or navigate manually:

```
C:\Users\<YourUsername>\AppData\Roaming\Claude\claude_desktop_config.json
```

> If the file does not exist yet, create it as a new empty file in that folder.

### Step 4 — Add the MCP server configuration

Open `claude_desktop_config.json` with any text editor (e.g. Notepad, VS Code) and add the block below.  
If the file is already empty, paste the entire snippet. If it already has content, merge the `mcpServers` key.

```json
{
  "mcpServers": {
    "srp-hub-mcp": {
      "command": "npx",
      "args": ["-y", "srp-hub-mcp"],
      "env": {
        "HUB_API_TOKEN": "your_token_here",
        "HUB_API_BASE": "https://your-hub-api.example.com/v2"
      }
    }
  }
}
```

> Replace `your_token_here` with your real `HUB_API_TOKEN` and update `HUB_API_BASE` to point to your Hub API instance.  
> The `-y` flag in `args` tells NPX to skip the install confirmation prompt.

### Step 5 — Save and restart Claude Desktop

1. Save `claude_desktop_config.json`.
2. Fully quit Claude Desktop (right-click the tray icon → **Quit**).
3. Re-open Claude Desktop.

### Step 6 — Verify the integration

Start a new conversation in Claude Desktop and ask:

> "What MCP tools do you have available?"

Claude should list `post_customer` among the available tools. You can then ask it to create a customer and it will use the Hub API through this server.

### Troubleshooting

| Problem | Solution |
|---|---|
| `npx: command not found` | Re-install Node.js and make sure it is added to `PATH` |
| `Cannot find package 'srp-hub-mcp'` | The package must be published to npm (`npm publish`) or use a local path (see below) |
| `HUB_API_TOKEN` errors | Double-check the token value in `claude_desktop_config.json` |
| Tools not appearing | Confirm the JSON is valid (no trailing commas) and restart Claude Desktop |

## Available Tools

### `post_customer`

Creates a new customer (lead) in the Hub.

| Field         | Type   | Required | Description                                              |
|---------------|--------|----------|----------------------------------------------------------|
| `codigo`      | string | Yes      | Unique customer code (max 40 chars)                      |
| `tipo`        | number | Yes      | Person type: `1`=Juridical, `2`=Physical, `3`=Export    |
| `cnpjCpf`     | string | Yes      | CPF (11 digits) or CNPJ (14 digits), numbers only        |
| `nomeFantasia`| string | Yes      | Trade name / display name (max 250 chars)               |
| `status`      | number | Yes      | `0`=Inactive, `1`=Active                                 |

**Validation rules:**
- If `tipo` is `2` (Física), `cnpjCpf` must be a valid 11-digit CPF.
- If `tipo` is `1` (Jurídica) or `3` (Exportação), `cnpjCpf` must be a valid 14-digit CNPJ.
- No formatting characters (dots, dashes, slashes) — digits only.

### `post_lead`

Creates a new lead in the Hub via the `/leads` endpoint.

| Field          | Type   | Required | Description                                              |
|----------------|--------|----------|----------------------------------------------------------|
| `codigo`       | string | Yes      | Unique lead code (max 100 chars)                         |
| `email`        | string | Yes      | Valid email address (max 250 chars)                      |
| `nomeFantasia` | string | No       | Trade name / display name (max 250 chars)                |
| `razaoSocial`  | string | No       | Legal/company name (max 250 chars)                       |
| `telefone`     | string | No       | Phone number (max 20 chars)                              |
| `celular`      | string | No       | Mobile number (max 20 chars)                             |
| `origem`       | string | No       | Lead source: `OUTROS` or `RD_STATION`                    |

## Project Structure

```
src/
├── index.ts              # Entry point, stdio transport setup
├── server.ts             # MCP server instance
├── tools/
│   └── customer/
│       ├── handler.ts    # post_customer tool registration and logic
│       └── typings.ts    # Request/response type definitions
└── utils/
    ├── constants.ts      # Shared constants (status, person types, regex)
    └── hub.http.ts       # HTTP client for Hub API requests
build/                    # Compiled output (generated by npm run build)
```

## Development

```bash
# Compile TypeScript
npm run build

# The output binary is at build/index.js
```

## License

ISC
