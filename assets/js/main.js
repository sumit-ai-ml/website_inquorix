/**
 * Inquorix - Main JavaScript
 * Shared functionality across the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            once: true,
            easing: 'ease-out'
        });
    }

    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Mobile Menu Toggle
    initMobileMenu();

    // Section Snapping (for pages with snap-section class)
    if (document.querySelector('.snap-section')) {
        initSectionSnapping();
    }
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileMenuButton || !mobileMenu) return;

    const menuIcon = mobileMenuButton.querySelector('i[data-feather="menu"]');

    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');

        // Toggle icon between menu and x
        if (mobileMenu.classList.contains('hidden')) {
            menuIcon.setAttribute('data-feather', 'menu');
        } else {
            menuIcon.setAttribute('data-feather', 'x');
        }

        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    });

    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            menuIcon.setAttribute('data-feather', 'menu');

            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        });
    });
}

/**
 * Section Snapping for Desktop/Tablet
 */
function initSectionSnapping() {
    const SNAP_BREAKPOINT = 768;
    const snapSections = Array.from(document.querySelectorAll('.snap-section'));
    let currentSnapIndex = 0;
    let isSnapAnimating = false;
    let snapScrollTimeout;

    const updateSnapIndex = () => {
        if (!snapSections.length) return;
        let closestIndex = 0;
        let minDistance = Infinity;

        snapSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        currentSnapIndex = closestIndex;
    };

    const scrollToSnap = (index) => {
        if (index < 0 || index >= snapSections.length) return;
        isSnapAnimating = true;
        currentSnapIndex = index;

        snapSections[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        setTimeout(() => {
            isSnapAnimating = false;
            updateSnapIndex();
        }, 650);
    };

    const handleWheelSnap = (event) => {
        if (window.innerWidth < SNAP_BREAKPOINT || !snapSections.length) return;
        if (Math.abs(event.deltaY) < 8) return;

        if (isSnapAnimating) {
            event.preventDefault();
            return;
        }

        updateSnapIndex();
        const direction = event.deltaY > 0 ? 1 : -1;
        const targetIndex = Math.min(
            Math.max(currentSnapIndex + direction, 0),
            snapSections.length - 1
        );

        if (targetIndex === currentSnapIndex) {
            return;
        }

        event.preventDefault();
        scrollToSnap(targetIndex);
    };

    const handleScrollUpdate = () => {
        if (isSnapAnimating) return;
        if (snapScrollTimeout) clearTimeout(snapScrollTimeout);
        snapScrollTimeout = setTimeout(updateSnapIndex, 120);
    };

    if (snapSections.length) {
        updateSnapIndex();
        window.addEventListener('wheel', handleWheelSnap, { passive: false });
        window.addEventListener('scroll', handleScrollUpdate, { passive: true });
        window.addEventListener('resize', () => {
            if (window.innerWidth < SNAP_BREAKPOINT) {
                isSnapAnimating = false;
                currentSnapIndex = 0;
                return;
            }
            updateSnapIndex();
        });
    }
}
