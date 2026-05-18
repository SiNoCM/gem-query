<template>
  <div class="table-card">
    <h3>📋 {{ title }}</h3>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>目标等级</th>
            <th>合成材料</th>
            <th>合成比例</th>
            <th>所需1级总数</th>
            <th>工艺等级</th>
            <th>额外材料</th>
          </tr>
        </thead>
        <tbody>
          <!-- Section headers for all-gems view -->
          <template v-if="grouped">
            <template v-for="(group, gemName) in grouped" :key="gemName">
              <tr class="section-header">
                <td colspan="6">💎 {{ gemName }}（{{ group[0].ratio === 3 ? '3合1' : '2合1' }}）</td>
              </tr>
              <tr v-for="rule in group" :key="`${gemName}-${rule.targetLevel}`">
                <td class="level-cell">{{ rule.targetLevel }}级</td>
                <td :class="{ muted: rule.targetLevel === 1 }">
                  {{ rule.targetLevel === 1 ? '—' : `${rule.materialCount}个${rule.materialLevel}级` }}
                </td>
                <td>{{ rule.ratio === 3 ? '3 : 1' : '2 : 1' }}</td>
                <td class="count-cell">{{ formatNum(rule.totalL1) }}</td>
                <td>{{ rule.craftSkill }}级</td>
                <td>
                  <span v-for="(em, i) in rule.extraMaterials" :key="i" class="extra-tag">
                    {{ em.level }}级×{{ em.count }}
                  </span>
                  <span v-if="!rule.extraMaterials.length" class="extra-empty">—</span>
                </td>
              </tr>
            </template>
          </template>

          <!-- Single gem view -->
          <template v-else>
            <tr v-for="rule in rules" :key="rule.targetLevel">
              <td class="level-cell">{{ rule.targetLevel }}级</td>
              <td :class="{ muted: rule.targetLevel === 1 }">
                {{ rule.targetLevel === 1 ? '—' : `${rule.materialCount}个${rule.materialLevel}级` }}
              </td>
              <td>{{ ratio === 3 ? '3 : 1' : '2 : 1' }}</td>
              <td class="count-cell">{{ formatNum(rule.totalL1) }}</td>
              <td>{{ rule.craftSkill }}级</td>
              <td>
                <span v-for="(em, i) in rule.extraMaterials" :key="i" class="extra-tag">
                  {{ em.level }}级×{{ em.count }}
                </span>
                <span v-if="!rule.extraMaterials.length" class="extra-empty">—</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '📋 合成规则' },
  rules: { type: Array, default: () => [] },
  grouped: { type: Object, default: null },
  ratio: { type: Number, default: 2 },
})

function formatNum(n) {
  return n.toLocaleString('zh-CN')
}
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 20px;
}
.table-card h3 {
  padding: 16px 24px;
  font-size: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.table-wrapper { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
thead th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}
tbody td {
  padding: 11px 16px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}
tbody tr:hover td { background: #f0f5ff; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:nth-child(even) td { background: #fafbfc; }
tbody tr:nth-child(even):hover td { background: #f0f5ff; }

.section-header td {
  background: #ebf5ff !important;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 14px;
  color: #2e5a9e;
  text-align: left;
}

.level-cell { font-weight: 700; color: #2e5a9e; font-size: 15px; }
.count-cell { font-weight: 600; color: #4472c4; font-variant-numeric: tabular-nums; }
.muted { color: #d1d5db; }

.extra-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  margin: 1px 2px;
  background: #fffbef;
  color: #d97706;
  font-weight: 500;
}
.extra-empty { color: #d1d5db; font-size: 12px; }
</style>
