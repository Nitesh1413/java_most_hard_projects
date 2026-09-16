const projects = window.PROJECTS || [];
const DONE_KEY = "java_apex_extreme_done";
const THEME_KEY = "java_apex_extreme_theme";
const $ = id => document.getElementById(id);

let completed = new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]"));
let currentId = null;

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

function saveCompleted(){
  localStorage.setItem(DONE_KEY, JSON.stringify([...completed].sort((a,b)=>a-b)));
  updateProgress();
}

function setTheme(theme){
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  $("themeBtn").textContent = theme === "dark" ? "☀" : "☾";
}

setTheme(localStorage.getItem(THEME_KEY) || "light");

function updateProgress(){
  $("progress").textContent = `${completed.size}/${projects.length}`;
}

function renderList(){
  const query = $("search").value.trim().toLowerCase();
  const visible = projects.filter(p =>
    !query ||
    `${p.name} ${p.real_value} ${p.hard_core} ${p.focus} ${p.topics.join(" ")}`
      .toLowerCase()
      .includes(query)
  );

  $("projectList").innerHTML = visible.map(p => `
    <button class="row ${p.id === currentId ? "active" : ""}" onclick="openProject(${p.id})">
      <span class="row-num">${String(p.id).padStart(2,"0")}</span>
      <span class="row-name">${escapeHtml(p.name)}</span>
      ${completed.has(p.id) ? '<span class="tick">✓</span>' : ''}
    </button>
  `).join("");

  updateProgress();
}

function openProject(id){
  const p = projects.find(x => x.id === id);
  if(!p) return;
  currentId = id;

  $("home").classList.add("hidden");
  $("projectView").classList.remove("hidden");

  $("projectNumber").textContent = `Project ${p.id} of ${projects.length}`;
  $("projectFocus").textContent = p.focus;
  $("projectTitle").textContent = p.name;
  $("projectValue").textContent = "Real-world value: " + p.real_value;
  $("projectHardCore").textContent = "Hard core: " + p.hard_core;

  $("topicCount").textContent = `${p.topics.length} topics`;
  $("stepCount").textContent = `${p.steps.length} steps`;

  $("topics").innerHTML = p.topics
    .map(t => `<span class="chip">${escapeHtml(t)}</span>`).join("");

  $("manual").innerHTML = p.steps
    .map((s,i) => `
      <div class="step">
        <div class="step-num">${i+1}</div>
        <div>
          <div class="step-task">${escapeHtml(s[0])}</div>
          <div class="step-learn">Learn: ${escapeHtml(s[1])}</div>
        </div>
      </div>
    `).join("");

  $("tests").innerHTML = p.tests
    .map((t,i) => `
      <div class="test">
        <div class="test-title">Test ${i+1} — ${escapeHtml(t.name)}</div>
        <div class="test-purpose">${escapeHtml(t.purpose)}</div>
      </div>
    `).join("");

  const isDone = completed.has(id);
  $("completion").innerHTML = isDone ? '<div class="badge">✓ Project completed</div>' : "";
  $("completeBtn").disabled = isDone;

  const index = projects.findIndex(x => x.id === id);
  $("prevBtn").disabled = index === 0;
  $("nextBtn").disabled = index === projects.length - 1;

  renderList();
  window.scrollTo({top:0, behavior:"smooth"});
}

$("search").addEventListener("input", renderList);
$("themeBtn").addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

$("completeBtn").addEventListener("click", () => {
  if(currentId == null) return;
  completed.add(currentId);
  saveCompleted();
  openProject(currentId);
});

$("clearBtn").addEventListener("click", () => {
  if(currentId == null) return;
  completed.delete(currentId);
  saveCompleted();
  openProject(currentId);
});

$("prevBtn").addEventListener("click", () => {
  const index = projects.findIndex(x => x.id === currentId);
  if(index > 0) openProject(projects[index-1].id);
});

$("nextBtn").addEventListener("click", () => {
  const index = projects.findIndex(x => x.id === currentId);
  if(index < projects.length-1) openProject(projects[index+1].id);
});

renderList();
