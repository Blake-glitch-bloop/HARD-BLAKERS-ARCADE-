const defaultTasks = [
  "Take out the kitchen trash and put a new bag in the bin",
  "Wash every dish that is currently in the sink",
  "Put all dirty clothes on the floor into the laundry basket",
  "Make your bed and put the pillows back in place",
  "Wipe down the bathroom sink and mirror",
  "Pick up and put away 10 items from your bedroom floor",
  "Vacuum or sweep the floor in your bedroom",
  "Fold and put away 5 pieces of clean laundry",
  "Clean the toilet bowl and wipe down the seat",
  "Throw away any empty cups, cans, or wrappers in your room",
  "Fill your water bottle and drink one full glass of water",
  "Brush your teeth for 2 minutes",
  "Take a shower and put on clean clothes",
  "Walk outside for 10 minutes without using your phone",
  "Do 10 squats, 10 arm circles, and a 30-second stretch",
  "Open your inbox and reply to the oldest unanswered message",
  "Set a 15-minute timer and work on the assignment due soonest",
  "Clear your desk except for the items needed for your next task",
  "Read 5 pages of the book you are currently reading",
  "Check tomorrow's calendar and set an alarm for the earliest event",
  "Plug in your phone and laptop so they are charged",
  "Delete 10 screenshots or blurry photos from your phone",
  "Put tomorrow's clothes together and leave them by your bed",
  "Write the first thing you need to do tomorrow on a sticky note"
];

const motivationalQuotes = [
  "You did not wait for motivation. You created it.",
  "Small wins are how big changes begin.",
  "Done is a powerful place to stand.",
  "You kept a promise to yourself today.",
  "One finished task is proof that you can start the next one.",
  "Progress counts, even when it feels small.",
  "You turned a decision into action. That is a win.",
  "Momentum starts with exactly what you just did.",
  "Your future self just got a little more help.",
  "You are building trust in yourself, one task at a time.",
  "The hard part was beginning. Look at you now.",
  "A little effort moved the whole day forward.",
  "You showed up. That matters more than perfection.",
  "This win belongs to you. Keep it.",
  "You made your space, your day, or yourself a little better.",
  "Every completed task makes the next choice easier.",
  "You can do hard things in small, clear steps.",
  "Brandon, you got it done. That is worth celebrating."
];

const clawShop = [
  { id: "standard", name: "Standard Claw", price: 0, description: "The original arcade claw. Always included." },
  { id: "silver", name: "Silver Claw", price: 150, description: "A polished steel finish for clean grabs." },
  { id: "gold", name: "Golden Claw", price: 300, description: "A bright gold finish made for winners." },
  { id: "chrono", name: "Chrono Claw", price: 600, description: "A neon clockwork claw from the future." },
  { id: "time", name: "Time-Bending Claw", price: 750, description: "Special power: grabs two tasks in one round.", doubleGrab: true },
  { id: "glo", name: "Glo-Claw", price: null, description: "Day-seven exclusive. Glows and grabs two tasks.", doubleGrab: true, exclusive: true }
];

const dailyRewards = [
  { label: "50P", icon: "●" },
  { label: "100P", icon: "●" },
  { label: "150P", icon: "●" },
  { label: "200P", icon: "●" },
  { label: "225P", icon: "●" },
  { label: "250P", icon: "●" },
  { label: "Glo-Claw", icon: "★" }
];

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const oldDefaultTasks = [
  "Reply to the most important email",
  "Work for 20 minutes with no distractions",
  "Tidy your workspace",
  "Finish one small thing you've been avoiding",
  "Plan tomorrow's top three priorities",
  "Take a 10-minute movement break",
  "Start the hardest task for just 5 minutes",
  "Organize one messy folder"
];
const savedTasks = readStorage("brandon-tasks", null);
const customTasks = Array.isArray(savedTasks)
  ? savedTasks.filter((task) => !oldDefaultTasks.includes(task) && !defaultTasks.includes(task))
  : [];
