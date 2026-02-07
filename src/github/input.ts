import { getInput } from '@actions/core';

export const inputs = {
  get agentApiKey(): string | undefined {
    return getInput('agent_api_key') || undefined;
  },
  get agentAuthFile(): string | undefined {
    return getInput('agent_auth_file') || undefined;
  },
  get githubToken(): string {
    return getInput('github_token', { required: true });
  },
  get agent(): string {
    return getInput('agent') || 'codex';
  },
  get model(): string | undefined {
    return getInput('model') || undefined;
  },
  get prompt(): string | undefined {
    return getInput('prompt') || undefined;
  },
  get resume(): boolean {
    return getInput('resume').toLowerCase() === 'true';
  },
};
