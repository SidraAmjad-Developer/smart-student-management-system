/**
 * SMART SMS - STUDENT MANAGEMENT SYSTEM CORE SCRIPT
 * Handles Navigation, State Engine, Validation, Local Storage, Theme & Dynamic Stats
 */

// --- Initial Seed Data ---
const DEFAULT_STUDENTS = [
  { id: "STU-1025", fullName: "Ayesha Khan", fatherName: "Shahid Khan", age: 19, gender: "Female", email: "ayesha.khan@sms.edu", course: "Computer Science", city: "Lahore" },
  { id: "STU-1024", fullName: "Hassan Ali", fatherName: "Imran Ali", age: 21, gender: "Male", email: "hassan.ali@sms.edu", course: "Software Engineering", city: "Karachi" },
  { id: "STU-1023", fullName: "Fatima Noor", fatherName: "Ahmad Noor", age: 20, gender: "Female", email: "fatima.noor@sms.edu", course: "Data Science", city: "Faisalabad" },
  { id: "STU-1022", fullName: "Ali Raza", fatherName: "Muhammad Raza", age: 22, gender: "Male", email: "ali.raza@sms.edu", course: "Electrical Engineering", city: "Multan" },
  { id: "STU-1021", fullName: "Sara Ahmed", fatherName: "Khalid Ahmed", age: 19, gender: "Female", email: "sara.ahmed@sms.edu", course: "Graphic Design", city: "Lahore" },
  { id: "STU-1020", fullName: "Usman Tariq", fatherName: "Tariq Mehmood", age: 20, gender: "Male", email: "usman.tariq@sms.edu", course: "Cyber Security", city: "Islamabad" },
  { id: "STU-1019", fullName: "Zainab Malik", fatherName: "Malik Asif", age: 18, gender: "Female", email: "zainab.malik@sms.edu", course: "Business Administration", city: "Peshawar" }
];

// --- State Variables ---
let students = [];
let editingStudentId = null;
let deletingStudentId = null;
let generatedId = "";
let notifications = [
  { id: 1, title: "New Enrollment Activity", text: "3 new student profiles registered in system.", time: "10 mins ago", unread: true, type: "primary" },
  { id: 2, title: "Database Auto-Saved", text: "Local database state saved to storage.", time: "1 hour ago", unread: true, type: "success" },
  { id: 3, title: "System Security Audit", text: "Zero security flags detected in active session.", time: "3 hours ago", unread: false, type: "info" }
];

// --- Tab Titles Mapping ---
const TAB_TITLES = {
  "dashboard": { title: "Dashboard", subtitle: "Welcome back, Admin!" },
  "add-student": { title: "Add Student", subtitle: "Register a new student into the database" },
  "students": { title: "Students Directory", subtitle: "Manage, filter and search all active records" },
  "search": { title: "Search Student", subtitle: "Quick lookup student profiles instantly" },
  "statistics": { title: "Statistics & Demographics", subtitle: "Detailed data insights and metrics" },
  "settings": { title: "System Settings", subtitle: "Local database backups & theme preferences" }
};

// --- DOM References ---
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarToggleBtn = document.getElementById("sidebarToggle");
const pageTitleEl = document.getElementById("pageTitle");
const pageSubtitleEl = document.getElementById("pageSubtitle");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const digitalClockEl = document.getElementById("digitalClock");
const currentDateEl = document.getElementById("currentDate");

// Form Elements
const studentForm = document.getElementById("studentForm");
const fullNameInput = document.getElementById("fullName");
const fatherNameInput = document.getElementById("fatherName");
const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const cityInput = document.getElementById("city");
const submitBtn = document.getElementById("submitBtn");
const formCardTitle = document.getElementById("formCardTitle");
const generatedIdBadge = document.getElementById("generatedIdBadge");

// Tables & Inputs
const recentTableBody = document.getElementById("recentTableBody");
const fullDirectoryTableBody = document.getElementById("fullDirectoryTableBody");
const searchResultsTableBody = document.getElementById("searchResultsTableBody");
const emptyState = document.getElementById("emptyState");

const directorySearchInput = document.getElementById("directorySearchInput");
const heroSearchInput = document.getElementById("heroSearchInput");
const courseFilter = document.getElementById("courseFilter");
const genderFilter = document.getElementById("genderFilter");
const sortBySelect = document.getElementById("sortBy");
const directoryCountInfo = document.getElementById("directoryCountInfo");

