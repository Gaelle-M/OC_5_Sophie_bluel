let modal = null;

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.target.getAttribute("href"));
  modal.style.display = null;
  modal.removeAttribute("inert");
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation);
};

const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();

  document.querySelector(".js-modal").focus();

  modal.style.display = "none";
  modal.setAttribute("inert", "true");
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-close")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
});

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
    figure.setAttribute("data-id", work.id); 

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

//Fonction gallerie modal
function displayModalGallery(works) {
  const gallery = document.querySelector(".container-photo");

  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.style.position = "relative"; 
    figure.setAttribute("data-id", work.id); 

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);

    // Ajout du bouton poubelle 
    const deleteButton = document.createElement("button-trash");
    deleteButton.classList.add("delete-photo");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.setAttribute("aria-label", `Supprimer ${work.title}`);
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "10px";
    deleteButton.style.right = "10px";

    deleteButton.addEventListener("click", () => {
      console.log(`Demande de suppression pour l'image avec l'ID : ${work.id}`);
      deletePhoto(work.id);
    });

    figure.appendChild(deleteButton);
    gallery.appendChild(figure);
  });
}

async function deletePhoto(photoId) {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    alert("Vous devez être connecté pour supprimer une photo.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`);
    }

    // Suppression dans la modal
    const modalFigure = document.querySelector(`.container-photo figure[data-id="${photoId}"]`);
    if (modalFigure) {
      modalFigure.remove();
    }

    // Suppression dans la galerie principale
    const galleryFigure = document.querySelector(`.gallery figure[data-id="${photoId}"]`);
    if (galleryFigure) {
      galleryFigure.remove();
    }

    console.log(`Photo avec l'ID ${photoId} supprimée avec succès.`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la photo :", error);
    alert("Impossible de supprimer la photo.");
  }
}

// Fonction pour afficher les catégories
function displayCategories(categories) {
  const categoryContainer = document.querySelector(".categories");

  if (!categoryContainer) {
    console.error("Le conteneur des catégories est introuvable!");
    return;
  }

  const token = sessionStorage.getItem("authToken");
  if (token) {
    categoryContainer.style.display = "none";
    return;
  }

  categoryContainer.innerHTML = "";

  // Bouton "tous"
  const allCategoriesButton = document.createElement("button");
  allCategoriesButton.textContent = "Tous";
  allCategoriesButton.classList.add("category-button");
  allCategoriesButton.classList.add("selected");
  allCategoriesButton.dataset.id = 0;
  allCategoriesButton.addEventListener("click", (event) => {
    document.querySelectorAll(".category-button").forEach((button) => {
      button.classList.remove("selected");
    });
  
    allCategoriesButton.classList.add("selected");
    filterGalleryByCategory(0, event.target);
  });
  categoryContainer.appendChild(allCategoriesButton);

  // Les autres boutons
  categories.forEach((category) => {
    const categoryElement = document.createElement("button");
    categoryElement.textContent = category.name;
    categoryElement.classList.add("category-button");
    categoryElement.dataset.id = category.id;

    categoryElement.addEventListener("click", (event) => {
      document.querySelectorAll(".category-button").forEach((button) => {
        button.classList.remove("selected");
      });
    
      categoryElement.classList.add("selected")
      filterGalleryByCategory(category.id, event.target);
    });
    categoryContainer.appendChild(categoryElement);
  });
}

// Fonction pour filtrer les images par catégorie
function filterGalleryByCategory(categoryId) {
  console.log(`Filtrage pour la catégorie avec id: ${categoryId}`);

 
  const filteredWorks =
    categoryId === 0
      ? works
      : works.filter((work) => work.categoryId === categoryId);

  document.querySelectorAll(".category-button").forEach((button) => {
    button.classList.remove("selected");
  });


  displayGallery(filteredWorks);
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

// Gestion de la première modal
document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

// Gestion de la seconde modal
document.getElementById("open-add-photo-modal").addEventListener("click", (e) => {
  e.preventDefault();

  // Fermer la première modal
  closeModal(e);

  // Ouvrir la seconde modal
  modal = document.getElementById("modal2");
  modal.style.display = null;
  modal.removeAttribute("inert");
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");

  // Attacher l'événement pour fermer la seconde modal
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
});

//************************************ */
document.getElementById("open-add-photo-modal").addEventListener("click", (e) => {
  e.preventDefault();
  openSecondModal();  
});

/* *** Recupère les catégories modal 2*** */
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
    }
    const categories = await response.json();
    
    // Appel de la fonction pour injecter les catégories dans le formulaire
    populateCategorySelect(categories);

  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    alert(
      "Impossible de récupérer les catégories. Vérifiez que le serveur est en cours de fonctionnement."
    );
  }
}

// Fonction pour injecter les catégories dans le champ select du formulaire
function populateCategorySelect(categories) {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = ""; 

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Sélectionner une catégorie";
  defaultOption.value = "";
  categorySelect.appendChild(defaultOption);

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id; 
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", fetchCategories);

document.addEventListener("DOMContentLoaded", async () => {
  const works = await fetchWorks();
  if (works) {
    displayGallery(works);
    displayModalGallery(works);
  }

  fetchCategories();
});