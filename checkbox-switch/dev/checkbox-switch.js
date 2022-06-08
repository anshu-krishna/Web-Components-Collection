if (typeof customElements.get('checkbox-switch') === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../checkbox-switch.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text()).catch(e => 'Unable to load: ' + __template_file__);

	class CheckboxSwitch extends HTMLElement {
		static get formAssociated() {
			return true;
		}
		#root;
		#ip;
		#internals;
		#labels = [];
		#labelClickHandler;

		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#ip = this.#root.querySelector('input');
			this.#internals = this.attachInternals();

			this.#root.querySelector('#cntr').addEventListener('click', () => {
				this.on = !this.hasAttribute('on');
			});

			this.#labelClickHandler = (function() {
				if(!this.hasAttribute('disabled')) { this.on = !this.hasAttribute('on'); }
			}).bind(this);
		}
		get on() { return this.hasAttribute('on'); }
		set on(value) {
			value = !!value;
			if (value) {
				this.setAttribute('on', '');
			} else {
				this.removeAttribute('on');
			}
		}
		get required() { return this.hasAttribute('required'); }
		set required(value) {
			if (!!value) {
				this.setAttribute('required', '');
			} else {
				this.removeAttribute('required');
			}
		}
		#DOMSetup() {
			this.#formActions();
			this.#labels = [...this.#internals.labels];
			for(const l of this.#labels) {
				l.addEventListener('click', this.#labelClickHandler);
			}
		}
		connectedCallback() { this.#DOMSetup(); }
		#formActions() {
			const on = this.hasAttribute('on');
			this.#internals.setFormValue(String(on));
			if (this.hasAttribute('required') && !on) {
				this.#internals.setValidity({ valueMissing: true }, 'Required: This must be ON', this.#ip);
			} else {
				this.#internals.setValidity({});
			}
		}
		disconnectedCallback() {
			for(const l of this.#labels) {
				try { l?.removeEventListener('click', this.#labelClickHandler); } catch (error) {}
			}
			this.#labels = [];
		}
		adoptedCallback() { this.#DOMSetup(); }

		static get observedAttributes() {
			return ['on', 'required'];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			if (oldVal === newVal) { return; }
			// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
			switch (attrName) {
				case 'on': {
					const value = newVal !== null;
					// if(value) { this.#ip.setAttribute('checked', 'checked'); } else { this.#ip.removeAttribute('checked'); }
					this.#formActions();
					this.dispatchEvent(new Event('change'));
				} break;
				case 'required': {
					if (newVal === null) {
						// this.#ip.removeAttribute('required');
						this.#internals.ariaRequired = false;
					} else {
						// this.#ip.setAttribute('required', '');
						this.#internals.ariaRequired = true;
					}
				} break;
			}
		}
	}

	customElements.define('checkbox-switch', CheckboxSwitch);
}