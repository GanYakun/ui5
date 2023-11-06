//@formatter:off
//dayjs
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):t.dayjs=n()}(this,function(){"use strict";var t="millisecond",n="second",e="minute",r="hour",i="day",s="week",u="month",a="year",o=/^(\d{4})-?(\d{1,2})-?(\d{0,2})(.*?(\d{1,2}):(\d{1,2}):(\d{1,2}))?.?(\d{1,3})?$/,h=/\[.*?\]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,d={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},c=function(t,n,e){var r=String(t);return!r||r.length>=n?t:""+Array(n+1-r.length).join(e)+t},f={padStart:c,padZoneStr:function(t){var n=Math.abs(t),e=Math.floor(n/60),r=n%60;return(t<=0?"+":"-")+c(e,2,"0")+":"+c(r,2,"0")},monthDiff:function(t,n){var e=12*(n.year()-t.year())+(n.month()-t.month()),r=t.clone().add(e,"months"),i=n-r<0,s=t.clone().add(e+(i?-1:1),"months");return Number(-(e+(n-r)/(i?r-s:s-r))||0)},absFloor:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},prettyUnit:function(o){return{M:u,y:a,w:s,d:i,h:r,m:e,s:n,ms:t}[o]||String(o||"").toLowerCase().replace(/s$/,"")},isUndefined:function(t){return void 0===t}},$="en",l={};l[$]=d;var m=function(t){return t instanceof D},y=function(t,n,e){var r;if(!t)return null;if("string"==typeof t)l[t]&&(r=t),n&&(l[t]=n,r=t);else{var i=t.name;l[i]=t,r=i}return e||($=r),r},M=function(t,n){if(m(t))return t.clone();var e=n?"string"==typeof n?{format:n}:n:{};return e.date=t,new D(e)},p=function(t,n){return M(t,{locale:n.$L})},S=f;S.parseLocale=y,S.isDayjs=m,S.wrapper=p;var D=function(){function d(t){this.parse(t)}var c=d.prototype;return c.parse=function(t){var n,e;this.$d=null===(n=t.date)?new Date(NaN):S.isUndefined(n)?new Date:n instanceof Date?n:"string"==typeof n&&/.*[^Z]$/i.test(n)&&(e=n.match(o))?new Date(e[1],e[2]-1,e[3]||1,e[5]||0,e[6]||0,e[7]||0,e[8]||0):new Date(n),this.init(t)},c.init=function(t){var n=this.$d;this.$y=n.getFullYear(),this.$M=n.getMonth(),this.$D=n.getDate(),this.$W=n.getDay(),this.$H=n.getHours(),this.$m=n.getMinutes(),this.$s=n.getSeconds(),this.$ms=n.getMilliseconds(),this.$L=this.$L||y(t.locale,null,!0)||$},c.$utils=function(){return S},c.isValid=function(){return!("Invalid Date"===this.$d.toString())},c.isSame=function(t,n){var e=M(t);return this.startOf(n)<=e&&e<=this.endOf(n)},c.isAfter=function(t,n){return M(t)<this.startOf(n)},c.isBefore=function(t,n){return this.endOf(n)<M(t)},c.year=function(){return this.$y},c.month=function(){return this.$M},c.day=function(){return this.$W},c.date=function(){return this.$D},c.hour=function(){return this.$H},c.minute=function(){return this.$m},c.second=function(){return this.$s},c.millisecond=function(){return this.$ms},c.unix=function(){return Math.floor(this.valueOf()/1e3)},c.valueOf=function(){return this.$d.getTime()},c.startOf=function(t,o){var h=this,d=!!S.isUndefined(o)||o,c=function(t,n){var e=p(new Date(h.$y,n,t),h);return d?e:e.endOf(i)},f=function(t,n){return p(h.toDate()[t].apply(h.toDate(),(d?[0,0,0,0]:[23,59,59,999]).slice(n)),h)};switch(S.prettyUnit(t)){case a:return d?c(1,0):c(31,11);case u:return d?c(1,this.$M):c(0,this.$M+1);case s:return c(d?this.$D-this.$W:this.$D+(6-this.$W),this.$M);case i:case"date":return f("setHours",0);case r:return f("setMinutes",1);case e:return f("setSeconds",2);case n:return f("setMilliseconds",3);default:return this.clone()}},c.endOf=function(t){return this.startOf(t,!1)},c.$set=function(s,o){var h,d=S.prettyUnit(s),c=(h={},h[i]="setDate",h.date="setDate",h[u]="setMonth",h[a]="setFullYear",h[r]="setHours",h[e]="setMinutes",h[n]="setSeconds",h[t]="setMilliseconds",h)[d],f=d===i?this.$D+(o-this.$W):o;return this.$d[c]&&this.$d[c](f),this.init(),this},c.set=function(t,n){return this.clone().$set(t,n)},c.add=function(t,o){var h,d=this;t=Number(t);var c=S.prettyUnit(o),f=function(n,e){var r=d.set("date",1).set(n,e+t);return r.set("date",Math.min(d.$D,r.daysInMonth()))},$=function(n){var e=new Date(d.$d);return e.setDate(e.getDate()+n*t),p(e,d)};if(c===u)return f(u,this.$M);if(c===a)return f(a,this.$y);if(c===i)return $(1);if(c===s)return $(7);var l=(h={},h[e]=6e4,h[r]=36e5,h[n]=1e3,h)[c]||1,m=this.valueOf()+t*l;return p(m,this)},c.subtract=function(t,n){return this.add(-1*t,n)},c.format=function(t){var n=this;if(!this.isValid())return"Invalid Date";var e=t||"YYYY-MM-DDTHH:mm:ssZ",r=S.padZoneStr(this.$d.getTimezoneOffset()),i=this.$locale(),s=i.weekdays,u=i.months,a=function(t,n,e,r){return t&&t[n]||e[n].substr(0,r)},o=function(t){return 0===n.$H?12:S.padStart(n.$H<13?n.$H:n.$H-12,"hh"===t?2:1,"0")};return e.replace(h,function(t){return t.indexOf("[")>-1?t.replace(/\[|\]/g,""):{YY:String(n.$y).slice(-2),YYYY:String(n.$y),M:String(n.$M+1),MM:S.padStart(n.$M+1,2,"0"),MMM:a(i.monthsShort,n.$M,u,3),MMMM:u[n.$M],D:String(n.$D),DD:S.padStart(n.$D,2,"0"),d:String(n.$W),dd:a(i.weekdaysMin,n.$W,s,2),ddd:a(i.weekdaysShort,n.$W,s,3),dddd:s[n.$W],H:String(n.$H),HH:S.padStart(n.$H,2,"0"),h:o(t),hh:o(t),a:n.$H<12?"am":"pm",A:n.$H<12?"AM":"PM",m:String(n.$m),mm:S.padStart(n.$m,2,"0"),s:String(n.$s),ss:S.padStart(n.$s,2,"0"),SSS:S.padStart(n.$ms,3,"0"),Z:r}[t]||r.replace(":","")})},c.diff=function(t,o,h){var d,c=S.prettyUnit(o),f=M(t),$=this-f,l=S.monthDiff(this,f);return l=(d={},d[a]=l/12,d[u]=l,d.quarter=l/3,d[s]=$/6048e5,d[i]=$/864e5,d[r]=$/36e5,d[e]=$/6e4,d[n]=$/1e3,d)[c]||$,h?l:S.absFloor(l)},c.daysInMonth=function(){return this.endOf(u).$D},c.$locale=function(){return l[this.$L]},c.locale=function(t,n){var e=this.clone();return e.$L=y(t,n,!0),e},c.clone=function(){return p(this.toDate(),this)},c.toDate=function(){return new Date(this.$d)},c.toArray=function(){return[this.$y,this.$M,this.$D,this.$H,this.$m,this.$s,this.$ms]},c.toJSON=function(){return this.toISOString()},c.toISOString=function(){return this.$d.toISOString()},c.toObject=function(){return{years:this.$y,months:this.$M,date:this.$D,hours:this.$H,minutes:this.$m,seconds:this.$s,milliseconds:this.$ms}},c.toString=function(){return this.$d.toUTCString()},d}();return M.prototype=D.prototype,M.extend=function(t,n){return t(n,D,M),M},M.locale=y,M.isDayjs=m,M.unix=function(t){return M(1e3*t)},M.en=l[$],M});
//dayjsPluginUTC
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.dayjsPluginUTC=e():t.dayjsPluginUTC=e()}(this,function(){return function(t){var e={};function n(o){if(e[o])return e[o].exports;var r=e[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(o,r,function(e){return t[e]}.bind(null,r));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function r(t){var e;switch(o(t)){case"string":return/Z$/.test(t)?0:(e=/([+-])(\d{2}):?(\d{2})/.exec(t))&&(+e[3]+60*e[2])*("+"===e[1]?1:-1);case"number":return Number.isNaN(t)?null:Math.abs(t)<16?60*t:t;default:return null}}n.r(e);var i=function(t,e,n){var o=String(t);return!o||o.length>=e?t:"".concat(Array(e+1-o.length).join(n)).concat(t)};function u(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}var s=(new Date).getTimezoneOffset(),f=Date.prototype;function c(t){return 6e4*(t-(arguments.length>1&&void 0!==arguments[1]?arguments[1]:s))}var a=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Date,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:e.getTimezoneOffset();!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.$d=new Date(e.getTime()-c(n)),this.$timezoneOffset=n}return function(t,e,n){e&&u(t.prototype,e),n&&u(t,n)}(t,[{key:"getTimezoneOffset",value:function(){return this.$timezoneOffset}},{key:"setTimezoneOffset",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.$timezoneOffset;this.$d.setTime(this.$d.getTime()+c(this.$timezoneOffset,t)),this.$timezoneOffset=t}}]),t}();["toDateString","toLocaleString","toLocaleDateString","toLocaleTimeString","setDate","setFullYear","setHours","setMilliseconds","setMinutes","setMonth","setSeconds","setTime","setYear","getDate","getDay","getFullYear","getHours","getMilliseconds","getMinutes","getMonth","getSeconds","getYear"].forEach(function(t){a.prototype[t]=function(){return f[t].apply(this.$d,arguments)}}),["toISOString","toUTCString","toGMTString","toJSON","getUTCDate","getUTCDay","getUTCFullYear","getUTCHours","getUTCMilliseconds","getUTCMinutes","getUTCMonth","getUTCSeconds","valueOf","getTime"].forEach(function(t){a.prototype[t]=function(){return f[t].apply(new Date(this.$d.getTime()+c(this.$timezoneOffset)),arguments)}}),["setUTCDate","setUTCFullYear","setUTCHours","setUTCMilliseconds","setUTCMinutes","setUTCMonth","setUTCSeconds"].forEach(function(t){a.prototype[t]=function(){var e=new Date(this.$d.getTime()+c(this.$timezoneOffset));f[t].apply(e,arguments),e.setTime(e.getTime()-c(this.$timezoneOffset)),this.$d=e}}),["toString","toTimeString"].forEach(function(t){a.prototype[t]=function(){return f[t].apply(this.$d,arguments).replace(/GMT(.*)$/,"GMT".concat(function(t){var e=Math.abs(t),n=Math.floor(e/60),o=e%60;return"".concat(t<=0?"+":"-").concat(i(n,2,"0"),":").concat(i(o,2,"0"))}(this.$timezoneOffset)))}});var l=a,p=!1;e.default=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0,n=arguments.length>2?arguments[2]:void 0;p=!!t.parseToLocal;var o=e.prototype,i=function(){};i.prototype=o;var u=new i;!function(t,e){["clone","add","subtract"].forEach(function(n){t[n]=function(){var t=this.utcOffset();return e[n].apply(this,arguments).utcOffset(t)}}),t.utc=function(){return this.utcOffset(0)},t.local=function(){return this.utcOffset(-s)},t.utcOffset=function(t){if(void 0===t){var e=this.$d.getTimezoneOffset();return 0===e?0:-e}return null!==r(t)&&(this.$d.setTimezoneOffset(-r(t)),this.init()),this},t.toDate=function(){return new Date(this.$d.getTime())},t.isLocal=function(){return this.$d.getTimezoneOffset()===s},t.isUTC=function(){return 0===this.$d.getTimezoneOffset()},t.parse=function(t){e.parse.call(this,t);var n=this.$d,o="string"==typeof t.date?r(t.date):null;this.$d=new l(n,null===o?s:-o),p&&this.local(),this.init()}}(u,o),u.constructor=e.constructor,e.prototype=u,n.utc=function(t){var e=this(t);return"string"==typeof t&&null===r(t)&&(e.$d.$timezoneOffset=0),e.utc()}}}])});
dayjs.extend(dayjsPluginUTC.default);
//@formatter:on

