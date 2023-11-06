sap.ui.define([
    'sap/m/HBox',
    'sap/m/Text'
], function (HBox, Text) {
    "use strict";

    var AnnotationHelper;

    var _IconText = HBox.extend("o3.library.control.smart.smarttableV2._IconText", {
        metadata: {
            library: "sap.ui.comp",
            properties: {
                annotationHelper: { type: 'o3.library.model.AnnotationHelper' },
                entitySet: { type: 'string' },
                entityType: { type: 'string' },
                entityField: { type: 'string' }
            }
        },
        renderer: {
            apiVersion: 2
        },
        constructor: function () {
            HBox.apply(this, arguments);

        }
    });

    _IconText.prototype.init = function () {
        HBox.prototype.init.call(this);
        this._createIconText();
    };

    _IconText.prototype.initAnnotation = function (oField, oAnnotationHelper) {
        this.setProperty('annotationHelper', oAnnotationHelper);
        AnnotationHelper = oAnnotationHelper;
    }

    _IconText.prototype._createIconText = function () {
        let oIcon = new sap.ui.core.Icon({
            src: 'sap-icon://message-warning',
            color: '#f9a429'
        });
        oIcon.addStyleClass("sapUiTinyMarginEnd");

        this.insertItem(oIcon, 0);
        this.insertItem(new Text({
            text: { path: 'productName' }
        }), 1);
    };

    return _IconText;
});