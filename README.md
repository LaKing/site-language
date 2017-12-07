# site-language
Create multilingual sites in NodeJS with inline localisations.

## What is it good for?

You may want to have an express based website that speaks two or three languages fluently. Sometime using the internalization packages is just an overkill.
With this package you can define your transtaltions inline, and use them seemlessly. It's a kind of magick. ...

### Prerequisites

This project requires express-session already set up and functional with a proper sessionstore.

Your best bet to install this package into your project would be:

```bash
npm install site-language --save
```
Another approach, in case you want to customize this script, let's say you want to put it into your app folder that contains your custom scripts.

```bash
curl https://raw.githubusercontent.com/LaKing/site-language/master/index.js > app/language.js

```

### Installing

Once installed, tell your express app to use the public folder as source for localisations.

```javascript
require('site-language')(app, 'public');
// or if you got the code in your app fodler
require('./app/language.js')(app, 'public');
```
Note that this command will make the files in that folder visible to the web - you don't need to use express.static on that folder.

The session will contain lang as variable.
So eventually, in case you use ejs, and want your index.html to contain the language meta tag you can add it to your routes and to your index.ejs:

```javascript
app.get('/', function(req, res, next) {
    res.render('index.ejs', {
        lang: req.session.lang
    });
});

<html lang="<%= lang %>">

```

Changing languges will be enabled by visiting the language code as uri - this will set the session.lang variable, and redirect to the site root..
```
    https://example.com/en
    https://example.com/hu

```

## Usage

Once the thing is up and running, you can start to create your multilingual strings.
You can do this in jour HTML, JS, JSON files, everywhere! (I suggest, to put the tags inside the strings) 
Let's say have a bold HTML text in your main.html file:

```html
<b>Something as a language test.</b>

```
Now edit that line, and add the markup.

```html
<b>##@en Something as a language test. ##@hu Valami teszt a nyelvek kipróbálására. ##</b>

```
That's it. Save it, and restart your project.
Or - if you want, you can speed up developemnt by
```javascript
// calling this on certain requests
language.transpile(app)

// setting this will call transpile on every / request
app.locals.settings.debug = true
```
## How it works

When the module is initialized, the public folder is scanned, and each file is processed, that means it will be split into chunks by the ## separator, and if the chunk starts with a @ character, then it is assumed that it is some text subject to localisation.
For the given language code, the text is kept, all others all dropped. Simple. Once these files are rendered, they are saved in a /tmp folder and if the file is requested an express route is choosing a language based on req.session.lang, and serves the translated file.

## Do I need to define my languages and my default language?

You should. Look at this to get the idea:

```javascript
// defaults, in case we dont have settings
language.list = ['en', 'hu'];
language.default = 'en';

// create settings and language as objects and set these variables with some custom values
app.locals.settings.language.list
app.locals.settings.language.default

```
Or just edit the file if you want to have everything customized.

## Deployment

Dont just drop this to a live system, I'm not sure if its bug-free. However the code is just 160 lines, and I commented it as good as possible.

## Built With

[ep-codepad](http://codepad.etherpad.org/)

## Contributing

Feel free to open issues.

## Authors

* **István Király** - [LaKing](https://github.com/LaKing)

## License

This project is licensed under the ISC License

## Notice

This module enables also special comments. These comments wont appear in the rendered files, thus won't be visible in browsers.
```
##@-- This is a comment, as it does not relate to any language ##
```
