/**
 * Gym Workout Tracker - Main JavaScript File
 * Handles all app logic, data management, UI rendering, and interactions
 */

// ==========================================
// EXERCISE DATABASE
// ==========================================
const exercises = {
    CHEST: [
        { name: 'Barbell Bench Press', unit: 'kg' },
        { name: 'Dumbbell Bench Press', unit: 'kg' },
        { name: 'Incline Barbell Press', unit: 'kg' },
        { name: 'Incline Dumbbell Press', unit: 'kg' },
        { name: 'Decline Bench Press', unit: 'kg' },
        { name: 'Chest Fly (Dumbbell)', unit: 'lbs' },
        { name: 'Cable Chest Fly', unit: 'lbs' },
        { name: 'Pec Deck Machine', unit: 'lbs' },
        { name: 'Push-Ups', unit: 'kg' },
        { name: 'Chest Dips', unit: 'kg' }
    ],
    BACK: [
        { name: 'Pull-Ups', unit: 'kg' },
        { name: 'Lat Pulldown', unit: 'lbs' },
        { name: 'Seated Cable Row', unit: 'lbs' },
        { name: 'Barbell Bent-Over Row', unit: 'kg' },
        { name: 'T-Bar Row', unit: 'kg' },
        { name: 'One-Arm Dumbbell Row', unit: 'kg' },
        { name: 'Deadlift', unit: 'kg' },
        { name: 'Straight Arm Pulldown', unit: 'lbs' },
        { name: 'Face Pull', unit: 'lbs' },
        { name: 'Machine Row', unit: 'lbs' }
    ],
    BICEPS: [
        { name: 'Barbell Curl', unit: 'kg' },
        { name: 'EZ-Bar Curl', unit: 'kg' },
        { name: 'Dumbbell Curl', unit: 'kg' },
        { name: 'Alternating Dumbbell Curl', unit: 'kg' },
        { name: 'Hammer Curl', unit: 'kg' },
        { name: 'Concentration Curl', unit: 'kg' },
        { name: 'Preacher Curl', unit: 'lbs' },
        { name: 'Cable Curl', unit: 'lbs' },
        { name: 'Incline Dumbbell Curl', unit: 'kg' }
    ],
    TRICEPS: [
        { name: 'Close-Grip Bench Press', unit: 'kg' },
        { name: 'Tricep Dips', unit: 'kg' },
        { name: 'Skull Crushers', unit: 'kg' },
        { name: 'Overhead Dumbbell Extension', unit: 'kg' },
        { name: 'Cable Pushdown', unit: 'lbs' },
        { name: 'Rope Pushdown', unit: 'lbs' },
        { name: 'Kickbacks', unit: 'kg' },
        { name: 'Smith Machine Close-Grip Press', unit: 'kg' }
    ],
    LEGS: [
        { name: 'Barbell Squat', unit: 'kg' },
        { name: 'Leg Press', unit: 'kg' },
        { name: 'Hack Squat', unit: 'kg' },
        { name: 'Lunges', unit: 'kg' },
        { name: 'Walking Lunges', unit: 'kg' },
        { name: 'Romanian Deadlift', unit: 'kg' },
        { name: 'Leg Extension', unit: 'lbs' },
        { name: 'Leg Curl', unit: 'lbs' },
        { name: 'Standing Calf Raise', unit: 'kg' },
        { name: 'Seated Calf Raise', unit: 'lbs' }
    ]
};

// ==========================================
// STATE MANAGEMENT
// ============================================
let appState = {
    currentMuscle: 'CHEST',
    currentScreen: 'home',
    isDarkMode: true,
    workouts: [],
    selectedWorkoutId: null,
    deferredPrompt: null
};

// ============================================
// LOAD DATA FROM LOCALSTORAGE
// ============================================
function loadData() {
    const saved = localStorage.getItem('workouts');
    if (saved) {
        appState.workouts = JSON.parse(saved);
    }

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode !== null) {
        appState.isDarkMode = JSON.parse(darkMode);
    } else {
        appState.isDarkMode = true;
    }

    applyTheme();
}

