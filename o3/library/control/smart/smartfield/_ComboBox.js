/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
  'sap/ui/Device',
  'sap/m/ComboBox',
  'sap/ui/model/json/JSONModel',
  'sap/ui/core/Item',
], function (Device, ComboBox, JSONModel, Item) {
  "use strict";

  var AnnotationHelper;
  var _ComboBox = ComboBox.extend('o3.library.control.smart.smartfield._ComboBox', {
    metadata: {
      properties: {
        annotationHelper: {type: 'o3.library.model.AnnotationHelper'},
        entitySet: {type: 'string'},
        entityType: {type: 'string'},
        entityField: {type: 'string'},
      }
    },
    init: function () {
      ComboBox.prototype.init.apply(this, arguments);
      this.oField;//input控件

      this.attachLoadItems(this.onLoadItems, this);
    },
    renderer: function (oRm, oControl) {
      sap.m.ComboBoxRenderer.render(oRm, oControl);
    }
  });

  _ComboBox.prototype.initAnnotation = function (oField, oAnnotationHelper) {
    this.setProperty('annotationHelper', oAnnotationHelper);
    AnnotationHelper = oAnnotationHelper;

    this.oField = oField;
    this.oFieldData = AnnotationHelper.getEntityFieldAnnotation(this.getEntityType(), this.getEntityField());
  }

  _ComboBox.prototype.onLoadItems = function () {
    var that = this,
      oValueListMapping, sKey, sText;
    if (this.oFieldData) {//列表格式
      if (oValueListMapping = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueListMapping']) {//固定
        oValueListMapping.Parameters.some((oParameter) => {
          if (AnnotationHelper.isCommonValueListParameterInOut(oParameter)) {
            sKey = oParameter.ValueListProperty;
          } else {
            sText = oParameter.ValueListProperty;
          }
          if (sKey && sText) {
            return true;
          }
        });
        if (!sText) {
          sText = sKey;
        }

        this.bindItems({
          path: '/' + oValueListMapping.CollectionPath,
          template: new Item({
            key: {path: sKey},
            text: {path: sText}
          })
        });
      }
    }
  }

  return _ComboBox;
});