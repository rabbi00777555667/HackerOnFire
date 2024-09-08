import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc,setDoc, getDocs, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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
const storage = getStorage(app);
const auth = getAuth(app);

// Load content on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
	const slideForm = document.getElementById('slide-form');
	const animeForm = document.getElementById('anime-form');
	const slidesList = document.getElementById('slides-list');
	const animeList = document.getElementById('anime-list');
	const logoutButton = document.getElementById('logout-button');

	// Check if user is authenticated
	onAuthStateChanged(auth, (user) => {
		if (user) {
			document.getElementById('login-container').style.display = 'none';
			document.getElementById('panel-container').style.display = 'block';
			loadSlides();
			loadAnime();
		} else {
			document.getElementById('login-container').style.display = 'block';
			document.getElementById('panel-container').style.display = 'none';
		}
	});

	// Logout function
	logoutButton.addEventListener('click', () => {
		signOut(auth).then(() => {
			window.location.href = 'login.html'; // Redirect to login page
		}).catch((error) => {
			console.error("Error signing out:", error);
		});
	});

	// Load slides from Firebase
	async function loadSlides() {
		try {
			const slidesSnapshot = await getDocs(collection(db, 'slides'));
			slidesList.innerHTML = '';
			slidesSnapshot.forEach(doc => {
				const data = doc.data();
				const slideItem = document.createElement('div');
				slideItem.className = 'slide-item';
				slideItem.innerHTML = `
                    <img src="${data.image}" alt="Slide">
                    <p>Link: ${data.link || 'N/A'}</p>
                    <button class="edit" data-id="${doc.id}">Edit</button>
                    <button class="delete" data-id="${doc.id}">Delete</button>
                `;
				slidesList.appendChild(slideItem);
			});

			// Add event listeners for edit and delete buttons
			document.querySelectorAll('.slide-item .edit').forEach(button => {
				button.addEventListener('click', handleEditSlide);
			});

			document.querySelectorAll('.slide-item .delete').forEach(button => {
				button.addEventListener('click', handleDeleteSlide);
			});

		} catch (error) {
			console.error("Error loading slides:", error);
		}
	}

	// Load anime from Firebase
	async function loadAnime() {
		try {
			const animeSnapshot = await getDocs(collection(db, 'anime'));
			animeList.innerHTML = '';
			animeSnapshot.forEach(doc => {
				const data = doc.data();
				const animeItem = document.createElement('div');
				animeItem.className = 'anime-item';
				animeItem.innerHTML = `
                    <img src="${data.image}" alt="${data.title}">
                    <h3>${data.title}</h3>
                    <p>Title (Lowercase): ${data.title_lower}</p>
                    <p>Season: ${data.season || 'N/A'}</p>
                    <p>Date: ${new Date(data.date).toLocaleString()}</p>
                    <button class="edit" data-id="${doc.id}">Edit</button>
                    <button class="delete" data-id="${doc.id}">Delete</button>
                    <button class="view-episodes" data-id="${doc.id}">View Episodes</button>
                `;
				animeList.appendChild(animeItem);
			});

			document.querySelectorAll('.anime-item .edit').forEach(button => {
				button.addEventListener('click', handleEditAnime);
			});

			document.querySelectorAll('.anime-item .delete').forEach(button => {
				button.addEventListener('click', handleDeleteAnime);
			});

		} catch (error) {
			console.error("Error loading anime:", error);
		}
	}

	// Upload image to Firebase Storage
	async function uploadImage(file, folder) {
		if (!file) return null;
		try {
			const storageRef = ref(storage, `${folder}/${file.name}`);
			await uploadBytes(storageRef, file);
			return await getDownloadURL(storageRef);
		} catch (error) {
			console.error("Error uploading image:", error);
			return null;
		}
	}

	// Generate lowercase title (with spaces and no special characters)
	function generateTitleLower(title) {
		return title.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
	}

	// Handle Slide Form Submission
	slideForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const link = document.getElementById('slide-link').value;
		const imageFile = document.getElementById('slide-image').files[0];
		const imageUrl = imageFile ? await uploadImage(imageFile, 'slides') : '';

		try {
			await addDoc(collection(db, 'slides'), {
				link,
				image: imageUrl
			});

			slideForm.reset();
			loadSlides();
		} catch (error) {
			console.error("Error adding slide:", error);
		}
	});

	// Handle Anime Form Submission
	animeForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const title = document.getElementById('anime-title').value;
		const title_lower = generateTitleLower(title);
		const season = document.getElementById('anime-season').value;
		const imageFile = document.getElementById('anime-image').files[0];
		const imageUrl = imageFile ? await uploadImage(imageFile, 'anime') : '';
		const date = new Date().toISOString();

		try {
			const docRef = doc(db, 'anime', title_lower); // Set document ID to lowercase title
			await setDoc(docRef, {
				title,
				title_lower,
				season,
				image: imageUrl,
				date
			});

			animeForm.reset();
			loadAnime();
		} catch (error) {
			console.error("Error adding anime:", error);
		}
	});

	// Handle view episodes
	animeList.addEventListener('click', async (event) => {
		if (event.target.classList.contains('view-episodes')) {
			const id = event.target.dataset.id;
			window.location.href = `episodes.html?animeId=${id}`;
		}
	});

	// Handle Anime Deletion
	async function handleDeleteAnime(event) {
		const id = event.target.dataset.id;
		const docRef = doc(db, 'anime', id);

		// Show confirmation dialog
		const confirmed = window.confirm('Are you sure you want to delete this anime?');
		if (!confirmed) return;

		try {
			// Get the document to retrieve the image URL
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			const imageUrl = data.image;

			// Delete the image from Firebase Storage
			if (imageUrl) {
				const storageRef = ref(storage, imageUrl);
				await deleteObject(storageRef);
			}

			// Delete the document from Firestore
			await deleteDoc(docRef);
			loadAnime();
		} catch (error) {
			console.error("Error deleting anime:", error);
		}
	}

	// Handle Slide Deletion
	async function handleDeleteSlide(event) {
		const id = event.target.dataset.id;
		const docRef = doc(db, 'slides', id);

		// Show confirmation dialog
		const confirmed = window.confirm('Are you sure you want to delete this slide?');
		if (!confirmed) return;

		try {
			// Get the document to retrieve the image URL
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			const imageUrl = data.image;

			// Delete the image from Firebase Storage
			if (imageUrl) {
				const storageRef = ref(storage, imageUrl);
				await deleteObject(storageRef);
			}

			// Delete the document from Firestore
			await deleteDoc(docRef);
			loadSlides();
		} catch (error) {
			console.error("Error deleting slide:", error);
		}
	}

	// Handle Edit Anime
	async function handleEditAnime(event) {
		const id = event.target.dataset.id;
		const docRef = doc(db, 'anime', id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			document.getElementById('anime-title').value = data.title;
			document.getElementById('anime-season').value = data.season;

			// Show the edit form (you can add your own logic to display the form)
			// e.g., by toggling a class or showing a modal
		}
	}

	// Handle Edit Slide
	async function handleEditSlide(event) {
		const id = event.target.dataset.id;
		const docRef = doc(db, 'slides', id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			document.getElementById('slide-link').value = data.link;

			// Show the edit form (you can add your own logic to display the form)
			// e.g., by toggling a class or showing a modal
		}
	}
});