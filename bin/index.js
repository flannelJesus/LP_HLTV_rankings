"use strict";

let get_rankings = require('./get-rankings'),
    get_ranking_dates = require('./get-ranking-dates'),
    fs = require('fs'),
    path = require('path');

let start_date = new Date(2015, 9, 1); // October 1 2015
let end_date = new Date(2017, 1, 1);
let cur_date = new Date(start_date);
let dates_to_get = [];

while (cur_date < end_date) {
    dates_to_get.push(new Date(cur_date));
    cur_date.setMonth(cur_date.getMonth() + 1);
}

/**
 * @param {Date} date
 */
function convertDateToLink(date) {
    let monthName = date.toLocaleDateString('en-gb', {month: 'long'});
    let year = date.getFullYear();
    let date_num = date.getDate();
    return `http://www.hltv.org/ranking/teams/${year}/${monthName}/${date_num}/`;
}

var allDatePromises = [];

console.log('getting dates');
dates_to_get.map(convertDateToLink).forEach(function(url) {
    allDatePromises.push(get_ranking_dates(url));
});

Promise.all(allDatePromises)
    .then(function(results) {
        console.log('done getting dates');
        return results.reduce(function(a, b) {
            return a.concat(b)
        });
    })
    .then(function(ranking_urls) {
        var get_promises = [];

        ranking_urls.map(function(suffix) {
            return `http://www.hltv.org${suffix}`
        }).forEach(function(url, index) {
            let get = get_rankings(url);
            get_promises.push(get);
            get.then(function() {
                console.log(`got ${index} of ${ranking_urls.length}`)
            }).catch(function() {
                console.log(`missed ${index}, ${url}`);
            })
        });

        return Promise.all(get_promises);
    })
    .then(function(results) {
        console.log('done');
        fs.writeFileSync(path.join(__dirname, './output.json'), JSON.stringify(results));
    })
    .catch(function(err) {
        console.log(err);
    });
