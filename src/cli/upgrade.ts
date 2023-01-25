// 'use strict';

// const nconf = require('nconf');
// const chalk = require('chalk');
import nconf from 'nconf';
import chalk from 'chalk';


// const packageInstall = require('./package-install');
// const { upgradePlugins } = require('./upgrade-plugins');
import packageInstall from './package-install';
import upgradePlugins from './upgrade-plugins';


import db from '../database';
import meta from '../meta';
import upgrade from '../upgrade';
import metaBuild from '../meta/build';

const steps = {
    package: {
        message: 'Updating package.json file with defaults...',
        handler: function () {
            packageInstall.updatePackageFile();
            packageInstall.preserveExtraneousPlugins();
            process.stdout.write(chalk.green('  OK\n'));
        },
    },
    install: {
        message: 'Bringing base dependencies up to date...',
        handler: function () {
            process.stdout.write(chalk.green('  started\n'));
            packageInstall.installAll();
        },
    },
    plugins: {
        message: 'Checking installed plugins for updates...',
        handler: async function () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.init();
            await upgradePlugins();
        },
    },
    schema: {
        message: 'Updating NodeBB data store schema...',
        handler: async function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await db.init();
            await meta.configs.init();
            await upgrade.run();
        },
    },
    build: {
        message: 'Rebuilding assets...',
        handler: async function () {
            await metaBuild.buildAll();
        },
    },
};

async function runSteps(tasks: string[]) {
    try {
        for (let i = 0; i < tasks.length; i++) {
            const step = steps[tasks[i]];
            if (step && step.message && step.handler) {
                process.stdout.write(`\n${chalk.bold(`${i + 1}. `)}${chalk.yellow(step.message)}`);
                /* eslint-disable-next-line */
                await step.handler();
            }
        }
        const message = 'NodeBB Upgrade Complete!';
        // some consoles will return undefined/zero columns,
        // so just use 2 spaces in upgrade script if we can't get our column count
        const { columns } = process.stdout;
        const spaces = columns ? new Array(Math.floor(columns / 2) - (message.length / 2) + 1).join(' ') : '  ';

        console.log(`\n\n${spaces}${chalk.green.bold(message)}\n`);

        process.exit();
    } catch (err) {
        console.error(`Error occurred during upgrade: ${err.stack}`);
        throw err;
    }
}

// async function runUpgrade(upgrades, options) {
//     console.log(chalk.cyan('\nUpdating NodeBB...'));
//     options = options || {};
//     // disable mongo timeouts during upgrade
//     nconf.set('mongo:options:socketTimeoutMS', 0);

//     if (upgrades === true) {
//         let tasks = Object.keys(steps);
//         if (options.package || options.install ||
//                 options.plugins || options.schema || options.build) {
//             tasks = tasks.filter(key => options[key]);
//         }
//         await runSteps(tasks);
//         return;
//     }

//     await require('../database').init();
//     await require('../meta').configs.init();
//     await require('../upgrade').runParticular(upgrades);
//     process.exit(0);
// }

// exports.upgrade = runUpgrade;
