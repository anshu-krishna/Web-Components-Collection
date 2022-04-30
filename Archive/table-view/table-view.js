function is2DArray(list, rowSize) {
	if(!Array.isArray(list)) return false;
	for(const row of list) {
		if(!Array.isArray(row) || (row.length !== rowSize)) {
			return false;
		}
	}
	return true;
}
function makeElement({
	content = '',
	type = 'div',
	attr = {},
	textMode = true
} = {}) {
	const node = document.createElement(type);
	for(const k of Object.keys(attr)) {
		node.setAttribute(k, attr[k]);
	}
	if(textMode) {
		node.innerText = content;
	} else {
		node.innerHTML = content;
	}
	return node.outerHTML;
}
class TableView extends HTMLElement {
	static _meta = {
		tag: 'table-view',
		template: document.createElement('template')
	};
	#root; #main;
	#head = null;
	#data = null;
	#rowSize = 0;
	#rowCount = 0;
	#vertical = true;
	#textMode = true;
	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(TableView._meta.template.content.cloneNode(true));
		this.#main = this.#root.querySelector('main');
	}
	get content() {
		return {
			head: this.#head,
			data: this.#data
		};
	}
	set content({head = null, data = null} = {}) {
		if(Array.isArray(head)) {
			const rowSize = head.length;
			if(is2DArray(data, rowSize)) {
				this.#head = head;
				this.#data = data;
				this.#rowSize = rowSize;
				this.#rowCount = data.length;
				this.#render();
				return;
			}
		}
		this.#head = null;
		this.#data = null;
		this.#rowSize = 0;
		this.#rowCount = 0;
		this.#render();
	}
	get textMode() {
		return this.#textMode;
	}
	set textMode(val) {
		this.#textMode = Boolean(val);
	}
	get vertical() {
		return this.#vertical;
	}
	set vertical(val) {
		this.#vertical = Boolean(val);
		this.#main.setAttribute(
			'style',
			this.#vertical
			? `grid-template-columns: repeat(${this.#rowSize}, min-content);grid-template-rows: repeat(${this.#rowCount}, min-content);grid-auto-flow: row;`
			: `grid-template-rows: repeat(${this.#rowSize}, min-content); grid-template-columns: repeat(${this.#rowCount}, min-content);grid-auto-flow: column;`
		);
	}
	setCell(row, col, val) {
		const node = this.#main.querySelector(`div.r_${row}.c_${col}`);
		if(node !== null) {
			if(this.#textMode) {
				node.innerText = this.#data[row][col] = val;
			} else {
				node.innerHTML = this.#data[row][col] = val;
			}
		}
	}
	getCell(row, col) {
		const node = this.#main.querySelector(`div.r_${row}.c_${col}`);
		if(node !== null) {
			return this.#data[row][col];
		}
		return null;
	}
	getRow(row) {
		const node = this.#main.querySelector(`div.r_${row}`);
		if(node !== null) {
			return this.#data[row];
		}
	}
	setRow(row, values) {
		const node = this.#main.querySelector(`div.r_${row}`);
		if(node !== null && Array.isArray(values) && this.#rowSize <= values.length) {
			for(let col = 0 ; col < this.#rowSize; col++) {
				this.setCell(row, col, values[col]);
			}
		}
	}
	getCol(col) {
		const node = this.#main.querySelector(`div.c_${col}`);
		if(node !== null) {
			return this.#data.map(row => row[col]);
		}
		return null;
	}
	setCol(col, values) {
		const node = this.#main.querySelector(`div.c_${col}`);
		if(node !== null && Array.isArray(values) && this.#rowCount <= values.length) {
			for(let row = 0 ; row < this.#rowCount; row++) {
				this.setCell(row, col, values[row]);
			}
		}
	}
	#render() {
		if(this.#rowSize === 0 || this.#rowCount === 0) {
			this.#main.innerText = 'Table empty';
			return;
		}
		this.#main.innerHTML = [
			this.#head.map(cell => makeElement({
				content: cell,
				textMode: this.#textMode,
				attr: {'class': 'head'}
			})),
			this.#data.map((row, ri) => row.map((cell, ci) => makeElement({
				content: cell,
				textMode: this.#textMode,
				attr: {
					'class': `r_${(ri % 2) ? 'even' : 'odd'} c_${(ci % 2) ? 'even' : 'odd'} r_${ri} c_${ci}`
				}
			})))
		].flat(2).join('');
		this.vertical = this.#vertical;
	}
	connectedCallback() {
		this.#render();
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
TableView._meta.template.innerHTML =
`<style>
* {
	box-sizing: border-box;
}
#cntr {
	display: grid;
	justify-content: center;
}
main {
	display: grid;
	gap: 0.25em;
	box-shadow: 0 0 2px black;
	padding: 0.25em;
}
main > div {
	box-shadow: 0 0 2px #000;
	padding: 0.5em 0.75em;
	text-align: center;
	display: grid;
	justify-content: center;
	align-items: center;
}
main > div.head {
	font-weight: bold;
	color: white;
	background: #01579b;
}
main > div.r_odd.c_odd, main > div.r_even.c_even {
	background: #f5f5f5;
}
</style><slot style="display:none;"></slot><div id="cntr"><main></main></div>`;
Object.freeze(TableView);
customElements.define(TableView._meta.tag, TableView);