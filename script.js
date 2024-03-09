var dropArea = document.getElementById('dropArea');
var output = document.getElementById('output');
var fileInput = document.getElementById('fileInput');
var notification = document.getElementById('notification');
var notificationMessage = document.getElementById('notificationMessage');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);

dropArea.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    var files = this.files;
    var validFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('handling.meta'));

    if (validFiles.length > 0) {
        handleFiles(validFiles);
    } else {
        notificationMessage.textContent = "Invalid file type. Please provide a handling.meta";
        notification.classList.add('show');

        notification.style.opacity = 1;

        setTimeout(function() {
            notification.style.opacity = 0;
        }, 3000);
    }
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.style.backgroundColor = '#525252';
    dropArea.style.color = '#fff';
}

function unhighlight() {
    dropArea.style.backgroundColor = '';
    dropArea.style.color = '';
}

function handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    if (files.length === 0) {
        return;
    }

    var file = files[0];
    if (file.name.toLowerCase().endsWith('handling.meta')) {
        handleFiles(files);
    } else {
        notificationMessage.textContent = "Invalid file type. Please provide a handling.meta";
        notification.classList.add('show');

        notification.style.opacity = 1;

        setTimeout(function() {
            notification.style.opacity = 0;
        }, 3000);
    }
}

function handleFiles(files) {
    if (files.length === 0) {
        return;
    }

    var file = files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
        var content = event.target.result;
        var regexMass = /<fMass value="(\d+\.\d+)" \/>/;
        var regexDriveForce = /<fInitialDriveForce value="(\d+\.\d+)" \/>/;
        var regexDriveMaxVel = /<fInitialDriveMaxFlatVel value="(\d+\.\d+)" \/>/;
        var regexEngineDamage = /<fEngineDamageMult value="(\d+\.\d+)" \/>/;
        var regexFlightHandling = /fMaxPitchTorque/;

        var massMatches = content.match(regexMass);
        var driveForceMatches = content.match(regexDriveForce);
        var driveMaxVelMatches = content.match(regexDriveMaxVel);
        var engineDamageMatches = content.match(regexEngineDamage);
        var flightHandlingMatch = regexFlightHandling.test(content);

        output.innerHTML = '';

        if (massMatches && parseFloat(massMatches[1]) > 2250) {
            output.innerHTML += '<div class="detection"><img src="./assets/bad.png" alt="Icon"> <p>Vehicles with mass over 2.25k found.</p></div>';
        } else {
            output.innerHTML += '<div class="detection"><img src="./assets/good.png" alt="Icon"> <p>No vehicles with mass over 2.25k found.</p></div>';
        }

        if (driveForceMatches && parseFloat(driveForceMatches[1]) > 4000) {
            output.innerHTML += '<div class="detection"><img src="./assets/bad.png" alt="Icon"> <p>Initial drive force over 4k found.</p></div>';
        } else {
            output.innerHTML += '<div class="detection"><img src="./assets/good.png" alt="Icon"> <p>No initial drive force over 4k found.</p></div>';
        }

        if (driveMaxVelMatches && parseFloat(driveMaxVelMatches[1]) > 350) {
            output.innerHTML += '<div class="detection"><img src="./assets/bad.png" alt="Icon"> <p>Initial drive max flat velocity over 350 found.</p></div>';
        } else {
            output.innerHTML += '<div class="detection"><img src="./assets/good.png" alt="Icon"> <p>No initial drive max flat velocity over 350 found.</p></div>';
        }

        if (engineDamageMatches && parseFloat(engineDamageMatches[1]) < 0.5) {
            output.innerHTML += '<div class="detection"><img src="./assets/bad.png" alt="Icon"> <p>Engine damage multiplier lower than 0.5 found.</p></div>';
        } else {
            output.innerHTML += '<div class="detection"><img src="./assets/good.png" alt="Icon"> <p>No engine damage multiplier lower than 0.5 found.</p></div>';
        }

        if (flightHandlingMatch) {
            output.innerHTML += '<div class="detection"><img src="./assets/ok.png" alt="Icon"> <p>Flight handling data found.</p></div>';
        } else {
            output.innerHTML += '<div class="detection"><img src="./assets/good.png" alt="Icon"> <p>No flight handling data found.</p></div>';
        }

        output.style.opacity = 1;

        setTimeout(function() {
            output.style.opacity = 0;
        }, 4000);
    };

    reader.readAsText(file);
}
