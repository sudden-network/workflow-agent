import fs from 'fs';
import os from 'os';
import path from 'path';
import { downloadLatestArtifact, uploadArtifact } from './artifacts';
import { runCommand } from './exec';

const CODEX_VERSION = '0.93.0';
const CODEX_DIR = path.join(os.homedir(), '.codex');

const ensureDir = (dir: string): void => {
  fs.mkdirSync(dir, { recursive: true });
};

const restoreCodex = async (githubToken: string): Promise<void> => {
  ensureDir(CODEX_DIR);
  await downloadLatestArtifact(githubToken, CODEX_DIR);
};

const install = async (version = CODEX_VERSION): Promise<void> => {
  await runCommand('npm', ['install', '-g', `@openai/codex@${version}`]);
};

const login = async (apiKey: string): Promise<void> => {
  await runCommand('bash', ['-lc', 'printenv OPENAI_API_KEY | codex login --with-api-key'], {
    env: { OPENAI_API_KEY: apiKey },
  });
};

export const bootstrap = async ({
  version,
  apiKey,
  githubToken,
}: {
  version?: string;
  apiKey: string;
  githubToken: string;
}) => {
  await restoreCodex(githubToken);
  await install(version);
  await login(apiKey);
};

export const runCodex = async (prompt: string): Promise<void> => {
  await runCommand('codex', ['exec', prompt]);
};

export const teardown = async (): Promise<void> => {
  await uploadArtifact(CODEX_DIR);
};
