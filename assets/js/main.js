const clock = document.querySelector(".clock");
const modebtns = document.querySelectorAll(".mode-toggle");
const modeicons = document.querySelectorAll(".mode-icon");
const html = document.documentElement;

//dashboard
const enrollmentLog = document.querySelector("#enrollmentLog");
const statStudents = document.querySelector("#statStudents");
const statCourses = document.querySelector("#statCourses");
const statEnroll = document.querySelector("#statEnroll");

//profile
const userName = document.querySelector("#userName");
const userRole = document.querySelector("#userRole");
const userEmail = document.querySelector("#userEmail");
const userPhone = document.querySelector("#userPhone");

//students
const studentForm = document.querySelector("#studentForm");
const studentfullname = document.querySelector("#studentfullname");
const studentemail = document.querySelector("#studentemail");
const studentsList = document.querySelector("#studentsList");

//courses
const courseForm = document.querySelector("#courseForm");
const coursename = document.querySelector("#coursename");
const coursecode = document.querySelector("#coursecode");
const coursecapcity = document.querySelector("#coursecapcity");
const coursesList = document.querySelector("#coursesList");

//enrollment
const enrollstudentsList = document.querySelector("#enrollstudentsList");
const enrollcoursesList = document.querySelector("#enrollcoursesList");
const enrollbtn = document.querySelector("#enrollbtn");
const enrollWarning = document.querySelector("#enrollWarning");
const enrollmentSummary = document.querySelector("#enrollmentSummary");

//search
const searchInput = document.querySelector("#searchInput");
const searchRsults = document.querySelector("#searchRsults");

//data
let students = [];
let courses = [];
const enrollments = new Map(); // studentId -> Set of courseIds
let activityLog = new Array(5).fill(null);
let selectedStudentId = null;
let selectedCourseId = null;
let studentSeq = 1;
let courseSeq = 1;
const nextStudentId = () => studentSeq++;
const nextCourseId = () => courseSeq++;

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "register.html";
}

const VIEWS = {
  home: ".dashboradView",
  students: ".studentsView",
  courses: ".coursesView",
  enroll: ".enrollmentView",
  search: ".searchView",
  profile: ".profileView",
};

const enrolledCountFor = (courseId) =>
  Array.from(enrollments.values()).filter((set) => set.has(courseId)).length;

//save to local storage
const saveToLocal = () => {
  const enrollmentsArray = Array.from(enrollments.entries()).map(
    ([id, set]) => [id, Array.from(set)],
  );
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("courses", JSON.stringify(courses));
  localStorage.setItem("enrollments", JSON.stringify(enrollmentsArray));
  localStorage.setItem("studentSeq", studentSeq);
  localStorage.setItem("courseSeq", courseSeq);
};

//get from local storage
const getFromLocal = () => {
  const savedStudents = localStorage.getItem("students");
  const savedCourses = localStorage.getItem("courses");
  const savedEnrollments = localStorage.getItem("enrollments");

  if (savedStudents) students = JSON.parse(savedStudents);
  if (savedCourses) courses = JSON.parse(savedCourses);
  if (savedEnrollments) {
    JSON.parse(savedEnrollments).forEach(([id, courseIds]) => {
      enrollments.set(id, new Set(courseIds));
    });
  }

  studentSeq = Number(localStorage.getItem("studentSeq")) || 1;
  courseSeq = Number(localStorage.getItem("courseSeq")) || 1;
};

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

//clock
const updateClock = () => {
  clock.textContent = new Date().toLocaleTimeString();
};
updateClock();
setInterval(updateClock, 1000);

//switch views
const switchViews = (view) => {
  Object.values(VIEWS).forEach((sel) =>
    document.querySelector(sel).classList.add("hidden"),
  );
  document.querySelector(VIEWS[view]).classList.remove("hidden");
  document.querySelectorAll(".nav-btn, .nav-btn-mobile").forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle("bg-violet-500", active);
    btn.classList.toggle("text-white", active);
  });
  if (view === "home") updateDashboard();
};

document.querySelectorAll(".nav-btn, .nav-btn-mobile").forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    switchViews(view);
  });
});

//update dashboard stats and log activity
const updateDashboard = () => {
  statStudents.textContent = students.length;
  statCourses.textContent = courses.length;
  statEnroll.textContent = Array.from(enrollments.values()).reduce(
    (sum, set) => sum + set.size,
    0,
  );
};

