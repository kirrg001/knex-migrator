'use strict';

const _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    KnexMigrator = require('../lib'),
    testUtils = require('./utils');

let migratorConfigPath,
    migrationPath;

let knexMigrator, connection;

describe('Implicit Commits', function () {
    describe('knex-migrator init', function () {
        before(function () {
            migratorConfigPath = path.join(__dirname, 'assets', 'migrations_1', 'MigratorConfig.js');
            migrationPath = path.join(__dirname, 'assets', 'migrations_1');

            testUtils.writeMigratorConfig({
                migratorConfigPath: migratorConfigPath,
                migrationPath: migrationPath,
                currentVersion: '1.0'
            });

            knexMigrator = new KnexMigrator({
                knexMigratorFilePath: migrationPath
            });

            connection = testUtils.connect();

            return knexMigrator.reset();
        });

        after(function () {
            if (fs.existsSync(migratorConfigPath)) {
                fs.unlinkSync(migratorConfigPath);
            }
        });

        it('expect full rollback', function () {
            return knexMigrator.init()
                .catch(function () {
                    return connection('users');
                })
                .then(function (values) {
                    values.length.should.eql(0);
                })
                .catch(function (err) {
                    // sqlite doesn't use autocommits inside an explicit transaction
                    err.errno.should.eql(1);
                });
        });
    });
    describe('knex-migrator migrate', function () {
        before(function () {
            migratorConfigPath = path.join(__dirname, 'assets', 'migrations_2', 'MigratorConfig.js');
            migrationPath = path.join(__dirname, 'assets', 'migrations_2');

            testUtils.writeMigratorConfig({
                migratorConfigPath: migratorConfigPath,
                migrationPath: migrationPath,
                currentVersion: '1.0'
            });

            knexMigrator = new KnexMigrator({
                knexMigratorFilePath: migrationPath
            });

            connection = testUtils.connect();

            return knexMigrator.reset();
        });

        after(function () {
            if (fs.existsSync(migratorConfigPath)) {
                fs.unlinkSync(migratorConfigPath);
            }
        });

        it('expect full rollback', function () {
            return knexMigrator.init({skipInitCompletion: true})
                .then(function () {
                    return connection('users');
                })
                .then(function (values) {
                    values.length.should.eql(1);
                    return knexMigrator.migrate({force: true});
                })
                .catch(function () {
                    return connection('users');
                })
                .then(function (values) {
                    values.length.should.eql(2);

                    return connection('migrations');
                })
                .then(function (values) {
                    // If you run implicit statements in the middle of a version, we can't roll back the whole version.
                    // That's why it's recommended running autocommit statements as FIRST execution.
                    // @TODO: add undo command for implicit statements?
                    values.length.should.eql(4);
                });
        });
    });
});
