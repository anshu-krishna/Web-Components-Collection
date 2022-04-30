class MultiSelector extends HTMLElement {
	static __tag = 'multi-selector';
	static __template = document.createElement('template');
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(MultiSelector.__template.content.cloneNode(true));
		this.__values = [];
		this.shadowRoot.querySelector('#filter').onkeyup = e => {
			const fval = e.target.value.toLowerCase();
			for(let li of Array.from(this.shadowRoot.querySelectorAll('#values > li'))) {
				if(fval === '') {
					li.dataset.visible = true;
				} else {
					const text = this.__values[parseInt(li.dataset.idx)].text.toLowerCase();
					if(text.includes(fval)) {
						li.dataset.visible = true;
					} else {
						li.dataset.visible = false;
					}
				}
			}
		};
	}
	// static get observedAttributes() {
	// 	return [];
	// }
	// connectedCallback() {}
	// disconnectedCallback() {}
	// attributeChangedCallback(attrName, oldVal, newVal) {}
	// adoptedCallback() {}
	set values(vals) {
		this.__values = [];
		if(Array.isArray(vals)) {
			for(let item of vals) {
				let {text = 'Undefined', val = null} = item;
				if(val !== null) {
					this.__values.push({
						val : val,
						text: text,
						selected: false
					});
				}
			}
		}
		this.__generate();
	}
	get values() {
		return this.__values;
	}
	__generate() {
		const ul = this.shadowRoot.querySelector('#values');
		ul.innerHTML = '';
		for(let i=0; i<this.__values.length; i++) {
			const li = ul.appendChild(document.createElement('li'));
			li.innerText = this.__values[i].text;
			li.dataset.idx = i;
			li.dataset.selected = false;
			li.dataset.visible = true;
			const self = this;
			li.onclick = function(e) {
				const li = e.target;
				const sel = !(li.dataset.selected === 'true');
				const idx = parseInt(li.dataset.idx);
				self.__values[idx].selected = sel;
				li.dataset.selected = sel;
			};
		}
	}
	get selected() {
		return this.__values.filter(i => i.selected).map(i => i.val);
	}
}
MultiSelector.__template.innerHTML = `<style>
* {
	box-sizing: border-box;
}
:host(*) {
	display: grid;
	border: 1px solid;
	padding: 1em;
	border-radius: 0.5em;
	--max-inner-height: 300px;
}
#cntr {
	display: grid;
	grid-template-rows: min-content auto;/* minmax(min-content, 20%);*/
}
#values {
	list-style-type: none;
	margin: 0.5em 0;
	padding: 0;
	display: flex;
	flex-wrap: wrap;
	gap: 0.5em;
	border-top: 1px solid;
	padding: 0.5em 0.25em;
	padding-bottom: 0;
	max-height: var(--max-inner-height);
	overflow-y: auto;
}
#values > li {
	display: inline-block;
	cursor: pointer;
	padding: 0.5em 0.75em;
	border: 1px solid;
	border-radius: 0.25em;
}
#values > li[data-selected="true"] {
	background: #303f9f;
	color: white;
}
#values > li[data-visible="false"] {
	display: none;
}
#inputsection {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 0.5em;
	align-items: center;
}
#inputsection > input {
	padding: 0.5em 0.75em;
}
</style>
<div id="cntr">
<label id="inputsection"><slot name="label"><strong>Filter:</strong></slot> <input id="filter" type="text" placeholder="Filter" /></label>
<ul id="values"></ul>
</div>
<slot></slot>`;
customElements.define(MultiSelector.__tag, MultiSelector);