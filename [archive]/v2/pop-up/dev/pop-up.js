class PopUp extends HTMLElement {
	static #template;
	static #tag = 'pop-up';
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

	static #escHandler({ keyCode }) {
		if (keyCode === 27) { this.close(); }
	}
	static #panelCloseHandler(e) {
		e.stopPropagation();
		if (e.target.isSameNode(this.#nodes.cntr)) { this.close(); }
	}
	#beforeOpen = null;
	#beforeClose = null;
	#nodes = {};

	#handlers = {
		_esc: { st: false },
		_panel: { st: false }
	};
	constructor() {
		super();
		this.#nodes.root = this.attachShadow({ mode: 'closed' });
		this.#nodes.root.appendChild(PopUp.#template.content.cloneNode(true));

		this.#nodes.cntr = this.#nodes.root.querySelector('#cntr');
		this.#nodes.title = this.#nodes.root.querySelector('slot[name="title"]');
		this.#nodes.content = this.#nodes.root.querySelector('#content');

		this.#handlers._esc.fn = PopUp.#escHandler.bind(this);
		this.#handlers.esc = (value = null) => {
			// if(value === null) { return this.#handlers._esc.st; }
			if (this.#handlers._esc.st === value) { return; }
			if (this.#handlers._esc.st = value) {
				window.addEventListener('keyup', this.#handlers._esc.fn);
			} else {
				window.removeEventListener('keyup', this.#handlers._esc.fn);
			}
		};

		this.#handlers._panel.fn = PopUp.#panelCloseHandler.bind(this);
		this.#handlers.panel = (value = null) => {
			// if(value === null) { return this.#handlers._panel.st; }
			if (this.#handlers._panel.st === value) { return; }
			if (this.#handlers._panel.st = value) {
				this.#nodes.cntr.addEventListener('click', this.#handlers._panel.fn);
			} else {
				this.#nodes.cntr.removeEventListener('click', this.#handlers._panel.fn);
			}
		};

		this.#nodes.cntr.querySelector('#btn_close').onclick = _ => this.close();
		this.#nodes.content.addEventListener('click', e => e.stopPropagation());
		this.#handlers.panel(true);
	}

	get beforeOpen() { return this.#beforeOpen; }
	set beforeOpen(handler) {
		this.#beforeOpen = (typeof handler === 'function') ? handler : null;
	}
	get beforeClose() { return this.#beforeClose; }
	set beforeClose(handler) {
		this.#beforeClose = (typeof handler === 'function') ? handler : null;
	}
	#titleHandler() {
		if (this.#nodes.title.assignedNodes().length) {
			this.#nodes.cntr.classList.remove('notitle');
		} else {
			this.#nodes.cntr.classList.add('notitle');
		}
	}
	#handlerManager(isOpen, panelCloseAllowed, closeDisabled) {
		// console.log('\nOpen', isOpen, '\npanelCloseAllowed', panelCloseAllowed, '\ncloseDisabled', closeDisabled);
		if (isOpen) {
			this.#handlers.esc(!closeDisabled);
			this.#handlers.panel(!closeDisabled && panelCloseAllowed);
		} else {
			this.#handlers.esc(false);
		}
	}
	get isOpen() {
		return this.hasAttribute('open');
	}
	async open(scrollTop = true) {
		if (this.isOpen) { return true; }
		const check = this.beforeOpen;
		if ((check === null) ? true : await check(this)) {
			document.body.style.overflowY = 'hidden';
			if (scrollTop) {
				this.#nodes.content.scrollTop = 0;
			}
			this.setAttribute('open', '');
			this.dispatchEvent(new CustomEvent('open', { detail: this }));
			return true;
		} else { return false; }
	}
	async close() {
		if (!this.isOpen) { return true; }
		const check = this.beforeClose;
		if ((check === null) ? true : await check(this)) {
			document.body.style.overflowY = null;
			this.removeAttribute('open');
			this.dispatchEvent(new CustomEvent('close', { detail: this }));
			return true;
		} else { return false; }
	}
	connectedCallback() {
		this.#nodes.title.addEventListener('slotchange', this.#titleHandler.bind(this));
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	static get observedAttributes() {
		return ['open', 'no-panel-close', 'close-disabled'];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (oldVal === newVal) { return; }
		// console.log(`Attribute [${attrName}] = `, newVal, ' from =', oldVal);
		this.#handlerManager(
			this.hasAttribute('open'),
			!this.hasAttribute('no-panel-close'),
			this.hasAttribute('close-disabled')
		);
	}
}