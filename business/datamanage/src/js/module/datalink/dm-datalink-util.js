/**
 * Created by root on 3/15/16.
 */

define([],
    function() { function getLevel() {
        if ($('#A')[0].checked)
            return 3;
        if ($('#B')[0].checked)
            return 2;
        if ($('#C')[0].checked)
            return 1;
        else
            return 0;
    }

        function levelTrans1(levelStr) {
            switch (levelStr) {
                case 'A':
                    return 3;
                    break;
                case 'B':
                    return 2;
                    break;
                case 'C':
                    return 1;
                    break;
                default:
                    return 0;
                    break;
            }
        }

        function levelTrans2(levelCode) {
            switch (levelCode) {
                case 3:
                    return "A";
                    break;
                case 2:
                    return "B";
                    break;
                case 1:
                    return "C";
                    break;
                default:
                    return null;
                    break;
            }
        }

        return {
            getLevel: getLevel,
            levelTrans1: levelTrans1,
            levelTrans2: levelTrans2
        }

    });
