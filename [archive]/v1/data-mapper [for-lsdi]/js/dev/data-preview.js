export function is2DArray(val, rowSize = null) {
	if(!Array.isArray(val)) { return false; }
	for(const i of val) {
		if(!Array.isArray(i)) { return false; }
		if(rowSize !== null && i.length !== rowSize) {
			return false;
		}
	}
	return true;
};
function genNode(content, attr = {}) {
	const d = document.createElement('div');
	d.innerText = content;
	for(const [key, val] of Object.entries(attr)) {
		d.setAttribute(key, val);
	}
	return d.outerHTML;
}

class DataPreview extends HTMLElement {
	static _meta = {
		tag: 'data-preview',
		template: document.createElement('template')
	};
	#root;
	#table;
	#title;
	#rowSize = 0;
	#rowCount = 0;

	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(DataPreview._meta.template.content.cloneNode(true));
		this.#table = this.#root.querySelector('section');
		this.#title = this.#root.querySelector('header');
	}
	setData({ head = null, data = null, showColIdx = false , title = "Preview"} = {}) {
		if(!Array.isArray(head) || ! is2DArray(data, head.length)) {
			console.error('Invalid data');
			return;
		}
		this.#title.innerText = title;
		this.#rowSize = head.length;
		this.#rowCount = data.length;

		this.#table.innerHTML = [
			head.map((cell, ci) => genNode(showColIdx ? `{${ci}} ➝ ${cell}` : cell, {
				'class':'head'
			})),
			data.map((row, ri) => row.map((cell, ci) => genNode(cell, {
				'data-row': ri,
				'data-col': ci,
				'data-row-ty': ri % 2 ? 'odd' : 'even',
				'data-col-ty': ci % 2 ? 'odd' : 'even'
			})))
		].flat(2).join('');
		this.#table.style = `--row-size: ${this.#rowSize}; --row-count: ${this.#rowCount};`;
	}
	#updateCell(ri, ci, val) {
		const cell = this.#table.querySelector(`div[data-row="${ri}"][data-col="${ci}"]`);
		if(cell) {
			cell.innerText = val;
		}
	}
	updateCol(ci, values = null) {
		if(this.#rowSize <= ci || ci < 0) {
			return null;
		}
		if(values === null) {
			for(let ri = 0; ri < this.#rowCount; ri++) {
				this.#updateCell(ri, ci, '');
			}
		} else {
			for(const [ri, v] of Object.entries(values)) {
				this.#updateCell(ri, ci, v);
			}
		}
	}
	// connectedCallback() {}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
DataPreview._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../data-preview.html'))).then(html => html.text());
Object.freeze(DataPreview);
customElements.define(DataPreview._meta.tag, DataPreview);