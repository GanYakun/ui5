sap.ui.define([
    'o3/home/controller/BaseController',
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    './MenuInsert'
], function (BaseController, Fragment, MessageToast, JSONModel, MenuInsert) {
    'use strict';

    return BaseController.extend('o3.home.controller.AppHeader', {
        onInit() {
            window.ofbizModel = this.getModel();
            this.oRouter = this.getRouter();
            this.oTitle = this.byId('appTitle');
            let rootData = Object.assign({
                logo: 'https://openui5.oss-accelerate.aliyuncs.com/1.73.1/resources/sap/ui/documentation/sdk/images/logo_ui5.png',
                userDisplayName: 'Jiejun.Liu',
                companyDisplayName: 'My Company (Chicago)',
                showMenu: true
            }, this.getOwnerComponent().getManifestEntry('dpbird.app'));

            if (!rootData.appTitle) rootData.appTitle = '未命名应用'
            if (location.pathname == '/app2/') rootData.showMenu = false;
            this.setModel(new JSONModel(rootData), 'rootData');

            // 应用标题变大变粗
            this.oTitle.setTitleStyle('H4').addEventDelegate({
                onAfterRendering: () => {
                    this.oTitle.getDomRef().style.fontWeight = 'Bold'
                }
            });

            // 插入多级菜单
            rootData.appMenu && MenuInsert.insertToHeader.call(this);
        },
        onAppMenuPress() {
            if (this.oRouter.getHashChanger().hash == 'launchpad') {
                history.go(-1)
            }
            this.oRouter.navTo('launchpad', false);
        },
        onHomePress() {
            location.href = '/app2/';
        },
        onNavButtonPress() {
            history.go(-1);
        },
        onNotificationsPress(oEvent) {
            let oButton = oEvent.getSource();
            if (!this._oNotificationPopover) {
                Fragment.load({
                    type: "XML",
                    definition: `
            <Popover xmlns="sap.m"
              placement="Bottom"
              showHeader="false"
              class="sapNotificationsPopover"
              contentMinWidth="500px">
              <footer>
                <OverflowToolbar>
                  <ToolbarSpacer/>
                  <Button text="清除"/>
                </OverflowToolbar>
              </footer>
              <IconTabBar
                expandable="false"
                backgroundDesign="Transparent">
                <items>
                  <IconTabFilter text="最新">
                    <List>
                      <StandardListItem
                        type="Navigation"
                        class="sapMMsgViewItemError"
                        title="创建场 所失败"
                        icon="sap-icon://message-error"/>
                      <StandardListItem
                        type="Navigation"
                        class="sapMMsgViewItemWarning"
                        title="order[10092]，支付异常"
                        description="支付预期超出订单总额"
                        icon="sap-icon://message-warning"/>
                      <StandardListItem
                        type="Navigation"
                        title="你好刘杰君，在使用前请先初始化数据"
                        icon="sap-icon://message-information"/>
                      <StandardListItem
                        type="Navigation"
                        title="你好刘杰君，欢迎使用O3系统"
                        icon="sap-icon://message-information"/>
                    </List>
                  </IconTabFilter>
                  <IconTabFilter text="站内信">
                    <List>
                      <StandardListItem
                        type="Navigation"
                        title="你好刘杰君，在使用前请先初始化数据"
                        icon="sap-icon://message-information"/>
                      <StandardListItem
                        type="Navigation"
                        title="你好刘杰君，欢迎使用O3系统"
                        icon="sap-icon://message-information"/>
                    </List>
                  </IconTabFilter>
                  <IconTabFilter text="预警">
                    <List>
                      <StandardListItem
                        type="Navigation"
                        class="sapMMsgViewItemWarning"
                        title="order[10092]，支付异常"
                        description="支付预期超出订单总额"
                        icon="sap-icon://message-warning"/>
                    </List>
                  </IconTabFilter>
                  <IconTabFilter text="错误">
                    <List>
                      <StandardListItem
                        type="Navigation"
                        class="sapMMsgViewItemError"
                        title="创建场所失败"
                        icon="sap-icon://message-error"/>
                    </List>
                  </IconTabFilter>
                </items>
              </IconTabBar>
            </Popover>
          `,
                    controller: {}
                }).then(popover => {
                    this._oNotificationPopover = popover;
                    this.getView().addDependent(popover);
                    popover.openBy(oButton);
                });
            } else {
                this._oNotificationPopover.openBy(oButton);
            }
        },
        onCompanyPress(oEvent) {
            let oButton = oEvent.getSource();
            if (!this._oCompanyPopover) {
                let companyNav = [
                    {text: 'My Company (Chicago)', key: 1},
                    {text: 'My Company (San Francisco)', key: 2}
                ];

                this.setModel(new JSONModel(companyNav), 'companyNav');
                Fragment.load({
                    type: "XML",
                    definition: `
            <ResponsivePopover xmlns="sap.m" xmlns:core="sap.ui.core"
              showHeader="{device>/system/phone}"
              title="切换公司"
              placement="Bottom">
              <SelectList
                selectedKey="1"
                items="{path: 'companyNav>/'}">
                <core:Item text="{companyNav>text}" key="{companyNav>key}"/>
              </SelectList>
            </ResponsivePopover>
					`
                }).then(popover => {
                    this._oCompanyPopover = popover;
                    this.getView().addDependent(popover);
                    popover.openBy(oButton);
                });
            } else {
                this._oCompanyPopover.openBy(oButton);
            }
        },
        onUserBtnPress(oEvent) {
            let oButton = oEvent.getSource();
            if (!this._oUserPopover) {
                let userNav = [
                    {text: 'About', pressKey: 'getSystemInfo'},
                    {text: 'My Configuration', pressKey: ''},
                    {text: 'In Mail', pressKey: ''},
                    {text: 'App Finder', pressKey: ''},
                    {text: 'DB account', pressKey: ''},
                    {text: 'Log Out', pressKey: '_onLogout'}
                ];

                this.setModel(new JSONModel(userNav), 'userNav');
                Fragment.load({
                    type: "XML",
                    definition: `
            <ResponsivePopover xmlns="sap.m"
              title="{rootData>/userDisplayName}"
              placement="Bottom">
              <List
                showSeparators="None"
                items="{path: 'userNav>/'}">
                <StandardListItem title="{userNav>text}" type="Active" press="onUserPress" />
              </List>
            </ResponsivePopover>
					`,
                    controller: {
                        onUserPress: oEvent => {
                            let pressKey = oEvent.getSource().oBindingContexts.userNav.getObject('pressKey');
                            if (pressKey) {
                                this[pressKey]();
                            }
                        }
                    }
                }).then(popover => {
                    this._oUserPopover = popover;
                    this.getView().addDependent(popover);
                    popover.openBy(oButton);
                });
            } else {
                this._oUserPopover.openBy(oButton);
            }
        },
        _onLogout() {
            $.ajax({
                type: 'POST',
                url: '/officeauto/control/logout',
                complete: function () {
                    o3Tool.removeCookie('userLoginId');
                    o3Tool.removeCookie('lastVisit');
                    var pathArr = location.pathname.split('/');
                    location.replace('/' + pathArr[1] + '/login');
                }
            });
        },
        getSystemInfo: function() {
          var that = this;
            $.ajax({
                type: 'POST',
                url: '/o3/control/getSystemInfo',
                complete: function (rsp) {
                    var info = rsp.responseJSON.info;
                    if(info){
                      that.setModel(new JSONModel(JSON.parse(info)), 'dialogModel');
                      console.log(JSON.parse(info));
                    }
                    that.openSystemInfoDialog();
                }
            });
        },
        openSystemInfoDialog: function () {
            var that = this;
            Fragment.load({
                type: "XML",
                definition: `
                  <core:FragmentDefinition xmlns="sap.m"
                    xmlns:l="sap.ui.layout" 
                    xmlns:f="sap.ui.layout.form"
                    xmlns:core="sap.ui.core">
                     <Dialog contentWidth="500px" title="系统信息">
                        <content>
                            <f:SimpleForm 
                              layout="ResponsiveGridLayout"
                              labelSpanS="4">
                              <f:content>
                                <Label text="branch"/>
                                <Text text='{dialogModel>/branch}'/>
                                <Label text="buildDate"/>
                                <Text text='{dialogModel>/buildDate}'/>
                                <Label text="commint"/>
                                <Text text='{dialogModel>/commint}'/>
                                <Label text="description"/>
                                <Text text='{dialogModel>/description}'/>
                                <Label text="tag"/>
                                <Text text='{dialogModel>/tag}'/>
                                <Label text="tenantId"/>
                                <Text text='{dialogModel>/tenantId}'/>
                              </f:content>
                            </f:SimpleForm>
                        </content>
                        <buttons>
                          <Button text="关闭" press="close" type="Transparent" />
                        </buttons>
                      </Dialog>
                  </core:FragmentDefinition>`,
                controller: {
                    close:() => {
                        that._systemInfoDialog.close();
                    }
                }
            }).then(function(dialog){
                    that._systemInfoDialog = dialog;
                    that.getView().addDependent(dialog);
                    dialog.open();
            }.bind(that));
        }
    });
});