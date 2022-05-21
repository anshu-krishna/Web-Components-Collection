if (typeof customElements.get('side-bar') === 'undefined') {
	const __template__ = document.createElement('template');
	__template__.innerHTML = `<style>*{box-sizing:border-box}@keyframes slide-in{0%{visibility:visible;transform:translateX(var(--final-translate-value))}1%{visibility:visible;transform:translateX(var(--final-translate-value))}100%{visibility:visible;transform:translateX(0)}}@keyframes slide-out{0%{visibility:visible;transform:translateX(0)}99%{visibility:visible;transform:translateX(var(--final-translate-value))}100%{visibility:hidden;transform:translateX(var(--final-translate-value))}}:host{--z-index:500;--delay:0.15s;--final-translate-value:-101%;--title-background:#121212;display:grid;grid-template-columns:max-content 1fr;grid-template-areas:"bar overlay";z-index:var(--z-index);margin:0;position:fixed;top:0;left:0;width:100vw;height:100vh;color:#fff;visibility:hidden;transform:translateX(var(--final-translate-value))}:host([on-right]){--final-translate-value:101%;grid-template-columns:1fr max-content;grid-template-areas:"overlay bar"}:host([open]){transform:translateX(0);animation:slide-in var(--delay) forwards;visibility:visible}#bar{grid-area:bar;background:#212121;width:20em;max-width:70vw;display:grid;grid-template-rows:min-content 1fr;height:100vh;overflow:hidden}#overlay{grid-area:overlay;background:linear-gradient(to right,rgba(0,0,0,.75) 0,rgba(0,0,0,.5) 100%);padding:0;cursor:pointer}:host([disable-overlay-close]) #overlay{cursor:default}#title_cntr{display:grid;align-items:center;justify-content:center;position:relative;background:var(--title-background)}#close{display:inline-block;position:absolute;top:0;right:0;font-family:'Courier New',Courier,monospace;padding:.3em;cursor:pointer;font-size:1.1em;line-height:1em;border-radius:0 0 0 .3em;text-shadow:0 0 3px #000;opacity:.5;color:#fff;transition:opacity ease-in-out .1s;z-index:calc(1+ var(--z-index))}#close:hover{opacity:1;background:red;text-shadow:none;box-shadow:0 0 3px #000}#close:active{filter:brightness(.7)}:host([on-right]) #close{right:auto;left:0;border-radius:0 0 .3em 0}:host([hide-close-button]) #close{display:none}#content{overflow-y:auto} </style><div part="bar" id="bar"><div id="title_cntr"><span part="close" id="close">&#128473;</span><slot name="title"></slot></div><div id="content"><slot></slot></div></div><div part="overlay" id="overlay"></div>`;

	class SideBar extends HTMLElement {
		static #click_event_handler(e) {
			e.preventDefault();
			e.stopPropagation();
			this.open = false;
		}
		#nodes = {};
		#bound_click_event_handler;
		#not_init = true;

		constructor() {
			super();
			this.#nodes.root = this.attachShadow({ mode: 'closed' });
			this.#nodes.root.appendChild(__template__.content.cloneNode(true));
			this.#nodes.close = this.#nodes.root.querySelector('#close');
			this.#nodes.overlay = this.#nodes.root.querySelector('#overlay');

			this.#bound_click_event_handler = SideBar.#click_event_handler.bind(this);
			this.#nodes.close.addEventListener('click', this.#bound_click_event_handler);
			this.#nodes.overlay.addEventListener('click', this.#bound_click_event_handler);
		}
		get open() { return this.hasAttribute('open'); }
		set open(val) {
			if(val) { this.setAttribute('open', ''); }
			else { this.removeAttribute('open'); }
		}
		show() { this.open = true; }
		hide() { this.open = false; }
		// connectedCallback() {}
		// disconnectedCallback() {}
		// adoptedCallback() {}

		static get observedAttributes() {
			return ['open', 'disable-overlay-close'];
		}
		attributeChangedCallback(attrName, oldVal, newVal) {
			if(oldVal === newVal) { return; }
			// console.log('Attr:', attrName, '; From:', oldVal, '; To:', newVal, '; In:', this);
			switch(attrName) {
				case 'open':
					if(newVal === null) {
						if(this.#not_init) {
							this.#nodes.root.appendChild(document.createElement('style')).innerHTML = `:host(:not([open])) { animation: slide-out var(--delay) forwards; }`;
							this.#not_init = false;
						}
						this.dispatchEvent(new Event('close'));
						this.dispatchEvent(new Event('toggle'));
					} else {
						this.dispatchEvent(new Event('open'));
						this.dispatchEvent(new Event('toggle'));
					}
					break;
				case 'disable-overlay-close':
					if(newVal === null) {
						this.#nodes.overlay.addEventListener('click', this.#bound_click_event_handler);
					} else {
						this.#nodes.overlay.removeEventListener('click', this.#bound_click_event_handler);
					}
					break
			}
		}
	}

	customElements.define('side-bar', SideBar);
}