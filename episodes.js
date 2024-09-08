import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAMkLEuyNaGaUF4ImbJ8FtcBSVBP_nPcNs",
	authDomain: "anime-wave-51e80.firebaseapp.com",
	projectId: "anime-wave-51e80",
	storageBucket: "anime-wave-51e80.appspot.com",
	messagingSenderId: "580713802909",
	appId: "1:580713802909:web:0bbf1947e8cddbb7643874"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
	const episodeForm = document.getElementById('episode-form');
	const episodesList = document.getElementById('episodes-list');
	const backButton = document.getElementById('back-button');

	const urlParams = new URLSearchParams(window.location.search);
	const animeId = urlParams.get('animeId');

	async function loadEpisodes() {
		const episodesSnapshot = await getDocs(collection(db, 'anime', animeId, 'episodes'));
		episodesList.innerHTML = '';
		episodesSnapshot.forEach(doc => {
			const data = doc.data();
			const episodeItem = document.createElement('div');
			episodeItem.className = 'episode-item';
			episodeItem.innerHTML = `
                <p>Episode Number: ${data.episodeNumber}</p>
                <p>Download Link: <a href="${data.downloadLink}" target="_blank">${data.downloadLink}</a></p>
                <p>Date: ${new Date(data.timestamp).toLocaleString()}</p>
                <button class="delete" data-id="${doc.id}">Delete</button>
            `;
			episodesList.appendChild(episodeItem);
		});
	}

	episodeForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const episodeNumber = document.getElementById('episode-number').value;
		const downloadLink = document.getElementById('episode-download-link').value;
		const timestamp = new Date().toISOString();

		await addDoc(collection(db, 'anime', animeId, 'episodes'), {
			episodeNumber,
			downloadLink,
			timestamp
		});

		episodeForm.reset();
		loadEpisodes();
	});

	episodesList.addEventListener('click', async (event) => {
		if (event.target.classList.contains('delete')) {
			const id = event.target.dataset.id;
			await deleteDoc(doc(db, 'anime', animeId, 'episodes', id));
			loadEpisodes();
		}
	});

	backButton.addEventListener('click', () => {
		window.location.href = 'index.html'; // Redirect back to the main panel
	});

	// Load episodes for the selected anime
	loadEpisodes();
});