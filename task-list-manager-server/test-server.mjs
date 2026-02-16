// Quick integration test — spawns the MCP server and sends JSON-RPC messages over stdio

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "index.js");

// Spawn the server as a child process (just like Claude Code does)
const server = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let requestId = 0;

// Collect stderr for diagnostics
server.stderr.on("data", (data) => {
  console.error(`[server stderr] ${data.toString().trim()}`);
});

// Parse newline-delimited JSON-RPC responses from stdout
server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep incomplete last line in buffer
  for (const line of lines) {
    if (line.trim()) {
      try {
        const msg = JSON.parse(line);
        console.log(`\n<-- RESPONSE (id=${msg.id}):`);
        console.log(JSON.stringify(msg, null, 2));
      } catch {
        // not JSON, ignore
      }
    }
  }
});

function send(msg) {
  const json = JSON.stringify(msg);
  console.log(`\n--> REQUEST (id=${msg.id || "notification"}):`);
  console.log(JSON.stringify(msg, null, 2));
  server.stdin.write(json + "\n");
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  // Step 1: Initialize handshake
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
    },
  });
  await sleep(500);

  // Step 2: Initialized notification
  send({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
  await sleep(300);

  // Step 3: Call add_task
  console.log("\n========== TEST: add_task ==========");
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: {
      name: "add_task",
      arguments: {
        title: "Test Task One",
        content: "This is a test task created by the integration test.",
      },
    },
  });
  await sleep(500);

  // Step 4: Call add_task again with a second task
  console.log("\n========== TEST: add_task (second) ==========");
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: {
      name: "add_task",
      arguments: {
        title: "Another Task",
        content: "Second task to verify list_tasks returns multiple items.",
      },
    },
  });
  await sleep(500);

  // Step 5: Call list_tasks
  console.log("\n========== TEST: list_tasks ==========");
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: { name: "list_tasks", arguments: {} },
  });
  await sleep(500);

  // Step 6: Call complete_task
  console.log("\n========== TEST: complete_task ==========");
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: {
      name: "complete_task",
      arguments: { title: "Test Task One" },
    },
  });
  await sleep(500);

  // Step 7: List again to confirm status changed
  console.log("\n========== TEST: list_tasks (after complete) ==========");
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: { name: "list_tasks", arguments: {} },
  });
  await sleep(500);

  // Step 8: Try to complete a non-existent task
  console.log("\n========== TEST: complete_task (not found) ==========");
  send({
    jsonrpc: "2.0",
    id: ++requestId,
    method: "tools/call",
    params: {
      name: "complete_task",
      arguments: { title: "Does Not Exist" },
    },
  });
  await sleep(500);

  // Done — kill the server
  console.log("\n========== ALL TESTS DONE ==========");
  server.kill();
}

run().catch((err) => {
  console.error(err);
  server.kill();
  process.exit(1);
});
