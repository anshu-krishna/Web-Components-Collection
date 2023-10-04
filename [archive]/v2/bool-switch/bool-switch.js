class BoolSwitch extends HTMLElement {
	static #template;
	static #tag = 'bool-switch';
	static {
		// (async () => {
			this.#template = document.createElement('template');

			this.#template.innerHTML = `<style>*{box-sizing:border-box}:host{--slider-gap:0.05em;--roundness:1em;--transition-duration:0.08s;display:inline-block;height:1.25em;width:2.5em;cursor:pointer;background:#ccc;transition:background ease-in-out 80ms;border-radius:var(--roundness);box-shadow:0 0 .1em #000}:host([disabled]){filter:saturate(0) brightness(.4);pointer-events:none}:host(:focus){outline:5px auto -webkit-focus-ring-color;outline:5px auto Highlight}#cntr{height:100%;position:relative;z-index:2;pointer-events:none}#slider{height:calc(100% - (2 * var(--slider-gap)));width:calc(50% - (2 * var(--slider-gap)));background:#fff;position:absolute;top:var(--slider-gap);left:var(--slider-gap);box-shadow:0 0 .1em #000;border-radius:calc(var(--roundness) - var(--slider-gap));transition:left ease-in-out var(--transition-duration)}:host([on]){background:#2196f3}:host([on]) #slider{left:calc(50% + var(--slider-gap))}#cntr input{position:absolute;bottom:0;left:25%;padding:0;margin:0;border:none;width:1px;height:1px;opacity:0}</style><div id="cntr"><div part="slider" id="slider"></div><input type="checkbox" /></div>`

			customElements.define(this.#tag, this);
			// console.log('WebCompoent Loaded: ' + this.#tag + ';');
		// })();
	}

	#root;
	#internals;
	#ip;
	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(BoolSwitch.#template.content.cloneNode(true));
		this.#ip = this.#root.querySelector('input');
		this.#internals = this.attachInternals();
		this.#internals.role = 'checkbox';

		this.addEventListener('click', (e) => {
			e.preventDefault();
			if(!this.hasAttribute('disabled')) {
				this.on = !this.hasAttribute('on');
			}
		});
		for(const p of Object.keys(ElementInternals.prototype).filter(v => v.startsWith('aria'))) {
			Object.defineProperty(this, p, { value: this.#internals[p] });
		}
	}
	connectedCallback() { this.#formUpdate(); }
	// disconnectedCallback() {}
	adoptedCallback() { this.#formUpdate(); }

	static get observedAttributes() { return ['on', 'required', 'disabled']; }
	attributeChangedCallback(attrName, oldVal, newVal) {
		if(oldVal === newVal) { return; }
		// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
		switch (attrName) {
			case 'on': {
				this.#formUpdate();
				this.dispatchEvent(new Event('change'));
			} break;
			case 'required': {
				this.#internals.ariaRequired = newVal !== null;
			} break;
			case 'disabled': {
				this.#internals.ariaDisabled = newVal !== null;
			} break;
		}
	}

	get on() { return this.hasAttribute('on'); }
	set on(value) {
		if (!!value) {
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
	get disabled() { return this.hasAttribute('disabled'); }
	set disabled(value) {
		if (!!value) {
			this.setAttribute('disabled', '');
		} else {
			this.removeAttribute('disabled');
		}
	}
	
	// FORM RELATED
	#formUpdate() {
		const on = this.hasAttribute('on');
		this.#internals.setFormValue(on);
		this.#internals.ariaChecked = on;
		if (this.hasAttribute('required') && !on) {
			this.#internals.setValidity({ valueMissing: true }, 'Required: This must be ON', this.#ip);
			// this.#internals.setValidity({ valueMissing: true }, 'Required: This must be ON');
		} else {
			this.#internals.setValidity({});
		}
	}
	// static get focusable() { return true; }
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