/**
 * main.js — Partify Parts Finder
 * Handles cascade dropdown logic and URL redirect.
 */
 
// ── DOM references ────────────────────────────────────────────────────────────
 
const yearSelect      = document.getElementById("select-year");
const makeSelect      = document.getElementById("select-make");
const modelSelect     = document.getElementById("select-model");
const typeSelect      = document.getElementById("select-type");
const searchBtn       = document.getElementById("search-btn");
const actionNote      = document.getElementById("action-note");
 
// ── Helpers ───────────────────────────────────────────────────────────────────
 
/**
 * Populate a select element with an array of option values.
 * Clears existing options first, then appends a placeholder followed by values.
 *
 * @param {HTMLSelectElement} selectEl   - The select element to populate
 * @param {string[]}          options    - Array of option values to add
 * @param {string}            placeholder - Placeholder text for the first option
 */
function populateSelect(selectEl, options, placeholder) {
  selectEl.innerHTML = "";
 
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  selectEl.appendChild(placeholderOption);
 
  options.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
 
  selectEl.disabled = false;
}
 
/**
 * Reset a select element back to a disabled state with a placeholder message.
 *
 * @param {HTMLSelectElement} selectEl   - The select element to reset
 * @param {string}            placeholder - Placeholder text to show
 */
function resetSelect(selectEl, placeholder) {
  selectEl.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  selectEl.disabled = true;
}
 
/**
 * Show a status message below the search button.
 *
 * @param {string}  message  - Message to display
 * @param {boolean} isError  - If true, applies error styling
 */
function setActionNote(message, isError = false) {
  actionNote.textContent = message;
  actionNote.className = isError ? "action-note error" : "action-note";
}

/**
 * Enable or disable the search button based on whether the three
 * required fields (year, make, model) all have a selected value.
 * Product type is optional so it is not checked here.
 */
function updateSearchButton() {
  const ready = yearSelect.value && makeSelect.value && modelSelect.value;
  searchBtn.disabled = !ready;
}

/**
 * Update the step tracker to reflect the current selection state.
 * A step is 'done' when it has a value, 'active' when it is the next
 * step the user should complete, and inactive otherwise.
 */
function updateStepTracker() {
  const steps = document.querySelectorAll(".step");

  // steps[0] = Year, steps[1] = Make, steps[2] = Model, steps[3] = Part
  const values = [yearSelect.value, makeSelect.value, modelSelect.value, typeSelect.value];

  steps.forEach((step, index) => {
    step.classList.remove("active", "done");

    if (values[index]) {
      // This step has a value — mark it done
      step.classList.add("done");
    } else if (index === 0 || values[index - 1]) {
      // This step is empty but the prior step is done mark it active
      step.classList.add("active");
    }
  });
}

 
// ── API calls ─────────────────────────────────────────────────────────────────
 
/**
 * Generic fetch wrapper for API calls.
 * Returns parsed JSON on success, or null on failure.
 *
 * @param {string} url - The API endpoint to fetch
 * @returns {Promise<any|null>}
 */
async function fetchAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    setActionNote("Something went wrong loading options. Please refresh.", true);
    return null;
  }
}
 
// ── Loaders ───────────────────────────────────────────────────────────────────
 
/**
 * Load years from the API and populate the Year dropdown.
 * Called once on page load.
 */
async function loadYears() {
    searchBtn.disabled = true;
    yearSelect.innerHTML = `<option value="" disabled selected>Loading...</option>`;
 
  const years = await fetchAPI("/api/years");
  if (!years) return;
 
  populateSelect(yearSelect, years, "Select year");
}


/**
 * Load makes for the selected year and populate the Make dropdown.
 * Called when the Year dropdown changes.
 */
async function loadMakes() {
  const year = yearSelect.value;
  if (!year) return;
 
  makeSelect.innerHTML = `<option value="" disabled selected>Loading...</option>`;
  makeSelect.disabled = false;
 
  const makes = await fetchAPI(`/api/makes?year=${encodeURIComponent(year)}`);
  if (!makes) return;
 
  populateSelect(makeSelect, makes, "Select make");
}
 
