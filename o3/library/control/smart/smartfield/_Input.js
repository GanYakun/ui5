/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/Device',
    'sap/m/Input',
    'o3/library/control/smart/smartfield/_ValueHelpDialog',
    'o3/library/control/smart/smartfield/_Suggestion',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/library',
], function (Device, Input, _ValueHelpDialog, _Suggestion, JSONModel, coreLib) {
    "use strict";
    var ValueState = coreLib.ValueState;
    var AnnotationHelper;
    var _Input = Input.extend('o3.library.control.smart.smartfield._Input', {
        metadata: {
            properties: {
                annotationHelper: { type: 'o3.library.model.AnnotationHelper' },
                entitySet: { type: 'string' },
                entityType: { type: 'string' },
                entityField: { type: 'string' },
                supportRanges: { type: 'boolean', defaultValue: false },
                supportRangesOnly: { type: 'boolean', defaultValue: false },
            }
        },
        init: function () {
            Input.prototype.init.apply(this, arguments);

            this.oField;//smartfield控件
            this.oFieldData = [];

            this.setTextFormatMode('ValueKey');
            this.setSuggestionRowValidator(this.suggestionRowValidator);
            this.attachValueHelpRequest(this.onValueHelpRequested, this);
            this.attachChange((oEvent) => {
                this.setValueState(ValueState.None);

                let newValue = oEvent.getParameter('value');
                if (newValue === "" && this.getParent() && this.getParent().getBindingInfo && this.getParent().getBindingInfo("value") && this.getParent().getBindingInfo("value").binding) {
                    this.getParent().getBindingInfo("value").binding.setValue(null);
                }
                // let oCollectionPath = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
                // let oCollectionPathEntityType = AnnotationHelper.getEntityTypeByEntitySet(oCollectionPath);
                // let oCollectionPathObject = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + oCollectionPathEntityType);
                let oCollectionPath, oCollectionPathEntityType, oCollectionPathObject, oColumnDescriptionKey;
                if (this.oFieldData && this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList'] && this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
                    oCollectionPath = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
                    oCollectionPathEntityType = AnnotationHelper.getEntityTypeByEntitySet(oCollectionPath);
                    oCollectionPathObject = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + oCollectionPathEntityType);
                    oColumnDescriptionKey = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList'] && this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']["Parameters"][1]["ValueListProperty"];
                } else {
                    return;
                }
                if (newValue && oCollectionPath) {
                    let regExp = /\(([^)]*)\)/g;
                    let lastKey = '';
                    let result;
                    while ((result = regExp.exec(newValue)) != null) {
                        lastKey = result[1];
                    }
                    if (lastKey) {
                        newValue = lastKey;
                    }
                    if (newValue) {//有括号表示有主键
                        o3Tool.request(oCollectionPath + "('" + newValue + "')").then((rsp) => {
                            if (oColumnDescriptionKey) {
                                this.setValue(rsp[oColumnDescriptionKey] + ' (' + newValue + ')');
                                if (this.oField._oControl.display && this.oField._oControl.display.setText) {
                                    this.oField._oControl.display.setText(rsp[oColumnDescriptionKey] + ' (' + newValue + ')');
                                }
                            } else {
                                this.setValue(rsp['description'] + ' (' + newValue + ')');
                                if (this.oField._oControl.display && this.oField._oControl.display.setText) {
                                    this.oField._oControl.display.setText(rsp[oColumnDescriptionKey] + ' (' + newValue + ')');
                                }
                            }
                            if (this.getParent()) {
                                this.setSelectedKey(newValue);
                                this.getParent().setProperty("value", newValue, true);
                                this.getParent().fireCheck();
                            }
                        }, (rsp) => {
                            this.setValueState(ValueState.Error);
                            if (this.getParent()) {
                                this.getParent().fireCheck();
                            }
                        });
                    }
                }
            });
        },
        renderer: function (oRm, oControl) {
            sap.m.InputRenderer.render(oRm, oControl);
        }
    });

    _Input.prototype.suggestionRowValidator = function (oColumnListItem) {
        var aCells = oColumnListItem.getCells();

        return new sap.ui.core.Item({
            key: aCells[0].getText(),
            text: aCells[1].getText()
        });
    };

    _Input.prototype.initAnnotation = function (oField, oAnnotationHelper) {
        this.setProperty('annotationHelper', oAnnotationHelper);
        AnnotationHelper = oAnnotationHelper;

        this.oField = oField;
        this.oFieldData = AnnotationHelper.getEntityFieldAnnotation(this.getEntityType(), this.getEntityField());

        (new _Suggestion()).attachSuggestion(this, oAnnotationHelper);
    }

    _Input.prototype.onValueHelpRequested = function () {
        this.oValueHelpDialog = new o3.library.control.smart.smartfield._ValueHelpDialog({
            stretch: Device.system.phone,
            basicSearchText: '',
            supportRangesOnly: this.getSupportRangesOnly(),
            supportMultiselect: false,
            supportRanges: this.getSupportRanges(),
            title: AnnotationHelper.getFieldLabel(this.getEntityType(), this.getEntityField()),
        });

        this.oValueHelpDialog.setEntityType(this.getEntityType());
        this.oValueHelpDialog.setEntityField(this.getEntityField());
        this.oValueHelpDialog.initAnnotation(this.oField, this, AnnotationHelper);

        this.addDependent(this.oValueHelpDialog);
        this.oValueHelpDialog.open();
        this.fireSuggest({ suggestValue: "" });
    }

    return _Input;
});