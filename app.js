/* Mental Health Journal App - FIXED VERSION */

// Constants
const DB_KEY = 'mhj_entries_v1';
const PROFILE_KEY = 'mhj_profile_v1';

const MOODS = [
  { id: 1, name: 'Happy', emoji: '😊', category: 'Joy' },
  { id: 2, name: 'Sad', emoji: '😢', category: 'Sadness' },
  { id: 3, name: 'Anxious', emoji: '😰', category: 'Fear' },
  { id: 4, name: 'Excited', emoji: '🤩', category: 'Joy' },
  { id: 5, name: 'Frustrated', emoji: '😤', category: 'Anger' },
  { id: 6, name: 'Calm', emoji: '😌', category: 'Peace' },
  { id: 7, name: 'Angry', emoji: '😠', category: 'Anger' },
  { id: 8, name: 'Neutral', emoji: '😐', category: 'Neutral' }
];

const TRIGGERS = ['Work Stress', 'Academic Pressure', 'Relationship Issues', 'Health Concerns', 'Financial Worries', 'Family Problems', 'Sleep Issues', 'Social Media'];
const STRATEGIES = ['Meditation', 'Exercise', 'Listening to Music', 'Talking to Friends', 'Journaling', 'Deep Breathing', 'Taking a Walk', 'Reading'];
const TIPS = [
  "Remember: You are stronger than you think, and you have survived 100% of your difficult days so far.",
  "Take deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.",
  "It's okay to not be okay. Feelings are temporary and valid.",
  "Small steps forward are still progress. Be patient with yourself.",
  "Your mental health is just as important as your physical health.",
  "Connect with someone today - even a simple text can help.",
  "Practice gratitude: name three things you're thankful for right now.",
  "You don't have to be perfect. You just have to be you.",
  "Every day is a new opportunity to take care of yourself.",
  "Your feelings matter and you deserve support."
];

// Global Variables
let currentView = 'dashboard';
let entries = [];
let profile = { name: 'User', email: 'user@example.com', timezone: 'UTC' };
let charts = {}; // Store chart instances for cleanup

// DOM Elements
const app = document.getElementById('app');
const navButtons = document.querySelectorAll('.nav-btn');
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
const themeToggle = document.getElementById('themeToggle');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  console.log('App initializing...');
  loadData();
  setupEventListeners();
  showView('dashboard');
});

// Load Data from localStorage
function loadData() {
  const savedEntries = localStorage.getItem(DB_KEY);
  const savedProfile = localStorage.getItem(PROFILE_KEY);
  
  entries = savedEntries ? JSON.parse(savedEntries) : [];
  profile = savedProfile ? JSON.parse(savedProfile) : { name: 'User', email: 'user@example.com', timezone: 'UTC' };
  
  console.log('Loaded entries:', entries.length);
}

// Save Data to localStorage
function saveData() {
  localStorage.setItem(DB_KEY, JSON.stringify(entries));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      if (view) {
        showView(view);
      }
    });
  });

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

// Destroy existing charts
function destroyCharts() {
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  charts = {};
}

// Show View Function
function showView(viewName) {
  console.log('Showing view:', viewName);
  currentView = viewName;
  
  // Destroy existing charts to prevent memory leaks
  destroyCharts();
  
  // Update active nav button
  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  
  // Close mobile menu
  nav.classList.remove('open');
  
  // Clear app container
  app.innerHTML = '';
  
  // Load the appropriate view
  switch(viewName) {
    case 'dashboard':
      showDashboard();
      break;
    case 'log':
      showLogForm();
      break;
    case 'history':
      showHistory();
      break;
    case 'analytics':
      showAnalytics();
      break;
    case 'resources':
      showResources();
      break;
    case 'profile':
      showProfile();
      break;
    default:
      showDashboard();
  }
}

