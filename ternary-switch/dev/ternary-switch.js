if (typeof customElements.get('ternary-switch') === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../ternary-switch.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text()).catch(e => 'Unable to load: ' + __template_file__);

	class TernarySwitch extends HTMLElement {
		#root;
		#internals;

		set value(value) {
			value = Number(value);
			if(value === 0 || Number.isNaN(value)) {
				this.setAttribute('value', 0);
				return;
			}
			if(value > 0) { 
				this.setAttribute('value', 1);
				return;
			}
			this.setAttribute('value', -1);
		}
		get value() {
			let value = Number(this.getAttribute('value'));
			if(value === 0 || Number.isNaN(value)) { return 0; }
			if(value > 0) { return 1; }
			return -1;
		}
		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#internals = this.attachInternals();
			for(const p of Object.keys(ElementInternals.prototype).filter(v => v.startsWith('aria'))) {
				Object.defineProperty(this, p, { value: this.#internals[p] });
			}
		}
		connectedCallback() { this.#formUpdate(); }
		// disconnectedCallback() { }
		adoptedCallback() { this.#formUpdate(); }

		static get observedAttributes() { return ['value']; }
		attributeChangedCallback(attrName, oldVal, newVal) {
			if(oldVal === newVal) { return; }
			// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
			switch(attrName) {
				case 'value': {
					this.#internals.setFormValue(this.value);
				} break;
			}
		}

		// FORM RELATED
		#formUpdate() {
			this.#internals.setFormValue(this.value);
			// this.#internals.setValidity({});
		}
		// static get focusable() { return true; }
		static get formAssociated() { return true; }
		// get shadowRoot() { return this.#internals.shadowRoot; }
		// get form() { return this.#internals.form; }
		// get states() { return this.#internals.states; }
		// get willValidate() { return this.#internals.willValidate; }
		// get validity() { return this.#internals.validity; }
		// get validationMessage() { return this.#internals.validationMessage; }
		// get labels() { return this.#internals.labels; }

		// setFormValue(...args) { return this.#internals.setFormValue(...args); }
		// setValidity(...args) { return this.#internals.setValidity(...args); }
		// checkValidity(...args) { return this.#internals.checkValidity(...args); }
		// reportValidity(...args) { return this.#internals.reportValidity(...args); }

		// get name() { return this.getAttribute('name'); }
		// get type() { return this.localName; }
	}

	customElements.define('ternary-switch', TernarySwitch);
}