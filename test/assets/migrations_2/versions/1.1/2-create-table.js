module.exports = function createTables(options) {
    return options.transacting.raw('CREATE TABLE agents (name VARCHAR(100));')
        .then(function () {
            return {
                implicitCommits: true,
                undo: function undo(options) {
                    return options.transacting.raw('DROP TABLE agents;')
                }
            }
        });
};
