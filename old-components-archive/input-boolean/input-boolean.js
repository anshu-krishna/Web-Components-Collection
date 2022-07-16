class InputBoolean extends HTMLElement {
	static get template() {
		if(typeof InputBoolean.__template === 'undefined') {
			InputBoolean.__template = document.createElement('template');
			InputBoolean.__template.innerHTML = `<style>
:host {
	--svg-color: currentColor;
	--button-radius: 1em;
	--button-border: 1px solid;
	--button-gap: 0.25em;
	--button-color: currentColor;
	--button-background: rgba(0, 0, 0, 0.1);
	cursor: pointer;
}
svg,
::slotted(svg) {
	fill: var(--svg-color);
	height: 1em;
	width: auto;
}
#cntr {
	display: inline-flex;
	grid-gap: var(--button-gap);
	justify-content: center;
}
#btn_cntr {
	display: inline-block;
	border: var(--button-border);
	height: 1em;
	width: 2em;
	min-width: 2em;
	border-radius: var(--button-radius);
	background: var(--button-background);
	position: relative;
}
#btn {
	display: inline-block;
	height: 1em;
	width: 1em;
	min-width: 1em;
	background: var(--button-color);
	border-radius: var(--button-radius);
	position: absolute;
	left: 0em;
	transition: left 50ms ease-in-out;
}
.yes {
	left: 50% !important;
}
</style>
<div id="cntr"><slot name="false-opt"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.2l-8.3-8.2 8.2-8.3-3.7-3.7-8.2 8.3-8.3-8.2-3.7 3.7 8.3 8.2-8.2 8.3 3.7 3.7 8.2-8.3 8.3 8.2z"/></svg></slot>
<span id="btn_cntr"><span id="btn"></span></span>
<slot name="true-opt"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 12.1l2.1-1.9c2.4 1.2 3.9 2 6.6 4 5.1-5.8 8.4-8.7 14.7-12.6l0.7 1.5c-5.1 4.5-8.9 9.5-14.3 19.2-3.3-3.9-5.6-6.4-9.7-10.3z"/></svg></slot>
</div>`;
		}
		return InputBoolean.__template;
	}

	constructor() {
		super();
		let shadowRoot = this.attachShadow({mode: 'closed'});
		shadowRoot.appendChild(InputBoolean.template.content.cloneNode(true));
		this.__button = shadowRoot.querySelector('#btn');
		this.addEventListener('click', () => {
			this.value = !this.value;
		});
		this.__autochanging = false;
	}
	get value() {
		return this.__button.classList.contains('yes');
	}
	set value(val) {
		if(val) {
			this.setAttribute('true', '');
		} else {
			this.removeAttribute('true');
		}
	}
	static get observedAttributes() {
		return ['true']
	}
	attributeChangedCallback(name, oldval, newval) {
		let val = (newval !== null);
		if(val) {
			this.__button.classList.add('yes');
		} else {
			this.__button.classList.remove('yes');
		}
		this.dispatchEvent(new CustomEvent('change', {detail: val}));
	}
}
InputBoolean.tagName = 'input-boolean';
customElements.define(InputBoolean.tagName, InputBoolean);