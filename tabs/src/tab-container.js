const __tab_conntainer__ = 'tab-container';
if (typeof customElements.get(__tab_conntainer__) === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../' + __tab_conntainer__ + '.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text().catch(e => 'Unable to load: ' + __template_file__));

	class TabContainer extends HTMLElement {
		#root;
		#slot;

		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
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
		// attributeChangedCallback(attrName, oldVal, newVal) {}
	}

	customElements.define(__tab_conntainer__, TabContainer);
}