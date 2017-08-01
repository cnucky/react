/**
 * Created by root on 5/24/16.
 */

define([], function () {
    function checkDataTypeName(nameStr) {
        var reg = new RegExp("[\\/:*?\"\"<>|@''~!#\\\\]", "g");
        return reg.test(nameStr);
    }

    var delDynamicLoading = {
        css: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            for (var link in head.children) {
                if (head.children[link].type != undefined && head.children[link].type == 'text/css'
                    && head.children[link].href != undefined && head.children[link].href.indexOf(path) > 0)
                    head.removeChild(head.children[link]);
            }
            //link.href = path;
            //link.rel = 'stylesheet';
            //link.type = 'text/css';
            //head.appendChild(link);
        },
        js: function (path) {
            if (!path || path.length === 0) {
                throw new Error('argument "path" is required !');
            }
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.src = path;
            script.type = 'text/javascript';
            head.appendChild(script);
        }
    }

    function generateRandomId(n) {
        var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var res = "";
        for (i = 0; i < n; i++) {
            id = Math.ceil(Math.random() * 52);
            res += chars[id];
        }
        return res;
    }

    return {
        checkDataTypeName: checkDataTypeName,
        delDynamicLoading: delDynamicLoading,
        generateRandomId: generateRandomId,
    }

});
