class LabeledRadio extends HTMLElement {
	static get template() {
		if (typeof LabeledRadio._template == "undefined") {
			LabeledRadio._template = document.createElement("template");
			LabeledRadio._template.innerHTML = `<style>
:host {
	display: inline-block;
	cursor: pointer;
}
:host([disabled]) {
	color: #777;
	cursor: not-allowed;
}
[data-labeled-radio-contents] {

}
[data-labeled-radio-no] svg, [data-labeled-radio-yes] svg {
	width: 1em;
	height: 1em;
	fill: currentColor;
}
</style>
<span data-labeled-radio-box>
	<span data-labeled-radio-no><slot name="no">&#x2717;</slot></span><span data-labeled-radio-yes><slot name="yes">&#x2714;</slot></span>
</span>
<span data-labeled-radio-contents><slot></slot></span>`;
		}
		return LabeledRadio._template;
	}
	static _groupMembers(name) {
		return Array.from(document.querySelectorAll(`labeled-radio[group="${name}"]`));
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
	_onClick() {
		if (this.disabled) return;
		this.checked = !this.checked;
		this.dispatchEvent(new CustomEvent('change'));
		if (!this.checked) return;
		this._handlerGroup();
	}
	_handlerGroup() {
		let group = this.group;
		if (group === null) return;
		let groupMembers = LabeledRadio._groupMembers(group);
		for (let r of groupMembers) {
			if (!r.isSameNode(this)) r.checked = false;
		}
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(LabeledRadio.template.content.cloneNode(true));

		this._box = this.shadowRoot.querySelector("[data-labeled-radio-box]");
		this._yes = this.shadowRoot.querySelector("[data-labeled-radio-yes]");
		this._no = this.shadowRoot.querySelector("[data-labeled-radio-no");

		this._changeIcon(false);
	}
	connectedCallback() {
		this.addEventListener("click", this._onClick);
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	get group() {
		return this.getAttribute("group");
	}
	set group(val) {
		if (val === null) {
			this.removeAttribute("group");
			return;
		}
		this.setAttribute("group", val);
	}
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
				if (yes) {
					this._handlerGroup();
				}
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
customElements.define("labeled-radio", LabeledRadio);