const tasks = [...defaultTasks, ...customTasks];

localStorage.setItem("brandon-tasks", JSON.stringify(tasks));
let clawPosition = 50;
let isPlaying = false;
let currentTaskCompleted = false;
let playCount = Number(localStorage.getItem("brandon-plays") || 0);
let points = Math.max(0, Number(localStorage.getItem("brandon-points") || 0));
let ownedClaws = readStorage("brandon-owned-claws", ["standard"]);
let activeClaw = localStorage.getItem("brandon-active-claw") || "standard";
let currentRoundTasks = [];
let activeTaskIndex = 0;
let rewardHasNextTask = false;
let unlockedQuotes = readStorage("brandon-quotes", []);

if (!Array.isArray(unlockedQuotes)) unlockedQuotes = [];
unlockedQuotes = [...new Set(unlockedQuotes)].filter((index) => motivationalQuotes[index]);
if (!Array.isArray(ownedClaws)) ownedClaws = ["standard"];
ownedClaws = [...new Set(["standard", ...ownedClaws])];
if (!ownedClaws.includes(activeClaw)) activeClaw = "standard";

const claw = document.querySelector("#claw");
const capsules = document.querySelector("#capsules");
const glassMessage = document.querySelector("#glassMessage");
const dropBtn = document.querySelector("#dropBtn");
const taskResult = document.querySelector("#taskResult");
const chosenTask = document.querySelector("#chosenTask");
const plays = document.querySelector("#plays");
const taskCount = document.querySelector("#taskCount");
const toast = document.querySelector("#toast");
const quoteCollection = document.querySelector("#quoteCollection");
const quoteGrid = document.querySelector("#quoteGrid");
const quoteProgress = document.querySelector("#quoteProgress");
const rewardOverlay = document.querySelector("#rewardOverlay");
const rewardQuote = document.querySelector("#rewardQuote");
const rewardNumber = document.querySelector("#rewardNumber");
const pointsBalance = document.querySelector("#pointsBalance");
const shelfPoints = document.querySelector("#shelfPoints");
const streakCount = document.querySelector("#streakCount");
const dailyTrack = document.querySelector("#dailyTrack");
const dailyStatus = document.querySelector("#dailyStatus");
const clawGrid = document.querySelector("#clawGrid");
const activeClawLabel = document.querySelector("#activeClawLabel");
const queuedTask = document.querySelector("#queuedTask");
const secondTask = document.querySelector("#secondTask");
const taskOrder = document.querySelector("#taskOrder");
const taskProgress = document.querySelector("#taskProgress");

plays.textContent = playCount;

function drawCapsules() {
  const colors = ["#ff3fac", "#20e5ef", "#8d56ff", "#ff7b42", "#52e176", "#fd5f79", "#53a8ff"];
  const positions = [
    [4, 306, -15], [17, 280, 12], [30, 314, -4], [43, 275, 18],
    [56, 307, -13], [69, 279, 8], [82, 310, 14], [10, 338, 8],
    [26, 343, -16], [47, 338, 8], [65, 342, -5], [79, 346, 17]
  ];
  capsules.innerHTML = positions.map(([left, top, rotation], i) =>
    `<span class="capsule" style="left:${left}%;top:${top}px;--r:${rotation}deg;--cap:${colors[i % colors.length]}"></span>`
  ).join("");
}

function setClawPosition(next) {
  if (isPlaying) return;
  clawPosition = Math.max(10, Math.min(90, next));
  claw.style.left = `${clawPosition}%`;
  glassMessage.classList.add("hidden");
}

