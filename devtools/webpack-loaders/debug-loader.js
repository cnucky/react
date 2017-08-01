module.exports = function(source) {
    this.cacheable && this.cacheable();
    console.log('in debug loader', source);
    return source;
};
