import "./format-editor.js";
class FormatTable extends HTMLElement {
	static _meta = {
		tag: 'format-table',
		template: document.createElement('template')
	};
	#root; #table;
	#cols = [];
	get columns() { return this.#cols; }
	set columns(list) {
		this.#table.innerHTML = list.map((c, idx) => `<div>${c}</div><format-editor ${idx % 2 ? 'class="alt"' : ''} data-col="${idx}"></format-editor>`).join('');
		this.#table.addEventListener('change', ({detail}) => {
			const e = new CustomEvent('change', {
				bubbles: true,
				detail: detail
			});
			this.dispatchEvent(e);
		});
	}
	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(FormatTable._meta.template.content.cloneNode(true));
		this.#table = this.#root.querySelector('main');
	}
	popupError(msg, colIdx) {
		this.#table.querySelector(`format-editor:nth-of-type(${colIdx + 1})`)?.popupError(msg);
	}
	// connectedCallback() {}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
FormatTable._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../format-table.html'))).then(html => html.text());
Object.freeze(FormatTable);
customElements.define(FormatTable._meta.tag, FormatTable);