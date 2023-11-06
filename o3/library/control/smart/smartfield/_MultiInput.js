/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/Device',
    'sap/m/MultiInput',
    'o3/library/control/smart/smartfield/_ValueHelpDialog',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/library',
    'o3/library/control/smart/smartfield/_Suggestion',
    'o3/library/control/smart/smartfield/_TokenParser'
], function (Device, MultiInput, _ValueHelpDialog, JSONModel, coreLib, _Suggestion, _TokenParser) {
    "use strict";
    var ValueState = coreLib.ValueState;

    var AnnotationHelper;
    var _MultiInput = MultiInput.extend('o3.library.control.smart.smartfield._MultiInput', {
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
            MultiInput.prototype.init.apply(this, arguments);

            this.oField;//smartfield控件
            this.oFieldData = [];
            this.oTokenParser = new _TokenParser('Contains');
            this.addValidator(this.onValidator.bind(this));
            this.setSuggestionRowValidator(this.suggestionRowValidator);

            this.attachChange((oEvent) => {
                this.setValueState(ValueState.None);

                var newValue = oEvent.getParameter('value');
                if (newValue === "") {
                    return;
                }
                if (this.getSelectedKey()) {
                    newValue = this.getSelectedKey();
                }
                let oCollectionPath, oCollectionPathEntityType, oCollectionPathObject;
                if (this.oFieldData.isHaveValueListCollection) {
                    oCollectionPath = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
                } else {
                    return;
                }
                if (this.oValueHelpDialog && this.oValueHelpDialog.isOpen()) {
                    this.setValue("");
                    return;
                }
            });

            this.attachValueHelpRequest(this.onValueHelpRequested, this);
        },
        renderer: function (oRm, oControl) {
            sap.m.MultiInputRenderer.render(oRm, oControl);
        }
    });

    _MultiInput.prototype.suggestionRowValidator = function (oColumnListItem) {
        var aCells = oColumnListItem.getCells();

        return new sap.ui.core.Item({
            key: aCells[0].getText(),
            text: aCells[1].getText()
        });
    };

    _MultiInput.prototype.onValidator = function (args) {
        this.setValueState("None");
        var key, text, that = this, operation = "EQ";
        if (args && args.suggestionObject && args.suggestionObject.getCells()) {
            key = args.suggestionObject.getCells()[0].getText();
            text = args.suggestionObject.getCells()[1].getText() + "(" + key + ")";
            return new sap.m.Token({ key: key, text: text });
        } else {
            var oToken = this.oTokenParser.getTokenByText(this.getEntityField(), args.text);
            if (oToken) {
                if (this.oFieldData.isHaveValueListCollection) {
                    var datarange = oToken.data().range;
                    if (datarange.operation === "EQ" && datarange.value1 === args.text) {
                        this.setValueState("Error");
                        return null;
                    }
                    return oToken;
                } else {
                    return oToken;
                }
            }
        }
    };

    _MultiInput.prototype.initAnnotation = function (oField, oAnnotationHelper) {
        this.setProperty('annotationHelper', oAnnotationHelper);
        AnnotationHelper = oAnnotationHelper;

        this.oField = oField;
        // this.oFieldData = AnnotationHelper.getEntityFieldAnnotation(this.getEntityType(), this.getEntityField());
        this.oFieldData = AnnotationHelper.getAllFieldInfo(this.getEntitySet(), this.getEntityField());

        (new _Suggestion()).attachSuggestion(this, oAnnotationHelper);
    }

    _MultiInput.prototype.onValueHelpRequested = function () {
        this.oValueHelpDialog = new o3.library.control.smart.smartfield._ValueHelpDialog({
            stretch: Device.system.phone,
            basicSearchText: '',
            supportRanges: this.getSupportRanges() || this.getShowValueHelp(),
            supportRangesOnly: !this.oFieldData.isHaveValueListCollection && this.getShowValueHelp(),
            supportMultiselect: true,
            title: AnnotationHelper.getFieldLabel(this.getEntityType(), this.getEntityField()),
        });

        this.oValueHelpDialog.setEntityType(this.getEntityType());
        this.oValueHelpDialog.setEntityField(this.getEntityField());
        this.oValueHelpDialog.initAnnotation(this.oField, this, AnnotationHelper);

        this.addDependent(this.oValueHelpDialog);
        this.oValueHelpDialog.open();
        // this.fireSuggest({ suggestValue: "" });
    }

    return _MultiInput;
});