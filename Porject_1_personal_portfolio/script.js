document.querySelectorAll("nav a").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

const toggleBtn = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

toggleBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// close on click
document.querySelectorAll("#nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});