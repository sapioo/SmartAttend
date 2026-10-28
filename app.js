/**
 * Smart Attendance Portal
 * Minimalist, Zero-Backend Reactive Client Engine
 */

// -------------------------------------------------------------
// 1. Initial College Dataset
// -------------------------------------------------------------
const INITIAL_STUDENTS = [
  { roll: "21CS001", name: "Aarav Patel", status: "present", time: "09:02 AM", device: "Pixel 7", attendancePct: 88, phone: "+91 98765-43210" },
  { roll: "21CS002", name: "Ananya Iyer", status: "present", time: "09:03 AM", device: "iPhone 13", attendancePct: 92, phone: "+91 98765-43211" },
  { roll: "21CS003", name: "Aditya Nair", status: "present", time: "09:04 AM", device: "Samsung S23", attendancePct: 84, phone: "+91 98765-43212" },
  { roll: "21CS007", name: "Bhavna Rao", status: "absent", time: "-", device: "OnePlus 10T", attendancePct: 69, phone: "+91 98765-43213" },
  { roll: "21CS012", name: "Chetan Kumar", status: "absent", time: "-", device: "iPhone 14", attendancePct: 71, phone: "+91 98765-43214" },
  { roll: "21CS015", name: "Divya Sharma", status: "present", time: "09:06 AM", device: "Moto Edge", attendancePct: 89, phone: "+91 98765-43215" },
  { roll: "21CS020", name: "Harsh Vardhan", status: "absent", time: "-", device: "Redmi Note", attendancePct: 64, phone: "+91 98765-43216" },
  { roll: "21CS024", name: "Ishaan Mehta", status: "present", time: "09:08 AM", device: "iPhone 12", attendancePct: 81, phone: "+91 98765-43217" },
  { roll: "21CS029", name: "Kavya Deshmukh", status: "present", time: "09:09 AM", device: "Samsung A54", attendancePct: 95, phone: "+91 98765-43218" },
  { roll: "21CS033", name: "Manish Reddy", status: "absent", time: "-", device: "Vivo X90", attendancePct: 62, phone: "+91 98765-43219" },
  { roll: "21CS037", name: "Neha Joshi", status: "present", time: "09:10 AM", device: "iPhone 15", attendancePct: 86, phone: "+91 98765-43220" },
  { roll: "21CS042", name: "Rahul Sharma (You)", status: "absent", time: "-", device: "OnePlus 11R", attendancePct: 78, phone: "+91 98765-43221" },
  { roll: "21CS045", name: "Riya Sen", status: "present", time: "09:11 AM", device: "Pixel 6a", attendancePct: 90, phone: "+91 98765-43222" },
  { roll: "21CS048", name: "Rohan Gupta", status: "absent", time: "-", device: "Nothing Phone", attendancePct: 58, phone: "+91 98765-43223" },
  { roll: "21CS052", name: "Sameer Khan", status: "present", time: "09:12 AM", device: "iPhone 14", attendancePct: 83, phone: "+91 98765-43224" },
  { roll: "21CS055", name: "Shreya Ghoshal", status: "absent", time: "-", device: "Samsung S22", attendancePct: 73, phone: "+91 98765-43225" },
  { roll: "21CS058", name: "Siddharth Das", status: "present", time: "09:12 AM", device: "Poco F5", attendancePct: 85, phone: "+91 98765-43226" },
  { roll: "21CS061", name: "Tanvi Kulkarni", status: "present", time: "09:13 AM", device: "OnePlus Nord", attendancePct: 91, phone: "+91 98765-43227" },
  { roll: "21CS064", name: "Utkarsh Singh", status: "absent", time: "-", device: "Realme GT", attendancePct: 67, phone: "+91 98765-43228" },
  { roll: "21CS068", name: "Varun Verma", status: "present", time: "09:14 AM", device: "iPhone 13", attendancePct: 79, phone: "+91 98765-43229" }
];

