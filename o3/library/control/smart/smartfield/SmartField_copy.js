/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/core/Control',
    'sap/ui/Device',
    'sap/m/library',
    'sap/ui/core/library',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Item',
    'sap/m/Select',
    'o3/library/model/formatter',
    'o3/library/model/AnnotationHelper',
    'o3/library/control/smart/smartfield/_DateTimePicker',
    'o3/library/control/smart/smartfield/_Input',
    'o3/library/control/smart/smartfield/_MultiInput',
    'o3/library/control/smart/smartfield/_DateRange',
    'o3/library/control/smart/smartfield/_ComboBox',
    'o3/library/control/smart/smartfield/_TokenParser',
    'o3/library/control/smart/smartfield/_Text',
    'o3/library/control/smart/smartfilterbar/SmartFilterBar',
    'o3/library/control/smart/smartlink/SmartLink'
], function (Control, Device, library, coreLib, JSONModel, Item, Select, formatter, AnnotationHelper, _DateTimePicker, _Input, _MultiInput, _DateRange,
    _ComboBox, _TokenParser, _Text, SmartFilterBar, SmartLink) {
    'use strict';
    var ValueState = coreLib.ValueState;

    var i18n = sap.ui.getCore().getLibraryResourceBundle('o3.library.i18n');

    var SmartField = Control.extend('o3.library.control.smart.smartfield.SmartField', {
        metadata: {
            interfaces: ['sap.ui.core.IFormContent'],
            properties: {
                enabled: { type: 'boolean', defaultValue: true },
                showValueHelp: { type: 'boolean', defaultValue: true },
                qualifier: { type: 'string', defaultValue: '' },
                value: { type: 'string', defaultValue: null },
                entitySet: { type: 'string', defaultValue: '' },
                entityField: { type: 'string', defaultValue: '' },
                multiple: { type: 'boolean', defaultValue: false },
                showDateRange: { type: 'boolean', defaultValue: false },//显示日期区间
                editable: { type: 'boolean', defaultValue: true },
                smartFilterBar: { type: 'o3.library.control.smart.smartfilterbar.SmartFilterBar', defaultValue: null },
                valueState: { type: 'sap.ui.core.ValueState', group: 'Appearance', defaultValue: ValueState.None },
                valueStateText: { type: 'string', group: 'Appearance', defaultValue: '' },
                showValueStateMessage: { type: 'boolean', group: 'Appearance', defaultValue: true },
                valueLiveUpdate: { type: 'boolean', defaultValue: true }
            },
            aggregations: {
                _control: { type: 'sap.ui.core.Control', multiple: false, }
            },
            associations: {
                ariaLabelledBy: {
                    type: 'sap.ui.core.Control',
                    multiple: true,
                    singularName: 'ariaLabelledBy'
                }
            },
            events: {
                change: {
                    parameters: {
                        value: { type: 'string' }, newValue: { type: 'string' }
                    }
                },
                check: {}
            }
        },

        renderer: {
            render: function (oRm, oControl) {
                oRm.write('<div ');
                oRm.writeControlData(oControl);
                oRm.addClass('sapUiCompSmartField');
                oRm.writeClasses();
                oRm.write('>');
                oRm.renderControl(oControl.getControl());
                if (oControl.getAggregation('_ariaLabelInvisibleText')) {
                    oControl.getAggregation('_ariaLabelInvisibleText').forEach(function (oInvisibleText) {
                        oRm.renderControl(oInvisibleText);
                    });
                }
                oRm.write('</div>');
            }
        },
        _getView: function (viewType) {
            if (!viewType) {
                viewType = 'sap.ui.core.mvc.View';
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

    SmartField.prototype.init = function () {
        this.attachModelContextChange(this.onModelContextChange);
        this.oMetadataInitialised = false;
        this.oFieldData = '';//字段annotation
        this.oFieldInfo = '';//字段类型信息
        this.oEntityType = '';
        // this.oTokenParser = new _TokenParser('EQ');
        this._oControl = {
            display: null,
            edit: null,
        };

    }

    SmartField.prototype.setControl = function (oContent) {
        return this.setAggregation('_control', oContent);
    };

    SmartField.prototype.getControl = function () {
        return this.getAggregation('_control');
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

    SmartField.prototype.getValueStateText = function () {
        var oControl = this._oControl.edit;
        if (oControl && (typeof oControl.getValueStateText === 'function')) {
            return oControl.getValueStateText();
        }

        return this.getProperty('valueStateText');
    };
    SmartField.prototype.setValueStateText = function (sText) {
        this.setProperty('valueStateText', sText, true);
        var oControl = this._oControl.edit;
        if (oControl && (typeof oControl.setValueStateText === 'function')) {
            return oControl.setValueStateText(sText);
        }
        return this;
    }

    SmartField.prototype.getShowValueStateMessage = function () {
        var oControl = this._oControl.edit;
        if (oControl && (typeof oControl.getShowValueStateMessage === 'function')) {
            return oControl.getShowValueStateMessage();
        }

        return this.getProperty('showValueStateMessage');
    };
    SmartField.prototype.setShowValueStateMessage = function (sText) {
        this.setProperty('showValueStateMessage', sText, true);
        var oControl = this._oControl.edit;
        if (oControl && (typeof oControl.setShowValueStateMessage === 'function')) {
            return oControl.setShowValueStateMessage(sText);
        }
        return this;
    }

    SmartField.prototype.isSingleNavigationProperty = function () {
        let AnnotationConfig = this.data('AnnotationConfig');
        if (AnnotationConfig && AnnotationConfig['$kind'] === 'NavigationProperty' && !AnnotationConfig['$isCollection']) {
            return true;
        }
        return false;
    }
    SmartField.prototype.isCollectionNavigationProperty = function () {
        let AnnotationConfig = this.data('AnnotationConfig');
        if (AnnotationConfig && AnnotationConfig['$kind'] === 'NavigationProperty' && AnnotationConfig['$isCollection']) {
            return true;
        }
        return false;
    }
    SmartField.prototype.isProperty = function () {
        let AnnotationConfig = this.data('AnnotationConfig');
        if (AnnotationConfig && AnnotationConfig['$kind'] === 'Property') {
            return true;
        }
        return false;
    }
    SmartField.prototype.isInSmartForm = function () {
        var viewType = "o3.library.control.smart.smartform.SmartForm"
        var oObj = this.getParent();
        while (oObj) {
            if (oObj.isA(viewType)) {
                return oObj;
            }
            oObj = oObj.getParent();
        }
        return null;
    }
    SmartField.prototype.onValueChange = function (oEvent) {
        // var newValue = oEvent.getParameter('newValue');
        var newValue;

        if (!this.isInSmartForm() && this.oFieldData && this.oFieldData["@Org.OData.Measures.V1.Unit"]) {
            newValue = oEvent.getSource().getValue();
        } else if (this.oFieldInfo['$Type'] === 'Edm.DateTimeOffset') {
            // newValue = formatter.formatDate(this._oControl.edit.getProperty("dateValue"));
            this._oControl.display.setText(oEvent.getSource().getValue());
        } else if (this.oFieldInfo['$Type'] === 'com.dpbird.Bool') {
            newValue = oEvent.getSource().getSelectedKey();
            if (this._oControl.display) {
                this._oControl.display.setText(newValue);
            }
        } else if(AnnotationHelper.getNavigationPropertyByForeignKey(this.oEntityType, this.getEntityField())){
            if(oEvent.getSource().getSelectedKey())
                newValue = oEvent.getSource().getSelectedKey();
            else
                newValue = oEvent.getSource().getValue();
        } else {
            newValue = oEvent.getSource().getValue();
            if (this._oControl.display) {
                this._oControl.display.setText(newValue);
            }
        }
        this.setProperty("value", newValue);

        if (this.getSmartFilterBar()) {
            this.getSmartFilterBar().fireFilterChange(oEvent);
        }
    }

    SmartField.prototype.setEnabled = function (bEnabled) {
        var oControl = this._oControl.edit;
        if (oControl) {
            oControl.setEnabled(bEnabled);
        }
    }

    SmartField.prototype.setValue = function (sValue) {
        var oControl = this._oControl.edit;

        this.setProperty('value', sValue);
        if (oControl) {
            if (this.oFieldInfo['$Type'] === 'Edm.DateTimeOffset') {
                if (!sValue) {
                    oControl.setValue(sValue);
                } else {
                    // jsonmodel绑定的日期
                    if (sValue.indexOf("Z") > -1) {
                        oControl.setValue(formatter.formatDisplayDate(sValue));
                        oControl.setDateValue(new Date(sValue));
                    } else {
                        oControl.setValue(sValue);
                        oControl.setDateValue(new Date(oControl.getProperty("dateValue")));
                    }
                    this.setProperty("value", formatter.formatDisplayDate(oControl.getProperty("dateValue")), true);
                }
            } else if (this.oFieldInfo['$Type'] === 'Edm.Boolean') {
                oControl.setSelectedKey(sValue);
            } else if (this.oFieldInfo['$Type'] === 'com.dpbird.Bool') {
                oControl.setSelectedKey(sValue);
            } else if(AnnotationHelper.getNavigationPropertyByForeignKey(this.oEntityType, this.getEntityField())){
                if(!oControl.getSelectedKey())
                    oControl.setSelectedKey(sValue);
            } else {
                if (this._oControl.edit && this._oControl.edit.getSelectedKey()) {
                    this.setProperty("value", this._oControl.edit.getSelectedKey(), true);
                } else {
                    oControl.setValue(sValue);
                }
            }
            oControl.setProperty("valueState", "None");
        }
        if (!this.isInSmartForm() && this.oFieldData && this.oFieldData["@Org.OData.Measures.V1.Unit"]) {
        } else {
            if (this._oControl.display) {
                if (this.oFieldInfo['$Type'] === 'Edm.DateTimeOffset') {
                    if (!sValue) {
                        this._oControl.display.setText(sValue);
                    } else {
                        this._oControl.display.setText(formatter.formatDisplayDate(oControl.getProperty("dateValue")));
                    }
                } else if (this.oFieldInfo['$Type'] === 'Edm.Boolean') {
                    if (this._oControl.edit.getSelectedItem()) {
                        this._oControl.display.setText(this._oControl.edit.getSelectedItem().getText());
                    }
                } else if(AnnotationHelper.getNavigationPropertyByForeignKey(this.oEntityType, this.getEntityField())){
                    // oControl.setSelectedKey(sValue);
                } else {
                    this._oControl.display.setText(sValue);
                }
            }
        }
    }

    SmartField.prototype.setEditable = function (sValue) {
        this.setProperty('editable', sValue);
        if (sValue) {
            this.setControl(this._oControl.edit);
        } else {
            this.setControl(this._oControl.display);
        }
    }

    /**
     * 获得格式化后的日期区间
     */
    SmartField.prototype.getFormatedFilterRanges = function () {
        var oControl = this._oControl.edit.data('dateRange');
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

    SmartField.prototype.getTokens = function () {
        var oControl = this._oControl.edit;
        return oControl.getTokens ? oControl.getTokens() : [];
    };

    SmartField.prototype.updateBindingContext = function (bSkipLocal, sFixedModelName, bUpdateAll) {
        Control.prototype.updateBindingContext.apply(this, arguments);
    }
    SmartField.prototype.onModelContextChange = function () {
        var oBinding = this.getBinding('value'),
            that = this;
        var oModel = this.getModel();
        AnnotationHelper.init(oModel).then(() => {
            if (this.oMetadataInitialised) {
                return;
            }
            this.oMetadataInitialised = true;

            if (!this.getSmartFilterBar()) {
                this.smartFilterBar = this._getView('o3.library.control.smart.smartfilterbar.SmartFilterBar');
            }
            this.smartTable = this._getView('o3.library.control.smart.smarttable.SmartTable');
            this.smartForm = this._getView('o3.library.control.smart.smartform.SmartForm');

            if (this.getSmartFilterBar()) {
                this.setMultiple(true);
                this.setShowDateRange(true);
                this.setShowValueHelp(true);

                this.setEntitySet(this.getSmartFilterBar().getEntitySet());
            }

            this.oEntityType = AnnotationHelper.getEntityTypeByEntitySet(this.getEntitySet());
            this.oFieldData = AnnotationHelper.getEntityFieldAnnotation(this.oEntityType, this.getEntityField());
            this.oFieldInfo = AnnotationHelper.getFieldInfo(this.oEntityType, this.getEntityField());
            var oField = this._oControl.edit;

            var mMethods = {
                'Edm.Decimal': '_createEdmNumeric',
                'Edm.Double': '_createEdmNumeric',
                'Edm.Float': '_createEdmNumeric',
                'Edm.Single': '_createEdmNumeric',
                'Edm.Int16': '_createEdmNumeric',
                'Edm.Int32': '_createEdmNumeric',
                'Edm.Int64': '_createEdmNumeric',
                'Edm.Byte': '_createEdmNumeric',
                'Edm.DateTimeOffset': '_createEdmDateTimeOffset',
                'Edm.DateTime': '_createEdmDateTime',
                'Edm.Boolean': '_createEdmBoolean',
                'Edm.String': '_createEdmString',
                'Edm.Time': '_createEdmTime',
            };
            mMethods[AnnotationHelper.getNameSpace() + 'Bool'] = '_createComDpbirdBool';

            if (mMethods[this.oFieldInfo['$Type']]) {
                if (this[mMethods[this.oFieldInfo['$Type']]]) {
                    oField = this[mMethods[this.oFieldInfo['$Type']]](AnnotationHelper, this.oFieldInfo['$Type']);
                } else {
                    console.error('missing method ' + mMethods[this.oFieldInfo['$Type']]);
                }
            } else {
                oField = this._createEdmString(AnnotationHelper, this.oFieldInfo['$Type']);
            }

            if (oField) {
                window.oField = oField;
                this._oControl.edit = oField;
                if (oField.setValue) {
                    if (this.getValue() && this.oFieldInfo['$Type'] === 'Edm.DateTimeOffset') {
                        oField.setValue(formatter.formatDisplayDate(this.getValue()));
                        oField.setDateValue(new Date(this.getValue()));
                    } else if (this.getValue && this.oFieldInfo['$Type'] === 'Edm.Boolean') {
                        oField.setSelectedKey(this.getValue());
                    } else if (this.getValue && this.oFieldInfo['$Type'] === 'com.dpbird.Bool') {
                        oField.setSelectedKey(this.getValue());
                    } else if (AnnotationHelper.getNavigationPropertyByForeignKey(this.oEntityType, this.getEntityField())) {
                        oField.setSelectedKey(this.getValue());
                    } else {
                        oField.setValue(this.getValue());
                    }
                }
                if (!this.isInSmartForm() && this.oFieldData && this.oFieldData["@Org.OData.Measures.V1.Unit"] && this.oFieldData["@Org.OData.Measures.V1.Unit"]["$Path"]) {
                    this._oControl.display = new _Text({
                        text: {
                            parts: [
                                { path: this.getEntityField() },
                                { path: this.oFieldData["@Org.OData.Measures.V1.Unit"]["$Path"] }
                            ],
                            formatter: function (a, b) {
                                if (a && b) {
                                    return a + " " + b;
                                }
                                return "";
                            }
                        },
                        wrapping: false
                    });
                } else if (AnnotationHelper.getNavigationPropertyByForeignKey(this.oEntityType, this.getEntityField())) {
                    this._oControl.display = new SmartLink({
                        entitySet: this.getEntitySet(),
                        entityField: this.getEntityField()
                    });
                } else {
                    this._oControl.display = new _Text();
                    if (this.getValue() && this.oFieldInfo['$Type'] === 'Edm.DateTimeOffset') {
                        this._oControl.display.setText(formatter.formatDisplayDate(this.getValue()));
                    } else if (this.getValue && this.oFieldInfo['$Type'] === 'Edm.Boolean') {
                        if (this._oControl.edit.getSelectedItem()) {
                            this._oControl.display.setText(this._oControl.edit.getSelectedItem().getText());
                        }
                    } else {
                        this._oControl.display.setText(this.getValue());
                    }
                }

                if (oField.setEntityType) {
                    oField.setEntitySet(this.getEntitySet());
                    oField.setEntityType(this.oEntityType);
                    oField.setEntityField(this.getEntityField());
                    oField.initAnnotation(this, AnnotationHelper);
                }
                if (oField.attachEvent) {
                    oField.attachEvent('_change', this.onValueChange, this);
                }
                if (typeof oField.setValueState === 'function') {
                    oField.setValueState(this.getProperty('valueState'));
                }
                if (typeof oField.setValueStateText === 'function') {
                    oField.setValueStateText(this.getProperty('valueStateText'));
                }
                if (typeof oField.showValueStateMessage === 'function') {
                    oField.showValueStateMessage(this.getProperty('showValueStateMessage'));
                }

                if (this.getSmartFilterBar()) {
                    if (oField.addToken) {
                        //如果在filterbar里且是input控件
                        //   oField.attachChange((oEvent) => {
                        //       if(oField.getValueState() === "Error"){
                        //           return;
                        //       }
                        //     var val = oField.getValue();
                        //     oField.setValue('');
                        //     var oToken = this.oTokenParser.getTokenByText(this.getEntityField(), val);
                        //     if (oToken) {
                        //       oField.addToken(oToken);
                        //       oField.fireTokenUpdate();
                        //     }
                        //   });
                        oField.attachTokenUpdate((oEvent) => {
                            setTimeout(() => {
                                this.getSmartFilterBar().fireFilterChange(oEvent);
                            });
                        })
                    }
                }

                this.addDependent(oField);
                if (this.getEditable()) {
                    this.setControl(this._oControl.edit);
                } else {
                    this.setControl(this._oControl.display);
                }
            }
        }
        );
    }

    SmartField.prototype._createEdmDateTimeOffset = function (AnnotationHelper, Type) {
        var sId = this.getId();
        var oControl, that = this;

        if (this.getShowDateRange()) {
            var oFilterProvider = {
                oModel: {
                    setProperty: function () {

                    },
                },
                _oSmartFilter: {
                    getLiveMode: function () {
                        return false;
                    },
                    fireFilterChange: function () {

                    },
                },
                setFilterData: function () {

                },
                _createFilterControlId: function (oFieldViewMetadata) {
                    return jQuery.sap.uid() + '-filterItemControl';
                }
            };
            var oFieldMetadata = {};
            var oDateRange = new _DateRange(sId + '-dateRange', oFilterProvider, oFieldMetadata);
            /*
            自定义筛选条件
            oDateRange.applySettings({
                operations: {
                    filter: [{
                        path: 'key',
                        contains: ['LASTWEEK']
                    }]
                }
            });
             */
            oDateRange.initialize({});
            oControl = oDateRange.initializeFilterItem();
            oControl.data('dateRange', oDateRange);
        } else {
            oControl = new _DateTimePicker({
                id: sId + '-dateTimePicker',
                // dateValue: "{" + this.getEntityField() + "}"
            });
            oControl.attachEvent('change', function (oEvent) {
                //检查输入的值
                let bValid = oEvent.getParameter('valid');
                let oSource = oEvent.getSource();
                if (bValid) {
                    oSource.setValueState(ValueState.None);
                } else {
                    oSource.setValueState(ValueState.Error);
                }
                that.fireCheck();
            });
        }
        return oControl;
    }

    SmartField.prototype._createEdmString = function (AnnotationHelper, Type) {
        var that = this;
        var oControl;
        var sId = this.getId();
        if (this.oFieldData) {//列表格式
            if (this.oFieldData['@com.sap.vocabularies.Common.v1.ValueListMapping']) {//固定
                if (this.oFieldData['@com.sap.vocabularies.Common.v1.ValueListWithFixedValues']) {//固定
                    oControl = new _ComboBox({
                        id: sId + '-comboBox'
                    });
                }
            }
        }

        if (!oControl) {
            if (this.getMultiple()) {
                oControl = new _MultiInput({
                    id: sId + '-multiInput',
                    showValueHelp: this.getShowValueHelp()
                });
            } else {
                oControl = new _Input({
                    id: sId + '-input',
                    showValueHelp: this.getShowValueHelp(),
                });
                oControl.attachChange(function (oEvent) {
                    var oSource = oEvent.getSource(),
                        entitySet = oSource.getEntitySet(),
                        entityType = AnnotationHelper.getEntityTypeByEntitySet(entitySet),
                        field = oSource.getEntityField(),
                        maxLengh = oSource.oField.oFieldInfo.$MaxLength,
                        _sLength = oSource.getValue().length;
                    if (AnnotationHelper.isPropertyFieldControl(entityType, field)) {
                        if (oSource.getValue() === "") {
                            oSource.setValueState(ValueState.Error);
                        } else {
                            oSource.setValueState(ValueState.None);
                        }
                    } else if (_sLength > maxLengh) {
                        oSource.setValueState(ValueState.Error);
                    } else {
                        oSource.setValueState(ValueState.None);
                    }
                    that.fireCheck();
                });
            }
        }

        // if (this.getSmartFilterBar()) {
        //     if (this.oFieldData && this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList'] && this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
        //         oControl.setSupportRanges(true);
        //         oControl.setSupportRangesOnly(false);
        //     } else {
        //         oControl.setShowValueHelp(false);
        //     }
        // }

        if (!this.oFieldData || !this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList'] || !this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
          if (this.getSmartFilterBar()) {
            oControl.setSupportRanges(true);
            oControl.setSupportRangesOnly(true);
          } else {
            oControl.setShowValueHelp(false);
          }
        }

        return oControl;
    }

    SmartField.prototype._createEdmNumeric = function (AnnotationHelper, Type) {
        var oControl, that = this;

        // 需要判断在form中还是在table中使用，在table中currency不可编辑，form中可编辑
        // currency的navigation 查找
        // 在form中
        if (this.isInSmartForm()) {
            oControl = new _Input({
                id: this.getId() + '-input',
                showValueHelp: false,
                value: this.getValue()
            });
        } else {
            // 数值+单位 模式(table中显示样式)
            if (this.oFieldData && this.oFieldData["@Org.OData.Measures.V1.Unit"] && this.oFieldData["@Org.OData.Measures.V1.Unit"]["$Path"]) {
                oControl = new _Input({
                    id: this.getId() + '-input',
                    fieldWidth: "70%",
                    showValueHelp: false,
                    description: "{" + this.oFieldData["@Org.OData.Measures.V1.Unit"]["$Path"] + "}"
                });
            } else {
                oControl = new _Input({
                    id: this.getId() + '-input',
                    showValueHelp: this.getShowValueHelp()
                });
            }
        }
        oControl.attachChange(function (oEvent) {
            var oSource = oEvent.getSource(),
                entitySet = oSource.getEntitySet(),
                entityType = AnnotationHelper.getEntityTypeByEntitySet(entitySet),
                field = oSource.getEntityField(),
                maxLengh = oSource.oField.oFieldInfo.$Precision ? oSource.oField.oFieldInfo.$Precision : oSource.oField.oFieldInfo.$MaxLength,
                minLength = oSource.oField.oFieldInfo.$Scale,
                _number = Number(oSource.getValue());

            if (AnnotationHelper.isPropertyFieldControl(entityType, field)) {
                if (oSource.getValue() === "") {
                    oSource.setValueState(ValueState.Error);
                    that.fireCheck();
                    return;
                } else {
                    oSource.setValueState(ValueState.None);
                }
            }
            if (!isNaN(_number)) {
                let _strNumber = _number.toString().split(".");
                if (_strNumber[0].length > maxLengh || (_strNumber[1] && _strNumber[1].length > minLength)) {
                    oSource.setValueState(ValueState.Error);
                } else {
                    oSource.setValueState(ValueState.None);
                }
            } else {
                oSource.setValueState(ValueState.Error);
            }
            that.fireCheck();
        });
        if (!this.oFieldData || !this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList'] || !this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
            if (this.getSmartFilterBar()) {
                oControl.setSupportRanges(true);
                oControl.setSupportRangesOnly(true);
            } else {
                oControl.setShowValueHelp(false);
            }
        }
        if (this.getBindingInfo("value") && this.getBindingInfo("value").binding) {
            let oIntType = new sap.ui.model.type.Float();
            this.getBindingInfo("value").binding.setType(oIntType, "string");
        }
        return oControl;
    }

    SmartField.prototype._createEdmBoolean = function (AnnotationHelper, Type) {
        var oControl;
        var sId = this.getId();
        let items = [];
        if (this.getSmartFilterBar()) {
            items.push(new Item({
                key: '',
                text: ''
            }));
        }
        items.push(new Item({
            key: 'null',
            text: i18n.getText('Empty')
        }));
        items.push(new Item({
            key: true,
            text: i18n.getText('Yes')
        }));
        items.push(new Item({
            key: false,
            text: i18n.getText('No')
        }));
        oControl = new Select({
            // selectedKey: "{" + this.getEntityField() + "}",
            id: sId + '-Select',
            items: items
        });
        return oControl;

    }

    SmartField.prototype._createComDpbirdBool = function (AnnotationHelper, Type) {
        // TODO: enumeration需要重新设置
        var arr = AnnotationHelper.getEnum(Type);
        var oControl;
        var sId = this.getId();
        let items = [];
        if (this.getSmartFilterBar()) {
            items.push(new Item({
                key: '',
                text: ''
            }));
            arr.forEach(function (item, index) {
                items.push(new Item({
                    key: AnnotationHelper.getNameSpace() + "Bool'" + item.value + "'",
                    text: item.value
                }));
            });
        } else {
            arr.forEach(function (item, index) {
                items.push(new Item({
                    key: item.value,
                    text: item.value
                }));
            });
        }

        oControl = new Select({
            selectedKey: this.getValue(),
            id: sId + '-SelectEdum',
            items: items
        });
        return oControl;
    }

    return SmartField;
}, true);
