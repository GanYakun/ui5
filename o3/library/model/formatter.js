sap.ui.define([
    "sap/ui/model/type/Currency",
    "sap/ui/model/resource/ResourceModel"
  ], function (Currency, ResourceModel) {
    "use strict";

    var i18nModel = new ResourceModel({
      bundleName: "o3.library.i18n.i18n"
    });
    var oResourceBundle = i18nModel.getResourceBundle();

    var Formatter = {
      formatDate: function (originalDate) {
        if (originalDate) {
          if (typeof originalDate === 'string') {
            originalDate = new Date(originalDate);
          }
          var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: 'yyyy-MM-ddTHH:mm:ss.SSSZ'});
          var formated = oDateFormat.format(originalDate);
          if (formated.substr(-3, 1) !== ':') {
            //确保最终返回格式为 2020-04-23T00:00:00.000+08:00
            formated = formated.substr(0, formated.length - 2) + ':' + formated.substr(-2);
          }
          return formated;
        }
        return '';
      },
      formatDisplayDate: function (originalDate) {
        if (originalDate) {
          if (typeof originalDate === 'string') {
            originalDate = new Date(originalDate);
          }
          var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: 'yyyy-MM-dd HH:mm:ss'});
          var formated = oDateFormat.format(originalDate);
          if (formated.substr(-3, 1) !== ':') {
            //确保最终返回格式为 2020-04-23T00:00:00.000+08:00
            formated = formated.substr(0, formated.length - 2) + ':' + formated.substr(-2);
          }
          return formated;
        }
        return '';
      }
    };

    return Formatter;
  }
);