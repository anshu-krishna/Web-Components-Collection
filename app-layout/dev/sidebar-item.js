if (typeof customElements.get('sidebar-item') === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../sidebar-item.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text()).catch(e => 'Unable to load: ' + __template_file__);

	class SideBarItem extends HTMLElement {
		#root;
		#contentSlot;
		get #firstContent() {
			return this.#contentSlot.assignedElements().map(n => {
				if(n instanceof HTMLAnchorElement) { return n; }
				return n.querySelector('a');
			}).filter(n => n !== null).at(0);
		}
		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#contentSlot = this.#root.querySelector('#content-slot');
			this.#root.querySelector('#icon').addEventListener('click', _ => {
				this.#firstContent?.click();
			});
		}
		// connectedCallback() {}
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

	customElements.define('sidebar-item', SideBarItem);
}