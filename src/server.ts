import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "srp-hub-mcp",
  version: "1.0.0",
});

export default server;