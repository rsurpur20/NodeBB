"use strict";
// 'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const xml = require('xml');
// const nconf = require('nconf');
const xml_1 = __importDefault(require("xml"));
const nconf_1 = __importDefault(require("nconf"));
const plugins_1 = __importDefault(require("../plugins"));
// import meta from '../meta';
const configs_1 = __importDefault(require("../meta/configs"));
// module.exports.handle = function (req: Request, res: Response, next: NextFunction) : void {
//     if (plugins.hooks.hasListeners('filter:search.query')) {
//         res.type('application/opensearchdescription+xml').send(generateXML());
//     } else {
//         next();
//     }
// };
function trimToLength(string, length) {
    return string.trim().substring(0, length).trim();
}
function generateXML() {
    return (0, xml_1.default)([{
            OpenSearchDescription: [
                {
                    _attr: {
                        xmlns: 'http://a9.com/-/spec/opensearch/1.1/',
                        'xmlns:moz': 'http://www.mozilla.org/2006/browser/search/',
                    },
                },
                { ShortName: trimToLength(String(configs_1.default.title || configs_1.default.browserTitle || 'NodeBB'), 16) },
                { Description: trimToLength(String(configs_1.default.description || ''), 1024) },
                { InputEncoding: 'UTF-8' },
                {
                    Image: [
                        {
                            _attr: {
                                width: '16',
                                height: '16',
                                type: 'image/x-icon',
                            },
                        },
                        `${(nconf_1.default.get('url'))}/favicon.ico`,
                    ],
                },
                {
                    Url: {
                        _attr: {
                            type: 'text/html',
                            method: 'get',
                            template: `${(nconf_1.default.get('url'))}/search?term={searchTerms}&in=titlesposts`,
                        },
                    },
                },
                { 'moz:SearchForm': `${(nconf_1.default.get('url'))}/search` },
            ],
        }], { declaration: true, indent: '\t' });
}
function handler(req, res, next) {
    if (plugins_1.default.hooks.hasListeners('filter:search.query')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        res.type('application/opensearchdescription+xml').send(generateXML());
    }
    next();
}
exports.default = handler;