// Dashboard View
function showDashboard() {
  const template = document.getElementById('dashboardTpl');
  const clone = template.content.cloneNode(true);
  
  // Update username
  clone.getElementById('usernameDash').textContent = profile.name;
  
  app.appendChild(clone);
  
  // Setup chart after DOM is ready
  setTimeout(() => {
    setupTrendChart();
    setupQuickActions();
  }, 100);
}

function setupTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (entries.length === 0) {
    // Show empty state
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('No mood data yet. Start logging!', canvas.width/2, canvas.height/2);
    return;
  }
  
  // Get last 7 entries
  const last7 = entries.slice(-7);
  const labels = last7.map(entry => {
    const date = new Date(entry.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const data = last7.map(entry => parseInt(entry.intensity));
  
  // FIXED: Proper chart configuration
  charts.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood Intensity',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        y: {
          beginAtZero: false,
          min: 1,
          max: 10
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function setupQuickActions() {
  const buttons = document.querySelectorAll('.quick-actions button');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      if (view) {
        showView(view);
      }
    });
  });
}

// Log Form View
function showLogForm() {
  const template = document.getElementById('logTpl');
  const clone = template.content.cloneNode(true);
  app.appendChild(clone);
  
  // Populate dropdowns
  populateMoodSelect();
  populateTriggerSelect();
  populateStrategySelect();
  
  // Setup form handlers
  setupLogForm();
}

function populateMoodSelect() {
  const select = document.getElementById('moodSel');
  MOODS.forEach(mood => {
    const option = document.createElement('option');
    option.value = mood.id;
    option.textContent = `${mood.emoji} ${mood.name}`;
    select.appendChild(option);
  });
}

function populateTriggerSelect() {
  const select = document.getElementById('triggerSel');
  TRIGGERS.forEach(trigger => {
    const option = document.createElement('option');
    option.value = trigger;
    option.textContent = trigger;
    select.appendChild(option);
  });
}

function populateStrategySelect() {
  const select = document.getElementById('strategySel');
  STRATEGIES.forEach(strategy => {
    const option = document.createElement('option');
    option.value = strategy;
    option.textContent = strategy;
    select.appendChild(option);
  });
}

function setupLogForm() {
  const form = document.getElementById('logForm');
  const intensitySlider = document.getElementById('intensity');
  const intensityValue = document.getElementById('intensityVal');
  
  // Update intensity display
  intensitySlider.addEventListener('input', (e) => {
    intensityValue.textContent = e.target.value;
  });
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      id: Date.now(),
      date: new Date().toISOString(),
      moodId: parseInt(document.getElementById('moodSel').value),
      intensity: parseInt(document.getElementById('intensity').value),
      trigger: document.getElementById('triggerSel').value || null,
      strategy: document.getElementById('strategySel').value || null,
      notes: document.getElementById('notes').value.trim() || null
    };
    
    entries.push(formData);
    saveData();
    
    // Show success message
    alert('Mood entry saved successfully! 🎉');
    
    // Redirect to dashboard
    showView('dashboard');
  });
}

// History View
function showHistory() {
  const template = document.getElementById('historyTpl');
  const clone = template.content.cloneNode(true);
  app.appendChild(clone);
  
  populateHistoryMoodFilter();
  setupHistoryFilters();
  displayHistoryEntries(entries);
}

function populateHistoryMoodFilter() {
  const select = document.getElementById('moodFilter');
  MOODS.forEach(mood => {
    const option = document.createElement('option');
    option.value = mood.id;
    option.textContent = `${mood.emoji} ${mood.name}`;
    select.appendChild(option);
  });
}

function setupHistoryFilters() {
  document.getElementById('applyFilter').addEventListener('click', applyHistoryFilter);
  document.getElementById('clearFilter').addEventListener('click', clearHistoryFilter);
}

function applyHistoryFilter() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const moodFilter = document.getElementById('moodFilter').value;
  
  let filtered = [...entries];
  
  if (startDate) {
    filtered = filtered.filter(entry => new Date(entry.date) >= new Date(startDate));
  }
  
  if (endDate) {
    filtered = filtered.filter(entry => new Date(entry.date) <= new Date(endDate));
  }
  
  if (moodFilter) {
    filtered = filtered.filter(entry => entry.moodId === parseInt(moodFilter));
  }
  
  displayHistoryEntries(filtered);
}

