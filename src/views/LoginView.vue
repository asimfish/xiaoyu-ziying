<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <h1 class="font-serif text-3xl text-ink text-center mb-2 tracking-wider">小鱼与梓樱</h1>
      <p class="text-center text-light-ink text-sm mb-8">纪念册</p>

      <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-light-ink mb-1">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="小鱼 / 梓樱"
              class="w-full px-4 py-2.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors"
              @keyup.enter="login"
            >
          </div>
          <div>
            <label class="block text-sm text-light-ink mb-1">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-2.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors"
              @keyup.enter="login"
            >
          </div>
          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
          <button
            @click="login"
            class="w-full py-2.5 rounded-full text-sm bg-deep-rose text-white hover:bg-rose transition-colors"
          >
            进入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { startSession } from '@/composables/use_tracker'
import { startHeartbeat } from '@/composables/use_online'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const VALID_USERS = ['小鱼', '梓樱']
const VALID_PASSWORD = '05090312160816'

const login = () => {
  error.value = ''
  if (!VALID_USERS.includes(username.value.trim())) {
    error.value = '用户名不正确'
    return
  }
  if (password.value !== VALID_PASSWORD) {
    error.value = '密码不正确'
    return
  }
  sessionStorage.setItem('memorial-auth', username.value.trim())
  startSession(username.value.trim())
  startHeartbeat(username.value.trim())
  router.replace('/')
}
</script>
