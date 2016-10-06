"use strict";

let get = require('request-promise');
let cheerio = require('cheerio');

class Team {
    constructor(name, rank, points, rank_change, players) {
        /* @type {string} */
        this.name = name;
        /* @type {number} */
        this.rank = rank;
        /* @type {number} */
        this.points = points;
        /* @type {number} */
        this.rank_change = rank_change;
        /* @type {string[]} */
        this.players = players;
    }
}

/**
 *
 * @param {string} str
 */
function stringToInt(str) {
    return parseInt(str.replace(/[^0-9\.]/g, ''), 10);
}

/**
 * @name ParseReturnObj
 * @property {Date} date
 * @property {Team[]} teams
 */

/**
 * Returns parsed HLTV Rankings page
 *
 * @param {string} url
 * @returns {Promise<ParseReturnObj>}
 */
let parseURL = function(url) {
    return get(url)
        .then(function(html) {
            let $ = cheerio.load(html);

            let date = $('.centerFade h1').text().split('- ')[1];
            let teams = [];

            let teamBoxes = $('.framedBox.ranking-box');
            teamBoxes.each(function() {
                let team = {};
                team.name = $(this).find('.ranking-teamName > a').text();
                team.rank = stringToInt($(this).find('.ranking-number').text());
                team.points = stringToInt($(this).find('.ranking-teamName > span').text());
                team.rank_change = (function() {
                    let score = $(this).find('.ranking-delta').text();
                    if (score === '-') return 0;
                    if (score.indexOf('+') > -1) return stringToInt(score);
                    if (score.indexOf('-') > -1) return -stringToInt(score);
                }).call(this);

                team.players = (function(el) {
                    let players = [];
                    el.each(function() {
                        players.push($(this).text().replace(/ /g, ''));
                    });
                    return players;
                })($(this).find('.ranking-playerNick'));

                teams.push(new Team(team.name, team.rank, team.points, team.rank_change, team.players));
            });

            return {
                date: date,
                teams: teams
            }
        });
};

module.exports = parseURL;
