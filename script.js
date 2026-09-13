const triangle = document.getElementById("triangle");
const initialForm = document.getElementById("initial-form");
const initialInput = document.getElementById("initial-rows");
const initialError = document.getElementById("initial-error");
const rowsForm = document.getElementById("rows-form");
const rowsInput = document.getElementById("rows");
const rowsError = document.getElementById("rows-error");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speed-value");

const CELL_WIDTH = 80;
const CELL_HEIGHT = 92.38;
const ROW_GAP = 69;
const MIN_ROWS = 1;
const MAX_ROWS = 12;
const DEFAULT_STEP = 750;
let animationNumber = 0;


function getPascalTriangle(rowCount) {
    const triangleRows = [];

    for (let row = 0; row < rowCount; row++) {
        const values = [];

        for (let column = 0; column <= row; column++) {
            values.push(getCombination(row, column));
        }

        triangleRows.push(values);
    }

    return triangleRows;
}


function getCombination(row, column) {
    let result = 1;

    for (let step = 0; step < column; step++) {
        // Round after each division to remove floating-point representation drift.
        result = Math.round(result * (row - step) / (step + 1));
    }

    return result;
}


function createTriangle(data) {
    triangle.innerHTML = "";
    triangle.style.width = `${data.length * CELL_WIDTH}px`;
    triangle.style.height = `${CELL_HEIGHT + (data.length - 1) * ROW_GAP}px`;

    data.forEach((row, rowIndex) => {
        row.forEach((_, columnIndex) => {
            const cell = document.createElement("div");
            const number = document.createElement("span");
            const left = (data.length - row.length) * CELL_WIDTH / 2
                + columnIndex * CELL_WIDTH;

            cell.className = "cell";
            cell.style.left = `${left}px`;
            cell.style.top = `${rowIndex * ROW_GAP}px`;
            cell.dataset.row = rowIndex;
            cell.dataset.column = columnIndex;
            cell.appendChild(number);
            triangle.appendChild(cell);
        });
    });
}


function getCell(row, column) {
    return document.querySelector(
        `.cell[data-row="${row}"][data-column="${column}"]`
    );
}


function setCellText(cell, text) {
    cell.querySelector("span").textContent = text;
}


function wait(step) {
    return new Promise(resolve => {
        setTimeout(resolve, step / getSpeed());
    });
}


function getSpeed() {
    const speed = Number(speedInput.value);
    // Use a safe fallback if the range input is ever changed.
    return Number.isFinite(speed) && speed > 0 ? speed : 1;
}


function isCurrentAnimation(number) {
    return number === animationNumber;
}


async function revealRow(data, row, animationNumberAtStart) {
    for (let column = 0; column < data[row].length; column++) {
        if (!isCurrentAnimation(animationNumberAtStart)) return false;

        getCell(row, column).classList.add("show");
        await wait(400);
    }

    return true;
}


async function buildTriangle(rowCount) {
    // A new build makes older animation steps stop.
    const thisAnimation = ++animationNumber;
    const data = getPascalTriangle(rowCount);

    createTriangle(data);
    await wait(DEFAULT_STEP);

    for (let row = 0; row < data.length; row++) {
        if (!isCurrentAnimation(thisAnimation)) return;
        if (!await revealRow(data, row, thisAnimation)) return;

        const firstCell = getCell(row, 0);
        const lastCell = getCell(row, row);

        firstCell.classList.add("cyan");
        setCellText(firstCell, data[row][0]);

        if (lastCell !== firstCell) {
            lastCell.classList.add("cyan");
            setCellText(lastCell, data[row][row]);
        }

        await wait(DEFAULT_STEP);

        for (let column = 1; column < row; column++) {
            if (!isCurrentAnimation(thisAnimation)) return;

            const leftParent = getCell(row - 1, column - 1);
            const rightParent = getCell(row - 1, column);
            const currentCell = getCell(row, column);

            leftParent.classList.add("orange");
            rightParent.classList.add("orange");
            currentCell.classList.add("green", "calculating");
            setCellText(
                currentCell,
                `${data[row - 1][column - 1]} + ${data[row - 1][column]}`
            );

            await wait(DEFAULT_STEP);
            if (!isCurrentAnimation(thisAnimation)) return;

            setCellText(currentCell, data[row][column]);
            await wait(DEFAULT_STEP);

            leftParent.classList.remove("orange");
            rightParent.classList.remove("orange");
            currentCell.classList.remove("green", "calculating");
            currentCell.classList.add("cyan");
            await wait(DEFAULT_STEP);
        }
    }
}


function validateRows(input, error) {
    const rows = Number(input.value);

    if (!Number.isInteger(rows) || rows < MIN_ROWS) {
        error.textContent = "Enter a value greater than or equal to 1.";
        input.focus();
        return null;
    }

    if (rows > MAX_ROWS) {
        error.textContent = `Enter a value less than or equal to ${MAX_ROWS}.`;
        input.focus();
        return null;
    }

    error.textContent = "";
    return rows;
}


function submitRows(event, input, error, isFirstBuild) {
    event.preventDefault();

    const rows = validateRows(input, error);
    if (rows === null) return;

    rowsInput.value = rows;
    if (isFirstBuild) initialForm.hidden = true;
    rowsForm.hidden = false;
    buildTriangle(rows);
}


function updateSpeed() {
    const speed = getSpeed();
    speedValue.textContent = `${speed.toFixed(2)}x`;
    document.documentElement.style.setProperty(
        "--animation-duration",
        `${350 / speed}ms`
    );
}


initialForm.addEventListener("submit", event => {
    submitRows(event, initialInput, initialError, true);
});

rowsForm.addEventListener("submit", event => {
    submitRows(event, rowsInput, rowsError, false);
});

speedInput.addEventListener("input", updateSpeed);
updateSpeed();
