const PET_PROFILES = {
  ENFP: {
    label: '快乐修勾',
    style: '热情治愈',
    diaryTone: '元气且温暖',
    replies: {
      negative: ['呜呜这口有点苦，我陪你把委屈嚼碎。', '先抱抱！坏情绪我们一起赶跑。'],
      positive: ['哇这口也太甜啦，你今天真的在发光！', '夸夸夸！你值得所有彩虹和掌声！'],
      neutral: ['今天是清淡口味，我在你身边慢慢陪。', '平平淡淡也很好，我们一起稳稳前进。'],
    },
  },
  INTJ: {
    label: '毒舌猫咪',
    style: '理智犀利',
    diaryTone: '克制且清醒',
    replies: {
      negative: ['这锅情绪明显过火，建议立刻远离烂人烂事。', '你的愤怒有理，下一步先保护边界。'],
      positive: ['表现不错，继续保持，你的状态很能打。', '这份自信值回票价，建议长期持有。'],
      neutral: ['信息量一般，但你在稳定推进，合格。', '先观察再行动，今天策略正确。'],
    },
  },
  ISFJ: {
    label: '温柔兔兔',
    style: '共情安慰',
    diaryTone: '细腻且体贴',
    replies: {
      negative: ['辛苦了，我听见你的难过了，先对自己温柔一点。', '这口有点酸，我会一直陪着你慢慢消化。'],
      positive: ['看到你开心我也好开心呀，继续记录这些美好吧。', '你的快乐很珍贵，今天请多爱自己一点。'],
      neutral: ['普通的一天也很珍贵，你已经做得很好了。', '慢慢来没关系，我一直在。'],
    },
  },
  ENTP: {
    label: '发疯水母',
    style: '搞怪玩梗',
    diaryTone: '脑洞且俏皮',
    replies: {
      negative: ['这情绪够冲，我建议启动“暴风吐槽模式”三分钟！', '谁惹你我就给他发疯文学，包解气。'],
      positive: ['这波是人生高光剪辑，给我循环播放！', '甜度超标，建议立刻发朋友圈统治全场。'],
      neutral: ['今日是“低配剧情”，但伏笔很多，继续追更。', '平静不等于无聊，可能在憋大招。'],
    },
  },
};

const FOOD_CATALOG = {
  negative: [
    { id: 'n1', name: '红烧甲方大饼', tags: ['工作', '冲突'] },
    { id: 'n2', name: '酸柠檬气泡水', tags: ['委屈', '吐槽'] },
    { id: 'n3', name: '爆辣打工人拌面', tags: ['压力', '疲惫'] },
  ],
  positive: [
    { id: 'p1', name: '绝美落日舒芙蕾', tags: ['风景', '快乐'] },
    { id: 'p2', name: '自信彩虹塔', tags: ['自拍', '高光'] },
    { id: 'p3', name: '元气草莓云朵卷', tags: ['治愈', '轻松'] },
  ],
  neutral: [
    { id: 'z1', name: '深夜奶油蘑菇汤', tags: ['日常', '平稳'] },
    { id: 'z2', name: '慢炖日常饭团', tags: ['生活', '记录'] },
    { id: 'z3', name: '轻雾乌龙布丁', tags: ['平静', '观察'] },
  ],
};

const ACCESSORY_SHOP = [
  { id: 'bow', name: '蝴蝶结', cost: 5 },
  { id: 'glass', name: '墨镜', cost: 8 },
  { id: 'crown', name: '小王冠', cost: 12 },
];

function hashCode(text = '') {
  return String(text)
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000003, 7);
}

function detectEmotion(text = '') {
  const normalized = String(text).trim();
  if (!normalized) return 'neutral';

  const negativeWords = ['烦', '累', '崩溃', '生气', '难受', '哭', '焦虑', '甲方', '讨厌'];
  const positiveWords = ['开心', '好看', '喜欢', '顺利', '自信', '幸福', '夸', '爱', '惊喜'];

  const negativeScore = negativeWords.reduce((acc, word) => acc + (normalized.includes(word) ? 1 : 0), 0);
  const positiveScore = positiveWords.reduce((acc, word) => acc + (normalized.includes(word) ? 1 : 0), 0);

  if (negativeScore > positiveScore) return 'negative';
  if (positiveScore > negativeScore) return 'positive';
  return 'neutral';
}

function calculateRarity(text = '') {
  const len = String(text).trim().length;
  if (len >= 60) return 'SSR';
  if (len >= 25) return 'SR';
  return 'R';
}

