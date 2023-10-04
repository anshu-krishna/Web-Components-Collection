export function combineFormData(...form) {
	const data = new FormData;
	for(const item of form.map(f => [...(new FormData(f)).entries()]).flat(1)) {
		data.append(...item);
	}
	return data;
}

class FormWizard extends HTMLElement {
	static #template;
	static #tag = 'form-wizard';
	static {
		(async () => {
			this.#template = document.createElement('template');

			this.#template.innerHTML = await (async () => {
				const file = String(new URL(import.meta.url + '/../' + this.#tag + '.html'));
				const html = await fetch(file);
				return (html.status === 200) ? (await html.text()) : '<code>Load-Error: '+ file +'</code>';
			})();

			customElements.define(this.#tag, this);
			console.log('WebCompoent Loaded: ' + this.#tag + ';');
		})();
	}

	static #updateButton(button, text, disabled) {
		button.textContent = text;
		if (!!disabled) { button.setAttribute('disabled', 'disabled'); }
		else { button.removeAttribute('disabled'); }
	}

	#root;
	#acts;
	#forms = [];
	#states = [];
	#activeIdx = 0;

	set #active(index) {
		const max = this.#forms.length;
		if (index < 0) { index += max; }
		if (index >= max) { index %= max; }
		for (const s of this.#states) { s.classList.remove('active'); }
		for (const f of this.#forms) { f.classList.remove('active'); }
		const form = this.#forms[index];
		FormWizard.#updateButton(this.#acts[0], form.dataset.backText ?? 'Back', index === 0 ? true : form.dataset.backDisabled);
		FormWizard.#updateButton(this.#acts[1], form.dataset.nextText ?? ((index + 1) === max ? 'Finish' : 'Next'), form.dataset.nextDisabled);
		FormWizard.#updateButton(this.#acts[2], form.dataset.cancelText ?? 'Cancel', form.dataset.cancelDisabled);

		form.classList.add('active');
		this.#states[index].classList.add('active');
		this.#activeIdx = index;
		form.querySelector('input, textarea')?.focus();
	}
	get #active() { return this.#activeIdx; }

	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(FormWizard.#template.content.cloneNode(true));
		this.#acts = [...this.#root.querySelectorAll('#actions > button')];
		this.#root.querySelector('slot').addEventListener('slotchange', ({ target }) => {
			this.#forms = [];
			const st = this.#root.querySelector('#states');
			st.innerHTML = '';
			for (const n of target.assignedNodes()) {
				if (n.nodeType === 3) { n.nodeValue = ''; }
				else if (n instanceof HTMLFormElement) {
					this.#forms.push(n);
					n.addEventListener('submit', (e) => {
						e.preventDefault();
						e.stopPropagation();
						this.#acts[1].click();
						return false;
					});

					st.appendChild(document.createElement('span')).setAttribute('part', 'dot');
					st.appendChild(document.createElement('div')).setAttribute('part', 'dot-spacer');
				}
			}
			this.#states = [... this.#root.querySelectorAll('#states > span')];
			this.dispatchEvent(new CustomEvent('ready'));
		});

		// Add button handlers
		this.#acts[0].addEventListener('click', () => this.#active--);
		this.#acts[1].addEventListener('click', () => {
			const activeForm = this.#forms[this.#activeIdx];
			const activeState = this.#states[this.#activeIdx];

			if (activeForm.checkValidity()) {
				activeState.setAttribute('part', 'dot dot-ok');
			} else {
				activeState.setAttribute('part', 'dot dot-error');
				if (!Boolean(activeForm.dataset.skippable)) {
					activeForm.reportValidity();
					return;
				}
			}
			if (this.#activeIdx + 1 === this.#forms.length) {
				// Submit on last form
				this.removeAttribute('open');
				if(this.hasAttribute('combined-formdata')) {
					this.dispatchEvent(new CustomEvent('submit', { detail: combineFormData(...this.#forms.filter((f, i) => this.#states[i].getAttribute('part') === 'dot dot-ok')) }));
				} else {
					this.dispatchEvent(new CustomEvent('submit', {
						detail: this.#forms.map((f, i) => {
							return {
								form: f,
								valid: this.#states[i].getAttribute('part') === 'dot dot-ok'
							};
						})
					}));
				}
				return;
			}
			this.#active++;
		});
		this.#acts[2].addEventListener('click', () => this.removeAttribute('open'));
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
	show() {
		if (this.#forms.length === 0) {
			console.log('No forms found in', this);
			return;
		}
		if (this.#forms.length === 1) {
			this.setAttribute('single-form', '');
		}
		this.#active = 0;
		this.setAttribute('open', '');
	}
	hide() {
		this.removeAttribute('open');
	}
}