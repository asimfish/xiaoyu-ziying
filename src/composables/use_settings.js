// API keys 管理 - 环境变量优先，localStorage 作为 fallback

import { ref, watchEffect } from 'vue'

const KEYS = {
  claude: 'memorial-claude-key',
  github_token: 'memorial-github-token',
  github_owner: 'memorial-github-owner',
  github_repo: 'memorial-github-repo'
}

const envClaudeKey = import.meta.env.VITE_CLAUDE_API_KEY

const load = (key) => localStorage.getItem(key) || ''

export const useSettings = () => {
  const claudeKey = ref(envClaudeKey || load(KEYS.claude))
  const githubToken = ref(load(KEYS.github_token))
  const githubOwner = ref(load(KEYS.github_owner))
  const githubRepo = ref(load(KEYS.github_repo))

  watchEffect(() => localStorage.setItem(KEYS.claude, claudeKey.value))
  watchEffect(() => localStorage.setItem(KEYS.github_token, githubToken.value))
  watchEffect(() => localStorage.setItem(KEYS.github_owner, githubOwner.value))
  watchEffect(() => localStorage.setItem(KEYS.github_repo, githubRepo.value))

  const hasClaudeKey = () => !!claudeKey.value
  const hasEnvClaudeKey = () => !!envClaudeKey
  const hasGithubConfig = () => !!githubToken.value && !!githubOwner.value && !!githubRepo.value

  return { claudeKey, githubToken, githubOwner, githubRepo, hasClaudeKey, hasEnvClaudeKey, hasGithubConfig }
}
