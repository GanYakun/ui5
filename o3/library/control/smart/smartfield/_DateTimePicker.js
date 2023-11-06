/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
  'sap/m/DateTimePicker',
], function (DateTimePicker) {
  "use strict";

  var AnnotationHelper;
  var _DateTimePicker = DateTimePicker.extend('o3.library.control.smart.smartfield.SmartDateTimePicker', {
    metadata: {
      properties: {
        annotationHelper: {type: 'o3.library.model.AnnotationHelper'},
        entitySet: {type: 'string'},
        entityType: {type: 'string'},
        entityField: {type: 'string'},
      }
    },
    init: function () {
      // this.setValueFormat('yyyy-MM-dd HH:mm:ss');
      this.setDisplayFormat ('yyyy-MM-dd HH:mm:ss');
      DateTimePicker.prototype.init.apply(this, arguments);
    },
    renderer: function (oRm, oControl) {
      sap.m.DateTimePickerRenderer.render(oRm, oControl);
    }
  });

  _DateTimePicker.prototype.initAnnotation = function (oField, oAnnotationHelper) {
    this.setProperty('annotationHelper', oAnnotationHelper);
    AnnotationHelper = oAnnotationHelper;
  }

  return _DateTimePicker;
});