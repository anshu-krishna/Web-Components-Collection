/*************************
 * TabContainer
 *************************/
const __tab_container__ = 'tab-container';
if (typeof customElements.get(__tab_container__) === 'undefined') {
	const __template__ = document.createElement('template');
	__template__.innerHTML = `<style>*{ box-sizing: border-box;} :host{display: inline-block;}</style><slot></slot>`;

	class TabContainer extends HTMLElement {
		#root;
		#slot;

		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#slot = this.#root.querySelector('slot');
		}
		get #slotted() {
			const nodes = this.#slot.assignedNodes();
			return {
				tabHeaders: nodes.filter(n => n.nodeName.toLowerCase() === 'tab-headers').at(0) ?? null,
				tabSections: nodes.filter(n => n.nodeName.toLowerCase() === 'tab-sections').at(0) ?? null
			};
		}
		connectedCallback() {
			this.#slot.addEventListener('slotchange', _ => {
				const s = this.#slotted;
				if (s.tabHeaders !== null) {
					s.tabHeaders.onchange = ({ detail }) => {
						s.tabSections?.setAttribute('selected', detail);
						this.dispatchEvent(new CustomEvent('change', { detail: detail }));
					};
				}
				s.tabSections?.setAttribute('selected', s.tabHeaders?.selected ?? 0);
			});
		}
		// disconnectedCallback() {}
		// adoptedCallback() {}

		// static get observedAttributes() {
		// 	return [];
		// }
		// attributeChangedCallback(attrName, oldVal, newVal) {}
	}

	customElements.define(__tab_container__, TabContainer);
}
/*************************
 * TabHeaders
 *************************/
const __tab_headers__ = 'tab-headers';
if (typeof customElements.get(__tab_headers__) === 'undefined') {
	const __template__ = document.createElement('template');
	__template__.innerHTML = `<style>*{ box-sizing: border-box;} :host{display: flex;flex-wrap: wrap;gap: 0.2em;} ::slotted(:not(header)){display: none;} ::slotted(header){cursor: pointer;padding: 10px 15px;border: 1px solid #ededed;} ::slotted(header[data-selected]){cursor: initial;border-bottom: 2px solid black;} ::slotted(header[disabled]){pointer-events: none;filter: brightness(20%) invert(50%);}</style><slot></slot>`;

	class TabHeaders extends HTMLElement {
		static #headerClickHandler() {
			if (this.hasAttribute('data-selected')) { return; }
			this.parentElement.setAttribute('selected', this.dataset.index);
		}
		#root;
		#slot;

		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#slot = this.#root.querySelector('slot');
		}
		get #slottedHeaders() {
			return this.#slot.assignedNodes().filter(n => n.nodeName.toLowerCase() === 'header');
		}
		connectedCallback() {
			this.#slot.addEventListener('slotchange', _ => {
				for (let [i, h] of Object.entries(this.#slottedHeaders)) {
					h.dataset.index = i;
					h.onclick = TabHeaders.#headerClickHandler;
				}
				this.#changeSelected();
			});
		}
		#changeSelected() {
			const headers = this.#slottedHeaders;
			if (headers.length === 0) { return; }
			const selected = this.selected % headers.length;
			for (let [i, h] of Object.entries(headers)) {
				if (i == selected) { // Don't change == to ===;
					h.setAttribute('data-selected', '');
				} else {
					h.removeAttribute('data-selected');
				}
			}
			this.dispatchEvent(new CustomEvent('change', {
				detail: selected
			}));
		}
		get selected() {
			const v = parseInt(this.getAttribute("selected"));
			if (isNaN(v) || v < 0) { return 0; }
			return v;
		}
		set selected(index) {
			index = parseInt(index);
			if (isNaN(index) || index < 0) { index = 0; }
			this.setAttribute("selected", index);
		}
		// disconnectedCallback() {}
		// adoptedCallback() {}

		static get observedAttributes() {
			return ["selected"];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			// console.log("Changed", attrName, ":", oldval, "->", newval);
			switch (attrName) {
				case 'selected':
					if (parseInt(oldVal) !== parseInt(newVal)) {
						this.#changeSelected();
					}
					break;
			}
		}
	}

	customElements.define(__tab_headers__, TabHeaders);
}
/*************************
 * TabSection
 *************************/
const __tab_sections__ = 'tab-sections';
if (typeof customElements.get(__tab_sections__) === 'undefined') {
	const __template__ = document.createElement('template');
	__template__.innerHTML = `<style>*{ box-sizing: border-box;} :host{display: block;border: 1px solid #ededed;} ::slotted(:is(section)){padding: 0.5em 0.75em;} ::slotted(:not(section)), ::slotted(:not([data-selected])){display: none;}</style><slot></slot>`;

	class TabSections extends HTMLElement {
		#root;
		#slot;

		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#slot = this.#root.querySelector('slot');
		}
		get #slottedSections() {
			return this.#slot.assignedNodes().filter(n => n.nodeName.toLowerCase() === 'section');
		}
		connectedCallback() {
			this.#slot.addEventListener('slotchange', _ => {
				for (let [i, s] of Object.entries(this.#slottedSections)) {
					s.dataset.index = i;
				}
			});
			this.#changeSelected();
		}
		#changeSelected() {
			const sections = this.#slottedSections;
			if (sections.length === 0) { return; }
			const selected = this.selected % sections.length;
			for (let [i, h] of Object.entries(sections)) {
				if (i == selected) { // Don't change == to ===;
					h.setAttribute('data-selected', '');
				} else {
					h.removeAttribute('data-selected');
				}
			}
		}
		get selected() {
			const index = parseInt(this.getAttribute("selected"));
			if (isNaN(index) || index < 0) { return 0; }
			return index;
		}
		set selected(index) {
			index = parseInt(index);
			if (index === NaN || index < 0) { index = 0; }
			this.setAttribute("selected", index);
		}
		// disconnectedCallback() {}
		// adoptedCallback() {}

		static get observedAttributes() {
			return ["selected"];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			// console.log("Changed", attrName, ":", oldVal, "->", newVal);
			switch (attrName) {
				case 'selected':
					if (parseInt(oldVal) !== parseInt(newVal)) {
						this.#changeSelected();
					}
					break;
			}
		}
	}

	customElements.define(__tab_sections__, TabSections);
}