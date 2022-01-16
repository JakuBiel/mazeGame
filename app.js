const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

let level = document.querySelector("option");
// let value = level.options[level.selectedIndex].value;

// if (level.value === "1") {
// 	console.log("1");
// } else if (level.value === "2") {
// 	console.log("2");
// } else if (level.value === "3") {
// 	console.log("3");
// } else {
// 	console.log("4");
// }
const cellsHori = 5;
const cellsVerti = 5;

const width = window.innerWidth * 0.98;
const height = window.innerHeight * 0.95;

const unitLengthX = width / cellsHori;
const unitLengthY = height / cellsVerti;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
	element: document.querySelector(".game"), //where to draw a world a canvas
	engine: engine,
	options: {
		width: width,
		height: height,
		wireframes: false,
	},
});
Render.run(render);
Runner.run(Runner.create(), engine);

//borders
const walls = [
	Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
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

const grid = Array(cellsVerti)
	.fill(null)
	.map(() => Array(cellsHori).fill(false));

const verticals = Array(cellsVerti)
	.fill(null)
	.map(() => Array(cellsHori - 1).fill(false));

const horizontals = Array(cellsVerti - 1)
	.fill(null)
	.map(() => Array(cellsHori).fill(false));

//starting cell
const startRow = Math.floor(Math.random() * cellsVerti);
const startColumn = Math.floor(Math.random() * cellsHori);

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
			nextRow >= cellsVerti ||
			nextColumn < 0 ||
			nextColumn >= cellsHori
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

document.querySelector(".btn").addEventListener("click", function () {
	stepThruCell(startRow, startColumn);
	console.log(startRow, startColumn, stepThruCell);
});
// stepThruCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLengthX + unitLengthX / 2,
			rowIndex * unitLengthY + unitLengthY,
			unitLengthX,
			width * 0.005,
			{
				label: "wall",
				isStatic: true,
				render: {
					fillStyle: "red",
				},
			}
		);
		World.add(world, wall);
	});
});

verticals.forEach((row, rowIndex) => {
	row.forEach((open, columnIndex) => {
		if (open) {
			return;
		}

		const wall = Bodies.rectangle(
			columnIndex * unitLengthX + unitLengthX,
			rowIndex * unitLengthY + unitLengthY / 2,
			width * 0.005,
			unitLengthY,
			{
				label: "wall",
				isStatic: true,
				render: {
					fillStyle: "red",
				},
			}
		);
		World.add(world, wall);
	});
});

//Goal
const goal = Bodies.rectangle(
	width - unitLengthX / 2,
	height - unitLengthY / 2,
	unitLengthX * 0.75,
	unitLengthY * 0.75,
	{
		isStatic: true,
		label: "goal",
		render: {
			fillStyle: "green",
		},
	}
);

World.add(world, goal);

//Ball
const ball = Bodies.circle(
	unitLengthX / 2,
	unitLengthY / 2,
	Math.min(unitLengthY, unitLengthX) * 0.35,
	{
		label: "ball",
		render: {
			fillStyle: "orange",
		},
	}
);

World.add(world, ball);

//Ball movement
document.addEventListener("keydown", (event) => {
	const { x, y } = ball.velocity;

	if (event.key === "w" || event.key === "ArrowUp") {
		Body.setVelocity(ball, { x: x, y: y - 15 / cellsVerti });
	}
	if (event.key === "s" || event.key === "ArrowDown") {
		Body.setVelocity(ball, { x: x, y: y + 15 / cellsVerti });
	}
	if (event.key === "a" || event.key === "ArrowLeft") {
		Body.setVelocity(ball, { x: x - 15 / cellsHori, y: y });
	}
	if (event.key === "d" || event.key === "ArrowRight") {
		Body.setVelocity(ball, { x: x + 15 / cellsHori, y: y });
	}
});

//win condition
Events.on(engine, "collisionStart", (event) => {
	event.pairs.forEach((collision) => {
		const labels = ["ball", "goal"];

		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
			console.log("win");
			world.gravity.y = 1;
			world.bodies.forEach((body) => {
				if (
					body.label === "wall" ||
					body.label === "goal" ||
					body.label === "ball"
				) {
					Body.setStatic(body, false);
				}
			});
			document.querySelector(".winner").classList.remove("hidden");
		}
	});
});
