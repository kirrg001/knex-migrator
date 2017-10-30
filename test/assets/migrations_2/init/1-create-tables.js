module.exports = function createTables(options) {
    return options.transacting.raw('CREATE TABLE users (name VARCHAR(100));')
        .then(function () {
            return {
                implicitCommits: true
            }
        });
};
