class LazyImage extends HTMLImageElement {
	static __list_add(node) {
		LazyImage.__list.add(node);
		if (!LazyImage.__listener_active) {
			document.addEventListener("scroll", LazyImage.__lazy_loader);
			window.addEventListener("resize", LazyImage.__lazy_loader);
			window.addEventListener("orientationchange", LazyImage.__lazy_loader);
			LazyImage.__listener_active = true;
		}
	}
	static __list_remove(node) {
		LazyImage.__list.delete(node);
		if (LazyImage.__list.size == 0) {
			document.removeEventListener("scroll", LazyImage.__lazy_loader);
			window.removeEventListener("resize", LazyImage.__lazy_loader);
			window.removeEventListener("orientationchange", LazyImage.__lazy_loader);
			LazyImage.__listener_active = false;
		}
	}
	static __lazy_loader() {
		let remove = [];
		for (let image of LazyImage.__list) {
			if (image.__is_visible) {
				image.__set_src(true);
				remove.push(image);
			}
		}
		for (let i of remove) {
			LazyImage.__list.delete(i);
		}
	}
	constructor() {
		super();
	}
	get __is_visible() {
		let rect = this.getBoundingClientRect();
		return (rect.top <= window.innerHeight && rect.bottom >= 0) && (getComputedStyle(this).display !== "none");
	}
	connectedCallback() {
		if (document.readyState === 'complete') {
			this.__set_src();
		} else {
			let onDocLoad = (() => {
				document.removeEventListener('DOMContentLoaded', onDocLoad);
				this.__set_src();
			}).bind(this);
			document.addEventListener('DOMContentLoaded', onDocLoad);
		}
	}
	__set_src(force_now = false) {
		if (force_now === true || this.__is_visible) {
			LazyImage.__list_remove(this);
			let src = this.getAttribute('lazy-src');
			if (src !== null) {
				this.setAttribute('src', src);
			}
		} else {
			LazyImage.__list_add(this);
		}
	}
	disconnectedCallback() {
		LazyImage.__list_remove(this);
	}
	// adoptedCallback() {}
	// static get observedAttributes() {}
	// attributeChangedCallback(name, oldval, newval) {
	//	console.log("Changed", name, ":", oldval, "->", newval);
	//}
}
LazyImage.__list = new Set;
LazyImage.__listener_active = false;
customElements.define("lazy-image", LazyImage, { extends: 'img' });