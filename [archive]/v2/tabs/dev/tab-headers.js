class TabHeaders extends HTMLElement {
	static #template;
	static #tag = 'tab-headers';
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

	static #headerClickHandler() {
		if (this.hasAttribute('data-selected')) { return; }
		this.parentElement.setAttribute('selected', this.dataset.index);
	}
	#root;
	#slot;

	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(TabHeaders.#template.content.cloneNode(true));
		this.#slot = this.#root.querySelector('slot');
	}
	get #slottedHeaders() {
		return this.#slot.assignedNodes().filter(n => n.nodeName.toLowerCase() === 'header');
	}
	connectedCallback() {
		this.#slot.addEventListener('slotchange', _ => {
			for(let [i, h] of Object.entries(this.#slottedHeaders)) {
				h.dataset.index = i;
				h.onclick = TabHeaders.#headerClickHandler;
			}
			this.#changeSelected();
		});
	}
	#changeSelected() {
		const headers = this.#slottedHeaders;
		if(headers.length === 0) { return; }
		const selected = this.selected % headers.length;
		for (let [i, h] of Object.entries(headers)) {
			if(i == selected) { // Don't change == to ===;
				h.setAttribute('data-selected', '');
			} else {
				h.removeAttribute('data-selected');
			}
		}
		this.dispatchEvent(new CustomEvent('change', {
			detail: selected
		}));
	}
	get selected() {
		const v = parseInt(this.getAttribute("selected"));
		if(isNaN(v) || v < 0) { return 0; }
		return v;
	}
	set selected(index) {
		index = parseInt(index);
		if(isNaN(index) || index < 0) { index = 0; }
		this.setAttribute("selected", index);
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	static get observedAttributes() {
		return ["selected"];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		// console.log("Changed", attrName, ":", oldval, "->", newval);
		switch (attrName) {
			case 'selected':
				if(parseInt(oldVal) !== parseInt(newVal)) {
					this.#changeSelected();
				}
				break;
		}
	}
}