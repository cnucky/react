'use strict';
define(['./app'], function(app) {
    app.filter('autoAdjust', function() {
        return function(input, useCase) {
        	useCase = useCase| 0;
            var patternDate = /\[(null|(\d{1,4}-\d{2}-\d{2}\s\d{2}\:\d{2}\:\d{2})),(null|(\d{1,4}-\d{2}-\d{2}\s\d{2}\:\d{2}\:\d{2}))\]/;
            var patternInt = /\[(null|-?\d+),(null|-?\d+)\]/;

            var forwardDate = /\[(\d{1,4}-\d{2}-\d{2})(\s\d{2}\:\d{2}\:\d{2}),null\]/;
            var backwardDate = /\[null,(\d{1,4}-\d{2}-\d{2})(\s\d{2}\:\d{2}\:\d{2})\]/;
            var bothDate = /\[(\d{1,4}-\d{2}-\d{2})(\s\d{2}\:\d{2}\:\d{2}),(\d{1,4}-\d{2}-\d{2})(\s\d{2}\:\d{2}\:\d{2})\]/;

            var forwardInt = /\[(-?\d+),null\]/;
            var backwardInt = /\[null,(-?\d+)\]/;
            var bothInt = /\[(-?\d+),(-?\d+)\]/;

            if (input.match(patternDate) != null) {

                if (input.match(forwardDate) != null) {
                	if(useCase==1){
                		return input.replace(forwardDate,'$1以后');
                	}else{
                		return input.replace(forwardDate, '$1以后');
                	}
                    
                } else if (input.match(backwardDate) != null) {
                	if(useCase==1){
                		return input.replace(backwardDate, '早于$1');
                	}else{
                		return input.replace(backwardDate, '早于$1');
                	}
                    
                } else if (input.match(bothDate) != null) {
                	if(useCase==1){
                		return input.replace(bothDate, '   $1    至        $3');
                	}else{
                		return input.replace(bothDate, '$1至$3');
                	}
                    
                }
            }

            if (input.match(patternInt) != null) {
                if (input.match(forwardInt) != null) {

                    return input.replace(forwardInt, '\>\=$1');
                } else if (input.match(backwardInt) != null) {

                    return input.replace(backwardInt, '\<\=$1');
                } else if (input.match(bothInt) != null) {

                    return input.replace(bothInt, '$1至$2');
                }
            }

            return input;
        };
    });
    // var autoAdjustFunc = function(input) {


    // };

    // app.filter('customValueAdjust', function() {
    //     return function(input, type) {
    //         var datePatternIn = /(\d{0,4}-\d{2}-\d{2})(\s\d{2}\:\d{2}\:\d{2})?/;
    //         switch (type) {
    //             case 'date':
    //         }




    //     };
    // });


});