const INITIAL_SUBJECTS = {
  "CS301": { code: "CS301", name: "Operating Systems", faculty: "Prof. Arvind Raman", room: "Room 402", totalClasses: 28, attended: 24 },
  "CS305": { code: "CS305", name: "Database Systems", faculty: "Dr. Sunita Kapoor", room: "LH-1", totalClasses: 25, attended: 18 },
  "EC204": { code: "EC204", name: "Computer Networks", faculty: "Prof. K. Venkatesh", room: "Room 308", totalClasses: 27, attended: 19 }
};

const INITIAL_LEAVES = [
  { id: 1, title: "Inter-College Technical Symposium", type: "On-Duty", date: "2026-10-15", status: "Approved", impact: "2 Lectures" },
  { id: 2, title: "Zonal Athletics Meet", type: "On-Duty", date: "2026-10-22", status: "Approved", impact: "Full Day" },
  { id: 3, title: "Medical Certificate (Viral Fever)", type: "Medical", date: "2026-10-27", status: "Pending Verification", impact: "3 Lectures" }
];

// -------------------------------------------------------------
// 2. State & Cross-Tab Sync
// -------------------------------------------------------------
const STORAGE_KEY = "smartattend_cream_v2";
const syncChannel = ("BroadcastChannel" in window) ? new BroadcastChannel("smartattend_sync") : null;

let appState = {
  activeRole: "faculty",
  currentCourse: "CS301",
  sessionActive: true,
  students: JSON.parse(JSON.stringify(INITIAL_STUDENTS)),
  subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
  leaves: JSON.parse(JSON.stringify(INITIAL_LEAVES)),
  geofenceInside: true,
  currentToken: "",
  tokenExpiresAt: 0,
  rosterFilter: "all",
  searchQuery: ""
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState.students = parsed.students || appState.students;
      appState.subjects = parsed.subjects || appState.subjects;
      appState.leaves = parsed.leaves || appState.leaves;
      appState.currentCourse = parsed.currentCourse || appState.currentCourse;
      appState.sessionActive = (parsed.sessionActive !== undefined) ? parsed.sessionActive : true;
    }
  } catch (e) {
    console.error("Failed to load local state", e);
  }
}

function saveState(notifyOtherTabs = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      students: appState.students,
      subjects: appState.subjects,
      leaves: appState.leaves,
      currentCourse: appState.currentCourse,
      sessionActive: appState.sessionActive
    }));
    if (notifyOtherTabs && syncChannel) {
      syncChannel.postMessage({ type: "STATE_UPDATED" });
    }
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    loadState();
    renderAllViews();
  }
});

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data?.type === "STATE_UPDATED") {
      loadState();
      renderAllViews();
    }
  };
}

// -------------------------------------------------------------
// 3. Role Navigation
// -------------------------------------------------------------
function switchRole(role) {
  appState.activeRole = role;
  
  const roles = ["faculty", "student", "admin"];
  roles.forEach(r => {
    const btn = document.getElementById(`role-${r}-btn`);
    const view = document.getElementById(`view-${r}`);
    if (r === role) {
      btn.className = "px-3.5 py-1.5 rounded-lg transition tab-active";
      view.classList.remove("hidden");
    } else {
      btn.className = "px-3.5 py-1.5 rounded-lg transition tab-inactive";
      view.classList.add("hidden");
    }
  });

  renderAllViews();
}

// -------------------------------------------------------------
// 4. Dynamic Rotating QR Code
// -------------------------------------------------------------
let qrInstance = null;
const QR_CYCLE_SECONDS = 8;
let qrIntervalTimer = null;
let countdownIntervalTimer = null;

function generateDynamicNonce() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = "";
  for (let i = 0; i < 4; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Math.floor(Date.now() / 1000);
  return `AUTH-${appState.currentCourse}-${hash}-${timestamp.toString().slice(-4)}`;
}

