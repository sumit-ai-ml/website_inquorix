/**
 * Inquorix - Main JavaScript
 * Shared functionality across the website
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 600,
      once: true,
      easing: "ease-out",
    });
  }

  // Initialize Feather Icons
  if (typeof feather !== "undefined") {
    feather.replace();
  }

  // Mobile Menu Toggle
  initMobileMenu();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!mobileMenuButton || !mobileMenu) return;

  mobileMenuButton.setAttribute("aria-label", "Open navigation");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.setAttribute("aria-controls", "mobile-menu");
  const updateMenu = () => {
    const open = !mobileMenu.classList.contains("hidden");
    mobileMenuButton.setAttribute("aria-expanded", String(open));
    mobileMenuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    mobileMenuButton.innerHTML = open
      ? '<span aria-hidden="true">×</span>'
      : '<i data-feather="menu" aria-hidden="true"></i>';
    if (typeof feather !== "undefined") feather.replace();
  };

  mobileMenuButton.addEventListener("click", function () {
    mobileMenu.classList.toggle("hidden");

    updateMenu();
  });

  // Close mobile menu when clicking on a link
  const mobileMenuLinks = mobileMenu.querySelectorAll("a");
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      updateMenu();
    });
  });
}

document.addEventListener("keydown", function (event) {
  const button = document.getElementById("mobile-menu-button");
  if (
    event.key === "Escape" &&
    button?.getAttribute("aria-expanded") === "true"
  ) {
    button.click();
    button.focus();
  }
});