var o3Tool = o3Tool || {};
o3Tool.setBusy = function (oControl, display) {
    if (oControl === true) {
        sap.ui.core.BusyIndicator.show(0);
    } else if (oControl === false) {
        sap.ui.core.BusyIndicator.hide();
    } else {//oControl 为组件
        oControl.setBusyIndicatorDelay(0);
        oControl.setBusy(display);
    }
}
o3Tool.removeCookie = function (key) {
    return $.removeCookie(key, {path: '/'});
};
o3Tool.cookie = function (key, value) {
    return $.cookie(key, value, {'path': '/'});
};
/**
 * 获得服务器时间戳
 * @param format
 * @returns {*}
 */
o3Tool.getNowTimeStamp = function (format) {
    format = format || 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
    return dayjs(jQuery.ajax({async: false}).getResponseHeader("Date")).utcOffset(0).format(format);
}
/**
 * 获得指定长度随机字符
 * @param len
 * @returns {string}
 */
o3Tool.getRandomString = function (len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
//添加过滤时间拼接
o3Tool.filterDate = function () {
    var nowDate = this.getNowTimeStamp();
    var filterStr = 'fromDate le ' + nowDate + ' and (thruDate ge ' + nowDate + ' or thruDate eq null)';
    return filterStr;
};

o3Tool.uuid = function (prefix) {
    function _hex16() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
    }

    function _createBoundary(prefix) {
        if (!prefix) {
            prefix = '';
        }
        return prefix + _hex16() + "-" + _hex16() + "-" + _hex16() + "-" + _hex16();
    }

    return _createBoundary(prefix);
}

