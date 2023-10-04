class PagedTable extends HTMLTableElement {
	get maxRows() {
		let val = this.getAttribute("maxrows");
		if (val === null) {
			return this._default.maxRows;
		}
		return parseInt(val);
	}
	set maxRows(val) {
		if (val === null) {
			this.removeAttribute("maxrows");
			return;
		}
		this.setAttribute("maxrows", parseInt(val));
	}
	get showPage() {
		let val = this.getAttribute("showpage");
		if (val === null) {
			return this._default.showPage;
		}
		return parseInt(val);
	}
	set showPage(val) {
		if (val === null) {
			this.removeAttribute("showpage");
			return;
		}
		this.setAttribute("showpage", parseInt(val));
	}
	constructor() {
		super();
		this._default = { maxRows: 10, showPage: 1 };
		this._pageSelectors = [];
		this._observer = new MutationObserver((mutlist) => {
			// console.log(mutlist);
			this._setView();
		});
	}
	addPageSelector(element) {
		if (element instanceof TablePageSelector) {
			this._pageSelectors.push(element);
			element.pages = this.pageCount;
			element.view = this.showPage;
			// console.log("Selectors", this._pageSelectors);
		} else {
			console.error(element, "is not a PageSelector element");
		}
	}
	removePageSelector(element) {
		let index = this._pageSelectors.indexOf(element);
		(index > -1) && this._pageSelectors.splice(index, 1);
		// console.log("Selectors", this._pageSelectors);
	}
	connectedCallback() {
		this._observer.observe(this, { childList: true, subtree: true });
	}
	disconnectedCallback() {
		this._observer.disconnect();
	}
	// adoptedCallback() {}
	static _chunkArray(myArray, chunk_size) {
		let results = [];
		while (myArray.length) {
			results.push(myArray.splice(0, chunk_size));
		}
		return results;
	}
	get pageCount() {
		let rows = Array.prototype.slice.call(this.querySelectorAll("tr"));
		if (rows.length == 0) return 0;
		let pages = PagedTable._chunkArray(rows, this.maxRows);
		return pages.length;
	}
	_setView() {
		let rows;
		let body = this.querySelector("tbody");
		if(body) {
			rows = Array.prototype.slice.call(body.querySelectorAll("tr"));
		} else {
			rows = Array.prototype.slice.call(this.querySelectorAll("tr"));
		}
		
		if (rows.length == 0) return;
		let pages = PagedTable._chunkArray(rows, this.maxRows);
		let plen = pages.length;
		let index = (this.showPage - 1) % plen;
		// console.log("Index", index);
		for (let i = plen - 1; i >= 0; i--) {
			if (i == index) {
				for (let r of pages[i]) {
					r.style.display = null;//"table-row";
				}
			} else {
				for (let r of pages[i]) {
					r.style.display = "none";
				}
			}
		}
		/**************************************************/
		if (this._pageSelectors.length == 0) return;
		{
			let pc = this.pageCount, v = this.showPage;
			for (let ps of this._pageSelectors) {
				ps.setAttribute("pages", pc);
				ps.setAttribute("view", v);
			}
		}
	}
	static get observedAttributes() {
		return ["maxrows", "showpage"];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		if (name == "maxrows") { this.showPage = 1; return; }
		this._setView();
	}
}
customElements.define("paged-table", PagedTable, {
	extends: "table"
});
/**********************************************************************************/
class TablePageSelector extends HTMLElement {
	constructor() {
		super();
		this._default = { pages: 1, view: 1 };
		this._registerdTo = null;
	}
	connectedCallback() {
		this._genButtons();
	}
	disconnectedCallback() {
		this._registerdTo !== null && this._registerdTo.removePageSelector(this);
	}
	// adoptedCallback() {}
	_genButtons() {
		this.innerHTML = "";
		if (this._registerdTo === null) return;
		if (this.pages == 0) return;
		let pc = this.pages;
		let v = this.view;
		if (pc) {
			for (let i = 1; i <= pc; i++) {
				let btn = document.createElement("button");
				btn.innerHTML = i;
				btn.onclick = (e) => {
					this._registerdTo.showPage = i;
				};
				if (i == v) {
					btn.setAttribute("selected", "");
				} else if (i < v) {
					btn.setAttribute("position", `before-selected-${v - i}`);
				} else {
					btn.setAttribute("position", `after-selected-${i - v}`);
				}
				this.appendChild(btn);
			}
		}
	}
	get pages() {
		let val = this.getAttribute("pages");
		if (val === null) {
			return this._default.pages;
		}
		return parseInt(val);
	}
	set pages(val) {
		if (val === null) {
			this.removeAttribute("pages");
			return;
		}
		this.setAttribute("pages", parseInt(val));
	}
	get view() {
		let val = this.getAttribute("view");
		if (val === null) {
			return this._default.view;
		}
		return parseInt(val);
	}
	set view(val) {
		if (val === null) {
			this.removeAttribute("view");
			return;
		}
		this.setAttribute("view", parseInt(val));
	}
	get forId() {
		return this.getAttribute("for");
	}
	set forId(val) {
		if (val === null) {
			this.removeAttribute("for");
			return;
		}
		this.setAttribute("for", val);
	}
	static get observedAttributes() {
		return ["for", "view", "pages"];
	}
	attributeChangedCallback(name, oldval, newval) {
		// console.log("Changed", name, ":", oldval, "->", newval);
		switch (name) {
			case "for":
				if (newval === null) {
					this._registerdTo !== null && this._registerdTo.removePageSelector(this);
					this._registerdTo = null;
					return;
				}
				let table = document.getElementById(newval);
				if (table instanceof PagedTable) {
					table.addPageSelector(this);
					this._registerdTo = table;
				}
				break;
			case "view":
				if (parseInt(oldval) == parseInt(newval)) {
					return;
				}
				if (!(newval !== null && this.view > 0 && this.view <= this.pages)) {
					this.view = null;
					return;
				}
				break;
			case "pages":
				if (parseInt(oldval) == parseInt(newval)) {
					return;
				}
				if (!(newval !== null && this.pages > 0)) {
					this.pages = null;
					return;
				}
				break;
		}
		this._genButtons();
	}
}
customElements.define("table-page-selector", TablePageSelector);