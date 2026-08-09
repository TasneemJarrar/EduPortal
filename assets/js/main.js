const clock = document.querySelector(".clock");
const modebtn = document.querySelector(".mode-toggle");
const modeicon = document.querySelector(".mode-icon");
const html = document.documentElement;

//dark mode
if (localStorage.getItem("theme") == "dark") {
  html.classList.add("dark");
  modeicon.classList.replace("fa-moon", "fa-sun");
}

modebtn.addEventListener("click", () => {
  html.classList.toggle("dark");

  if (html.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    modeicon.classList.replace("fa-moon", "fa-sun");
  } else {
    localStorage.setItem("theme", "light");
    modeicon.classList.replace("fa-sun", "fa-moon");
  }
});

//clock 
const updateClock = () => {
  clock.textContent = new Date().toLocaleTimeString();
};
updateClock();
setInterval(updateClock, 1000);