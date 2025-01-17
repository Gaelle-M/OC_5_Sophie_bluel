function getAuthToken() {
    return sessionStorage.getItem('authToken');
}

function updateUIBasedOnAuth() {
    const token = getAuthToken();

    const authLink = document.getElementById('auth-link');
    if (authLink) {
        if (token) {
            authLink.innerHTML = '<li>log out</li>';
            authLink.href = '#';
            authLink.addEventListener('click', function (event) {
                event.preventDefault();
                sessionStorage.removeItem('authToken');
               
                window.location.href = 'index.html'; 
            });
        } else {
            authLink.innerHTML = '<li>login</li>';
            authLink.href = './login.html'; 
        }
    }

    const editLink = document.getElementById('edit-link');
    if (editLink) {
        editLink.style.display = token ? 'inline-block' : 'none'; 
    }

    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
        categoriesSection.style.display = token ? 'none' : 'block'; 
    }

    const editModeBanner = document.getElementById('edit-mode-banner');
    if (editModeBanner) {
        editModeBanner.style.display = token ? 'block' : 'none'; 
    }
}

document.addEventListener('DOMContentLoaded', function () {
    updateUIBasedOnAuth();

    const token = getAuthToken();
    if (token) {
       
        let editModeBanner = document.getElementById('edit-mode-banner');
        
       
        if (!editModeBanner) {
            editModeBanner = document.createElement('div');
            editModeBanner.id = 'edit-mode-banner';
            editModeBanner.style.backgroundColor = 'black';
            editModeBanner.style.color = 'white';
            editModeBanner.style.padding = '10px';
            editModeBanner.style.textAlign = 'center';
            editModeBanner.style.display = 'flex';
            editModeBanner.style.alignItems = 'center';
            editModeBanner.style.justifyContent = 'center';
            editModeBanner.style.gap = '10px';  

            const icon = document.createElement('i');
            icon.classList.add('fa-regular', 'fa-pen-to-square'); 
            icon.style.fontSize = '16px'; 

            editModeBanner.appendChild(icon);
            editModeBanner.appendChild(document.createTextNode('Mode édition'));

            
            document.body.insertBefore(editModeBanner, document.body.firstChild);
        }

        editModeBanner.style.display = 'flex';
    }
});


document.querySelector('.form-login').addEventListener('submit', async function (event) {
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
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }

        const data = await response.json();
        if (data.token) {
            sessionStorage.setItem('authToken', data.token);

            window.location.href = 'index.html'; 
        } else {
            alert("E-mail ou mot de passe incorrect.");
        }
    } catch (error) {
        console.error('Erreur lors de la tentative de connexion :', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});
