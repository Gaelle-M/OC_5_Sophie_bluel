let modal = null
const focusableSelector = 'button, a, input, textarea'
let focusables = []

const openModal = function (e) {
    e.preventDefault()
    modal = document.querySelector(e.target.getAttribute('href'))
    focusables = Array.from(modal.querySelectorAll(focusableSelector))
    modal.style.display = null
    modal.removeAttribute('aria-hidden')
    modal.setAttribute('aria-modal', 'true')
    modal.addEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)
}

const closeModal = function (e) {
    if (modal === null) return
    e.preventDefault()
    modal.style.display = "none"
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)
    modal = null
}

const stopPropagation = function (e) {
    e.stopPropagation()
}

const focusInModal = function (e) {
  e.preventDefault()
  let index = focusables.findIndex(f => f === modal.querySelector(':focus'))
  index++
  if ( index >= focusables.length) {
    index = 0
  }
  focusables[index].focus()
}

document.querySelectorAll('.js-modal').forEach(a => {
    a.addEventListener('click', openModal)
})

window.addEventListener('keydown', function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e)
  }
  if (e.key === 'Tab' && modal !== null) {
    focusInModal(e)
  }
})

//Récupère les travaux dans l'API
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`);
    }
    const works = await response.json();
    return works;
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
}

//Récupère les catégories dans l'API
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
    }
    const categories = await response.json();
    displayCategories(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    alert(
      "Impossible de récupérer les catégories. Vérifiez que le serveur est en cours de fonctionnement."
    );
  }
}

//Fonction pour afficher la gallery
function displayGallery(works) {
  const gallery = document.querySelector(".gallery");

  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;
    figure.appendChild(figcaption);

    gallery.appendChild(figure);
  });
}

function displayCategories(categories) {
  const categoryContainer = document.querySelector(".categories");

  categoryContainer.innerHTML = "";

  // Bouton "tous"
  const allCategoriesButton = document.createElement("button");
  allCategoriesButton.textContent = "Tous";
  allCategoriesButton.classList.add("category-button");
  allCategoriesButton.addEventListener("click", () =>
    filterGalleryByCategory(0)
  );
  categoryContainer.appendChild(allCategoriesButton);

  // Les autres boutons
  categories.forEach((category) => {
    const categoryElement = document.createElement("button");
    categoryElement.textContent = category.name;
    categoryElement.dataset.id = category.id;
    categoryElement.classList.add("category-button");

    categoryElement.addEventListener("click", () =>
      filterGalleryByCategory(category.id)
    );
    categoryContainer.appendChild(categoryElement);
  });
}

//Fonction pour filtrer les images
function filterGalleryByCategory(categoryId) {
  fetchWorks().then((works) => {
    const filteredWorks =
      categoryId === 0
        ? works
        : works.filter((work) => work.categoryId === categoryId);

    displayGallery(filteredWorks);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const works = await fetchWorks();
  if (works) {
    displayGallery(works);
  }

  fetchCategories();
});
