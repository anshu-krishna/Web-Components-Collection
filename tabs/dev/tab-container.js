class TabContainer extends HTMLElement {
	static #template;
	static #tag = 'tab-container';
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

	#root;
	#slot;

	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(TabContainer.#template.content.cloneNode(true));
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
			if (s.tabHeaders !== null) {
				s.tabHeaders.onchange = ({ detail }) => {
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
	// attributeChangedCallback(attrName, oldVal, newVal) {
	// 	if(oldVal === newVal) { return; }
	// 	console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
	// }
}