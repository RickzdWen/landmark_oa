/**
 * Created by zhangyun on 14-10-11.
 */

define(function(){
    return {
        process : function($scope, $http, staff, _getService, _submit) {
            var vInfo = $scope.validInfo = {
                isNickValid : false,
                isNickUnique : false,
                isEmailValid : false,
                isQqValid : false
            };
            $scope.nickError = '';
            $scope.$watch('staff.nick', function(nick){
                vInfo.isNickUnique = false;
                vInfo.isNickValid = nick ? true : false;
                $scope.nickError = vInfo.isNickValid ? '' : 'nick is required';
            });
            $scope.$watch('staff.email', function(email){
                if (email && !/^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i.test(email)) {
                    vInfo.isEmailValid = false;
                } else {
                    vInfo.isEmailValid = true;
                }
            });
            $scope.$watch('staff.qq', function(qq){
                if (qq && isNaN(qq)) {
                    vInfo.isQqValid = false;
                } else {
                    vInfo.isQqValid = true;
                }
            });

            $scope.validNick = function(withSubmit) {
                if (vInfo.isNickValid) {
                    _getService($http.get('/staff/exist', {
                        params : {
                            nick : staff.nick
                        }
                    })).then(function(res){
                        if (res.exist) {
                            $scope.nickError = 'the nick has been existed';
                        } else {
                            vInfo.isNickUnique = true;
                            withSubmit && _submit();
                        }
                    });
                }
            };

            var submiting = false;
            $scope.submit = function(e) {
                e.preventDefault();
                if (submiting) {
                    return;
                }
                if (vInfo.isNickValid && vInfo.isEmailValid && vInfo.isQqValid) {
                    if (!vInfo.isNickUnique) {
                        $scope.validNick(true);
                    } else {
                        _submit();
                    }
                }
            };
        }
    };
});
