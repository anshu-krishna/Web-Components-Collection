class LabeledCheckbox extends HTMLElement {
	static get template() {
		if (typeof LabeledCheckbox._template == "undefined") {
			LabeledCheckbox._template = document.createElement("template");
			LabeledCheckbox._template.innerHTML =
				`<style>
:host {
	display: inline-block;
	cursor: pointer;
}
:host([disabled]) {
	color: #777;
	cursor: not-allowed;
}
[data-labeled-checkbox-contents] {

}
[data-labeled-checkbox-no] svg, [data-labeled-checkbox-yes] svg {
	width: 1em;
	height: 1em;
	fill: currentColor;
}
</style>
<span data-labeled-checkbox-box>
	<span data-labeled-checkbox-no><slot name="no"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 2v20h-20v-20h20zm2-2h-24v24h24v-24zm-6"/></svg></slot></span><span data-labeled-checkbox-yes><slot name="yes"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 2v20h-20v-20h20zm2-2h-24v24h24v-24zm-5.541 8.409l-1.422-1.409-7.021 7.183-3.08-2.937-1.395 1.435 4.5 4.319 8.418-8.591z"/></svg></slot></span>
</span>
<span data-labeled-checkbox-contents><slot></slot></span>`;
		}
		return LabeledCheckbox._template;
	}
	_changeIcon(val) {
		if (val) {
			this._yes.style.display = null;
			this._no.style.display = "none";
		} else {
			this._no.style.display = null;
			this._yes.style.display = "none";
		}
	}
	_onChange() {
		if (this.disabled) return;
		this.checked = !this.checked;
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(LabeledCheckbox.template.content.cloneNode(true));

		this._box = this.shadowRoot.querySelector("[data-labeled-checkbox-box]");
		this._yes = this.shadowRoot.querySelector("[data-labeled-checkbox-yes]");
		this._no = this.shadowRoot.querySelector("[data-labeled-checkbox-no");

		this._changeIcon(false);
	}
	connectedCallback() {
		this.addEventListener("click", this._onChange);
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	get value() {
		let val = this.getAttribute("value");
		return (val === null) ? "" : val;
	}
	set value(val) {
		if (val === null) {
			this.removeAttribute("value");
			return;
		}
		this.setAttribute("value", val);
	}
	get checked() {
		return this.hasAttribute("checked");
	}
	set checked(val) {
		if (val) {
			this.setAttribute("checked", '');
		} else {
			this.removeAttribute("checked");
		}
	}
	get disabled() {
		return this.hasAttribute("disabled");
	}
	set disabled(val) {
		if (val) {
			this.setAttribute("disabled", "");
		} else {
			this.removeAttribute("disabled");
		}
	}
	static get observedAttributes() {
		return ["checked", "no-box", "disabled"];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch (name) {
			case "checked":
				let yes = (newval === null) ? false : true;
				this._changeIcon(yes);
				this.dispatchEvent(new CustomEvent('change', { detail: { checked: yes, value: this.value }, bubbles: true }));
				break;
			case "no-box":
				this._box.style.display = (newval === null) ? null : "none";
				break;
			// case "disabled":
			// if (newval === null) {
			// 	this.style.cursor = null;
			// } else {
			// 	this.style.cursor = "not-allowed";
			// }
			// break;
		}
	}
}
customElements.define("labeled-checkbox", LabeledCheckbox);