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
 
// ── Initialisation ────────────────────────────────────────────────────────────
 
/**
 * Load years from the API and populate the Year dropdown.
 * Called once on page load.
 */
async function loadYears() {
  yearSelect.innerHTML = `<option value="" disabled selected>Loading...</option>`;
 
  const years = await fetchAPI("/api/years");
 
  if (!years) return;
 
  populateSelect(yearSelect, years, "Select year");
}
 
// ── Event listeners ───────────────────────────────────────────────────────────
 
yearSelect.addEventListener("change", () => {
  // Reset all downstream selects when year changes
  resetSelect(makeSelect,  "Select make first");
  resetSelect(modelSelect, "Select make first");
  resetSelect(typeSelect,  "Select model first");
  searchBtn.disabled = true;
  setActionNote("");
});
 
// ── Entry point ───────────────────────────────────────────────────────────────
 
document.addEventListener("DOMContentLoaded", loadYears);
