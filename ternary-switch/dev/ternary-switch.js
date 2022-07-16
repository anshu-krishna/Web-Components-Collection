class TernarySwitch extends HTMLElement {
	static #template;
	static #tag = 'ternary-switch';
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
		#internals;
		#btns;

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
			this.#root.appendChild(TernarySwitch.#template.content.cloneNode(true));
			this.#btns = this.#root.querySelectorAll('div.button');
			this.#internals = this.attachInternals();
			for(const p of Object.keys(ElementInternals.prototype).filter(v => v.startsWith('aria'))) {
				Object.defineProperty(this, p, { value: this.#internals[p] });
			}
			for(const btn of this.#btns) {
				btn.onclick = () => {
					if(!btn.classList.contains('active')) {
						this.value = btn.dataset.value;
					}
				};
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
					const value = this.value;
					for(const b of this.#btns) { b.classList.remove('active'); }
					(this.#btns[value + 1]).classList.add('active');
					this.#internals.setFormValue(value);
					this.dispatchEvent(new Event('change', {
						bubbles: true
					}));
				} break;
			}
		}

		// FORM RELATED
		#formUpdate() {
			this.#internals.setFormValue(this.value);
			this.#internals.setValidity({});
		}
		static get focusable() { return true; }
		static get formAssociated() { return true; }
		get shadowRoot() { return this.#internals.shadowRoot; }
		get form() { return this.#internals.form; }
		get states() { return this.#internals.states; }
		get willValidate() { return this.#internals.willValidate; }
		get validity() { return this.#internals.validity; }
		get validationMessage() { return this.#internals.validationMessage; }
		get labels() { return this.#internals.labels; }

		setFormValue(...args) { return this.#internals.setFormValue(...args); }
		setValidity(...args) { return this.#internals.setValidity(...args); }
		checkValidity(...args) { return this.#internals.checkValidity(...args); }
		reportValidity(...args) { return this.#internals.reportValidity(...args); }

		get name() { return this.getAttribute('name'); }
		get type() { return this.localName; }
}