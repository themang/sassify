# desassify #

Simple middleware and method for Browserify to add [Sass](http://sass-lang.com) styles to the browser.


# Example

If you have a file `entry.js` that you want to require some css from `style.scss`:

style.scss:
``` css
body {
  background: pink;
}
```

entry.js:
``` js
require('./style.scss');

console.log('The background is pink!')
```

Or indented Sass syntax may be used with the `.sass` extension:
``` js
require('./style.sass');
```

Install sassify into your app:

```
$ npm install desassify
```

When you compile your app, just pass `-t sassify` to browserify:

```
$ browserify -t desassify entry.js > bundle.js
```

## Imports

Sass allows one to `@import` other Sass files. This module synchronously imports those dependencies at the time of the bundling. It looks for the imported files in both the directory of the parent file and the folder where the module itself lives, so it should work so long as the paths in the `@import` commands are correct relative to the importing file, as usual. It is not currently tested for recursive importing.

# Install

[![sassify](https://nodei.co/npm/sassify.png?mini=true)](https://nodei.co/npm/sassify)

# License

MIT

