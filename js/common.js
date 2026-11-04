const toTopBtn = document.getElementById("to-top");

if (toTopBtn) {
  window.addEventListener("scroll", () => {
    toTopBtn.classList.toggle("show", window.scrollY > 300);
  });
  toTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
