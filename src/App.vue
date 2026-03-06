<template>
  <NavBar v-if="showNav" />
  <router-view />
  <Teleport to="body">
    <div v-if="lightboxSrc" class="lightbox-overlay" @click="lightboxSrc = ''">
      <img :src="lightboxSrc" alt="">
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const showNav = computed(() => route.name !== 'home')

const lightboxSrc = ref('')
const openLightbox = (src) => { lightboxSrc.value = src }
provide('openLightbox', openLightbox)
</script>
