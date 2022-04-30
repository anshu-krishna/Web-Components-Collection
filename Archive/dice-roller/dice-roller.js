class DiceRoller extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(DiceRoller.__template.content.cloneNode(true));
		Object.defineProperties(this, {
			"__value": {value: 1, writable: true},
			"__cntr": {value: this.shadowRoot.getElementById('cntr')},
			"__setImage": {value: (value) => {
				this.__cntr.innerHTML = DiceRoller.__imgs[value - 1];
			}},
			"__setImageAnimate": {value : (value) => {
				let counter = 0;
				this.__cntr.classList.add('noclick');
				let id = setInterval(() => {
					if(counter < 10) {
						counter++;
						this.__setImage(DiceRoller.__rand);
					} else {
						clearInterval(id);
						this.__cntr.classList.remove('noclick');
						this.__setImage(value);
						this.dispatchEvent(new Event('change'));
					}
				}, 50);
			}}
		});
		this.__cntr.addEventListener('click', () => {
			this.value = DiceRoller.__rand;
		});
	}
	static get observedAttributes() {
		return ['value'];
	}
	connectedCallback() {
		this.value = this.hasAttribute('value') ? this.getAttribute('value') : 1;
	}
	// disconnectedCallback() {}
	set value(val) {
		this.setAttribute('value', val);
	}
	get value() {
		return this.__value;
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		let val = parseInt(newVal);
		if(isNaN(val)) {val = 1};
		val = ((val-1) % 6) + 1;
		this.__value = val;
		this.__setImageAnimate(val);
	}
	// adoptedCallback() {}
}
Object.defineProperties(DiceRoller, {
	"__tag" : {
		writable: true,
		value: "dice-roller"
	},
	"__template" : {
		value: document.createElement('template')
	},
	"__rand" : {
		get: () => (Math.floor(Math.random() * 1000) % 6) + 1
	},
	__imgs : {value: [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="touch-action: none;" transform="translate(0,0)"><path d="M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zM256 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100z" fill="var(--color)" fill-opacity="var(--opacity)"></path></g></svg>`,
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="touch-action: none;" transform="translate(0,0)"><path d="M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm316.97 36.03A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm-268 268A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z" fill="var(--color)" fill-opacity="var(--opacity)"></path></g></svg>`,
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="touch-action: none;" transform="translate(0,0)"><path d="M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm316.97 36.03A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zM256 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100zM123.47 340.03A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z" fill="var(--color)" fill-opacity="var(--opacity)"></path></g></svg>`,
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="touch-action: none;" transform="translate(0,0)"><path d="M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm48.97 36.03A50 50 0 0 1 172 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm-268 268A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z" fill="var(--color)" fill-opacity="var(--opacity)"></path></g></svg>`,
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="touch-action: none;" transform="translate(0,0)"><path d="M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm48.97 36.03A50 50 0 0 1 172 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zM256 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100zM123.47 340.03A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z" fill="var(--color)" fill-opacity="var(--opacity)"></path></g></svg>`,
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="touch-action: none;" transform="translate(0,0)"><path d="M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm48.97 36.03A50 50 0 0 1 172 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zM122 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100zm268 0a50 50 0 0 1 0 100 50 50 0 0 1 0-100zM123.47 340.03A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z" fill="var(--color)" fill-opacity="var(--opacity)"></path></g></svg>`
	]}
});
DiceRoller.__template.innerHTML = `<style>
:host {
	--color: currentColor;
	--opacity: 1;
	display: inline-block;
	width: 1em;
	height: 1em;
	padding: 0;
}
svg {
	margin: 0;
	width: 1em;
}
#cntr {
	cursor: pointer;
}
.noclick {
	--opacity: 0.7;
	cursor: initial !important;
	pointer-events: none;
}
</style><div id="cntr"></div>`;
customElements.define(DiceRoller.__tag, DiceRoller);