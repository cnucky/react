/**
 * Created by root on 3/15/16.
 */

define([], function () {
    function getValue(value) {
        var count = parseInt(value);
        if (count >= 10000 && count < 100000000)
            return count / 10000 + '万';

        if (count >= 100000000)
            return count / 100000000 + '亿';

        return count;
    }

    function getStorageSize(value) {
        var count = parseInt(value);
        if (count < 1024)
            return count + ' KB';

        else if (count >= 1024 && count < 1024 * 1024)
            return (count / 1024).toFixed(0) + ' MB';

        else if (count >= 1024 * 1024 && count < 1024 * 1024 * 1024)
            return (count / (1024 * 1024)).toFixed(1) + ' GB';

        else if (count >= 1024 * 1024 * 1024)
            return (count / (1024 * 1024 * 1024)).toFixed(2) + ' TB';
    }

    return {
        getValue: getValue,
        getStorageSize: getStorageSize
    }

});
