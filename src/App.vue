<template>
  <div id="app">
    <!-- Header: iOS 26 large title + glassmorphism nav -->
    <header class="header">
      <div class="header-inner">
        <div class="header-icon">💎</div>
        <div class="header-text">
          <h1>宝石合成查询</h1>
          <p class="header-sub">梦幻西游 · 合成计算器</p>
        </div>
      </div>
    </header>

    <main class="container">
      <!-- Query Panel: iOS grouped card -->
      <section class="card query-panel">
        <div class="card-header">
          <span class="card-header-icon">🔍</span>
          <span class="card-header-title">合成查询</span>
        </div>
        <div class="query-row">
          <div class="field">
            <label class="field-label">宝石类型</label>
            <div class="ios-select-wrap">
              <select v-model="selectedId" class="ios-select">
                <option :value="null">请选择宝石</option>
                <option v-for="gem in gemTypes" :key="gem.id" :value="gem.id">
                  {{ gem.name }}（{{ gem.ratio === 3 ? '3合1' : '2合1' }}）
                </option>
              </select>
              <span class="select-arrow">›</span>
            </div>
          </div>
          <div class="field">
            <label class="field-label">目标等级</label>
            <div class="ios-input-wrap">
              <input
                type="number"
                v-model.number="inputLevel"
                class="ios-input"
                :min="1"
                :max="currentGem ? currentGem.maxLevel : 20"
                :placeholder="currentGem ? `1 ~ ${currentGem.maxLevel}` : '—'"
                :disabled="!currentGem"
                @keyup.enter="doQuery"
              />
              <span class="input-suffix">级</span>
            </div>
          </div>
        </div>
        <button class="ios-btn" :class="{ active: canQuery }" :disabled="!canQuery" @click="doQuery">
          查询合成方案
        </button>
      </section>

      <!-- Result Card -->
      <transition name="fade-up">
        <section v-if="result" class="card result-card">
          <!-- Result Header -->
          <div class="result-header">
            <div class="result-gem-info">
              <div class="result-gem-icon-wrap">
                <img :src="result.gem.icon" class="result-gem-icon" />
              </div>
              <div class="result-gem-text">
                <h2 class="result-title">{{ result.gem.name }}</h2>
                <span class="result-subtitle">{{ result.rule.targetLevel }}级 · {{ result.gem.ratio === 3 ? '3合1' : '2合1' }}</span>
              </div>
            </div>
            <div class="result-badge">
              <span class="badge-level">Lv.{{ result.rule.targetLevel }}</span>
            </div>
          </div>

          <!-- Gems Needed -->
          <div class="result-section">
            <div class="section-label">
              <span class="section-dot blue"></span>
              需要准备的宝石
            </div>
            <div class="chip-grid">
              <div
                v-for="step in result.bom.steps"
                :key="'g' + step.level"
                class="chip"
                :class="{
                  'chip-target': step.level === result.rule.targetLevel,
                  'chip-l1': step.level === 1,
                }"
              >
                <span class="chip-lv">{{ step.level }}级</span>
                <span class="chip-val">{{ formatNum(step.need) }}</span>
                <span class="chip-unit">颗</span>
              </div>
            </div>
          </div>

          <!-- Extra Gems -->
          <div class="result-section" v-if="extraEntries.length > 0">
            <div class="section-label">
              <span class="section-dot orange"></span>
              需要额外提交的宝石
            </div>
            <div class="extra-list">
              <div v-for="entry in extraEntries" :key="'e' + entry.level" class="extra-item">
                <div class="extra-item-left">
                  <img :src="result.gem.icon" class="extra-icon" />
                  <span class="extra-lv">{{ entry.level }}级</span>
                </div>
                <span class="extra-val">{{ formatNum(entry.total) }} 颗</span>
              </div>
            </div>
          </div>

          <!-- No Extra -->
          <div class="result-section" v-else>
            <div class="no-extra">
              <span class="no-extra-icon">✓</span>
              无需额外提交宝石
            </div>
          </div>
        </section>
      </transition>

      <!-- Empty State -->
      <transition name="fade-up">
        <div v-if="queryDone && !result" class="empty-state">
          <div class="empty-icon">💎</div>
          <p class="empty-text">请选择宝石类型并输入目标等级</p>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gemTypes, calcBOM } from './data/gemData.js'

const selectedId = ref(null)
const inputLevel = ref(null)
const queryDone = ref(false)

const currentGem = computed(() => {
  if (selectedId.value === null) return null
  return gemTypes.find(g => g.id === selectedId.value) || null
})

const canQuery = computed(() => {
  if (!currentGem.value) return false
  const lv = inputLevel.value
  if (!lv || lv < 1 || lv > currentGem.value.maxLevel) return false
  return true
})

