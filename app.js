const STORAGE_KEY = "howToDrawState";
const CATEGORY_LABELS = {
  faces: "Gezichten",
  characters: "Personages",
  scenes: "Scènes",
};
const DIFFICULTY_LABELS = {
  easy: "Makkelijk",
  medium: "Gemiddeld",
  hard: "Moeilijk",
};

const state = {
  lessons: [],
  filteredLessons: [],
  selectedLessonId: null,
  stepProgress: {},
  completedLessons: [],
  favorites: [],
  recentlyViewed: [],
  streak: { count: 0, lastDate: null },
};

const els = {
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  difficultyFilter: document.getElementById("difficultyFilter"),
  lessonList: document.getElementById("lessonList"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonMeta: document.getElementById("lessonMeta"),
  lessonMaterials: document.getElementById("lessonMaterials"),
  lessonImage: document.getElementById("lessonImage"),
  lessonSteps: document.getElementById("lessonSteps"),
  lessonTips: document.getElementById("lessonTips"),
  favoriteButton: document.getElementById("favoriteButton"),
  completeStepButton: document.getElementById("completeStepButton"),
  completeLessonButton: document.getElementById("completeLessonButton"),
  completedCount: document.getElementById("completedCount"),
  streakCount: document.getElementById("streakCount"),
  badgeList: document.getElementById("badgeList"),
  recommendation: document.getElementById("recommendation"),
  favoritesList: document.getElementById("favoritesList"),
  recentList: document.getElementById("recentList"),
};

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.stepProgress = saved.stepProgress || {};
    state.completedLessons = saved.completedLessons || [];
    state.favorites = saved.favorites || [];
    state.recentlyViewed = saved.recentlyViewed || [];
    state.streak = saved.streak || { count: 0, lastDate: null };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      stepProgress: state.stepProgress,
      completedLessons: state.completedLessons,
      favorites: state.favorites,
      recentlyViewed: state.recentlyViewed,
      streak: state.streak,
    }),
  );
}

function getLesson(id) {
  return state.lessons.find((lesson) => lesson.id === id);
}

function applyFilters() {
  const query = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const difficulty = els.difficultyFilter.value;

  state.filteredLessons = state.lessons.filter((lesson) => {
    const matchesQuery =
      !query ||
      lesson.title.toLowerCase().includes(query) ||
      lesson.category.toLowerCase().includes(query) ||
      lesson.tips.toLowerCase().includes(query);
    const matchesCategory = category === "all" || lesson.category === category;
    const matchesDifficulty = difficulty === "all" || lesson.difficulty === difficulty;
    return matchesQuery && matchesCategory && matchesDifficulty;
  });
}

