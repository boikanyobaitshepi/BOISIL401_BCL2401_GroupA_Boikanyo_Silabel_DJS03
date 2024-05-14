// Importing necessary data and constants from data.js file
import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// Initializing page number and matches array
let page = 1;
let matches = books;

// Function to create HTML elements dynamically
function createHTMLElement(tag, attributes = {}, innerHTML = '') {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  element.innerHTML = innerHTML;
  return element;
}

// Function to populate dropdown options
function populateDropdown(containerSelector, data, firstOption = null) {
  const container = document.querySelector(containerSelector);
  const fragment = document.createDocumentFragment();
  if (firstOption) fragment.appendChild(createHTMLElement('option', { value: firstOption.value }, firstOption.innerText));
  Object.entries(data).forEach(([id, name]) => {
    fragment.appendChild(createHTMLElement('option', { value: id }, name));
  });
  container.appendChild(fragment);
}

// Function to set theme
function setTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--color-dark", theme === 'night' ? '255, 255, 255' : '10, 10, 20');
  root.style.setProperty("--color-light", theme === 'night' ? '10, 10, 20' : '255, 255, 255');
}

// Function to handle search form submission
function handleSearchFormSubmission(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = books.filter(book =>
    (filters.title.trim() === "" || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
    (filters.author === "any" || book.author === filters.author) &&
    (filters.genre === "any" || book.genres.includes(filters.genre))
  );

  page = 1;
  matches = result;

  // Update UI
  updateUI();
}

// Function to update UI
function updateUI() {
  const listItemsContainer = document.querySelector("[data-list-items]");
  listItemsContainer.innerHTML = "";
  const newItems = document.createDocumentFragment();

  matches.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE).forEach(({ author, id, image, title }) => {
    const element = createHTMLElement('button', { class: 'preview', 'data-preview': id });
    element.innerHTML = `
      <img class="preview__image" src="${image}" />
      <div class="preview__info">
        <h3 class="preview__title">${title}</h3>
        <div class="preview__author">${authors[author]}</div>
      </div>`;
    newItems.appendChild(element);
  });

  listItemsContainer.appendChild(newItems);
  const remaining = Math.max(0, matches.length - page * BOOKS_PER_PAGE);
  document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining">${remaining}</span>
  `;
  document.querySelector("[data-list-button]").disabled = remaining <= 0;
}

// Event listeners
document.querySelector("[data-search-form]").addEventListener("submit", handleSearchFormSubmission);

document.querySelector("[data-settings-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme } = Object.fromEntries(formData);
  setTheme(theme);
  document.querySelector("[data-settings-overlay]").open = false;
});

document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

document.querySelector("[data-header-settings]").addEventListener("click", () => {
  document.querySelector("[data-settings-overlay]").open = true;
});

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

document.querySelector("[data-settings-cancel]").addEventListener("click", () => {
  document.querySelector("[data-settings-overlay]").open = false;
});

document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

document.querySelector("[data-list-button]").addEventListener("click", () => {
  page++;
  updateUI();
});

document.querySelector("[data-list-items]").addEventListener("click", (event) => {
  const target = event.target.closest('[data-preview]');
  if (!target) return;
  const active = books.find(book => book.id === target.dataset.preview);
  if (!active) return;
  document.querySelector("[data-list-active]").open = true;
  document.querySelector("[data-list-blur]").src = active.image;
  document.querySelector("[data-list-image]").src = active.image;
  document.querySelector("[data-list-title]").innerText = active.title;
  document.querySelector("[data-list-subtitle]").innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
  document.querySelector("[data-list-description]").innerText = active.description;
});

// Initial setup
populateDropdown("[data-search-genres]", genres, { value: "any", innerText: "All Genres" });
populateDropdown("[data-search-authors]", authors, { value: "any", innerText: "All Authors" });
setTheme(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day");
updateUI();
