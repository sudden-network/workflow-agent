import { getAgent } from './index';

const originalAgentInput = process.env.INPUT_AGENT;

const setAgentInput = (value: string | undefined) => {
  if (value === undefined) {
    delete process.env.INPUT_AGENT;
    return;
  }
  process.env.INPUT_AGENT = value;
};

describe('getAgent', () => {
  afterEach(() => {
    setAgentInput(originalAgentInput);
  });

  it('defaults to codex for empty value', () => {
    setAgentInput(undefined);
    return expect(getAgent()).resolves.toMatchObject({
      bootstrap: expect.any(Function),
      run: expect.any(Function),
      teardown: expect.any(Function),
    });
  });

  it('selects codex case-insensitively', async () => {
    setAgentInput('Codex');
    const agent = await getAgent();
    const codex = await import('./codex');
    expect(agent).toBe(codex);
  });

  it('rejects unknown agents', async () => {
    setAgentInput('unknown');
    await expect(getAgent()).rejects.toThrow('Unsupported agent "unknown".');
  });
});
