(function(){


    if(typeof define === 'function' && define.amd){
        define([], definer);
        return;
    }

    if(typeof module !== 'undefined' && module.exports){
        module.exports = definer();
        return;
    }

    throw "no AMD";


    function definer(){
        return {
            extend: extend
            , asString: asString
        };
    }//definer


    function extend(o) {
        var argumentCount = arguments.length;
        for (var argumentIndex = 1; argumentIndex < argumentCount; argumentIndex++) {
            var argument = arguments[argumentIndex];
            if(!argument) continue;
            for (var argumentKey in argument) {
                o[argumentKey] = argument[argumentKey];
            }
        }
        return o;
    }//extend

    function asString(data) {
        if(typeof data == 'undefined') return '';
        if(data === null) return '';
        return data.toString();
    }//asString

})();




