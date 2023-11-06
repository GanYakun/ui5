/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/library",
    "o3/library/model/AnnotationHelper",
    "o3/library/model/formatter",
    "o3/library/model/Util",
    "sap/ui/core/Item",
    "sap/m/Select",
    "o3/library/control/smart/smartfield/_Input",
    "o3/library/control/smart/smartfield/_Text",
    "o3/library/control/smart/smartfield/_DateTimePicker",
    "o3/library/control/smart/smartlink/SmartLink",
    "o3/library/control/smart/smartfield/_IconText",
], function (Control, coreLib, AnnotationHelper, formatter, Util, Item, Select, _Input, _Text, _DateTimePicker, SmartLink, _IconText) {
    "use strict";

    var ValueState = coreLib.ValueState;

    var SmartField = Control.extend("o3.library.control.smart.smartfield.SmartField", {
        metadata: {
            interfaces: ["sap.ui.core.IFormContent"],
            properties: {
                enabled: { type: "boolean", defaultValue: true },
                showValueHelp: { type: "boolean", defaultValue: true },
                value: { type: "string", defaultValue: null },
                entitySet: { type: "string", defaultValue: "" },
                entityField: { type: "string", defaultValue: "" },
                multiple: { type: "boolean", defaultValue: false },
                editable: { type: "boolean", defaultValue: true },
                valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },
                valueStateText: { type: "string", group: "Appearance", defaultValue: "" },
                valueLiveUpdate: { type: "boolean", defaultValue: true }
            },
            aggregations: {
                _control: { type: "sap.ui.core.Control", multiple: false, }
            },
            events: {
                check: {}
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
        _getView: function (viewType) {
            if (!viewType) {
                viewType = "sap.ui.core.mvc.View";
            }
            var oObj = this.getParent();
            while (oObj) {
                if (oObj.isA(viewType)) {
                    return oObj;
                }
                oObj = oObj.getParent();
            }
            return null;
        }
    });

    SmartField.prototype.setControl = function (oContent) {
        return this.setAggregation("_control", oContent);
    };

    SmartField.prototype.getControl = function () {
        return this.getAggregation("_control");
    };

    SmartField.prototype.setEditable = function (sValue) {
        this.setProperty("editable", sValue);
        if (sValue) {
            this.setControl(this._oControl.edit);
        } else {
            this.setControl(this._oControl.display);
        }
    };

    SmartField.prototype.getValueState = function () {
        var oControl = this._oControl.edit;
        if (oControl && (typeof oControl.getValueState === 'function')) {
            return oControl.getValueState();
        }

        return this.getProperty('valueState');
    };

    SmartField.prototype.setValueState = function (sValueState) {
        this.setProperty('valueState', sValueState, true);
        var oControl = this._oControl.edit;
        if (oControl && (typeof oControl.setValueState === 'function')) {
            return oControl.setValueState(sValueState);
        }
        return this;
    }

    SmartField.prototype.init = function () {
        this.attachModelContextChange(this.onModelContextChange);
        this.oMetadataInitialised = false;
        this.oFieldInfo = "";
        this._oControl = {
            display: null,
            edit: null,
        };
    };

    /**
     * 获得格式化后的日期
     */
    SmartField.prototype.getFormatedDateValue = function () {
        var oControl = this._oControl.edit;
        if (oControl.getDateValue) {
            return formatter.formatDate(oControl.getDateValue());
        }
        console.error('is not date field');
    }

    SmartField.prototype.onModelContextChange = function () {
        var oModel = this.getModel();
        AnnotationHelper.init(oModel).then(() => {
            if (this.oMetadataInitialised) {
                return;
            }
            this.oMetadataInitialised = true;

            // 如果是navigationproperty需要判断是否是enumeration类型
            if (this.getEntityField().includes("/")) {
                let _expand = this.getEntityField().split('/');
                let _navEntityType = AnnotationHelper.getNavEntityType(this.getEntitySet(), this.getEntityField());
                // this.oFieldInfo = AnnotationHelper.getAllFieldInfo(_expand[_expand.length - 2], _expand[_expand.length - 1], 1);
                this.oFieldInfo = AnnotationHelper.getAllFieldInfo(_navEntityType, _expand[_expand.length - 1], 1);
                if (!this.oFieldInfo.isEnumeration) {
                    this.oFieldInfo = AnnotationHelper.getAllFieldInfo(this.getEntitySet(), this.getEntityField());
                }
            } else {
                this.oFieldInfo = AnnotationHelper.getAllFieldInfo(this.getEntitySet(), this.getEntityField());
            }

            // 此处 return 是为了SmartTable重新渲染时，new SmartField()不需要重新渲染SmartField
            if (!this._oControl) {
                return;
            }
            // if (!this._oControl) {
            //     this._oControl = {
            //         display: null,
            //         edit: null,
            //     }
            // }
            var oField = this._oControl.edit;
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

            if (this.oFieldInfo["@Common.ValueListWithFixedValues"]) {
                oField = this._createSelect(AnnotationHelper, this.oFieldInfo["$Type"]);
            } else if (mMethods[this.oFieldInfo["$Type"]]) {
                if (this[mMethods[this.oFieldInfo["$Type"]]]) {
                    oField = this[mMethods[this.oFieldInfo["$Type"]]](AnnotationHelper, this.oFieldInfo["$Type"]);
                } else {
                    console.error("missing method " + mMethods[this.oFieldInfo["$Type"]]);
                }
            } else {
                oField = this._createEdmString(AnnotationHelper, this.oFieldInfo["$Type"]);
            }

            if (oField) {
                this._oControl.edit = oField;

                // formatter 之后可以显示 “12,123.123”格式的数量
                if (this.oFieldInfo.isNavigationPropertyByForeignKey && this.oFieldInfo.isHaveTemplate) {
                    this._oControl.display = new SmartLink({
                        entitySet: this.getEntitySet(),
                        entityField: this.getEntityField()
                    });
                } else {
                    this._oControl.display = new _Text();
                    if (Util.isNumic(this.oFieldInfo["$Type"])) {
                        this._oControl.display = new _Text({
                            text: {
                                parts: [
                                    { path: this.getEntityField() }
                                ],
                                formatter: function (a) {
                                    return a;
                                }
                            }
                        });
                    }
                    if (!this._getView("o3.library.control.smart.smartform.SmartForm") && this.oFieldInfo.isHaveUnit) {
                        this._oControl.display = new _Text({
                            text: {
                                parts: [
                                    { path: this.getEntityField() },
                                    { path: this.oFieldInfo.isHaveUnit }
                                ],
                                formatter: function (a, b) {
                                    if (a && b) {
                                        return a + "  " + b;
                                    }
                                    return "";
                                }
                            },
                            wrapping: false,
                            renderWhitespace: true
                        });
                    }

                    // TODO: -------------------------------------------------------icon 測試
                    if(this.getEntityField() === "productName"){
                        this._oControl.display = new _IconText({
                            entityField: this.getEntityField(),
                            entitySet: this.getEntitySet()
                        });
                    }
                    // TODO: ----------------------------------------------------------------
                }

                if (oField.setEntityType) {
                    oField.setEntitySet(this.getEntitySet());
                    oField.setEntityType(this.oFieldInfo.entityType);
                    oField.setEntityField(this.getEntityField());
                    oField.initAnnotation(this, AnnotationHelper);
                }

                if (this.getEditable()) {
                    this.setControl(this._oControl.edit);
                } else {
                    this.setControl(this._oControl.display);
                }

                // 增加自定义css
                if (this._oControl.display && this.aCustomStyleClasses) {
                    var sCustomStyleClass = "";
                    this.aCustomStyleClasses.forEach(function (item) {
                        sCustomStyleClass += item + " ";
                    })
                    this._oControl.display.addStyleClass(sCustomStyleClass);
                }
            }
        });
    };

    SmartField.prototype.setValue = function (sValue) {
        var oEditControl = this._oControl.edit,
            oDispalyControl = this._oControl.display;

        this.setProperty("value", sValue, true);

        if (!oEditControl || !oDispalyControl) {
            return;
        }

        // TODO: -------------------------------------------------------icon 測試
        if(this.getEntityField() === "productName"){
            return;
        }
        // TODO：----------------------------------------------------------------

        if (this.oFieldInfo.isEnumeration) { // enumeration 类型的数据
            let enumerations = this.oFieldInfo.isEnumeration;
            enumerations.some(function (item) {
                if (item.key === sValue) {
                    oDispalyControl.setText(item.value);
                    return true;
                }
            });
            oEditControl.setSelectedKey(sValue);

        } else if (this.oFieldInfo["$Type"] === "Edm.DateTimeOffset") {   // 日期类型
            if (this.getValue()) { // 日期不为空才做处理
                if (sValue.indexOf("Z") > -1) {
                    oEditControl.setValue(formatter.formatDisplayDate(sValue));
                    oEditControl.setDateValue(new Date(sValue));
                    oDispalyControl.setText(formatter.formatDisplayDate(new Date(sValue)));
                } else {
                    oEditControl.setValue(sValue);
                    let _date = new Date(oEditControl.getProperty("dateValue"));
                    oEditControl.setDateValue(_date);
                    oDispalyControl.setText(formatter.formatDisplayDate(_date));
                }
            }
        } else if (oDispalyControl.isA("o3.library.control.smart.smartlink.SmartLink")) {
            oEditControl.setValue(sValue);
            if (!oEditControl.getSelectedRow()) {
                oEditControl.fireChange({ "value": sValue });
            }
        } else if (oEditControl.isA("sap.m.Select")) {
            oEditControl.setSelectedKey(sValue);
            if (oEditControl.getSelectedItem() && oEditControl.getSelectedItem().getText()) {
                oDispalyControl.setText(oEditControl.getSelectedItem().getText());
            }
        } else {                                                                              // TODO: 目前还没想好else放哪个类型的数据
            oEditControl.setValue(sValue);
            if (this.oFieldInfo.isHaveValueListCollection && !oEditControl.getSelectedRow()) {
                oEditControl.fireChange({ "value": sValue });
            }
            if (oDispalyControl.setText) { // SmartLink不需要setText
                oDispalyControl.setText(sValue);
            }
        }
        this.setValueState("None");
    };

    SmartField.prototype._createEdmString = function () {
        var oControl,
            showVHD = this.getShowValueHelp() && this.oFieldInfo.isHaveValueListCollection;

        oControl = new _Input({
            id: this.getId() + "-input",
            showValueHelp: showVHD,
            value: this.getValue()
        });
        oControl.attachChange(function (oEvent) {
            var oSource = oEvent.getSource();
            var value = oSource.getValue() || oEvent.getParameter("value");

            this.setProperty("value", value, true);

            if (!this._oControl.display.isA("o3.library.control.smart.smartlink.SmartLink")) {
                this._oControl.display.setText(value);
            }
            if (!Util.CheckString(oSource)) {
                this.fireCheck();
            }
        }.bind(this));

        return oControl;
    };

    SmartField.prototype._createEdmDateTimeOffset = function () {
        var oControl;

        if (this._getView("o3.library.control.smart.smartform.SmartForm")) {
            this.inSmartForm = true;
        } else {
            this.inSmartForm = false;
        }
        oControl = new _DateTimePicker({
            id: this.getId() + "-dateTimePicker"
        });

        oControl.attachChange(function (oEvent) {
            var bValid = oEvent.getParameter("valid");
            var oSource = oEvent.getSource();
            if (bValid) {
                this.setValueState(ValueState.None);
                // 有点奇怪，setValue中取到的是“2020年6月23日 下午5:09:47”类型的日期，此处设置，也需要此种格式，取到的是带“Z”格式的日期也需要格式化成“Z”的格式日期
                if (this.inSmartForm) {
                    this.setProperty("value", oSource.getValue());
                } else {
                    this.setProperty("value", formatter.formatDate(this._oControl.edit.getProperty("dateValue")));
                }
                // this.setProperty("value", oSource.getDateValue().toISOString());
                this._oControl.display.setText(formatter.formatDisplayDate(oSource.getDateValue()));
            } else {
                this.setValueState(ValueState.Error);
            }
            this.fireCheck();
        }.bind(this));

        return oControl;
    }

    SmartField.prototype._createEdmNumeric = function () {
        var oControl;

        if (!this._getView("o3.library.control.smart.smartform.SmartForm") && this.oFieldInfo.isHaveUnit) {
            oControl = new _Input({
                id: this.getId() + "-input",
                fieldWidth: "70%",
                showValueHelp: false,
                value: this.getValue(),
                description: "{" + this.oFieldInfo.isHaveUnit + "}"
            });
        } else {
            oControl = new _Input({
                id: this.getId() + "-input",
                showValueHelp: false,
                value: this.getValue()
            });
        }

        oControl.attachChange(function (oEvent) {
            var oSource = oEvent.getSource();

            this.setProperty("value", oSource.getValue(), true);
            this._oControl.display.setText(oSource.getValue());
            Util.CheckNumeric(oSource)
            this.fireCheck();

        }.bind(this));

        if (this.getBindingInfo("value") && this.getBindingInfo("value").binding) {
            let oIntType = new sap.ui.model.type.Float();
            this.getBindingInfo("value").binding.setType(oIntType, "string");
        }
        return oControl;
    };

    SmartField.prototype._createEnumeration = function (AnnotationHelper, Type) {
        var oControl,
            arr = this.oFieldInfo.isEnumeration,
            items = [];

        items.push(new Item({
            key: '',
            text: '_NA_'
        }));
        arr.forEach(function (item) {
            items.push(new Item({
                key: item.key,
                text: item.value
            }));
        });

        oControl = new Select({
            id: this.getId() + "-SelectEnum",
            selectedKey: this.getValue(),
            items: items
        });

        oControl.attachChange(function (oEvent) {
            this.setProperty("value", oEvent.getSource().getSelectedKey(), true);
            this._oControl.display.setText(oEvent.getSource().getSelectedItem().getText());
            this.setValueState(ValueState.None);
        }.bind(this));

        return oControl;
    };

    SmartField.prototype._createSelect = function (AnnotationHelper, Type) {
        var oControl, oCollectionPath, key, description, that = this;
        if (this.oFieldInfo && this.oFieldInfo['@com.sap.vocabularies.Common.v1.ValueList'] &&
            this.oFieldInfo['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
            oCollectionPath = this.oFieldInfo['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
            key = this.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][0]["ValueListProperty"];
            description = this.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][1]["ValueListProperty"]
        }

        o3Tool.request(oCollectionPath).then((rsp) => {
            let defaultDisplay;
            oControl.addItem(new Item({
                key: '',
                text: '_NA_'
            }));
            rsp.value.forEach(function (item) {
                if (oControl.getSelectedKey && item[key] === oControl.getSelectedKey()) {
                    defaultDisplay = item[description];
                }
                oControl.addItem(new Item({
                    key: item[key],
                    text: item[description]
                }));
            });

            if (oControl.getSelectedKey()) {
                if (that._oControl.display) {
                    that._oControl.display.setText(defaultDisplay);
                }
            }
        });

        oControl = new Select({
            id: jQuery.sap.uid() + "-Select"
        });

        oControl.attachChange(function (oEvent) {
            this.setProperty("value", oEvent.getSource().getSelectedKey(), true);
            this._oControl.display.setText(oEvent.getSource().getSelectedItem().getText());
            this.setValueState(ValueState.None);
        }.bind(this));

        return oControl;
    };

    SmartField.prototype.exit = function () {
        this.oMetadataInitialised = null;
        this.oFieldInfo = null;
        // if (this._oControl.edit) {
        //     this._oControl.edit.destroy();
        // }
        // if (this._oControl.display) {
        //     this._oControl.display.destroy();
        // }
        this._oControl = null;
        this.inSmartForm = null;
    }

    return SmartField;

}, true);