// Modals
const detailsModal = document.getElementById("detailsModal");
const modalStudentDetailsBody = document.getElementById("modalStudentDetailsBody");
const deleteModal = document.getElementById("deleteModal");
const deleteStudentName = document.getElementById("deleteStudentName");
const toastContainer = document.getElementById("toastContainer");

// --- INITIALIZATION ---
function init() {
  initTheme();
  initClock();
  checkAuthState();
  loadStudents();
  generateIdCode();
  setupEventListeners();
  renderAllViews();
}

// --- LOCAL STORAGE ---
function loadStudents() {
  const data = localStorage.getItem("smart_sms_students");
  if (data) {
    try {
      students = JSON.parse(data);
    } catch (e) {
      students = [...DEFAULT_STUDENTS];
      saveStudents();
    }
  } else {
    students = [...DEFAULT_STUDENTS];
    saveStudents();
  }
}

function saveStudents() {
  localStorage.setItem("smart_sms_students", JSON.stringify(students));
  updateStats();
}

function loadSampleData() {
  students = [...DEFAULT_STUDENTS];
  saveStudents();
  renderAllViews();
  showToast("Sample student records restored successfully!", "success");
}

function clearAllStudents() {
  if (confirm("Are you sure you want to clear all student records?")) {
    students = [];
    saveStudents();
    renderAllViews();
    showToast("All student records cleared.", "info");
  }
}

// --- ID GENERATOR ---
function generateIdCode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  generatedId = `STU-${randomNum}`;
  if (generatedIdBadge) generatedIdBadge.textContent = generatedId;
}

// --- CLOCK & DATE ---
function initClock() {
  function updateTime() {
    const now = new Date();
    
    // Time Format (10:30:45 PM)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    
    if (digitalClockEl) digitalClockEl.textContent = timeStr;

    // Date Format (Wednesday, May 28, 2025)
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    if (currentDateEl) currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  updateTime();
  setInterval(updateTime, 1000);
}

// --- THEME MANAGEMENT ---
function initTheme() {
  const savedTheme = localStorage.getItem("smart_sms_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("smart_sms_theme", newTheme);
  updateThemeIcon(newTheme);
  
  showToast(`Switched to ${newTheme === "dark" ? "Dark" : "Light"} mode`, "info");
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll("#themeIcon, #authThemeIcon");

  icons.forEach(icon => {
    if (theme === "dark") {
      icon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      `;
    } else {
      icon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41
          M17.66 17.66l1.41 1.41M2 12h2M20 12h2
          M6.34 17.66l-1.41 1.41
          M19.07 4.93l-1.41 1.41"/>
        </svg>
      `;
    }
  });
}

// --- TAB SWITCHER ENGINE ---
function switchTab(tabId) {
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navItems.forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  tabPanes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add("active");
    } else {
      pane.classList.remove("active");
    }
  });

  // Update Page Title
  if (TAB_TITLES[tabId]) {
    pageTitleEl.textContent = TAB_TITLES[tabId].title;
    pageSubtitleEl.textContent = TAB_TITLES[tabId].subtitle;
  }

  // Close Mobile Sidebar
  closeSidebar();

  // Focus search when opening search tab
  if (tabId === "search" && heroSearchInput) {
    setTimeout(() => heroSearchInput.focus(), 100);
  }

  // Re-render views
  renderAllViews();
}

// --- NOTIFICATION SYSTEM STATE ---

