class PopUp extends HTMLElement {
	static _meta = {
		tag: 'pop-up',
		template: document.createElement('template')
	};

	#root;
	#cntr;
	#title;
	
	#titleHandler() {
		if(this.#title.assignedNodes().length) {
			this.#cntr.classList.remove('notitle');
			console.log('has title');
		} else {
			this.#cntr.classList.add('notitle');
			console.log('no title');
		}
	}

	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(PopUp._meta.template.content.cloneNode(true));
		this.#cntr = this.#root.querySelector('#cntr');
		this.#title = this.#root.querySelector('slot[name="title"]');
	}
	connectedCallback() {
		this.#title.addEventListener('slotchange', this.#titleHandler.bind(this));
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