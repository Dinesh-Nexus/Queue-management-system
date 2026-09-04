// In-memory state store
const DB = {
  patients: [],
  users: [
    { name: 'Admin User', email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
    { name: 'Dr. Sarah Chen', email: 'doctor@hospital.com', password: 'doc123', role: 'doctor' },
    { name: 'Nurse Mary', email: 'nurse@hospital.com', password: 'nurse123', role: 'nurse' }
  ],
  currentUser: null
};

// Seed patient data
DB.patients = [
  { id: 1, name: 'John Mayer', age: 62, symptoms: 'Chest pain, shortness of breath', priority: 'Serious', status: 'Waiting', date: new Date().toLocaleString(), bp: '160/100', temp: 38.9, pulse: 112, spo2: 91 },
  { id: 2, name: 'Priya Sharma', age: 34, symptoms: 'Moderate fever, body aches', priority: 'Little Serious', status: 'Treated', date: new Date().toLocaleString(), bp: 'Normal', temp: 38.2, pulse: 92, spo2: 96 },
  { id: 3, name: 'Tom Brown', age: 25, symptoms: 'Minor cut on hand', priority: 'Good', status: 'Treated', date: new Date().toLocaleString(), bp: 'Normal', temp: 36.8, pulse: 72, spo2: 99 },
];

let nextId = 4;

function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function toggleEye(inputId, btn) {
  const inp = document.getElementById(inputId);
  const isPass = inp.type === 'password';
  inp.type = isPass ? 'text' : 'password';
  btn.innerHTML = isPass
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  if (!email || !pass) return showToast('Please fill in all fields');
  
  const user = DB.users.find(u => u.email === email && u.password === pass);
  if (!user) return showToast('Invalid credentials. Try demo: admin@hospital.com / admin123');
  
  DB.currentUser = user;
  loadDashboard(user);
}

function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-password').value.trim();
  const roleEl = document.querySelector('input[name="role"]:checked');
  if (!name || !email || !pass || !roleEl) return showToast('Please fill in all fields');
  if (DB.users.find(u => u.email === email)) return showToast('Email already registered');

  const user = { name, email, password: pass, role: roleEl.value };
  DB.users.push(user);
  DB.currentUser = user;
  showToast('Account created successfully!');
  loadDashboard(user);
}

function loadDashboard(user) {
  if (user.role === 'nurse') {
    document.getElementById('nurse-name-display').textContent = user.name;
    goTo('page-nurse');
  } else if (user.role === 'doctor') {
    document.getElementById('doctor-name-display').textContent = user.name;
    renderDoctorTable();
    goTo('page-doctor');
  } else {
    document.getElementById('admin-name-display').textContent = user.name;
    renderAdminDash();
    goTo('page-admin');
  }
}

function logout() {
  DB.currentUser = null;
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  goTo('page-login');
  showToast('Logged out successfully');
}

function calculateTriage(temp, pulse, spo2, bpStatus) {
  let score = 0;
  if (temp > 39.5 || temp < 35) score += 3;
  else if (temp > 38.5) score += 1;

  if (pulse > 120 || pulse < 50) score += 3;
  else if (pulse > 100 || pulse < 60) score += 1;

  if (spo2 < 90) score += 4;
  else if (spo2 < 95) score += 2;

  if (bpStatus === 'Abnormal') score += 2;

  if (score >= 4) return 'Serious';
  if (score >= 2) return 'Little Serious';
  return 'Good';
}

