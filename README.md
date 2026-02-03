# action-agent

GitHub Action (Node) that runs Codex CLI from issues and issue comments.

## What this does

- Runs Codex on GitHub-hosted runners.
- Optionally resumes Codex session state per issue via [Workflow Artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts).
- Posts responses back to the issue.
- Can create branches/commits and open PRs when instructed.
- Optional GitHub MCP integration for repo/issue/PR access from Codex.

## Resume

Resume uses [Workflow Artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts).

- Resume is only enabled on private repos to avoid exposing artifacts.
- Artifacts are retained for 7 days, so conversations expire after that retention window.

## Agent behavior

- The agent identifies as `action-agent` running inside a GitHub Actions runner.
- `AGENTS.md` (if present in the repo root) is loaded automatically and will influence agent behavior.

## MCP (GitHub MCP server)

The action configures the GitHub MCP server automatically and passes the same `github_token` you provide to the action.

- MCP permissions are inherited from the workflow `permissions` block.
- If MCP tools fail with “Resource not accessible by integration,” add the missing permission to the workflow.

## Permissions

- `contents: write` — push branches/commits back to the repo.
- `issues: write` — post error comments and use MCP to read/write issues.
- `pull-requests: write` — create or comment on PRs.
- `actions: read` — list/download artifacts for resume (only when resume is enabled).

## Requirements

1) OpenAI API key
- Add `OPENAI_API_KEY` as a secret in the target repo or org.

2) Repo settings (required for PR creation)
- Settings → Actions → Workflow permissions → enable **“Allow GitHub Actions to create and approve pull requests.”**

## Quick start (caller workflow)

Create a workflow in the target repo, e.g. `.github/workflows/action-agent-issue.yml`:

```yaml
name: action-agent

on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created, edited]

permissions:
  contents: write
  issues: write
  pull-requests: write
  actions: read # only if resume is enabled

jobs:
  action-agent:
    runs-on: ubuntu-latest
    steps:
      - name: Run action-agent
        uses: sudden-network/action-agent@main
        with:
          api_key: ${{ secrets.OPENAI_API_KEY }}
          github_token: ${{ github.token }}
          # Optional:
          # model: gpt-5.1-codex-mini
          # reasoning_effort: low
          # resume: true
```

## Notes

- The action runs on an ephemeral runner. It tells Codex to commit and push any repo changes so work persists between runs.
