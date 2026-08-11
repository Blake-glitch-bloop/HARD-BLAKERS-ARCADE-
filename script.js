const defaultTasks = [
  "Reply to the most important email",
  "Work for 20 minutes with no distractions",
  "Tidy your workspace",
  "Finish one small thing you've been avoiding",
  "Plan tomorrow's top three priorities",
  "Take a 10-minute movement break",
  "Start the hardest task for just 5 minutes",
  "Organize one messy folder"
];

const savedTasks = JSON.parse(localStorage.getItem("brandon-tasks") || "null");
const tasks = Array.isArray(savedTasks) && savedTasks.length ? savedTasks : [...defaultTasks];
let clawPosition = 50;
let isPlaying = false;
let playCount = Number(localStorage.getItem("brandon-plays") || 0);

const claw = document.querySelector("#claw");
const capsules = document.querySelector("#capsules");
const glassMessage = document.querySelector("#glassMessage");
const dropBtn = document.querySelector("#dropBtn");
const taskResult = document.querySelector("#taskResult");
const chosenTask = document.querySelector("#chosenTask");
const plays = document.querySelector("#plays");
const taskCount = document.querySelector("#taskCount");
const toast = document.querySelector("#toast");

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
  }, 760);

  setTimeout(() => claw.classList.remove("dropping"), 1150);

  setTimeout(() => {
    const taskIndex = Math.floor((clawPosition / 100) * tasks.length + Math.random() * tasks.length) % tasks.length;
    chosenTask.textContent = tasks[taskIndex];
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
  document.querySelector("#doneBtn").textContent = "Nice work! ✓";
  showToast("Task complete — prize earned!");
  setTimeout(() => document.querySelector("#doneBtn").textContent = "Mark it done", 2200);
});

document.addEventListener("keydown", (event) => {
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

taskCount.textContent = `${tasks.length} tasks loaded`;
drawCapsules();
