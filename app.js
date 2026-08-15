const STORAGE_KEY = "howToDrawState";

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
    els.lessonList.innerHTML = "<p>No lessons match your filters yet.</p>";
    return;
  }

  for (const lesson of state.filteredLessons) {
    const wrapper = document.createElement("article");
    wrapper.className = "lesson-card";
    const done = state.completedLessons.includes(lesson.id) ? "✅" : "";
    const title = document.createElement("h3");
    title.textContent = `${lesson.title} ${done}`.trim();

    const meta = document.createElement("p");
    meta.textContent = `${lesson.category} • ${lesson.difficulty}`;

    const stepCount = document.createElement("p");
    stepCount.textContent = `${lesson.steps.length} steps`;

    const openButton = document.createElement("button");
    openButton.dataset.lessonId = lesson.id;
    openButton.textContent = "Open lesson";

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
    els.lessonTitle.textContent = "Select a lesson";
    els.lessonMeta.textContent = "Pick a lesson to begin.";
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
  els.lessonMeta.textContent = `Category: ${lesson.category} | Difficulty: ${lesson.difficulty}`;
  els.lessonMaterials.textContent = `Materials: ${lesson.materials.join(", ")}`;
  els.lessonTips.textContent = `Practice tip: ${lesson.tips}`;

  if (lesson.referenceImage) {
    els.lessonImage.src = lesson.referenceImage;
    els.lessonImage.alt = `${lesson.title} reference image`;
    els.lessonImage.hidden = false;
  } else {
    els.lessonImage.hidden = true;
  }

  els.lessonSteps.innerHTML = "";
  lesson.steps.forEach((step, index) => {
    const li = document.createElement("li");
    li.textContent = step;
    if (index < currentStep) {
      li.classList.add("completed-step");
      li.setAttribute("aria-description", "completed");
    }
    if (index === currentStep) {
      li.classList.add("current-step");
      li.setAttribute("aria-current", "step");
    }
    els.lessonSteps.appendChild(li);
  });

  const favorite = state.favorites.includes(lesson.id);
  const isCompleted = currentStep >= lesson.steps.length;
  els.favoriteButton.textContent = favorite ? "Remove favorite" : "Add to favorites";
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
  if (count >= 1) badges.push("First Sketch");
  if (count >= 5) badges.push("Practice Builder");
  if (count >= 10) badges.push("Drawing Explorer");
  return badges.length ? badges.join(", ") : "None yet";
}

function nextRecommendation() {
  const unfinished = state.lessons
    .filter((lesson) => !state.completedLessons.includes(lesson.id))
    .sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

  const preferred = unfinished.find((lesson) => state.favorites.includes(lesson.id));
  return (preferred || unfinished[0] || {}).title || "All lessons completed";
}

function renderQuickList(targetEl, ids) {
  if (!ids.length) {
    targetEl.textContent = "None yet";
    return;
  }
  const names = ids
    .map((id) => getLesson(id))
    .filter(Boolean)
    .map((lesson) => lesson.title);
  targetEl.textContent = names.length ? names.join(", ") : "None yet";
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
      throw new Error(`Failed to load lessons (${response.status})`);
    }
    state.lessons = await response.json();
  } catch (error) {
    els.lessonList.textContent = "Could not load lessons. Please refresh and try again.";
    els.lessonMeta.textContent = "Lesson data unavailable.";
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
