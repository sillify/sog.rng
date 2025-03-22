import { TOTAL_CATS, rarityRanges, BOOSTER_TIERS } from "./config.js";

const catNames = {
  Common: ["Whiskers", "Mittens", "Paws", "Shadow", "Simba"],
  Rare: ["Fluffy", "Tiger", "Oreo", "Smokey"],
  Epic: ["Apollo", "Zeus", "Luna", "Nova"],
  Legendary: ["Odin", "Aurora", "Celeste", "Titan"]
};

const inventory = { cats: 0, boosters: [], boosterTrades: 0 };

function updateInventoryDisplay() {
  const boosterSummary = BOOSTER_TIERS.map(tier => {
    const count = inventory.boosters.filter(b => b.id === tier.id).length;
    return `${tier.name}: ${count}`;
  }).join(" | ");
  document.getElementById("inventory").textContent =
    `Soggy Cats: ${inventory.cats} | Boosters: ${boosterSummary}`;
}

// New cooldown variables
let isCooldown = false;
const cooldownDuration = 3000; // 3 seconds cooldown

// New Achievements System
const achievements = [];

// Early Access achievement (updated)
achievements.push({
  id: "earlyAccess",
  title: "Early Access",
  description: "Welcome to the early access version of sog.rng! Everyone gets this achievement.",
  unlocked: true
});

// Special achievements (updated firstCat achievement)
achievements.push(
  { id: "firstCat", title: "First Soggy Cat", description: "You rolled your first soggy cat.", unlocked: false, threshold: 1 },
  { id: "catCollector10", title: "Soggy Cat Collector - 10 Soggy Cats", description: "Collected 10 soggy cats.", unlocked: false, threshold: 10 },
  { id: "boosterStarter", title: "Booster Starter", description: "Completed your first booster trade.", unlocked: false },
  { id: "rareCatch", title: "Rare Catch", description: "Rolled a Rare soggy cat.", unlocked: false },
  { id: "epicEncounter", title: "Epic Encounter", description: "Rolled an Epic soggy cat.", unlocked: false },
  { id: "legendaryMoment", title: "Legendary Moment", description: "Rolled a Legendary soggy cat.", unlocked: false }
);

// New achievement for booster trades
achievements.push({ id: "boosterMaster", title: "Booster Master", description: "Traded for boosters 5 times!", unlocked: false, boosterThreshold: 5 });

// Generate 94 additional Cat Collector achievements (for 20 to 950 cats in steps of 10)
for (let i = 20; i <= 950; i += 10) {
  achievements.push({
    id: "catCollector" + i,
    title: "Soggy Cat Collector - " + i + " Soggy Cats",
    description: "Collected " + i + " soggy cats.",
    unlocked: false,
    threshold: i
  });
}

function displayAchievements() {
  const achievementsList = document.getElementById("achievementsList");
  achievementsList.innerHTML = "";
  achievements.forEach(a => {
    let typeClass = "";
    if (a.id.startsWith("catCollector")) {
      typeClass = "cat";
    } else if (a.id === "boosterStarter" || a.id === "boosterMaster") {
      typeClass = "booster";
    } else {
      typeClass = "roll";
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

  // Helper function to unlock special achievements.
  const unlockIf = (id, condition) => {
    const ach = achievements.find(a => a.id === id);
    if (ach && !ach.unlocked && condition) {
      ach.unlocked = true;
      achievementUnlocked = true;
      newAchievements.push(ach);
    }
  };

  unlockIf("firstCat", inventory.cats >= 1);
  unlockIf("boosterStarter", isTrade);
  if (latestRarity === "Rare") {
    unlockIf("rareCatch", true);
  }
  if (latestRarity === "Epic") {
    unlockIf("epicEncounter", true);
  }
  if (latestRarity === "Legendary") {
    unlockIf("legendaryMoment", true);
  }

  // Unlock cat collector achievements.
  achievements.forEach(a => {
    if (a.threshold && !a.unlocked && inventory.cats >= a.threshold) {
      a.unlocked = true;
      achievementUnlocked = true;
      newAchievements.push(a);
    }
  });
  
  // Unlock booster trade achievements.
  achievements.forEach(a => {
    if (a.boosterThreshold && !a.unlocked && inventory.boosterTrades >= a.boosterThreshold) {
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
      }, index * 1500);
    });
  }
}

// New function to display achievement popup notifications.
function showAchievementPopup(achievement) {
  const popup = document.getElementById("achievementPopup");
  popup.innerHTML = `<strong>Achievement Unlocked!</strong><br><em>${achievement.title}</em><br>${achievement.description}`;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

// Modified Roll for a soggy cat
document.getElementById("rollButton").addEventListener("click", () => {
  if (isCooldown) return;
  isCooldown = true;
  document.getElementById("rollButton").disabled = true;
  
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
  const finalCatNumber = bestRoll;
  const finalRarity = getRarity(finalCatNumber);
  const finalNamesArray = catNames[finalRarity];
  const finalName = finalNamesArray[Math.floor(Math.random() * finalNamesArray.length)];
  
  const catInfoHTML = `<div class="cat-info">
      <p>Name: ${finalName}</p>
      <p>Soggy Cat #: ${finalCatNumber}</p>
      <p>Rarity: ${finalRarity}</p>
    </div>`;
  document.getElementById("catDisplay").innerHTML = catInfoHTML;
  document.getElementById("result").textContent = `You got sog.rng: ${finalName}! (Soggy Cat #${finalCatNumber}, ${finalRarity})`;
  
  inventory.cats++;
  updateInventoryDisplay();
  checkAchievements(finalRarity);
  
  setTimeout(() => {
    isCooldown = false;
    document.getElementById("rollButton").disabled = false;
  }, cooldownDuration);
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

// Set initial inventory display.
updateInventoryDisplay();
displayAchievements();

// Show Early Access Achievement popup on page load.
window.addEventListener("load", () => {
  const earlyAchievement = achievements.find(a => a.id === "earlyAccess");
  if (earlyAchievement) {
    setTimeout(() => {
      showAchievementPopup(earlyAchievement);
    }, 500);
  }
});

// Trade cats for a luck booster.
document.getElementById("tradeButton").addEventListener("click", () => {
  const boosterId = document.getElementById("boosterSelect").value;
  const selectedBooster = BOOSTER_TIERS.find(b => b.id === boosterId);
  if (inventory.cats >= selectedBooster.tradeCost) {
    inventory.cats -= selectedBooster.tradeCost;
    inventory.boosters.push(selectedBooster);
    inventory.boosterTrades++;
    updateInventoryDisplay();
    document.getElementById("result").textContent = `Trade successful! You received a ${selectedBooster.name}.`;
    checkAchievements(null, true);
  } else {
    document.getElementById("result").textContent = `Not enough soggy cats to trade for a ${selectedBooster.name}!`;
  }
});
