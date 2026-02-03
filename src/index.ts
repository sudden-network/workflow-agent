import { setFailed } from '@actions/core';
import { bootstrap, runCodex, teardown } from './codex';
import { postComment } from './comment';
import { readInputs } from './input';

const main = async (): Promise<void> => {
  try {
    const { cliVersion, apiKey, githubToken } = readInputs();
    await bootstrap({ version: cliVersion, apiKey, githubToken });
    await runCodex('say hello');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await postComment(`
action-agent failed:
\`\`\`
${message}
\`\`\`
    `);

    setFailed(`action-agent failed: ${message}`);
  } finally {
    await teardown();
  }
};

void main();
