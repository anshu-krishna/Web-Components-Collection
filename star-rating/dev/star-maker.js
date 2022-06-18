function* RangeN(start = 0, end = null, step = 1) {
	end ??= Number.MAX_SAFE_INTEGER - step;
	const stepSign = Math.sign(step);
	if(Math.sign(end - start) !== stepSign) {
		throw new RangeError(`Infinite steps: ${start} -> ${end} is impossible with ${step} as increment`);
	}
	let i = start;
	while(i !== end && Math.sign(end - i) === stepSign) {
		yield i;
		i += step;
	}
}

function starMaker({
	points = 5, /* Number of points in the star */
	depth = 50, /* In percentage [0, 100) */
	rotate = 0, /* In Degree [0, 360] */
	precision = 7, /* Digits after decimal [0, 7] */
	recenter = true, /* Center the svg to viewbox */
	width = 100, /* Image width in px */
	height = 100, /* Image height in px */
} = {}) {
	function Round(num) { return Number(num.toFixed(precision)); }

	depth = 100 - depth;
	// const width = size, height = size;
	// const width = 100, height = 50;

	const PI = Math.PI;
	const angularStep = PI / points;

	const
		x = [],
		y = [],
		xL = width / 2,
		xS = (width * depth) / 200,
		yL = height / 2,
		yS = (height * depth) / 200,
		vIdx = [...RangeN(0, points * 2)];

	let rad = (rotate - 90) * (PI / 180);
	for(const i of vIdx) {
		let xr, yr;
		if(i % 2) { xr = xS; yr = yS; }
		else { xr = xL; yr = yL; }

		x.push((xr * Math.cos(rad)) + xL);
		y.push((yr * Math.sin(rad)) + yL);
		rad += angularStep;
	}
	if(recenter) {
		const xoff = xL - ((Math.max(...x) + Math.min(...x)) / 2);
		const yoff = yL - ((Math.max(...y) + Math.min(...y)) / 2);
		for(const i of vIdx) {
			x[i] += xoff;
			y[i] += yoff;
		}
	}

	const t = document.createElement('template');
	t.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" stroke="#000" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><path d="M${vIdx.map(i => `${Round(x[i])} ${Round(y[i])}`).join('L')}Z" /></svg>`;
	return t.content.firstElementChild;
}