function loadScript(url) {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = url;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
}

o3Tool.array_get = function ($array, $key, $default) {
    if ($key == undefined) {
        return $array;
    }
    if ($key in $array) {
        return $array[$key];
    }

    var $rtn = $array;
    $.each($key.split('.'), function (k, $segment) {
        if ($array[$segment]) {
            $array = $array[$segment];
            $rtn = $array;
        } else {
            $rtn = $default;
            return false;
        }
    });

    return $rtn;
}
o3Tool.params = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};
o3Tool.calc = (function (exports) {
    'use strict';

    /**
     * @file 解决浮动运算问题，避免小数点后产生多位数和计算精度损失。
     * 问题示例：2.3 + 2.4 = 4.699999999999999，1.0 - 0.9 = 0.09999999999999998
     */
    /**
     * 把错误的数据转正
     * strip(0.09999999999999998)=0.1
     */
    function strip(num, precision) {
        if (precision === void 0) {
            precision = 12;
        }
        return +parseFloat(num.toPrecision(precision));
    }

    /**
     * Return digits length of a number
     * @param {*number} num Input number
     */
    function digitLength(num) {
        // Get digit length of e
        var eSplit = num.toString().split(/[eE]/);
        var len = (eSplit[0].split('.')[1] || '').length - (+(eSplit[1] || 0));
        return len > 0 ? len : 0;
    }

    /**
     * 把小数转成整数，支持科学计数法。如果是小数则放大成整数
     * @param {*number} num 输入数
     */
    function float2Fixed(num) {
        if (num.toString().indexOf('e') === -1) {
            return Number(num.toString().replace('.', ''));
        }
        var dLen = digitLength(num);
        return dLen > 0 ? num * Math.pow(10, dLen) : num;
    }

    /**
     * 检测数字是否越界，如果越界给出提示
     * @param {*number} num 输入数
     */
    function checkBoundary(num) {
        if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
            console.warn(num + " is beyond boundary when transfer to integer, the results may not be accurate");
        }
    }

    /**
     * 精确乘法
     */
    function times(num1, num2) {
        var others = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            others[_i - 2] = arguments[_i];
        }
        if (others.length > 0) {
            return times.apply(void 0, [times(num1, num2), others[0]].concat(others.slice(1)));
        }
        var num1Changed = float2Fixed(num1);
        var num2Changed = float2Fixed(num2);
        var baseNum = digitLength(num1) + digitLength(num2);
        var leftValue = num1Changed * num2Changed;
        checkBoundary(leftValue);
        return leftValue / Math.pow(10, baseNum);
    }

    /**
     * 精确加法
     */
    function plus(num1, num2) {
        var others = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            others[_i - 2] = arguments[_i];
        }
        if (others.length > 0) {
            return plus.apply(void 0, [plus(num1, num2), others[0]].concat(others.slice(1)));
        }
        var baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
        return (times(num1, baseNum) + times(num2, baseNum)) / baseNum;
    }

    /**
     * 精确减法
     */
    function minus(num1, num2) {
        var others = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            others[_i - 2] = arguments[_i];
        }
        if (others.length > 0) {
            return minus.apply(void 0, [minus(num1, num2), others[0]].concat(others.slice(1)));
        }
        var baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
        return (times(num1, baseNum) - times(num2, baseNum)) / baseNum;
    }

    /**
     * 精确除法
     */
    function divide(num1, num2) {
        var others = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            others[_i - 2] = arguments[_i];
        }
        if (others.length > 0) {
            return divide.apply(void 0, [divide(num1, num2), others[0]].concat(others.slice(1)));
        }
        var num1Changed = float2Fixed(num1);
        var num2Changed = float2Fixed(num2);
        checkBoundary(num1Changed);
        checkBoundary(num2Changed);
        return times((num1Changed / num2Changed), Math.pow(10, digitLength(num2) - digitLength(num1)));
    }

    /**
     * 四舍五入
     */
    function round(num, ratio) {
        var base = Math.pow(10, ratio);
        return divide(Math.round(times(num, base)), base);
    }

    var index = {
        strip: strip,
        plus: plus,
        minus: minus,
        times: times,
        divide: divide,
        round: round,
        digitLength: digitLength,
        float2Fixed: float2Fixed
    };

    exports.strip = strip;//把错误的数据转正
    exports.add = plus;//加
    exports.sub = minus;//减
    exports.mul = times;//乘
    exports.div = divide;//除
    exports.round = round;//四舍五入
    exports.digitLength = digitLength;
    exports.float2Fixed = float2Fixed;
    exports['default'] = index;

    return exports;
}({}));
o3Tool.sap = {
    m: {
        ScreenSize: {
            O3Large: '1980px',
            O3XLarge: '4096px'
        }
    }
};
o3Tool.phpjs = {
    parse_str: function (str, array) {
        var strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&')
        var sal = strArr.length, i, j, ct, p, lastObj, obj, chr, tmp, key, value, postLeftBracketPos, keys, keysLen;

        var _fixStr = function (str) {
            return decodeURIComponent(str.replace(/\+/g, '%20'))
        }

        var $global = (typeof window !== 'undefined' ? window : global)
        $global.$locutus = $global.$locutus || {}
        var $locutus = $global.$locutus
        $locutus.php = $locutus.php || {}

        if (!array) {
            array = $global
        }

        for (i = 0; i < sal; i++) {
            tmp = strArr[i].split('=')
            key = _fixStr(tmp[0])
            value = (tmp.length < 2) ? '' : _fixStr(tmp[1])

            while (key.charAt(0) === ' ') {
                key = key.slice(1)
            }

            if (key.indexOf('\x00') > -1) {
                key = key.slice(0, key.indexOf('\x00'))
            }

            if (key && key.charAt(0) !== '[') {
                keys = []
                postLeftBracketPos = 0

                for (j = 0; j < key.length; j++) {
                    if (key.charAt(j) === '[' && !postLeftBracketPos) {
                        postLeftBracketPos = j + 1
                    } else if (key.charAt(j) === ']') {
                        if (postLeftBracketPos) {
                            if (!keys.length) {
                                keys.push(key.slice(0, postLeftBracketPos - 1))
                            }

                            keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos))
                            postLeftBracketPos = 0

                            if (key.charAt(j + 1) !== '[') {
                                break
                            }
                        }
                    }
                }

                if (!keys.length) {
                    keys = [key]
                }

                for (j = 0; j < keys[0].length; j++) {
                    chr = keys[0].charAt(j)

                    if (chr === ' ' || chr === '.' || chr === '[') {
                        keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1)
                    }

                    if (chr === '[') {
                        break
                    }
                }

                obj = array

                for (j = 0, keysLen = keys.length; j < keysLen; j++) {
                    key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '')
                    lastObj = obj

                    if ((key === '' || key === ' ') && j !== 0) {
                        // Insert new dimension
                        ct = -1

                        for (p in obj) {
                            if (obj.hasOwnProperty(p)) {
                                if (+p > ct && p.match(/^\d+$/g)) {
                                    ct = +p
                                }
                            }
                        }

                        key = ct + 1
                    }

                    // if primitive value, replace with object
                    if (Object(obj[key]) !== obj[key]) {
                        obj[key] = {}
                    }

                    obj = obj[key]
                }

                lastObj[key] = value
            }
        }
    }
};

