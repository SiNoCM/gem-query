<template>
  <button class="gem-tag" :class="{ active: selected }" @click="$emit('select')">
    {{ gem.name }}
    <span class="ratio">{{ gem.ratio === 3 ? '3合1' : '2合1' }}</span>
  </button>
</template>

<script setup>
defineProps({
  gem: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>

<style scoped>
.gem-tag {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  transition: all 0.2s;
  user-select: none;
  font-family: inherit;
}
.gem-tag:hover { border-color: #4472c4; color: #4472c4; }
.gem-tag.active { background: #4472c4; color: white; border-color: #4472c4; }
.ratio { font-size: 11px; opacity: 0.7; margin-left: 4px; }
</style>
