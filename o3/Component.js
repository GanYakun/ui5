sap.ui.define([
    'sap/ui/core/UIComponent',
    'o3/library/model/models',
  ],
  function (UIComponent, models, Router) {
    'use strict';

    return UIComponent.extend('o3.Component', {
      metadata: {
        manifest: 'json'
      },
      init: function () {
        var that = this;

        // call the init function of the parent
        UIComponent.prototype.init.apply(that, arguments);

        // set the device model
        that.setModel(models.createDeviceModel(), "device");

        // create the views based on the url/hash

        var targets = this.getTargets();
        var checkIsLogin = $.ajax({
          type: 'POST',
          async: false,
          url: '/dinstitute/control/checkIsLogin'
        });

        checkIsLogin.done(function (rsp) {
          if (!rsp.login) {
            o3Tool.cookie('lastVisit', location.href);
            location.replace(window.setting.prefixUrl + '/login/index.html');
          } else {
            that.getRouter().initialize();
          }
        });

        this.getGlobalRoute();
        window.getSemanticObjectQuickLinks = this.getSemanticObjectQuickLinks.bind(this);
        window.getGlobalRoute = this.getGlobalRoute.bind(this);
      },
      getGlobalQuickLinks: function () {
        let quickLinks = window['sap-ushell-config']['o3']['Personalization']['config']['quickLinks'];
        quickLinks = JSON.parse(JSON.stringify(quickLinks));
        return quickLinks;
      },
      getGlobalRoute: function () {
        if (!this.o3GlobalRoutes) {
          this.o3GlobalRoutes = new sap.ui.core.routing.Router();
          this.getGlobalQuickLinks().some((item) => {
            let pattern = item.semanticObject + '-' + item.semanticAction;
            if (item.route && item.route.pattern) {
              pattern += '&/' + item.route.pattern;
            }
            item.route.pattern = '#' + pattern;
            item.route.name = item.semanticObject + '-' + item.semanticAction + '.' + item.route.name;
            this.o3GlobalRoutes.addRoute(item.route);
          });
        }
        return this.o3GlobalRoutes;
      },
      getSemanticObjectQuickLinks: function (semanticObject) {
        if (jQuery.isEmptyObject(semanticObject)) {
          throw new Error("semanticObject is empty");
        }
        let links = [];
        this.getGlobalQuickLinks().some((item) => {
          if (item.semanticObject === semanticObject) {
            item.route.name = item.semanticObject + '-' + item.semanticAction + '.' + item.route.name;
            links.push(item);
          }
        });
        return links;
      }
    });
  });
