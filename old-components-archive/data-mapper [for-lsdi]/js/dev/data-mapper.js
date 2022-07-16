import './format-table.js';
import {is2DArray} from './data-preview.js';
import {FormatFuncs} from './format-funcs.js';

const FuncList = Object.keys(FormatFuncs);

class DataMapper extends HTMLElement {
	static _meta = {
		tag: 'data-mapper',
		template: document.createElement('template')
	};
	#root; #nodes; #ipHead; #opHead; #data;
	#rowSize; #rowCount;
	#maxPreviewLen; #previewLen;
	#allowEmpty; #allowConstant;
	#allowStrOutputOnly;
	#formatters = [];

	constructor() {
		super();
		this.#root = this.attachShadow({mode: 'closed'});
		this.#root.appendChild(DataMapper._meta.template.content.cloneNode(true));
		this.#nodes = {
			ip: this.#root.querySelector('data-preview'),
			format: this.#root.querySelector('format-table'),
			op: this.#root.querySelector('data-preview:nth-of-type(2)')
		};
	}
	setData({
		inputHead = [],
		data = [],
		outputHead = [],
		maxPreviewLen = 10,
		allowEmpty = true,
		allowConstant = true,
		allowStrOutputOnly = false
	} = {}) {
		let isValid = true;
		if(Array.isArray(inputHead) && Array.isArray(outputHead)) {
			const rowSize = inputHead.length;
			if(!is2DArray(data, rowSize)) {
				isValid = false;
			}
		} else {
			isValid = false;
		}
		if(!isValid) {
			console.error('Invalid data');
			return;
		}
		this.#ipHead = inputHead;
		this.#data = data;
		this.#opHead = outputHead;
		this.#maxPreviewLen = maxPreviewLen;
		this.#rowSize = this.#ipHead.length;
		this.#rowCount = this.#data.length;

		this.#previewLen = (this.#maxPreviewLen < this.#rowCount) ? this.#maxPreviewLen : this.#rowCount;
		this.#allowConstant = allowConstant;
		this.#allowEmpty = allowEmpty;

		this.#nodes.ip.setData({
			title: "Input Preview",
			showColIdx: true,
			head: this.#ipHead,
			data: this.#data.slice(0, this.#previewLen)
		});
		this.#nodes.format.columns = this.#opHead;
		this.#nodes.op.setData({
			title: "Output Preview",
			head: this.#opHead,
			data: ((row, col) => {
				const ret = [];
				let onerow = [];
				for(let i=0; i<col; i++) {
					onerow.push('');
					this.#formatters.push([]);
				}
				for(let j=0; j<row; j++) {
					ret.push([...onerow]);
				}
				return ret;
			})(this.#previewLen, this.#opHead.length)
		});
		this.#nodes.format.addEventListener('change', ({
			detail: {forCol, format}
		}) => {
			if(format === null) {
				this.#formatters[forCol] = undefined;
			} else {
				if(format.length === 0 && !this.#allowEmpty) {
					this.#nodes.format.popupError('Formatter is required', forCol);
					this.#formatters[forCol] = undefined;
					return;
				}
				if(format.length === 1 && format[0].ty === 'txt' && !this.#allowConstant) {
					this.#nodes.format.popupError('Only constant value is not allowed', forCol);
					this.#formatters[forCol] = undefined;
					return;
				}
				const ipHeadLen = this.#ipHead.length;
				for(let item of format) {
					if(item.ty === 'exp') {
						if(typeof item.col !== 'number') {
							const idx = this.#ipHead.indexOf(item.col);
							if(idx === -1) {
								this.#nodes.format.popupError(`Unknown column {${item.col}}`, forCol);
								this.#formatters[forCol] = undefined;
								return;
							} else {
								item.col = idx;
							}
						} else {
							if(ipHeadLen <= item.col || item.col < 0) {
								this.#nodes.format.popupError(`Unknown column {${item.col}}`, forCol);
									this.#formatters[forCol] = undefined;
									return;
							}
						}
						for(const {func} of item.maps) {
							if(!FuncList.includes(func)) {
								this.#nodes.format.popupError(`Unknown mapper used: '${func}'`, forCol);
								this.#formatters[forCol] = undefined;
								return;
							}
						}
					}
				}

				this.#formatters[forCol] = format;
				this.#nodes.op.updateCol(forCol, this.#mapOpPreviewCol(format, this.#previewLen));
			}
		})
	}
	#mapOpPreviewCol(format, max = null) {
		max ??= this.#rowCount;
		const colValues = [];
		for(let ri = 0; ri < max; ri++) {
			colValues.push(this.#formatData(this.#data[ri], format));
		}
		return colValues;
	}
	#formatData(row, format) {
		const retVal = [];
		for(const f of format) {
			switch (f.ty) {
				case 'txt':
					retVal.push(f.val);
					break;
				case 'exp':
					let val = row[f.col];
					for(const m of f.maps) {
						val = FormatFuncs[m.func](val, ...m.args);
					}
					retVal.push(val);
					break;
				default: break;
			}
		}
		if(!this.#allowStrOutputOnly && retVal.length === 1) {
			return retVal[0];
		}
		return retVal.join('');
	}
	async getFormattedData() {
		for(let col = 0; col < this.#opHead.length; col++) {
			const formatter = this.#formatters[col];
			if(typeof formatter === 'undefined') {
				this.#nodes.format.popupError('Please define a correct formatter for this column', col);
				return null;
			}
			if(formatter.length === 0 && !this.#allowEmpty) {
				this.#nodes.format.popupError('Formatter is required', col);
				return null;
			}
			if(formatter.length === 1 && formatter[0].ty === 'txt' && !this.#allowConstant) {
				this.#nodes.format.popupError('Only constant value is not allowed', col);
				return null;
			}
		}
		const opRowSize = this.#opHead.length;
		const table = [];
		for(const row of this.#data) {
			const formmattedRow = [];
			for(let ci = 0; ci < opRowSize; ci++) {
				formmattedRow.push(this.#formatData(row, this.#formatters[ci]));
			}
			table.push(formmattedRow);
		}
		return {
			head: this.#opHead,
			data: table
		};
	}
	// connectedCallback() {}
	// disconnectedCallback() {}
	// adoptedCallback() {}

	// static get observedAttributes() {
	// 	return [];
	// }
	// attributeChangedCallback(attrName, oldVal, newVal) {}
}
DataMapper._meta.template.innerHTML = await fetch(String(new URL(import.meta.url + '/../data-mapper.html'))).then(html => html.text());
Object.freeze(DataMapper);
customElements.define(DataMapper._meta.tag, DataMapper);