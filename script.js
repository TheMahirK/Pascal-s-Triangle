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
const DROP_STEP = 600;
const PLUS_STEP = 260;
const PLUS_LEAD = 140;
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

    data.forEach(function (row, rowIndex) {
        row.forEach(function (_, columnIndex) {
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


function createFallingNumber(sourceCell, targetCell, value, targetOffset) {
    const number = document.createElement("span");
    const sourceLeft = Number.parseFloat(sourceCell.style.left);
    const sourceTop = Number.parseFloat(sourceCell.style.top);
    const targetLeft = Number.parseFloat(targetCell.style.left);
    const targetTop = Number.parseFloat(targetCell.style.top);

    number.className = "falling-number";
    number.textContent = value;
    number.style.setProperty("--operand-font-size", `${getOperandFontSize(value)}px`);
    number.style.left = `${sourceLeft}px`;
    number.style.top = `${sourceTop}px`;
    // Animate a cloned value from its parent cell to its reserved side of the target.
    number.style.setProperty(
        "--drop-x",
        `${targetLeft - sourceLeft + targetOffset}px`
    );
    number.style.setProperty("--drop-y", `${targetTop - sourceTop}px`);
    triangle.appendChild(number);

    requestAnimationFrame(function () {
        number.classList.add("dropping");
    });
    return number;
}


function getOperandFontSize(value) {
    const digitCount = String(value).length;
    return digitCount >= 4 ? 14 : digitCount === 3 ? 16 : digitCount === 2 ? 22 : 30;
}


function getOperandOffset(leftValue, rightValue) {
    const fontSize = Math.min(
        getOperandFontSize(leftValue),
        getOperandFontSize(rightValue)
    );
    const widestValue = Math.max(String(leftValue).length, String(rightValue).length);
    const estimatedTextWidth = widestValue * fontSize * 0.6;
    const plusHalfWidth = fontSize * 0.35;

    // Leave a center lane for the plus while keeping both operands inside the cell.
    return Math.min(25, Math.ceil(estimatedTextWidth / 2 + plusHalfWidth + 4));
}


function createPlus(cell) {
    const operator = document.createElement("span");
    operator.className = "operator";
    operator.textContent = "+";
    cell.appendChild(operator);
    return operator;
}


function wait(step) {
    return new Promise(function (resolve) {
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
            const leftValue = data[row - 1][column - 1];
            const rightValue = data[row - 1][column];
            const operandFontSize = Math.min(
                getOperandFontSize(leftValue),
                getOperandFontSize(rightValue)
            );
            const operandOffset = getOperandOffset(leftValue, rightValue);

            leftParent.classList.add("orange");
            rightParent.classList.add("orange");
            const leftNumber = createFallingNumber(
                leftParent,
                currentCell,
                leftValue,
                -operandOffset
            );
            const rightNumber = createFallingNumber(
                rightParent,
                currentCell,
                rightValue,
                operandOffset
            );
            currentCell.classList.add("green", "calculating");
            const operator = createPlus(currentCell);
            currentCell.style.setProperty("--operand-font-size", `${operandFontSize}px`);

            // Reveal the plus shortly before the operands finish their drop.
            await wait(DROP_STEP - PLUS_LEAD);
            if (!isCurrentAnimation(thisAnimation)) return;

            operator.classList.add("visible");
            await wait(PLUS_LEAD);
            if (!isCurrentAnimation(thisAnimation)) return;

            await wait(PLUS_STEP);
            if (!isCurrentAnimation(thisAnimation)) return;

            leftNumber.classList.add("fading");
            rightNumber.classList.add("fading");
            await wait(PLUS_STEP);
            if (!isCurrentAnimation(thisAnimation)) return;

            // Swap the fading operands for the final value after the handoff.
            leftNumber.remove();
            rightNumber.remove();
            currentCell.replaceChildren();
            const result = document.createElement("span");
            result.textContent = data[row][column];
            result.className = "result";
            currentCell.appendChild(result);
            await wait(DEFAULT_STEP);

            leftParent.classList.remove("orange");
            rightParent.classList.remove("orange");
            currentCell.classList.remove("green", "calculating");
            currentCell.classList.add("cyan");
            currentCell.style.removeProperty("--operand-font-size");
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
    document.documentElement.style.setProperty(
        "--drop-duration",
        `${DROP_STEP / speed}ms`
    );
}


initialForm.addEventListener("submit", function (event) {
    submitRows(event, initialInput, initialError, true);
});

rowsForm.addEventListener("submit", function (event) {
    submitRows(event, rowsInput, rowsError, false);
});

speedInput.addEventListener("input", updateSpeed);
updateSpeed();
