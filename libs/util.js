/**
 * Created by Administrator on 2014/12/7.
 */

exports.getLangDesc = function(locale) {
    switch (locale) {
        case 'cn' :
            return 'Simple Chinese';
        case 'hk' :
            return 'Traditional Chinese';
        case 'us' :
        default :
            return 'English';
    }
};