document.querySelector('.form-login').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const email = document.getElementById('name').value;
    const password = document.getElementById('pass').value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const formData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:5678/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(formData) 
        });

     
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);

            alert("Connexion réussie !");
            
            window.location.href = 'index.html';
        } else {
            
            alert("E-mail ou mot de passe incorrect.");
        }
    } catch (error) {
        console.error('Erreur lors de la tentative de connexion :', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});


function getAuthToken() {
    return localStorage.getItem('authToken');
}


async function fetchWorksWithAuth() {
    const token = getAuthToken();
    if (!token) {
        console.log("Non authentifié. Veuillez vous connecter.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des travaux.');
        }

        const works = await response.json();
        console.log(works);
    } catch (error) {
        console.error(error);
    }
}