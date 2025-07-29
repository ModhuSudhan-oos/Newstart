// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Auth state listener for global access to user/role (even on public pages)
    // IMPORTANT: This listener is responsible for setting currentUserRole
    listenForAuthChanges((user) => {
        // ADMIN BUTTON LOGIC: Ensure adminLink is always hidden on public pages
        // The admin.html link should ONLY be accessible via direct URL /login.html
        // We will remove the adminLink element from ALL public HTML files' headers.
        // This script will only manage dark mode, cookies, and newsletter for public pages.
        // The adminLink check in this file is now redundant as there will be no adminLink in public HTML.
        // It's kept here for robustness in case it's accidentally added.
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = 'none'; // Always hide on public pages
        }
    });

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');

    // Set initial theme based on local storage or system preference
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkMode)) {
        document.documentElement.classList.add('dark');
        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (darkModeToggle) {
            darkModeToggle.checked = false;
        }
    }

    // Add event listener for toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            // Trigger a resize event to allow Chart.js to re-render with new colors (if on admin analytics page)
            window.dispatchEvent(new Event('resize'));
        });
    }

    // --- Cookie Banner ---
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');

    if (cookieBanner && acceptCookiesBtn) {
        // Check if cookie consent has been given
        const consentGiven = localStorage.getItem('cookieConsent');
        if (!consentGiven) {
            cookieBanner.classList.remove('hidden');
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cookieBanner.classList.add('hidden');
        });
    }

    // --- Dynamic Year in Footer ---
    const currentYear = new Date().getFullYear();
    const yearSpan = document.querySelector('footer p');
    if (yearSpan) {
        yearSpan.innerHTML = `&copy; ${currentYear} SaaS Tools Directory. All rights reserved.`;
    }

    // --- Newsletter Subscribe Logic ---
    const newsletterEmailInput = document.getElementById('newsletterEmail');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const subscribeMessage = document.getElementById('subscribeMessage');

    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', async () => {
            const email = newsletterEmailInput.value.trim();
            if (!email) {
                subscribeMessage.textContent = "Please enter your email address.";
                subscribeMessage.className = "mt-4 text-sm text-red-300";
                return;
            }
            // Basic email validation
            if (!/\S+@\S+\.\S+/.test(email)) {
                subscribeMessage.textContent = "Please enter a valid email address.";
                subscribeMessage.className = "mt-4 text-sm text-red-300";
                return;
            }

            subscribeBtn.disabled = true;
            subscribeBtn.innerHTML = 'Subscribing... <i class="fas fa-spinner fa-spin ml-2"></i>';

            try {
                // Add email to a 'subscribers' collection in Firestore
                // We use addDocument from firestore.js
                await addDocument('subscribers', {
                    email: email,
                    subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                subscribeMessage.textContent = "Thanks for subscribing! You'll receive updates soon.";
                subscribeMessage.className = "mt-4 text-sm text-green-300";
                newsletterEmailInput.value = ''; // Clear input
            } catch (error) {
                console.error("Error subscribing:", error);
                subscribeMessage.textContent = "Failed to subscribe. Please try again.";
                subscribeMessage.className = "mt-4 text-sm text-red-300";
            } finally {
                subscribeBtn.disabled = false;
                subscribeBtn.innerHTML = 'Subscribe <i class="fas fa-paper-plane ml-2"></i>';
            }
        });
    }
});
