# site-language
Create multilingual sites in NodeJS with inline localisations.

## What is it good for?

You may want to have an express based website that speak two or three languages fluently. Sometime using the internalization packages is just an overkill.
With this package you can define your transtaltions inline, and use them seemlessly. It's a kind of magick. ...

### Prerequisites

This project requires express-session already set up and functional with a proper sessionstore.

Your best bet to install this package into your project would be:

```
npm install site-language --save
```
Another approach, in case you want to customize this script, let's say you want to put it into your app folder that contains your custom scripts.

```
curl https://raw.githubusercontent.com/LaKing/site-language/master/index.js > language.js

```

### Installing

Once installed, tell your express app to use it.

```
require('site-language')(app);
```


Or, if you have the script in your app folder
```
require('./app/language.js')(app);
```


And eventually, in case you use ejs, and want your index.html to contain the language meta tag you can add it to your routes and to your index.ejs:

```
app.get('/', function(req, res, next) {
    res.render('index.ejs', {
        lang: req.session.lang
    });
});

<html lang="<%= lang %>">

```

Changeing languges will be enabled by visiting the language code as uri
```
    https://example.com/en
    https://example.com/de
    https://example.com/hu

```

I assume you have all your public-html files in the public folder of the project. If not you may need to fine-tune the code.


## Usage

Once the thing is up and running, you can start to create your multilingual strings.
Let's say have a bold html text in your main.html file:

```
<b>Something as a language test.</b>

```
Now edit that line, and add the markup.

```
<b>##@en Something as a language test. ##@de Dies ist etwas für einen Sprachtest. ##@hu Valami teszt a nyelvek kipróbálására. ##</b>

```
That's it. Save it, and restart your project.
Or - if you want, you can speed up developemnt by
```javascript
// calling this on certain requests
language.transpile(app)

// setting this will call transpile on every / request
app.locals.settings.debug = true
```
You can do this in jour JS, JSON files, everywhere! (I suggest, to put the tags inside the strings) 

## How it works

When the module is initialized, the public folder is scanned, and each file is processed, that means it will be split into chunks by the '##' separator, and if the chunk starts with a '@' character, then it is assumed that it is some text subject to localisation.
For the given language code, the text is kept, all others all dropped. Simple. Once these files are rendered, they are saved in a /tmp folder and if the file is requested an express route is choosing a language based on req.session.lang, and serves the translated file.

## Do I need to define my languages and my default language?

You should. Look at this to get the idea:

```javascript
// defaults, in case we dont have settings
language.list = ['en', 'hu'];
language.default = 'en';

// create settings and language as objects and set these variables with some custom
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

* **István Király** - *All work* - [LaKing](https://github.com/LaKing)

## License

This project is licensed under the ISC License
