class TabSections extends HTMLElement {
	static _meta = {
		tag: 'tab-sections',
		template: document.createElement('template')
	};
	#root;
	#slot;

	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(TabSections._meta.template.content.cloneNode(true));
		this.#slot = this.#root.querySelector('slot');
	}
	get #slottedSections() {
		return this.#slot.assignedNodes().filter(n => n.nodeName.toLowerCase() === 'section');
	}
	connectedCallback() {
		this.#slot.addEventListener('slotchange', _ => {
			for(let [i, s] of Object.entries(this.#slottedSections)) {
				s.dataset.index = i;
			}
		});
		this.#changeSelected();
	}
	#changeSelected() {
		const sections = this.#slottedSections;
		if(sections.length === 0) { return; }
		const selected = this.selected % sections.length;
		for (let [i, h] of Object.entries(sections)) {
			if(i == selected) { // Don't change == to ===;
				h.setAttribute('data-selected', '');
			} else {
				h.removeAttribute('data-selected');
			}
		}
	}
	get selected() {
		const index = parseInt(this.getAttribute("selected"));
		if(isNaN(index) || index < 0) { return 0; }
		return index;
	}
	set selected(index) {
		index = parseInt(index);
		if(index === NaN || index < 0) { index = 0; }
		this.setAttribute("selected", index);
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	static get observedAttributes() {
		return ["selected"];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		// console.log("Changed", attrName, ":", oldVal, "->", newVal);
		switch (attrName) {
			case 'selected':
				if (parseInt(oldVal) !== parseInt(newVal)) {
					this.#changeSelected();
				}
				break;
		}
	}
}
TabSections._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../tab-sections.html'))).then(html => html.text());
Object.freeze(TabSections);
customElements.define(TabSections._meta.tag, TabSections);