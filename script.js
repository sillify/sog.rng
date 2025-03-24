import { TOTAL_CATS, rarityRanges, BOOSTER_TIERS, CAT_ACHIEVEMENTS_COUNT, BOOSTER_ACHIEVEMENTS_COUNT, ROLL_ACHIEVEMENTS_COUNT, GLOVE_TRADE_COST, GLOVE_BONUS, BET_BONUS_BOOSTERS_MIN, BET_BONUS_BOOSTERS_MAX } from "./config.js";
import confetti from "https://cdn.skypack.dev/canvas-confetti";

const catNames = {
  Common: ["Whiskers", "Mittens", "Paws", "Shadow", "Simba"],
  Rare: ["Fluffy", "Tiger", "Oreo", "Smokey"],
  Epic: ["Apollo", "Zeus", "Luna", "Nova"],
  Legendary: ["Odin", "Aurora", "Celeste", "Titan"]
};

const inventory = { cats: 0, boosters: [], boosterTrades: 0, gloves: 0 };
let rollCount = 0;

let pendingBet = null;
const rarityRewardMapping = {
  "Common": { min: 1, max: 1 },
  "Rare": { min: 1, max: 2 },
  "Epic": { min: 2, max: 3 },
  "Legendary": { min: 3, max: 5 }
};

function updateInventoryDisplay() {
  const boosterSummary = BOOSTER_TIERS.map(tier => {
    const count = inventory.boosters.filter(b => b.id === tier.id).length;
    return `${tier.name}: ${count}`;
  }).join(" | ");
  document.getElementById("inventory").textContent =
    `Soggy Cats: ${inventory.cats} | Boosters: ${boosterSummary} | Lucky Gloves: ${inventory.gloves}`;
}

function updateStatsPanel() {
  const statsPanel = document.getElementById("statsPanel");
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  statsPanel.textContent = `Rolls: ${rollCount} | Soggy Cats: ${inventory.cats} | Booster Trades: ${inventory.boosterTrades} | Lucky Gloves: ${inventory.gloves} | Achievements Unlocked: ${unlockedCount} / ${achievements.length}`;
}

let isCooldown = false;
const cooldownDuration = 3000;

// Build achievements list
let achievements = [];
for (let i = 1; i <= CAT_ACHIEVEMENTS_COUNT; i++) {
  achievements.push({ id: `catCollector${i}`, title: `Soggy Cat Collector - ${i} Cats`, description: `Collected ${i} soggy cats.`, unlocked: false, catThreshold: i });
}
for (let i = 1; i <= BOOSTER_ACHIEVEMENTS_COUNT; i++) {
  achievements.push({ id: `boosterTrader${i}`, title: `Booster Trader - ${i} Booster Trades`, description: `Completed ${i} booster trades.`, unlocked: false, boosterThreshold: i });
}
for (let i = 1; i <= ROLL_ACHIEVEMENTS_COUNT; i++) {
  achievements.push({ id: `rollAchiever${i}`, title: `Roll Master - ${i} Rolls`, description: `Rolled ${i} times.`, unlocked: false, rollThreshold: i });
}
// NEW: Add 996 extra achievements unlocked via roll count starting at 301 rolls
for (let i = 1; i <= 996; i++) {
  achievements.push({
    id: `extraAchievement${i}`,
    title: `Roll Master - ${300 + i} Rolls`,
    description: `Achieved after ${300 + i} rolls.`,
    unlocked: false,
    rollThreshold: 300 + i
  });
}
const unnecessaryAchievements = [
  { id: "unnecessary01", title: "Moment of Brilliance", description: "You did something completely unnecessary!", unlocked: false, unnecessary: true },
  { id: "unnecessary02", title: "Because You Can", description: "Unlocked an achievement for no particular reason.", unlocked: false, unnecessary: true },
  { id: "unnecessary03", title: "Simply Awesome", description: "Sometimes, it's the little things that count.", unlocked: false, unnecessary: true },
  { id: "unnecessary04", title: "Lucky Random", description: "Luck is on your side, even if it's random.", unlocked: false, unnecessary: true },
  { id: "unnecessary05", title: "Effortless Victory", description: "Achievement unlocked for no good reason at all.", unlocked: false, unnecessary: true },
  { id: "unnecessary06", title: "Inconceivable Success", description: "You achieved something extraordinary by accident!", unlocked: false, unnecessary: true }
];
achievements = achievements.concat(unnecessaryAchievements);