/**
 o3Tool.request('Facilitys?&$skip=0&$top=100').then(function (rsp) {
    console.log(rsp);
});
 o3Tool.request({
    requestUri:'Facilitys?&$skip=0&$top=100',
    method:'GET'
}).then(function (rsp) {
    console.log(rsp);
});

 o3Tool.request([
 'PartyRoles?&$skip=0&$top=100&$filter=roleTypeId%20eq%20%27INTERNAL_ORGANIZATIO%27',
 'GlAccountOrganizations?&$skip=0&$top=100',
 'Facilitys?&$skip=0&$top=100'
 ]).then(function (rsp) {
    console.log(rsp);
});
 */
/*
 //xwk 基于原生request,先不用了,自己来实现
 o3Tool.request = function (requests) {
 function processUrl(url) {
 return url.replace(/ /g, '%20')
 }

 return new Promise(function (resolve, reject) {
 var _Requestor = sap.ui.requireSync('sap/ui/model/odata/v4/lib/_Requestor');
 var oRequestor = _Requestor.create(o3Tool.sServiceUrl, {});
 if (requests instanceof Array) {
 var paramPost = [];
 $.each(requests, function (k, v) {
 var param = {
 method: 'GET',
 url: '',
 headers: {
 'Content-Type': 'application/json'
 }
 };
 if (v.body) {
 param.body = v.body
 }
 if (typeof v == 'string') {
 paramPost.push($.extend({}, param, {url: processUrl(v)}));
 } else {
 v.url = processUrl(v.url);
 paramPost.push($.extend({}, param, v));
 }
 });
 oRequestor.sendBatch(paramPost).then(function (body) {
 if (body) {
 var resp = [];
 $.each(body, function (k, v) {
 if (v.responseText) {
 resp.push(JSON.parse(v.responseText));
 }
 });
 resolve && resolve(resp);
 }
 }, function (body) {
 reject && reject(body);
 });
 } else {
 if (typeof requests == 'string') {
 oRequestor.sendRequest('GET', processUrl(requests)).then(function (body) {
 if (body) {
 resolve && resolve(body.body);
 }
 }, function (body) {
 reject && reject(body);
 });
 } else {
 oRequestor.sendRequest(requests.method, processUrl(requests.url)).then(function (body) {
 if (body) {
 resolve && resolve(body.body);
 }
 }, function (body) {
 reject && reject(body);
 });
 }
 }
 });
 }
 */