/**
 * Load models for the selected year and make and populate the Model dropdown.
 * Called when the Make dropdown changes.
 */
async function loadModels() {
  const year = yearSelect.value;
  const make = makeSelect.value;
  if (!year || !make) return;
 
  modelSelect.innerHTML = `<option value="" disabled selected>Loading...</option>`;
  modelSelect.disabled = false;
 
  const models = await fetchAPI(`/api/models?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}`);
  if (!models) return;
 
  populateSelect(modelSelect, models, "Select model");
}
 
/**
 * Load product types for the selected year, make, and model and populate
 * the Product Type dropdown. Called when the Model dropdown changes.
 */
async function loadProductTypes() {
  const year  = yearSelect.value;
  const make  = makeSelect.value;
  const model = modelSelect.value;
  if (!year || !make || !model) return;
 
  typeSelect.innerHTML = `<option value="" disabled selected>Loading...</option>`;
  typeSelect.disabled = false;
 
  const types = await fetchAPI(`/api/product-types?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  if (!types) return;
 
  // Product type is optional — prepend an "All parts" option so the user
  // can proceed without selecting a specific type.
  typeSelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All parts";
  typeSelect.appendChild(allOption);
 
  types.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    typeSelect.appendChild(option);
  });
 
  typeSelect.disabled = false;
}


async function triggerSearch() {
  const year  = yearSelect.value;
  const make  = makeSelect.value;
  const model = modelSelect.value;
  const type = typeSelect.value;
  if (!year || !make || !model) return;

  // Disable button and show loading state while fetch is in flight
  searchBtn.disabled = true;
  searchBtn.querySelector(".btn-text").textContent = "Finding parts...";


  if (type) {
    const result = await fetchAPI(`/api/url?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&product_type=${encodeURIComponent(type)}`);
    if (!result) return;
    console.log(result.url);
    window.location.href = result.url;
  }
  else {
    const result = await fetchAPI(`/api/url?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    if (!result) return;
    window.location.href = result.url;
  }
}

 
// ── Event listeners ───────────────────────────────────────────────────────────
 
yearSelect.addEventListener("change", () => {
  // Reset all downstream selects when year changes
  resetSelect(makeSelect,  "Select year first");
  resetSelect(modelSelect, "Select make first");
  resetSelect(typeSelect,  "Select model first");
  searchBtn.disabled = true;
  setActionNote("");
  loadMakes();
  updateStepTracker();
});


makeSelect.addEventListener("change", () => {
  // Reset downstream selects when make changes
  resetSelect(modelSelect, "Select make first");
  resetSelect(typeSelect,  "Select model first");
  searchBtn.disabled = true;
  setActionNote("");
  loadModels();
  updateStepTracker();
});
 
modelSelect.addEventListener("change", () => {
  // Reset product type when model changes
  resetSelect(typeSelect, "Select model first");
  setActionNote("");
  updateSearchButton();
  loadProductTypes();
  updateStepTracker();
});
 
typeSelect.addEventListener("change", () => {
  setActionNote("");
  updateStepTracker();
});

searchBtn.addEventListener("click", () => {
  triggerSearch();
})
 
// Handles both fresh page loads and back-button restores from bfcache.
window.addEventListener("pageshow", () => {
  // Reset all selects to their initial disabled state
  yearSelect.innerHTML = `<option value="" disabled selected>Loading...</option>`;
  resetSelect(makeSelect,  "Select year first");
  resetSelect(modelSelect, "Select make first");
  resetSelect(typeSelect,  "Select model first");

  // Reset search button
  searchBtn.disabled = true;
  searchBtn.querySelector(".btn-text").textContent = "Find My Parts";

  // Reset action note
  setActionNote("");

  // Reset step tracker
  updateStepTracker();

  // Reload years from the API
  loadYears();
});