function renderNotifications() {
  const notifList = document.getElementById("notifList");
  const notifBadge = document.getElementById("notifBadge");
  const notifSubtitle = document.getElementById("notifSubtitle");
  if (!notifList) return;

  const unreadCount = notifications.filter(n => n.unread).length;

  if (notifBadge) {
    if (unreadCount > 0) {
      notifBadge.style.display = "block";
      notifBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;
    } else {
      notifBadge.style.display = "none";
    }
  }

  if (notifSubtitle) {
    notifSubtitle.textContent = unreadCount > 0 ? `${unreadCount} unread system alert${unreadCount > 1 ? 's' : ''}` : "All notifications read";
  }

  if (notifications.length === 0) {
    notifList.innerHTML = `
      <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No notifications right now.
      </div>
    `;
    return;
  }

  notifList.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="toggleNotifRead(${n.id})">
      <div class="notif-item-icon icon-${n.type || 'primary'}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div class="notif-item-content">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-text">${n.text}</div>
        <div class="notif-item-time">${n.time}</div>
      </div>
      ${n.unread ? '<span class="unread-dot"></span>' : ''}
    </div>
  `).join("");
}

function toggleNotifDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById("notificationDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

function closeNotifDropdown() {
  const dropdown = document.getElementById("notificationDropdown");
  if (dropdown) dropdown.classList.remove("show");
}

function toggleNotifRead(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.unread = !notif.unread;
    renderNotifications();
  }
}

function markAllNotificationsRead() {
  notifications.forEach(n => n.unread = false);
  renderNotifications();
  showToast("All notifications marked as read", "info");
}

function clearAllNotifications() {
  notifications = [];
  renderNotifications();
  showToast("Notifications list cleared", "info");
}

function addNotification(title, text, type = "primary") {
  notifications.unshift({
    id: Date.now(),
    title,
    text,
    time: "Just now",
    unread: true,
    type
  });
  renderNotifications();
}

function toggleSidebar() {
  if (window.innerWidth <= 1024) {
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("open");
    document.body.classList.toggle("sidebar-open", sidebar.classList.contains("open"));
  } else {
    document.body.classList.toggle("sidebar-collapsed");
  }
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
  document.body.classList.remove("sidebar-open");
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = "success") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  } else {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${type.toUpperCase()}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- VALIDATION ENGINE ---
function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).toLowerCase());
}

function setFieldError(inputEl, errorElId, isValid, message) {
  const errorEl = document.getElementById(errorElId);
  if (!isValid) {
    inputEl.classList.add("is-invalid");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    }
    return false;
  } else {
    inputEl.classList.remove("is-invalid");
    if (errorEl) errorEl.classList.remove("show");
    return true;
  }
}

function validateForm() {
  const nameValid = setFieldError(fullNameInput, "fullNameError", fullNameInput.value.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(fullNameInput.value.trim()), "Full name required (min 2 letters)");
  const fatherValid = setFieldError(fatherNameInput, "fatherNameError", fatherNameInput.value.trim().length >= 2, "Father name required");
  const ageVal = ageInput.value.trim();
  const ageValid = setFieldError(ageInput, "ageError", ageVal !== "" && !isNaN(ageVal) && Number(ageVal) >= 15 && Number(ageVal) <= 100, "Valid age (15-100) required");
  const genderValid = setFieldError(genderInput, "genderError", genderInput.value !== "", "Gender selection required");
  const emailValid = setFieldError(emailInput, "emailError", validateEmail(emailInput.value.trim()), "Valid email required");
  const courseValid = setFieldError(courseInput, "courseError", courseInput.value !== "", "Course selection required");
  const cityValid = setFieldError(cityInput, "cityError", cityInput.value.trim().length >= 2, "City is required");

  return nameValid && fatherValid && ageValid && genderValid && emailValid && courseValid && cityValid;
}

function clearFormErrors() {
  [fullNameInput, fatherNameInput, ageInput, genderInput, emailInput, courseInput, cityInput].forEach(el => {
    if (el) el.classList.remove("is-invalid");
  });
  document.querySelectorAll(".error-msg").forEach(el => el.classList.remove("show"));
}

// --- FORM HANDLING (ADD & EDIT) ---
function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast("Please correct form validation errors", "error");
    return;
  }

  const formData = {
    fullName: fullNameInput.value.trim(),
    fatherName: fatherNameInput.value.trim(),
    age: parseInt(ageInput.value.trim(), 10),
    gender: genderInput.value,
    email: emailInput.value.trim(),
    course: courseInput.value,
    city: cityInput.value.trim()
  };

  if (editingStudentId) {
    // Edit Mode
    const index = students.findIndex(s => s.id === editingStudentId);
    if (index !== -1) {
      students[index] = { ...students[index], ...formData };
      saveStudents();
      showToast(`Student record for ${formData.fullName} updated!`, "success");
      addNotification("Student Profile Updated", `Record for ${formData.fullName} (${formData.course}) updated.`, "info");
    }
  } else {
    // Add Mode
    const newStudent = {
      id: generatedId,
      ...formData
    };
    students.unshift(newStudent);
    saveStudents();
    showToast(`New student ${formData.fullName} registered!`, "success");
    addNotification("New Student Registered", `${formData.fullName} enrolled in ${formData.course}.`, "success");
  }

  resetFormState();
  switchTab("students");
}

function resetFormState() {
  studentForm.reset();
  clearFormErrors();
  editingStudentId = null;
  formCardTitle.textContent = "Register New Student";
  submitBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    <span>Save Student</span>
  `;
  generateIdCode();
}

function startEditStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  editingStudentId = id;
  fullNameInput.value = student.fullName;
  fatherNameInput.value = student.fatherName;
  ageInput.value = student.age;
  genderInput.value = student.gender;
  emailInput.value = student.email;
  courseInput.value = student.course;
  cityInput.value = student.city;

  if (generatedIdBadge) generatedIdBadge.textContent = student.id;
  if (formCardTitle) formCardTitle.textContent = "Edit Student Record";
  
  if (submitBtn) {
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      <span>Update Record</span>
    `;
  }

  clearFormErrors();
  switchTab("add-student");
}

// --- DELETE MODAL ---
function promptDeleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  deletingStudentId = id;
  if (deleteStudentName) deleteStudentName.textContent = student.fullName;
  if (deleteModal) {
    deleteModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeDeleteModal() {
  deletingStudentId = null;
  if (deleteModal) {
    deleteModal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function confirmDeleteStudent() {
  if (!deletingStudentId) return;

  const student = students.find(s => s.id === deletingStudentId);
  const name = student ? student.fullName : "Student";

  students = students.filter(s => s.id !== deletingStudentId);
  saveStudents();

  if (editingStudentId === deletingStudentId) {
    resetFormState();
  }

  closeDeleteModal();
  renderAllViews();
  showToast(`Deleted record for ${name}`, "info");
}

// --- VIEW DETAILS MODAL ---
function viewStudentDetails(id) {
  const student = students.find(s => s.id === id);
  if (!student || !modalStudentDetailsBody) return;

  modalStudentDetailsBody.innerHTML = `
    <div class="student-profile-summary">
      <div class="profile-avatar-lg">${student.fullName.charAt(0)}</div>
      <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary);">${student.fullName}</h3>
      <span class="id-text" style="margin-top: 0.2rem;">${student.id}</span>

      <div class="detail-grid">
        <div class="detail-box">
          <label>Father Name</label>
          <p>${student.fatherName}</p>
        </div>
        <div class="detail-box">
          <label>Age</label>
          <p>${student.age} Years</p>
        </div>
        <div class="detail-box">
          <label>Gender</label>
          <p>${student.gender}</p>
        </div>
        <div class="detail-box">
          <label>Course</label>
          <p>${student.course}</p>
        </div>
        <div class="detail-box">
          <label>Email</label>
          <p style="font-size: 0.8rem; word-break: break-all;">${student.email}</p>
        </div>
        <div class="detail-box">
          <label>City</label>
          <p>${student.city}</p>
        </div>
      </div>
    </div>
  `;

  if (detailsModal) {
    detailsModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeDetailsModal() {
  if (detailsModal) {
    detailsModal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// --- AUTHENTICATION STATE & LOGIC ---
let currentUser = null;

function checkAuthState() {
  const savedUser = localStorage.getItem("sms_auth_user");
  const authScreen = document.getElementById("authScreen");
  const appLayout = document.querySelector(".app-layout");

  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      currentUser = { name: "Admin User", role: "Administrator", email: "admin@sms.edu" };
    }
  }

  if (currentUser) {
    // User is logged in
    if (authScreen) authScreen.classList.add("auth-hidden");
    if (appLayout) appLayout.style.display = "flex";
    updateSidebarUserInfo();
  } else {
    // User is not logged in -> show login screen
    if (authScreen) authScreen.classList.remove("auth-hidden");
    if (appLayout) appLayout.style.display = "none";
  }
}

function updateSidebarUserInfo() {
  if (!currentUser) return;
  const userNameEl = document.querySelector(".user-name");
  const userRoleEl = document.querySelector(".user-role");
  if (userNameEl) userNameEl.textContent = currentUser.name || "Admin User";
  if (userRoleEl) userRoleEl.textContent = currentUser.role || "Administrator";
}

function switchAuthTab(tab) {
  const sideTabLogin = document.getElementById("sideTabLogin");
  const sideTabSignup = document.getElementById("sideTabSignup");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authFormTitle = document.getElementById("authFormTitle");
  const authFormSubtitle = document.getElementById("authFormSubtitle");

  if (tab === 'login') {
    if (sideTabLogin) sideTabLogin.classList.add("active");
    if (sideTabSignup) sideTabSignup.classList.remove("active");
    if (loginForm) loginForm.classList.add("active");
    if (signupForm) signupForm.classList.remove("active");
    if (authFormTitle) authFormTitle.textContent = "LOGIN";
    if (authFormSubtitle) authFormSubtitle.textContent = "Welcome back! Please enter your details.";
  } else {
    if (sideTabSignup) sideTabSignup.classList.add("active");
    if (sideTabLogin) sideTabLogin.classList.remove("active");
    if (signupForm) signupForm.classList.add("active");
    if (loginForm) loginForm.classList.remove("active");
    if (authFormTitle) authFormTitle.textContent = "SIGN UP";
    if (authFormSubtitle) authFormSubtitle.textContent = "Create your SMS administrative account.";
  }
}

let isLoginPasswordShown = false;
function toggleLoginPasswordVisibility() {
  const loginPwdInput = document.getElementById("loginPassword");
  const loginEyeIcon = document.getElementById("loginEyeIcon");
  if (!loginPwdInput) return;

  isLoginPasswordShown = !isLoginPasswordShown;
  if (isLoginPasswordShown) {
    loginPwdInput.type = "text";
    if (loginEyeIcon) {
      loginEyeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    }
  } else {
    loginPwdInput.type = "password";
    if (loginEyeIcon) {
      loginEyeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
  }
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";

  if (!email || !password) {
    showToast("Please fill in both email and password.", "error");
    return;
  }

  const user = {
    name: email.toLowerCase().includes("admin") ? "Admin User" : email.split("@")[0],
    email: email,
    role: "Administrator",
    loginTime: new Date().toISOString()
  };

  currentUser = user;
  localStorage.setItem("sms_auth_user", JSON.stringify(user));

  showToast(`Welcome back, ${user.name}! Login successful.`, "success");
  checkAuthState();
}

function handleSignupSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const roleInput = document.getElementById("signupRole");
  const pwdInput = document.getElementById("signupPassword");
  const confirmPwdInput = document.getElementById("signupConfirmPassword");

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const role = roleInput ? roleInput.value : "Administrator";
  const pwd = pwdInput ? pwdInput.value : "";
  const confirmPwd = confirmPwdInput ? confirmPwdInput.value : "";

  if (!name || !email || !pwd) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  if (pwd !== confirmPwd) {
    showToast("Passwords do not match. Please try again.", "error");
    return;
  }

  const user = {
    name: name,
    email: email,
    role: role,
    loginTime: new Date().toISOString()
  };

  currentUser = user;
  localStorage.setItem("sms_auth_user", JSON.stringify(user));

  showToast(`Account created! Welcome to Smart SMS, ${name}.`, "success");
  checkAuthState();
}

function quickFillAdminCredentials() {
  const emailInput = document.getElementById("loginEmail");
  const pwdInput = document.getElementById("loginPassword");
  if (emailInput) emailInput.value = "admin@sms.edu";
  if (pwdInput) pwdInput.value = "admin@smart2026";
  
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  }
}

function handleForgotPassword() {
  const email = prompt("Enter your account email to receive a password reset link:", "admin@sms.edu");
  if (email) {
    showToast(`Password reset link dispatched to ${email}`, "info");
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("sms_auth_user");
  closeAdminModal();
  checkAuthState();
  showToast("Logged out successfully.", "info");
}

// --- ADMIN USER MODAL & CREDENTIALS ---
let isAdminPasswordShown = false;

function openAdminModal() {
  const adminModal = document.getElementById("adminModal");
  if (adminModal) {
    adminModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeAdminModal() {
  const adminModal = document.getElementById("adminModal");
  if (adminModal) {
    adminModal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function toggleAdminPassword() {
  const pwdEl = document.getElementById("adminPasswordText");
  const eyeIcon = document.getElementById("eyeIcon");
  if (!pwdEl) return;

  isAdminPasswordShown = !isAdminPasswordShown;
  if (isAdminPasswordShown) {
    pwdEl.textContent = "admin@smart2026";
    pwdEl.style.letterSpacing = "0.5px";
    if (eyeIcon) {
      eyeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    }
  } else {
    pwdEl.textContent = "••••••••••••";
    pwdEl.style.letterSpacing = "2px";
    if (eyeIcon) {
      eyeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
  }
}

function copyToClipboard(text, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label || 'Details'} copied to clipboard!`, "success");
    }).catch(() => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
    showToast(`${label || 'Details'} copied to clipboard!`, "success");
  } catch (err) {
    showToast(`Failed to copy details`, "error");
  }
  document.body.removeChild(textArea);
}

