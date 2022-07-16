# Lazy-Image Customized built-in element
Lazy-Image is a customized built-in image element that loads the image lazily.
This means that the image is only loaded when it becomes visible. This will reduce the *time to load* for the page. Futhermore it will save bandwidth by never loading images that are not viewed.

### Usage:
Use a img element with the attribute ***is="lazy-image"*** and the image source specified with the ***lazy-src*** attribute.
```html
<img is="lazy-image" lazy-src="path_to_image.jpg" />
```
For lazy loading the image path **must** be specified using the ***lazy-src*** attribute.
If the image path is specified using the *src* attribute then it is loaded in the normal way.
