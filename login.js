import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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
const auth = getAuth(app);

document.getElementById('login-form').addEventListener('submit', async (event) => {
	event.preventDefault();

	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const errorMessage = document.getElementById('error-message');

	try {
		await signInWithEmailAndPassword(auth, email, password);
		window.location.href = 'index.html'; // Redirect to your main panel or dashboard
	} catch (error) {
		errorMessage.textContent = `Error: ${error.message}`;
	}
});