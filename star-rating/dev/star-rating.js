if (typeof customElements.get('star-rating') === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../star-rating.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text()).catch(e => 'Unable to load: ' + __template_file__);

	class StarRating extends HTMLElement {
		static* #RangeN(start = 0, end = null, step = 1) {
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
		static #checkNum(value, {
			int = false,
			mod = null,
			min = null,
			max = null
		} = {}) {
			let v = Number(value);
			if(!Number.isFinite(v)) { return null; }
			if(int) { v = parseInt(v); }
			if(mod !== null) {
				const m = min ?? 0;
				while(v < m) { v+= mod; }
				v %= mod;
			}
			if(min !== null && v < min) { return null; }
			if(max !== null && v > max) { return null; }
			return v;
		}

		#nodes;
		#internals;

		#attrs = {
			points: 5, depth: 50,
			rotate: 0, precision: 7,
		};
		
		#angles = [];
		#resizeObserver;

		/* Number of points in the star */
		get points() { return this.#attrs.points; }
		set points(value) { this.setAttribute('points', value); }

		/* Depth in percentage [0, 90) */
		get depth() { return this.#attrs.depth; }
		set depth(value) { this.setAttribute('depth', value); }

		/* Rotate in Degree [0, 360] */
		get rotate() { return this.#attrs.rotate; }
		set rotate(value) { this.setAttribute('rotate', value); }

		/* Precision: digits after decimal [0, 7] */
		get precision() { return this.#attrs.precision; }
		set precision(value) { this.setAttribute('precision', value); }
		
		constructor() {
			super();
			this.#nodes = {
				root: this.attachShadow({ mode: 'closed' }),
				get stars() { return this.cntr.querySelectorAll('#cntr > div > span'); }
			};
			this.#nodes.root.appendChild(__template__.content.cloneNode(true));
			this.#nodes.cntr = this.#nodes.root.querySelector('#cntr');

			this.#internals = this.attachInternals();
			for(const p of Object.keys(ElementInternals.prototype).filter(v => v.startsWith('aria'))) {
				Object.defineProperty(this, p, { value: this.#internals[p] });
			}
			
			this.#genStars();

			this.#resizeObserver = new ResizeObserver(entries => {
				const height = entries[0].contentRect.height;
				this.#draw(height)
			});
			this.#resizeObserver.observe(this);
		}
		#genStars(count = 5) {
			this.#nodes.cntr.innerHTML = `${[...StarRating.#RangeN(0, count)].map(() => `<div part="star"><span></span></div>`).join('')}`;
		}
		#calcAngles() {
			const incr = 180 / this.#attrs.points;
			this.#angles = [...StarRating.#RangeN(
				this.#attrs.rotate,
				(2 * this.#attrs.points * incr) + this.#attrs.rotate,
				incr
			)].map(a => {
				const deg = (a - 90) % 360;
				const rad = deg * Math.PI / 180;
				return {
					deg: deg,
					sin: Math.sin(rad),
					cos: Math.cos(rad)
				};
			});
		}
		#draw(sizeInPx = null) {
			console.log('Drawing', sizeInPx);
			
			if(sizeInPx === null) { sizeInPx = this.#nodes.cntr.clientHeight; }
			if(this.#angles.length === 0) { this.#calcAngles(); }
			const rL = sizeInPx / 2;
			const rS = rL * (100 - this.#attrs.depth) / 100;
			const x = [], y = [];
			for(const i in this.#angles) {
				const r = (i % 2) ? rS : rL;
				const { sin, cos } = this.#angles[i];
				x.push(r * cos);
				y.push(r * sin)
			}
			const xoff = rL - ((Math.max(...x) + Math.min(...x)) / 2);
			const yoff = rL - ((Math.max(...y) + Math.min(...y)) / 2);

			const digits = this.#attrs.precision;
			
			let path = [];
			for(const i in this.#angles) {
				x[i] = Number((x[i] + xoff).toFixed(digits));
				y[i] = Number((y[i] + yoff).toFixed(digits));
				path.push(`${x[i]} ${y[i]}`);
			}
			path = `M${path.join('L')}Z`;

			for(const s of this.#nodes.stars) {
				s.setAttribute('style',`width:${sizeInPx}px; height:${sizeInPx}px; clip-path: path('${path}');`);
			}
		}
		// connectedCallback() { this.#formUpdate(); }
		// disconnectedCallback() { }
		// adoptedCallback() { this.#formUpdate(); }

		static get observedAttributes() {
			return ['points', 'depth', 'rotate', 'precision'];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			if(oldVal === newVal) { return; }
			// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
			switch(attrName) {
				case 'points': {
					this.#attrs.points = StarRating.#checkNum(newVal, { int: true, min: 2 }) ?? 5;
					this.#calcAngles();
					this.#draw();
				} break;
				case 'depth': {
					this.#attrs.depth = StarRating.#checkNum(newVal, { min: 0, max: 99 }) ?? 50;
					this.#draw();
				} break;
				case 'rotate': {
					this.#attrs.rotate = StarRating.#checkNum(newVal, { mod: 360, min: 0, max: 360 }) ?? 0;
					this.#calcAngles();
					this.#draw();
				} break;
				case 'precision': {
					this.#attrs.precision = StarRating.#checkNum(newVal, { int: true, min: 0, max: 7 }) ?? 7;
					this.#draw();
				} break;
			}
		}

		// FORM RELATED
		// #formUpdate() {
		// 	this.#internals.setFormValue(0);
		// 	this.#internals.setValidity({});
		// }
		// static get focusable() { return true; }
		// static get formAssociated() { return true; }
		// get shadowRoot() { return this.#internals.shadowRoot; }
		// get form() { return this.#internals.form; }
		// get states() { return this.#internals.states; }
		// get willValidate() { return this.#internals.willValidate; }
		// get validity() { return this.#internals.validity; }
		// get validationMessage() { return this.#internals.validationMessage; }
		// get labels() { return this.#internals.labels; }

		// setFormValue(...args) { return this.#internals.setFormValue(...args); }
		// setValidity(...args) { return this.#internals.setValidity(...args); }
		// checkValidity(...args) { return this.#internals.checkValidity(...args); }
		// reportValidity(...args) { return this.#internals.reportValidity(...args); }

		// get name() { return this.getAttribute('name'); }
		// get type() { return this.localName; }
	}

	customElements.define('star-rating', StarRating);
}