function moveClaw(direction) {
  setClawPosition(clawPosition + direction * 8);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveEconomy() {
  localStorage.setItem("brandon-points", String(points));
  localStorage.setItem("brandon-owned-claws", JSON.stringify(ownedClaws));
  localStorage.setItem("brandon-active-claw", activeClaw);
}

function updatePoints() {
  pointsBalance.textContent = points;
  shelfPoints.textContent = points;
  renderClawShelf();
}

function addPoints(amount) {
  points += amount;
  saveEconomy();
  updatePoints();
}

function getClawDetails(id) {
  return clawShop.find((item) => item.id === id) || { id: "standard", name: "Standard Claw" };
}

function applyActiveClaw() {
  claw.className = `claw${activeClaw === "standard" ? "" : ` skin-${activeClaw}`}`;
  activeClawLabel.textContent = getClawDetails(activeClaw).name;
}

function renderClawShelf() {
  if (!clawGrid) return;
  clawGrid.innerHTML = clawShop.map((item) => {
    const owned = ownedClaws.includes(item.id);
    const equipped = activeClaw === item.id;
    const canAfford = item.price !== null && points >= item.price;
    let buttonText = item.exclusive && !owned ? "Day 7 reward" : `${item.price}P · Buy`;
    if (owned) buttonText = equipped ? "Equipped ✓" : "Equip claw";
    return `
      <article class="shop-card${equipped ? " equipped" : ""}${item.exclusive ? " exclusive" : ""}">
        <div class="mini-claw ${item.id}" aria-hidden="true"></div>
        <h3>${item.name}</h3>
        <span class="price">${item.exclusive ? "Streak exclusive" : `${item.price} points`}</span>
        <p>${item.description}</p>
        <button data-claw-id="${item.id}" ${(!owned && (!canAfford || item.exclusive)) ? "disabled" : ""}>${buttonText}</button>
      </article>`;
  }).join("");
}

function handleClawShelfClick(event) {
  const button = event.target.closest("button[data-claw-id]");
  if (!button) return;
  const item = clawShop.find((clawItem) => clawItem.id === button.dataset.clawId);
  if (!item) return;
  if (ownedClaws.includes(item.id)) {
    activeClaw = item.id;
    saveEconomy();
    applyActiveClaw();
    renderClawShelf();
    showToast(`${item.name} equipped!`);
    return;
  }
  if (item.price === null || points < item.price) return;
  points -= item.price;
  ownedClaws.push(item.id);
  activeClaw = item.id;
  saveEconomy();
  updatePoints();
  applyActiveClaw();
  showToast(`${item.name} purchased and equipped!`);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKeyToUtc(key) {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function renderDailyTrack(streakDay) {
  dailyTrack.innerHTML = dailyRewards.map((reward, index) => {
    const day = index + 1;
    const state = day === streakDay ? "claimed" : day < streakDay ? "passed" : "";
    return `
      <div class="day-reward ${state}${day === 7 ? " grand" : ""}">
        <small>Day ${day}</small><span aria-hidden="true">${reward.icon}</span><strong>${reward.label}</strong>
      </div>`;
  }).join("");
}

function claimDailyBonus() {
  const today = localDateKey();
  const lastClaim = localStorage.getItem("brandon-last-daily-claim");
  let streakDay = Math.min(7, Math.max(0, Number(localStorage.getItem("brandon-daily-streak") || 0)));
  let claimedNow = false;

  if (lastClaim !== today) {
    const gap = lastClaim ? Math.round((dateKeyToUtc(today) - dateKeyToUtc(lastClaim)) / 86400000) : null;
    streakDay = gap === 1 ? (streakDay >= 7 ? 1 : streakDay + 1) : 1;
    localStorage.setItem("brandon-last-daily-claim", today);
    localStorage.setItem("brandon-daily-streak", String(streakDay));
    claimedNow = true;

    if (streakDay === 7) {
      if (!ownedClaws.includes("glo")) ownedClaws.push("glo");
      saveEconomy();
    } else {
      addPoints([50, 100, 150, 200, 225, 250][streakDay - 1]);
    }
  }

  streakCount.textContent = streakDay;
  renderDailyTrack(streakDay);
  if (streakDay === 7) {
    dailyStatus.textContent = "Day 7 complete! The exclusive two-task Glo-Claw is now on your shelf.";
  } else {
    dailyStatus.textContent = `Day ${streakDay} collected. Return tomorrow for ${dailyRewards[streakDay].label}; miss a day and the streak resets.`;
  }
  if (claimedNow) {
    const message = streakDay === 7 ? "Daily bonus: Glo-Claw unlocked!" : `Daily bonus: +${dailyRewards[streakDay - 1].label}`;
    setTimeout(() => showToast(message), 350);
  }
  updatePoints();
}

function renderQuoteCollection() {
  quoteCollection.hidden = unlockedQuotes.length === 0;
  quoteProgress.textContent = `${unlockedQuotes.length} / ${motivationalQuotes.length}`;
  quoteGrid.innerHTML = unlockedQuotes.map((index, position) => `
    <article class="quote-card">
      <blockquote>${motivationalQuotes[index]}</blockquote>
      <span>Prize ${String(position + 1).padStart(2, "0")}</span>
    </article>
  `).join("");
}

function unlockMotivationalQuote(hasNextTask = false) {
  const lockedQuotes = motivationalQuotes
    .map((_, index) => index)
    .filter((index) => !unlockedQuotes.includes(index));
  const quoteIndex = lockedQuotes.length
    ? lockedQuotes[Math.floor(Math.random() * lockedQuotes.length)]
    : Math.floor(Math.random() * motivationalQuotes.length);

  if (!unlockedQuotes.includes(quoteIndex)) {
    unlockedQuotes.push(quoteIndex);
    localStorage.setItem("brandon-quotes", JSON.stringify(unlockedQuotes));
  }

  rewardQuote.textContent = motivationalQuotes[quoteIndex];
  rewardNumber.textContent = lockedQuotes.length
    ? `Quote ${unlockedQuotes.length} of ${motivationalQuotes.length} collected`
    : "Collection complete - bonus quote replay";
  rewardHasNextTask = hasNextTask;
  document.querySelector("#closeRewardBtn").textContent = hasNextTask ? "Start task 2" : "See my collection";
  document.querySelector("#nextTaskBtn").textContent = hasNextTask ? "See quote collection" : "Grab another task";
  renderQuoteCollection();
  rewardOverlay.classList.add("open");
  rewardOverlay.setAttribute("aria-hidden", "false");
  document.querySelector("#closeRewardBtn").focus();
}

function closeReward(showCollection = true) {
  rewardOverlay.classList.remove("open");
  rewardOverlay.setAttribute("aria-hidden", "true");
  if (showCollection) {
    setTimeout(() => quoteCollection.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
  }
}

function displayCurrentTask() {
  const totalTasks = currentRoundTasks.length;
  chosenTask.textContent = currentRoundTasks[activeTaskIndex] || "Start the task";
  taskOrder.textContent = totalTasks > 1 ? `Double grab · Task ${activeTaskIndex + 1} of ${totalTasks}` : "The claw has spoken";
  const hasQueuedTask = totalTasks > 1 && activeTaskIndex === 0;
  queuedTask.hidden = !hasQueuedTask;
  if (hasQueuedTask) secondTask.textContent = currentRoundTasks[1];
  taskProgress.textContent = totalTasks > 1
    ? `Finish task ${activeTaskIndex + 1} to earn 50 points${activeTaskIndex === 0 ? ", then do task 2." : "."}`
    : "Complete it to earn 50 points.";
  currentTaskCompleted = false;
  document.querySelector("#doneBtn").textContent = `Finish task${totalTasks > 1 ? ` ${activeTaskIndex + 1}` : ""} · +50P`;
}

function dropClaw() {
  if (isPlaying || !tasks.length) return;
  isPlaying = true;
  dropBtn.disabled = true;
  taskResult.setAttribute("aria-hidden", "true");
  glassMessage.classList.add("hidden");
  claw.classList.add("dropping");

  setTimeout(() => {
    claw.classList.add("grabbing");
    const allCapsules = [...document.querySelectorAll(".capsule")];
    const capsuleIndex = Math.min(allCapsules.length - 1, Math.floor((clawPosition / 100) * allCapsules.length));
    allCapsules[capsuleIndex]?.classList.add("grabbed");
    if (getClawDetails(activeClaw).doubleGrab) allCapsules[(capsuleIndex + 1) % allCapsules.length]?.classList.add("grabbed");
  }, 760);

  setTimeout(() => claw.classList.remove("dropping"), 1150);

  setTimeout(() => {
    const taskIndex = Math.floor((clawPosition / 100) * tasks.length + Math.random() * tasks.length) % tasks.length;
    currentRoundTasks = [tasks[taskIndex]];
    if (getClawDetails(activeClaw).doubleGrab && tasks.length > 1) {
      let secondIndex = Math.floor(Math.random() * tasks.length);
      if (secondIndex === taskIndex) secondIndex = (secondIndex + 1) % tasks.length;
      currentRoundTasks.push(tasks[secondIndex]);
    }
    activeTaskIndex = 0;
    displayCurrentTask();
    playCount += 1;
    plays.textContent = playCount;
    localStorage.setItem("brandon-plays", playCount);
    taskResult.setAttribute("aria-hidden", "false");
    claw.classList.remove("grabbing");
    isPlaying = false;
    dropBtn.disabled = false;
    setTimeout(drawCapsules, 250);
    taskResult.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 2050);
}

document.querySelector("#leftBtn").addEventListener("click", () => moveClaw(-1));
document.querySelector("#rightBtn").addEventListener("click", () => moveClaw(1));
dropBtn.addEventListener("click", dropClaw);
document.querySelector("#againBtn").addEventListener("click", () => {
  taskResult.setAttribute("aria-hidden", "true");
  document.querySelector("#machine").scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(dropClaw, 450);
});
document.querySelector("#doneBtn").addEventListener("click", () => {
  if (currentTaskCompleted) {
    showToast("This task is already in the win column!");
    return;
  }
  currentTaskCompleted = true;
  addPoints(50);
  document.querySelector("#doneBtn").textContent = "Completed! +50P ✓";
  const hasNextTask = activeTaskIndex < currentRoundTasks.length - 1;
  if (hasNextTask) {
    activeTaskIndex += 1;
    displayCurrentTask();
  }
  unlockMotivationalQuote(hasNextTask);
});
document.querySelector("#closeRewardBtn").addEventListener("click", () => {
  closeReward(!rewardHasNextTask);
  if (rewardHasNextTask) setTimeout(() => taskResult.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
});
document.querySelector("#nextTaskBtn").addEventListener("click", () => {
  if (rewardHasNextTask) {
    closeReward(true);
    return;
  }
  closeReward(false);
  taskResult.setAttribute("aria-hidden", "true");
  document.querySelector("#machine").scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(dropClaw, 450);
});
rewardOverlay.addEventListener("click", (event) => {
  if (event.target === rewardOverlay) closeReward(!rewardHasNextTask);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && rewardOverlay.classList.contains("open")) {
    closeReward(!rewardHasNextTask);
    return;
  }
  if (document.activeElement.tagName === "INPUT") return;
  if (["ArrowLeft", "a", "A"].includes(event.key)) moveClaw(-1);
  if (["ArrowRight", "d", "D"].includes(event.key)) moveClaw(1);
  if (event.code === "Space") {
    event.preventDefault();
    dropClaw();
  }
});

document.querySelector("#taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#taskInput");
  const newTask = input.value.trim();
  if (!newTask) return;
  tasks.push(newTask);
  localStorage.setItem("brandon-tasks", JSON.stringify(tasks));
  taskCount.textContent = `${tasks.length} tasks loaded`;
  input.value = "";
  showToast("Task loaded into the machine!");
});

clawGrid.addEventListener("click", handleClawShelfClick);

taskCount.textContent = `${tasks.length} tasks loaded`;
drawCapsules();
renderQuoteCollection();
applyActiveClaw();
updatePoints();
claimDailyBonus();
