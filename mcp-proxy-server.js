import express from "express";
import cors from "cors";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "MCP Proxy Server is running" });
});

/**
 * POST /api/list-tools
 * Lists available tools from MCP server
 * Body: { url, username, password, cookie }
 */
app.post("/api/list-tools", async (req, res) => {
  try {
    const { url, username, password, cookie } = req.body;

    // Validate required fields
    if (!url || !username || !password) {
      return res.status(400).json({
        error: "Missing required fields: url, username, password",
      });
    }

    // Create MCP client connection
    const client = await createMCPClient(url, username, password, cookie);

    // List available tools
    const tools = await client.listTools();

    // Close connection
    await client.close();

    res.json({
      success: true,
      tools: tools.tools || tools,
    });
  } catch (error) {
    console.error("Error listing tools:", error);
    res.status(500).json({
      error: "Failed to list tools",
      message: error.message,
    });
  }
});

/**
 * POST /api/call-tool
 * Calls a specific tool on the MCP server
 * Body: { url, username, password, cookie, toolName, arguments }
 */
app.post("/api/call-tool", async (req, res) => {
  try {
    const { url, username, password, cookie, toolName, arguments: toolArgs } =
      req.body;

    // Validate required fields
    if (!url || !username || !password || !toolName) {
      return res.status(400).json({
        error: "Missing required fields: url, username, password, toolName",
      });
    }

    // Create MCP client connection
    const client = await createMCPClient(url, username, password, cookie);

    // Call the tool
    const result = await client.callTool({
      name: toolName,
      arguments: toolArgs || {},
    });

    // Close connection
    await client.close();

    res.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error("Error calling tool:", error);
    res.status(500).json({
      error: "Failed to call tool",
      message: error.message,
    });
  }
});

/**
 * POST /api/call-multiple-tools
 * Calls multiple tools in sequence
 * Body: { url, username, password, cookie, tools: [{name, arguments}, ...] }
 */
app.post("/api/call-multiple-tools", async (req, res) => {
  try {
    const { url, username, password, cookie, tools: toolsList } = req.body;

    // Validate required fields
    if (!url || !username || !password || !toolsList || !Array.isArray(toolsList)) {
      return res.status(400).json({
        error:
          "Missing required fields: url, username, password, tools (array)",
      });
    }

    // Create MCP client connection
    const client = await createMCPClient(url, username, password, cookie);

    // Call multiple tools
    const results = [];
    for (const tool of toolsList) {
      try {
        const result = await client.callTool({
          name: tool.name,
          arguments: tool.arguments || {},
        });
        results.push({
          tool: tool.name,
          success: true,
          result: result,
        });
      } catch (toolError) {
        results.push({
          tool: tool.name,
          success: false,
          error: toolError.message,
        });
      }
    }

    // Close connection
    await client.close();

    res.json({
      success: true,
      results: results,
    });
  } catch (error) {
    console.error("Error calling multiple tools:", error);
    res.status(500).json({
      error: "Failed to call multiple tools",
      message: error.message,
    });
  }
});

/**
 * Helper function to create and connect MCP client
 */
async function createMCPClient(url, username, password, cookie) {
  try {
    // Create Basic Auth header
    const basicAuth = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );

    // Prepare headers
    const headers = {
      Authorization: `Basic ${basicAuth}`,
    };

    // Add cookie if provided
    if (cookie) {
      headers.Cookie = cookie;
    }

    // Create transport with authentication
    const transport = new StreamableHTTPClientTransport(
      new URL(url),
      {
        requestInit: {
          headers: headers,
        },
      }
    );

    // Create client
    const client = new Client(
      {
        name: "mcp-proxy-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Connect to MCP server
    await client.connect(transport);

    return client;
  } catch (error) {
    console.error("Error creating MCP client:", error);
    throw new Error(`Failed to connect to MCP server: ${error.message}`);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "POST /api/list-tools",
      "POST /api/call-tool",
      "POST /api/call-multiple-tools",
      "GET /health",
    ],
  });
});

// Start server
// app.listen(PORT, () => {
//   console.log(`🚀 MCP Proxy Server running on http://localhost:${PORT}`);
//   console.log(`Available endpoints:`);
//   console.log(`  - GET  /health`);
//   console.log(`  - POST /api/list-tools`);
//   console.log(`  - POST /api/call-tool`);
//   console.log(`  - POST /api/call-multiple-tools`);
// });
