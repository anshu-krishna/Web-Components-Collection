class PopUp extends HTMLElement {
	static _meta = {
		tag: 'pop-up',
		template: document.createElement('template')
	};
	static #escHandler({keyCode}) {
		if (keyCode === 27) { this.close(); }
	}
	static #panelCloseHandler(e) {
		e.stopPropagation();
		if(e.target.isSameNode(this.#nodes.cntr)) { this.close(); }
	}
	#beforeOpen = null;
	#beforeClose = null;
	#nodes = {};

	#handlers = {
		_esc: { st: false },
		_panel: { st: false }
	};
	
	get beforeOpen() { return this.#beforeOpen; }
	set beforeOpen(handler) {
		this.#beforeOpen = (typeof handler === 'function') ? handler : null;
	}
	get beforeClose() { return this.#beforeClose; }
	set beforeClose(handler) {
		this.#beforeClose = (typeof handler === 'function') ? handler : null;
	}
	#titleHandler() {
		if(this.#nodes.title.assignedNodes().length) {
			this.#nodes.cntr.classList.remove('notitle');
		} else {
			this.#nodes.cntr.classList.add('notitle');
		}
	}
	constructor() {
		super();
		this.#nodes.root = this.attachShadow({mode: 'closed'});
		this.#nodes.root.appendChild(PopUp._meta.template.content.cloneNode(true));
		this.#nodes.cntr = this.#nodes.root.querySelector('#cntr');
		this.#nodes.title = this.#nodes.root.querySelector('slot[name="title"]');
		this.#nodes.content = this.#nodes.root.querySelector('#content');

		this.#handlers._esc.fn = PopUp.#escHandler.bind(this);
		this.#handlers.esc = (value = null) => {
			// if(value === null) { return this.#handlers._esc.st; }
			if(this.#handlers._esc.st === value) { return; }
			if(this.#handlers._esc.st = value) {
				window.addEventListener('keyup', this.#handlers._esc.fn);
			} else {
				window.removeEventListener('keyup', this.#handlers._esc.fn);
			}
		};

		this.#handlers._panel.fn = PopUp.#panelCloseHandler.bind(this);
		this.#handlers.panel = (value = null) => {
			// if(value === null) { return this.#handlers._panel.st; }
			if(this.#handlers._panel.st === value) { return; }
			if(this.#handlers._panel.st = value) {
				this.#nodes.cntr.addEventListener('click', this.#handlers._panel.fn);
			} else {
				this.#nodes.cntr.removeEventListener('click', this.#handlers._panel.fn);
			}
		};
		
		this.#nodes.cntr.querySelector('#btn_close').onclick = _ => this.close();
		this.#nodes.content.addEventListener('click', e => e.stopPropagation());
		this.#handlers.panel(true);
	}
	connectedCallback() {
		this.#nodes.title.addEventListener('slotchange', this.#titleHandler.bind(this));
	}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	static get observedAttributes() {
		return ['open', 'no-panel-close', 'close-disabled'];
	}
	#handlerManager(isOpen, panelCloseAllowed, closeDisabled) {
		// console.log('\nOpen', isOpen, '\npanelCloseAllowed', panelCloseAllowed, '\ncloseDisabled', closeDisabled);
		if(isOpen) {
			this.#handlers.esc(!closeDisabled);
			this.#handlers.panel(!closeDisabled && panelCloseAllowed);
		} else {
			this.#handlers.esc(false);
		}
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		if(oldVal === newVal) { return; }
		// console.log(`Attribute [${attrName}] = `, newVal, ' from =', oldVal);
		this.#handlerManager(
			this.hasAttribute('open'),
			!this.hasAttribute('no-panel-close'),
			this.hasAttribute('close-disabled')
		);
	}
	get isOpen() {
		return this.hasAttribute('open');
	}
	async open(scrollTop = true) {
		if(this.isOpen) { return true; }
		const check = this.beforeOpen;
		if((check === null) ? true : await check(this)) {
			document.body.style.overflowY = 'hidden';
			if(scrollTop) {
				this.#nodes.content.scrollTop = 0;
			}
			this.setAttribute('open', '');
			this.dispatchEvent(new CustomEvent('open', {detail: this}));
			return true;
		} else { return false; }
	}
	async close() {
		if(!this.isOpen) { return true; }
		const check = this.beforeClose;
		if((check === null) ? true : await check(this)) {
			document.body.style.overflowY = null;
			this.removeAttribute('open');
			this.dispatchEvent(new CustomEvent('close', {detail: this}));
			return true;
		} else { return false; }
	}
}
PopUp._meta.template.innerHTML = `<style>*{box-sizing:border-box}@keyframes slide-in{0%{visibility:visible;transform:translateX(var(--final-translate-value))}1%{transform:translateX(var(--final-translate-value));visibility:visible}100%{transform:translateX(0%);visibility:visible}}@keyframes slide-out{0%{transform:translateX(0%);visibility:visible}99%{transform:translateX(var(--final-translate-value));visibility:visible}100%{transform:translateX(var(--final-translate-value));visibility:hidden}}:host{--z-index:500;--backpanel-backgound:rgba(0,0,0,.9);--backpanel-padding:.75em 1.5em;--content-gap-around:1em;--delay:0.1s;--final-translate-value:-101%;display:inline-block;background:transparent;z-index:var(--z-index);margin:0;position:fixed;top:0;left:0}:host([direction="right"]){--final-translate-value:101%}:host([open]){transform:translateX(0%);animation:slide-in var(--delay) forwards;visibility:visible}:host(:not([open])){visibility:hidden;transform:translateX(var(--final-translate-value));animation:slide-out var(--delay) forwards}#cntr{background:var(--backpanel-backgound);width:100vw;height:100vh;overflow:hidden;display:grid;justify-content:center;align-items:center;grid-template-rows:min-content 1fr;grid-template-columns:1fr}#cntr.notitle{grid-template-rows:1fr;grid-template-columns:1fr}#title{display:block;background:#121212;color:#bbb;font-family:'Gill Sans','Gill Sans MT',Calibri,'Trebuchet MS',sans-serif;font-size:1.1em;font-weight:700;padding:.5em .75em;max-height:10vh;overflow-y:auto;z-index:calc(1 + var(--z-index))}#cntr.notitle #title{display:none}#btn_close{cursor:pointer;display:inline-flex;justify-content:space-around;align-items:center;gap:3em;padding:.5em;position:absolute;top:0;right:0;opacity:.75;border-radius:0 0 0 .5em;box-shadow:0 0 .25em 0 #000;transition:background 0.1s 0s ease-in-out,color 0.1s 0s ease-in-out,opacity 0.1s 0s ease-in-out;z-index:calc(2 + var(--z-index))}#btn_close>span{width:1em;height:1em}#btn_close svg{fill:#fff;stroke:#000;stroke-width:.5;width:100%;height:auto}#btn_close:hover{background:red;opacity:1}#btn_close:active{filter:brightness(.7)}#content{display:block;max-width:100%;max-height:calc(100% - 2 * var(--content-gap-around));overflow-y:auto;overflow-x:auto;background:#fff;color:#000;margin:var(--content-gap-around);padding:.75em 1em}:host([close-disabled]) #btn_close{display:none;pointer-events:none}
</style><div id="cntr" class="notitle"><div id="btn_close" part="close" title="Close"><span><svg part="close_svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23 20.2 14.8 12 23 3.8 20.2 1 12 9.2 3.8 1 1 3.8 9.2 12 1 20.2 3.8 23l8.2-8.2 8.2 8.2z" /></svg></span></div><div id="title" part="title"><slot name="title"></slot></div><div id="content" part="content"><slot>Hello</slot></div></div>`;
Object.freeze(PopUp);
customElements.define(PopUp._meta.tag, PopUp);