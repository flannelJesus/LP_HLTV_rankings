"use strict";

let get = require('request-promise');
let cheerio = require('cheerio');

let parseURL = function(url) {
    return get(url)
        .then(function(html) {
            let $ = cheerio.load(html);
            let urls = [];
            $('.tab_groups >:last-child .tab_group3 a').each(function(){
                urls.push($(this).attr('href'));
            });

            return urls;
        })
};

module.exports = parseURL;