const result = computed(() => {
  if (!currentGem.value || !inputLevel.value) return null
  const gem = currentGem.value
  const lv = inputLevel.value
  if (lv < 1 || lv > gem.maxLevel) return null

  const rule = gem.rules.find(r => r.targetLevel === lv)
  if (!rule) return null

  const bom = calcBOM(gem, lv)

  const extraMap = {}
  for (const step of bom.steps) {
    if (step.level === 1) continue
    for (const em of step.extras) {
      if (!extraMap[em.level]) extraMap[em.level] = 0
      extraMap[em.level] += em.total
    }
  }
  const extraEntries = Object.entries(extraMap)
    .map(([level, total]) => ({ level: Number(level), total }))
    .sort((a, b) => a.level - b.level)

  return { gem, rule, bom, extraEntries }
})

const extraEntries = computed(() => result.value?.extraEntries || [])

function doQuery() { queryDone.value = true }

function formatNum(n) { return n.toLocaleString('zh-CN') }
</script>

<style scoped>
/* =====================
   Header
   ===================== */
.header {
  background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%);
  padding: 20px 20px 24px;
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  flex-shrink: 0;
}
.header-text h1 {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.header-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  margin-top: 2px;
  letter-spacing: 0.2px;
}

/* =====================
   Container
   ===================== */
.container {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px 16px 40px;
}

/* =====================
   iOS Card
   ===================== */
.card {
  background: var(--ios-bg-elevated);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 0.5px 0 0.5px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 12px;
}
.card-header-icon {
  font-size: 15px;
}
.card-header-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ios-label-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* =====================
   Query Panel
   ===================== */
.query-panel {
  padding-bottom: 16px;
}
.query-row {
  display: flex;
  gap: 12px;
  padding: 0 20px;
}
.field {
  flex: 1;
  min-width: 0;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--ios-label-secondary);
  margin-bottom: 6px;
  padding-left: 2px;
}

/* iOS Select */
.ios-select-wrap {
  position: relative;
}
.ios-select {
  width: 100%;
  padding: 10px 32px 10px 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--ios-fill-tertiary);
  color: var(--ios-label);
  font-size: 15px;
  font-weight: 400;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: background 0.2s;
}
.ios-select:focus {
  background: var(--ios-fill-secondary);
}
.ios-select:disabled {
  color: var(--ios-label-tertiary);
  background: var(--ios-fill-tertiary);
  opacity: 0.6;
}
.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--ios-label-tertiary);
  pointer-events: none;
}

/* iOS Input */
.ios-input-wrap {
  display: flex;
  align-items: center;
  background: var(--ios-fill-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: background 0.2s;
}
.ios-input-wrap:focus-within {
  background: var(--ios-fill-secondary);
}
.ios-input {
  flex: 1;
  min-width: 0;
  padding: 10px 0 10px 14px;
  border: none;
  background: transparent;
  color: var(--ios-label);
  font-size: 15px;
  font-weight: 400;
  outline: none;
}
.ios-input::placeholder {
  color: var(--ios-label-tertiary);
}
.ios-input:disabled {
  color: var(--ios-label-tertiary);
  opacity: 0.6;
}
.input-suffix {
  padding: 0 14px;
  font-size: 14px;
  color: var(--ios-label-secondary);
  font-weight: 500;
  flex-shrink: 0;
  line-height: 1;
}

/* iOS Button */
.ios-btn {
  display: block;
  width: calc(100% - 40px);
  margin: 14px 20px 0;
  padding: 13px 20px;
  border: none;
  border-radius: 12px;
  background: var(--ios-fill);
  color: var(--ios-label-secondary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.2px;
}
.ios-btn.active {
  background: var(--ios-blue);
  color: #ffffff;
}
.ios-btn.active:hover {
  background: #0066d6;
}
.ios-btn.active:active {
  transform: scale(0.98);
  background: #0055b3;
}
.ios-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* =====================
   Result Card
   ===================== */
.result-card {
  padding: 0;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 0.5px solid var(--ios-fill-secondary);
}
.result-gem-info {
  display: flex;
  align-items: center;
  gap: 14px;
}
.result-gem-icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--ios-fill-tertiary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
  margin-top: -1px;
}
.result-gem-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.result-gem-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.result-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ios-label);
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.result-subtitle {
  font-size: 14px;
  color: var(--ios-label-secondary);
  font-weight: 400;
}
.result-badge {
  flex-shrink: 0;
}
.badge-level {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: var(--ios-blue-light);
  color: var(--ios-blue);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

/* =====================
   Result Sections
   ===================== */
.result-section {
  padding: 16px 20px;
}
.result-section + .result-section {
  border-top: 0.5px solid var(--ios-fill-secondary);
}
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ios-label-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.section-dot.blue { background: var(--ios-blue); }
.section-dot.orange { background: var(--ios-orange); }

/* =====================
   Chip Grid (Gems Needed)
   ===================== */
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 7px 11px;
  border-radius: 8px;
  background: var(--ios-fill-tertiary);
  transition: all 0.15s;
}
.chip-lv {
  font-size: 12px;
  font-weight: 600;
  color: var(--ios-label-secondary);
}
.chip-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--ios-label);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono), var(--font);
}
.chip-unit {
  font-size: 11px;
  color: var(--ios-label-tertiary);
  margin-left: -1px;
}
.chip-target {
  background: var(--ios-blue-light);
}
.chip-target .chip-lv { color: var(--ios-blue); }
.chip-target .chip-val { color: var(--ios-blue); }
.chip-l1 {
  background: var(--ios-green-light);
}
.chip-l1 .chip-lv { color: var(--ios-green); }
.chip-l1 .chip-val { color: var(--ios-green); }

