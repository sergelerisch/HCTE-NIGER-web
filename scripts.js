let demandeurs = [];
let currentAd = null;

function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'flex';
}

// Demander l'autorisation d'accéder aux informations
function requestAuthorization() {
    const welcomeModal = document.getElementById('welcome-modal');
    const authorized = prompt("Veuillez entrer le mot de passe pour accéder aux informations :");
    if (authorized === "motdepasse123") {
        welcomeModal.style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('manage-ads').style.display = 'block'; // Montrer le bouton de gestion des publicités
        initIndexedDB();
        displayAds(); // Afficher les publicités après l'autorisation
    } else {
        alert("Accès refusé.");
    }
}

function saveDemandeur(event) {
    event.preventDefault();

    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const emergencyContact = document.getElementById('emergency-contact').value;
    const profession = document.getElementById('profession').value;
    const height = document.getElementById('height').value;

    const nationalityCertificate = document.getElementById('nationality-certificate').files[0];
    const birthCertificate = document.getElementById('birth-certificate').files[0];
    const photo = document.getElementById('photo').files[0];

    const demandeur = {
        nom,
        prenom,
        phone,
        address,
        emergencyContact,
        profession,
        height,
        nationalityCertificate,
        birthCertificate,
        photo,
    };

    demandeurs.push(demandeur);
    alert('Demandeur enregistré avec succès !');
    document.getElementById('registration-form').reset();
}

function showList() {
    const listSection = document.getElementById('list-section');
    const formSection = document.getElementById('form-section');
    formSection.style.display = 'none';
    listSection.style.display = 'block';

    const tbody = document.querySelector('#demandeurs-list tbody');
    tbody.innerHTML = ''; // Clear previous entries

    demandeurs.forEach((demandeur, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${demandeur.nom}</td>
            <td>${demandeur.prenom}</td>
            <td>${demandeur.phone}</td>
            <td>${demandeur.address}</td>
            <td>${demandeur.emergencyContact}</td>
            <td>${demandeur.profession}</td>
            <td>${demandeur.height}</td>
            <td>${demandeur.nationalityCertificate ? 'Présent' : 'Absent'}</td>
            <td>${demandeur.birthCertificate ? 'Présent' : 'Absent'}</td>
            <td>${demandeur.photo ? 'Présent' : 'Absent'}</td>
            <td><button onclick="deleteDemandeur(${index})">Supprimer</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteDemandeur(index) {
    demandeurs.splice(index, 1);
    showList(); // Refresh the list
}

// Capture de photo avec la caméra
function capturePhoto(inputId) {
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play();
            document.body.appendChild(videoElement);

            const captureButton = document.createElement('button');
            captureButton.textContent = "Prendre la Photo";
            document.body.appendChild(captureButton);

            captureButton.onclick = () => {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0);
                const imageData = canvasElement.toDataURL('image/png');

                document.getElementById(`${inputId}-preview`).src = imageData;
                document.getElementById(`${inputId}-preview`).style.display = 'block';

                stream.getTracks().forEach(track => track.stop());
                videoElement.remove();
                captureButton.remove();
            };
        })
        .catch(err => {
            console.error("Erreur d'accès à la caméra : ", err);
        });
}

// Envoyer un message WhatsApp
function sendWhatsApp() {
    const message = "Bonjour, je souhaite en savoir plus sur le service.";
    const phone = "0123456789"; // Remplacez par le numéro de téléphone de destination
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function showForm() {
    document.getElementById('form-section').style.display = 'block';
    document.getElementById('list-section').style.display = 'none';
}

// Impression de la liste
function printList() {
    const printContent = document.getElementById('list-section').innerHTML;
    const printWindow = window.open('', '_blank', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Liste des Demandeurs</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Import de données depuis un fichier JSON
function importDataFromJSON(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                demandeurs = data;
                alert('Données importées avec succès !');
                showList();
            } catch (error) {
                alert('Erreur lors de l\'importation du fichier JSON.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Veuillez sélectionner un fichier JSON.');
    }
}

// Import de données depuis un fichier CSV
function importDataFromCSV(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const rows = e.target.result.split('\n');
            rows.forEach(row => {
                const columns = row.split(',');
                if (columns.length > 1) {
                    demandeurs.push({
                        nom: columns[0],
                        prenom: columns[1],
                        phone: columns[2],
                        address: columns[3],
                        emergencyContact: columns[4],
                        profession: columns[5],
                        height: columns[6],
                    });
                }
            });
            alert('Données importées avec succès !');
            showList();
        };
        reader.readAsText(file);
    } else {
        alert('Veuillez sélectionner un fichier CSV.');
    }
}

// Export des données en JSON
function exportDataAsJSON() {
    const dataStr = JSON.stringify(demandeurs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demandeurs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Export des données en CSV
function exportDataAsCSV() {
    const csvRows = [];
    const headers = ['Nom', 'Prénom', 'Numéro de Téléphone', 'Adresse', 'Personne à Prévenir', 'Profession', 'Taille'];
    csvRows.push(headers.join(','));

    demandeurs.forEach(demandeur => {
        const row = [
            demandeur.nom,
            demandeur.prenom,
            demandeur.phone,
            demandeur.address,
            demandeur.emergencyContact,
            demandeur.profession,
            demandeur.height
        ];
        csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demandeurs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Afficher le formulaire de publicité
function showAdForm() {
    document.getElementById('ad-section').style.display = 'block';
}

// Ajouter une publicité
function addAd() {
    const adType = document.getElementById('ad-type').value;
    const adText = document.getElementById('ad-text').value;
    const adFile = document.getElementById('ad-file').files[0];

    if (adType === 'text' && adText) {
        const adDisplay = document.getElementById('ad-display');
        const adElement = document.createElement('div');
        adElement.textContent = adText;
        adDisplay.appendChild(adElement);
    } else if (adType === 'image' && adFile) {
        const adDisplay = document.getElementById('ad-display');
        const imgElement = document.createElement('img');
        imgElement.src = URL.createObjectURL(adFile);
        adDisplay.appendChild(imgElement);
    } else {
        alert("Veuillez remplir tous les champs.");
    }

    document.getElementById('ad-form').reset();
}

// Fonction pour afficher les publicités dynamiquement
function displayAds() {
    const adTypes = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    currentAd = 0;

    function rotateAds() {
        const adDisplay = document.getElementById('dynamic-ad');
        adDisplay.src = adTypes[currentAd];
        currentAd = (currentAd + 1) % adTypes.length;
    }

    rotateAds();
    setInterval(rotateAds, 3000); // Changer l'annonce toutes les 3 secondes
}
