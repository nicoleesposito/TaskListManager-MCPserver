Create a simple MCP server for Claude Code using Node.js.

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