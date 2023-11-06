/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
  'sap/m/Text',
], function (Text) {
  "use strict";

  var AnnotationHelper;
  var _Text = Text.extend('o3.library.control.smart.smartfield._Text', {
    metadata: {
      properties: {
        annotationHelper: {type: 'o3.library.model.AnnotationHelper'},
        entitySet: {type: 'string'},
        entityType: {type: 'string'},
        entityField: {type: 'string'},
      }
    },
    init: function () {
      Text.prototype.init.apply(this, arguments);
    },
    renderer: function (oRm, oControl) {
      sap.m.TextRenderer.render(oRm, oControl);
    }
  });

  _Text.prototype.initAnnotation = function (oField, oAnnotationHelper) {
    this.setProperty('annotationHelper', oAnnotationHelper);
    AnnotationHelper = oAnnotationHelper;
  }

  return _Text;
});