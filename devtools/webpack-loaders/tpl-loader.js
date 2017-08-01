module.exports = function(source) {
    this.cacheable && this.cacheable();
    return 'module.exports=' + JSON.stringify(source);
};
