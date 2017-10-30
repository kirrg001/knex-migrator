module.exports = function insertUser(options) {
    return options.transacting.raw('INSERT INTO users (name) VALUES("Hausweib");');
};