function displayAchievements() {
  const achievementsList = document.getElementById("achievementsList");
  achievementsList.innerHTML = "";
  achievements.forEach(a => {
    let typeClass = "";
    if (a.catThreshold !== undefined) {
      typeClass = "cat";
    } else if (a.boosterThreshold !== undefined) {
      typeClass = "booster";
    } else if (a.rollThreshold !== undefined) {
      typeClass = "roll";
    } else if (a.unnecessary) {
      typeClass = "misc";
    }
    const achievementDiv = document.createElement("div");
    achievementDiv.className = "achievement " + typeClass + " " + (a.unlocked ? "unlocked" : "locked");
    achievementDiv.innerHTML = `<span class="title">${a.title}</span><span class="description">${a.description}</span>`;
    achievementsList.appendChild(achievementDiv);
  });
}

function checkAchievements(latestRarity, isTrade = false) {
  let achievementUnlocked = false;
  const newAchievements = [];
  achievements.forEach(a => {
    if (a.catThreshold !== undefined && !a.unlocked && inventory.cats >= a.catThreshold) {
      a.unlocked = true;
      achievementUnlocked = true;
      newAchievements.push(a);
    }
    if (a.boosterThreshold !== undefined && !a.unlocked && inventory.boosterTrades >= a.boosterThreshold) {
      a.unlocked = true;
      achievementUnlocked = true;
      newAchievements.push(a);
    }
    if (a.rollThreshold !== undefined && !a.unlocked && rollCount >= a.rollThreshold) {
      a.unlocked = true;
      achievementUnlocked = true;
      newAchievements.push(a);
    }
  });
  
  if (achievementUnlocked) {
    displayAchievements();
    newAchievements.forEach((ach, index) => {
      setTimeout(() => {
        showAchievementPopup(ach);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }, index * 1500);
    });
  }
}

function showAchievementPopup(achievement) {
  const popup = document.getElementById("achievementPopup");
  popup.innerHTML = `<strong>Achievement Unlocked!</strong><br><em>${achievement.title}</em><br>${achievement.description}`;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

function tryUnlockUnnecessaryAchievement() {
  if (Math.random() < 0.1) {
    const available = unnecessaryAchievements.filter(a => !a.unlocked);
    if (available.length > 0) {
      const randomAchievement = available[Math.floor(Math.random() * available.length)];
      randomAchievement.unlocked = true;
      displayAchievements();
      showAchievementPopup(randomAchievement);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  }
}

document.getElementById("rollButton").addEventListener("click", () => {
  if (isCooldown) return;
  isCooldown = true;
  document.getElementById("rollButton").disabled = true;
  
  document.getElementById("result").classList.remove("rainbow-text");
  
  rollCount++;
  
  const useBooster = document.getElementById("useBooster").checked;
  let totalRolls = 1;
  if (useBooster && inventory.boosters.length > 0) {
    const selectedBooster = inventory.boosters.reduce((max, booster) =>
      booster.rerollCount > max.rerollCount ? booster : max, inventory.boosters[0]);
    inventory.boosters.splice(inventory.boosters.indexOf(selectedBooster), 1);
    totalRolls = selectedBooster.rerollCount + 1;
    document.getElementById("useBooster").checked = false;
  }
  
  let bestRoll = 0;
  for (let i = 0; i < totalRolls; i++) {
    bestRoll = Math.max(bestRoll, getRandomCatNumber());
  }
  
  let bonus = inventory.gloves * GLOVE_BONUS;
  const finalCatNumber = Math.min(bestRoll + bonus, TOTAL_CATS);
  const finalRarity = getRarity(finalCatNumber);
  const finalNamesArray = catNames[finalRarity];
  const finalName = finalNamesArray[Math.floor(Math.random() * finalNamesArray.length)];
  
  const catInfoHTML = `<div class="cat-info">
      <p>Name: ${finalName}</p>
      <p>Soggy Cat #: ${finalCatNumber} ${bonus > 0 ? `( +${bonus} from Lucky Gloves )` : ""}</p>
      <p>Rarity: ${finalRarity}</p>
    </div>`;
  document.getElementById("catDisplay").innerHTML = catInfoHTML;
  
  const resultElement = document.getElementById("result");
  resultElement.textContent = `You got sog.rng: ${finalName}! (Soggy Cat #${finalCatNumber}, ${finalRarity})`;
  resultElement.classList.add("rainbow-text");
  
  inventory.cats++;
  updateInventoryDisplay();
  updateStatsPanel();
  checkAchievements(finalRarity);
  tryUnlockUnnecessaryAchievement();
  
  if (pendingBet) {
    const betDiv = document.getElementById("betResult");
    if (pendingBet.guess === finalRarity) {
      const mapping = rarityRewardMapping[finalRarity];
      const bonusBoosters = Math.floor(Math.random() * (mapping.max - mapping.min + 1)) + mapping.min;
      for (let i = 0; i < bonusBoosters; i++) {
        const basicBooster = BOOSTER_TIERS.find(b => b.id === "basic");
        inventory.boosters.push(basicBooster);
      }
      betDiv.innerHTML = `<span style="color: green;">Bet successful! Rolled a ${finalRarity}. You received ${bonusBoosters} Basic Luck Booster${bonusBoosters > 1 ? "s" : ""}!</span>`;
      updateInventoryDisplay();
      updateStatsPanel();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.5 }});
    } else {
      inventory.cats = 0;
      updateInventoryDisplay();
      updateStatsPanel();
      betDiv.innerHTML = `<span style="color: red;">Bet lost! You bet ${pendingBet.guess} but rolled ${finalRarity}. Your Soggy Cats have been reset.</span>`;
    }
    pendingBet = null;
  }
  
  setTimeout(() => {
    isCooldown = false;
    document.getElementById("rollButton").disabled = false;
  }, cooldownDuration);
});

