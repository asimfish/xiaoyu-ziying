<template>
  <NavBar v-if="showNav" />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <Teleport to="body">
    <div v-if="lightboxSrc" class="lightbox-overlay" @click="lightboxSrc = ''">
      <img :src="lightboxSrc" alt="">
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, provide, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

import { trackPage } from '@/composables/use_tracker'
import { startHeartbeat, updatePage } from '@/composables/use_online'
import { getUser } from '@/router'

const route = useRoute()
const showNav = computed(() => route.name !== 'home' && route.name !== 'login')

// 如果已登录，恢复心跳
const user = getUser()
if (user) startHeartbeat(user)

watch(() => route.path, (path) => {
  trackPage(path)
  updatePage(path)
})

const lightboxSrc = ref('')
const openLightbox = (src) => { lightboxSrc.value = src }
const closeLightbox = () => { lightboxSrc.value = '' }
provide('openLightbox', openLightbox)

// ESC 关闭 lightbox
const onKeydown = (e) => { if (e.key === 'Escape') closeLightbox() }
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
