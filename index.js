/*jshint esnext: true */

// This module provides inline defined site translations.
// Usage: in your html/js/json files define your strings so that ## is a seperator and @en is a language selector.
// Example: ##@en English text ##@de Deutscher text ##@hu Magyar szöveg ##
// .. these will seperate english, german and hungarian versions of the file, only the relevant languages within the seperators will stay alive, the rest is dropped for a given language.
// ISC license, LaKing@D250.hu, 2017.

const fs = require('fs');

// should be two characters
const CHUNK_SEPERATOR = '##';
// shoule be one character
const LANGUAGE_PREFIX = '@';

// note, you need to load this module after the session is loaded in the app inicialization
module.exports = function(app, dir) {

    var language = {};

    // for now we use these as constants
    //const read_dir = app.locals.__dirname + '/source';
    //const lang_dir = app.locals.__dirname + '/locale';

    if (!dir) dir = app.locals.__dirname + '/public';
    const read_dir = dir;

    const lang_dir = '/tmp';

    // defaults, in case we dont have settings
    language.list = ['en', 'hu'];
    language.default = 'en';

    if (app.locals.settings) {
        if (!app.locals.settings.language) app.locals.settings.language = {};

        if (app.locals.settings.language.list) language.list = app.locals.settings.language.list;
        if (app.locals.settings.language.default) language.default = app.locals.settings.language.default;

        app.locals.settings.language.list = language.list;
        app.locals.settings.language.default = language.default;
    }

    // To allow /en uri as language choosing.
    function express_language_change_handler(lang) {
        app.get('/' + lang, function(req, res) {
            if (!req.session) console.log("ERROR req.session is undefined");
            else req.session.lang = lang;
            res.redirect('/');
        });
    }

    // we use this special server for the language-specific rendered files.
    function express_localized_file_handler(file) {
        app.get('/' + file, function(req, res) {
            var lang = language.get_by_req(req);
            res.sendFile(lang_dir + '/' + lang + '.' + file, function(err) {
                if (err) console.log('ERROR could not serve', lang, file);
                //console.log("serving:", lang_dir + '/' + lang + '.' + file);
            });
        });
    }

    // we need to process the sourcefile directory
    function process_language_source_directory(lang) {
        fs.readdir(read_dir, function(err, files) {
            if (err) throw err;
            files.forEach(function(file) {
                // we need to create the files
                language.render_file(lang, file);
            });
        });
    }

    // this iterates in all languages    
    language.create_change_handlers = function() {
        for (let l = 0; l < language.list.length; l++) {
            express_language_change_handler(language.list[l]);
            process_language_source_directory(language.list[l]);
        }
    };

    // this iterates in all the files    
    language.create_file_handlers = function() {
        fs.readdir(read_dir, function(err, files) {
            if (err) throw err;
            files.forEach(function(file) {
                express_localized_file_handler(file);
            });
        });
    };

    // we guess the language the user prefers ...
    // by default we choose the chosen language in a session variable
    language.get_by_req = function(req) {
        if (!req.session) {
            console.log("ERROR req.session is undefined");
            return language.default;
        }
        if (req.session.lang) return req.session.lang;
        // now guess what language to use
        var lang = language.default;
        if (req.session) req.session.lang = lang;

        // compare accepted languages with the language list
        var la = req.acceptsLanguages();
        for (var i = 0; i < la.length; i++) {
            for (var j = 0; j < language.list.length; j++) {
                if (la[i] === language.list[j]) {
                    // we found an accepted languade
                    lang = la[i];
                    if (req.session) req.session.lang = lang;
                    return lang;
                }
            }
        }
        // no match, we stay at the default.
        //console.log("language default", lang);
        return lang;
    };

    // for a given language, we need to process a given sourcefile
    language.render_file = function(lang, file) {
        fs.readFile(read_dir + '/' + file, 'utf8', function(err, data) {
            if (err) console.log(err);
            // create chunks array
            var ca = data.split(CHUNK_SEPERATOR);
            // resulting string will be here
            var r = '';
            // iterate through the chunks
            for (var i = 0; i < ca.length; i++) {
                // if this chunk starts with @ it is a language specific chunk
                if (ca[i].charAt(0) === LANGUAGE_PREFIX) {
                    // check if need to keep it, other
                    if (ca[i].substring(0, LANGUAGE_PREFIX.length + lang.length + 1) === LANGUAGE_PREFIX + lang + ' ') r += ca[i].substring(LANGUAGE_PREFIX.length + lang.length + 1, ca[i].length - 1);
                } else {
                    // if it is not a language specific chunk, we have to keep it
                    r += ca[i];
                }
            }
            // ok, content is ready to be written.
            fs.writeFile(lang_dir + '/' + lang + '.' + file, r, function(err) {
                if (err) return console.log(err);
                console.log("render", lang + '.' + file, "complete");
            });
        });
    };

    // transpile renders only all the source files
    // we can call the transpile function on every get request to / .. that way frontend development speeds up
    language.transpile = function(app) {
        for (let l = 0; l < language.list.length; l++) {
            process_language_source_directory(language.list[l]);
        }
    };

    // INIT EXPRESS LANGUAGES ==============================

    language.create_change_handlers();
    language.create_file_handlers();

    app.get('/', function(req, res, next) {
        if (app.locals.settings)
            if (app.locals.settings.debug) language.transpile(app);
        language.get_by_req(req);
        next();
    });

    return language;
};;