sap.ui.define([
    'sap/uxap/ObjectPageLayout',
    'o3/library/model/AnnotationHelper',
    'o3/library/control/smart/smartform/SmartForm',
    'o3/library/control/smart/dynamic/SmartBaseSection',
    'o3/library/control/smart/dynamic/SmartSubSection',
    'o3/library/control/smart/smartfield/SmartField',
    'sap/m/MessageBox',
    'o3/library/control/smart/smartform/ColumnLayout',
    'o3/library/control/smart/smartform/Group',
    'o3/library/control/smart/smartform/GroupElement',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Core'
], function (ObjectPageLayout, AnnotationHelper, SmartForm, SmartBaseSection, SmartSubSection, SmartField, MessageBox,
    ColumnLayout, Group, GroupElement, JSONModel, Core) {
    "use strict";

    let resourceB;

    let SmartCreatePage = ObjectPageLayout.extend('o3.library.control.smart.dynamic.SmartCreatePage', {
        metadata: {
            library: "sap.uxap",
            properties: {
                entitySet: { type: "string", group: "Misc" },
                excludeFields: { type: "string", group: "Misc" },
                objectTitle: { type: "string", group: "Misc" },
                objectSubtitle: { type: "string", group: "Misc" },
                showCancelButton: { type: "boolean", group: "Misc", defaultValue: false },
                showSaveButton: { type: "boolean", group: "Misc", defaultValue: false },
                showSaveNavToDetailButton: { type: "boolean", group: "Misc", defaultValue: false },
                useQuickCreate: { type: "boolean", group: "Misc", defaultValue: false }
            },
            defaultAggregation: "sections",
            aggregations: {
                sections: { type: "o3.library.control.smart.dynamic.SmartBaseSection", multiple: true, singularName: "section" }
            }
        },
        init: function () {
            ObjectPageLayout.prototype.init.apply(this, arguments);
            this.bInitiaMetadata = false;
            this.oSmartForm = undefined;
            this.oController = undefined;
            this.sRoutPath = "";
            this.s4jsonModel = new JSONModel();
            this.setModel(this.s4jsonModel, "sm4rtM0d3l");
            resourceB = Core.getLibraryResourceBundle("o3.library.i18n");
            this.attachModelContextChange(this._initialiseMetadata, this);
        },
        renderer: function (oRm, oControl) {
            sap.uxap.ObjectPageLayoutRenderer.render(oRm, oControl);
        }
    });

    SmartCreatePage.prototype._initialiseMetadata = function (oEvt) {
        let that = this;
        let oModel = this.getModel();
        if (!that.bInitiaMetadata && oModel) {
            AnnotationHelper.init(oModel).then(function (oDataAnnotations) {
                that.oController = that._getView();
                that.setControllerMethod();
                that.initObjectPage(oDataAnnotations);
            });
        }
    };

    SmartCreatePage.prototype.initObjectPage = function (oDataAnnotations) {
        let that = this;
        let aFormElements = [];
        let aExcludeFields = this.getExcludeFields() ? this.getExcludeFields().split(",") : [];
        let sEntitySet = this.getEntitySet();
        let sEntityType = AnnotationHelper.getEntityTypeByEntitySet(sEntitySet);
        let sNameSpace = AnnotationHelper.getNameSpace();
        let oEntitySetNnnotations = oDataAnnotations[sNameSpace + sEntityType];

        // 保存key
        this.sRoutPath = oEntitySetNnnotations["$Key"];


        if (this.getUseQuickCreate()) {
            this.oSmartForm = new SmartForm({
                quickCreateSet: sEntitySet
            });
        } else {
            for (let item in oEntitySetNnnotations) {
                if (oEntitySetNnnotations[item] && oEntitySetNnnotations[item]["$kind"] && oEntitySetNnnotations[item]["$kind"] === "Property") {
                    let flag = false;
                    for (let i = 0; i < aExcludeFields.length; i++) {
                        if (item === aExcludeFields[i]) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        aFormElements.push(new GroupElement({
                            fields: [new SmartField({
                                value: {
                                    path: 'sm4rtM0d3l>/' + item,
                                    type: 'sap.ui.model.odata.type.String'
                                },
                                entitySet: sEntitySet,
                                entityField: item
                            })]
                        }));
                    }
                }
            }
            this.oSmartForm = new SmartForm({
                editable: true,
                title: resourceB.getText("objectpage_section_form_title"),
                creatable: true,
                layout: new ColumnLayout({
                    columnsXL: 4,
                    columnsL: 3,
                    columnsM: 2
                }),
                formContainers: [new Group({
                    formElements: aFormElements
                })]
            });
        }

        this.setHeaderTitle(new sap.uxap.ObjectPageHeader({
            objectTitle: this.getObjectTitle(),
            objectSubtitle: this.getObjectSubtitle(),
        }));

        this.addSection(new SmartBaseSection({
            showTitle: false,
            title: resourceB.getText("objectpage_section_form_title"),
            subSections: [new SmartSubSection({
                title: "",
                blocks: this.oSmartForm
            })]
        }));

        this.setFooter(new sap.m.OverflowToolbar({
            content: [
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({ text: resourceB.getText("objectpage_footer_btn_create"), visible: this.getShowSaveButton(), press: that.oController.onSaveBtnPress }),
                new sap.m.Button({ text: resourceB.getText("objectpage_footer_btn_createAndEdit"), visible: this.getShowSaveNavToDetailButton(), press: that.oController.onNavToDetailCreateBtnPress }),
                new sap.m.Button({ text: resourceB.getText("objectpage_footer_btn_cancel"), visible: this.getShowCancelButton(), press: that.oController.onCancelBtnPress })
            ]
        }));
    };

    SmartCreatePage.prototype.setControllerMethod = function () {
        let that = this;

        this.oController.oRouter = sap.ui.core.UIComponent.getRouterFor(this.oController);

        // 获取@odata.id，自己拼接
        function getRoutPath(message) {
            let str = "";
            if (message && message[0]) {
                for (var i = 0; i < that.sRoutPath.length; i++) {
                    str = str + that.sRoutPath[i] + "='" + message[0][that.sRoutPath[i]] + "',";
                }
            }
            str = str.substring(0, str.lastIndexOf(','));
            str = that.getEntitySet() + "(" + str + ")";
            return str;
        }

        // TODO:~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Title warning怎么传，需要写什么文本

        this.oController["onSaveBtnPress"] = function () {
            MessageBox["warning"](resourceB.getText("msg_ok") + that.getObjectTitle() + "?", {
                title: that.getObjectTitle(),
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        if (!that.oSmartForm.check()) {
                            if (that.getUseQuickCreate()) {
                                that.oSmartForm.quickCreateSave(function () {
                                    history.go(-1);
                                });
                            } else {
                                smartForm.onCreate(this.getEntitySet(), that.s4jsonModel.getData(), function (message) {
                                    if (message[0] && message[0].error && message[0].error.message) {
                                        MessageBox.error(message[0].error.message);
                                        return;
                                    }
                                    that.clearFormData();
                                    history.go(-1);
                                });
                            }
                        }
                    }
                }
            });
        };

        this.oController["onNavToDetailCreateBtnPress"] = function () {
            MessageBox["warning"](resourceB.getText("msg_ok") + that.getObjectTitle() + "?", {
                title: that.getObjectTitle(),
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        if (!that.oSmartForm.check()) {
                            if (that.getUseQuickCreate()) {
                                that.oSmartForm.quickCreateSave(function (message) {
                                    let sRoutPath = getRoutPath(message);
                                    that.oController.oRouter.navTo('Detail', {
                                        detail: sRoutPath
                                    }, false);
                                    that.oSmartForm.clearFormData();
                                });
                            } else {
                                that.oSmartForm.onCreate(that.getEntitySet(), that.s4jsonModel.getData(), function (message) {
                                    if (message[0] && message[0].error && message[0].error.message) {
                                        MessageBox.error(message[0].error.message);
                                        return;
                                    }
                                    let sRoutPath = getRoutPath(message);
                                    that.oController.oRouter.navTo('Detail', {
                                        detail: sRoutPath
                                    }, false);
                                    that.oSmartForm.clearFormData();
                                });
                            }
                        }
                    }
                }
            });
        }

        this.oController["onCancelBtnPress"] = function () {
            that.oSmartForm.clearFormData();
            history.go(-1);
        }
    };

    SmartCreatePage.prototype._getView = function () {
        if (!this._oView) {
            let oObj = this.getParent();
            while (oObj) {
                if (oObj.isA("sap.ui.core.mvc.View")) {
                    this._oView = oObj;
                    break;
                }
                oObj = oObj.getParent();
            }
        }
        return this._oView;
    };

    return SmartCreatePage;
});