// --- RENDER VIEWS & TABLES ---
function renderRecentTable() {
  if (!recentTableBody) return;
  const recentList = students.slice(0, 6); // First 6 students

  if (recentList.length === 0) {
    recentTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No student records available</td></tr>`;
    return;
  }

  recentTableBody.innerHTML = recentList.map(s => {
    const genderClass = s.gender.toLowerCase() === "female" ? "female" : (s.gender.toLowerCase() === "male" ? "male" : "other");
    return `
      <tr>
        <td class="id-text">${s.id}</td>
        <td><strong>${s.fullName}</strong></td>
        <td>${s.fatherName}</td>
        <td>${s.age}</td>
        <td><span class="badge-gender ${genderClass}">${s.gender}</span></td>
        <td>${s.city}</td>
        <td>
          <button class="tbl-btn view-btn" onclick="viewStudentDetails('${s.id}')" title="View Profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderDirectoryTable() {
  if (!fullDirectoryTableBody) return;

  const query = (directorySearchInput ? directorySearchInput.value : "").trim().toLowerCase();
  const courseVal = courseFilter ? courseFilter.value : "All";
  const genderVal = genderFilter ? genderFilter.value : "All";
  const sortVal = sortBySelect ? sortBySelect.value : "id-desc";

  let filtered = students.filter(s => {
    const matchesQuery = s.fullName.toLowerCase().includes(query) ||
                         s.id.toLowerCase().includes(query) ||
                         s.city.toLowerCase().includes(query) ||
                         s.course.toLowerCase().includes(query);
    const matchesCourse = courseVal === "All" || s.course === courseVal;
    const matchesGender = genderVal === "All" || s.gender === genderVal;

    return matchesQuery && matchesCourse && matchesGender;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortVal === "name-asc") return a.fullName.localeCompare(b.fullName);
    if (sortVal === "name-desc") return b.fullName.localeCompare(a.fullName);
    if (sortVal === "age-asc") return a.age - b.age;
    if (sortVal === "age-desc") return b.age - a.age;
    return 0; // default order
  });

  if (directoryCountInfo) {
    directoryCountInfo.textContent = `Showing ${filtered.length} of ${students.length} students`;
  }

  if (filtered.length === 0) {
    fullDirectoryTableBody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  fullDirectoryTableBody.innerHTML = filtered.map(s => {
    const genderClass = s.gender.toLowerCase() === "female" ? "female" : (s.gender.toLowerCase() === "male" ? "male" : "other");
    return `
      <tr>
        <td class="id-text">${s.id}</td>
        <td><strong>${s.fullName}</strong></td>
        <td>${s.fatherName}</td>
        <td>${s.age}</td>
        <td><span class="badge-gender ${genderClass}">${s.gender}</span></td>
        <td>${s.course}</td>
        <td>${s.city}</td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn view-btn" onclick="viewStudentDetails('${s.id}')" title="View Profile">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="tbl-btn edit-btn" onclick="startEditStudent('${s.id}')" title="Edit Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="tbl-btn delete-btn" onclick="promptDeleteStudent('${s.id}')" title="Delete Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderSearchResults() {
  if (!searchResultsTableBody) return;
  const query = (heroSearchInput ? heroSearchInput.value : "").trim().toLowerCase();

  const results = students.filter(s => {
    return s.fullName.toLowerCase().includes(query) ||
           s.id.toLowerCase().includes(query) ||
           s.city.toLowerCase().includes(query) ||
           s.course.toLowerCase().includes(query);
  });

  if (results.length === 0) {
    searchResultsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color:var(--text-muted);">No student matches found for "${query}"</td></tr>`;
    return;
  }

  searchResultsTableBody.innerHTML = results.map(s => {
    const genderClass = s.gender.toLowerCase() === "female" ? "female" : (s.gender.toLowerCase() === "male" ? "male" : "other");
    return `
      <tr>
        <td class="id-text">${s.id}</td>
        <td><strong>${s.fullName}</strong></td>
        <td>${s.fatherName}</td>
        <td>${s.age}</td>
        <td><span class="badge-gender ${genderClass}">${s.gender}</span></td>
        <td>${s.course}</td>
        <td>${s.city}</td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-btn view-btn" onclick="viewStudentDetails('${s.id}')" title="View Profile">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="tbl-btn edit-btn" onclick="startEditStudent('${s.id}')" title="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// --- DYNAMIC STATISTICS CALCULATIONS ---
function updateStats() {
  const total = students.length;
  const males = students.filter(s => s.gender === "Male").length;
  const females = students.filter(s => s.gender === "Female").length;

  const sumAge = students.reduce((acc, s) => acc + Number(s.age), 0);
  const avgAge = total > 0 ? (sumAge / total).toFixed(1) : "0";

  // Top Stat Cards
  document.getElementById("statTotalStudents").textContent = total;
  document.getElementById("statMaleStudents").textContent = males;
  document.getElementById("statFemaleStudents").textContent = females;
  document.getElementById("statAvgAge").textContent = avgAge;

  const malePct = total > 0 ? ((males / total) * 100).toFixed(1) : "0";
  const femalePct = total > 0 ? ((females / total) * 100).toFixed(1) : "0";

  document.getElementById("statMalePct").textContent = `${malePct}% of total`;
  document.getElementById("statFemalePct").textContent = `${femalePct}% of total`;

  // Statistics Tab KPI metrics
  const distMaleCount = document.getElementById("distMaleCount");
  const distFemaleCount = document.getElementById("distFemaleCount");
  const distMaleBar = document.getElementById("distMaleBar");
  const distFemaleBar = document.getElementById("distFemaleBar");
  const distMaleRatio = document.getElementById("distMaleRatio");
  const distFemaleRatio = document.getElementById("distFemaleRatio");
  const kpiGenderRatio = document.getElementById("kpiGenderRatio");
  const kpiAgeRange = document.getElementById("kpiAgeRange");

  if (distMaleCount) distMaleCount.textContent = males;
  if (distFemaleCount) distFemaleCount.textContent = females;
  if (distMaleBar) distMaleBar.style.width = `${malePct}%`;
  if (distFemaleBar) distFemaleBar.style.width = `${femalePct}%`;
  if (distMaleRatio) distMaleRatio.textContent = `${malePct}%`;
  if (distFemaleRatio) distFemaleRatio.textContent = `${femalePct}%`;
  if (kpiGenderRatio) kpiGenderRatio.textContent = `${malePct}% / ${femalePct}%`;

  // Overview Tab metrics
  const ages = students.map(s => Number(s.age));
  const minAge = ages.length > 0 ? Math.min(...ages) : 0;
  const maxAge = ages.length > 0 ? Math.max(...ages) : 0;

  const statOverviewTotal = document.getElementById("statOverviewTotal");
  const statOverviewAvgAge = document.getElementById("statOverviewAvgAge");

  if (statOverviewTotal) statOverviewTotal.textContent = total;
  if (statOverviewAvgAge) statOverviewAvgAge.textContent = `${avgAge} yrs`;
  if (kpiAgeRange) kpiAgeRange.textContent = `Range ${minAge}-${maxAge} yrs`;

  // Course Breakdown Analytics
  const courseCounts = {};
  students.forEach(s => {
    if (s.course) {
      courseCounts[s.course] = (courseCounts[s.course] || 0) + 1;
    }
  });

  const courseStatsContainer = document.getElementById("courseStatsContainer");
  if (courseStatsContainer) {
    const courseKeys = Object.keys(courseCounts);
    if (courseKeys.length === 0) {
      courseStatsContainer.innerHTML = `<p style="color:var(--text-muted); font-size: 0.85rem;">No course data available.</p>`;
    } else {
      courseStatsContainer.innerHTML = courseKeys.map(course => {
        const count = courseCounts[course];
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        return `
          <div class="course-stat-item">
            <div class="course-stat-header">
              <span class="course-stat-name">${course}</span>
              <span class="course-stat-count"><strong>${count}</strong> (${pct}%)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill primary" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // City Breakdown Analytics
  const cityCounts = {};
  students.forEach(s => {
    if (s.city) {
      cityCounts[s.city] = (cityCounts[s.city] || 0) + 1;
    }
  });

  const uniqueCities = Object.keys(cityCounts);
  const statOverviewCities = document.getElementById("statOverviewCities");
  if (statOverviewCities) statOverviewCities.textContent = uniqueCities.length;

  const cityChipsContainer = document.getElementById("cityChipsContainer");
  if (cityChipsContainer) {
    if (uniqueCities.length === 0) {
      cityChipsContainer.innerHTML = `<p style="color:var(--text-muted); font-size: 0.85rem;">No city records recorded.</p>`;
    } else {
      cityChipsContainer.innerHTML = uniqueCities.map(city => {
        return `
          <div class="city-stat-chip">
            <span class="city-name">${city}</span>
            <span class="city-badge-count">${cityCounts[city]}</span>
          </div>
        `;
      }).join("");
    }
  }

  // Minimal Age Bracket Cohort Breakdown
  const ageCohorts = {
    "15 - 18 yrs": 0,
    "19 - 21 yrs": 0,
    "22 - 25 yrs": 0,
    "26+ yrs": 0
  };

  students.forEach(s => {
    const age = Number(s.age);
    if (age <= 18) ageCohorts["15 - 18 yrs"]++;
    else if (age <= 21) ageCohorts["19 - 21 yrs"]++;
    else if (age <= 25) ageCohorts["22 - 25 yrs"]++;
    else ageCohorts["26+ yrs"]++;
  });

  const ageCohortsContainer = document.getElementById("ageCohortsContainer");
  if (ageCohortsContainer) {
    ageCohortsContainer.innerHTML = Object.keys(ageCohorts).map(bracket => {
      const count = ageCohorts[bracket];
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
      return `
        <div class="course-stat-item">
          <div class="course-stat-header">
            <span class="course-stat-name">${bracket}</span>
            <span class="course-stat-count"><strong>${count}</strong> (${pct}%)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill primary" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join("");
  }
}

function exportStatsReport() {
  if (students.length === 0) {
    showToast("No student records available to export", "error");
    return;
  }
  const headers = ["Student ID", "Full Name", "Father Name", "Age", "Gender", "Email", "Course", "City"];
  const rows = students.map(s => [
    `"${s.id}"`,
    `"${s.fullName}"`,
    `"${s.fatherName}"`,
    s.age,
    `"${s.gender}"`,
    `"${s.email}"`,
    `"${s.course}"`,
    `"${s.city}"`
  ]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `SMS_Student_Demographics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Demographics report exported as CSV!", "success");
}

function renderAllViews() {
  renderNotifications();
  updateStats();
  renderRecentTable();
  renderDirectoryTable();
  renderSearchResults();
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Navigation tabs
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Mobile & Desktop sidebar toggle
  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener("click", toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

  // Notification listeners
  const notifBtn = document.getElementById("id_btn_notifications");
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  const clearNotifBtn = document.getElementById("clearNotifBtn");

  if (notifBtn) notifBtn.addEventListener("click", toggleNotifDropdown);
  if (markAllReadBtn) markAllReadBtn.addEventListener("click", markAllNotificationsRead);
  if (clearNotifBtn) clearNotifBtn.addEventListener("click", clearAllNotifications);

  // Close notification dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const notifWrapper = document.querySelector(".notif-wrapper");
    if (notifWrapper && !notifWrapper.contains(e.target)) {
      closeNotifDropdown();
    }
  });

  // Theme button
  if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);

  // Form submit & validation listeners
  if (studentForm) studentForm.addEventListener("submit", handleFormSubmit);

  [fullNameInput, fatherNameInput, ageInput, genderInput, emailInput, courseInput, cityInput].forEach(input => {
    if (input) {
      input.addEventListener("blur", () => validateForm());
    }
  });

  // Search & Filter listeners
  if (directorySearchInput) directorySearchInput.addEventListener("input", renderDirectoryTable);
  if (courseFilter) courseFilter.addEventListener("change", renderDirectoryTable);
  if (genderFilter) genderFilter.addEventListener("change", renderDirectoryTable);
  if (sortBySelect) sortBySelect.addEventListener("change", renderDirectoryTable);

  if (heroSearchInput) heroSearchInput.addEventListener("input", renderSearchResults);

  // Escape key closes modals & dropdowns
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAdminModal();
      closeDetailsModal();
      closeDeleteModal();
      closeNotifDropdown();
    }
  });
}

// Global window function exports for inline HTML event handlers
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.toggleAdminPassword = toggleAdminPassword;
window.copyToClipboard = copyToClipboard;
window.switchAuthTab = switchAuthTab;
window.toggleLoginPasswordVisibility = toggleLoginPasswordVisibility;
window.handleLoginSubmit = handleLoginSubmit;
window.handleSignupSubmit = handleSignupSubmit;
window.quickFillAdminCredentials = quickFillAdminCredentials;
window.handleForgotPassword = handleForgotPassword;
window.handleLogout = handleLogout;
window.viewStudentDetails = viewStudentDetails;
window.startEditStudent = startEditStudent;
window.promptDeleteStudent = promptDeleteStudent;
window.confirmDeleteStudent = confirmDeleteStudent;
window.closeDeleteModal = closeDeleteModal;
window.closeDetailsModal = closeDetailsModal;
window.switchTab = switchTab;
window.resetFormState = resetFormState;
window.loadSampleData = loadSampleData;
window.clearAllStudents = clearAllStudents;
window.toggleTheme = toggleTheme;
window.exportStatsReport = exportStatsReport;
window.toggleNotifRead = toggleNotifRead;
window.markAllNotificationsRead = markAllNotificationsRead;
window.clearAllNotifications = clearAllNotifications;
window.toggleNotifDropdown = toggleNotifDropdown;
window.closeNotifDropdown = closeNotifDropdown;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;

// Initialize app when DOM is ready and all script resources/functions are loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
