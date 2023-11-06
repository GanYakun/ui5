/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel'
], function (Controller, MessageBox, MessageToast, JSONModel) {
    "use strict";
    return Controller.extend("o3.login.controller.Login", {
        onInit: function () {
            o3Tool.removeCookie('userLoginId');
        },
        onLogin: function (oEvent) {
            var that = this;
            var loginData = {
                USERNAME: this.getView().byId('username').getValue(),
                PASSWORD: this.getView().byId('password').getValue(),
                userTenantId: ''
            };

            sap.ui.core.BusyIndicator.show(0);

            $.ajax({
                type: 'POST',
                url: '/dinstitute/control/login',
                data: loginData,
                success: function (rsp) {
                    if (rsp._LOGIN_PASSED_) {
                        var header = "Basic " + btoa(loginData.USERNAME + ":" + loginData.PASSWORD);

                        o3Tool.cookie('Authorization', header);
                        o3Tool.cookie('userTenantId', rsp.userTenantId);
                        MessageToast.show('登录成功');
                        $.ajax({
                            type: 'get',
                            async: false,
                            url: "/dinstitute/control/odatasvc/Me?app=launchpadManage",
                            beforeSend: function (req) {
                                req.setRequestHeader('Authorization', header);
                            }
                        }).done(function (rsp) {
                            if (rsp.userLoginId) {
                                o3Tool.cookie('userLoginId', rsp.userLoginId);
                                o3Tool.removeCookie("JSESSIONID");

                                let lastVisit = o3Tool.cookie('lastVisit');
                                if (lastVisit) {
                                    o3Tool.removeCookie('lastVisit');
                                    location.replace(lastVisit);
                                } else {
                                    location.replace(window.setting.prefixUrl + '/index.html#Shell-home');

                                    // if (window.globalConfig.setup) {
                                    //     location.replace(window.setting.prefixUrl + '/index.html#Shell-home');
                                    // } else {
                                    //     location.replace(window.setting.prefixUrl + '/app/md/setup');
                                    // }
                                }
                            } else {
                                MessageBox.error('未知错误 userLoginId');
                            }
                        });

                    } else if (rsp._ERROR_MESSAGE_) {
                        MessageBox.error(rsp._ERROR_MESSAGE_);
                    } else if (rsp._ERROR_MESSAGE_LIST_) {
                        MessageBox.error(rsp._ERROR_MESSAGE_LIST_.join("\n"));
                    } else {
                        MessageBox.error('无法连接服务器');
                    }
                },
                error: function (rsp) {
                    MessageBox.error('错误');
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        }
    });
});
