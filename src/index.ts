import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import JiraClient from 'jira-client';
import dotenv from 'dotenv';
import {
  JiraIssueSchema,
  JiraSearchSchema,
  ConfluencePageSchema,
  ConfluenceSearchSchema,
  AtlassianConfig,
} from './types.js';

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['JIRA_HOST', 'CONFLUENCE_HOST', 'ATLASSIAN_USERNAME', 'ATLASSIAN_API_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: AtlassianConfig = {
  jiraHost: process.env.JIRA_HOST!,
  confluenceHost: process.env.CONFLUENCE_HOST!,
  username: process.env.ATLASSIAN_USERNAME!,
  apiToken: process.env.ATLASSIAN_API_TOKEN!,
};

// Initialize Jira client
const jira = new JiraClient({
  protocol: 'https',
  host: config.jiraHost,
  username: config.username,
  password: config.apiToken,
  apiVersion: '2',
  strictSSL: true,
});

// Create MCP server instance
const server = new Server({
  name: 'mcp-atlassian',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Define Jira tools
server.addTool({
  name: 'create-jira-issue',
  description: 'Create a new Jira issue',
  inputSchema: JiraIssueSchema,
  handler: async (params) => {
    try {
      const issue = await jira.addNewIssue({
        fields: {
          project: { key: params.projectKey },
          summary: params.summary,
          description: params.description,
          issuetype: { name: params.issueType },
          priority: params.priority ? { name: params.priority } : undefined,
          assignee: params.assignee ? { name: params.assignee } : undefined,
          labels: params.labels,
        },
      });
      return { success: true, issue };
    } catch (error) {
      console.error('Error creating Jira issue:', error);
      return { success: false, error: String(error) };
    }
  },
});

server.addTool({
  name: 'search-jira-issues',
  description: 'Search Jira issues using JQL',
  inputSchema: JiraSearchSchema,
  handler: async (params) => {
    try {
      const issues = await jira.searchJira(params.jql, {
        maxResults: params.maxResults || 50,
        fields: params.fields || ['summary', 'description', 'status'],
      });
      return { success: true, issues };
    } catch (error) {
      console.error('Error searching Jira issues:', error);
      return { success: false, error: String(error) };
    }
  },
});

// Define Confluence tools
server.addTool({
  name: 'create-confluence-page',
  description: 'Create a new Confluence page',
  inputSchema: ConfluencePageSchema,
  handler: async (params) => {
    try {
      const response = await fetch(`${config.confluenceHost}/wiki/rest/api/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page',
          title: params.title,
          space: { key: params.spaceKey },
          body: {
            storage: {
              value: params.content,
              representation: 'storage',
            },
          },
          ancestors: params.parentId ? [{ id: params.parentId }] : undefined,
          metadata: {
            labels: params.labels?.map(label => ({ name: label })),
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const page = await response.json();
      return { success: true, page };
    } catch (error) {
      console.error('Error creating Confluence page:', error);
      return { success: false, error: String(error) };
    }
  },
});

server.addTool({
  name: 'search-confluence',
  description: 'Search Confluence content using CQL',
  inputSchema: ConfluenceSearchSchema,
  handler: async (params) => {
    try {
      const response = await fetch(
        `${config.confluenceHost}/wiki/rest/api/content/search?cql=${encodeURIComponent(params.cql)}` +
        `&limit=${params.limit || 25}&start=${params.start || 0}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();
      return { success: true, results };
    } catch (error) {
      console.error('Error searching Confluence:', error);
      return { success: false, error: String(error) };
    }
  },
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});