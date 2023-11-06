/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/core/Control',
    'sap/ui/core/Item',
    'sap/m/MultiComboBox',
    'o3/library/model/formatter',
    'o3/library/model/AnnotationHelper',
    'o3/library/control/smart/smartfield/_MultiInput',
    'o3/library/control/smart/smartfield/_DateRange',
    'o3/library/control/smart/smartfield/_MultiComboBox'
], function (Control, Item, MultiComboBox, formatter, AnnotationHelper, _MultiInput, _DateRange, _MultiComboBox) {

    "use strict";

    var SmartFieldSFB = Control.extend("o3.library.control.smart.smartfield.SmartFieldSFB", {
        metadata: {
            interfaces: ["sap.ui.core.IFormContent"],
            properties: {
                showValueHelp: { type: 'boolean', defaultValue: true },
                qualifier: { type: 'string', defaultValue: '' },
                value: { type: 'string', defaultValue: null },
                entitySet: { type: 'string', defaultValue: '' },
                entityField: { type: 'string', defaultValue: '' },
                multiple: { type: 'boolean', defaultValue: false },
                smartFilterBar: { type: 'o3.library.control.smart.smartfilterbar.SmartFilterBar', defaultValue: null },
                valueLiveUpdate: { type: 'boolean', defaultValue: true },
                valueState: { type: 'sap.ui.core.ValueState', group: 'Appearance', defaultValue: "None" },
                valueStateText: { type: 'string', group: 'Appearance', defaultValue: '' }
            },
            aggregations: {
                _control: { type: "sap.ui.core.Control", multiple: false, }
            }
        },

        renderer: {
            render: function (oRm, oControl) {
                oRm.write("<div ");
                oRm.writeControlData(oControl);
                oRm.addClass("sapUiCompSmartField");
                oRm.writeClasses();
                oRm.write(">");
                oRm.renderControl(oControl.getControl());
                if (oControl.getAggregation("_ariaLabelInvisibleText")) {
                    oControl.getAggregation("_ariaLabelInvisibleText").forEach(function (oInvisibleText) {
                        oRm.renderControl(oInvisibleText);
                    });
                }
                oRm.write("</div>");
            }
        },
        _getView: function (viewType, oObj) {
            if (!viewType) {
                viewType = "sap.ui.core.mvc.View";
            }
            while (oObj) {
                if (oObj.isA(viewType)) {
                    return oObj;
                }
                oObj = oObj.getParent();
            }
            return null;
        }
    });

    SmartFieldSFB.prototype.setControl = function (oContent) {
        return this.setAggregation("_control", oContent);
    };

    SmartFieldSFB.prototype.getControl = function () {
        return this.getAggregation("_control");
    };

    SmartFieldSFB.prototype.init = function () {
        this.attachModelContextChange(this.onModelContextChange);
        this.oMetadataInitialised = false;
        this.oFieldInfo = "";
        this.oControl = null;
    };

    SmartFieldSFB.prototype.isProperty = function () {
        let AnnotationConfig = this.data('AnnotationConfig');
        if (AnnotationConfig && AnnotationConfig['$kind'] === 'Property') {
            return true;
        }
        return false;
    }

    SmartFieldSFB.prototype.isCollectionNavigationProperty = function () {
        let AnnotationConfig = this.data('AnnotationConfig');
        if (AnnotationConfig && AnnotationConfig['$kind'] === 'NavigationProperty' && AnnotationConfig['$isCollection']) {
            return true;
        }
        return false;
    }

    SmartFieldSFB.prototype.getFormatedFilterRanges = function () {
        var oControl = this.oControl.data('dateRange');
        if (oControl.getFilterRanges) {
            var ranges = oControl.getFilterRanges();
            ranges.some((item) => {
                item.value1 = formatter.formatDate(item.value1);
                item.value2 = formatter.formatDate(item.value2);
            });
            return ranges;
        }
        console.error('is not date field');
    }

    SmartFieldSFB.prototype.onModelContextChange = function () {
        var oModel = this.getModel();
        AnnotationHelper.init(oModel).then(() => {
            if (this.oMetadataInitialised) {
                return;
            }
            this.oMetadataInitialised = true;
            this.oFieldInfo = AnnotationHelper.getAllFieldInfo(this.getEntitySet(), this.getEntityField());

            var mMethods = {
                "Edm.Decimal": "_createEdmNumeric",
                "Edm.Double": "_createEdmNumeric",
                "Edm.Float": "_createEdmNumeric",
                "Edm.Single": "_createEdmNumeric",
                "Edm.Int16": "_createEdmNumeric",
                "Edm.Int32": "_createEdmNumeric",
                "Edm.Int64": "_createEdmNumeric",
                "Edm.Byte": "_createEdmNumeric",
                "Edm.String": "_createEdmString",
                "Edm.DateTimeOffset": "_createEdmDateTimeOffset"
            };
            if (this.oFieldInfo.isEnumeration) {
                mMethods[this.oFieldInfo["$Type"]] = "_createEnumeration";
            }

            if (mMethods[this.oFieldInfo["$Type"]]) {
                if (this[mMethods[this.oFieldInfo["$Type"]]]) {
                    this.oControl = this[mMethods[this.oFieldInfo["$Type"]]](AnnotationHelper, this.oFieldInfo["$Type"]);
                } else {
                    console.error("missing method " + mMethods[this.oFieldInfo["$Type"]]);
                }
            } else {
                this.oControl = this._createEdmString(AnnotationHelper, this.oFieldInfo["$Type"]);
            }

            if (this.oControl.setEntityType) {
                this.oControl.setEntitySet(this.getEntitySet());
                this.oControl.setEntityType(this.oFieldInfo.entityType);
                this.oControl.setEntityField(this.getEntityField());
                this.oControl.initAnnotation(this, AnnotationHelper);
            }
            if (this.oControl.attachEvent) {
                this.oControl.attachEvent('_change', this.onValueChange, this);
            }
            this.oControl.oFieldInfo = this.oFieldInfo;
            this.setControl(this.oControl);

            if (this.getSmartFilterBar()) {
                let _oSmartVariant;
                _oSmartVariant = sap.ui.getCore().byId(this.getSmartFilterBar().getSmartVariant());
                if (_oSmartVariant) {
                    _oSmartVariant.fireInitvalue();
                }
                if (!_oSmartVariant) {
                    _oSmartVariant = this._getView("", this.getSmartFilterBar()).byId(this.getSmartFilterBar().getSmartVariant());
                    _oSmartVariant.fireInitvalue({ "_oControl": this });
                }
            }
            if (this.getSmartFilterBar()) {
                if (this.oControl.addToken) {
                    this.oControl.attachTokenUpdate((oEvent) => {
                        setTimeout(() => {
                            this.getSmartFilterBar().fireFilterChange(oEvent);
                        });
                    })
                }
                if(this.oControl.addSelectedKeys){
                    this.oControl.attachSelectionChange((oEvent) => {
                        setTimeout(() => {
                            this.getSmartFilterBar().fireFilterChange(oEvent);
                        });
                    })
                }
            }
        });
    };

    SmartFieldSFB.prototype.getValueState = function () {
        if (this.oControl && (typeof this.oControl.getValueState === 'function')) {
            return this.oControl.getValueState();
        }
        return this.getProperty('valueState');
    };

    SmartFieldSFB.prototype.setValueState = function (sValueState) {
        this.setProperty('valueState', sValueState, true);
        if (this.oControl && (typeof this.oControl.setValueState === 'function')) {
            return this.oControl.setValueState(sValueState);
        }
        return this;
    };

    SmartFieldSFB.prototype.onValueChange = function (oEvent) {
        if (this.getSmartFilterBar()) {
            this.getSmartFilterBar().fireFilterChange(oEvent);
        }
    };

    SmartFieldSFB.prototype._createEdmString = function () {
        return new _MultiInput({
            id: this.getId() + '-multiInput',
            showValueHelp: this.getShowValueHelp()
        });
    };

    SmartFieldSFB.prototype._createEdmDateTimeOffset = function () {
        var oControl;
        var oFilterProvider = {
            oModel: {
                setProperty: function () { },
            },
            _oSmartFilter: {
                getLiveMode: function () {
                    return false;
                },
                fireFilterChange: function () { },
            },
            setFilterData: function () { },
            _createFilterControlId: function () {
                return jQuery.sap.uid() + '-filterItemControl';
            }
        };
        var oDateRange = new _DateRange(this.getId() + '-dateRange', oFilterProvider, {});

        oDateRange.initialize({});
        oControl = oDateRange.initializeFilterItem();
        oControl.data('dateRange', oDateRange);

        return oControl;
    }

    SmartFieldSFB.prototype._createEdmNumeric = function () {
        return new _MultiInput({
            id: this.getId() + '-input',
            showValueHelp: this.getShowValueHelp()
        });
    };

    SmartFieldSFB.prototype._createEnumeration = function (AnnotationHelper, Type) {
        var oControl,
            arr = this.oFieldInfo.isEnumeration,
            items = [],
            that = this;

        items.push(new Item({
            key: '',
            text: '_NA_'
        }));
        arr.forEach(function (item) {
            items.push(new Item({
                key: that.oFieldInfo["$Type"] + "'" + item.key + "'",
                text: item.value
            }));
        });

        oControl = new _MultiComboBox({
            id: this.getId() + "-MultiComboBoxEnum",
            items: items
        });

        return oControl;
    };

    SmartFieldSFB.prototype.exit = function () {
        this.oMetadataInitialised = null;
        this.oFieldInfo = null;
        // if (this.oControl) {
        //     this.oControl.destroy();
        // }
        this.oControl = null;
    };

    return SmartFieldSFB;

}, true);