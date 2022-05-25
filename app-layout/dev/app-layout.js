if (typeof customElements.get('app-layout') === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../app-layout.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text()).catch(e => 'Unable to load: ' + __template_file__);

	class AppLayout extends HTMLElement {
		#root;
		#sidebarSlot;
		#menuBtn;
		get #sidebar_items() {
			return this.#sidebarSlot.assignedNodes().filter(n => n.nodeName === 'SIDEBAR-ITEM');
		}
		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#sidebarSlot = this.#root.querySelector(`slot[name="sidebar"]`);
			this.#menuBtn = this.#root.querySelector('#icon');
			this.#menuBtn.addEventListener('click', _ => {
				if(this.hasAttribute('mini-sidebar')) {
					this.removeAttribute('mini-sidebar')
				} else {
					this.setAttribute('mini-sidebar', '')
				}
			});
		}
		// connectedCallback() {}
		// disconnectedCallback() {}
		// adoptedCallback() {}

		static get observedAttributes() {
			return ['mini-sidebar', 'right'];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			if(oldVal === newVal) { return; }
			// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
			switch(attrName) {
				case 'mini-sidebar': {
					if(newVal === null) {
						for(const i of this.#sidebar_items) { i.removeAttribute('mini'); }
					} else {
						for(const i of this.#sidebar_items) { i.setAttribute('mini', ''); }
					}
				} break;
				case 'right': {
					if(newVal === null) {
						for(const i of this.#sidebar_items) { i.removeAttribute('right'); }
					} else {
						for(const i of this.#sidebar_items) { i.setAttribute('right', ''); }
					}
				} break;
			}
		}
	}

	customElements.define('app-layout', AppLayout);
	
	// Append body css
	const __body_css__ = document.createElement('style');
	const __body_css_file__ = String(new URL(import.meta.url + '/../body.css'));
	__body_css__.innerHTML = await fetch(__body_css_file__).then(css => css.text()).catch(e => 'Unable to load: ' + __body_css_file__);
	document.head.appendChild(__body_css__);
}