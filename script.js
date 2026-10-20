
function startPlanning() {
    document.getElementById("tasks").scrollIntoView({
        behavior: "smooth"
    });
}

let tasks = JSON.parse(localStorage.getItem("studyMateTasks")) || [];

function saveTasks() {
    localStorage.setItem("studyMateTasks", JSON.stringify(tasks));
}

function renderTasks() {
    const taskList = document.getElementById("tasklist");
    taskList.innerHTML = "";

    tasks.forEach(function(task, index) {
        const li = document.createElement("li");
        li.className = "task-item";

        const name = document.createElement("span");
        name.textContent = task.text;
        name.style.cursor = "pointer";

        if (task.completed) {
            li.classList.add("completed");
        }

        name.onclick = function() {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        };

        const del = document.createElement("button");
        del.textContent = "Delete";

        del.onclick = function() {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        };

        li.appendChild(name);
        li.appendChild(del);
        taskList.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (!text) {
        
        return;
    }

    tasks.push({
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();

    input.value = "";
    input.focus();
}

document.addEventListener("DOMContentLoaded", renderTasks);

let timerSeconds = 25 * 60;
let timerInterval = null;

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    document.getElementById("timer-display").textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {
    alert("start button connected!");
    if (timerInterval !== null) return;

    if (timerSeconds <= 0) {
        document.getElementById("timer-status").textContent =
            "Time is up! Reset to study again.";
        return;
    }

    document.getElementById("timer-status").textContent =
        "Focus time! Keep studying.";

    timerInterval = setInterval(function () {
        timerSeconds--;
        updateTimerDisplay();

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            document.getElementById("timer-status").textContent =
                "Session complete! Great work!";
            alert("Great job! Your study session is complete.");
        }
    }, 1000);
}

function pauseTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById("timer-status").textContent =
            "Timer paused.";
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 25 * 60;

    updateTimerDisplay();
    document.getElementById("timer-status").textContent =
        "Ready to study?";
}

updateTimerDisplay();

/* Study Progress Tracker */

const completedTasksElement = document.getElementById("completedTasks");
const studyTimeElement = document.getElementById("studyTime");
const goalTextElement = document.getElementById("goalText");
const goalProgressElement = document.getElementById("goalProgress");

const taskListElement = document.getElementById("tasklist");
const timerDisplayElement = document.getElementById("timer-display");

const DAILY_GOAL_MINUTES = 120;
let trackedStudySeconds = 0;
let previousTimerSeconds = getTimerSeconds();

function getTimerSeconds() {
    if (!timerDisplayElement) return 0;

    const parts = timerDisplayElement.textContent.trim().split(":");
    if (parts.length !== 2) return 0;

    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);

    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
    return minutes * 60 + seconds;
}

function updateProgress() {
    // Count completed tasks
    let completedCount = 0;

    if (taskListElement) {
        taskListElement.querySelectorAll("li").forEach((task) => {
            const checkbox = task.querySelector('input[type="checkbox"]');
            const isCompleted =
                checkbox?.checked ||
                task.classList.contains("completed") ||
                task.querySelector("button")?.textContent
                    ?.toLowerCase().includes("completed");

            if (isCompleted) completedCount++;
        });
    }

    if (completedTasksElement) {
        completedTasksElement.textContent = completedCount;
    }

    // Show accumulated timer time
    const minutesStudied = Math.floor(trackedStudySeconds / 60);

    if (studyTimeElement) {
        studyTimeElement.textContent = minutesStudied + " min";
    }

    // Update daily goal progress
    const percentage = Math.min(
        100,
        Math.round((minutesStudied / DAILY_GOAL_MINUTES) * 100)
    );

    if (goalTextElement) {
        goalTextElement.textContent = percentage + "% completed";
    }

    if (goalProgressElement) {
        goalProgressElement.style.width = percentage + "%";
    }
}

// Watch task list for changes
if (taskListElement) {
    const taskObserver = new MutationObserver(updateProgress);
    taskObserver.observe(taskListElement, {
        childList: true,
        subtree: true,
        attributes: true
    });

    taskListElement.addEventListener("change", updateProgress);
    taskListElement.addEventListener("click", updateProgress);
}

// Watch the timer display
if (timerDisplayElement) {
    const timerObserver = new MutationObserver(() => {
        const currentSeconds = getTimerSeconds();

        // Count time only while the timer counts down
        if (currentSeconds < previousTimerSeconds) {
            trackedStudySeconds += previousTimerSeconds - currentSeconds;
        }

        previousTimerSeconds = currentSeconds;
        updateProgress();
    });

    timerObserver.observe(timerDisplayElement, {
        childList: true,
        characterData: true,
        subtree: true
    });
}

updateProgress();
