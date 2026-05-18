<template>
  <div class="gem-info visible">
    <h2>
      {{ gem.name }}
      <span class="badge badge-ratio">{{ gem.ratio === 3 ? '3合1' : '2合1' }}</span>
      <span class="badge badge-max">最高{{ gem.maxLevel }}级</span>
    </h2>
    <div class="gem-meta">
      <span>📝 {{ gem.desc }}</span>
      <span>🔧 合成比例：{{ gem.ratio }}合1</span>
      <span>📊 最高等级：{{ gem.maxLevel }}级</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ gem: { type: Object, required: true } })
</script>

<style scoped>
.gem-info {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
.gem-info h2 {
  font-size: 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.badge-ratio { background: #ebf5ff; color: #4472c4; }
.badge-max { background: #fffbef; color: #d97706; }
.gem-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #6b7280;
  flex-wrap: wrap;
}
</style>