document.getElementById("betButton").addEventListener("click", () => {
  const guess = document.getElementById("rarityGuess").value;
  const betResultDiv = document.getElementById("betResult");
  if (pendingBet !== null) {
    betResultDiv.innerHTML = `<span style="color: orange;">You already have a bet pending. Wait for your next roll!</span>`;
    return;
  }
  pendingBet = { guess };
  const mapping = rarityRewardMapping[guess];
  betResultDiv.innerHTML = `<span style="color: blue;">Bet placed! If your next roll is ${guess}, you could receive between ${mapping.min} and ${mapping.max} Basic Luck Booster${mapping.max > 1 ? 's' : ''}!</span>`;
});

function getRandomCatNumber() {
  return Math.floor(Math.random() * TOTAL_CATS) + 1;
}

function getRarity(catNumber) {
  for (const [rarity, range] of Object.entries(rarityRanges)) {
    if (catNumber >= range.start && catNumber <= range.end) {
      return rarity;
    }
  }
  return "Common";
}

document.getElementById("tradeButton").addEventListener("click", () => {
  const boosterId = document.getElementById("boosterSelect").value;
  const selectedBooster = BOOSTER_TIERS.find(b => b.id === boosterId);
  if (inventory.cats >= selectedBooster.tradeCost) {
    inventory.cats -= selectedBooster.tradeCost;
    inventory.boosters.push(selectedBooster);
    inventory.boosterTrades++;
    updateInventoryDisplay();
    updateStatsPanel();
    document.getElementById("result").textContent = `Trade successful! You received a ${selectedBooster.name}.`;
    checkAchievements(null, true);
  } else {
    document.getElementById("result").textContent = `Not enough soggy cats to trade for a ${selectedBooster.name}!`;
  }
});

document.getElementById("tradeGlovesButton").addEventListener("click", () => {
  if (inventory.cats >= GLOVE_TRADE_COST) {
    inventory.cats -= GLOVE_TRADE_COST;
    inventory.gloves++;
    updateInventoryDisplay();
    updateStatsPanel();
    document.getElementById("result").textContent = `Trade successful! You've acquired a Lucky Glove. Your permanent luck bonus is now +${inventory.gloves * GLOVE_BONUS}.`;
  } else {
    document.getElementById("result").textContent = `Not enough Soggy Cats to trade for a Lucky Glove! (Cost: ${GLOVE_TRADE_COST})`;
  }
});

updateInventoryDisplay();
updateStatsPanel();
displayAchievements();
