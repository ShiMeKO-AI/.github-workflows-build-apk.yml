// Initialization
const SUPABASE_URL = 'https://iazzlcvaybwoxihfypgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhenpsY3ZheWJ3b3hpaGZ5cGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjgzNjUsImV4cCI6MjA3MjE0NDM2NX0.X7-N-XP5EoZklewo9weqqlmO6WxE6qacbRgRrqNrJR0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// i18n
export const translations = {
  pt: {
    homeTitle: 'Bem-vindo à RH Physio',
    homeDesc: 'Gestão simples de clínicas e terapeutas.',
    login: 'Login',
    logout: 'Sair',
    enter: 'Entrar',
    auth: 'Autenticação',
    register: 'Registar'
  },
  fr: {
    homeTitle: 'Bienvenue chez RH Physio',
    homeDesc: 'Gestion simple des cliniques et thérapeutes.',
    login: 'Connexion',
    logout: 'Déconnexion',
    enter: 'Entrer',
    auth: 'Authentification',
    register: 'S\u2019inscrire'
  },
  en: {
    homeTitle: 'Welcome to RH Physio',
    homeDesc: 'Simple management for clinics and therapists.',
    login: 'Login',
    logout: 'Logout',
    enter: 'Enter',
    auth: 'Authentication',
    register: 'Register'
  }
};

let currentLang = 'pt';
function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  if (!t) return;
  document.querySelector('#homeTitle').textContent = t.homeTitle;
  document.querySelector('#homeDesc').textContent = t.homeDesc;
  document.querySelector('#loginBtn').textContent = t.login;
  document.querySelector('#logoutBtn').textContent = t.logout;
  document.querySelector('#ctaEnter').textContent = t.enter;
  document.querySelector('#authTitle').textContent = t.auth;
  document.querySelector('#registerSubmit').textContent = t.register;
}

// Toast helper
function showToast(type, message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = type;
  setTimeout(() => {
    toast.textContent = '';
    toast.className = '';
  }, 4000);
}

function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(sec => sec.hidden = true);
  document.getElementById(sectionId).hidden = false;
}

// Language selector
const langSelect = document.getElementById('langSelect');
langSelect.addEventListener('change', e => setLanguage(e.target.value));
setLanguage('pt');

// Navigation buttons
const ctaEnter = document.getElementById('ctaEnter');
ctaEnter.addEventListener('click', () => showSection('authSection'));

document.getElementById('loginBtn').addEventListener('click', () => showSection('authSection'));
document.getElementById('logoutBtn').addEventListener('click', logout);

document.getElementById('showRegister').addEventListener('click', () => {
  document.getElementById('loginForm').hidden = true;
  document.getElementById('registerForm').hidden = false;
});

document.getElementById('showReset').addEventListener('click', () => {
  document.getElementById('loginForm').hidden = true;
  document.getElementById('resetForm').hidden = false;
});

document.getElementById('showLogin').addEventListener('click', () => {
  document.getElementById('registerForm').hidden = true;
  document.getElementById('loginForm').hidden = false;
});

document.getElementById('showLogin2').addEventListener('click', () => {
  document.getElementById('resetForm').hidden = true;
  document.getElementById('loginForm').hidden = false;
});

// Auth handlers
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginForm.querySelector('#loginEmail').value;
  const password = loginForm.querySelector('#loginPassword').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) showToast('error', error.message); else showToast('success', 'Bem-vindo!');
});

const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = registerForm.querySelector('#registerEmail').value;
  const password = registerForm.querySelector('#registerPassword').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) showToast('error', error.message); else showToast('success', 'Verifique o email');
});

const resetForm = document.getElementById('resetForm');
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = resetForm.querySelector('#resetEmail').value;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.href });
  if (error) showToast('error', error.message); else showToast('success', 'Email enviado');
});

async function logout() {
  await supabase.auth.signOut();
}

// Auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  const authed = !!session;
  document.getElementById('dashboardSection').hidden = !authed;
  document.getElementById('authSection').hidden = authed;
  document.getElementById('homeSection').hidden = authed;
  document.getElementById('loginBtn').hidden = authed;
  document.getElementById('logoutBtn').hidden = !authed;
  if (authed) {
    loadAll();
  }
});

