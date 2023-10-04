class ProgressBar extends HTMLElement {
	static #template;
	static #tag = 'progress-bar';
	static {
		// (async () => {
			this.#template = document.createElement('template');

			this.#template.innerHTML = `<style>*{box-sizing:border-box}:host{display:block;height:2em;background:#212121;--fill:#33f;color:#fff;text-shadow:1px 1px 1px #000;border-radius:.25em}#bar{display:flex;background:inherit;height:100%;position:relative;border-radius:inherit}#fill{background:var(--fill);height:100%;text-align:center;overflow:hidden;border-radius:inherit}#txtCntr{display:grid;position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;background:0 0}#txt{display:inline-block;padding:0;font-size:1em;justify-self:center;align-self:center;text-align:center}:host([notxt]) #txtCntr{display:none}</style><div id="bar"><div id="fill" style="width:0%"></div><div id="txtCntr"><span id="txt">0%</span></div></div>`;

			customElements.define(this.#tag, this);
		// 	console.log('WebCompoent Loaded: ' + this.#tag + ';');
		// })();
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
			per = `${per.toFixed(1)}%`
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