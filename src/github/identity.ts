import { warning } from '@actions/core';
import { inputs } from './input';

export const WORKFLOW_TOKEN_ACTOR = 'github-actions[bot]';

const isWorkflowToken = (): boolean => {
  const workflowToken = process.env.GITHUB_TOKEN;
  return Boolean(workflowToken && workflowToken === inputs.githubToken);
};

export const resolveTokenActor = async (): Promise<string> => {
  if (inputs.githubTokenActor) return inputs.githubTokenActor;
  if (!isWorkflowToken()) {
    warning(
      'github_token_actor is not set for a non-workflow GitHub token; defaulting to github-actions[bot].',
    );
  }
  return WORKFLOW_TOKEN_ACTOR;
};
