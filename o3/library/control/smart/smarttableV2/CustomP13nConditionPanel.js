/* eslint-disable block-scoped-var */
sap.ui.define([
    'sap/m/P13nConditionPanel',
    'sap/ui/layout/GridData',
    'sap/ui/core/Item',
    'sap/ui/core/ListItem',
    'sap/ui/model/type/Date',
    'sap/ui/model/type/Time',
    'sap/ui/model/odata/type/DateTime',
    'sap/m/Select',
    'sap/m/ComboBox',
    'sap/m/TimePicker',
    'sap/m/DateTimePicker',
    'sap/m/Input',
    'sap/m/DatePicker',
    'sap/m/library',
    'sap/m/CheckBox',
    'sap/ui/core/IconPool'
], function (P13nConditionPanel, GridData, Item, ListItem, Date, Time, DateTime, Select, ComboBox, TimePicker, DateTimePicker, Input, DatePicker, library, CheckBox, IconPool) {
    "use strict";
    var P13nConditionOperation = library.P13nConditionOperation;
    var Grid;
    var GridData;
    var HorizontalLayout;
    var ButtonType = library.ButtonType;

    const CustomP13nConditionPanel = P13nConditionPanel.extend("o3.library.control.smart.smarttableV2.CustomP13nConditionPanel", {
        metadata: {
            library: "sap.m"
        },
        renderer(oRm, oControl) {
            oRm.openStart("section", oControl);
            oRm.class("sapMConditionPanel");
            oRm.openEnd();
            oRm.openStart("div");
            oRm.class("sapMConditionPanelContent");
            oRm.class("sapMConditionPanelBG");
            oRm.openEnd();
            oControl.getAggregation("content").forEach(function (oChildren) {
                oRm.renderControl(oChildren);
            });
            oRm.close("div");
            oRm.close("section");
        }
    });

    CustomP13nConditionPanel.prototype.init = function () {
        sap.ui.getCore().loadLibrary("sap.ui.layout");
        Grid = Grid || sap.ui.requireSync("sap/ui/layout/Grid");
        GridData = GridData || sap.ui.requireSync("sap/ui/layout/GridData");
        HorizontalLayout = HorizontalLayout || sap.ui.requireSync("sap/ui/layout/HorizontalLayout");

        P13nConditionPanel.prototype.init.apply(this, arguments);
    };

    CustomP13nConditionPanel.prototype._createValueField = function (oCurrentKeyField, oFieldInfo, oConditionGrid) {
        var oControl;
        var sCtrlType;
        var that = this;

        var params = {
            value: oFieldInfo["Value"],
            width: "100%",
            placeholder: oFieldInfo["Label"],
            change: function (oEvent) {
                that._validateAndFormatFieldValue(oEvent);
                that._changeField(oConditionGrid, oEvent);
            },
            layoutData: new GridData({
                span: oFieldInfo["Span" + this._sConditionType]
            })
        };

        if (oCurrentKeyField && oCurrentKeyField.typeInstance) {
            var oType = oCurrentKeyField.typeInstance;
            // sCtrlType = this._findConfig(oType, "ctrl");
            sCtrlType = oCurrentKeyField.type;
            if (sCtrlType !== "select") {
                sCtrlType = this._findConfig(oType, "ctrl");
            }

            // use the DatePicker when type is sap.ui.model.odata.type.DateTime and displayFormat = Date
            if (sCtrlType === "DateTimePicker" && oType.getMetadata().getName() === "sap.ui.model.odata.type.DateTime") {
                if (!(oType.oConstraints && oType.oConstraints.isDateOnly)) {
                    Log.error("sap.m.P13nConditionPanel", "sap.ui.model.odata.type.DateTime without displayFormat = Date is not supported!");
                    oType.oConstraints = Object.assign({}, oType.oConstraints, { isDateOnly: true });
                }
                sCtrlType = "DatePicker";
            }
            //var aOperators = this._findConfig(oType, "operators");

            oConditionGrid.oType = oType;

            if (sCtrlType == "select") {
                var aItems = [];
                // var aValues = oCurrentKeyField.values || this._oTypeValues[sCtrlType] || ["", oType.formatValue(false, "string"), oType.formatValue(true, "string")];
                if (oCurrentKeyField.values.length > 1) {
                    let aValues = JSON.parse(oCurrentKeyField.values[1]);
                    aItems.push({
                        key: "",
                        text: ""
                    })
                    aValues.forEach(function (oValue, index) {
                        aItems.push(new Item({
                            key: oCurrentKeyField.values[0] + "'" + oValue.key + "'",
                            text: oValue.value
                        }));
                    });
                    params = {
                        width: "100%",
                        items: aItems,
                        change: function () {
                            that._changeField(oConditionGrid);
                            that._makeFieldValid(oControl, true);
                        },
                        layoutData: new GridData({
                            span: oFieldInfo["Span" + this._sConditionType]
                        })
                    };
                    oControl = new Select(params);
                } else {
                    let aValues = JSON.parse(oCurrentKeyField.values[0]);
                    params = {
                        width: "100%",
                        change: function () {
                            that._changeField(oConditionGrid);
                            that._makeFieldValid(oControl, true);
                        },
                        layoutData: new GridData({
                            span: oFieldInfo["Span" + this._sConditionType]
                        })
                    };
                    oControl = new Select(params);

                    var oItemTemplate = new sap.ui.core.Item({
                        key: { path: aValues[0].key },
                        text: { path: aValues[0].text }
                    });
                    oControl.bindItems({
                        path: "/" + aValues[0].collection,
                        template: oItemTemplate,
                        events: {
                            dataReceived: function () {
                                oControl.insertItem(new sap.ui.core.Item({
                                    key: '',
                                    text: '_NA_'
                                }), 0);
                            }
                        }
                    });
                }
            } else if (sCtrlType == "TimePicker") {
                if (oType.oFormatOptions && oType.oFormatOptions.style) {
                    params.displayFormat = oType.oFormatOptions.style;
                }
                oControl = new TimePicker(params);
            } else if (sCtrlType == "DateTimePicker") {
                if (oType.oFormatOptions && oType.oFormatOptions.style) {
                    params.displayFormat = oType.oFormatOptions.style;
                }
                oControl = new DateTimePicker(params);
            } else if (sCtrlType === "DatePicker") {
                if (oType.oFormatOptions) {
                    params.displayFormat = oType.oFormatOptions.style || oType.oFormatOptions.pattern;

                    if (oType.isA("sap.ui.comp.odata.type.StringDate")) {
                        params.valueFormat = "yyyyMMdd";
                    }
                }
                oControl = new DatePicker(params);
            } else {
                oControl = new Input(params);

                //TODO oType should only be set when type is string!
                if (this._fSuggestCallback) {
                    oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
                    if (oCurrentKeyField && oCurrentKeyField.key) {
                        var oSuggestProvider = this._fSuggestCallback(oControl, oCurrentKeyField.key);
                        if (oSuggestProvider) {
                            oControl._oSuggestProvider = oSuggestProvider;
                        }
                    }
                }

            }
        } else {
            // for a new added dummy row, which does not have a oCurrentKeyField, we have to create a dummy input field.
            oConditionGrid.oType = null;
            oControl = new Input(params);
        }

        if (sCtrlType !== "boolean" && sCtrlType !== "enum" && oControl) {
            oControl.onpaste = function (oEvent) {

                var sOriginalText;
                // for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
                if (window.clipboardData) {
                    //IE
                    sOriginalText = window.clipboardData.getData("Text");
                } else {
                    // Chrome, Firefox, Safari
                    sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
                }

                var oConditionGrid = oEvent.srcControl.getParent();
                var aSeparatedText = sOriginalText.split(/\r\n|\r|\n/g);

                var oOperation = oConditionGrid.operation;
                var op = oOperation.getSelectedKey();

                if (aSeparatedText && aSeparatedText.length > 1 && op !== "BT") {
                    setTimeout(function () {
                        var iLength = aSeparatedText ? aSeparatedText.length : 0;
                        var oKeyField = that._getCurrentKeyFieldItem(oConditionGrid.keyField);
                        var oOperation = oConditionGrid.operation;

                        for (var i = 0; i < iLength; i++) {
                            if (that._aConditionKeys.length >= that._getMaxConditionsAsNumber()) {
                                break;
                            }

                            var sPastedValue = aSeparatedText[i].trim();

                            if (sPastedValue) {
                                var oPastedValue;

                                if (oKeyField.typeInstance) {
                                    // If a typeInstance exist, we have to parse and validate the pastedValue before we can add it a value into the condition.
                                    // or we do not handle the paste for all types except String!
                                    try {
                                        oPastedValue = oKeyField.typeInstance.parseValue(sPastedValue, "string");
                                        oKeyField.typeInstance.validateValue(oPastedValue);
                                    } catch (err) {
                                        Log.error("sap.m.P13nConditionPanel.onPaste", "not able to parse value " + sPastedValue + " with type " + oKeyField.typeInstance.getName());
                                        sPastedValue = "";
                                        oPastedValue = null;
                                    }

                                    if (!oPastedValue) {
                                        continue;
                                    }
                                }

                                var oCondition = {
                                    "key": that._createConditionKey(),
                                    "exclude": that.getExclude(),
                                    "operation": oOperation.getSelectedKey(),
                                    "keyField": oKeyField.key,
                                    "value1": oPastedValue,
                                    "value2": null
                                };
                                that._addCondition2Map(oCondition);

                                that.fireDataChange({
                                    key: oCondition.key,
                                    index: oCondition.index,
                                    operation: "add",
                                    newData: oCondition
                                });
                            }
                        }

                        that._clearConditions();
                        that._fillConditions();
                    }, 0);
                }
            };
        }

        if (oCurrentKeyField && oCurrentKeyField.maxLength && oControl.setMaxLength) {
            var l = -1;
            if (typeof oCurrentKeyField.maxLength === "string") {
                l = parseInt(oCurrentKeyField.maxLength);
            }
            if (typeof oCurrentKeyField.maxLength === "number") {
                l = oCurrentKeyField.maxLength;
            }
            if (l > 0 && (!oControl.getShowSuggestion || !oControl.getShowSuggestion())) {
                oControl.setMaxLength(l);
            }
        }

        return oControl;
    };

    CustomP13nConditionPanel.prototype._changeField = function (oConditionGrid, oEvent) {
        var sKeyField = oConditionGrid.keyField.getSelectedKey();
        if (oConditionGrid.keyField.getSelectedItem()) {
            oConditionGrid.keyField.setTooltip(oConditionGrid.keyField.getSelectedItem().getTooltip() || oConditionGrid.keyField.getSelectedItem().getText());
        } else {
            oConditionGrid.keyField.setTooltip(null);
        }

        var sOperation = oConditionGrid.operation.getSelectedKey();
        if (oConditionGrid.operation.getSelectedItem()) {
            oConditionGrid.operation.setTooltip(oConditionGrid.operation.getSelectedItem().getTooltip() || oConditionGrid.operation.getSelectedItem().getText());
        } else {
            oConditionGrid.operation.setTooltip(null);
        }

        var getValuesFromField = function (oControl, oType) {
            var sValue;
            var oValue;
            if (oControl.getDateValue && !(oControl.isA("sap.m.TimePicker")) && oType.getName() !== "sap.ui.comp.odata.type.StringDate") {
                oValue = oControl.getDateValue();
                if (oType && oValue) {
                    if ((oEvent && oEvent.getParameter("valid")) || oControl.isValidValue()) {
                        sValue = oType.formatValue(oValue, "string");
                    } else {
                        sValue = "";
                    }
                }
            }
            // add by ywd 20200807
            else if (oControl.isA("sap.m.Select")) {
                sValue = oControl.getSelectedKey();  // this._getValueTextFromField(oControl)
                oValue = sValue;
            } else {
                sValue = this._getValueTextFromField(oControl);
                oValue = sValue;
                if (oType && oType.getName() === "sap.ui.comp.odata.type.StringDate") {
                    sValue = oType.formatValue(oValue, "string");
                } else if (oType && sValue) {
                    try {
                        oValue = oType.parseValue(sValue, "string");
                        oType.validateValue(oValue);
                    } catch (err) {
                        Log.error("sap.m.P13nConditionPanel", "not able to parse value " + sValue + " with type " + oType.getName());
                        sValue = "";
                    }
                }
            }
            return [oValue, sValue];
        }.bind(this);

        // update Value1 field control
        var aValues = getValuesFromField(oConditionGrid.value1, oConditionGrid.oType);
        var oValue1 = aValues[0], sValue1 = aValues[1];

        // update Value2 field control
        aValues = getValuesFromField(oConditionGrid.value2, oConditionGrid.oType);
        var oValue2 = aValues[0], sValue2 = aValues[1];

        // in case of a BT and a Date type try to set the minDate/maxDate for the From/To value datepicker
        if (sOperation === "BT") {
            this._updateMinMaxDate(oConditionGrid, oValue1, oValue2);
        } else {
            this._updateMinMaxDate(oConditionGrid, null, null);
        }

        var oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
        if (oCurrentKeyField && oCurrentKeyField.type === "numc") {
            // in case of type numc and Contains or EndsWith operator the leading 0 will be removed
            if ([P13nConditionOperation.Contains, P13nConditionOperation.EndsWith].indexOf(sOperation) != -1) {
                oValue1 = oConditionGrid.oType.formatValue(oValue1, "string");
            }
        }

        var bShowIfGrouped = oConditionGrid.showIfGrouped.getSelected();
        var bExclude = this.getExclude();
        var oSelectCheckbox = oConditionGrid.select;
        var sValue = "";
        var sKey;

        if (sKeyField === "" || sKeyField == null) {
            // handling of "(none)" or wrong entered keyField value
            sKeyField = null;
            sKey = this._getKeyFromConditionGrid(oConditionGrid);
            this._removeConditionFromMap(sKey);

            this._enableCondition(oConditionGrid, false);
            var iIndex = this._getIndexOfCondition(oConditionGrid);

            if (oSelectCheckbox.getSelected()) {
                oSelectCheckbox.setSelected(false);
                oSelectCheckbox.setEnabled(false);

                this._bIgnoreSetConditions = true;
                this.fireDataChange({
                    key: sKey,
                    index: iIndex,
                    operation: "remove",
                    newData: null
                });
                this._bIgnoreSetConditions = false;
            }
            return;
        }

        this._enableCondition(oConditionGrid, true);

        sValue = this._getFormatedConditionText(sOperation, sValue1, sValue2, bExclude, sKeyField, bShowIfGrouped);

        // begin: add by ywd 20200902
        if (oValue1 && oValue1.getFullYear) {
            oValue1 = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd" }).format(oValue1);
        }
        if (oValue2 && oValue2.getFullYear) {
            oValue2 = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd" }).format(oValue2);
        }

        var oConditionData = {
            "value": sValue,
            "exclude": bExclude,
            "operation": sOperation,
            "keyField": sKeyField,
            "value1": oValue1,
            "value2": sOperation === P13nConditionOperation.BT ? oValue2 : null,
            "showIfGrouped": bShowIfGrouped
        };
        sKey = this._getKeyFromConditionGrid(oConditionGrid);

        if (sValue !== "") {
            oSelectCheckbox.setSelected(true);
            oSelectCheckbox.setEnabled(true);

            var sOperation = "update";
            if (!this._oConditionsMap[sKey]) {
                sOperation = "add";
            }

            this._oConditionsMap[sKey] = oConditionData;
            if (sOperation === "add") {
                this._aConditionKeys.splice(this._getIndexOfCondition(oConditionGrid), 0, sKey);
            }
            //this._addCondition2Map(oConditionData, this._getIndexOfCondition(oConditionGrid));

            oConditionGrid.data("_key", sKey);

            this.fireDataChange({
                key: sKey,
                index: this._getIndexOfCondition(oConditionGrid),
                operation: sOperation,
                newData: oConditionData
            });
        } else if (this._oConditionsMap[sKey] !== undefined) {
            this._removeConditionFromMap(sKey);
            oConditionGrid.data("_key", null);
            var iIndex = this._getIndexOfCondition(oConditionGrid);

            if (oSelectCheckbox.getSelected()) {
                oSelectCheckbox.setSelected(false);
                oSelectCheckbox.setEnabled(false);

                this._bIgnoreSetConditions = true;
                this.fireDataChange({
                    key: sKey,
                    index: iIndex,
                    operation: "remove",
                    newData: null
                });
                this._bIgnoreSetConditions = false;
            }
        }

        this._updatePaginatorToolbar();
    };

    CustomP13nConditionPanel.prototype._createConditionRow = function (oTargetGrid, oConditionGridData, sKey, iPos, bUseRowFromAbove) {

        var oButtonContainer = null;
        var oGrid;
        var that = this;

        if (iPos === undefined) {
            iPos = oTargetGrid.getContent().length;
        }

        var oConditionGrid = new Grid({
            width: "100%",
            defaultSpan: "L12 M12 S12",
            hSpacing: 1,
            vSpacing: 0,
            containerQuery: this.getContainerQuery()
        }).data("_key", sKey);
        oConditionGrid.addStyleClass("sapUiRespGridOverflowHidden");

        /* eslint-disable no-loop-func */
        for (var iField in this._aConditionsFields) {
            var oControl;
            var field = this._aConditionsFields[iField];

            switch (field["Control"]) {
                case "CheckBox":
                    // the CheckBox is not visible and only used internal to validate if a condition is
                    // filled correct.
                    oControl = new CheckBox({
                        enabled: false,
                        visible: false,
                        layoutData: new GridData({
                            span: field["Span" + this._sConditionType]
                        })
                    });

                    if (field["ID"] === "showIfGrouped") {
                        oControl.setEnabled(true);
                        oControl.setText(field["Label"]);
                        oControl.attachSelect(function () {
                            that._changeField(oConditionGrid);
                        });

                        oControl.setSelected(oConditionGridData ? oConditionGridData.showIfGrouped : true);
                    } else {
                        if (oConditionGridData) {
                            oControl.setSelected(true);
                            oControl.setEnabled(true);
                        }
                    }
                    break;

                case "ComboBox":
                    if (field["ID"] === "keyField") {
                        oControl = new ComboBox({ // before we used the new sap.m.Select control
                            width: "100%",
                            ariaLabelledBy: this._oInvisibleTextField
                        });

                        var fOriginalKey = oControl.setSelectedKey.bind(oControl);
                        oControl.setSelectedKey = function (sKey) {
                            fOriginalKey(sKey);
                            var fValidate = that.getValidationExecutor();
                            if (fValidate) {
                                fValidate();
                            }
                        };

                        var fOriginalItem = oControl.setSelectedItem.bind(oControl);
                        oControl.setSelectedItem = function (oItem) {
                            fOriginalItem(oItem);
                            var fValidate = that.getValidationExecutor();
                            if (fValidate) {
                                fValidate();
                            }
                        };

                        oControl.setLayoutData(new GridData({
                            span: field["Span" + this._sConditionType]
                        }));

                        this._fillKeyFieldListItems(oControl, this._aKeyFields);

                        if (oControl.attachSelectionChange) {
                            oControl.attachSelectionChange(function (oEvent) {
                                var fValidate = that.getValidationExecutor();
                                if (fValidate) {
                                    fValidate();
                                }

                                that._handleSelectionChangeOnKeyField(oTargetGrid, oConditionGrid);
                            });
                        }

                        if (oControl.attachChange) {
                            oControl.attachChange(function (oEvent) {
                                oConditionGrid.keyField.close();
                                that._handleChangeOnKeyField(oTargetGrid, oConditionGrid);
                            });
                        }

                        if (oControl.setSelectedItem) {
                            if (oConditionGridData) {
                                oControl.setSelectedKey(oConditionGridData.keyField);
                                this._aKeyFields.forEach(function (oKeyField, index) {
                                    var key = oKeyField.key;
                                    if (key === undefined) {
                                        key = oKeyField;
                                    }
                                    if (oConditionGridData.keyField === key) {
                                        oControl.setSelectedItem(oControl.getItems()[index]);
                                    }
                                }, this);
                            } else {
                                if (this.getUsePrevConditionSetting() && !this.getAutoReduceKeyFieldItems()) {
                                    // select the key from the condition above
                                    if (iPos > 0 && !sKey && bUseRowFromAbove) { //bUseRowFromAbove determines, if the default needs to be used
                                        oGrid = oTargetGrid.getContent()[iPos - 1];
                                        if (oGrid.keyField.getSelectedKey()) {
                                            oControl.setSelectedKey(oGrid.keyField.getSelectedKey());
                                        } else {
                                            // if no item is selected, we have to select at least the first keyFieldItem
                                            if (!oControl.getSelectedItem() && oControl.getItems().length > 0) {
                                                oControl.setSelectedItem(oControl.getItems()[0]);
                                            }
                                        }
                                    } else {
                                        this._aKeyFields.some(function (oKeyField, index) {
                                            if (oKeyField.isDefault) {
                                                oControl.setSelectedItem(oControl.getItems()[index]);
                                                return true;
                                            }
                                            if (!oControl.getSelectedItem() && oKeyField.type !== "boolean") {
                                                oControl.setSelectedItem(oControl.getItems()[index]);
                                            }
                                        }, this);

                                        // if no item is selected, we have to select at least the first keyFieldItem
                                        if (!oControl.getSelectedItem() && oControl.getItems().length > 0) {
                                            oControl.setSelectedItem(oControl.getItems()[0]);
                                        }
                                    }
                                } else {
                                    this._aKeyFields.forEach(function (oKeyField, index) {
                                        if (oKeyField.isDefault) {
                                            oControl.setSelectedItem(oControl.getItems()[index]);
                                        }
                                    }, this);
                                }
                            }
                        }
                    }

                    if (field["ID"] === "operation") {
                        oControl = new Select({
                            width: "100%",
                            ariaLabelledBy: this._oInvisibleTextOperator,
                            layoutData: new GridData({
                                span: field["Span" + this._sConditionType]
                            })
                        });

                        oControl.attachChange(function () {
                            that._handleChangeOnOperationField(oTargetGrid, oConditionGrid);
                        });

                        // oControl.attachSelectionChange(function() {
                        // that._handleChangeOnOperationField(oTargetGrid, oConditionGrid);
                        // });

                        // fill some operations to the control to be able to set the selected items
                        oConditionGrid[field["ID"]] = oControl;
                        this._updateOperationItems(oTargetGrid, oConditionGrid);

                        if (oConditionGridData) {
                            var oKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
                            var aOperations = this._oTypeOperations["default"];
                            if (oKeyField) {
                                if (oKeyField.type && this._oTypeOperations[oKeyField.type]) {
                                    aOperations = this._oTypeOperations[oKeyField.type];
                                }
                                if (oKeyField.operations) {
                                    aOperations = oKeyField.operations;
                                }
                            }

                            aOperations.some(function (oOperation, index) {
                                if (oConditionGridData.operation === oOperation) {
                                    oControl.setSelectedKey(oOperation);
                                    return true;
                                }
                            }, this);
                        } else {
                            if (this.getUsePrevConditionSetting()) {
                                // select the key from the condition above
                                if (iPos > 0 && sKey === null) {
                                    var oGrid = oTargetGrid.getContent()[iPos - 1];
                                    oControl.setSelectedKey(oGrid.operation.getSelectedKey());
                                }
                            }
                        }
                    }

                    // init tooltip of select control
                    if (oControl.getSelectedItem && oControl.getSelectedItem()) {
                        oControl.setTooltip(oControl.getSelectedItem().getTooltip() || oControl.getSelectedItem().getText());
                    }

                    break;

                case "TextField":
                    var oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
                    oControl = this._createValueField(oCurrentKeyField, field, oConditionGrid);
                    oControl.oTargetGrid = oTargetGrid;

                    if (oConditionGridData && oConditionGridData[field["ID"]] !== undefined) {
                        var vValue = oConditionGridData[field["ID"]];

                        if (oControl instanceof Select) {
                            if (typeof vValue === "boolean") {
                                oControl.setSelectedIndex(vValue ? 2 : 1);
                            }
                            // add by ywd 20200807
                            else {
                                oControl.setSelectedKey(vValue);
                            }
                        } else if (vValue !== null && oConditionGrid.oType) {

                            // In case vValue is of type string, and type is StringDate we can set the value without formatting.
                            if (typeof vValue === "string" && oConditionGrid.oType.getName() === "sap.ui.comp.odata.type.StringDate") {
                                oControl.setValue(vValue);
                            } else {
                                // In case vValue is of type string, we try to convert it into the type based format.
                                if (typeof vValue === "string" && ["String", "sap.ui.model.odata.type.String", "sap.ui.model.odata.type.Decimal"].indexOf(oConditionGrid.oType.getName()) == -1) {
                                    try {
                                        vValue = oConditionGrid.oType.parseValue(vValue, "string");
                                        oControl.setValue(oConditionGrid.oType.formatValue(vValue, "string"));
                                    } catch (err) {
                                        Log.error("sap.m.P13nConditionPanel", "Value '" + vValue + "' does not have the expected type format for " + oConditionGrid.oType.getName() + ".parseValue()");
                                    }
                                } else {
                                    oControl.setValue(oConditionGrid.oType.formatValue(vValue, "string"));
                                }
                            }

                        } else {
                            oControl.setValue(vValue);
                        }
                    }
                    break;

                case "Label":
                    oControl = new sap.m.Label({
                        text: field["Text"] + ":",
                        visible: this.getShowLabel(),
                        layoutData: new GridData({
                            span: field["Span" + this._sConditionType]
                        })
                    }).addStyleClass("conditionLabel");

                    oControl.oTargetGrid = oTargetGrid;
                    break;
            }

            oConditionGrid[field["ID"]] = oControl;
            oConditionGrid.addContent(oControl);
        }
        /* eslint-enable no-loop-func */

        // create a hLayout container for the remove and add buttons
        oButtonContainer = new HorizontalLayout({
            layoutData: new GridData({
                span: this.getLayoutMode() === "Desktop" ? "L2 M2 S2" : this._oButtonGroupSpan["Span" + this._sConditionType]
            })
        }).addStyleClass("floatRight");
        oConditionGrid.addContent(oButtonContainer);
        oConditionGrid["ButtonContainer"] = oButtonContainer;

        // create "Remove button"
        var oRemoveControl = new sap.m.Button({
            type: ButtonType.Transparent,
            icon: IconPool.getIconURI("sys-cancel"),
            tooltip: this._oRb.getText("CONDITIONPANEL_REMOVE" + (this._sAddRemoveIconTooltipKey ? "_" + this._sAddRemoveIconTooltipKey : "") + "_TOOLTIP"),
            press: function () {
                that._handleRemoveCondition(this.oTargetGrid, oConditionGrid);
            },
            layoutData: new GridData({
                span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M2 S2"
            })
        });

        oRemoveControl.oTargetGrid = oTargetGrid;

        oButtonContainer.addContent(oRemoveControl);
        oConditionGrid["remove"] = oRemoveControl;

        // create "Add button"
        var oAddControl = new sap.m.Button({
            type: ButtonType.Transparent,
            icon: IconPool.getIconURI("add"),
            tooltip: this._oRb.getText("CONDITIONPANEL_ADD" + (this._sAddRemoveIconTooltipKey ? "_" + this._sAddRemoveIconTooltipKey : "") + "_TOOLTIP"),
            press: function () {
                that._handleAddCondition(this.oTargetGrid, oConditionGrid, true);
            },
            layoutData: new GridData({
                span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M10 S10"
            })
        });

        oAddControl.oTargetGrid = oTargetGrid;
        oAddControl.addStyleClass("conditionAddBtnFloatRight");

        oButtonContainer.addContent(oAddControl);
        oConditionGrid["add"] = oAddControl;

        // Add the new create condition
        oTargetGrid.insertContent(oConditionGrid, iPos);

        // update Operations for all conditions
        this._updateOperationItems(oTargetGrid, oConditionGrid);
        this._changeOperationValueFields(oTargetGrid, oConditionGrid);

        // disable fields if the selectedKeyField value is none
        this._updateAllConditionsEnableStates();

        // update the add/remove buttons visibility
        this._updateConditionButtons(oTargetGrid);

        if (this.getAutoReduceKeyFieldItems()) {
            this._updateKeyFieldItems(oTargetGrid, false);
        }

        if (this._sLayoutMode) {
            this._updateLayout({
                name: this._sLayoutMode
            });
        }

        if (oConditionGridData) {
            var sConditionText = this._getFormatedConditionText(oConditionGridData.operation, oConditionGridData.value1, oConditionGridData.value2, oConditionGridData.exclude, oConditionGridData.keyField, oConditionGridData.showIfGrouped);

            oConditionGridData._oGrid = oConditionGrid;
            oConditionGridData.value = sConditionText;
            this._oConditionsMap[sKey] = oConditionGridData;
        }

        var sOperation = oConditionGrid.operation.getSelectedKey();
        // in case of a BT and a Date type try to set the minDate/maxDate for the From/To value datepicker
        if (sOperation === "BT" && oConditionGrid.value1.setMinDate && oConditionGrid.value2.setMaxDate) {
            var oValue1 = oConditionGrid.value1.getDateValue();
            var oValue2 = oConditionGrid.value2.getDateValue();
            this._updateMinMaxDate(oConditionGrid, oValue1, oValue2);
        } else {
            this._updateMinMaxDate(oConditionGrid, null, null);
        }

        return oConditionGrid;
    };

    return CustomP13nConditionPanel;
});