function loadAll() {
  listClinics();
  listTherapists();
  listCabins();
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay()+6)%7));
  document.getElementById('weekSelect').value = monday.toISOString().slice(0,10);
  listAllocations(monday.toISOString().slice(0,10));
}

// --- CRUD Clinics ---
async function listClinics() {
  const { data, error } = await supabase.from('clinics').select();
  const list = document.getElementById('clinicsList');
  list.innerHTML = '';
  if (error) { showToast('error', error.message); return; }
  data.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name} (${c.city||''})`;
    li.addEventListener('click', () => fillClinicForm(c));
    list.appendChild(li);
  });
  populateClinicSelect(data);
}

function fillClinicForm(c) {
  document.getElementById('clinicId').value = c.id;
  document.getElementById('clinicName').value = c.name;
  document.getElementById('clinicCity').value = c.city || '';
  document.getElementById('clinicCabins').value = c.cabins_count || '';
  document.getElementById('clinicColor').value = c.color || '#000000';
}

async function createClinic(e) {
  e.preventDefault();
  const id = document.getElementById('clinicId').value;
  const payload = {
    name: document.getElementById('clinicName').value,
    city: document.getElementById('clinicCity').value,
    cabins_count: parseInt(document.getElementById('clinicCabins').value || '0'),
    color: document.getElementById('clinicColor').value
  };
  let resp;
  if (id) resp = await supabase.from('clinics').update(payload).eq('id', id);
  else resp = await supabase.from('clinics').insert(payload);
  if (resp.error) showToast('error', resp.error.message); else { showToast('success','Guardado'); listClinics(); e.target.reset(); }
}

async function deleteClinic(id) {
  const { error } = await supabase.from('clinics').delete().eq('id', id);
  if (error) showToast('error', error.message); else { showToast('success','Removido'); listClinics(); }
}

document.getElementById('clinicForm').addEventListener('submit', createClinic);

function populateClinicSelect(clinics) {
  const sel = document.getElementById('cabinClinic');
  sel.innerHTML = '';
  clinics.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

// --- CRUD Therapists ---
async function listTherapists() {
  const { data, error } = await supabase.from('therapists').select();
  const list = document.getElementById('therapistsList');
  list.innerHTML = '';
  if (error) { showToast('error', error.message); return; }
  data.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.initials} - ${t.full_name||''}`;
    li.addEventListener('click', () => fillTherapistForm(t));
    list.appendChild(li);
  });
}

function fillTherapistForm(t) {
  document.getElementById('therapistId').value = t.id;
  document.getElementById('therapistInitials').value = t.initials;
  document.getElementById('therapistName').value = t.full_name || '';
  document.getElementById('therapistPercent').value = t.contract_percent || '';
  document.getElementById('therapistNotes').value = t.notes || '';
}

async function createTherapist(e) {
  e.preventDefault();
  const id = document.getElementById('therapistId').value;
  const payload = {
    initials: document.getElementById('therapistInitials').value,
    full_name: document.getElementById('therapistName').value,
    contract_percent: parseInt(document.getElementById('therapistPercent').value || '0'),
    notes: document.getElementById('therapistNotes').value
  };
  let resp;
  if (id) resp = await supabase.from('therapists').update(payload).eq('id', id);
  else resp = await supabase.from('therapists').insert(payload);
  if (resp.error) showToast('error', resp.error.message); else { showToast('success','Guardado'); listTherapists(); e.target.reset(); }
}

document.getElementById('therapistForm').addEventListener('submit', createTherapist);

async function deleteTherapist(id) {
  const { error } = await supabase.from('therapists').delete().eq('id', id);
  if (error) showToast('error', error.message); else { showToast('success','Removido'); listTherapists(); }
}

