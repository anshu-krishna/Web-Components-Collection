# SideBar Web Component

### Attributes:

- `open` : side-bar is visible when open is present
- `on-right` : side-bar is on the right side when on-right is present
- `hide-close-button` : side-bar close button is hidden when hide-close-button is present
- `disable-overlay-close` : side-bar will not close by clicking the overlay if disable-overlay-close is present

### Events:

- `open` : Dispatched when side-bar is opened
- `close` : Dispatched when side-bar is closed
- `toggle` : Dispatched when side-bar is opened/closed

### Properties:

- `open` : [getter/setter] When true side-bar is open

### Methods:

- `show()` : When called side-bar is opened
- `hide()` : When called side-bar is closed

### Component Parts:

- `bar` : Use for styling the content side of side-bar
- `overlay` : Use for styling the overlay side of side-bar
- `close` : Use for styling the close button of side-bar

### CSS Variables:

- `--z-index` : Default value 500;
- `--delay` : Default value 0.15s;
- `--title-background` : Default value #121212;

### Example:
```html
<style>
	side-bar { --title-background: white; --delay: 0.5s; }
	side-bar::part(bar) { background: white; color: black; font-size: 1.2em; width: 40vw; }
	side-bar::part(overlay) { background: linear-gradient(to right, rgba(0,0,255,0.5) 0%,rgba(0,0,0,0.25) 100%); }
	side-bar::part(close):hover { background: #99f; }
</style>
<side-bar open>
	<strong slot="title">
		This is title
	</strong>
	<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda at maiores, reprehenderit totam architecto eius? Perspiciatis libero quae velit beatae est nisi architecto. Doloribus obcaecati unde quis consectetur eaque assumenda officia deleniti id eveniet omnis animi explicabo voluptatibus perferendis, beatae nam esse ullam maiores molestias doloremque impedit aperiam ducimus! Accusantium neque officia iure illo quas cumque consequuntur pariatur.</div>
</side-bar>
```