<template>
  <div>
    <!-- opening photo (only for love part) -->
    <div v-if="part === 'love'" class="max-w-[800px] mx-auto px-8 py-12">
      <div class="mx-auto max-w-[360px] text-center max-sm:max-w-[300px]">
        <img :src="openingPhoto" alt="" class="w-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] object-cover">
      </div>
    </div>

    <!-- part divider -->
    <PartDivider v-bind="partData" />

    <!-- chapters -->
    <template v-for="(chapter, ci) in chapters" :key="ci">
      <ChapterHeader :number="chapter.number" :title="chapter.title" :period="chapter.period" />
      <div class="max-w-[800px] mx-auto px-8 max-sm:px-5">
        <template v-for="(block, bi) in chapter.blocks" :key="bi">
          <DateMarker v-if="block.type === 'date'" :text="block.text" />
          <NarrativeBlock v-else-if="block.type === 'narrative'" :emoji="block.emoji">{{ block.text }}</NarrativeBlock>
          <QuoteBlock v-else-if="block.type === 'quote'" :text="block.text" :from="block.from" />
          <PhotoGrid v-else-if="block.type === 'photo-grid'" :images="block.images" :cols="block.cols" :caption="block.caption" />
          <PhotoWall v-else-if="block.type === 'photo-wall'" :images="block.images" :caption="block.caption" />
          <PhotoSingle v-else-if="block.type === 'photo-single'" :src="block.src" :caption="block.caption" />
          <PhotoTogether v-else-if="block.type === 'photo-together'" :src="block.src" :caption="block.caption" />
          <VideoPlayer v-else-if="block.type === 'video'" :src="block.src" :caption="block.caption" />
        </template>
      </div>
    </template>

    <!-- ending (only for friend part) -->
    <div v-if="part === 'friend'" class="min-h-[80vh] flex flex-col justify-center items-center px-8 py-16 bg-gradient-to-b from-cream to-warm text-center">
      <p class="font-serif text-2xl text-ink max-w-[600px] leading-[2.2] tracking-wide whitespace-pre-line max-sm:text-lg">{{ ending.quote }}</p>
      <div class="w-[60px] h-px bg-gold mx-auto my-12"></div>
      <p class="text-sm text-light-ink tracking-[0.2em]">{{ ending.note }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PartDivider from '@/components/PartDivider.vue'
import ChapterHeader from '@/components/ChapterHeader.vue'
import DateMarker from '@/components/DateMarker.vue'
import NarrativeBlock from '@/components/NarrativeBlock.vue'
import QuoteBlock from '@/components/QuoteBlock.vue'
import PhotoGrid from '@/components/PhotoGrid.vue'
import PhotoWall from '@/components/PhotoWall.vue'
import PhotoSingle from '@/components/PhotoSingle.vue'
import PhotoTogether from '@/components/PhotoTogether.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'

import { lovePart, friendPart, loveChapters, friendChapters, openingPhoto, ending } from '@/data/chapters'

const route = useRoute()
const part = computed(() => route.params.part)
const partData = computed(() => part.value === 'love' ? lovePart : friendPart)
const chapters = computed(() => part.value === 'love' ? loveChapters : friendChapters)
</script>
