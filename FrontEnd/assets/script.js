async function fetchWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        const works = await response.json();
        return works;
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux :', error);
    }
}

function displayGallery(works) {
    const gallery = document.querySelector('.gallery');

    gallery.innerHTML = '';

  
    works.forEach(work => {
        const figure = document.createElement('figure');


        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title; 
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title; 
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const works = await fetchWorks();
    if (works) {
        displayGallery(works); 
    }
});