sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel'
], function (Controller, MessageBox, MessageToast, JSONModel) {
    "use strict";
    return Controller.extend("o3.home.controller.Login", {
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
                url: '/officeauto/control/login',
                data: loginData,
                success: function (rsp) {
                    if (rsp._LOGIN_PASSED_) {
                        MessageToast.show('登录成功');
                        $.ajax({
                            type: 'get',
                            async: false,
                            url: "officeauto/control/odatasvc/Visitors('" + o3Tool.cookie('OFBiz.Visitor') + "')?app=launchpadManage"
                        }).done(function (party) {
                            if (party.userLoginId) {
                                o3Tool.cookie('userLoginId', party.userLoginId);
                                let lastVisit = o3Tool.cookie('lastVisit');
                                if (lastVisit) {
                                    o3Tool.removeCookie('lastVisit');
                                    location.replace(lastVisit);
                                } else {
                                    location.replace(window.setting.prefixUrl+'/');
                                    // if(window.globalConfig.setup){
                                    //     location.replace(window.setting.prefixUrl+'/');
                                    // }else{
                                    //     location.replace(window.setting.prefixUrl+'/app/md/setup');
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
