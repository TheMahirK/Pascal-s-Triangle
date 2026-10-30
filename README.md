# Pascal's Triangle Visualizer

A dependency-free web app that builds and animates Pascal's Triangle.

## Use

Open `index.html` in a browser. Enter a whole number from **1 to 12** and select
**Build triangle**. Use the speed slider to adjust animation from **0.25x to
4x**; use the rebuild form to create another triangle. Invalid row counts show
an error without replacing the current triangle.

The triangle scales to fit narrow or short screens. A new build stops any
animation still in progress.

## Project files

- `index.html` — page structure and controls
- `style.css` — layout, responsive styling, and animation effects
- `script.js` — coefficient calculation, validation, and animation

Each value is a binomial coefficient, calculated iteratively and rounded to
avoid floating-point drift.
