# Tab-Components
This library provides three *customElements* that together can create a tabbed UI.

#### CustomElements:
- *\<tab-container\>*

	This element is a container for **one** *\<tab-headers\>* element and **one** *\<tab-sections\>* element.
- *\<tab-headers\>*

	This element is a container for **one or more** *\<header\>* elements.
- *\<tab-sections\>*

	This element is a container for **one or more** *\<section\>* elements.

#### Attributes:
- selected

	Specifies which tab is active. *\<tab-headers\>* and *\<tab-sections\>* both support this attribute, but user should assign/manipulate this attribute **only in** *\<tag-headers\>*. *selected* is **0-indexed**.

#### Events:
- change

	*\<tab-container\>* emits '*change*' event whenever a different tab is selected. '*event.detail*' specifies the index of selected tab.

#### Examples:
```html
<tab-container>
	<tab-headers>
		<header>1</header>
		<header>2</header>
		<header>3</header>
		<header>4</header>
	</tab-headers>
	<tab-sections>
		<section>One</section>
		<section>Two</section>
		<section>Three</section>
		<section>Four</section>
	</tab-sections>
</tab-container>
```
```html
<tab-container>
	<tab-headers selected="4">
		<header>A</header>
		<header>B</header>
		<header>C</header>
		<header>D</header>
		<header>E</header>
	</tab-headers>
	<tab-sections>
		<section>Apple</section>
		<section>Ball</section>
		<section>Cat</section>
		<section>Dog</section>
		<section>Elephant</section>
	</tab-sections>
</tab-container>
```