function renderLessonList() {
  els.lessonList.innerHTML = "";
  if (state.filteredLessons.length === 0) {
    els.lessonList.innerHTML = "<p>Er zijn nog geen lessen die bij je filters passen.</p>";
    return;
  }

  function stepVisualMarkup(instruction, stepNumber) {
    const text = instruction.toLowerCase();
    const hasEye = text.includes("oog") || text.includes("iris") || text.includes("wimper");
    const hasHair = text.includes("haar") || text.includes("pony") || text.includes("pluk");
    const hasAction =
      text.includes("actie") ||
      text.includes("beweging") ||
      text.includes("uitbarsting") ||
      text.includes("impact") ||
      text.includes("lijn");
    const hasBody = text.includes("lichaam") || text.includes("arm") || text.includes("been") || text.includes("houding");
    const STEP_ACCENT_COLUMNS = 5;
    const STEP_ACCENT_START_X = 16;
    const STEP_ACCENT_GAP_X = 32;
    const accentX = STEP_ACCENT_START_X + ((stepNumber - 1) % STEP_ACCENT_COLUMNS) * STEP_ACCENT_GAP_X;
    const withAccent = (base) => `${base}<circle cx="${accentX}" cy="20" r="4" fill="#7c2d12"/>`;

    if (hasEye) {
      return withAccent(`
        <ellipse cx="88" cy="56" rx="46" ry="24" fill="none" stroke="#222" stroke-width="3"/>
        <circle cx="88" cy="56" r="14" fill="none" stroke="#222" stroke-width="3"/>
        <path d="M42 56 Q88 20 134 56" fill="none" stroke="#222" stroke-width="4"/>
        <circle cx="82" cy="50" r="5" fill="#fff"/>`);
    }

    if (hasHair) {
      return withAccent(`
        <path d="M30 30 Q88 18 146 30" fill="#e5e7eb" stroke="none"/>
        <path d="M30 30 Q88 8 146 30" fill="none" stroke="#222" stroke-width="3"/>
        <path d="M38 34 L54 88 L68 42 L82 94 L98 42 L114 88 L130 36" fill="none" stroke="#222" stroke-width="3"/>
        `);
    }

    if (hasAction) {
      return withAccent(`
        <circle cx="88" cy="56" r="10" fill="#222"/>
        <path d="M88 56 L10 16 M88 56 L18 56 M88 56 L10 98 M88 56 L166 16 M88 56 L158 56 M88 56 L166 98" stroke="#222" stroke-width="3"/>
        <path d="M88 56 L40 8 M88 56 L136 8 M88 56 L40 104 M88 56 L136 104" stroke="#222" stroke-width="2"/>`);
    }

    if (hasBody) {
      return withAccent(`
        <circle cx="88" cy="24" r="14" fill="none" stroke="#222" stroke-width="3"/>
        <path d="M88 38 L88 78 M88 48 L56 64 M88 48 L120 64 M88 78 L62 104 M88 78 L114 102" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>`);
    }

    return withAccent(`
      <rect x="28" y="20" width="120" height="72" rx="10" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M36 82 L64 52 L86 66 L112 38 L140 62" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>
      <circle cx="58" cy="40" r="6" fill="none" stroke="#222" stroke-width="2"/>`);
  }

  function escapeXml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function generateStepVisual(stepInstruction, stepNumber) {
    const label = escapeXml(`STAP ${stepNumber}`);
    const body = stepVisualMarkup(stepInstruction, stepNumber);
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 176 112">
        <rect width="176" height="112" rx="12" fill="#fff7ed" stroke="#f59e0b" stroke-width="2"/>
        ${body}
        <text x="10" y="106" font-family="Arial, sans-serif" font-size="12" fill="#7c2d12">${label}</text>
      </svg>`,
    )}`;
  }

  for (const lesson of state.filteredLessons) {
    const wrapper = document.createElement("article");
    wrapper.className = "lesson-card";
    const done = state.completedLessons.includes(lesson.id) ? "✅" : "";
    const title = document.createElement("h3");
    title.textContent = `${lesson.title} ${done}`.trim();

    const meta = document.createElement("p");
    meta.textContent = `${CATEGORY_LABELS[lesson.category] || lesson.category} • ${DIFFICULTY_LABELS[lesson.difficulty] || lesson.difficulty}`;

    const stepCount = document.createElement("p");
    stepCount.textContent = `${lesson.steps.length} stappen`;

    const openButton = document.createElement("button");
    openButton.dataset.lessonId = lesson.id;
    openButton.textContent = "Les openen";

    wrapper.appendChild(title);
    wrapper.appendChild(meta);
    wrapper.appendChild(stepCount);
    wrapper.appendChild(openButton);
    els.lessonList.appendChild(wrapper);
  }
}

function updateRecentlyViewed(lessonId) {
  state.recentlyViewed = [lessonId, ...state.recentlyViewed.filter((id) => id !== lessonId)].slice(0, 5);
}

function selectLesson(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;

  state.selectedLessonId = lessonId;
  state.stepProgress[lessonId] = state.stepProgress[lessonId] || 0;
  updateRecentlyViewed(lessonId);
  persistState();
  renderSelectedLesson();
  renderSummary();
}

function renderSelectedLesson() {
  const lesson = getLesson(state.selectedLessonId);
  if (!lesson) {
    els.lessonTitle.textContent = "Kies een les";
    els.lessonMeta.textContent = "Kies een les om te beginnen.";
    els.lessonMaterials.textContent = "";
    els.lessonSteps.innerHTML = "";
    els.lessonTips.textContent = "";
    els.lessonImage.hidden = true;
    els.favoriteButton.disabled = true;
    els.completeStepButton.disabled = true;
    els.completeLessonButton.disabled = true;
    return;
  }

  const currentStep = state.stepProgress[lesson.id] || 0;
  els.lessonTitle.textContent = lesson.title;
  els.lessonMeta.textContent = `Categorie: ${CATEGORY_LABELS[lesson.category] || lesson.category} | Moeilijkheid: ${DIFFICULTY_LABELS[lesson.difficulty] || lesson.difficulty}`;
  els.lessonMaterials.textContent = `Materialen: ${lesson.materials.join(", ")}`;
  els.lessonTips.textContent = `Tekentip: ${lesson.tips}`;

  if (lesson.referenceImage) {
    els.lessonImage.src = lesson.referenceImage;
    els.lessonImage.alt = `${lesson.title} referentieafbeelding`;
    els.lessonImage.hidden = false;
  } else {
    els.lessonImage.hidden = true;
  }

  els.lessonSteps.innerHTML = "";
  lesson.steps.forEach((step, index) => {
    const instruction = String(step);
    const visualImage = generateStepVisual(instruction, index + 1);
    const li = document.createElement("li");
    const card = document.createElement("div");
    card.className = "step-card";
    const img = document.createElement("img");
    img.className = "step-visual";
    img.src = visualImage;
    img.alt = `Stap ${index + 1}: ${instruction}`;
    img.width = 176;
    img.height = 112;
    const text = document.createElement("p");
    text.textContent = instruction;
    card.appendChild(img);
    card.appendChild(text);
    li.appendChild(card);
    if (index < currentStep) {
      li.classList.add("completed-step");
      li.setAttribute("aria-description", "voltooid");
    }
    if (index === currentStep) {
      li.classList.add("current-step");
      li.setAttribute("aria-current", "step");
    }
    els.lessonSteps.appendChild(li);
  });

  const favorite = state.favorites.includes(lesson.id);
  const isCompleted = currentStep >= lesson.steps.length;
  els.favoriteButton.textContent = favorite ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten";
  els.favoriteButton.disabled = false;
  els.completeStepButton.disabled = isCompleted;
  els.completeLessonButton.disabled = isCompleted;
}

