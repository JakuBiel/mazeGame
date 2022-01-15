const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
	element: document.body, //where to draw a world a canvas
	engine: engine,
	options: {
		width: width,
		height: height,
		wireframes: true,
	},
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
	Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];

World.add(world, walls);

//Maze generation

// const grid = [];
// for (let i = 0; i < 3; i++) {
// 	grid.push([]);
// 	for (let j = 0; j < 3; j++) {
// 		grid[i].push(false);
// 	}
// }

const shuffle = (arr) => {
	let counter = arr.length;

	while (counter > 0) {
		const index = Math.floor(Math.random() * counter);
		counter--;

		const temp = arr[counter];
		arr[counter] = arr[index];
		arr[index] = temp;
	}
	return arr;
};

const grid = Array(cells)
	.fill(null)
	.map(() => Array(cells).fill(false));

const verticals = Array(cells)
	.fill(null)
	.map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
	.fill(null)
	.map(() => Array(cells).fill(false));

//starting cell
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

//maze creation
const stepThruCell = (row, column) => {
	//if cell visited, return
	if (grid[row][column]) {
		return;
	}
	//mark cell as visited
	grid[row][column] = true;

	//asamble list of neighbor s by co-ordinates
	const neighbors = shuffle([
		[row - 1, column, "up"],
		[row, column + 1, "right"],
		[row + 1, column, "down"],
		[row, column - 1, "left"],
	]);

	//for each neighbor..
	for (let neighbor of neighbors) {
		const [nextRow, nextColumn, direction] = neighbor;

		//* check if neighbor beyond boundary
		if (
			nextRow < 0 ||
			nextRow >= cells ||
			nextColumn < 0 ||
			nextColumn >= cells
		) {
			continue;
		}

		//* check if neighbor visited, if so continue to next neighbor
		if (grid[nextRow][nextColumn]) {
			continue;
		}

		//*remove a wall from horizontals or verticals

		if (direction === "left") {
			verticals[row][column - 1] = true;
		} else if (direction === "right") {
			verticals[row][column] = true;
		} else if (direction === "up") {
			horizontals[row - 1][column] = true;
		} else if (direction === "down") {
			horizontals[row][column] = true;
		}

		//visit next cell
		stepThruCell(nextRow, nextColumn);
	}
};
stepThruCell(startRow, startColumn);
