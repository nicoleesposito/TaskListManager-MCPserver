# Week 4 - Task List Manager MCP Server

## 1. What I built:
I built a simple MCP (Model  Context Protocol) server using Node.js that acts as a task list manager. The server runs off of 3 tools: add_task to create a new task, list_tasks to view all current tasks, and complete_task to mark a task as finished. The tasks are stored as markdown files in a local directory which allows the data to stay persistent across sessions. I also defined the current task list as a resource so the client can access a read-only view of the task state at any time.

## 2. How Claude Code helped:
Claude Code helped by guiding the structure of the MCP server and its files, while also clarifying how the tools and resources should be defined. It helped me understand how to translate a concept into an actual tool that functions by explaining how each code function works in the task list manager's codebase, and additionally helped simplify the installation process of packages and node modules. Some examples of prompts that helped me create the MCP server include the following:

(1). Create a simple MCP server for Claude Code using Node.js.

The server should have three tools:

1. "add_task" - Takes a title (string) and content (string), saves the
    content as a markdown file in ~/task-list/ using the title as the
    filename (slugified, e.g. "Project Ideas" → "project-ideas.md").
    Creates the ~/task-list/ directory if it doesn't exist.

2. "list_tasks" - Takes no parameters, returns a list of all .md files
    in ~/task-list/ with their titles and last-modified dates.

3. "complete_task" - Takes a title (string), finds the matching .md file in
   ~/task-list/, marks the task as completed (for example by updating its
   status or moving it to a completed state), and saves the change.

Resource: Current task list as a resource (read-only view).

Please create:

1. package.json with the @modelcontextprotocol/sdk dependency
2. index.js with the complete server code using McpServer and StdioServerTransport
3. Add clear comments explaining what each part does

Keep it simple - this is my first MCP server.

(2).  Create a CodeTour (.tours/ directory) for my MCP server that walks through:
  1. How the server initializes
  2. How each tool is registered
  3. How save_note creates files on disk
  4. How the server communicates via stdio

(3). Create a task titled "Install dependencies" with content "Run npm install and verify build"

## 3. Debugging journey:
I initially made an error in my prompt, which caused the MCP server’s function to behave differently than what I intended. I talked through it with Claude, undid the changes, and restarted with an updated prompt that better matched the tool behaviors I wanted. The biggest challenge was understanding how the tools should differ and making sure the descriptions matched their purpose. For example, I had to clarify that complete_task should actually change the task’s state rather than just read it. Breaking down each tool’s responsibility helped resolve that confusion. After that, I tested the server using my own prompts and went through the code line by line to verify the output and make sure nothing was off.

## 4. How MCP works:
MCP works by letting an AI connect to external tools in a structured way instead of just relying on its own memory. The server brings in tools that the AI can call, such as demonstrated here with adding a task or marking one as complete. It also provides a resource that shows the current state of this task list. This makes interactions more reliable because the AI can read real data, update it, and stay in sync across sessions, which would typically clear after the conversation ends. MCP ultimately turns the AI into something that can safely interact with a real system instead of simply giving suggestions.

## 5. What I'd do differently
I would spend more time at the beginning clearly defining how each tool should behave submitting my the descriptions into Claude. Some of the confusion came from making sure the tools matched their intended purpose, especially around what it means to complete a task versus just reading it. I also would have organized the file structure better since many of my files went into the unintended directory, and I had to move them around on my own or undo changes that Claude made to restructure the misplaced files.

