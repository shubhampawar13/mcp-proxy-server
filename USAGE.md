# MCP Proxy Server - Usage Guide

## Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

---

## API Endpoints

### 1. Health Check
Check if the server is running.

**Request:**
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "MCP Proxy Server is running"
}
```

---

### 2. List Tools
Get all available tools from the MCP server.

**Request:**
```bash
POST /api/list-tools
Content-Type: application/json

{
  "url": "https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp",
  "username": "101",
  "password": "your-password",
  "cookie": "workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg=="
}
```

**Response:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "CatalogService_Plant_query",
      "description": "Query plant catalog",
      "inputSchema": {
        "type": "object",
        "properties": {}
      }
    }
  ]
}
```

---

### 3. Call Single Tool
Execute a specific tool on the MCP server.

**Request:**
```bash
POST /api/call-tool
Content-Type: application/json

{
  "url": "https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp",
  "username": "101",
  "password": "your-password",
  "cookie": "workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg==",
  "toolName": "CatalogService_Plant_query",
  "arguments": {
    "where": [
      {
        "field": "ID",
        "op": "eq",
        "value": "11111111-1111-1111-1111-111111111111"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Query results..."
      }
    ]
  }
}
```

---

### 4. Call Multiple Tools
Execute multiple tools in sequence.

**Request:**
```bash
POST /api/call-multiple-tools
Content-Type: application/json

{
  "url": "https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp",
  "username": "101",
  "password": "your-password",
  "cookie": "workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg==",
  "tools": [
    {
      "name": "CatalogService_Plant_query",
      "arguments": {
        "where": [
          {
            "field": "ID",
            "op": "eq",
            "value": "11111111-1111-1111-1111-111111111111"
          }
        ]
      }
    },
    {
      "name": "CatalogService_Plant_query",
      "arguments": {
        "where": [
          {
            "field": "Status",
            "op": "eq",
            "value": "active"
          }
        ]
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "tool": "CatalogService_Plant_query",
      "success": true,
      "result": {}
    },
    {
      "tool": "CatalogService_Plant_query",
      "success": true,
      "result": {}
    }
  ]
}
```

---

## Frontend Examples

### JavaScript/Fetch API

#### Example 1: List Tools
```javascript
async function listMCPTools() {
  const response = await fetch('http://localhost:3000/api/list-tools', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: 'https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp',
      username: '101',
      password: 'your-password',
      cookie: 'workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg=='
    })
  });

  const data = await response.json();
  console.log('Available Tools:', data.tools);
  return data.tools;
}
```

#### Example 2: Call a Tool
```javascript
async function callMCPTool(toolName, toolArguments) {
  const response = await fetch('http://localhost:3000/api/call-tool', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: 'https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp',
      username: '101',
      password: 'your-password',
      cookie: 'workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg==',
      toolName: toolName,
      arguments: toolArguments
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('Tool Result:', data.result);
    return data.result;
  } else {
    console.error('Error:', data.error);
  }
}

// Usage
callMCPTool('CatalogService_Plant_query', {
  where: [
    {
      field: 'ID',
      op: 'eq',
      value: '11111111-1111-1111-1111-111111111111'
    }
  ]
});
```

### React Component Example
```javascript
import React, { useState } from 'react';

function MCPClient() {
  const [url, setUrl] = useState('https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp');
  const [username, setUsername] = useState('101');
  const [password, setPassword] = useState('');
  const [cookie, setCookie] = useState('');
  const [toolName, setToolName] = useState('CatalogService_Plant_query');
  const [toolArgs, setToolArgs] = useState('{}');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callTool = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/call-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          username,
          password,
          cookie,
          toolName,
          arguments: JSON.parse(toolArgs)
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>MCP Client</h1>
      
      <div>
        <label>URL: </label>
        <input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </div>

      <div>
        <label>Username: </label>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ marginBottom: '10px' }}
        />
      </div>

      <div>
        <label>Password: </label>
        <input 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ marginBottom: '10px' }}
        />
      </div>

      <div>
        <label>Cookie: </label>
        <input 
          value={cookie} 
          onChange={(e) => setCookie(e.target.value)} 
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </div>

      <div>
        <label>Tool Name: </label>
        <input 
          value={toolName} 
          onChange={(e) => setToolName(e.target.value)} 
          style={{ marginBottom: '10px' }}
        />
      </div>

      <div>
        <label>Arguments (JSON): </label>
        <textarea 
          value={toolArgs} 
          onChange={(e) => setToolArgs(e.target.value)} 
          style={{ width: '100%', height: '150px', marginBottom: '10px' }}
        />
      </div>

      <button onClick={callTool} disabled={loading}>
        {loading ? 'Calling...' : 'Call Tool'}
      </button>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}
      
      {result && (
        <pre style={{ marginTop: '10px', background: '#f0f0f0', padding: '10px' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default MCPClient;
```

### cURL Examples

#### List Tools
```bash
curl -X POST http://localhost:3000/api/list-tools \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp",
    "username": "101",
    "password": "your-password",
    "cookie": "workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg=="
  }'
```

#### Call Tool
```bash
curl -X POST http://localhost:3000/api/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://port4004-workspaces-ws-m7sob.ap21.trial.applicationstudio.cloud.sap/mcp",
    "username": "101",
    "password": "your-password",
    "cookie": "workspaces-ws-m7sob_WSR_SESSIONID=SlPRc1WBfD7Rgr5eL9VkM/IobaSJLJRU9KPQH4qCRuG5MtlnkRXly531LrIelbpFN0GsFiR8Wj9IShNPjkvvIg==",
    "toolName": "CatalogService_Plant_query",
    "arguments": {
      "where": [
        {
          "field": "ID",
          "op": "eq",
          "value": "11111111-1111-1111-1111-111111111111"
        }
      ]
    }
  }'
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing required fields)
- `500`: Server Error

Example error response:
```json
{
  "error": "Missing required fields: url, username, password",
  "message": "..."
}
```

---

## Notes

- The `cookie` field is optional. If your MCP server doesn't require it, you can omit it.
- Credentials are sent with each request. For production, consider storing them securely.
- Each request creates a new connection to the MCP server. For high-traffic scenarios, consider implementing connection pooling.
