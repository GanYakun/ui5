sap.ui.define([
    'sap/ui/layout/form/Form',
    'sap/ui/layout/form/FormRenderer',
    'o3/library/model/AnnotationHelper',
    'o3/library/control/smart/smartform/GroupElement',
    'o3/library/control/smart/smartform/ColumnLayout',
    'o3/library/control/smart/smartform/Group',
    'o3/library/control/smart/smartform/ResponsiveGridLayout'
],
    function (Form, FormRenderer, AnnotationHelper, GroupElement, ColumnLayout, Group, ResponsiveGridLayout) {
        var SmartFormAF = Form.extend("o3.library.control.smart.smartform.SmartFormAF", {
            metadata: {
                properties: {
                    config: { type: "Object", group: "Misc", defaultValue: null },
                    annotationData: { type: "Object", group: "Misc", defaultValue: null }
                },
                aggregations: {
                    formContainers: {
                        type: "o3.library.control.smart.smartform.Group",
                        multiple: true, singularName: "formContainer"
                    }
                }
            },

            renderer: FormRenderer,

            constructor: function () {
                Form.apply(this, arguments);
                this.creteForm();
            }
        });

        SmartFormAF.prototype.creteForm = function () {
            var btnConfig = this.getConfig();
            var arrFormElements = [];
            var annotations = this.getAnnotationData() ? this.getAnnotationData()["$Annotations"] : "";
            var nameSpace = AnnotationHelper.getNameSpace();

            // this.setLayout(new ColumnLayout({ columnsXL: 3, columnsL: 3, columnsM: 2 }));
            this.setLayout(new ResponsiveGridLayout({ labelSpanXL: 4, labelSpanL: 4, labelSpanM: 12, labelSpanS: 12, adjustLabelSpan: false, emptySpanXL: 0, emptySpanL: 0, emptySpanM: 0, emptySpanS: 0, columnsXL: 2, columnsL: 2, columnsM: 1, singleContainerFullSize: false }));

            // 配置annotation
            if (annotations && annotations[nameSpace + this.getConfig().name]) {
                var annotationDataAF = annotations[nameSpace + this.getConfig().name];
                var groups = annotationDataAF["@com.sap.vocabularies.UI.QuickViewFacets"];
                for (var i = 0; i < groups.length; i++) {
                    var groupTitle = groups[i].Label;
                    var annotationPath = groups[i]["Target"]["$AnnotationPath"];
                    var groupElements = annotationDataAF[annotationPath]["Data"] ? annotationDataAF[annotationPath]["Data"] : [];
                    arrFormElements = [];
                    for (var j = 0; j < groupElements.length; j++) {
                        var field = groupElements[j].Value["$Path"];
                        var fieldLable = groupElements[j].Label ? groupElements[j].Label : field;
                        var configField;
                        var flag = btnConfig['$Parameter'].some(function (item, i) {
                            if (item["$Name"] === field) {
                                configField = item;
                                return item;
                            }
                        });

                        if (flag) {
                            var _groupElement = new GroupElement({
                                label: new sap.m.Label({ text: fieldLable, required: configField['$Nullable'] === false ? true : false }),
                                fields: [
                                    this.createControl(configField)
                                ]
                            });
                            _groupElement.getLabel().addStyleClass("sapUiTinyMarginTop")
                            arrFormElements.push(_groupElement);
                        }
                    }
                    this.addFormContainer(new Group({
                        title: groupTitle,
                        formElements: arrFormElements
                    }));
                }
            } else {
                for (var i = 0; i < btnConfig['$Parameter'].length; i++) {
                    if (i === 0) {
                        continue;
                    }
                    var item = btnConfig['$Parameter'][i];
                    var _groupElement = new GroupElement({
                        label: new sap.m.Label({ text: item['$Name'], required: item['$Nullable'] === false ? true : false }),
                        fields: [
                            this.createControl(item)
                        ]
                    });
                    arrFormElements.push(_groupElement);
                }
                this.addFormContainer(new Group({
                    formElements: arrFormElements
                }));
            }
        };

        SmartFormAF.prototype.createControl = function (configField) {
            let oControl;
            if (configField.$Type === "Edm.DateTimeOffset") {
                oControl = new sap.m.DateTimePicker({
                    id: jQuery.sap.uid() + "-" + configField["$Name"],
                    displayFormat: "yyyy-MM-dd HH:mm:ss"
                });
            } else if (configField.$Type === "Edm.Boolean") {
                oControl = new sap.m.CheckBox({
                    id: jQuery.sap.uid() + "-" + configField["$Name"]
                });
            } else {
                oControl = new sap.m.Input({
                    id: jQuery.sap.uid() + "-" + configField["$Name"]
                });
            }
            return oControl;
        };

        SmartFormAF.prototype.getElements = function () {
            var arrEle = [];
            var arrFormContainers = this.getFormContainers();
            for (var i = 0; i < arrFormContainers.length; i++) {
                var arrFormElements = arrFormContainers[i].getFormElements();
                for (var j = 0; j < arrFormElements.length; j++) {
                    arrEle.push(arrFormElements[j]);
                }
            }
            return arrEle;
        };

        SmartFormAF.prototype.execute = function (smartTable, dialog) {
            var nameSpace = AnnotationHelper.getNameSpace(),
                requestArr = [],
                selectContexts = smartTable.getSelectedContexts(),
                formElements = this.getElements(),
                parameter = {},
                str = "",
                that = this;

            if (this.check()) {
                sap.m.MessageBox.error("Invalid entry");
                return;
            }

            if (this.getConfig()["$kind"] === "Action") {
                requestArr = [];
                for (var i = 0; i < formElements.length; i++) {
                    var field0 = formElements[i].getFields()[0];
                    var name = field0.getId().split("-")[field0.getId().split("-").length - 1];

                    if (field0.isA("sap.m.DateTimePicker")) {
                        parameter[name] = field0.getDateValue().toISOString();
                    } else if (field0.isA("sap.m.CheckBox")) {
                        parameter[name] = field0.getSelected() ? true : false;
                    } else {
                        parameter[name] = field0.getValue();
                    }
                }
                for (var i = 0; i < selectContexts.length; i++) {
                    var sPath = selectContexts[i].getPath().split("/")[1] + "/" + nameSpace + this.getConfig().name;
                    requestArr.push({
                        url: sPath,
                        method: "POST",
                        body: parameter
                    });
                }
                o3Tool.setBusy(true);
                o3Tool.request(requestArr).then(function (message) {
                    o3Tool.setBusy(false);
                    if (message && message[0] && message[0].error) {
                        sap.m.MessageBox.error(JSON.stringify(message[0].error.message));
                    } else {
                        if (message && message[0] && message[0].value) {
                            sap.m.MessageToast.show(JSON.stringify(message[0].value));
                        } else {
                            sap.m.MessageToast.show(JSON.stringify(message));
                        }
                        that.clearFormData();
                    }
                });
            }

            if (this.getConfig()["$kind"] === "Function") {
                requestArr = [];
                for (var i = 0; i < formElements.length; i++) {
                    var field0 = formElements[i].getFields()[0];
                    var name = field0.getId().split("-")[field0.getId().split("-").length - 1];
                    // 空值不传
                    if (field0.getValue()) {
                        str = str + name + "='" + field0.getValue() + "',"
                    }
                }
                str = "(" + str.substring(0, str.lastIndexOf(',')) + ")";
                for (var i = 0; i < selectContexts.length; i++) {
                    var sPath = selectContexts[i].getPath().split("/")[1] + "/" + nameSpace + this.getConfig().name + str;
                    requestArr.push({
                        url: sPath,
                        method: "GET"
                    });
                    o3Tool.setBusy(true);
                    o3Tool.request(requestArr).then(function (message) {
                        o3Tool.setBusy(false);
                        if (message && message[0] && message[0].error) {
                            sap.m.MessageBox.error(JSON.stringify(message[0].error.message));
                        } else {
                            if (message && message[0] && message[0].value) {
                                sap.m.MessageToast.show(JSON.stringify(message[0].value));
                            } else {
                                sap.m.MessageToast.show(JSON.stringify(message));
                            }
                            that.clearFormData();
                        }
                    });
                }
            }

            dialog.close();
        };

        SmartFormAF.prototype.cancel = function (dialog) {
            this.clearFormData();
            dialog.close();
        };

        SmartFormAF.prototype.check = function (smartTable) {
            let flag = false;
            var formElements = this.getElements();

            for (var i = 0; i < formElements.length; i++) {
                var field0 = formElements[i].getFields()[0];
                var required = formElements[i].getLabel().getRequired();
                // 是否必输
                if (required && !field0.getValue()) {
                    field0.setValueState("Error");
                    flag = true;
                }
            }
            return flag;
        };

        SmartFormAF.prototype.clearFormData = function () {
            var formElements = this.getElements();

            for (var i = 0; i < formElements.length; i++) {
                var field0 = formElements[i].getFields()[0];
                if (field0.setValue) {
                    field0.setValue();
                }
                if (field0.setDateValue) {
                    field0.setDateValue();
                }
                if (field0.setSelected) {
                    field0.setSelected(false);
                }
                if (field0.setValueState) {
                    field0.setValueState("None");
                }
            }
        };

        return SmartFormAF;
    }
);