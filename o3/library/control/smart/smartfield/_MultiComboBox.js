/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/m/MultiComboBox',
], function (MultiComboBox) {
    "use strict";

    var AnnotationHelper;
    var _MultiComboBox = MultiComboBox.extend('o3.library.control.smart.smartfield._MultiComboBox', {
        metadata: {
            properties: {
                annotationHelper: { type: 'o3.library.model.AnnotationHelper' },
                entitySet: { type: 'string' },
                entityType: { type: 'string' },
                entityField: { type: 'string' }
            }
        },
        init: function () {
            MultiComboBox.prototype.init.apply(this, arguments);
        },
        renderer: function (oRm, oControl) {
            sap.m.MultiComboBoxRenderer.render(oRm, oControl);
        }
    });

    _MultiComboBox.prototype.initAnnotation = function (oField, oAnnotationHelper) {
        this.setProperty('annotationHelper', oAnnotationHelper);
    }

    return _MultiComboBox;
});