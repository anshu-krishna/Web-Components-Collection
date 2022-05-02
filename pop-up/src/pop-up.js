class PopUp extends HTMLElement {
	static _meta = {
		tag: 'pop-up',
		template: document.createElement('template')
	};
	#nodes = {};
	
	#titleHandler() {
		if(this.#nodes.title.assignedNodes().length) {
			this.#nodes.cntr.classList.remove('notitle');
		} else {
			this.#nodes.cntr.classList.add('notitle');
		}
	}

	constructor() {
		super();
		this.#nodes.root = this.attachShadow({mode: 'closed'});
		this.#nodes.root.appendChild(PopUp._meta.template.content.cloneNode(true));
		this.#nodes.cntr = this.#nodes.root.querySelector('#cntr');
		this.#nodes.title = this.#nodes.root.querySelector('slot[name="title"]');
	}
	connectedCallback() {
		this.#nodes.title.addEventListener('slotchange', this.#titleHandler.bind(this));
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
PopUp._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../pop-up.html'))).then(html => html.text());
Object.freeze(PopUp);
customElements.define(PopUp._meta.tag, PopUp);