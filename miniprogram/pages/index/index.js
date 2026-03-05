const {
  PET_PROFILES,
  createFoodCard,
  pickReply,
  applyFeedStats,
  decayHunger,
  buildFeedLogEntry,
  generateDiary,
  getMoodLabel,
} = require('../../utils/momoEngine');

Page({
  data: {
    petOptions: Object.keys(PET_PROFILES).map((key) => ({ key, ...PET_PROFILES[key] })),
    selectedMbti: 'ENFP',
    petName: 'MOMO',
    inputMode: 'text',
    userInput: '',
    foodCard: null,
    lastReply: '',
    diaryText: '',
    feedLogs: [],
    moodLabel: '平静',
    stats: {
      hunger: 50,
      bond: 0,
      mood: 50,
    },
  },

  onSelectPet(e) {
    const type = e.currentTarget.dataset.type;
    if (!type) return;
    this.setData({ selectedMbti: type });
  },

  onSwitchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (!mode) return;
    this.setData({ inputMode: mode, userInput: '', foodCard: null });
  },

  onNameInput(e) {
    this.setData({ petName: e.detail.value || 'MOMO' });
  },

  onTextInput(e) {
    this.setData({ userInput: e.detail.value || '' });
  },

  onGenerateFood() {
    const { userInput, inputMode } = this.data;
    const content = String(userInput || '').trim();
    if (!content) {
      wx.showToast({ title: '先输入一点情绪内容吧', icon: 'none' });
      return;
    }

    const foodCard = createFoodCard({
      content,
      source: inputMode,
    });
    this.setData({ foodCard, lastReply: '' });
  },

  onFeed() {
    const { foodCard, selectedMbti, stats, feedLogs } = this.data;
    if (!foodCard) {
      wx.showToast({ title: '先做一份料理吧', icon: 'none' });
      return;
    }

    const reply = pickReply(selectedMbti, foodCard.emotion);
    const nextStats = applyFeedStats(stats, foodCard.emotion);
    const nextLogs = [...feedLogs, buildFeedLogEntry(foodCard, reply)].slice(-8);

    this.setData({
      lastReply: `${this.data.petName}：${reply}`,
      stats: nextStats,
      moodLabel: getMoodLabel(nextStats.mood),
      feedLogs: nextLogs,
      foodCard: null,
    });

    wx.vibrateShort({ type: 'medium' });
  },

  onGenerateDiary() {
    const { selectedMbti, petName, feedLogs } = this.data;
    const diaryText = generateDiary({
      mbtiType: selectedMbti,
      petName,
      logs: feedLogs,
    });
    this.setData({ diaryText });
  },

  onSimulateTimePass() {
    const stats = decayHunger(this.data.stats, 3);
    this.setData({ stats, moodLabel: getMoodLabel(stats.mood) });
    wx.showToast({ title: '已模拟 3 小时', icon: 'none' });
  },
});
