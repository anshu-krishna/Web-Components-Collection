class LabeledTernary extends HTMLElement {
	static get template() {
		if (LabeledTernary._template === undefined) {
			LabeledTernary._template = document.createElement("template");
			LabeledTernary._template.innerHTML = `<style>
:host {
	--gap: 0.5em;
	display: inline-block;
}
#container {
	display: grid;
	grid-template-columns: 1em 1fr;
	grid-gap: var(--gap);
	align-items: center;
	cursor: pointer;
}
#icon {
	text-align: center;
	line-height: 1em;
	font-size: 1.5em;
}
:host([nobox]) #container {
	grid-template-columns: 1fr;
}
:host([nobox]) #icon {
	display: none;
}
</style>
<span id="container">
	<span id="icon">&#9744;</span>
	<span id="content"><slot></slot></span>
</span>`;
		}
		return LabeledTernary._template;
	}
	static parseTernary(val) {
		if(val === null) return 0;
		val = parseInt(val);
		if (val === NaN || val === 0) return 0;
		return (val < 0) ? -1 : 1;
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(LabeledTernary.template.content.cloneNode(true));
		this.__nodes = {
			icon: this.shadowRoot.querySelector('#icon'),
			content: this.shadowRoot.querySelector('#content')
		};
		this.addEventListener('click', function () {
			let s = this.state;
			if (s === 1) {
				this.state = -1;
			} else {
				this.state = s + 1;
			}
		});
	}
	get value() {
		let val = this.getAttribute("value");
		if (val === null) {
			let nodes = this.__nodes.content.firstChild.assignedNodes();
			return nodes.map(n => n.textContent).join('').trim();
		}
		return val;
	}
	set value(val) {
		if (val === null) {
			this.removeAttribute("value");
			return;
		}
		this.setAttribute("value", val);
	}
	get state() {
		return LabeledTernary.parseTernary(this.getAttribute("state"));
	}
	set state(val) {
		this.setAttribute("state", LabeledTernary.parseTernary(val));
	}
	// connectedCallback() {}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	static get observedAttributes() {
		return ['state'];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch (name) {
			case 'state':
				newval = LabeledTernary.parseTernary(newval);
				oldval = LabeledTernary.parseTernary(oldval);
				if (oldval !== newval) {
					this.__changeIcon(newval);
					this.dispatchEvent(new Event('change'));
				}
				break;
		}
	}
	__changeIcon(val) {
		switch (val) {
			case -1:
				this.__nodes.icon.innerHTML = '&#9746;';
				break;
			case 0:
				this.__nodes.icon.innerHTML = '&#9744;';
				break
			case 1:
				this.__nodes.icon.innerHTML = '&#9745;';
				break;
		}
	}
}
customElements.define("labeled-ternary", LabeledTernary);