// ===============================
// GradePilot - GPA & CGPA Logic
// ===============================

// Local state
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let semesters = JSON.parse(localStorage.getItem("semesters")) || [];

// -------------------------------
// Utility
// -------------------------------
function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("semesters", JSON.stringify(semesters));
}

function animateNumber(el, value) {
  let start = 0;
  const duration = 1000;
  const step = value / (duration / 16);
  const counter = setInterval(() => {
    start += step;
    if (start >= value) {
      el.textContent = value.toFixed(2);
      clearInterval(counter);
    } else {
      el.textContent = start.toFixed(2);
    }
  }, 16);
}

// Toast notification
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "toast glass";
  toast.textContent = message;
  if (type === "success") toast.style.background = "#22C55E";
  if (type === "warning") toast.style.background = "#F59E0B";
  if (type === "danger") toast.style.background = "#EF4444";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// -------------------------------
// GPA Functions
// -------------------------------
function addSubject() {
  const subject = document.getElementById("subject").value.trim();
  const credits = parseInt(document.getElementById("credits").value);
  const grade = parseInt(document.getElementById("grade").value);

  if (!subject || isNaN(credits) || credits <= 0 || isNaN(grade)) {
    showToast("Please enter valid subject, credits, and grade.", "danger");
    return;
  }

  subjects.push({ subject, credits, grade });
  saveData();
  renderSubjects();
  showToast("Subject added!", "success");
}

function renderSubjects() {
  const list = document.getElementById("subjects-list");
  list.innerHTML = "";
  subjects.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "subject-card glass card-hover";
    card.innerHTML = `
      <span>${s.subject}</span>
      <span>${s.credits} credits</span>
      <span>Grade: ${s.grade}</span>
      <button class="danger-btn" onclick="deleteSubject(${i})">🗑</button>
    `;
    list.appendChild(card);
  });
}

function deleteSubject(i) {
  subjects.splice(i, 1);
  saveData();
  renderSubjects();
  showToast("Subject deleted.", "warning");
}

function calculateGPA() {
  let totalCredits = 0, totalPoints = 0;
  subjects.forEach(s => {
    totalCredits += s.credits;
    totalPoints += s.credits * s.grade;
  });
  if (totalCredits === 0) return;
  const gpa = totalPoints / totalCredits;
  document.getElementById("gpa-result").textContent = `Semester GPA: ${gpa.toFixed(2)}`;
  animateNumber(document.getElementById("semester-gpa"), gpa);
  document.getElementById("total-credits").textContent = totalCredits;
  if (gpa >= 9) confetti();
}

function resetSemester() {
  subjects = [];
  saveData();
  renderSubjects();
  document.getElementById("gpa-result").textContent = "";
  showToast("Semester reset.", "warning");
}

// -------------------------------
// CGPA Functions
// -------------------------------
function addSemester() {
  const semNumber = semesters.length + 1;
  const gpa = parseFloat(prompt("Enter Semester GPA:"));
  const credits = parseInt(prompt("Enter Semester Credits:"));
  if (isNaN(gpa) || isNaN(credits) || credits <= 0) {
    showToast("Invalid semester data.", "danger");
    return;
  }
  semesters.push({ semNumber, gpa, credits });
  saveData();
  renderSemesters();
  showToast("Semester added!", "success");
}

function renderSemesters() {
  const timeline = document.getElementById("semesters-timeline");
  timeline.innerHTML = "";
  semesters.forEach((sem, i) => {
    const card = document.createElement("div");
    card.className = "timeline-card glass card-hover";
    card.innerHTML = `
      <h3>Semester ${sem.semNumber}</h3>
      <p>GPA: ${sem.gpa}</p>
      <p>Credits: ${sem.credits}</p>
      <button class="danger-btn" onclick="deleteSemester(${i})">Delete</button>
    `;
    timeline.appendChild(card);
  });
}

function deleteSemester(i) {
  semesters.splice(i, 1);
  saveData();
  renderSemesters();
  showToast("Semester deleted.", "warning");
}

function calculateCGPA() {
  let totalCredits = 0, weightedSum = 0;
  semesters.forEach(sem => {
    totalCredits += sem.credits;
    weightedSum += sem.gpa * sem.credits;
  });
  if (totalCredits === 0) return;
  const cgpa = weightedSum / totalCredits;
  document.getElementById("cgpa-result").textContent = `Overall CGPA: ${cgpa.toFixed(2)}`;
  animateNumber(document.getElementById("overall-cgpa"), cgpa);
  updateProgressCircle("progress-circle", cgpa);
}

// -------------------------------
// Predictor
// -------------------------------
function predictCGPA() {
  const current = parseFloat(document.getElementById("current-cgpa").value);
  const completed = parseInt(document.getElementById("completed-credits").value);
  const futureCredits = parseInt(document.getElementById("future-credits").value);
  const expected = parseFloat(document.getElementById("expected-gpa").value);
  const remaining = parseInt(document.getElementById("remaining-sems").value);

  if ([current, completed, futureCredits, expected, remaining].some(v => isNaN(v) || v < 0)) {
    showToast("Invalid predictor inputs.", "danger");
    return;
  }

  let totalCredits = completed;
  let weightedSum = current * completed;

  for (let i = 0; i < remaining; i++) {
    totalCredits += futureCredits;
    weightedSum += expected * futureCredits;
  }

  const finalCGPA = weightedSum / totalCredits;
  document.getElementById("prediction-result").textContent = `Predicted Final CGPA: ${finalCGPA.toFixed(2)}`;
  updateProgressCircle("prediction-circle", finalCGPA);

  if (finalCGPA >= 9) {
    showToast("Congratulations! Excellent performance!", "success");
    confetti();
  } else if (finalCGPA >= 8) {
    showToast("Good job! Keep pushing higher.", "success");
  } else {
    showToast("Keep improving. You can do it!", "warning");
  }
}

// -------------------------------
// Progress Circle
// -------------------------------
function updateProgressCircle(id, value) {
  const circle = document.getElementById(id);
  const percent = Math.min(100, (value / 10) * 100);
  circle.style.background = `conic-gradient(#4F46E5 ${percent}%, #e5e7eb ${percent}%)`;
  circle.textContent = value.toFixed(2);
}

// -------------------------------
// Dark Mode
// -------------------------------
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// -------------------------------
// Confetti
// -------------------------------
function confetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  (function frame() {
    const colors = ["#4F46E5", "#7C3AED", "#06B6D4", "#22C55E"];
    const confettiEl = document.createElement("div");
    confettiEl.className = "confetti";
    confettiEl.style.left = Math.random() * 100 + "%";
    confettiEl.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(confettiEl);
    setTimeout(() => confettiEl.remove(), 2000);
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// -------------------------------
// Init
// -------------------------------
renderSubjects();
renderSemesters();
calculateGPA();
calculateCGPA();
confetti();