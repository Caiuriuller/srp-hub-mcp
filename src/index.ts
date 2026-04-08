#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";
import { HUB_API_BASE, HUB_API_TOKEN } from "./utils/hub.http.js";
import "./tools/customer/handler.js";
import "./tools/lead/handler.js";

if (!HUB_API_TOKEN) {
  console.error("[srp-hub-mcp] FATAL: HUB_API_TOKEN env var is required but not set.");
  process.exit(1);
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`[srp-hub-mcp] Server running on stdio | API: ${HUB_API_BASE}`);
}

main().catch((error) => {
  console.error("[srp-hub-mcp] Fatal error:", error);
  process.exit(1);
});
