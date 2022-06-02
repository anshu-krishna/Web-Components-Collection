export function combineFormData(...form) {
	const data = new FormData;
	for(const item of form.map(f => [...(new FormData(f)).entries()]).flat(1)) {
		data.append(...item);
	}
	return data;
}
if (typeof customElements.get('form-wizard') === 'undefined') {
	const __template__ = document.createElement('template');
	__template__.innerHTML = `<style>*{box-sizing:border-box}:host{display:none;z-index:100;position:fixed;top:0;left:0;width:100vw;height:100vh;background:0 0}:host([open]){display:inline-block}#cntr{padding:2em;height:100vh;display:grid;grid-template-rows:min-content 1fr max-content;gap:.5em;background:rgba(0,0,0,.5)}:host([single-form]) #cntr{grid-template-rows:1fr max-content}#slotc{overflow-y:hidden;display:grid;justify-content:center;align-items:center;background:0 0}#fslot::slotted(:not(form)),#fslot::slotted(:not(form.active)){display:none!important}#fslot::slotted(form){max-height:100%;overflow-y:auto;background:#ededed;color:#000;padding:.5em .75em}#actions{display:flex;justify-content:end;gap:.5em}#actions>button{cursor:pointer;padding:.75em 1.5em;border:none;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif;background:#121212;color:wheat;border-radius:.5em}#actions>button:hover{filter:brightness(1.5)}#actions>button:disabled{cursor:not-allowed;filter:brightness(.25)}#actions>button:active{filter:brightness(.7)}#states{display:flex;flex-wrap:wrap;gap:.5em;align-items:center;justify-content:center}:host([single-form]) #states{display:none}#states>div:last-child{display:none}#states>div{display:inline-block;height:3px;width:1em;background:grey;border-radius:3px}#states>span{display:grid;font-family:Arial,Helvetica,sans-serif;width:1em;height:1em;border-radius:.5em;justify-content:center;align-items:center;background:#eceff1;border:.1em solid #263238;box-shadow:-1px 1px 4px #000}#states>span[part="dot dot-ok"]{background:#00695c}#states>span.active{border-width: 0.2em !important}</style><div part="overlay" id="cntr"><div exportparts="dot, dot-ok, dot-error" id="states"></div><div part="form-container" id="slotc"><slot id="fslot"></slot></div><div part="button-container" id="actions"><button part="button">Back</button><button part="button">Next</button><button part="button">Cancel</button></div></div>`;

	class FormWizard extends HTMLElement {
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
		}
		get #active() { return this.#activeIdx; }


		constructor() {
			super();
			this.#root = this.attachShadow({ mode: 'closed' });
			this.#root.appendChild(__template__.content.cloneNode(true));
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

	customElements.define('form-wizard', FormWizard);
}