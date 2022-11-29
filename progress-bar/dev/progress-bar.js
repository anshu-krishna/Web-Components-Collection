class ProgressBar extends HTMLElement {
	static #template;
	static #tag = 'progress-bar';
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

	#root;
	#fillNode;
	#txtNode;
	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(ProgressBar.#template.content.cloneNode(true));
		this.#fillNode = this.#root.querySelector('#fill');
		this.#txtNode = this.#root.querySelector('#txt');
	}
	// connectedCallback() {}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	get max() {
		let m = parseFloat(this.getAttribute('max'));
		if(isNaN(m)) { m = 100; }
		return (m <= 0) ? 100 : m;
	}
	set max(maxVal) {
		if(typeof maxVal !== 'number') {
			maxVal = Number(maxVal);
		}
		if(isNaN(maxVal) || maxVal <= 0) {
			maxVal = 100;
		}
		this.setAttribute('max', maxVal);
	}
	get value() {
		let v = parseFloat(this.getAttribute('value'));
		if(isNaN(v)) { v = 0; }
		if(v < 0) { v = 0; }
		const max = this.max;
		return (v > max) ? max : v;
	}
	set value(val) {
		if(typeof val !== 'number') {
			val = Number(val);
		}
		if(isNaN(val) || val <= 0) {
			val = 0;
		}
		const max = this.max;
		if(val > max) { val = max; }
		this.setAttribute('value', val);
	}
	static get observedAttributes() {
		return ['max', 'value'];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		if(oldVal === newVal) { return; }
		// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
		const val = this.value;
		const max = this.max;
		let per = (val * 100) / max;
		if(Number.isInteger(per)) {
			per = `${per}%`;
		} else {
			`${per.toFixed(1)}%`
		}
		this.#fillNode.style.width = per;
		this.#txtNode.innerText = per;
		this.dispatchEvent(new CustomEvent('change', {
			detail: {
				value: val,
				max: max
			}
		}));
	}
}