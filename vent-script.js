function switchVent(state) {
    const powerButton = document.getElementById('powerButton');
    switch (state) {
        case 0:
            powerButton.classList.add('off');
            powerButton.classList.remove('on');
            powerButton.classList.remove('turbo');
            break;
        case 1:
            powerButton.classList.remove('off');
            powerButton.classList.add('on');
            powerButton.classList.remove('turbo');
            break;
        case 2:
            powerButton.classList.remove('off');
            powerButton.classList.remove('on');
            powerButton.classList.add('turbo');
            break;
    }
}

// Обробник події для кнопки увімкнення/вимкнення
const powerButton = document.getElementById('powerButton');
powerButton.addEventListener('click', () => {
    const state = powerButton.classList.contains('off') ? 1 : 0;
    sendState(state);
});
const turboSwitch = document.getElementById('turboSwitch');
turboSwitch.addEventListener('change', () => {
    const state = turboSwitch.checked ? 2 : 1;
    sendState(state);
});

function closeTimerModal() {
    const modal = document.getElementById('timerModal');
    modal.style.display = 'none';
}

function showTimerModal() {
    const modal = document.getElementById('timerModal');
    modal.style.display = 'block';
}

function showError(error) {
    console.error(error);

    const infoContainer = document.getElementById("info-container");
    const infoData = document.getElementById("info-data");
    infoData.textContent = 'Помилка: ' + error.message;
    infoContainer.classList.add('red');
    infoContainer.style.display = 'flex';

    const closeBtn = document.getElementById('close-error');
    closeBtn.style.display = 'block';

    closeBtn.onclick = function () {
        infoContainer.classList.remove('red');
        closeBtn.style.display = 'none';
        infoContainer.style.display = 'none';
    }
}

/* Create graph using picograph */
const demoGraph = createGraph("graph", ["Temperature", "Humidity"], "", "graphLabels", 2, 80);

function updateGraph(data) {
    for (let element of data) {
        demoGraph.update(element.t, 0);
        demoGraph.update(element.h, 1)
    }
}

function updateState(state) {
    switchVent(state.state);
    const infoContainer = document.getElementById("info-container");
    infoContainer.classList.remove('red');

    if (state.hoursOff != -1 && state.minutesOff != -1) {
        const infoData = document.getElementById("info-data");
        const timeString = state.hoursOff.padStart(2, '0') + ':' + state.minutesOff.padStart(2, '0');
        infoData.textContent = 'Вимкнеться о ' + timeString;
        infoContainer.style.display = 'flex';
    } else {
        infoContainer.style.display = 'none';
    }

    const humidityElement = document.getElementById('humidity');
    const temperatureElement = document.getElementById('temperature');
    const turboSwitch = document.getElementById('turboSwitch');

    humidityElement.textContent = state.humidity + '%';
    temperatureElement.textContent = state.temperature + '°C';

    turboSwitch.checked = state.state == 2;
}

function sendState(state) {
    fetch('/state?state=' + state)
        .then(response => response.json())
        .then(data => {
            updateState(data);
            console.log('Стан оновлено: ' + data.state);
        })
        .catch(error => showError(error));
}

function getGraph() {
    fetch('/graph')
        .then(response => response.json())
        .then(data => updateGraph(data))
        .catch(error => showError(error));

}

function updateData() {
    fetch('/getState')
        .then(response => response.json())
        .then(data => updateState(data))
        .catch(error => showError(error));
}

function startTimerFromInput() {
    let input = document.getElementById('manualInput');
    let minutes = parseInt(input.value);
    if (isNaN(minutes) || minutes <= 0) {
        alert("Будь ласка, введіть правильний час в хвилинах.");
        return;
    }

    startTimer(minutes);
}

function startTimer(minutes) {
    fetch('/timer?minutes=' + minutes)
        .then(response => response.json())
        .then(data => {
            closeTimerModal();
            updateState(data);
        })
        .catch(error => {
            closeTimerModal();
            showError(error);
        });
}

updateData();
getGraph();

setInterval(updateData, 5000);