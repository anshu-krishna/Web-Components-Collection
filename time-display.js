const TEMPLATES = new (class {
	#frag = new DocumentFragment;
	add(templateHTML) {
		const container = document.createElement('div');
		container.innerHTML = templateHTML;
		this.#frag.appendChild(container.querySelector('template'));
	}
	clone(id, deep = true) {
		return this.#frag.querySelector(id)?.content?.cloneNode?.(deep) ?? null;
	}
});

TEMPLATES.add("<template id=\"time-display\"><style>:host{display:inline-block}.hide{display:none}[part=container]{grid-gap:.1rem;align-items:center;display:grid;gap:.1rem;justify-items:center;place-items:center}[part=time]{font-size:1.2rem}[part=label]{font-size:.7rem}</style><div part=\"container\"><span part=\"time\">Time</span><span part=\"label\" class=\"hide\">Label</span></div></template>");

class TimeDisplay extends HTMLElement {
	static {
		if(typeof customElements.get('time-display') === 'undefined') {
			customElements.define('time-display', this);
		}
	}
	#military = false;
	#zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	#gen;
	#intervalID = null;
	#root;
	#timeNode;
	#label = null;
	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(TEMPLATES.clone('#time-display'));
		this.#gen = Intl.DateTimeFormat(undefined, {
			hour: this.#military ? 'numeric' : '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: !this.#military,
			timeZone: this.#zone
		});
		this.#timeNode = this.#root.querySelector('[part="time"]');
	}
	connectedCallback() {
		this.#update();
		this.#intervalID = setInterval(() => {
			this.#update();
		}, 1000);
	}
	disconnectedCallback() {
		if(this.#intervalID !== null) {
			clearInterval(this.#intervalID);
			this.#intervalID = null;
		}
		this.#intervalID = null;
	}
	adoptedCallback() {
		this.#update();
	}
	#update() {
		const now = this.#gen?.format() ?? null;
		this.#timeNode.textContent = now ?? 'Invalid Zone';

		let desc;
		if(now === null) {
			desc = 'Error: Invalid Zone';
		} else {
			desc = (this.#label ?? '') + now;
		}
		this.setAttribute('title', desc);
	}
	#setGen() {
		try {
			this.#gen = this.#zone === null ? null : Intl.DateTimeFormat(undefined, {
				hour: this.#military ? 'numeric' : '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: !this.#military,
				timeZone: this.#zone
			});
		} catch (error) {
			this.#gen = null;
		}
		
		this.#update();
	}
	static get observedAttributes() {
		return ['zone', 'label', 'military'];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		if(oldVal === newVal) { return; }
		// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
		switch(attrName) {
			case 'label':
				newVal ??= '';
				newVal = newVal.trim();
				if(newVal.length > 0) {
					this.#root.querySelector('[part="label"]').textContent = newVal;
					this.#root.querySelector('[part="label"]').classList.remove('hide');
					this.#label = `${newVal} Time is `;
				} else {
					this.#root.querySelector('[part="label"]').classList.add('hide');
					this.#label = null;
				}
				break;
			case 'military':
				this.#military = newVal !== null;
				this.#setGen();
				break;
			case 'zone':
				if(newVal === null) {
					this.#zone = Intl.DateTimeFormat().resolvedOptions().locale;
				} else {
					this.#zone = newVal;
				}
				this.#setGen();
				break;
		}
	}
}