# Bounteous Atlassian MCP Server

An MCP server implementation for Atlassian (Jira and Confluence) integration, written in TypeScript.

## Features

- Create and search Jira issues
- Create and search Confluence pages
- Full TypeScript support with Zod schema validation
- Environment-based configuration

## Prerequisites

- Node.js 16 or higher
- Atlassian account with API access
- Jira and Confluence cloud instances

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ravi-accolite/bounteous-atlassian.git
cd bounteous-atlassian
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Atlassian credentials:
```env
JIRA_HOST=your-domain.atlassian.net
CONFLUENCE_HOST=your-domain.atlassian.net
ATLASSIAN_USERNAME=your-email@example.com
ATLASSIAN_API_TOKEN=your-api-token
```

4. Build the project:
```bash
npm run build
```

## Usage

Start the server:
```bash
npm start
```

### Available Tools

#### Jira Tools

1. `create-jira-issue`
   - Creates a new Jira issue
   - Required parameters:
     - projectKey: string
     - summary: string
     - issueType: string
   - Optional parameters:
     - description: string
     - priority: string
     - assignee: string
     - labels: string[]

2. `search-jira-issues`
   - Searches Jira issues using JQL
   - Required parameters:
     - jql: string
   - Optional parameters:
     - maxResults: number
     - fields: string[]

#### Confluence Tools

1. `create-confluence-page`
   - Creates a new Confluence page
   - Required parameters:
     - spaceKey: string
     - title: string
     - content: string
   - Optional parameters:
     - parentId: string
     - labels: string[]

2. `search-confluence`
   - Searches Confluence content using CQL
   - Required parameters:
     - cql: string
   - Optional parameters:
     - limit: number
     - start: number

## Development

Run in development mode with hot reloading:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request