// --- CRUD Cabins ---
async function listCabins() {
  const { data, error } = await supabase.from('cabins').select('*, clinics(name)');
  const list = document.getElementById('cabinsList');
  list.innerHTML = '';
  if (error) { showToast('error', error.message); return; }
  data.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name} - ${c.clinics?.name||''}`;
    li.addEventListener('click', () => fillCabinForm(c));
    list.appendChild(li);
  });
}

function fillCabinForm(c) {
  document.getElementById('cabinId').value = c.id;
  document.getElementById('cabinClinic').value = c.clinic_id;
  document.getElementById('cabinName').value = c.name;
  document.getElementById('cabinActive').checked = c.is_active;
}

async function createCabin(e) {
  e.preventDefault();
  const id = document.getElementById('cabinId').value;
  const payload = {
    clinic_id: document.getElementById('cabinClinic').value,
    name: document.getElementById('cabinName').value,
    is_active: document.getElementById('cabinActive').checked
  };
  let resp;
  if (id) resp = await supabase.from('cabins').update(payload).eq('id', id);
  else resp = await supabase.from('cabins').insert(payload);
  if (resp.error) showToast('error', resp.error.message); else { showToast('success','Guardado'); listCabins(); e.target.reset(); }
}

document.getElementById('cabinForm').addEventListener('submit', createCabin);

async function deleteCabin(id) {
  const { error } = await supabase.from('cabins').delete().eq('id', id);
  if (error) showToast('error', error.message); else { showToast('success','Removido'); listCabins(); }
}

// --- Allocations ---
const weekSelect = document.getElementById('weekSelect');
weekSelect.addEventListener('change', e => listAllocations(e.target.value));

async function listAllocations(weekStart) {
  const monday = new Date(weekStart);
  const dates = [...Array(5).keys()].map(i => {
    const d = new Date(monday); d.setDate(d.getDate()+i); return d.toISOString().slice(0,10);
  });
  const { data, error } = await supabase.from('allocations').select('*, therapists(initials)').in('date', dates);
  if (error) { showToast('error', error.message); return; }
  renderGrid(dates, data);
}

function renderGrid(dates, data) {
  const grid = document.getElementById('planningGrid');
  grid.innerHTML = '';
  const days = ['Seg','Ter','Qua','Qui','Sex'];
  const headerRow = document.createElement('div');
  headerRow.className = 'row';
  headerRow.appendChild(document.createElement('div')); // corner
  days.forEach(d => { const div=document.createElement('div'); div.textContent=d; headerRow.appendChild(div); });
  grid.appendChild(headerRow);
  ['morning','afternoon'].forEach(half => {
    const row = document.createElement('div');
    row.className='row';
    const label = document.createElement('div'); label.textContent = half==='morning'? 'Manhã':'Tarde'; row.appendChild(label);
    dates.forEach(date => {
      const cell = document.createElement('div');
      const alloc = data.find(a => a.date===date && a.half_day===half);
      cell.textContent = alloc ? (alloc.is_homecare ? 'D' : (alloc.therapists?.initials||'')) : '';
      cell.addEventListener('click', () => editAllocation(date, half, alloc));
      row.appendChild(cell);
    });
    grid.appendChild(row);
  });
}

function editAllocation(date, half, alloc) {
  const therapistId = prompt('Therapist id (uuid)');
  if (therapistId===null) return;
  if (therapistId==='') {
    if (alloc) deleteAllocation(alloc.id); return;
  }
  upsertAllocation({ id: alloc? alloc.id : undefined, date, half_day: half, therapist_id: therapistId, clinic_id: null, is_homecare: false });
}

async function upsertAllocation(a) {
  let resp;
  if (a.id) resp = await supabase.from('allocations').update(a).eq('id', a.id);
  else resp = await supabase.from('allocations').insert(a);
  if (resp.error) showToast('error', resp.error.message); else { showToast('success','Guardado'); listAllocations(weekSelect.value); }
}

async function deleteAllocation(id) {
  const { error } = await supabase.from('allocations').delete().eq('id', id);
  if (error) showToast('error', error.message); else { showToast('success','Removido'); listAllocations(weekSelect.value); }
}

// Export CSV
document.getElementById('exportCsv').addEventListener('click', async () => {
  const monday = weekSelect.value;
  const { data, error } = await supabase.from('allocations').select('date,half_day,therapists(initials)').gte('date', monday).lt('date', new Date(new Date(monday).getTime()+5*86400000).toISOString().slice(0,10));
  if (error) { showToast('error', error.message); return; }
  let csv = 'date,half_day,therapist\n';
  data.forEach(a => { csv += `${a.date},${a.half_day},${a.therapists?.initials||''}\n`; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'plan.csv'; a.click();
  URL.revokeObjectURL(url);
});

// Tab navigation
Array.from(document.querySelectorAll('#dashTabs button')).forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#dashboardSection .tab').forEach(t => t.hidden = true);
    document.getElementById(btn.dataset.tab).hidden = false;
  });
});
