import { DefaultArtifactClient } from '@actions/artifact';
import { context, getOctokit } from '@actions/github';
import fs from 'fs';
import path from 'path';
import { getIssueNumber, getSubjectType } from "./context";

type RepoArtifact = {
  id: number;
  name: string;
  expired: boolean;
  created_at?: string;
  workflow_run?: { id?: number };
};

const ARTIFACT_PREFIX = 'action-agent';

const getArtifactName = (): string => {
  return `${ARTIFACT_PREFIX}-${getSubjectType()}-${getIssueNumber()}`;
};

const listArtifactsByName = async (githubToken: string, name: string): Promise<RepoArtifact[]> => {
  const { owner, repo } = context.repo;
  const octokit = getOctokit(githubToken);
  const artifacts = await octokit.paginate(octokit.rest.actions.listArtifactsForRepo, {
    owner,
    repo,
    per_page: 100,
    name,
  });
  return artifacts as RepoArtifact[];
};

const getLatestArtifact = async (githubToken: string, name: string): Promise<RepoArtifact | null> => {
  const artifacts = await listArtifactsByName(githubToken, name);
  const candidates = artifacts.filter((artifact) => !artifact.expired);
  return candidates.reduce<RepoArtifact | null>((latest, artifact) => {
    if (!latest) {
      return artifact;
    }
    const latestTime = latest.created_at ? Date.parse(latest.created_at) : 0;
    const artifactTime = artifact.created_at ? Date.parse(artifact.created_at) : 0;
    return artifactTime > latestTime ? artifact : latest;
  }, null);
};

export const downloadLatestArtifact = async (
  githubToken: string,
  downloadPath: string,
): Promise<RepoArtifact | null> => {
  const { owner, repo } = context.repo;
  const latest = await getLatestArtifact(githubToken, getArtifactName());
  if (!latest) {
    return null;
  }
  const workflowRunId = latest.workflow_run?.id;
  if (!workflowRunId) {
    throw new Error('Latest artifact missing workflow run id.');
  }
  await new DefaultArtifactClient().downloadArtifact(latest.id, {
    path: downloadPath,
    findBy: {
      token: githubToken,
      repositoryOwner: owner,
      repositoryName: repo,
      workflowRunId,
    },
  });
  return latest;
};

const collectFiles = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath);
    }
    if (entry.isFile()) {
      return [fullPath];
    }
    return [];
  });
};

export const uploadArtifact = async (rootDirectory: string): Promise<void> => {
  const files = collectFiles(rootDirectory);
  if (!files.length) {
    return;
  }
  await new DefaultArtifactClient().uploadArtifact(getArtifactName(), files, rootDirectory);
};
