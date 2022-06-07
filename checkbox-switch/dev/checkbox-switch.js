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

		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#ip = this.#root.querySelector('input');
			this.#internals = this.attachInternals();
			this.#root.querySelector('#cntr').addEventListener('click', () => {
				this.on = !this.hasAttribute('on');
			});
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
		connectedCallback() {
			this.#formActions();
		}
		#formActions() {
			console.clear();
			console.group('FA');
			const on = this.hasAttribute('on');
			this.#internals.setFormValue(String(on));
			if(this.hasAttribute('required') && !on) {
				console.log(this, 'Invalid');
				this.#internals.setValidity({ valueMissing: true}, 'This is required', this.#ip);
			} else {
				console.log(this, 'Valid');
				this.#internals.setValidity({});
			}
			console.log('Data:', this.#internals.form?.dataList);
			console.groupCollapsed('Trace');
			console.trace();
			console.groupEnd();
			console.groupEnd();
		}
		// disconnectedCallback() {}
		adoptedCallback() {
			this.#formActions();
		}

		static get observedAttributes() {
			return ['on', 'required'];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			if (oldVal === newVal) { return; }
			// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
			switch(attrName) {
				case 'on': {
					const value = newVal !== null;
					console.log('Setting [ON] = ', value);
					if(value) { this.#ip.setAttribute('checked', 'checked'); } else { this.#ip.removeAttribute('checked'); }
					this.#formActions();
					this.dispatchEvent(new Event('change'));
				} break;
				case 'required': {
					if(newVal === null) {
						this.#ip.removeAttribute('required');
						this.#internals.ariaRequired = false;
					} else {
						this.#ip.setAttribute('required', '');
						this.#internals.ariaRequired = true;
					}
				} break;
			}
		}
	}

	customElements.define('checkbox-switch', CheckboxSwitch);
}