if (typeof customElements.get('form-wizard') === 'undefined') {
	const __template__ = document.createElement('template');

	const __template_file__ = String(new URL(import.meta.url + '/../form-wizard.html'));
	__template__.innerHTML = await fetch(__template_file__).then(html => html.text()).catch(e => 'Unable to load: ' + __template_file__);

	class FormWizard extends HTMLElement {
		static #updateButton(button, text, disabled) {
			button.textContent = text;
			if(!!disabled) { button.setAttribute('disabled', 'disabled'); }
			else { button.removeAttribute('disabled'); }
		}
		#root;
		#slot;
		#acts;
		#forms = [];
		#states = [];
		#activeIdx = 0;
		set #active(index) {
			const max = this.#forms.length;
			if(index < 0) { index += max; }
			if(index >= max) { index %= max; }
			for(const s of this.#states) { s.classList.remove('active'); }
			for(const f of this.#forms) { f.classList.remove('active'); }
			const form = this.#forms[index];
			FormWizard.#updateButton(this.#acts[0], form.dataset.backText ?? 'Back', index === 0 ? true : form.dataset.backDisabled);
			FormWizard.#updateButton(this.#acts[1], form.dataset.nextText ?? ((index + 1 ) === max ? 'Finish' : 'Next'), form.dataset.nextDisabled);
			FormWizard.#updateButton(this.#acts[2], form.dataset.cancelText ?? 'Cancel', form.dataset.cancelDisabled);

			form.classList.add('active');
			this.#states[index].classList.add('active');
			this.#activeIdx = index;
		}
		get #active() { return this.#activeIdx; }

		
		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
			this.#acts = [...this.#root.querySelectorAll('#actions > button')];
			this.#root.querySelector('slot').addEventListener('slotchange', ({target}) => {
				this.#forms = [];
				const st = this.#root.querySelector('#states');
				let i = 1;
				for(const n of target.assignedNodes()) {
					if(n.nodeType === 3) { n.nodeValue = ''; }
					else if(n instanceof HTMLFormElement) {
						this.#forms.push(n);
						st.appendChild(document.createElement('span')).textContent = i++;
					}
				}
				this.#states = [... this.#root.querySelectorAll('#states > span')];
			});
			this.#acts[0].addEventListener('click', () => this.#active--);
			this.#acts[1].addEventListener('click', () => {
				if(this.#active + 1 === this.#forms.length) {
					// Last
					console.log('Last form -- submit');
					return;
				}
				this.#active++
			});
			this.#acts[2].addEventListener('click', () => this.removeAttribute('open'));
		}
		show() {
			if(this.#forms.length === 0) {
				console.log('No forms found in', this);
				return;
			}
			if(this.#forms.length === 1) {
				this.setAttribute('single-form', '');
			}
			this.#active = 0;
			this.setAttribute('open', '');
		}
		// connectedCallback() {}
		// disconnectedCallback() {}
		// adoptedCallback() {}

		// static get observedAttributes() {
		// 	return [];
		// }
		// attributeChangedCallback(attrName, oldVal, newVal) {
		// 	if(oldVal === newVal) { return; }
		// 	console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
		// }
	}

	customElements.define('form-wizard', FormWizard);
}