function mapFood(emotion, seedSource = '') {
  const list = FOOD_CATALOG[emotion] || FOOD_CATALOG.neutral;
  const index = hashCode(`${emotion}:${seedSource}`) % list.length;
  return list[index];
}

function createFoodCard(input = {}) {
  const content = String(input.content || '').trim();
  const source = input.source === 'image' ? 'image' : 'text';
  const emotion = detectEmotion(content);
  const rarity = calculateRarity(content);
  const food = mapFood(emotion, `${source}:${content}`);

  return {
    emotion,
    rarity,
    source,
    foodId: food.id,
    foodName: food.name,
    description: `这份${rarity}级「${food.name}」已出锅（来源：${source === 'image' ? '图片心情' : '文字心情'}）。`,
  };
}

function pickReply(mbtiType, emotion) {
  const pet = PET_PROFILES[mbtiType] || PET_PROFILES.ENFP;
  const candidates = pet.replies[emotion] || pet.replies.neutral;
  return candidates[hashCode(`${mbtiType}:${emotion}`) % candidates.length];
}

function applyFeedStats(prevStats = {}, emotion = 'neutral') {
  const safe = {
    hunger: typeof prevStats.hunger === 'number' ? prevStats.hunger : 50,
    bond: typeof prevStats.bond === 'number' ? prevStats.bond : 0,
    mood: typeof prevStats.mood === 'number' ? prevStats.mood : 50,
  };

  const moodDelta = emotion === 'positive' ? 8 : emotion === 'negative' ? -4 : 2;

  return {
    hunger: Math.min(100, safe.hunger + 15),
    bond: Math.min(100, safe.bond + 6),
    mood: Math.max(0, Math.min(100, safe.mood + moodDelta)),
  };
}

function rewardCrystals(rarity = 'R', emotion = 'neutral') {
  const base = rarity === 'SSR' ? 4 : rarity === 'SR' ? 2 : 1;
  const bonus = emotion === 'positive' ? 1 : 0;
  return base + bonus;
}

function getMoodLabel(mood = 50) {
  const value = Math.max(0, Math.min(100, Number(mood) || 0));
  if (value >= 75) return '开心';
  if (value >= 40) return '平静';
  return 'emo';
}

function decayHunger(prevStats = {}, hours = 1) {
  const safeHunger = typeof prevStats.hunger === 'number' ? prevStats.hunger : 50;
  const cost = Math.max(0, Math.floor(hours)) * 4;
  return {
    ...prevStats,
    hunger: Math.max(0, safeHunger - cost),
  };
}

function buildFeedLogEntry(foodCard, reply, nowTs = Date.now()) {
  return {
    ts: nowTs,
    emotion: foodCard.emotion,
    rarity: foodCard.rarity,
    foodName: foodCard.foodName,
    reply,
    source: foodCard.source,
  };
}

function generateDiary({ mbtiType = 'ENFP', petName = 'MOMO', logs = [] } = {}) {
  if (!logs.length) {
    return '今天还没有投喂记录，来和我分享一点心情吧。';
  }

  const pet = PET_PROFILES[mbtiType] || PET_PROFILES.ENFP;
  const lastThree = logs.slice(-3);
  const events = lastThree
    .map((item) => `我吃到了${item.foodName}（${item.rarity}），能感到你是${item.emotion === 'positive' ? '开心' : item.emotion === 'negative' ? '有点难过' : '平静'}的。`)
    .join('');

  return `今天我是${petName}，以${pet.diaryTone}的心情记录你的一天：${events}谢谢你愿意把情绪交给我，我们明天也一起加油。`;
}

function purchaseAccessory({ crystals = 0, owned = [] } = {}, accessoryId) {
  const item = ACCESSORY_SHOP.find((it) => it.id === accessoryId);
  if (!item) {
    return { ok: false, message: '配饰不存在', crystals, owned };
  }
  if (owned.includes(accessoryId)) {
    return { ok: false, message: '已拥有该配饰', crystals, owned };
  }
  if (crystals < item.cost) {
    return { ok: false, message: '情绪结晶不足', crystals, owned };
  }

  return {
    ok: true,
    message: `已解锁${item.name}`,
    crystals: crystals - item.cost,
    owned: [...owned, accessoryId],
    unlocked: item,
  };
}

module.exports = {
  PET_PROFILES,
  FOOD_CATALOG,
  ACCESSORY_SHOP,
  detectEmotion,
  calculateRarity,
  mapFood,
  createFoodCard,
  pickReply,
  applyFeedStats,
  rewardCrystals,
  decayHunger,
  buildFeedLogEntry,
  generateDiary,
  getMoodLabel,
  purchaseAccessory,
};
