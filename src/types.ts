import { z } from 'zod';

// Jira types
export const JiraIssueSchema = z.object({
  projectKey: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  issueType: z.string(),
  priority: z.string().optional(),
  assignee: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export type JiraIssue = z.infer<typeof JiraIssueSchema>;

export const JiraSearchSchema = z.object({
  jql: z.string(),
  maxResults: z.number().optional(),
  fields: z.array(z.string()).optional(),
});

export type JiraSearch = z.infer<typeof JiraSearchSchema>;

// Confluence types
export const ConfluencePageSchema = z.object({
  spaceKey: z.string(),
  title: z.string(),
  content: z.string(),
  parentId: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export type ConfluencePage = z.infer<typeof ConfluencePageSchema>;

export const ConfluenceSearchSchema = z.object({
  cql: z.string(),
  limit: z.number().optional(),
  start: z.number().optional(),
});

export type ConfluenceSearch = z.infer<typeof ConfluenceSearchSchema>;

// Configuration types
export interface AtlassianConfig {
  jiraHost: string;
  confluenceHost: string;
  username: string;
  apiToken: string;
}