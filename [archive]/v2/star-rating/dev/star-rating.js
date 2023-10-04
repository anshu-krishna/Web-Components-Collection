class StarRating extends HTMLElement {
	static #template;
	static #tag = 'star-rating';
	static {
		(async () => {
			this.#template = document.createElement('template');

			this.#template.innerHTML = await (async () => {
				const file = String(new URL(import.meta.url + '/../' + this.#tag + '.html'));
				const html = await fetch(file);
				return (html.status === 200) ? (await html.text()) : '<code>Load-Error: '+ file +'</code>';
			})();

			customElements.define(this.#tag, this);
			console.log('WebCompoent Loaded: ' + this.#tag + ';');
		})();
	}

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
		rotate: 0, precision: 2,
		value: 0, max: 5
	};
	constructor() {
		super();
		this.#nodes = {
			root: this.attachShadow({ mode: 'closed' }),
			get starSpans() { return this.cntr.querySelectorAll('div > span'); },
			get ip() { return this.cntr.querySelector('#ip'); }
		};
		this.#nodes.root.appendChild(StarRating.#template.content.cloneNode(true));
		this.#nodes.cntr = this.#nodes.root.querySelector('#cntr');

		this.#internals = this.attachInternals();
		for(const p of Object.keys(ElementInternals.prototype).filter(v => v.startsWith('aria'))) {
			Object.defineProperty(this, p, { value: this.#internals[p] });
		}
		
		this.#setClipPath();
		this.#genStars();
		this.#fillStars();
	}
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

	/* Max star count [1, 10] */
	get max() { return this.#attrs.max; }
	set max(value) { this.setAttribute('max', value); }

	/* Value [0, Max] */
	get value() { return this.#attrs.value; }
	set value(v) { this.setAttribute('value', v); }

	#genStars(count = 5) {
		this.#nodes.cntr.innerHTML = `${[...StarRating.#RangeN(0, count)].map(() => `<div part="star"><span></span></div>`).join('')}<input id="ip" type="checkbox" />`;
	}
	static #calc_scale_n_offset(p) {
		const
			min = Math.min(...p),
			max = Math.max(...p);
		// p.scale = 100 / (max - min);
		p.offset = 50 - ((max + min) / 2);
	}
	#setClipPath() {
		// console.log('Drawing -->', this.#attrs);
		const
			sR = (100 - this.#attrs.depth) / 2,
			digits = this.#attrs.precision,
			x = [],
			y = [],
			polygon = [];
		
		for(
			const [i, ang] of
			Object.entries(
				[...StarRating.#RangeN(
					this.#attrs.rotate + 270 ,
					360 + 270 + this.#attrs.rotate,
					180 / this.#attrs.points
				)].map(ang => {
					const rad = (ang % 360) * Math.PI / 180;
					return { sin: Math.sin(rad), cos: Math.cos(rad)};
				})
			)
		) {
			const l = i % 2 ? sR : 50;
			x.push(l * ang.cos);
			y.push(l * ang.sin);
		}
		StarRating.#calc_scale_n_offset(x);
		StarRating.#calc_scale_n_offset(y);

		for(const i of StarRating.#RangeN(0, x.length)) {
			polygon.push(`${
				// Number((x[i] * x.scale + x.offset).toFixed(digits))
				Number((x[i] + x.offset).toFixed(digits))
			}% ${
				// Number((y[i] * y.scale + y.offset).toFixed(digits))
				Number((y[i] + y.offset).toFixed(digits))
			}%`);
		}

		this.#nodes.cntr.style.setProperty('--clip-path', `polygon(${polygon.join(',')})`);
	}
	#fillStars() {
		let { max, value } = this.#attrs;
		value = Number(value.toFixed(2));
		const stars = [...this.#nodes.starSpans];
		for(const i of StarRating.#RangeN(0, max)) {
			let fill = value - i;
			if(fill > 1) { fill = 1; }
			else if(fill < 0) { fill = 0; }
			stars[i].style.setProperty('--fill', `${fill * 100}%`);
		}
	}
	#setClickHandlers(changeable) {
		if(changeable) {
			for(const [i, s] of Object.entries(this.#nodes.starSpans)) {
				s.parentElement.onclick = (e) => {
					e.preventDefault();
					e.stopPropagation();
					this.value = parseInt(i) + 1;
				};
			}
		} else {
			for(const s of this.#nodes.starSpans) {
				s.parentElement.onclick = null;
			}
		}
	}

	connectedCallback() { this.#formUpdate(); }
	// disconnectedCallback() { }
	adoptedCallback() { this.#formUpdate(); }

	static get observedAttributes() {
		return [
			'points', 'depth', 'rotate', 'precision',
			'max', 'value', 'changeable', 'required'
		];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		if(oldVal === newVal) { return; }
		// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
		switch(attrName) {
			case 'points': {
				this.#attrs.points = StarRating.#checkNum(newVal, { int: true, min: 2 }) ?? 5;
				this.#setClipPath();
			} break;
			case 'depth': {
				this.#attrs.depth = StarRating.#checkNum(newVal, { min: 0, max: 99 }) ?? 50;
				this.#setClipPath();
			} break;
			case 'rotate': {
				this.#attrs.rotate = StarRating.#checkNum(newVal, { mod: 360, min: 0, max: 360 }) ?? 0;
				this.#setClipPath();
			} break;
			case 'precision': {
				this.#attrs.precision = StarRating.#checkNum(newVal, { int: true, min: 0, max: 7 }) ?? 7;
				this.#setClipPath();
			} break;
			case 'max': {
				this.#attrs.max = StarRating.#checkNum(newVal, { int:true, min:1, max: 10 }) ?? 5;
				this.#genStars(this.#attrs.max);
				this.#fillStars();
				this.#formUpdate();
				this.#setClickHandlers(this.hasAttribute('changeable'));
			} break;
			case 'value': {
				this.#attrs.value = StarRating.#checkNum(newVal, { min: 0, max: this.max }) ?? 0;
				this.#fillStars();
				this.#formUpdate();
				this.dispatchEvent(new Event('change', { bubbles: true }));
			} break;
			case 'changeable': {
				this.#setClickHandlers(newVal !== null);
			} break;
			case 'required': { this.#formUpdate(); } break;
		}
	}
	
	// FORM RELATED
	#formUpdate() {
		const value = this.value;
		this.#internals.setFormValue(value);
		if(this.hasAttribute('required') && value === 0) {
			this.#internals.setValidity({ valueMissing: true }, 'A rating is required', this.#nodes.ip);
		} else {
			this.#internals.setValidity({});
		}
	}
	// static get focusable() { return true; }
	static get formAssociated() { return true; }
	get shadowRoot() { return this.#internals.shadowRoot; }
	get form() { return this.#internals.form; }
	get states() { return this.#internals.states; }
	get willValidate() { return this.#internals.willValidate; }
	get validity() { return this.#internals.validity; }
	get validationMessage() { return this.#internals.validationMessage; }
	get labels() { return this.#internals.labels; }

	setFormValue(...args) { return this.#internals.setFormValue(...args); }
	setValidity(...args) { return this.#internals.setValidity(...args); }
	checkValidity(...args) { return this.#internals.checkValidity(...args); }
	reportValidity(...args) { return this.#internals.reportValidity(...args); }

	get name() { return this.getAttribute('name'); }
	get type() { return this.localName; }
}