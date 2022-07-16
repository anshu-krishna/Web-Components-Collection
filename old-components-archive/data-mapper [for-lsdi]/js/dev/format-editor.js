import {PEG} from "./parser.js";
class FormatEditor extends HTMLElement {
	static _meta = {
		tag: 'format-editor',
		template: document.createElement('template')
	};
	#root;
	#nodes;
	#format = [];

	get format() { return this.#format; }
	get #stringifyFormat() {
		if(this.#format.length === 0) { return '""'; }
		return this.#format.map(part => {
			if(part.ty === 'txt') { return JSON.stringify(part.val) ; }
			return `{col ${JSON.stringify(part.col)}${
				part.maps.map(f => ` ➝ ${f.func}(${
					JSON.stringify(f.args).slice(1, -1)
				})`).join('')}}`;
		}).join('➕');
	}	

	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(FormatEditor._meta.template.content.cloneNode(true));
		this.#nodes = {
			ip: this.#root.querySelector('textarea'),
			op: this.#root.querySelector('pre')
		};
	}
	connectedCallback() {
		this.#nodes.ip.addEventListener('keyup', () => {
			try {
				this.#format = PEG.parse(this.#nodes.ip.value);
				this.#nodes.op.classList.remove('err');
				this.#nodes.op.innerText = `Format: ${this.#stringifyFormat}`;
			} catch (err) {
				this.#format = null;
				this.#nodes.op.classList.add('err');
				this.#nodes.op.innerText = `Error: ${err.message}`;
			}
		});
		this.#nodes.ip.addEventListener('focusin', () => {
			this.#nodes.op.classList.add('show');
		});
		this.#nodes.ip.addEventListener('focusout', () => {
			this.#nodes.op.classList.remove('show');
			this.#sendChange();
		});
	}
	popupError(msg) {
		this.#nodes.ip.setCustomValidity(msg);
		this.#nodes.ip.reportValidity();
	}
	#sendChange() {
		const e = new CustomEvent('change', {
			bubbles: true,
			detail: {
				forCol: parseInt(this.dataset.col ?? '0'),
				format: this.#format
			}
		});
		this.dispatchEvent(e);
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
FormatEditor._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../format-editor.html'))).then(html => html.text());
Object.freeze(FormatEditor);
customElements.define(FormatEditor._meta.tag, FormatEditor);