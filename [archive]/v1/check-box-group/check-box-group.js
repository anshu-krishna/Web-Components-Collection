class CheckBoxGroup extends HTMLElement {
	static get template() {
		if (typeof CheckBoxGroup.__template === "undefined") {
			CheckBoxGroup.__template = document.createElement("template");
			CheckBoxGroup.__template.innerHTML = `<style>
:host {
	display: block;
}
</style><form><slot></slot></form>`;
		}
		return CheckBoxGroup.__template;
	}
	static __newElement(type, attrs = {}) {
		let ele = document.createElement(type);
		for(let key of Object.keys(attrs)) {
			ele.setAttribute(key, attrs[key]);
		}
		return ele;
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(CheckBoxGroup.template.content.cloneNode(true));
		this.__name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now();
		this.__backPropagation = false;
		this.__frontPropagation = false;
	}
	connectedCallback() {
		setTimeout(()=>{
			let boxes = [];
		let count = -1;
		let optNodes = this.shadowRoot.querySelector('slot').assignedElements();
		this.innerHTML = '';
		let allSpan = this.appendChild(CheckBoxGroup.__newElement('span', {'class': '__checkbox__'}));
		this.__allIp = allSpan.appendChild(CheckBoxGroup.__newElement('input', {
			type: 'checkbox',
			id: `${this.__name}_${++count}`
		}));
		let allLabel = allSpan.appendChild(CheckBoxGroup.__newElement('label', {
			'for': `${this.__name}_${count}`
		}));
		allLabel.innerHTML = 'All';
		this.__allIp.addEventListener('change', e => {
			e.stopPropagation();
			if(this.__backPropagation) return;
			let checked = this.__allIp.checked;
			this.__frontPropagation = true;
			for(let ip of this.__inputElements) {
				ip.checked = checked;
			}
			this.__frontPropagation = false;
			this.dispatchEvent(new CustomEvent('change', {detail: this.checked}));
		});

		for(let opt of optNodes) {
			let box = document.createElement('span');
			let ip = box.appendChild(document.createElement('input'));
			let label = box.appendChild(document.createElement('label'));

			box.classList.add('__checkbox__');

			ip.setAttribute('type', 'checkbox');
			ip.setAttribute('id', `${this.__name}_${++count}`);
			ip.setAttribute('name', this.__name);
			ip.setAttribute('value', opt.value);
			if(opt.hasAttribute('checked')) {
				ip.setAttribute('checked', 'checked');
			}
			if(opt.disabled) {
				ip.setAttribute('disabled', 'disabled');
			}
			label.setAttribute('for', `${this.__name}_${count}`);
			label.innerHTML = opt.innerHTML;

			ip.addEventListener('change', e => {
				e.stopPropagation();
				this.__optChanged();
			});

			boxes.push(box);
		}
		for(let box of boxes) {
			this.appendChild(box);
		}
		if(this.checked.length === optNodes.length) {
			this.__allIp.checked = true;
		}
		}, 1);
	}
	__optChanged() {
		let opts = this.__inputElements;
		let everything = true;
		let checked = [];
		for(let opt of opts) {
			if(opt.checked) {
				checked.push(opt.value);
			} else {
				everything = false;
			}
		}
		this.__backPropagation = true;
		this.__allIp.checked = everything;
		this.__backPropagation = false;
		
		if(this.__frontPropagation) return;
		this.dispatchEvent(new CustomEvent('change', {detail: checked}));
	}
	get __inputElements() {
		return Array.from(document.getElementsByName(this.__name));
	}
	get __allElement() {
		return document.getElementById(`${this.__name}_0`);
	}
	get values() {
		let opts = this.__inputElements;
		return opts.map(ip => {
			return {value: ip.value, checked: ip.checked};
		});
	}
	get checked() {
		let ret = [];
		for(let ip of this.__inputElements) {
			if(ip.checked) {
				ret.push(ip.value);
			}
		}
		return ret;
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}
	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(name, oldval, newval) {
	// 	console.log("Changed", name, ":", oldval, "->", newval);
	// }
}
CheckBoxGroup.tagName = 'check-box-group';
customElements.define(CheckBoxGroup.tagName, CheckBoxGroup);