const logActivity = (msg) => {
  activityLog.copyWithin(0, 1);
  activityLog[4] = msg;
  enrollmentLog.innerHTML =
    Array.from(activityLog)
      .reverse()
      .filter(Boolean)
      .map((m) => `<li class="">${m}</li>`)
      .join("") || `<li>No Activity Yet.</li>`;
};

//profile
if (currentUser) {
  userName.textContent = currentUser.name;
  userRole.textContent = currentUser.role;
  userEmail.textContent = currentUser.email;
  userPhone.textContent = currentUser.phone;
}

//students
studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const { value: name } = studentfullname;
  const { value: email } = studentemail;

  const newStudent = {
    id: nextStudentId(),
    name: name.trim(),
    email: email.trim(),
  };
  students = [...students, newStudent];
  enrollments.set(newStudent.id, new Set());
  saveToLocal();

  studentForm.reset();
  logActivity(`Added student "${newStudent.name}"`);
  AddStudents();
  enrollPicker();
});

const AddStudents = () => {
  let list = "";

  for (let i = 0; i < students.length; i++) {
    const { id, name, email } = students[i];
    const courseSet = enrollments.get(id) || new Set();

    let chips = "";
    courseSet.forEach((courseId) => {
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        chips += `<span class="text-xs bg-violet-100 dark:bg-slate-950 px-3 py-1 rounded-full flex items-center gap-2 mr-2">${course.name}<button onclick="removeEnrollment(${id},${courseId})" class="text-red-400 ml-1"><i class="fa-solid fa-xmark"></i></button></span>`;
      }
    });

    list += `
      <div class="bg-violet-50 dark:bg-slate-900 rounded-2xl p-4">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-bold">${name}</p>
            <p class="text-xs text-violet-500 dark:text-violet-300">${email}</p>
          </div>
          <button onclick="deleteStudent(${id})" class="text-red-400 hover:text-red-500 text-sm">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">${chips || '<span class="text-xs text-gray-400">No courses yet</span>'}</div>
      </div>`;
  }

  studentsList.innerHTML =
    list || `<p class="text-sm text-gray-400">No students yet.</p>`;
};

const deleteStudent = (id) => {
  students = students.filter((s) => s.id !== id);
  enrollments.delete(id);
  saveToLocal();
  logActivity("Removed a student");
  AddStudents();
  enrollPicker();
  search();
};

//courses
courseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const { value: name } = coursename;
  const { value: code } = coursecode;
  const capacity = Number(coursecapcity.value);

  const newCourse = {
    id: nextCourseId(),
    name: name.trim(),
    code: code.trim(),
    capacity,
  };
  courses = [...courses, newCourse];
  saveToLocal();

  courseForm.reset();
  logActivity(`Added course "${newCourse.name}"`);
  AddCourses();
  enrollPicker();
});

const AddCourses = () => {
  let list = "";

  for (let i = 0; i < courses.length; i++) {
    const { id, name, code, capacity } = courses[i];
    const count = enrolledCountFor(id);
    const full = count >= capacity;

    list += `
      <div class="bg-violet-50 dark:bg-slate-900 rounded-2xl p-4">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-bold">${name}</p>
            <p class="text-xs text-violet-500 dark:text-violet-300">${code}</p>
          </div>
          <button onclick="deleteCourse(${id})" class="text-red-400 hover:text-red-500 text-sm">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block ${full ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-500"}">
          ${count}/${capacity} ${full ? "· Full" : "· Available"}
        </span>
      </div>`;
  }

  coursesList.innerHTML =
    list || `<p class="text-sm text-gray-400">No courses yet.</p>`;
};

const deleteCourse = (id) => {
  courses = courses.filter((c) => c.id !== id);
  enrollments.forEach((courseSet) => courseSet.delete(id)); // strip this course out of every student's Set
  saveToLocal();
  logActivity("Removed a course");
  AddCourses();
  enrollPicker();
  search();
};

//enrollment
const pickStudent = (id) => {
  selectedStudentId = id;
  enrollPicker();
};

const pickCourse = (id) => {
  selectedCourseId = id;
  enrollPicker();
};

