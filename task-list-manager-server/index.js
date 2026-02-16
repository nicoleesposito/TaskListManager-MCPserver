// Task List Manager - MCP Server
// A simple MCP server that manages markdown task files in ~/task-list/

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import os from "os";

// All tasks are stored as .md files in this directory
const TASK_DIR = path.join(os.homedir(), "task-list");

// Convert a title like "Project Ideas" into a filename like "project-ideas.md"
function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, "") + ".md" // trim leading/trailing hyphens, add extension
  );
}

// Ensure the ~/task-list/ directory exists
async function ensureTaskDir() {
  await fs.mkdir(TASK_DIR, { recursive: true });
}

// ── Create the MCP server ────────────────────────────────────────────

const server = new McpServer({
  name: "task-list-manager",
  version: "1.0.0",
});

// ── Tool: add_task ───────────────────────────────────────────────────
// Saves a new task as a markdown file in ~/task-list/

server.tool(
  "add_task",
  "Create a new task. Saves it as a markdown file in ~/task-list/.",
  {
    title: z.string().describe("The task title (used as the filename)"),
    content: z.string().describe("The task content in markdown"),
  },
  async ({ title, content }) => {
    await ensureTaskDir();

    const filename = slugify(title);
    const filepath = path.join(TASK_DIR, filename);

    // Build the markdown content with a YAML-like front matter header
    const markdown = `# ${title}\n\n**Status:** pending\n\n---\n\n${content}\n`;

    await fs.writeFile(filepath, markdown, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Task saved: ${filename}`,
        },
      ],
    };
  }
);

// ── Tool: list_tasks ─────────────────────────────────────────────────
// Lists all .md task files with their titles and last-modified dates

server.tool(
  "list_tasks",
  "List all tasks in ~/task-list/ with titles and last-modified dates.",
  // No parameters needed
  {},
  async () => {
    await ensureTaskDir();

    const files = await fs.readdir(TASK_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    if (mdFiles.length === 0) {
      return {
        content: [{ type: "text", text: "No tasks found." }],
      };
    }

    // Read each file to extract the title and get its modification time
    const tasks = await Promise.all(
      mdFiles.map(async (filename) => {
        const filepath = path.join(TASK_DIR, filename);
        const [content, stat] = await Promise.all([
          fs.readFile(filepath, "utf-8"),
          fs.stat(filepath),
        ]);

        // Extract the title from the first "# Title" line, or fall back to filename
        const titleMatch = content.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : filename;

        // Check if the task is marked as completed
        const statusMatch = content.match(/\*\*Status:\*\* (\w+)/);
        const status = statusMatch ? statusMatch[1] : "unknown";

        return `- **${title}** (${status}) — modified ${stat.mtime.toISOString().split("T")[0]}  \n  File: ${filename}`;
      })
    );

    return {
      content: [{ type: "text", text: tasks.join("\n") }],
    };
  }
);

// ── Tool: complete_task ──────────────────────────────────────────────
// Marks an existing task as completed by updating its status line

server.tool(
  "complete_task",
  "Mark a task as completed by updating its status in the markdown file.",
  {
    title: z.string().describe("The task title (used to find the file)"),
  },
  async ({ title }) => {
    await ensureTaskDir();

    const filename = slugify(title);
    const filepath = path.join(TASK_DIR, filename);

    // Check the file exists
    try {
      await fs.access(filepath);
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `Task not found: ${filename}`,
          },
        ],
      };
    }

    // Read the file and update the status from "pending" to "completed"
    let content = await fs.readFile(filepath, "utf-8");
    content = content.replace(
      /\*\*Status:\*\* pending/,
      "**Status:** completed"
    );

    await fs.writeFile(filepath, content, "utf-8");

    return {
      content: [
        {
          type: "text",
          text: `Task completed: ${filename}`,
        },
      ],
    };
  }
);

// ── Resource: task list overview ─────────────────────────────────────
// Exposes the current task list as a read-only resource that clients can read

server.resource(
  "task-list",
  "task-list://current",
  { description: "Current task list (read-only overview)" },
  async () => {
    await ensureTaskDir();

    const files = await fs.readdir(TASK_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    if (mdFiles.length === 0) {
      return {
        contents: [
          {
            uri: "task-list://current",
            mimeType: "text/plain",
            text: "No tasks yet.",
          },
        ],
      };
    }

    const summaries = await Promise.all(
      mdFiles.map(async (filename) => {
        const content = await fs.readFile(
          path.join(TASK_DIR, filename),
          "utf-8"
        );
        const titleMatch = content.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : filename;
        const statusMatch = content.match(/\*\*Status:\*\* (\w+)/);
        const status = statusMatch ? statusMatch[1] : "unknown";
        return `- [${status}] ${title}`;
      })
    );

    return {
      contents: [
        {
          uri: "task-list://current",
          mimeType: "text/plain",
          text: summaries.join("\n"),
        },
      ],
    };
  }
);

// ── Start the server ─────────────────────────────────────────────────
// Connect via stdio so Claude Code can communicate with this server

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Task List Manager MCP server running on stdio");
}

main().catch(console.error);
