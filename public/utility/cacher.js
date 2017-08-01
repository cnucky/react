/**
 * Created by yaco on 15-11-20.
 */
define('utility/cacher', function () {
    var cacher = (function () {

        var _cache = {};

        function addCache(key, data) {
            _cache[key] = data;
        }

        function readCache(key) {
            return _cache[key];
        }

        function removeCache(key) {
            _cache[key] = null;
        }

        function clear() {
            for (var key in _cache) {
                removeCache(key);
            }
        }

        return {
            addCache: addCache,
            readCache: readCache,
            removeCache: removeCache,
            clear: clear
        };
    })();

    return cacher;
});