function submitTriage() {
  const name = document.getElementById('pt-name').value.trim();
  const age = document.getElementById('pt-age').value.trim();
  const symptoms = document.getElementById('pt-symptoms').value.trim();
  const bpStatus = document.getElementById('pt-bp-status').value;
  const temp = parseFloat(document.getElementById('pt-temp').value);
  const pulse = parseFloat(document.getElementById('pt-pulse').value);
  const spo2 = parseFloat(document.getElementById('pt-spo2').value);

  if (!name || !age || !symptoms) return showToast('Please fill in patient information');
  if (isNaN(temp) || isNaN(pulse) || isNaN(spo2)) return showToast('Please enter all vital signs');

  const priority = calculateTriage(temp, pulse, spo2, bpStatus);
  const patient = {
    id: nextId++,
    name, 
    age: parseInt(age), 
    symptoms, 
    priority, 
    status: 'Waiting',
    date: new Date().toLocaleString(),
    bp: document.getElementById('pt-bp-val').value || bpStatus,
    temp, 
    pulse, 
    spo2
  };
  DB.patients.push(patient);

  const resultEl = document.getElementById('triage-result');
  const configs = {
    'Serious': { icon: '🔴', title: '🔴 Serious — Immediate Attention Required', desc: 'Patient vitals indicate a critical condition. Notify doctor immediately.', cls: 'result-red' },
    'Little Serious': { icon: '🟡', title: '🟡 Moderately Serious — Prompt Evaluation Needed', desc: 'Patient requires timely medical evaluation. Monitor closely.', cls: 'result-yellow' },
    'Good': { icon: '🟢', title: '🟢 Stable — Standard Care', desc: 'Patient vitals are within acceptable range. Standard treatment protocol.', cls: 'result-green' }
  };
  const cfg = configs[priority];
  resultEl.className = 'triage-result show ' + cfg.cls;
  document.getElementById('result-icon').textContent = cfg.icon;
  document.getElementById('result-title').textContent = cfg.title;
  document.getElementById('result-desc').textContent = cfg.desc;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast('Patient triaged successfully!');

  ['pt-name','pt-age','pt-symptoms','pt-bp-val','pt-temp','pt-pulse','pt-spo2','pt-rr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function renderDoctorTable() {
  const tbody = document.getElementById('doctor-tbody');
  const empty = document.getElementById('doctor-empty');
  const sorted = [...DB.patients].sort((a, b) => {
    const order = { 'Serious': 0, 'Little Serious': 1, 'Good': 2 };
    return order[a.priority] - order[b.priority];
  });

  if (sorted.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = sorted.map(p => {
    const bc = p.priority === 'Serious' ? 'badge-red' : p.priority === 'Little Serious' ? 'badge-yellow' : 'badge-green';
    const treated = p.status === 'Treated';
    return `<tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.age}</td>
      <td style="max-width:200px;font-size:13px;color:var(--text-light)">${p.symptoms}</td>
      <td><span class="badge ${bc}">${p.priority}</span></td>
      <td class="${treated ? 'status-treated' : 'status-waiting'}">${treated ? '✓ Treated' : '⏳ Waiting'}</td>
      <td><button class="action-btn ${treated ? 'treated' : ''}" onclick="markTreated(${p.id})">${treated ? '✓ Done' : 'Mark Treated'}</button></td>
    </tr>`;
  }).join('');
}

function markTreated(id) {
  const p = DB.patients.find(x => x.id === id);
  if (p && p.status !== 'Treated') {
    p.status = 'Treated';
    renderDoctorTable();
    showToast(`${p.name} marked as treated`);
  }
}

function renderAdminDash() {
  const total = DB.patients.length;
  const serious = DB.patients.filter(p => p.priority === 'Serious').length;
  const little = DB.patients.filter(p => p.priority === 'Little Serious').length;
  const good = DB.patients.filter(p => p.priority === 'Good').length;
  const treated = DB.patients.filter(p => p.status === 'Treated').length;

  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card stat-blue"><div class="stat-num">${total}</div><div class="stat-label">Total Patients Today</div></div>
    <div class="stat-card stat-red"><div class="stat-num">${serious}</div><div class="stat-label">Serious Patients</div></div>
    <div class="stat-card stat-yellow"><div class="stat-num">${little}</div><div class="stat-label">Little Serious</div></div>
    <div class="stat-card stat-green"><div class="stat-num">${good}</div><div class="stat-label">Stable Patients</div></div>
    <div class="stat-card stat-gray"><div class="stat-num">${treated}</div><div class="stat-label">Patients Treated</div></div>
  `;

  const tbody = document.getElementById('admin-tbody');
  const empty = document.getElementById('admin-empty');
  if (DB.patients.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  tbody.innerHTML = DB.patients.map(p => {
    const bc = p.priority === 'Serious' ? 'badge-red' : p.priority === 'Little Serious' ? 'badge-yellow' : 'badge-green';
    const sc = p.status === 'Treated' ? 'badge-green' : 'badge-yellow';
    return `<tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.age}</td>
      <td><span class="badge ${bc}">${p.priority}</span></td>
      <td><span class="badge ${sc}">${p.status}</span></td>
      <td style="font-size:13px;color:var(--text-light)">${p.date}</td>
    </tr>`;
  }).join('');
}