// ============================================
// SAVE DATA TO LOCALSTORAGE
// ============================================
function saveData() {
    localStorage.setItem('workouts', JSON.stringify(appState.workouts));
    localStorage.setItem('darkMode', JSON.stringify(appState.isDarkMode));
}

// ============================================
// THEME MANAGEMENT
// ============================================
function toggleTheme() {
    appState.isDarkMode = !appState.isDarkMode;
    applyTheme();
    saveData();
}

function applyTheme() {
    const body = document.body;
    const toggleSwitch = document.getElementById('themeToggleSettings');
    
    if (appState.isDarkMode) {
        body.classList.remove('light-mode');
        document.querySelector('.theme-icon').textContent = '🌙';
        if (toggleSwitch) {
            toggleSwitch.classList.remove('active');
        }
    } else {
        body.classList.add('light-mode');
        document.querySelector('.theme-icon').textContent = '☀️';
        if (toggleSwitch) {
            toggleSwitch.classList.add('active');
        }
    }
}

// ============================================
// SCREEN NAVIGATION
// ============================================
function switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show selected screen
    const screen = document.getElementById(screenName + 'Screen');
    if (screen) {
        screen.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-nav="${screenName}"]`).classList.add('active');

    appState.currentScreen = screenName;

    // Load data for specific screens
    if (screenName === 'home') {
        updateHomeScreen();
    } else if (screenName === 'progress') {
        updateProgressScreen();
    } else if (screenName === 'add') {
        setTodayDate();
    }
}

// ============================================
// EXERCISE SELECTION
// ============================================
function updateExerciseList() {
    const select = document.getElementById('exerciseSelect');
    const exercises_list = exercises[appState.currentMuscle];

    select.innerHTML = '<option value="">Select an exercise</option>';
    exercises_list.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.name;
        option.dataset.unit = exercise.unit;
        option.textContent = exercise.name;
        select.appendChild(option);
    });

    checkPreviousBest();
    updateWeightLabel();
}

function updateWeightLabel() {
    const select = document.getElementById('exerciseSelect');
    const selectedOption = select.options[select.selectedIndex];
    const unit = selectedOption.dataset.unit || 'kg';
    const label = document.getElementById('weightLabel');
    if (label) {
        label.textContent = `Weight (${unit})`;
    }
}

function checkPreviousBest() {
    const selectedExercise = document.getElementById('exerciseSelect').value;
    if (!selectedExercise) {
        document.getElementById('previousBest').style.display = 'none';
        return;
    }

    const previousWorkouts = appState.workouts
        .filter(w => w.exercise === selectedExercise)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (previousWorkouts.length > 0) {
        const best = previousWorkouts[0];
        const text = `${best.weight}${best.unit} for ${best.reps} reps on ${formatDate(best.date)}`;
        document.getElementById('prevBestText').textContent = text;
        document.getElementById('previousBest').style.display = 'block';
    } else {
        document.getElementById('previousBest').style.display = 'none';
    }
}

// ============================================
// SUBMIT WORKOUT
// ============================================
function submitWorkout() {
    const exercise = document.getElementById('exerciseSelect').value;
    const sets = parseInt(document.getElementById('setsInput').value) || 0;
    const reps = parseInt(document.getElementById('repsInput').value) || 0;
    const weight = parseFloat(document.getElementById('weightInput').value) || 0;
    const date = document.getElementById('dateInput').value;
    const selectedOption = document.getElementById('exerciseSelect').options[document.getElementById('exerciseSelect').selectedIndex];
    const unit = selectedOption.dataset.unit || 'kg';

    if (!exercise) {
        alert('Please select an exercise');
        return;
    }

    if (!date) {
        alert('Please select a date');
        return;
    }

    if (sets <= 0 || reps <= 0 || weight < 0) {
        alert('Please enter valid values (Sets and Reps must be greater than 0)');
        return;
    }

    // Check for progressive overload
    const previousWorkouts = appState.workouts
        .filter(w => w.exercise === exercise && w.date !== date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    let isProgressive = false;
    if (previousWorkouts.length > 0) {
        const best = previousWorkouts[0];
        if (weight > best.weight) {
            isProgressive = true;
        }
    }

    // Add workout
    const workout = {
        id: Date.now(),
        exercise,
        muscle: appState.currentMuscle,
        sets,
        reps,
        weight,
        unit,
        date,
        volume: sets * reps * weight,
        isProgressive,
        timestamp: new Date().toISOString()
    };

    appState.workouts.push(workout);
    saveData();

    // Show progressive indicator
    if (isProgressive) {
        showProgressiveIndicator();
        setTimeout(() => {
            document.getElementById('progressiveIndicator').style.display = 'none';
        }, 3000);
    }

    // Reset form but STAY on same screen
    document.getElementById('exerciseSelect').value = '';
    document.getElementById('setsInput').value = '';
    document.getElementById('repsInput').value = '';
    document.getElementById('weightInput').value = '';
    document.getElementById('previousBest').style.display = 'none';
}

function showProgressiveIndicator() {
    const indicator = document.getElementById('progressiveIndicator');
    indicator.className = 'progress-box success';
    indicator.textContent = '✓ Progressive! You\'re getting stronger! 📈';
    indicator.style.display = 'block';
}

// ============================================
// HOME SCREEN UPDATES
// ============================================
function updateHomeScreen() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayWorkouts = appState.workouts.filter(w => w.date === today);
    const weekWorkouts = appState.workouts.filter(w => w.date >= weekAgo);

    document.getElementById('todayCount').textContent = todayWorkouts.length;
    document.getElementById('weekCount').textContent = weekWorkouts.length;
    document.getElementById('totalCount').textContent = appState.workouts.length;

    // Recent workouts
    const recent = appState.workouts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    const recentContainer = document.getElementById('recentWorkouts');
    if (recent.length === 0) {
        recentContainer.innerHTML = '<p class="empty-state">No workouts yet. Start by adding one!</p>';
    } else {
        recentContainer.innerHTML = recent.map(workout => `
            <div class="workout-item" onclick="openWorkoutModal(${workout.id})">
                <div class="workout-item-name">${workout.exercise}</div>
                <div class="workout-item-detail">
                    ${workout.sets} × ${workout.reps} @ ${workout.weight}${workout.unit}
                    ${workout.isProgressive ? ' <span style="color: var(--primary-color);">↑</span>' : ''}
                </div>
                <div class="workout-item-date">${formatDate(workout.date)}</div>
            </div>
        `).join('');
    }
}

// ============================================
// PROGRESS SCREEN UPDATES
// ============================================
function updateProgressScreen() {
    const uniqueExercises = [...new Set(appState.workouts.map(w => w.exercise))];

    const filter = document.getElementById('exerciseFilter');
    filter.innerHTML = '<option value="">All Exercises</option>';
    uniqueExercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        option.textContent = exercise;
        filter.appendChild(option);
    });

    updateChart('');
}

// ============================================
// CHART RENDERING WITH CANVAS
// ============================================
function updateChart(selectedExercise) {
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    const chartEmpty = document.getElementById('chartEmpty');

    let workoutsToChart = appState.workouts;
    if (selectedExercise) {
        workoutsToChart = appState.workouts.filter(w => w.exercise === selectedExercise);
    }

    if (workoutsToChart.length === 0) {
        canvas.style.display = 'none';
        chartEmpty.style.display = 'block';
        return;
    }

    canvas.style.display = 'block';
    chartEmpty.style.display = 'none';

    // Sort by date
    const sorted = workoutsToChart.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get unique exercises if showing all (show only first 1 for clarity)
    const chartExercises = selectedExercise 
        ? [selectedExercise]
        : [...new Set(sorted.map(w => w.exercise))].slice(0, 1);

    const exerciseData = chartExercises.map(exercise => {
        return sorted
            .filter(w => w.exercise === exercise)
            .map(w => ({ date: w.date, weight: w.weight }));
    })[0] || [];

    if (exerciseData.length === 0) {
        return;
    }

    // Canvas setup
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const padding = 50;
    const width = canvas.width / dpr - padding * 2;
    const height = canvas.height / dpr - padding * 2;

    const maxWeight = Math.max(...exerciseData.map(d => d.weight)) * 1.15;
    const minWeight = Math.min(...exerciseData.map(d => d.weight)) * 0.85;
    const weightRange = maxWeight - minWeight;

    // Draw background grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * height;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }

    // Draw bars and line
    const barWidth = width / exerciseData.length;
    const points = [];

    ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    exerciseData.forEach((data, index) => {
        const normalizedWeight = (data.weight - minWeight) / weightRange;
        const barHeight = normalizedWeight * height;
        const x = padding + index * barWidth + barWidth / 2;
        const y = padding + height - barHeight;

        // Draw bar
        const barColor = `hsla(${120 + index * 5}, 100%, 55%, 0.8)`;
        ctx.fillStyle = barColor;
        ctx.fillRect(x - barWidth * 0.35, y, barWidth * 0.7, barHeight);

        // Store point for line
        points.push({ x, y, weight: data.weight, date: data.date });
    });

    // Draw line through points
    if (points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        points.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Draw points
        points.forEach(point => {
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 12px Ubuntu';
            ctx.textAlign = 'center';
            ctx.fillText(point.weight.toFixed(1), point.x, point.y - 15);
        });
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + height);
    ctx.lineTo(padding + width, padding + height);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px Ubuntu';

    points.forEach((point, i) => {
        ctx.textAlign = 'center';
        ctx.fillText(formatDateShort(point.date), point.x, padding + height + 20);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = minWeight + (i / 5) * weightRange;
        const y = padding + height - (i / 5) * height;
        ctx.fillText(value.toFixed(0), padding - 10, y + 5);
    }

    updateStats(sorted);
}

// ============================================
// UPDATE STATISTICS
// ============================================
function updateStats(workouts) {
    const statsContent = document.getElementById('statsContent');

    if (workouts.length === 0) {
        statsContent.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }

    // Group by exercise
    const exerciseStats = {};
    workouts.forEach(w => {
        if (!exerciseStats[w.exercise]) {
            exerciseStats[w.exercise] = {
                weights: [],
                allWorkouts: []
            };
        }
        exerciseStats[w.exercise].weights.push(w.weight);
        exerciseStats[w.exercise].allWorkouts.push(w);
    });

    let statsHtml = '';

    Object.entries(exerciseStats).forEach(([exercise, data]) => {
        const maxWeight = Math.max(...data.weights);
        const minWeight = Math.min(...data.weights);
        const avgWeight = (data.weights.reduce((a, b) => a + b, 0) / data.weights.length).toFixed(1);
        const totalVolume = data.allWorkouts.reduce((sum, w) => sum + w.volume, 0).toFixed(0);
        const progressiveCount = data.allWorkouts.filter(w => w.isProgressive).length;

        statsHtml += `
            <div class="stat-item">
                <div class="stat-item-label">${exercise}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 0.8rem;">
                    <div>
                        <div class="stat-item-label" style="color: #00d4ff; font-size: 11px;">Max Weight</div>
                        <div class="stat-item-value" style="font-size: 20px;">${maxWeight.toFixed(1)}</div>
                    </div>
                    <div>
                        <div class="stat-item-label" style="color: #00ff88; font-size: 11px;">Avg Weight</div>
                        <div class="stat-item-value" style="font-size: 20px;">${avgWeight}</div>
                    </div>
                    <div>
                        <div class="stat-item-label" style="color: #ff6b35; font-size: 11px;">Volume</div>
                        <div class="stat-item-value" style="font-size: 18px;">${totalVolume}</div>
                    </div>
                    <div>
                        <div class="stat-item-label" style="color: #00ff88; font-size: 11px;">Progressive</div>
                        <div class="stat-item-value" style="font-size: 20px;">${progressiveCount}</div>
                    </div>
                </div>
            </div>
        `;
    });

    statsContent.innerHTML = statsHtml;
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openWorkoutModal(workoutId) {
    const workout = appState.workouts.find(w => w.id === workoutId);
    if (!workout) return;

    appState.selectedWorkoutId = workoutId;

    const detail = `
