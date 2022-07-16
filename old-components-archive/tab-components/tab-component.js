/*
Author: Anshu Krishna
Contact: anshu.krishna5@gmail.com
Date: 13-Nov-2018
Description: This library provides three customElements that together can create a tabbed UI.
*/
class TabContainer extends HTMLElement {
	static get template() {
		if (typeof TabContainer._template == "undefined") {
			TabContainer._template = document.createElement("template");
			TabContainer._template.innerHTML =
				`<style>
:host {
	display: inline-block;
}
</style><slot></slot>`;
		}
		return TabContainer._template;
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(TabContainer.template.content.cloneNode(true));
		this.__nodes = {
			slot: this.shadowRoot.querySelector('slot')
		};
	}
	get slotted() {
		let nodes = this.__nodes.slot.assignedNodes();
		let headers = nodes.filter(n => n.nodeName.toLowerCase() === 'tab-headers');
		headers = (headers.length > 0) ? headers[0] : null;
		let sections = nodes.filter(n => n.nodeName.toLowerCase() === 'tab-sections');
		sections = (sections.length > 0) ? sections[0] : null;
		return {
			tabHeaders: headers,
			tabSections: sections
		};
	}
	connectedCallback() {
		this.__nodes.slot.addEventListener('slotchange', () => {
			let s = this.slotted;
			if (s.tabHeaders !== null) {
				s.tabHeaders.onchange = (e) => {
					if (s.tabSections !== null) {
						s.tabSections.setAttribute('selected', e.detail);
						this.dispatchEvent(new CustomEvent('change', {
							detail: e.detail
						}));
					}
				};
				if (s.tabSections !== null) {
					s.tabSections.setAttribute('selected', s.tabHeaders.selected);
				}
			}
		});
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	// static get observedAttributes() {}
	// attributeChangedCallback(name, oldval, newval) {
	//	console.log("Changed", name, ":", oldval, "->", newval);
	//}
}
customElements.define("tab-container", TabContainer);
/***** ***** ***** ***** ***** ***** ***** ***** ***** ***** ***** ***** *****/
class TabHeaders extends HTMLElement {
	static get template() {
		if (typeof TabHeaders._template == "undefined") {
			TabHeaders._template = document.createElement("template");
			TabHeaders._template.innerHTML =
				`<style>
:host {
	display: flex;
	flex-wrap: wrap;
}
::slotted(:not(header)) {
	display: none;
}
::slotted(header) {
	cursor: pointer;
}
::slotted(header[data-selected]) {
	cursor: initial;
}
</style><slot></slot>`;
		}
		return TabHeaders._template;
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(TabHeaders.template.content.cloneNode(true));

		this.__nodes = {
			slot: this.shadowRoot.querySelector('slot')
		};
	}
	get slottedHeaders() {
		return this.__nodes.slot.assignedNodes().filter(n => n.nodeName.toLowerCase() === 'header');
	}
	connectedCallback() {
		this.__nodes.slot.addEventListener('slotchange', () => {
			let idx = -1;
			for (let h of this.slottedHeaders) {
				h.setAttribute('data-index', ++idx);
				h.onclick = function () {
					if (this.hasAttribute('data-selected')) {
						return;
					} else {
						this.parentElement.setAttribute('selected', this.dataset.index);
					}
				};
			}
			this.__change_selected();
		});
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	__change_selected() {
		let headers = this.slottedHeaders;
		if (headers.length == 0) {
			return;
		}
		let selected = this.selected % headers.length;
		for (let h of headers) {
			h.removeAttribute('data-selected');
		}
		headers[selected].setAttribute('data-selected', '');
		this.dispatchEvent(new CustomEvent('change', {
			detail: selected
		}));
	}
	static get observedAttributes() {
		return ['selected'];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch (name) {
			case 'selected':
				if (parseInt(oldval) !== parseInt(newval)) {
					this.__change_selected();
				}
				break;
		}
	}
	get selected() {
		let val = parseInt(this.getAttribute("selected"));
		if (isNaN(val) || val < 0) {
			return 0;
		}
		return val;
	}
	set selected(val) {
		val = parseInt(val);
		if (val === NaN || val < 0) {
			val = 0;
		}
		this.setAttribute("selected", val);
	}
}
customElements.define("tab-headers", TabHeaders);
/***** ***** ***** ***** ***** ***** ***** ***** ***** ***** ***** ***** *****/
class TabSections extends HTMLElement {
	static get template() {
		if (typeof TabSections._template == "undefined") {
			TabSections._template = document.createElement("template");
			TabSections._template.innerHTML =
				`<style>
:host {
	display: block;
}
::slotted(:not(section)), ::slotted(:not([data-selected])) {
	display: none;
}
</style><slot></slot>`;
		}
		return TabSections._template;
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(TabSections.template.content.cloneNode(true));
		this.__nodes = {
			slot: this.shadowRoot.querySelector('slot')
		};
	}
	get slottedSections() {
		return this.__nodes.slot.assignedNodes().filter(n => n.nodeName.toLowerCase() === 'section');
	}
	connectedCallback() {
		this.__nodes.slot.addEventListener('slotchange', () => {
			let idx = -1;
			for (let sec of this.slottedSections) {
				sec.setAttribute('data-index', ++idx);
			}
			this.__change_selected();
		});
	}
	__change_selected() {
		let sections = this.slottedSections;
		if (sections.length == 0) {
			return;
		}
		let selected = this.selected % sections.length;
		for (let h of sections) {
			h.removeAttribute('data-selected');
		}
		sections[selected].setAttribute('data-selected', '');
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	static get observedAttributes() {
		return ['selected'];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch (name) {
			case 'selected':
				if (parseInt(oldval) !== parseInt(newval)) {
					this.__change_selected();
				}
				break;
		}
	}
	get selected() {
		let val = parseInt(this.getAttribute("selected"));
		if (isNaN(val) || val < 0) {
			return 0;
		}
		return val;
	}
	set selected(val) {
		val = parseInt(val);
		if (val === NaN || val < 0) {
			val = 0;
		}
		this.setAttribute("selected", val);
	}
}
customElements.define("tab-sections", TabSections);