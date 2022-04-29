class TabContainer extends HTMLElement {
	static _meta = {
		tag: 'tab-container',
		template: document.createElement('template')
	};
	#root;
	#slot;

	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(TabContainer._meta.template.content.cloneNode(true));
		this.#slot = this.#root.querySelector('slot');
	}
	get #slotted() {
		const nodes = this.#slot.assignedNodes();
		return {
			tabHeaders: nodes.filter(n => n.nodeName.toLowerCase() === 'tab-headers').at(0) ?? null,
			tabSections: nodes.filter(n => n.nodeName.toLowerCase() === 'tab-sections').at(0) ?? null
		};
	}
	connectedCallback() {
		this.#slot.addEventListener('slotchange', _ => {
			const s = this.#slotted;
			if(s.tabHeaders !== null) {
				s.tabHeaders.onchange = ({detail}) => {
					s.tabSections?.setAttribute('selected', detail);
					this.dispatchEvent(new CustomEvent('change', { detail: detail }));
				};
			}
			s.tabSections?.setAttribute('selected', s.tabHeaders?.selected ?? 0);
		});
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
TabContainer._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../tab-container.html'))).then(html => html.text());
Object.freeze(TabContainer);
customElements.define(TabContainer._meta.tag, TabContainer);