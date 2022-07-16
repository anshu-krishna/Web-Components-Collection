/*
Author: Anshu Krishna
Contact: anshu.krishna5@gmail.com
Date: 13-Sep-2019
*/
class StarRating extends HTMLElement {
	constructor() {
		super();
		let root = this.attachShadow({ mode: 'closed' });
		root.appendChild(StarRating.__template.content.cloneNode(true));
		Object.defineProperties(this, {
			__cntr: {
				enumerable: false,
				writable: false,
				value: root.querySelector('#cntr')
			},
			__painter: {
				enumerable: false,
				writable: false,
				value: () => {
					let value = this.value, max = this.max;
					let style = getComputedStyle(this);
					let color = style.getPropertyValue('--star-fill-color');
					let back = style.getPropertyValue('--star-back-color');
					this.__cntr.innerHTML = StarRating.StarMaker.gen(value, max, color, back);
					this.__cntr.setAttribute('title', `${value} of ${max}`);
				}
			},
			__onclick: {
				enumerable: false,
				writable: false,
				value: e => {
					e.stopPropagation();
					let svg = null;
					switch(e.target.nodeName) {
						case 'path':
							svg = e.target.parentNode;
							break;
						case 'svg':
							svg = e.target;
					}
					if(svg === null) {
						return;
					}
					let index = 1;
					while( (svg = svg.previousSibling) !== null) {
						index++;
					}
					let value = this.value;
					if(value === index) {
						this.value = 0;
						this.dispatchEvent(new CustomEvent('change', {
							detail: {
								old: value,
								new: 0
							}
						}));
					} else {
						this.value = index;
						this.dispatchEvent(new CustomEvent('change', {
							detail: {
								old: value,
								new: index
							}
						}));
					}
				}
			}
		});
	}
	get value() {
		let v = this.getAttribute('value');
		return (v === null) ? 0 : parseFloat(v);
	}
	get max() {
		let v = this.getAttribute('max');
		return (v === null) ? 5 : parseInt(v);
	}
	set value(val) {
		if(val === null) {
			this.removeAttribute('value');
		} else {
			this.setAttribute('value', parseFloat(val));
		}
	}
	set max(val) {
		if(val === null) {
			this.removeAttribute('max');
		} else {
			this.setAttribute('max', parseInt(val));
		}
	}
	connectedCallback() {
		this.__painter();
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	static get observedAttributes() {
		return ['value', 'max', 'changeable'];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch(name) {
			case 'value':
			case 'max':
				this.__painter();
				break;
			case 'changeable':
				if(newval === null) {
					this.__cntr.removeEventListener('click', this.__onclick);
					this.__cntr.classList.remove('clickable');
				} else {
					this.__cntr.addEventListener('click', this.__onclick);
					this.__cntr.classList.add('clickable');
				}
				break;
		}
	}
}
Object.defineProperties(StarRating, {
	__template: {
		enumerable: false,
		writable: false,
		value: document.createElement('template')
	},
	StarMaker: {
		enumerable: false,
		writable: false,
		value: class {
			static fullStar(color) {
				let span = document.createElement('span');
				span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 300 300"><path fill="${color}" d="M150 14.3l35.3 101.4 107.4 2.2-85.6 64.9 31.1 102.8L150 224.3l-88.2 61.3 31.1-102.8L7.4 118l107.4-2.2L150 14.3l35.3 101.4z"/></svg>`;
				return span.firstChild;
			}
			static partialStar(part, color, background) {
				let span = document.createElement('span');
				span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 300 300"><defs><linearGradient id="partial"><stop offset="0%" stop-color="${color}"/><stop offset="${part}%" stop-color="${color}"/><stop offset="${part}%" stop-color="${background}"/><stop offset="100%" stop-color="${background}"/></linearGradient></defs><path fill="url(#partial)" d="M150 14.3l35.3 101.4 107.4 2.2-85.6 64.9 31.1 102.8L150 224.3l-88.2 61.3 31.1-102.8L7.4 118l107.4-2.2L150 14.3l35.3 101.4z"/></svg>`;
				return span.firstChild;
			}
			static gen(value, max = 5, color = 'red', background = 'grey') {
				color = String(color).trim();
				background = String(background).trim();
				max = parseInt(max);
				let div = document.createElement('div');
				if(value >= max) {
					for(let i = 0; i < max; i++) {
						div.appendChild(StarRating.StarMaker.fullStar(color));
					}
				} else {
					let full = parseInt(value);
					let part = parseInt(Number(value - full).toFixed(2) * 100);
					for(let i = 0; i < full; i++) {
						div.appendChild(StarRating.StarMaker.fullStar(color));
					}
					if(part !== 0) {
						div.appendChild(StarRating.StarMaker.partialStar(part, color, background));
						full++;
					}
					for(let i = full; i < max; i++) {
						div.appendChild(StarRating.StarMaker.fullStar(background));
					}
				}
				return div.innerHTML;
			}
		}
	}
});
StarRating.__template.innerHTML = `<style>
:host {
	--star-fill-color: #ffd700;
	--star-back-color: #b2b2b2;

	--star-stroke: none;
	--star-stroke-opacity: inherit;
	--star-stroke-width: 0.2em;

	display: inline-block;
}
svg {
	height: 1em;
	width: auto;
}
path {
	stroke: var(--star-stroke);
	stroke-opacity: var(--star-stroke-opacity);
	stroke-width: var(--star-stroke-width);
}
#cntr {
	display: flex;
	grid-gap: 0.1em;
}
#cntr.clickable svg {
	cursor: pointer;
}
</style><div id="cntr"></div>`;

customElements.define("star-rating", StarRating);