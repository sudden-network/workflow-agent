let githubTokenMock = 'workflow-token';
let githubTokenActorMock: string | undefined;
const warningMock = jest.fn();

jest.mock('@actions/core', () => ({
  warning: warningMock,
}));

jest.mock('./input', () => ({
  inputs: {
    get githubToken() {
      return githubTokenMock;
    },
    get githubTokenActor() {
      return githubTokenActorMock;
    },
  },
}));

import { resolveTokenActor, WORKFLOW_TOKEN_ACTOR } from './identity';

describe('resolveTokenActor', () => {
  const originalToken = process.env.GITHUB_TOKEN;

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken;
    githubTokenMock = 'workflow-token';
    githubTokenActorMock = undefined;
    warningMock.mockReset();
  });

  it('returns the workflow token actor when using GITHUB_TOKEN', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';

    await expect(resolveTokenActor()).resolves.toBe(WORKFLOW_TOKEN_ACTOR);
    expect(warningMock).not.toHaveBeenCalled();
  });

  it('returns the provided token actor when supplied', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';
    githubTokenActorMock = 'sudden-agent[bot]';

    await expect(resolveTokenActor()).resolves.toBe('sudden-agent[bot]');
    expect(warningMock).not.toHaveBeenCalled();
  });

  it('defaults to workflow actor and warns for non-workflow tokens', async () => {
    process.env.GITHUB_TOKEN = 'workflow-token';
    githubTokenMock = 'other-token';

    await expect(resolveTokenActor()).resolves.toBe(WORKFLOW_TOKEN_ACTOR);
    expect(warningMock).toHaveBeenCalledWith(
      'github_token_actor is not set for a non-workflow GitHub token; defaulting to github-actions[bot].',
    );
  });
});
