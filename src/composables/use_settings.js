// API keys 管理 - 环境变量优先，localStorage 作为 fallback

import { ref, watchEffect } from 'vue'

const KEYS = {
  minimax: 'memorial-minimax-key',
  github_token: 'memorial-github-token',
  github_owner: 'memorial-github-owner',
  github_repo: 'memorial-github-repo'
}

const envMinimaxKey = import.meta.env.VITE_MINIMAX_API_KEY

const load = (key) => localStorage.getItem(key) || ''

export const useSettings = () => {
  const minimaxKey = ref(envMinimaxKey || load(KEYS.minimax))
  const githubToken = ref(load(KEYS.github_token))
  const githubOwner = ref(load(KEYS.github_owner))
  const githubRepo = ref(load(KEYS.github_repo))

  watchEffect(() => localStorage.setItem(KEYS.minimax, minimaxKey.value))
  watchEffect(() => localStorage.setItem(KEYS.github_token, githubToken.value))
  watchEffect(() => localStorage.setItem(KEYS.github_owner, githubOwner.value))
  watchEffect(() => localStorage.setItem(KEYS.github_repo, githubRepo.value))

  const hasChatKey = () => !!minimaxKey.value
  const hasEnvChatKey = () => !!envMinimaxKey
  const hasGithubConfig = () => !!githubToken.value && !!githubOwner.value && !!githubRepo.value

  return { minimaxKey, githubToken, githubOwner, githubRepo, hasChatKey, hasEnvChatKey, hasGithubConfig }
}
