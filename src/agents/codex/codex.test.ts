import { buildConfig, parseModelInput, resolveAuthStrategy } from './codex';

describe('agent codex', () => {
  describe('buildConfig', () => {
    it('renders multiple MCP servers', () => {
      const config = buildConfig([
        { name: 'github', url: 'http://localhost:1234/mcp' },
        { name: 'jira', url: 'https://jira.example.com/mcp' },
      ]);

      expect(config).toBe(
        [
          '[mcp_servers.github]',
          'url = "http://localhost:1234/mcp"',
          '',
          '[mcp_servers.jira]',
          'url = "https://jira.example.com/mcp"',
        ].join('\n'),
      );
    });
  });

  describe('parseModelInput', () => {
    it('returns empty config for undefined', () => {
      expect(parseModelInput(undefined)).toEqual({});
    });

    it('parses model only', () => {
      expect(parseModelInput('gpt-5.3-codex')).toEqual({ model: 'gpt-5.3-codex', reasoningEffort: undefined });
    });

    it('parses model and reasoning effort', () => {
      expect(parseModelInput('gpt-5.3-codex/xhigh')).toEqual({
        model: 'gpt-5.3-codex',
        reasoningEffort: 'xhigh',
      });
    });

    it('trims whitespace', () => {
      expect(parseModelInput(' gpt-5.3-codex / high ')).toEqual({
        model: 'gpt-5.3-codex',
        reasoningEffort: 'high',
      });
    });

    it('handles empty model or effort', () => {
      expect(parseModelInput('/high')).toEqual({ model: undefined, reasoningEffort: 'high' });
      expect(parseModelInput('gpt-5.3-codex/')).toEqual({ model: 'gpt-5.3-codex', reasoningEffort: undefined });
    });
  });

  describe('resolveAuthStrategy', () => {
    afterEach(() => {
      delete process.env.INPUT_AGENT_API_KEY;
      delete process.env.INPUT_AGENT_AUTH_FILE;
    });

    it('uses api key when provided', () => {
      process.env.INPUT_AGENT_API_KEY = ' sk-123 ';

      expect(resolveAuthStrategy()).toEqual({
        kind: 'api_key',
        apiKey: 'sk-123',
      });
    });

    it('uses auth file when provided', () => {
      process.env.INPUT_AGENT_AUTH_FILE = ' { "ok": true } ';

      expect(resolveAuthStrategy()).toEqual({
        kind: 'auth_file',
        authFile: '{ "ok": true }',
      });
    });

    it('throws when both are set', () => {
      process.env.INPUT_AGENT_API_KEY = 'sk-123';
      process.env.INPUT_AGENT_AUTH_FILE = '{ "ok": true }';

      expect(() => resolveAuthStrategy()).toThrow(
        'Set only one: `agent_api_key` or `agent_auth_file`.',
      );
    });

    it('throws when missing both', () => {
      expect(() => resolveAuthStrategy()).toThrow(
        'Missing auth: set `agent_api_key` or `agent_auth_file`.',
      );
    });
  });
})