o3Tool.request = function (requests) {
    var sendRequest = function (sMethod, sResourcePath, mHeaders, sPayload) {
        var sRequestUrl = o3Tool.sServiceUrl + encodeURLParameters(sResourcePath);
        return new Promise(function (fnResolve, fnReject) {
            function send(bIsFreshToken) {
                return jQuery.ajax(sRequestUrl, {
                    data: sPayload,
                    headers: jQuery.extend({}, {
                            "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                            "OData-MaxVersion": "4.0",
                            "OData-Version": "4.0",
                            "X-CSRF-Token": "Fetch"
                        },
                        mHeaders),
                    method: sMethod
                }).then(function (oResponse, sTextStatus, jqXHR) {
                    fnResolve({
                        body: oResponse,
                        contentType: jqXHR.getResponseHeader("Content-Type"),
                        messages: jqXHR.getResponseHeader("sap-messages"),
                        resourcePath: sResourcePath
                    });
                }, function (jqXHR, sTextStatus, sErrorMessage) {
                    fnReject(jqXHR, sTextStatus, sErrorMessage);
                });
            }

            return send();
        });
    }

    function serializeHeaders(mHeaders) {
        var sHeaderName,
            aHeaders = [];
        for (sHeaderName in mHeaders) {
            aHeaders = aHeaders.concat(sHeaderName, ":", mHeaders[sHeaderName], "\r\n");
        }
        return aHeaders;
    }

    function encodeURLParameters(sUrl) {
        sUrl =  decodeURIComponent(sUrl);
        sUrl = encodeURI(sUrl);
        if (sUrl.indexOf('(') > -1) {
            var parmStr = sUrl.substring(sUrl.indexOf("(") + 1, sUrl.lastIndexOf(")"));
            if (parmStr.indexOf('date') > -1 || parmStr.indexOf('Date') > -1) {
                var parms = parmStr.split(",");
                for (let index in parms) {
                    let parm = parms[index];
                    if (parm.indexOf('date') || parmStr.indexOf('Date')) {
                        let key = parm.substring(0, parm.indexOf('='));
                        let val = parm.substring(parm.indexOf('=') + 1);
                        if (Date.parse(val)) {
                            parms[index] = key + "=" + encodeURIComponent(val);
                        }
                    } else {
                        continue;
                    }
                }
                let newUrl = sUrl.slice(0, sUrl.indexOf("(") + 1) + parms.join(",") + sUrl.slice(sUrl.lastIndexOf(")"));
                //replace
                sUrl = newUrl;
            }

        }
        return sUrl;
    }

    function getHeaderParameterValue(sHeaderValue, sParameterName) {
        var iParamIndex,
            aHeaderParts = sHeaderValue.split(";"),
            rHeaderParameter = /(\S*?)=(?:"(.+)"|(\S+))/,
            aMatches;

        sParameterName = sParameterName.toLowerCase();
        for (iParamIndex = 1; iParamIndex < aHeaderParts.length; iParamIndex++) {
            aMatches = rHeaderParameter.exec(aHeaderParts[iParamIndex]);
            if (aMatches[1].toLowerCase() === sParameterName) {
                return aMatches[2] || aMatches[3];
            }
        }
    }

    var sendBatch = function (aRequests) {
        return new Promise(function (fnResolve, fnReject) {
            var sBatchBoundary = 'batch_' + jQuery.sap.uid();
            var aRequestBody = [];
            aRequestBody = aRequestBody.concat("Content-Type: multipart/mixed;boundary=", sBatchBoundary, "\r\n\r\n");
            aRequests.forEach(function (oRequest, iRequestIndex) {
                var sUrl = encodeURLParameters(oRequest.url);
                aRequestBody = aRequestBody.concat("--", sBatchBoundary, "\r\n");

                aRequestBody = aRequestBody.concat(
                    "Content-Type:application/http\r\n",
                    "Content-Transfer-Encoding:binary\r\n",
                    "",
                    "\r\n",
                    oRequest.method, " ", sUrl, " HTTP/1.1\r\n",
                    serializeHeaders(oRequest.headers),
                    "\r\n",
                    JSON.stringify(oRequest.body) || "", "\r\n");
            });
            aRequestBody = aRequestBody.concat("--", sBatchBoundary, "--\r\n");

            aRequestBody = aRequestBody.join("");
            sendRequest('POST', '$batch', {
                "Accept": "multipart/mixed",
                "Content-Type": "multipart/mixed; boundary=" + sBatchBoundary,
                "MIME-Version": "1.0"
            }, aRequestBody).then(function (sResponse) {
                var aBatchParts = sResponse.body.split(new RegExp('--' + getHeaderParameterValue(sResponse.contentType, 'boundary') + '(?:[ \t]*\r\n|--)')),
                    aResponses = [];
                aBatchParts = aBatchParts.slice(1, -1);
                aBatchParts.forEach(function (sBatchPart) {
                    var sChangeSetContentType, sCharset, iColonIndex, sHeader, sHeaderName, sHeaderValue, aHttpHeaders,
                        aHttpStatusInfos, i, sMimeHeaders, oResponse = {}, iResponseIndex, aResponseParts;

                    aResponseParts = sBatchPart.split("\r\n\r\n");
                    sMimeHeaders = aResponseParts[0];

                    aHttpHeaders = aResponseParts[1].split("\r\n");
                    aHttpStatusInfos = aHttpHeaders[0].split(" ");

                    oResponse.status = parseInt(aHttpStatusInfos[1], 10);
                    oResponse.statusText = aHttpStatusInfos.slice(2).join(' ');
                    oResponse.headers = {};

                    for (i = 1; i < aHttpHeaders.length; i++) {
                        sHeader = aHttpHeaders[i];
                        iColonIndex = sHeader.indexOf(':');
                        sHeaderName = sHeader.slice(0, iColonIndex).trim();
                        sHeaderValue = sHeader.slice(iColonIndex + 1).trim();
                        oResponse.headers[sHeaderName] = sHeaderValue;
                    }

                    oResponse.responseText = aResponseParts[2].slice(0, -2);

                    aResponses.push(oResponse);
                });

                fnResolve(aResponses);
            }, function (someThing) {
                fnReject(someThing);
            });
        });
    }

    return new Promise(function (fnResolve, fnReject) {
        if (requests instanceof Array) {
            //batch
            var paramPost = [];
            requests.forEach(function (request) {
                var param = {
                    method: 'GET',
                    url: '',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                if (request.body) {
                    param.body = request.body
                }
                if (typeof request == 'string') {
                    paramPost.push($.extend({}, param, {url: request}));
                } else {
                    paramPost.push($.extend({}, param, request));
                }
                console.log();
            });
            sendBatch(paramPost).then(function (body) {
                if (body) {
                    var resp = [];
                    $.each(body, function (k, v) {
                        if (v.responseText) {
                            resp.push(JSON.parse(v.responseText));
                        }
                    });
                    fnResolve(resp);
                }
            }, function (body) {
                fnReject(body);
            });
        } else {
            if (typeof requests == 'string') {
                sendRequest('GET', requests).then(function (body) {
                    if (body) {
                        fnResolve(body.body);
                    }
                }, function (body) {
                    fnReject(body);
                });
            } else {
                sendRequest(requests.method, requests.url).then(function (body) {
                    if (body) {
                        fnResolve(body.body);
                    }
                }, function (body) {
                    fnReject(body);
                });
            }
        }
    });
};
/**
 * 绑定上下文提交
 */
o3Tool.bindContext = function (path, parameters) {
    var oModel = new sap.ui.model.odata.v4.ODataModel({
        groupId: '$auto',
        synchronizationMode: 'None',
        serviceUrl: o3Tool.sServiceUrl,
    });
    var binding = oModel.bindContext(path);
    if (!$.isEmptyObject(parameters)) {
        for (var key in parameters) {
            if (parameters[key] !== undefined) {
                binding.setParameter(key, parameters[key]);
            }
        }
    }
    binding.setO3Parameter = function (key, value) {
        if (value !== undefined) {
            binding.setParameter(key, value);
        }
    }
    return binding;
};

/**
 * 格式化字符串
 * @param sPattern string
 * @param aValues
 * @returns {string}
 */
o3Tool.formatMessage = function (sPattern, aValues) {
    var rMessageFormat = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;
    if (arguments.length > 2 || (aValues != null && !Array.isArray(aValues))) {
        aValues = Array.prototype.slice.call(arguments, 1);
    }
    aValues = aValues || [];
    return sPattern.replace(rMessageFormat, function ($0, $1, $2, $3, offset) {
        if ($1) {
            // a doubled single quote in a normal string fragment
            //   --> emit a single quote
            return "'";
        } else if ($2) {
            // a quoted sequence of chars, potentially containing doubled single quotes again
            //   --> emit with doubled single quotes replaced by a single quote
            return $2.replace(/''/g, "'");
        } else if ($3) {
            // a welformed curly brace
            //   --> emit the argument but ignore other parameters
            return String(aValues[parseInt($3, 10)]);
        }
        // e.g. malformed curly braces
        //   --> throw Error
        throw new Error("formatMessage: pattern syntax error at pos. " + offset);
    });
};

/**
 * 按指定数字切割数组
 * @param array
 * @param size
 * @returns {Array}
 */
o3Tool.sliceArray = function (array, size) {
    var result = [];
    for (var x = 0; x < Math.ceil(array.length / size); x++) {
        var start = x * size;
        var end = start + size;
        result.push(array.slice(start, end));
    }
    return result;
}

o3Tool.array_diff = function (arraySource, arrayDist) {
    function _array_diff(arraySource, arrayDist) {
        return arraySource.filter(function (item) {
            return arrayDist.indexOf(item) === -1;
        })
    }

    return result = {
        delete: _array_diff(arraySource, arrayDist),
        add: _array_diff(arrayDist, arraySource)
    };
}

o3Tool.responseMessage = function (model) {
    return new Promise(function (fnResolve, fnReject) {
        model.attachEventOnce('messageChange', function (oEvent) {
            var parameters = oEvent.getParameters();
            if (!$.isEmptyObject(parameters) && !$.isEmptyObject(parameters.newMessages)) {
                var newMessage = parameters.newMessages[0];
                var type = newMessage.type;
                if (type == "Error") {
                    fnReject(newMessage);
                } else {
                    if (fnResolve) {
                        fnResolve(newMessage);
                    }

                }
            } else {
                if (fnResolve) {
                    fnResolve()
                }
            }
        });
    });
}

o3Tool.fillParameter = function (oObjectBinding, jsonModel) {
    if (!oObjectBinding || !jsonModel) {
        return;
    }
    if ($.isEmptyObject(jsonModel.getData())) {
    }
    var cleanRequestParamter = function (bind, model) {
        var jsonData = jsonModel.getData();
        for (var itemKey in jsonData) {
            oObjectBinding.setParameter(itemKey, null);
        }
    }
    cleanRequestParamter(oObjectBinding, jsonModel);
    for (var itemKey in jsonModel.getData()) {
        //为null则不存入,否则会导致odata的数据验证报错
        var value = jsonModel.getProperty('/' + itemKey);
        //if(0) == false
        if (!!value) {
            oObjectBinding.setParameter(itemKey, value);
        }
    }
}

//default option = "ALIYUN_OSS"
o3Tool.getThumbnailConfig = function (option) {
    return "?x-oss-process=image/resize,w_100";
}

o3Tool.array_chunk = function (input, size, preserveKeys) {
    // eslint-disable-line camelcase
    //  discuss at: http://locutus.io/php/array_chunk/
    // original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // improved by: Brett Zamir (http://brett-zamir.me)
    //      note 1: Important note: Per the ECMAScript specification,
    //      note 1: objects may not always iterate in a predictable order
    //   example 1: array_chunk(['Kevin', 'van', 'Zonneveld'], 2)
    //   returns 1: [['Kevin', 'van'], ['Zonneveld']]
    //   example 2: array_chunk(['Kevin', 'van', 'Zonneveld'], 2, true)
    //   returns 2: [{0:'Kevin', 1:'van'}, {2: 'Zonneveld'}]
    //   example 3: array_chunk({1:'Kevin', 2:'van', 3:'Zonneveld'}, 2)
    //   returns 3: [['Kevin', 'van'], ['Zonneveld']]
    //   example 4: array_chunk({1:'Kevin', 2:'van', 3:'Zonneveld'}, 2, true)
    //   returns 4: [{1: 'Kevin', 2: 'van'}, {3: 'Zonneveld'}]
    var x
    var p = ''
    var i = 0
    var c = -1
    var l = input.length || 0
    var n = []

    if (size < 1) {
        return null
    }

    if (Object.prototype.toString.call(input) === '[object Array]') {
        if (preserveKeys) {
            while (i < l) {
                (x = i % size)
                    ? n[c][i] = input[i]
                    : n[++c] = {};
                n[c][i] = input[i]
                i++
            }
        } else {
            while (i < l) {
                (x = i % size)
                    ? n[c][x] = input[i]
                    : n[++c] = [input[i]]
                i++
            }
        }
    } else {
        if (preserveKeys) {
            for (p in input) {
                if (input.hasOwnProperty(p)) {
                    (x = i % size)
                        ? n[c][p] = input[p]
                        : n[++c] = {};
                    n[c][p] = input[p]
                    i++
                }
            }
        } else {
            for (p in input) {
                if (input.hasOwnProperty(p)) {
                    (x = i % size)
                        ? n[c][x] = input[p]
                        : n[++c] = [input[p]]
                    i++
                }
            }
        }
    }

    return n
}


$(document).ready(function () {
});
