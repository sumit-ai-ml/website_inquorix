(() => {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#navigation");
  function closeMenu() {
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.textContent = "☰";
  }
  toggle.addEventListener("click", () => {
    const open = navigation.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    toggle.textContent = open ? "×" : "☰";
  });
  navigation
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });
  document.querySelector("#year").textContent = new Date().getFullYear();
})();
