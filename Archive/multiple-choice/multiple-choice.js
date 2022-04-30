class MultipleChoice extends HTMLElement {
	static get template() {
		if (typeof MultipleChoice._template == "undefined") {
			MultipleChoice._template = document.createElement("template");
			MultipleChoice._template.innerHTML =
				`<style>
labeled-checkbox {
	display: inline-block;
}
labeled-checkbox[disabled] {
	color: #777;
	cursor: not-allowed;
}
</style><div data-multiple-choice-container><slot></slot></div>`;
		}
		return MultipleChoice._template;
	}
	get _boxes() {
		// return Array.prototype.slice.call(this.querySelectorAll("labeled-checkbox"));
		return this.querySelectorAll("labeled-checkbox");
	}
	_syncAttribute(attr, state) {
		let boxes = this._boxes;
		if (state) {
			for (let i = boxes.length - 1; i >= 0; i--) {
				boxes[i].setAttribute(attr, "");
			}
		} else {
			for (let i = boxes.length - 1; i >= 0; i--) {
				boxes[i].removeAttribute(attr);
			}
		}
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(MultipleChoice.template.content.cloneNode(true));
		this._container = this.shadowRoot.querySelector("[data-multiple-choice-container]");
		this._observer = new MutationObserver(mutlist => {
			// for (let mut of mutlist) {
			// 	console.log(mut.addedNodes, mut.removedNodes);
			// }
			// console.log(this._boxes);
			this._syncAttribute("no-box", this.noBox);
			this._syncAttribute("disabled", this.disabled);
		});
	}
	connectedCallback() {
		this._observer.observe(this, { childList: true });
		this.addEventListener("change", e => {
			if (e.target instanceof LabeledCheckbox) {
				// console.log(this._boxes);
				// e.preventDefault();
				e.stopPropagation();
				// e.stopImmediatePropagation();
				this.dispatchEvent(new CustomEvent('choice-change', { detail: this.value }));
			}
		});
	}
	disconnectedCallback() {
		this._observer.disconnect();
	}
	// adoptedCallback() {}
	get noBox() {
		return this.hasAttribute("no-box");
	}
	set noBox(val) {
		if (val) {
			this.setAttribute("no-box", "");
		} else {
			this.removeAttribute("no-box");
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
	get value() {
		let boxes = this._boxes;
		let ret = [];
		for (let i = 0; i < boxes.length; i++) {
			if (boxes[i].checked) {
				ret.push(boxes[i].value);
			}
		}
		return ret;
	}
	static get observedAttributes() {
		return ["no-box", "disabled"];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch (name) {
			case "no-box":
				this._syncAttribute("no-box", this.noBox);
				break;
			case "disabled":
				this._syncAttribute("disabled", this.disabled);
				break;
		}
	}
}
customElements.define("multiple-choice", MultipleChoice);