/* =====================
   Extra List (Extra Gems)
   ===================== */
.extra-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--ios-fill-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.extra-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  transition: background 0.15s;
}
.extra-item + .extra-item {
  border-top: 0.5px solid var(--ios-fill);
}
.extra-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.extra-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.extra-lv {
  font-size: 15px;
  font-weight: 500;
  color: var(--ios-label);
}
.extra-val {
  font-size: 15px;
  font-weight: 700;
  color: var(--ios-orange);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono), var(--font);
  white-space: nowrap;
}

/* =====================
   No Extra
   ===================== */
.no-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--ios-green-light);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 500;
  color: var(--ios-green);
}
.no-extra-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ios-green);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

/* =====================
   Empty State
   ===================== */
.empty-state {
  text-align: center;
  padding: 48px 20px;
}
.empty-icon {
  font-size: 40px;
  opacity: 0.25;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 15px;
  color: var(--ios-label-tertiary);
}

/* =====================
   Transitions
   ===================== */
.fade-up-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.fade-up-leave-active {
  transition: all 0.2s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* =====================
   Responsive
   ===================== */

/* --- 手机 (≤480px): iPhone SE / iPhone 15 Pro --- */
@media (max-width: 480px) {
  .header {
    padding: 16px 16px 20px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
  }
  .header-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 17px;
  }
  .header-text h1 {
    font-size: 18px;
  }
  .header-sub {
    font-size: 12px;
  }
  .container {
    padding: 12px 12px calc(32px + env(safe-area-inset-bottom, 0px));
  }
  .query-row {
    flex-direction: column;
    gap: 12px;
  }
  .card-header {
    padding: 14px 16px 10px;
  }
  .query-row {
    padding: 0 16px;
  }
  .ios-btn {
    width: calc(100% - 32px);
    margin: 12px 16px 0;
    padding: 12px 16px;
    font-size: 15px;
  }
  .result-header {
    padding: 16px 16px 14px;
  }
  .result-gem-icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }
  .result-gem-icon {
    width: 28px;
    height: 28px;
  }
  .result-title {
    font-size: 18px;
  }
  .result-badge {
    align-self: flex-start;
  }
  .result-section {
    padding: 14px 16px;
  }
  .section-label {
    font-size: 12px;
    margin-bottom: 10px;
  }
  .chip-grid {
    gap: 5px;
  }
  .chip {
    padding: 5px 8px;
    gap: 2px;
  }
  .chip-lv {
    font-size: 11px;
  }
  .chip-val {
    font-size: 13px;
  }
  .chip-unit {
    font-size: 10px;
  }
  .extra-item {
    padding: 10px 12px;
  }
  .extra-icon {
    width: 18px;
    height: 18px;
  }
  .extra-lv {
    font-size: 14px;
  }
  .extra-val {
    font-size: 14px;
  }
  .no-extra {
    padding: 12px 14px;
    font-size: 14px;
  }
  .empty-state {
    padding: 36px 16px;
  }
  .empty-icon {
    font-size: 32px;
  }
}

/* --- 大屏手机横屏/小平板 (481px ~ 560px) --- */
@media (min-width: 481px) and (max-width: 560px) {
  .header {
    padding: 16px 16px 20px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
  }
  .container {
    padding: 14px 14px 36px;
  }
  .query-row {
    flex-direction: column;
    gap: 12px;
    padding: 0 16px;
  }
  .ios-btn {
    width: calc(100% - 32px);
    margin: 12px 16px 0;
  }
  .result-header {
    flex-direction: row;
  }
  .result-section {
    padding: 14px 16px;
  }
}

/* --- 平板 (561px ~ 768px): iPad Mini / iPad --- */
@media (min-width: 561px) and (max-width: 768px) {
  .container {
    max-width: 600px;
    padding: 16px 20px 40px;
  }
  .result-header {
    flex-direction: row;
  }
}

/* --- 桌面 (769px+): 宽屏优化 --- */
@media (min-width: 769px) {
  .container {
    max-width: 580px;
    padding: 24px 20px 48px;
  }
  .card {
    box-shadow: 0 0.5px 0 0.5px rgba(0,0,0,0.05), 0 2px 12px rgba(0,0,0,0.08);
  }
  .result-header {
    flex-direction: row;
  }
}

/* --- 超宽屏 (1200px+): 居中装饰 --- */
@media (min-width: 1200px) {
  .container {
    max-width: 600px;
    padding: 32px 20px 64px;
  }
  .header-inner {
    max-width: 600px;
  }
}
</style>
