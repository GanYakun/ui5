sap.ui.define([
    'o3/home/controller/BaseController',
], function (BaseController) {
    'use strict';

    return BaseController.extend('o3.home.controller.OneColumn', {
        onInit() {
            console.log('o3.home.controller.OneColumn')
            // AppHeader.prototype.onInit.call(this);
            this.oRouter = this.getRouter();
            this.oRouter.attachBypassed(this.onRouteNotFound.bind(this));
            this.oRouter.attachRouteMatched(this.onRouteChange.bind(this));
        },
        onRouteChange(oEvent) {
            console.log(oEvent.getParameter('name'));
        },
        onRouteNotFound() {
            this.oRouter.getTargets().display('notFound');
        }
    });
});