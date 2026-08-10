const clock = document.querySelector(".clock");
const modebtns = document.querySelectorAll(".mode-toggle");
const modeicons = document.querySelectorAll(".mode-icon");
const html = document.documentElement;

//get inputs
const logInForm = document.querySelector("#logInForm");
const name = document.querySelector("#name");
const username = document.querySelector("#username");
const email = document.querySelector("#email");
const phone = document.querySelector("#phone");
const password = document.querySelector("#password");
const usertype = document.querySelector("#usertype");
const logInBtn = document.querySelector("#logInBtn");

//dark mode
if (localStorage.getItem("theme") == "dark") {
  html.classList.add("dark");
  modeicons.forEach((icon) => icon.classList.replace("fa-moon", "fa-sun"));
}

modebtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    html.classList.toggle("dark");

    if (html.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      modeicons.forEach((icon) => icon.classList.replace("fa-moon", "fa-sun"));
    } else {
      localStorage.setItem("theme", "light");
      modeicons.forEach((icon) => icon.classList.replace("fa-sun", "fa-moon"));
    }
  });
});

//data
const patterns = {
  username: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(059|056)\d{7}$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-za-z\d@$!%*?&]{8,}$/,
};

//user class
class User {
  static totalUsers = 0;
  #password;

  constructor(name, username, email, phone, password) {
    this.name = name;
    this.username = username;
    this.email = email;
    this.phone = phone;
    this.#password = password;
    User.totalUsers++;
  }
  getRole() {
    return "User";
  }

  getPasswordStatus() {
    return this.#password ? "protected" : "not set";
  }
}

//admin class
class Admin extends User {
  constructor(name, username, email, phone, password) {
    super(name, username,email, phone, password);
  }
  getRole() {
    return "Admin";
  }
}

//validation
const validateUserName = (username) => {
  if (!patterns.username.test(username)) {
    return "Username must start with a letter and contain letters, numbers or underscore.";
  }
};

const validateEmail = (email) => {
  if (!patterns.email.test(email)) {
    return "Enter a valid Email.";
  }
};

const validatePhone = (phone) => {
  if (!patterns.phone.test(phone)) {
    return "Enter a valid Palestinian phone nymber.";
  }
};

const validatePassword = (password) => {
  if (!patterns.password.test(password)) {
    return "password needs to be 8+ characters, uppercase, lowercase, numbers and special characters.";
  }
};

logInForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get input value
  const nameValue = name.value.trim();
  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const phoneValue = phone.value.trim();
  const passwordValue = password.value;
  const usertypeValue = usertype.value;

  //inputs error
  const usernameError = validateUserName(username.value.trim());
  const emailError = validateEmail(email.value.trim());
  const phoneError = validatePhone(phone.value.trim());
  const passwordError = validatePassword(password.value.trim());

  //check validation
  if (usernameError || emailError || phoneError || passwordError) {
    alert(usernameError || emailError || phoneError || passwordError);
    return;
  }

  //create user
  let user;
  if (usertype === "admin") {
    user = new Admin(
      nameValue,
      usernameValue,
      emailValue,
      phoneValue,
      passwordValue,
    );
  } else {
    user = new User(
      nameValue,
      usernameValue,
      emailValue,
      phoneValue,
      passwordValue,
    );
  }

  const loggedInUser = {
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.getRole(),
  };

  localStorage.setItem("currentUser", JSON.stringify(loggedInUser));

  window.location.href = "index.html";
});
