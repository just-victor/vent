const graph = document.getElementById('graph');
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

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

const humidityTriggerSwitch = document.getElementById('humidityTriggerSwitch');
humidityTriggerSwitch.addEventListener('change', () => {
    const state = humidityTriggerSwitch.checked ? 1 : 0;
    sendHumidityTriggerState(state);
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
// const demoGraph = createGraph("graph", ["Temperature", "Humidity"], "", "graphLabels", 2, 80);

function zeroToNaN(number) {
    if (number <= 0) {
        return NaN;
    }
}
function updateGraph(graphData) {
    const labels = [];
    labels.length = graphData.length;
    new Chart(graph, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Вологість',
                data: graphData.map(it => it.h).map(zeroToNaN),
                borderColor: 'rgb(90,205,255)',
                segment: {
                    borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(90,205,255)'),
                    borderDash: ctx => skipped(ctx, [6, 6]),
                },
                borderWidth: 1,
                spanGaps: true
            },{
                label: 'Температура',
                data: graphData.map(it => it.t).map(zeroToNaN),
                borderColor: 'rgb(255,132,42)',
                segment: {
                    borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(255,132,42)'),
                    borderDash: ctx => skipped(ctx, [6, 6]),
                },
                borderWidth: 1,
                spanGaps: true
            },{
                label: 'Режим',
                data: graphData.map(it => it.s).map(zeroToNaN),
                borderColor: 'rgb(29,157,0)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateState(state) {
    switchVent(state.state);
    const infoContainer = document.getElementById("info-container");
    infoContainer.classList.remove('red');
    infoContainer.style.display = 'none';

    const infoData = document.getElementById("info-data");
    if (state.hoursOff != -1 && state.minutesOff != -1) {
        const timeString = String(state.hoursOff).padStart(2, '0') + ':' + String(state.minutesOff).padStart(2, '0');
        infoData.textContent = 'Вимкнеться о ' + timeString;
        infoContainer.style.display = 'flex';
    }

    if (state.humidityAlarm == 1) {
        infoData.textContent = 'Вимкнеться після зниження вологості!';
        infoContainer.style.display = 'flex';
    }

    const humidityElement = document.getElementById('humidity');
    const temperatureElement = document.getElementById('temperature');

    humidityElement.textContent = state.humidity + '%';
    temperatureElement.textContent = state.temperature + '°C';

    turboSwitch.checked = state.state == 2;
    humidityTriggerSwitch.checked = state.humidityTriggerAllowed == 1;
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
function sendHumidityTriggerState(state) {
    fetch('/trigger?state=' + state)
        .then(response => response.json())
        .then(data => {
            updateState(data);
            console.log('Триггер оновлено: ' + data.humidityTriggerAllowed);
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