function clearHistoryFilter() {
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('moodFilter').value = '';
  displayHistoryEntries(entries);
}

function displayHistoryEntries(entriesToShow) {
  const container = document.getElementById('historyList');
  container.innerHTML = '';
  
  if (entriesToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No entries found</h3>
        <p>Try adjusting your filters or start logging your mood!</p>
        <button class="primary" onclick="showView('log')">Log First Mood</button>
      </div>
    `;
    return;
  }
  
  // Sort by date (newest first)
  const sorted = [...entriesToShow].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sorted.forEach(entry => {
    const mood = MOODS.find(m => m.id === entry.moodId);
    const date = new Date(entry.date);
    
    const entryDiv = document.createElement('div');
    entryDiv.className = 'history-item';
    entryDiv.innerHTML = `
      <h4>
        ${mood.emoji} ${mood.name}
        <span class="intensity-badge">${entry.intensity}/10</span>
      </h4>
      <div class="meta">
        📅 ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
        ${entry.trigger ? ` • 🎯 ${entry.trigger}` : ''}
        ${entry.strategy ? ` • 🛡️ ${entry.strategy}` : ''}
      </div>
      ${entry.notes ? `<p><strong>Notes:</strong> ${entry.notes}</p>` : ''}
    `;
    
    container.appendChild(entryDiv);
  });
}

// Analytics View - FIXED
function showAnalytics() {
  const template = document.getElementById('analyticsTpl');
  const clone = template.content.cloneNode(true);
  app.appendChild(clone);
  
  if (entries.length === 0) {
    app.innerHTML = `
      <div class="view">
        <div class="empty-state">
          <h2>📊 Analytics Dashboard</h2>
          <h3>No data available yet</h3>
          <p>Start logging your moods to see insightful analytics!</p>
          <button class="primary" onclick="showView('log')">Log First Mood</button>
        </div>
      </div>
    `;
    return;
  }
  
  // Wait for DOM to be ready, then create charts
  setTimeout(() => {
    updateAnalyticsStats();
    createMoodPieChart();
    createTriggerBarChart();
  }, 100);
}

function updateAnalyticsStats() {
  // Total entries
  document.getElementById('totalEntries').textContent = entries.length;
  
  // Average mood
  const avgMood = (entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length).toFixed(1);
  document.getElementById('avgMood').textContent = `${avgMood}/10`;
  
  // Best day
  const bestEntry = entries.reduce((best, current) => 
    current.intensity > best.intensity ? current : best
  );
  const bestDate = new Date(bestEntry.date).toLocaleDateString();
  document.getElementById('bestDay').textContent = bestDate;
}

// FIXED: Mood Pie Chart with proper sizing
function createMoodPieChart() {
  const canvas = document.getElementById('moodPieChart');
  if (!canvas) return;
  
  const moodCounts = {};
  entries.forEach(entry => {
    const mood = MOODS.find(m => m.id === entry.moodId);
    moodCounts[mood.name] = (moodCounts[mood.name] || 0) + 1;
  });
  
  charts.moodPieChart = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: Object.keys(moodCounts),
      datasets: [{
        data: Object.values(moodCounts),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,  // FIXED: Allow container to control size
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// FIXED: Trigger Bar Chart with proper sizing
function createTriggerBarChart() {
  const canvas = document.getElementById('triggerBarChart');
  if (!canvas) return;
  
  const triggerCounts = {};
  entries.forEach(entry => {
    if (entry.trigger) {
      triggerCounts[entry.trigger] = (triggerCounts[entry.trigger] || 0) + 1;
    }
  });
  
  if (Object.keys(triggerCounts).length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('No trigger data available', canvas.width/2, canvas.height/2);
    return;
  }
  
  charts.triggerBarChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: Object.keys(triggerCounts),
      datasets: [{
        label: 'Frequency',
        data: Object.values(triggerCounts),
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,  // FIXED: Allow container to control size
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Resources View
function showResources() {
  const template = document.getElementById('resourcesTpl');
  const clone = template.content.cloneNode(true);
  app.appendChild(clone);
  
  setTimeout(() => {
    setupBreathingExercise();
    setupTipGenerator();
  }, 100);
}

function setupBreathingExercise() {
  const button = document.getElementById('startBreathing');
  const circle = document.getElementById('breathingCircle');
  const text = document.getElementById('breathingText');
  let isBreathing = false;
  
  button.addEventListener('click', () => {
    if (!isBreathing) {
      startBreathing();
    } else {
      stopBreathing();
    }
  });
  
  function startBreathing() {
    isBreathing = true;
    button.textContent = 'Stop Exercise';
    
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    const phases = ['Breathe in...', 'Hold...', 'Breathe out...', 'Hold...'];
    const durations = [4000, 2000, 4000, 2000]; // milliseconds
    
    function nextPhase() {
      if (!isBreathing) return;
      
      text.textContent = phases[phase];
      
      if (phase === 0) {
        circle.classList.add('inhale');
        circle.classList.remove('exhale');
      } else if (phase === 2) {
        circle.classList.remove('inhale');
        circle.classList.add('exhale');
      }
      
      setTimeout(() => {
        phase = (phase + 1) % 4;
        nextPhase();
      }, durations[phase]);
    }
    
    nextPhase();
  }
  
  function stopBreathing() {
    isBreathing = false;
    button.textContent = 'Start Exercise';
    text.textContent = 'Click to start breathing exercise';
    circle.classList.remove('inhale', 'exhale');
  }
}

function setupTipGenerator() {
  const button = document.getElementById('newTip');
  const container = document.getElementById('dailyTip');
  
  button.addEventListener('click', () => {
    const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
    container.innerHTML = `<p>"${randomTip}"</p>`;
  });
}

// Profile View
function showProfile() {
  const template = document.getElementById('profileTpl');
  const clone = template.content.cloneNode(true);
  app.appendChild(clone);
  
  setTimeout(() => {
    populateProfileForm();
    setupProfileHandlers();
  }, 100);
}

function populateProfileForm() {
  document.getElementById('profileName').value = profile.name;
  document.getElementById('profileEmail').value = profile.email;
  document.getElementById('profileTimezone').value = profile.timezone;
  
  // Update stats
  const firstEntry = entries.length > 0 ? new Date(entries[0].date) : new Date();
  const daysSince = Math.floor((new Date() - firstEntry) / (1000 * 60 * 60 * 24));
  document.getElementById('daysUsing').textContent = Math.max(1, daysSince);
}

function setupProfileHandlers() {
  // Profile form
  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    profile.name = document.getElementById('profileName').value;
    profile.email = document.getElementById('profileEmail').value;
    profile.timezone = document.getElementById('profileTimezone').value;
    saveData();
    alert('Profile updated successfully! ✅');
  });
  
  // Export data
  document.getElementById('exportData').addEventListener('click', () => {
    const data = {
      profile: profile,
      entries: entries,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mental-health-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  // Import data
  document.getElementById('importData').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.entries && Array.isArray(data.entries)) {
          entries = data.entries;
          if (data.profile) {
            profile = data.profile;
          }
          saveData();
          alert('Data imported successfully! ✅');
          showView('dashboard');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
  });
  
  // Clear data
  document.getElementById('clearData').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      entries = [];
      profile = { name: 'User', email: 'user@example.com', timezone: 'UTC' };
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(PROFILE_KEY);
      alert('All data cleared');
      showView('dashboard');
    }
  });
}

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀️';
}

// Make showView globally accessible for onclick handlers
window.showView = showView;

console.log('Mental Health Journal App loaded successfully! 🧠✨');
