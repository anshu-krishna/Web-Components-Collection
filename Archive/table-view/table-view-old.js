class TableView extends HTMLElement {
	static _meta = {
		tag: 'table-view-old',
		template: document.createElement('template')
	};
	static #is2DArray(list) {
		if(!Array.isArray(list)) return false;
		if(!Array.isArray(list[0] ?? null)) return false;
		const len = list[0].length;
		for(const row of list) {
			if(!Array.isArray(row) || (row.length !== len)) return false;
		}
		return true;
	}
	static #toBool(str) {
		switch(String(str).toLowerCase().trim()){
			case "true": 
			case "yes": 
			case "1":
				return true;
			case "false": 
			case "no": 
			case "0": 
			case null:
				return false;
			default:
				return Boolean(str);
		}
	}
	#root; #main;
	#data; #rowSize = 0;
	#header = true;
	#vertical = true;
	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(TableView._meta.template.content.cloneNode(true));
		this.#main = this.#root.querySelector('main');
		this.#render();
		const slot = this.#root.querySelector('slot');
		slot.onslotchange = _ => {
			try {
				let data = slot.assignedNodes().map(n => {
					switch(n.nodeType) {
						case 1: return n.innerText;
						case 3: return n.nodeValue;
						default: return '';
					}
				}).join('').trim();
				if(data !== '') {
					this.data = JSON.parse(data);
				}
			} catch (error) {
				console.error(this, `expects 2D array; Received: `, this.innerText.trim());
			}
		};
	}
	set data(value) {
		if(!TableView.#is2DArray(value)) {
			console.error(this, `expects 2D array; Received: `, value);
			this.#data = null;
			this.#rowSize = 0;
		} else {
			this.#data = value;
			this.#rowSize = value[0].length;
		}
		this.#render();
	}
	get data() {
		return this.#data;
	}
	static #makeCell(val, ...classlist) {
		const c = document.createElement('div');
		c.innerText = val;
		for(const cl of classlist) {
			c.classList.add(cl);
		}
		return c.outerHTML;
	}
	static #makeRow(row, ...classlist) {
		return row.map((cell, i) => TableView.#makeCell(cell, `c_${i}`, `c_${i % 2 === 0 ? 'even' : 'odd'}`, ...classlist)).join('');
	}
	#render() {
		if(this.#rowSize === 0) {
			this.#main.innerText = 'Table empty';
			return;
		}
		const html = [];
		this.#data.forEach((row, i) => {
			html.push(TableView.#makeRow(row, `r_${i}`, `r_${i % 2 === 0 ? 'even' : 'odd'}`));
		});
		this.#main.innerHTML = html.join('');
		this.header = this.#header;
		this.vertical = this.#vertical;
	}
	set vertical(val) {
		this.#vertical = TableView.#toBool(val);
		const verticalStr = String(this.#vertical);
		if(this.getAttribute('vertical') !== verticalStr) {
			this.setAttribute('vertical', verticalStr);
			return;
		}

		const size = this.#main.children.length / this.#rowSize;

		this.#main.setAttribute(
			'style',
			this.#vertical
			? `grid-template-columns: repeat(${this.#rowSize}, min-content);grid-template-rows: repeat(${size}, min-content);grid-auto-flow: row;`
			: `grid-template-rows: repeat(${this.#rowSize}, min-content); grid-template-columns: repeat(${size}, min-content);grid-auto-flow: column;`
		);
	}
	get vertical() {
		return this.#vertical;
	}
	set header(val) {
		this.#header = TableView.#toBool(val);
		const headerStr = String(this.#header);
		if(this.getAttribute('header') !== headerStr) {
			this.setAttribute('header', headerStr);
			return;
		}
		const cells = this.#main.children;
		let i = 0;
		for(let c of cells) {
			this.#header ? c.classList.add('head') :c.classList.remove('head');
			i++;
			if(i === this.#rowSize) break;
		}
	}
	get header() {
		return this.#header;
	}
	// connectedCallback() {}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	static get observedAttributes() {
		return ['vertical', 'header'];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		// console.log(`Attribute ${attrName}: From - `, oldVal, 'To - ',newVal);
		if(oldVal === newVal) return;
		switch(attrName) {
			case 'vertical':
				this.vertical = TableView.#toBool(newVal);
				break;
			case 'header':
				this.header = TableView.#toBool(newVal);
				break;
		}
	}
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
main > div.r_odd.c_odd, main > div.r_even.c_even {
	background: #f5f5f5;
}
main > div.head, main > div.r_odd.c_odd.head, main > div.r_even.c_even.head {
	font-weight: bold;
	color: white;
	background: #212121;
}
</style><slot style="display:none;"></slot><div id="cntr"><main></main></div>`;
Object.freeze(TableView);
customElements.define(TableView._meta.tag, TableView);