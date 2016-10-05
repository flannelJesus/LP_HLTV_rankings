"use strict";

let get = require('request-promise');
let cheerio = require('cheerio');

/**
 *
 * @param {string} str
 */
function stringToInt(str) {
    return parseInt(str.replace(/[^0-9\.]/g, ''), 10);
}

get('http://www.hltv.org/ranking/teams/')
    .then(function (html) {
        let $ = cheerio.load(html);

        let date = $('.centerFade h1').text().split('- ')[1];
        let teams = [];

        let teamBoxes = $('.framedBox.ranking-box');
        teamBoxes.each(function () {
            let team = {};
            team.name = $(this).find('.ranking-teamName > a').text();
            team.rank = stringToInt($(this).find('.ranking-number').text());
            team.points = stringToInt($(this).find('.ranking-teamName > span').text());
             team.rank_change = (function () {
                let score = $(this).find('.ranking-delta').text();
                if (score === '-') return 0;
                if (score.indexOf('+') > -1) return stringToInt(score);
                if (score.indexOf('-') > -1) return -stringToInt(score);
            }).call(this);

            team.players = (function(el){
                let players = [];
                el.each(function(){
                    players.push($(this).text().replace(/ /g,''));
                });
                return players;
            })($(this).find('.ranking-playerNick'));

            teams.push(team);
        })
    });