const enrollPicker = () => {
  let studentButtons = "";
  for (let i = 0; i < students.length; i++) {
    const { id, name } = students[i];
    const active =
      id === selectedStudentId
        ? "bg-violet-500 text-white"
        : "bg-violet-100 dark:bg-slate-950";
    studentButtons += `<button onclick="pickStudent(${id})" class="text-left px-4 py-2 rounded-xl text-sm font-semibold ${active}">${name}</button>`;
  }
  enrollstudentsList.innerHTML =
    studentButtons || `<p class="text-sm text-gray-400">No students yet.</p>`;

  let courseButtons = "";
  for (let i = 0; i < courses.length; i++) {
    const { id, name, capacity } = courses[i];
    const count = enrolledCountFor(id);
    const full = count >= capacity;
    const active =
      id === selectedCourseId
        ? "bg-violet-500 text-white"
        : "bg-violet-100 dark:bg-slate-950";
    courseButtons += `<button ${full ? "disabled" : ""} onclick="pickCourse(${id})" class="text-left px-4 py-2 rounded-xl text-sm font-semibold ${active} ${full ? "opacity-40" : ""}">${name} (${count}/${capacity})</button>`;
  }
  enrollcoursesList.innerHTML =
    courseButtons || `<p class="text-sm text-gray-400">No courses yet.</p>`;

  const ready = selectedStudentId && selectedCourseId;
  const already =
    ready && enrollments.get(selectedStudentId).has(selectedCourseId); // Set uniqueness check
  enrollbtn.disabled = !ready || already;
  enrollWarning.classList.toggle("hidden", !already);

  enrollSumarry();
};

enrollbtn.addEventListener("click", () => {
  const studentCourses = enrollments.get(selectedStudentId);
  const course = courses.find((c) => c.id === selectedCourseId);
  if (!studentCourses || !course) return;
  if (
    studentCourses.has(selectedCourseId) ||
    enrolledCountFor(selectedCourseId) >= course.capacity
  )
    return;

  studentCourses.add(selectedCourseId);
  saveToLocal();
  const student = students.find((s) => s.id === selectedStudentId);
  logActivity(`Enrolled ${student.name} in ${course.name}`);

  AddStudents();
  AddCourses();
  enrollPicker();
});

const removeEnrollment = (studentId, courseId) => {
  enrollments.get(studentId)?.delete(courseId);
  saveToLocal();
  AddStudents();
  AddCourses();
  enrollPicker();
  search();
};

const enrollSumarry = () => {
  let list = "";

  enrollments.forEach((courseSet, studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    let names = [];
    courseSet.forEach((courseId) => {
      const course = courses.find((c) => c.id === courseId);
      if (course) names.push(course.name);
    });

    list += `
      <div class="bg-violet-50 dark:bg-slate-900 rounded-2xl p-4">
        <p class="font-bold text-sm">${student.name}</p>
        <p class="text-xs text-violet-500 dark:text-violet-300">${names.length ? names.join(", ") : "No courses yet"}</p>
      </div>`;
  });

  enrollmentSummary.innerHTML =
    list || `<p class="text-sm text-gray-400">No enrollments yet.</p>`;
};

//search
searchInput.addEventListener("input", search);

function search() {
  const q = searchInput.value.trim().toLowerCase();
  const matches = students.filter(({ name }) => name.toLowerCase().includes(q));

  let list = "";
  for (let i = 0; i < matches.length; i++) {
    const { id, name, email } = matches[i];
    const courseSet = enrollments.get(id) || new Set();

    const courseObjs = [];
    courseSet.forEach((cid) => {
      const course = courses.find((c) => c.id === cid);
      if (course) courseObjs.push(course);
    });

    const hasOpenSlot = courseObjs.some(
      (c) => enrolledCountFor(c.id) < c.capacity,
    );
    const allFull =
      courseObjs.length > 0 &&
      courseObjs.every((c) => enrolledCountFor(c.id) >= c.capacity);

    let chips = "";
    for (let j = 0; j < courseObjs.length; j++) {
      chips += `<span class="text-xs bg-violet-100 dark:bg-slate-950 px-3 py-1 rounded-full mr-1">${courseObjs[j].name}</span>`;
    }

    list += `
      <div class="bg-violet-50 dark:bg-slate-900 rounded-2xl p-4">
        <p class="font-bold">${name}</p>
        <p class="text-xs text-violet-500 dark:text-violet-300">${email}</p>
        <div class="flex flex-wrap gap-2 mt-2">${chips || '<span class="text-xs text-gray-400">Not enrolled yet</span>'}</div>
      </div>`;
  }

  searchRsults.innerHTML =
    list || `<p class="text-sm text-gray-400">No students found.</p>`;
}

getFromLocal();
switchViews("home");
AddStudents();
AddCourses();
enrollPicker();
search();