function markStepComplete() {
  const lesson = getLesson(state.selectedLessonId);
  if (!lesson) return;

  const current = state.stepProgress[lesson.id] || 0;
  state.stepProgress[lesson.id] = Math.min(current + 1, lesson.steps.length);

  if (state.stepProgress[lesson.id] === lesson.steps.length) {
    completeLesson();
    return;
  }

  persistState();
  renderSelectedLesson();
}

function updateStreak() {
  const formatLocalDate = (date) =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

  const now = new Date();
  const today = formatLocalDate(now);
  const previousDate = new Date(now);
  previousDate.setDate(previousDate.getDate() - 1);
  const yesterday = formatLocalDate(previousDate);

  if (state.streak.lastDate === today) return;
  if (state.streak.lastDate === yesterday) {
    state.streak.count += 1;
  } else {
    state.streak.count = 1;
  }
  state.streak.lastDate = today;
}

function completeLesson() {
  const lesson = getLesson(state.selectedLessonId);
  if (!lesson) return;

  state.stepProgress[lesson.id] = lesson.steps.length;
  if (!state.completedLessons.includes(lesson.id)) {
    state.completedLessons.push(lesson.id);
    updateStreak();
  }

  persistState();
  applyFilters();
  renderLessonList();
  renderSelectedLesson();
  renderSummary();
}

function toggleFavorite() {
  const lessonId = state.selectedLessonId;
  if (!lessonId) return;

  if (state.favorites.includes(lessonId)) {
    state.favorites = state.favorites.filter((id) => id !== lessonId);
  } else {
    state.favorites.push(lessonId);
  }

  persistState();
  renderSelectedLesson();
  renderSummary();
}

function badgeText() {
  const count = state.completedLessons.length;
  const badges = [];
  if (count >= 1) badges.push("Eerste schets");
  if (count >= 5) badges.push("Oefenbouwer");
  if (count >= 10) badges.push("Tekenverkenner");
  return badges.length ? badges.join(", ") : "Nog geen";
}

function nextRecommendation() {
  const unfinished = state.lessons
    .filter((lesson) => !state.completedLessons.includes(lesson.id))
    .sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const preferred = unfinished.find((lesson) => state.favorites.includes(lesson.id));
  return (preferred || unfinished[0] || {}).title || "Alle lessen voltooid";
}

function renderQuickList(targetEl, ids) {
  if (!ids.length) {
    targetEl.textContent = "Nog geen";
    return;
  }
  const names = ids
    .map((id) => getLesson(id))
    .filter(Boolean)
    .map((lesson) => lesson.title);
  targetEl.textContent = names.length ? names.join(", ") : "Nog geen";
}

function renderSummary() {
  els.completedCount.textContent = String(state.completedLessons.length);
  els.streakCount.textContent = String(state.streak.count);
  els.badgeList.textContent = badgeText();
  els.recommendation.textContent = nextRecommendation();
  renderQuickList(els.favoritesList, state.favorites);
  renderQuickList(els.recentList, state.recentlyViewed);
}

function wireEvents() {
  const rerenderFilteredLessons = () => {
    applyFilters();
    renderLessonList();
  };

  els.searchInput.addEventListener("input", rerenderFilteredLessons);

  [els.categoryFilter, els.difficultyFilter].forEach((select) => {
    select.addEventListener("change", rerenderFilteredLessons);
  });
  els.lessonList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lesson-id]");
    if (!button) return;
    selectLesson(button.dataset.lessonId);
  });

  els.completeStepButton.addEventListener("click", markStepComplete);
  els.completeLessonButton.addEventListener("click", completeLesson);
  els.favoriteButton.addEventListener("click", toggleFavorite);
}

async function init() {
  loadStoredState();
  try {
    const response = await fetch("/data/lessons.json");
    if (!response.ok) {
      throw new Error(`Lessen konden niet worden geladen (${response.status})`);
    }
    state.lessons = await response.json();
  } catch (error) {
    els.lessonList.textContent = "Lessen konden niet worden geladen. Vernieuw de pagina en probeer het opnieuw.";
    els.lessonMeta.textContent = "Lesgegevens niet beschikbaar.";
    console.error(error);
    return;
  }
  applyFilters();
  renderLessonList();
  renderSelectedLesson();
  renderSummary();
  wireEvents();
}

init();
