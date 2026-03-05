const {
  PET_PROFILES,
  ACCESSORY_SHOP,
  createFoodCard,
  pickReply,
  applyFeedStats,
  rewardCrystals,
  decayHunger,
  buildFeedLogEntry,
  generateDiary,
  getMoodLabel,
  purchaseAccessory,
} = require('../../utils/momoEngine');

const STORAGE_KEY = 'momo_state_v1';

Page({
  data: {
    petOptions: Object.keys(PET_PROFILES).map((key) => ({ key, ...PET_PROFILES[key] })),
    selectedMbti: 'ENFP',
    petName: 'MOMO',
    equippedAccessory: '无',
    inputMode: 'text',
    userInput: '',
    foodCard: null,
    lastReply: '',
    diaryText: '',
    feedLogs: [],
    moodLabel: '平静',
    crystals: 0,
    ownedAccessories: [],
    accessoryShop: ACCESSORY_SHOP,
    stats: {
      hunger: 50,
      bond: 0,
      mood: 50,
    },
  },

  onLoad() {
    this.restoreState();
  },

  restoreState() {
    try {
      const cache = wx.getStorageSync(STORAGE_KEY);
      if (!cache) return;
      this.setData({ ...cache, moodLabel: getMoodLabel(cache.stats?.mood) });
    } catch (error) {
      console.warn('restoreState failed', error);
    }
  },

  persistState() {
    const {
      selectedMbti,
      petName,
      equippedAccessory,
      stats,
      feedLogs,
      crystals,
      ownedAccessories,
      diaryText,
    } = this.data;

    try {
      wx.setStorageSync(STORAGE_KEY, {
        selectedMbti,
        petName,
        equippedAccessory,
        stats,
        feedLogs,
        crystals,
        ownedAccessories,
        diaryText,
      });
    } catch (error) {
      console.warn('persistState failed', error);
    }
  },

  onSelectPet(e) {
    const type = e.currentTarget.dataset.type;
    if (!type) return;
    this.setData({ selectedMbti: type }, () => this.persistState());
  },

  onSwitchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (!mode) return;
    this.setData({ inputMode: mode, userInput: '', foodCard: null });
  },

  onNameInput(e) {
    this.setData({ petName: e.detail.value || 'MOMO' }, () => this.persistState());
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
    const { foodCard, selectedMbti, stats, feedLogs, crystals } = this.data;
    if (!foodCard) {
      wx.showToast({ title: '先做一份料理吧', icon: 'none' });
      return;
    }

    const reply = pickReply(selectedMbti, foodCard.emotion);
    const nextStats = applyFeedStats(stats, foodCard.emotion);
    const nextLogs = [...feedLogs, buildFeedLogEntry(foodCard, reply)].slice(-8);
    const gained = rewardCrystals(foodCard.rarity, foodCard.emotion);

    this.setData(
      {
        lastReply: `${this.data.petName}：${reply}`,
        stats: nextStats,
        moodLabel: getMoodLabel(nextStats.mood),
        feedLogs: nextLogs,
        foodCard: null,
        crystals: crystals + gained,
      },
      () => this.persistState()
    );

    wx.showToast({ title: `+${gained} 情绪结晶`, icon: 'none' });
    wx.vibrateShort({ type: 'medium' });
  },

  onGenerateDiary() {
    const { selectedMbti, petName, feedLogs } = this.data;
    const diaryText = generateDiary({
      mbtiType: selectedMbti,
      petName,
      logs: feedLogs,
    });
    this.setData({ diaryText }, () => this.persistState());
  },

  onSimulateTimePass() {
    const stats = decayHunger(this.data.stats, 3);
    this.setData({ stats, moodLabel: getMoodLabel(stats.mood) }, () => this.persistState());
    wx.showToast({ title: '已模拟 3 小时', icon: 'none' });
  },

  onBuyAccessory(e) {
    const accessoryId = e.currentTarget.dataset.id;
    const result = purchaseAccessory(
      {
        crystals: this.data.crystals,
        owned: this.data.ownedAccessories,
      },
      accessoryId
    );

    if (!result.ok) {
      wx.showToast({ title: result.message, icon: 'none' });
      return;
    }

    this.setData(
      {
        crystals: result.crystals,
        ownedAccessories: result.owned,
        equippedAccessory: result.unlocked.name,
      },
      () => this.persistState()
    );
    wx.showToast({ title: result.message, icon: 'success' });
  },

  onResetProgress() {
    wx.removeStorageSync(STORAGE_KEY);
    this.setData({
      selectedMbti: 'ENFP',
      petName: 'MOMO',
      equippedAccessory: '无',
      inputMode: 'text',
      userInput: '',
      foodCard: null,
      lastReply: '',
      diaryText: '',
      feedLogs: [],
      moodLabel: '平静',
      crystals: 0,
      ownedAccessories: [],
      stats: { hunger: 50, bond: 0, mood: 50 },
    });
    wx.showToast({ title: '进度已重置', icon: 'none' });
  },
});
