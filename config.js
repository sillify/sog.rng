export const TOTAL_CATS = 1000;

export const rarityRanges = {
  Common: { start: 1, end: 800 },
  Rare: { start: 801, end: 950 },
  Epic: { start: 951, end: 990 },
  Legendary: { start: 991, end: 1000 }
};

export const BOOSTER_TIERS = [
  { id: "basic", name: "Basic Luck Booster", tradeCost: 5, rerollCount: 1 },
  { id: "silver", name: "Silver Luck Booster", tradeCost: 10, rerollCount: 2 },
  { id: "gold", name: "Gold Luck Booster", tradeCost: 20, rerollCount: 3 },
  { id: "platinum", name: "Platinum Luck Booster", tradeCost: 30, rerollCount: 4 },
  { id: "diamond", name: "Diamond Luck Booster", tradeCost: 40, rerollCount: 5 }
];
