sap.ui.define([
  'o3/home/controller/BaseController',
  'sap/m/MessageToast'
], function (BaseController, MessageToast) {
  'use strict';

  return BaseController.extend('o3.home.controller.Launchpad', {
    onInit() {

    },
    onTilePress(oEvent) {
      let {target, title} = oEvent.getSource().getBindingContext('launchpad').getObject();

      if (target) {
        if (location.pathname.search(target) == 0)
          history.go(-1);
        else
          location.href = location.origin + window.setting.prefixUrl + target;
      } else {
        MessageToast.show(title);
      }
    }
  });
});