
# Pascal's Triangle Visualizer

A small browser application that generates and animates Pascal's Triangle. The
user chooses the number of rows, watches the values being calculated, and can
rebuild the triangle at any time.

## Features

- Builds between **1 and 12 rows**.
- Requests the row count when the page first loads.
- Provides a rebuild form in the bottom-right corner.
- Keeps the previous row count in the rebuild form.
- Shows clear validation messages for invalid row counts.
- Provides a continuous animation-speed slider in the top-right corner.
- Stops an older animation when a new triangle is requested.
- Uses only HTML, CSS, and JavaScript. No external libraries are required.

## Running the project

Open `index.html` in a browser. A local web server is optional because the
project uses no server-side code or external modules.

## How to use it

1. Enter an integer from `1` to `12` in the first form.
2. Select **Build triangle**.
3. Use the speed slider to control the animation from `0.25x` to `4x`.
4. Enter another row count in the bottom-right form to rebuild the triangle.

Values below `1`, decimal values, blank values, and values above `12` are
rejected. The form remains available so the user can try again.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, row forms, and speed control |
| `style.css` | Layout, colors, hexagonal cells, and transitions |
| `script.js` | Triangle mathematics, validation, and animation |

## Pascal's Triangle mathematics

The application creates each row using the binomial coefficient:

```text
C(n, r) = n! / (r! * (n - r)!)
```

JavaScript uses the equivalent iterative calculation:

```text
C(n, r) = product of (n - step) / (step + 1)
```

The first row uses `n = 0`, so the generated values begin as:

```text
1
1 1
1 2 1
1 3 3 1
```

The code calculates each row independently and stores the result as a
two-dimensional array. Coefficients are rounded to exact integers after each
step, preventing floating-point display errors through at least 20 rows even
though the user-facing limit is 12 rows.

## JavaScript functions

| Function | Responsibility |
| --- | --- |
| `getPascalTriangle(rowCount)` | Creates all requested rows |
| `getCombination(row, column)` | Calculates one binomial coefficient |
| `createTriangle(data)` | Creates and positions the empty cell elements |
| `getCell(row, column)` | Finds a cell in the displayed triangle |
| `setCellText(cell, text)` | Updates the number shown in a cell |
| `getSpeed()` | Reads the slider and provides a safe speed value |
| `wait(step)` | Delays animation steps according to the speed |
| `revealRow(data, row, animation)` | Reveals one row from left to right |
| `buildTriangle(rowCount)` | Runs the complete triangle animation |
| `validateRows(input, error)` | Checks the row input range and format |
| `submitRows(...)` | Handles both initial and rebuild form submissions |
| `updateSpeed()` | Updates the speed label and CSS transition duration |

## Animation behavior

1. Empty hexagonal cells are created and positioned.
2. Each row appears from left to right.
3. The first and last values of the row turn cyan.
4. For inner values:
   - The two parent cells turn orange.
   - Both orange values drop into opposite sides of the destination cell at the same time.
   - The destination cell turns green and the plus symbol appears just before the values settle.
   - The calculated value replaces the addition with a smooth entrance.
   - The completed cell turns cyan.
5. The process continues until every row is complete.

The default delay for major calculation steps is `750` milliseconds. The
effective delay is calculated as:

```text
actual delay = default delay / selected speed
```

Therefore, a larger speed value makes the animation faster. The cell CSS
transition duration is adjusted using the same speed setting.

## Important constants

| Constant | Meaning |
| --- | --- |
| `MIN_ROWS` | Smallest accepted row count: `1` |
| `MAX_ROWS` | Largest accepted row count: `12` |
| `DEFAULT_STEP` | Base animation delay: `750ms` |
| `CELL_WIDTH` | Width used to position cells: `80px` |
| `CELL_HEIGHT` | Cell height: `92.38px` |
| `ROW_GAP` | Vertical distance between rows: `69px` |

## Animation cancellation

Each build receives a new animation number. Before continuing, asynchronous
steps compare their saved number with the latest number. If they differ, the
older animation exits immediately. This prevents two builds from modifying
the same cells at the same time.