Exercise: ${workout.exercise}
Muscle Group: ${workout.muscle}

Sets: ${workout.sets}
Reps: ${workout.reps}
Weight: ${workout.weight}${workout.unit}
Volume: ${workout.volume.toFixed(0)}

Date: ${formatDate(workout.date)}
${workout.isProgressive ? '\n✓ Progressive Overload!' : ''}
    `;

    document.getElementById('workoutDetail').textContent = detail;
    document.getElementById('workoutModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function deleteWorkout() {
    if (!appState.selectedWorkoutId) return;

    const index = appState.workouts.findIndex(w => w.id === appState.selectedWorkoutId);
    if (index > -1) {
        appState.workouts.splice(index, 1);
        saveData();
        closeModal('workoutModal');
        updateHomeScreen();
        alert('Workout deleted!');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
}

// ============================================
// EXPORT DATA
// ============================================
function exportData() {
    const csv = [
        ['Date', 'Exercise', 'Muscle', 'Sets', 'Reps', 'Weight (kg)', 'Volume', 'Progressive'].join(','),
        ...appState.workouts.map(w => 
            [w.date, w.exercise, w.muscle, w.sets, w.reps, w.weight, w.volume, w.isProgressive ? 'Yes' : 'No'].join(',')
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gym-workouts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ============================================
// CLEAR DATA
// ============================================
function clearAllData() {
    const confirmMsg = document.getElementById('confirmMessage');
    confirmMsg.textContent = 'Are you sure you want to delete all workouts? This cannot be undone.';
    document.getElementById('confirmModal').classList.add('active');

    document.getElementById('confirmYes').onclick = () => {
        appState.workouts = [];
        saveData();
        closeModal('confirmModal');
        updateHomeScreen();
    };
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Muscle group tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            appState.currentMuscle = e.target.dataset.muscle;
            updateExerciseList();
        });
    });

    // Exercise selection
    document.getElementById('exerciseSelect').addEventListener('change', checkPreviousBest);

    // Submit workout
    document.getElementById('submitWorkout').addEventListener('click', submitWorkout);

    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const screen = item.dataset.nav;
            switchScreen(screen);
        });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('themeToggleSettings').addEventListener('click', toggleTheme);

    // Export/Clear data
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('clearData').addEventListener('click', clearAllData);

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', () => closeModal('workoutModal'));
    document.getElementById('closeModalBtn').addEventListener('click', () => closeModal('workoutModal'));
    document.getElementById('deleteWorkout').addEventListener('click', deleteWorkout);

    document.getElementById('confirmCancel').addEventListener('click', () => closeModal('confirmModal'));

    // Progress chart filter
    document.getElementById('exerciseFilter').addEventListener('change', (e) => {
        updateChart(e.target.value);
    });

    // Initialize
    updateExerciseList();
    updateHomeScreen();
    setTodayDate();

    // PWA Install
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        document.getElementById('installSection').style.display = 'block';
    });

    document.getElementById('installApp')?.addEventListener('click', async () => {
        if (appState.deferredPrompt) {
            appState.deferredPrompt.prompt();
            const { outcome } = await appState.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            appState.deferredPrompt = null;
        }
    });
});