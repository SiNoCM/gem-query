/**
 * 梦幻西游 · 宝石合成规则数据
 * 数据来源：梦幻西游电脑版官方公告（2024年5月）
 */

// 普通宝石额外材料规则（12-20级）
const GEM_EXTRA_MATERIALS = {
  12: [{ level: 3, count: 1 }, { level: 5, count: 1 }, { level: 6, count: 1 }],
  13: [{ level: 9, count: 1 }],
  14: [{ level: 9, count: 1 }, { level: 10, count: 1 }],
  15: [{ level: 9, count: 1 }, { level: 12, count: 1 }],
  16: [{ level: 11, count: 1 }, { level: 12, count: 1 }, { level: 13, count: 1 }],
  17: [{ level: 15, count: 1 }],
  18: [{ level: 13, count: 1 }, { level: 14, count: 1 }, { level: 16, count: 1 }],
  19: [{ level: 15, count: 1 }, { level: 16, count: 1 }, { level: 17, count: 1 }],
  20: [{ level: 17, count: 1 }, { level: 18, count: 2 }],
}

// 星辉石额外材料规则（9-11级）
const STAR_EXTRA_MATERIALS = {
  9:  [{ level: 5, count: 1 }],
  10: [{ level: 6, count: 1 }, { level: 7, count: 1 }],
  11: [{ level: 9, count: 1 }],
}

// 普通宝石工艺技能等级要求
function gemCraftSkill(level) {
  if (level <= 1) return 0
  if (level <= 3) return 3
  if (level <= 5) return 4
  if (level <= 7) return 5
  if (level <= 9) return 6
  return 7
}

// 星辉石工艺技能等级要求
function starCraftSkill(level) {
  if (level <= 1) return 0
  if (level === 2) return 4
  if (level <= 5) return 5
  if (level <= 7) return 6
  return 7
}

// 生成普通宝石规则（2合1, 1-20级）
function generateGemRules() {
  const rules = []
  for (let level = 1; level <= 20; level++) {
    rules.push({
      targetLevel: level,
      materialLevel: level === 1 ? 1 : level - 1,
      materialCount: 2,
      totalL1: Math.pow(2, level - 1),
      craftSkill: gemCraftSkill(level),
      guaranteed: level >= 12,
      extraMaterials: GEM_EXTRA_MATERIALS[level] || [],
    })
  }
  return rules
}

// 生成星辉石规则（3合1, 1-11级）
function generateStarRules() {
  const rules = []
  for (let level = 1; level <= 11; level++) {
    rules.push({
      targetLevel: level,
      materialLevel: level === 1 ? 1 : level - 1,
      materialCount: 3,
      totalL1: Math.pow(3, level - 1),
      craftSkill: starCraftSkill(level),
      guaranteed: level >= 9,
      extraMaterials: STAR_EXTRA_MATERIALS[level] || [],
    })
  }
  return rules
}

/**
 * 计算合成目标等级宝石的完整物料清单（BOM）
 * 
 * 核心思路：
 * - levelNeeds[lv] = 在整个合成过程中，需要消耗多少颗 lv 级宝石
 *   包括：作为基础合成材料 + 作为额外提交材料
 * - 额外提交的宝石本身也需要被合成，因此它们的合成成本也要计入
 * 
 * 算法：拓扑展开。
 * 1. 初始化 demand[targetLevel] = 1
 * 2. 从高到低处理每个等级：
 *    - 将 demand[lv] 展开为基础材料 demand[lv-1] += demand[lv] * ratio
 *    - 将额外材料需求回流：demand[em.level] += em.count * demand[lv]
 * 3. 由于额外材料可能指向已处理过的等级（如合15需要12级），
 *    需要标记"新增需求"并重新处理。
 *
 * @param {Object} gem - 宝石类型对象
 * @param {number} targetLevel - 目标等级
 * @returns {Object} { steps, levelNeeds, extraNeeds }
 */