function rotateQRCode() {
  if (!appState.sessionActive) return;

  appState.currentToken = generateDynamicNonce();
  appState.tokenExpiresAt = Date.now() + (QR_CYCLE_SECONDS * 1000);

  const tokenDisplay = document.getElementById("current-token-display");
  if (tokenDisplay) {
    tokenDisplay.textContent = `#${appState.currentToken}`;
  }

  const qrBox = document.getElementById("qrcode-box");
  if (qrBox) {
    qrBox.innerHTML = "";
    qrInstance = new QRCode(qrBox, {
      text: JSON.stringify({
        course: appState.currentCourse,
        token: appState.currentToken,
        room: appState.subjects[appState.currentCourse]?.room || "Room 402",
        issuedAt: Date.now()
      }),
      width: 215,
      height: 215,
      colorDark: "#1c1917",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function startQRRotationEngine() {
  rotateQRCode();

  if (qrIntervalTimer) clearInterval(qrIntervalTimer);
  qrIntervalTimer = setInterval(() => {
    rotateQRCode();
  }, QR_CYCLE_SECONDS * 1000);

  if (countdownIntervalTimer) clearInterval(countdownIntervalTimer);
  countdownIntervalTimer = setInterval(() => {
    if (!appState.sessionActive) return;
    const remainingMs = Math.max(0, appState.tokenExpiresAt - Date.now());
    const pct = (remainingMs / (QR_CYCLE_SECONDS * 1000)) * 100;
    const secondsLeft = Math.ceil(remainingMs / 1000);

    const bar = document.getElementById("countdown-bar");
    const label = document.getElementById("countdown-text");
    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `${secondsLeft}s`;
  }, 100);
}

function toggleAttendanceSession() {
  appState.sessionActive = !appState.sessionActive;
  saveState();
  updateSessionUI();
}

function updateSessionUI() {
  const btn = document.getElementById("toggle-session-btn");

  if (appState.sessionActive) {
    btn.className = "px-4 py-2 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white transition flex items-center gap-2 shadow-xs";
    btn.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>Session Active</span>`;
    startQRRotationEngine();
  } else {
    btn.className = "px-4 py-2 rounded-lg text-xs font-medium bg-white hover:bg-[#faf8f4] text-stone-700 border border-[#ded5c4] transition flex items-center gap-2 shadow-xs";
    btn.innerHTML = `<span class="w-2 h-2 rounded-full bg-stone-400"></span><span>Session Paused</span>`;
    const qrBox = document.getElementById("qrcode-box");
    if (qrBox) {
      qrBox.innerHTML = `
        <div class="text-center p-6 text-stone-500">
          <p class="font-semibold text-stone-800 text-sm">Session Paused</p>
          <p class="text-xs text-stone-500 mt-1">Check-in is temporarily halted.</p>
        </div>
      `;
    }
  }
}

function changeCourse(courseCode) {
  appState.currentCourse = courseCode;
  const course = appState.subjects[courseCode];
  document.getElementById("faculty-course-title").textContent = `${course.code}: ${course.name}`;
  saveState();
  rotateQRCode();
  renderFacultyRoster();
}

// -------------------------------------------------------------
// 5. Faculty Roster & Adjustments
// -------------------------------------------------------------
function renderFacultyRoster() {
  const container = document.getElementById("roster-container");
  if (!container) return;

  const query = appState.searchQuery.toLowerCase();
  const filter = appState.rosterFilter;

  const filtered = appState.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(query) || student.roll.toLowerCase().includes(query);
    const matchesFilter = (filter === "all") || (student.status === filter);
    return matchesSearch && matchesFilter;
  });

  const total = appState.students.length;
  const presentCount = appState.students.filter(s => s.status === "present").length;
  const absentCount = appState.students.filter(s => s.status === "absent").length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-present").textContent = presentCount;
  document.getElementById("stat-absent").textContent = absentCount;
  document.getElementById("stat-rate").textContent = `${rate}%`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-stone-500 text-xs">
        No students found matching "${query}".
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(student => {
    const isPresent = student.status === "present";
    const isLate = student.status === "late";
    
    let statusPill = "";
    if (isPresent) {
      statusPill = `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        Present (${student.time})
      </span>`;
    } else if (isLate) {
      statusPill = `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
        Late (${student.time})
      </span>`;
    } else {
      statusPill = `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
        Absent
      </span>`;
    }

    return `
      <div onclick="toggleStudentAttendance('${student.roll}')" class="roster-row px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none">
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono text-stone-500 w-16">${student.roll}</span>
          <div>
            <div class="text-xs font-medium text-stone-900">${student.name}</div>
            <div class="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
              <span>${student.device}</span>
              <span>•</span>
              <span>Total: <strong>${student.attendancePct}%</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${statusPill}
          <span class="text-[11px] text-stone-400 hover:text-stone-700 px-1 py-0.5 rounded" title="Click to cycle status">
            Edit
          </span>
        </div>
      </div>
    `;
  }).join("");
}

function toggleStudentAttendance(roll) {
  const student = appState.students.find(s => s.roll === roll);
  if (!student) return;

  if (student.status === "absent") {
    student.status = "present";
    student.time = getCurrentTimeString();
    showToast(`Marked ${student.name} as Present.`);
  } else if (student.status === "present") {
    student.status = "late";
    showToast(`Marked ${student.name} as Late.`);
  } else {
    student.status = "absent";
    student.time = "-";
    showToast(`Marked ${student.name} as Absent.`);
  }

  saveState();
  renderAllViews();
}

function filterRoster() {
  appState.searchQuery = document.getElementById("roster-search").value;
  renderFacultyRoster();
}

function setRosterFilter(filter) {
  appState.rosterFilter = filter;
  document.querySelectorAll(".roster-filter-btn").forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.className = "roster-filter-btn px-2.5 py-0.5 rounded text-stone-900 bg-white shadow-xs font-medium";
    } else {
      btn.className = "roster-filter-btn px-2.5 py-0.5 rounded text-stone-600 hover:text-stone-900";
    }
  });
  renderFacultyRoster();
}

function simulateRandomStudentScan() {
  const absentStudents = appState.students.filter(s => s.status === "absent");
  if (absentStudents.length === 0) {
    showToast("All enrolled students are already marked Present.");
    return;
  }
  const randomStudent = absentStudents[Math.floor(Math.random() * absentStudents.length)];
  randomStudent.status = "present";
  randomStudent.time = getCurrentTimeString();
  
  saveState();
  renderAllViews();
  showToast(`${randomStudent.name} registered attendance.`);
}

// -------------------------------------------------------------
// 6. Student App Controller
// -------------------------------------------------------------
function renderStudentView() {
  const rahul = appState.students.find(s => s.roll === "21CS042");
  const isPresent = rahul && rahul.status === "present";

  const scanBtn = document.getElementById("student-scan-btn");
  const scanBtnLabel = document.getElementById("scan-btn-label");
  const successCard = document.getElementById("scan-success-card");
  const receiptTime = document.getElementById("scan-receipt-time");

  if (isPresent) {
    scanBtn.className = "w-full py-3 px-4 rounded-xl bg-[#eee8dc] text-stone-700 font-medium text-xs flex items-center justify-center gap-2 cursor-default border border-[#ded5c4]";
    scanBtnLabel.textContent = "Attendance Recorded for Today";
    successCard.classList.remove("hidden");
    receiptTime.textContent = rahul.time || "09:14 AM";
  } else {
    scanBtn.className = "w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-xs";
    scanBtnLabel.textContent = "Confirm Attendance";
    successCard.classList.add("hidden");
  }

  renderStudentRadar();
  renderStudentLeaves();
}

function toggleGeofenceSimulation() {
  appState.geofenceInside = !appState.geofenceInside;
  
  const pill = document.getElementById("geofence-status-pill");
  const text = document.getElementById("geofence-location-text");

  if (appState.geofenceInside) {
    pill.className = "px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200";
    pill.textContent = "Inside Room 402 (12m)";
    text.textContent = "CS Block, 4th Floor";
    showToast("Location updated: Inside classroom boundary.");
  } else {
    pill.className = "px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200";
    pill.textContent = "Outside Classroom (380m)";
    text.textContent = "Campus Canteen area";
    showToast("Location updated: Outside classroom boundary (380m).");
  }
}

function performStudentCheckIn() {
  const rahul = appState.students.find(s => s.roll === "21CS042");
  if (rahul && rahul.status === "present") {
    showToast("Attendance is already recorded for this lecture.");
    return;
  }

  if (!appState.geofenceInside) {
    showToast("Check-in rejected: Device is outside Room 402 perimeter.", "error");
    return;
  }

  if (!appState.sessionActive) {
    showToast("Check-in rejected: Faculty session is currently paused.", "error");
    return;
  }

  rahul.status = "present";
  rahul.time = getCurrentTimeString();
  
  saveState();
  renderAllViews();
  showToast("Attendance confirmed for CS301.");
}

function renderStudentRadar() {
  const container = document.getElementById("student-subjects-grid");
  if (!container) return;

  const subjects = Object.values(appState.subjects);
  container.innerHTML = subjects.map(sub => {
    const pct = Math.round((sub.attended / sub.totalClasses) * 100);
    const isSafe = pct >= 75;

    return `
      <div class="p-4 rounded-xl bg-white border border-[#ded5c4] space-y-2 shadow-xs">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-stone-900">${sub.code}</span>
          <span class="text-[11px] ${isSafe ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}">
            ${pct}%
          </span>
        </div>
        <div class="text-[11px] text-stone-500">${sub.attended} of ${sub.totalClasses} classes attended</div>
        <div class="w-full bg-[#eee8dc] h-1.5 rounded-full overflow-hidden">
          <div class="${isSafe ? 'bg-stone-800' : 'bg-rose-600'} h-full rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function runAttendanceCalculator() {
  const subCode = document.getElementById("calc-subject").value;
  const target = parseInt(document.getElementById("calc-target").value, 10);
  const sub = appState.subjects[subCode];

  const attended = sub.attended;
  const total = sub.totalClasses;
  const currentPct = (attended / total) * 100;

  const titleEl = document.getElementById("calc-title");
  const descEl = document.getElementById("calc-desc");

  if (currentPct >= target) {
    const maxTotal = Math.floor(attended / (target / 100));
    const canMiss = Math.max(0, maxTotal - total);

    titleEl.textContent = `Status: Above ${target}% requirement`;
    if (canMiss > 0) {
      descEl.innerHTML = `You can afford to miss <strong>${canMiss} more lecture${canMiss > 1 ? 's' : ''}</strong> in ${sub.name} while retaining at least ${target}%.`;
    } else {
      descEl.innerHTML = `You are right at the threshold. Missing the next lecture will drop you below ${target}%.`;
    }
  } else {
    const needed = Math.ceil((target * total - 100 * attended) / (100 - target));

    titleEl.textContent = `Status: Below ${target}% requirement`;
    descEl.innerHTML = `You are currently at <strong>${currentPct.toFixed(1)}%</strong>. You must attend the next <strong>${needed} consecutive lecture${needed > 1 ? 's' : ''}</strong> to reach ${target}%.`;
  }
}

function renderStudentLeaves() {
  const container = document.getElementById("student-leaves-list");
  if (!container) return;

  container.innerHTML = appState.leaves.map(item => `
    <div class="py-3 flex items-center justify-between">
      <div>
        <div class="font-medium text-stone-900">${item.title}</div>
        <div class="text-[11px] text-stone-500">${item.type} • ${item.date} • Impact: ${item.impact}</div>
      </div>
      <span class="px-2.5 py-0.5 rounded-md text-[10px] font-medium ${item.status.includes('Approved') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-[#f4f0e6] text-stone-700 border border-[#ded5c4]'}">
        ${item.status}
      </span>
    </div>
  `).join("");
}

// -------------------------------------------------------------
// 7. Admin View
// -------------------------------------------------------------
function renderAdminView() {
  const defaulters = appState.students.filter(s => s.attendancePct < 75);
  
  const countEl = document.getElementById("admin-defaulters-count");
  if (countEl) countEl.textContent = `${defaulters.length} Students`;

  const tbody = document.getElementById("defaulters-table-body");
  if (tbody) {
    tbody.innerHTML = defaulters.map(student => `
      <tr class="hover:bg-[#fbf9f5] transition">
        <td class="py-3 px-4 font-medium text-stone-900">${student.name}</td>
        <td class="py-3 px-4 font-mono text-stone-600">${student.roll}</td>
        <td class="py-3 px-4 text-rose-700 font-semibold">${student.attendancePct}%</td>
        <td class="py-3 px-4 text-stone-500">EC204 (58%)</td>
        <td class="py-3 px-4 text-right">
          <button onclick="sendDirectStudentAlert('${student.name}', '${student.phone}')" class="text-stone-700 hover:text-stone-950 underline text-xs font-medium">
            Send Notice
          </button>
        </td>
      </tr>
    `).join("");
  }

  const odQueue = document.getElementById("admin-od-queue");
  if (odQueue) {
    odQueue.innerHTML = `
      <div class="py-3 flex items-center justify-between">
        <div>
          <div class="font-medium text-stone-900">Rahul Sharma (21CS042)</div>
          <div class="text-[11px] text-stone-500">Medical Certificate • 3 Lectures Missed • Prescription attached</div>
        </div>
        <button onclick="approveOD(3)" class="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition shadow-xs">
          Approve & Credit
        </button>
      </div>
    `;
  }
}

function triggerBulkDefaulterAlert() {
  const defaulters = appState.students.filter(s => s.attendancePct < 75);
  showToast(`Reminder notices dispatched to ${defaulters.length} students below 75%.`);
}

function sendDirectStudentAlert(name, phone) {
  showToast(`Notice sent to ${name} (${phone}).`);
}

function approveOD(id) {
  const leave = appState.leaves.find(l => l.id === id);
  if (leave) {
    leave.status = "Approved by HOD";
    saveState();
    renderAllViews();
    showToast("On-Duty approved. Attendance credited.");
  }
}

function exportUniversityComplianceReport() {
  const rows = [
    ["Roll Number", "Student Name", "Course", "Overall Percentage", "Status"],
    ...appState.students.map(s => [s.roll, s.name, appState.currentCourse, `${s.attendancePct}%`, s.attendancePct >= 75 ? "Eligible" : "Defaulter"])
  ];

  let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `attendance_report_${appState.currentCourse}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("CSV report generated and downloaded.");
}

function exportFacultyReport() {
  exportUniversityComplianceReport();
}

// -------------------------------------------------------------
// 8. Modals & Forms
// -------------------------------------------------------------
function openExplainerModal() {
  document.getElementById("modal-explainer").classList.remove("hidden");
}

function closeExplainerModal() {
  document.getElementById("modal-explainer").classList.add("hidden");
}

function openLeaveModal() {
  document.getElementById("modal-leave").classList.remove("hidden");
}

function closeLeaveModal() {
  document.getElementById("modal-leave").classList.add("hidden");
}

function handleLeaveSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("leave-title").value;
  const category = document.getElementById("leave-category").value;
  const date = document.getElementById("leave-date").value;
  const periods = document.getElementById("leave-periods").value;

  appState.leaves.unshift({
    id: Date.now(),
    title: title,
    type: category.includes("Medical") ? "Medical" : "On-Duty",
    date: date,
    status: "Pending Verification",
    impact: periods
  });

  saveState();
  closeLeaveModal();
  renderAllViews();
  showToast("Application submitted for faculty verification.");
}

function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  appState.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
  appState.subjects = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
  appState.leaves = JSON.parse(JSON.stringify(INITIAL_LEAVES));
  appState.currentCourse = "CS301";
  appState.sessionActive = true;
  appState.geofenceInside = true;
  saveState();
  renderAllViews();
  showToast("Data reset to default state.");
}

// -------------------------------------------------------------
// 9. Utilities & Initialization
// -------------------------------------------------------------
function getCurrentTimeString() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `p-3 rounded-xl border border-[#ded5c4] bg-white text-stone-800 shadow-md text-xs transition-opacity duration-200 pointer-events-auto`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

function renderAllViews() {
  renderFacultyRoster();
  renderStudentView();
  renderAdminView();
  runAttendanceCalculator();
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateSessionUI();
  renderAllViews();
  runAttendanceCalculator();
});
