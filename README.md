# Task List Manager MCP Server

## What this server does and why it's useful
This project is a simple Model Context Protocol (MCP) server built with Node.js that functions as a task list manager. It allows an MCP-compatible client to create, view, and complete tasks through structured tool calls. Without MCP, an AI can suggest tasks but cannot manage or update them. This server allows tasks to be stored, retrieved, and updated, enabling the AI to stay synchronized with real progress instead of relying only on conversation context.

The server contains three tools:
- add_task — creates a new task
- list_tasks — lists all current tasks
- complete_task — marks a task as completed

It also provides the current task list as a read-only resource so the client can access the current state at any time. Tasks are stored as markdown files in a local directory, allowing data to persist across sessions. This project demonstrates how MCP can connect an AI client externally in a simple way.

## Installation instructions
Prerequisites include:
- Node.js
- npm
- MCP-compatible client

(1). Run: git clone https://github.com/nicoleesposito/TaskListManager-MCPserver.git <br>
(2). cd TaskListManager-MCPserver <br>
(3). npm install <br>
(4). node index.js <br>

## Usage Examples
(1). Add a Task - Create a new task with a title and description <br>
"Create a task titled "Install dependencies" with content "Run npm install and verify build""  

(2). List Tasks - View all exisiting tasks <br>
"List all tasks"  

(3). Complete a Task - Mark an exisiting task as completed <br>
"Mark "Install dependencies" as completed"  

## Limitations or known issues
Some limitations of this MCP server include:
- Tasks are identified by title rather than a unique ID
- Does not contain meta data such as timestamps

At the moment, there are no known issues after testing. This includes consideration of the limitations, as it has not broken any functionalities in the Task List Manager.