export function calcBOM(gem, targetLevel) {
  if (targetLevel <= 1) {
    return {
      steps: [{ level: 1, need: 1, base: 0, extra: [] }],
      levelNeeds: { 1: 1 },
      extraNeeds: {},
    }
  }

  const ratio = gem.ratio

  // 每级宝石的直接合成规则
  const rulesMap = {}
  for (let lv = 2; lv <= targetLevel; lv++) {
    const rule = gem.rules.find(r => r.targetLevel === lv)
    rulesMap[lv] = {
      baseCount: ratio,
      extras: rule ? rule.extraMaterials.map(e => ({ ...e })) : [],
    }
  }

  // demand[lv] = 需要消耗多少颗 lv 级宝石
  const demand = { [targetLevel]: 1 }
  // extraNeeds[lv] = 作为额外材料被提交的 lv 级宝石总数
  const extraNeeds = {}

  // 使用队列处理：每次有新需求加入时，将其展开
  // processed[lv] = 已经展开过的 demand[lv] 数量
  const processed = {}
  // 待处理的等级队列
  const queue = [targetLevel]

  while (queue.length > 0) {
    const lv = queue.shift()
    const rule = rulesMap[lv]
    if (!rule) continue

    // 本轮需要展开的数量 = demand[lv] - 已处理数量
    const alreadyDone = processed[lv] || 0
    const toProcess = (demand[lv] || 0) - alreadyDone
    if (toProcess <= 0) continue

    processed[lv] = alreadyDone + toProcess

    // 基础材料消耗
    const baseTotal = toProcess * rule.baseCount
    const prevBase = demand[lv - 1] || 0
    demand[lv - 1] = prevBase + baseTotal
    // lv-1 有了新需求，加入队列
    if (processed[lv - 1] === undefined) {
      queue.push(lv - 1)
    } else if (demand[lv - 1] > processed[lv - 1]) {
      queue.push(lv - 1)
    }

    // 额外材料消耗
    for (const em of rule.extras) {
      const emTotal = em.count * toProcess
      extraNeeds[em.level] = (extraNeeds[em.level] || 0) + emTotal
      // 额外宝石也需要被合成 → 回流到 demand
      const prevEm = demand[em.level] || 0
      demand[em.level] = prevEm + emTotal
      // em.level 有了新需求，加入队列
      if (processed[em.level] === undefined) {
        queue.push(em.level)
      } else if (demand[em.level] > processed[em.level]) {
        queue.push(em.level)
      }
    }
  }

  const levelNeeds = { ...demand }

  // 构建 steps
  const steps = []
  for (let lv = targetLevel; lv >= 2; lv--) {
    const need = levelNeeds[lv] || 0
    if (need === 0) continue

    const rule = rulesMap[lv]
    steps.push({
      level: lv,
      need,
      basePerUnit: ratio,
      baseTotal: need * ratio,
      materialLevel: lv - 1,
      extras: rule.extras.map(em => ({ ...em, total: em.count * need })),
    })
  }

  const l1Need = levelNeeds[1] || 0
  steps.push({
    level: 1,
    need: l1Need,
    basePerUnit: 0,
    baseTotal: 0,
    materialLevel: 0,
    extras: [],
  })

  steps.sort((a, b) => b.level - a.level)

  return { steps, levelNeeds, extraNeeds }
}

// 宝石类型定义
export const gemTypes = [
  { id: 1, name: '光芒石', icon: '/gems/guangmangshi.png', desc: '增加气血上限，镶嵌于装备', ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 2, name: '月亮石', icon: '/gems/yueliangshi.png', desc: '增加防御，镶嵌于装备',     ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 3, name: '舍利子', icon: '/gems/shelizi.png', desc: '增加灵力，镶嵌于装备',     ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 4, name: '红玛瑙', icon: '/gems/hongmanao.png', desc: '增加伤害，镶嵌于装备',     ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 5, name: '太阳石', icon: '/gems/taiyangshi.png', desc: '增加速度，镶嵌于装备',     ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 6, name: '黑宝石', icon: '/gems/heibaoshi.png', desc: '增加速度(鞋类)，镶嵌于装备', ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 7, name: '翡翠石', icon: '/gems/feicuishi.png', desc: '增加灵力(项链类)，镶嵌于装备', ratio: 2, maxLevel: 20, rules: generateGemRules() },
  { id: 8, name: '星辉石', icon: '/gems/xinghuishi.svg', desc: '提升灵饰下排属性，镶嵌于灵饰，最高11锻', ratio: 3, maxLevel: 11, rules: generateStarRules() },
]
