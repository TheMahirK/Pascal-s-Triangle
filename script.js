const triangle = document.getElementById("triangle");

const CELL_WIDTH = 80;
const CELL_HEIGHT = 92.38;
const ROW_GAP = 69;


function nCr(n, r) {
    let res = 1;

    for (let i = 0; i < r; i++) {
        res *= (n - i);
        res /= (i + 1);
    }

    return res;
}


function pascalsTriangle(numRows) {
    let result = [];

    for (let n = 1; n <= numRows; n++) {
        let row = [];

        for (let r = 1; r <= n; r++) {
            row.push(nCr(n - 1, r - 1));
        }

        result.push(row);
    }

    return result;
}


function createTriangle(data) {

    triangle.innerHTML = "";

    const rows = data.length;

    const width = rows * CELL_WIDTH;
    const height = CELL_HEIGHT + (rows - 1) * ROW_GAP;

    triangle.style.width = width + "px";
    triangle.style.height = height + "px";


    for (let i = 0; i < rows; i++) {

        const row = data[i];

        for (let j = 0; j < row.length; j++) {

            const cell = document.createElement("div");
            const number = document.createElement("span");

            cell.classList.add("cell");

            number.textContent = "";

            cell.appendChild(number);


            const x =
                (rows - row.length) * CELL_WIDTH / 2
                + j * CELL_WIDTH;

            const y = i * ROW_GAP;


            cell.style.left = x + "px";
            cell.style.top = y + "px";


            cell.dataset.row = i;
            cell.dataset.col = j;


            triangle.appendChild(cell);
        }
    }
}


function getCell(row, col) {

    return document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
    );
}


function getNumber(cell) {

    return cell.querySelector("span");
}


function sleep(milliseconds) {

    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


async function showRow(data, row) {

    for (let col = 0; col < data[row].length; col++) {

        const cell = getCell(row, col);

        cell.classList.add("show");

        await sleep(400);
    }
}


async function animateTriangle(data) {

    createTriangle(data);

    await sleep(750);


    for (let row = 0; row < data.length; row++) {

        await showRow(data, row);


        const leftCell = getCell(row, 0);
        const rightCell = getCell(row, row);


        leftCell.classList.add("cyan");

        getNumber(leftCell).textContent = data[row][0];


        if (rightCell !== leftCell) {

            rightCell.classList.add("cyan");

            getNumber(rightCell).textContent = data[row][row];
        }


        await sleep(750);


        for (let col = 1; col < row; col++) {

            const parentLeft = getCell(row - 1, col - 1);
            const parentRight = getCell(row - 1, col);

            const currentCell = getCell(row, col);


            parentLeft.classList.add("orange");
            parentRight.classList.add("orange");


            currentCell.classList.add("green");
            currentCell.classList.add("calculating");


            getNumber(currentCell).textContent =
                data[row - 1][col - 1]
                + " + "
                + data[row - 1][col];


            await sleep(750);


            getNumber(currentCell).textContent =
                data[row][col];


            await sleep(750);


            parentLeft.classList.remove("orange");
            parentRight.classList.remove("orange");


            currentCell.classList.remove("green");
            currentCell.classList.remove("calculating");


            currentCell.classList.add("cyan");


            await sleep(750);
        }
    }
}


const data = pascalsTriangle(16);

animateTriangle(data);