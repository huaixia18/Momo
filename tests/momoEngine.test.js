const assert = require('assert');
const {
  detectEmotion,
  calculateRarity,
  createFoodCard,
  pickReply,
  applyFeedStats,
  decayHunger,
  generateDiary,
  getMoodLabel,
} = require('../miniprogram/utils/momoEngine');

function testDetectEmotion() {
  assert.strictEqual(detectEmotion('今天被甲方气到崩溃，好烦'), 'negative');
  assert.strictEqual(detectEmotion('自拍好看又开心，今天超自信'), 'positive');
  assert.strictEqual(detectEmotion('今天按部就班完成任务'), 'neutral');
}

function testRarity() {
  assert.strictEqual(calculateRarity('短句'), 'R');
  assert.strictEqual(calculateRarity('这是一个长度超过二十五个字但还没到六十字的描述文本'), 'SR');
  assert.strictEqual(calculateRarity('超长描述'.repeat(20)), 'SSR');
}

function testDeterministicFoodCard() {
  const input = { content: '今天自拍很好看我好开心', source: 'text' };
  const first = createFoodCard(input);
  const second = createFoodCard(input);
  assert.deepStrictEqual(first, second);
  assert.strictEqual(first.emotion, 'positive');
}

function testReplyAndStats() {
  const reply = pickReply('INTJ', 'negative');
  assert.ok(reply.length > 0);

  const next = applyFeedStats({ hunger: 90, bond: 96, mood: 50 }, 'positive');
  assert.deepStrictEqual(next, { hunger: 100, bond: 100, mood: 58 });
}

function testDecay() {
  const decayed = decayHunger({ hunger: 20, bond: 2, mood: 40 }, 3);
  assert.strictEqual(decayed.hunger, 8);
  const floor = decayHunger({ hunger: 2 }, 2);
  assert.strictEqual(floor.hunger, 0);
}

function testMoodLabel() {
  assert.strictEqual(getMoodLabel(90), '开心');
  assert.strictEqual(getMoodLabel(60), '平静');
  assert.strictEqual(getMoodLabel(10), 'emo');
}

function testDiary() {
  const empty = generateDiary({ petName: 'MOMO', logs: [] });
  assert.ok(empty.includes('还没有投喂记录'));

  const diary = generateDiary({
    mbtiType: 'ENFP',
    petName: '桃桃',
    logs: [
      { foodName: '自信彩虹塔', emotion: 'positive', rarity: 'SR' },
      { foodName: '酸柠檬气泡水', emotion: 'negative', rarity: 'R' },
    ],
  });
  assert.ok(diary.includes('桃桃'));
  assert.ok(diary.includes('自信彩虹塔'));
}

function run() {
  testDetectEmotion();
  testRarity();
  testDeterministicFoodCard();
  testReplyAndStats();
  testDecay();
  testMoodLabel();
  testDiary();
  console.log('momoEngine tests passed');
}

run();
