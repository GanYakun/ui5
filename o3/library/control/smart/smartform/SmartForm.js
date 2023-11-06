sap.ui.define([
    'sap/ui/layout/form/Form',
    'sap/ui/layout/form/FormRenderer',
    'o3/library/model/AnnotationHelper',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/m/Button',
    'sap/m/Title',
    'sap/m/Dialog',
    'sap/m/Toolbar',
    'sap/m/ToolbarSpacer',
    'o3/library/control/smart/smartform/GroupElement',
    'o3/library/control/smart/smartform/ColumnLayout',
    'o3/library/control/smart/smartform/Group',
    'o3/library/control/smart/smartfield/SmartField',
    'sap/m/OverflowToolbar',
    'o3/library/model/Util'
],
    function (Form, FormRenderer, AnnotationHelper, MessageToast, MessageBox, Button, Title, Dialog, Toolbar, ToolbarSpacer,
        GroupElement, ColumnLayout, Group, SmartField, OverflowToolbar, Util) {
        var SmartForm = Form.extend("o3.library.control.smart.smartform.SmartForm", {

            metadata: {
                properties: {
                    quickCreateSet: {
                        type: "string",
                        group: "Misc",
                        defaultValue: null
                    },
                    // 是否显示编辑按钮
                    editTogglable: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: false
                    },
                    title: {
                        type: "string",
                        group: "Misc",
                        defaultValue: ""
                    },
                    entitySet: {
                        type: "string",
                        group: "Misc",
                        defaultValue: ""
                    },
                    creatable: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: false
                    },
                    allFormContainers: {
                        type: "Object",
                        group: "Misc",
                        defaultValue: null
                    }
                },
                aggregations: {
                    formContainers: { type: "o3.library.control.smart.smartform.Group", multiple: true, singularName: "formContainer" },
                    customToolbar: {
                        type: "sap.m.Toolbar",
                        multiple: false
                    }
                },
                events: {
                    save: {},
                    create: {},
                    editToggled: {}
                }
            },

            onAfterRendering: function (oEvent) {
                var i = 0;
            },

            renderer: FormRenderer,

            constructor: function () {
                Form.apply(this, arguments);
                this._createToolbar();
                this.attachModelContextChange(this._initialiseMetadata, this);
            }
        });

        SmartForm.prototype.setAllFormContainers = function (allFormContainers) {
            this.setProperty("allFormContainers", allFormContainers, true);
        };

        SmartForm.prototype._setElement = function () {
            var formContainers = this.getAllFormContainers();

            if (!formContainers || this.getFormContainers().length !== 0) {
                return;
            }
            var oFormLayout = new ColumnLayout({ columnsXL: 4, columnsL: 2, columnsM: 2 });
            this.setLayout(oFormLayout);
            for (var item in formContainers) {
                var arrFormElements = [];
                let groupTitle = formContainers[item]["title"];
                for (var j = 0; j < formContainers[item]["elements"].length; j++) {
                    let _control = new SmartField({
                        value: {
                            path: formContainers[item]["elements"][j],
                            type: 'sap.ui.model.odata.type.String'
                        },
                        entitySet: this.getEntitySet(),
                        entityField: formContainers[item]["elements"][j]
                    });
                    var _groupElement = new GroupElement({
                        label: formContainers[item]["elements"][j],
                        fields: _control
                    });
                    arrFormElements.push(_groupElement);
                }
                this.addFormContainer(new Group({
                    title: groupTitle,
                    formElements: arrFormElements
                }));
            }
        };

        SmartForm.prototype.setEditable = function (bEditable) {
            this.setProperty("editable", bEditable, true);
            if (this.bIsInitialised) {
                if (this.getEditTogglable()) {
                    if (bEditable) {
                        this.setFieldEditable(true);
                    } else {
                        this.setFieldEditable(false);
                    }
                } else {
                    this.setFieldEditable(bEditable);
                }
            }
            if (this._oEditButton && this._oSaveButton && this._oCancelButton) {
                this._oEditButton.setVisible(!bEditable && this.getEditTogglable());
                this._oSaveButton.setVisible(bEditable && this.getEditTogglable());
                this._oCancelButton.setVisible(bEditable && this.getEditTogglable());
            }
            return this;
        }

        SmartForm.prototype.setTitle = function (sText) {
            if (this._oTitle) {
                this._oTitle.setText(sText);
            } else {
                this._oTitle = new Title({ text: sText, titleStyle: "H5" });
            }
            if (this._oToolbar) {
                this._oToolbar.insertContent(this._oTitle, 0);
            }
            return this;
        };

        SmartForm.prototype.getTitle = function () {
            return this._oTitle;
        };

        SmartForm.prototype.setEntitySet = function (sText) {
            this.setProperty("entitySet", sText, true);
            if (sText) {
                this.bIsInitialised = false;
                this._initialiseMetadata();
            }
            return this;
        };

        SmartForm.prototype.getToolBar = function () {
            if (!this._oToolbar) {
                this._createToolbar();
                return this._oToolbar;
            }
            return this._oToolbar;
        };

        SmartForm.prototype.setCustomToolbar = function (oCustomToolbar) {
            this._oCustomToolbar = oCustomToolbar;
            return this;
        };

        SmartForm.prototype.getCustomToolbar = function () {
            return this._oCustomToolbar;
        };

        SmartForm.prototype._createToolbar = function () {
            var oCustomToolbar = null;

            if (!this._oToolbar) {
                oCustomToolbar = this.getCustomToolbar();
                if (oCustomToolbar) {
                    this._oToolbar = oCustomToolbar;
                } else {
                    this._oToolbar = new sap.m.OverflowToolbar();
                }

                if (this.getTitle() !== null) {
                    this._oToolbar.insertContent(this.getTitle(), 0);
                }
                this.setToolbar(this._oToolbar);
            }
        };

        SmartForm.prototype._addSpacerToToolbar = function () {
            var bFoundSpacer = false, aItems = this._oToolbar.getContent(), i, iLength;
            if (aItems) {
                iLength = aItems.length;
                for (var i = 0; i < iLength; i++) {
                    if (aItems[i] instanceof ToolbarSpacer) {
                        bFoundSpacer = true;
                        break;
                    }
                }
            }
            if (!bFoundSpacer) {
                this._oToolbar.addContent(new ToolbarSpacer(this.getId() + "-toolbarSpacer"));
            }
        };

        SmartForm.prototype._createToolbarContent = function () {
            var that = this;
            var model = this.getModel();

            this._addSpacerToToolbar();

            if (!this._oToolbar) {
                this._createToolbar();
            }

            if (this._oEditButton) {
                this._oToolbar.removeContent(this._oEditButton);
            } else {
                this._oEditButton = new Button({
                    text: "编辑",
                    visible: this.getEditTogglable(),
                    press: function () {
                        this._oSaveButton.setVisible(true);
                        this._oCancelButton.setVisible(true);
                        this._oEditButton.setVisible(false);
                        this.setEditable(true);
                        this.fireEditToggled({
                            editable: that.getEditable()
                        });
                    }.bind(this)
                });
            }

            if (this._oSaveButton) {
                this._oToolbar.removeContent(this._oSaveButton);
            } else {
                this._oSaveButton = new Button({
                    text: "保存",
                    visible: this.getEditTogglable(),
                    press: function () {
                        if (!that.check()) {
                            let updateGroupId = this.getBindingContext().getUpdateGroupId();
                            o3Tool.setBusy(true);
                            model.submitBatch(updateGroupId).then(function (oEvent) {
                                o3Tool.setBusy(false);
                                var bHasErrors = model.hasPendingChanges(updateGroupId);
                                if (bHasErrors) {
                                    MessageBox.error("更新失败,请重新操作!");
                                    // MessageToast.show();
                                } else {
                                    that.setEditable(false);
                                    that.fireEditToggled({
                                        editable: that.getEditable()
                                    });
                                    this.getBindingContext().refresh();
                                    MessageToast.show("修改成功!")
                                }
                            }.bind(this)).catch(function (oEvent) {
                                MessageToast.show(oEvent);
                            });
                        }
                    }.bind(this)
                });
            }

            if (this._oCancelButton) {
                this._oToolbar.removeContent(this._oCancelButton);
            } else {
                this._oCancelButton = new Button({
                    text: "取消",
                    visible: this.getEditTogglable(),
                    press: function () {
                        this._oSaveButton.setVisible(false);
                        this._oCancelButton.setVisible(false);
                        this._oEditButton.setVisible(true);
                        this.setEditable(false);
                        this.fireEditToggled({
                            editable: that.getEditable()
                        });
                        // 重置数据
                        if (model.hasPendingChanges()) {
                            let updateGroupId = this.getBindingContext().getUpdateGroupId();
                            model.resetChanges(updateGroupId);
                        }
                    }.bind(this)
                });
            }
            this._oToolbar.addContent(this._oEditButton);
            this._oToolbar.addContent(this._oSaveButton);
            this._oToolbar.addContent(this._oCancelButton);
            this._oToolbar.setVisible(this.getEditTogglable());
        };

        SmartForm.prototype._initialiseMetadata = function (oEvt) {
            var that = this, oControl = that;
            const oModel = this.getModel()

            // if (oEvt) {
            //     oControl = oEvt.getSource();
            // }
            if (!oControl.bIsInitialised && oModel) {
                AnnotationHelper.init(oModel).then(() => {
                    this.bIsInitialised = true;
                    this._setElement();
                    this._createToolbarContent();

                    if (this.getQuickCreateSet()) {
                        this._initQuickCreateForm(oModel);
                    } else {
                        this._setFieldLabel(oModel);
                        this.setEditable(this.getEditable());
                    }
                })
            }
        };

        // quickcreate 动态创建Form
        SmartForm.prototype._initQuickCreateForm = function (oModel) {
            this._AnnotationData = oModel.getMetaModel().getData();
            this._NameSpace = AnnotationHelper.getNameSpace(oModel);

            // 是否是两段式创建
            if (this.getQuickCreateSet().split("/").length > 1) {
                this.quickCreateSet01 = this._AnnotationData[this._AnnotationData['$EntityContainer']][this.getQuickCreateSet().split("/")[0].split("(")[0]];
                this.quickCreateSet = this.quickCreateSet01["$NavigationPropertyBinding"][this.getQuickCreateSet().split("/")[1]];
            } else {
                this.quickCreateSet = this.getQuickCreateSet();
            }
            this._EntityType = AnnotationHelper.getEntityTypeByEntitySet(this.quickCreateSet);

            var entityAnnotation = this._AnnotationData["$Annotations"][this._NameSpace + this._EntityType];
            var quickCreateFacets = entityAnnotation["@UI.QuickCreateFacets"];
            var arrFormElements = [];

            if (quickCreateFacets && quickCreateFacets.length) {
                for (var i = 0; i < quickCreateFacets.length; i++) {
                    var annotationPath = quickCreateFacets[i].Target.$AnnotationPath;
                    if (entityAnnotation[annotationPath]) {
                        var arrFields = entityAnnotation[annotationPath].Data;
                        for (var j = 0; j < arrFields.length; j++) {
                            var _field = arrFields[j].Value.$Path;
                            var _label = arrFields[j]["com.sap.vocabularies.Common.v1.Label"] ? arrFields[j]["com.sap.vocabularies.Common.v1.Label"] : _field;
                            var _control;
                            _control = new SmartField({
                                id: this.getId() + "--" + _field,
                                entitySet: this.quickCreateSet,
                                entityField: _field
                            });
                            var _groupElement = new GroupElement({
                                label: _label,
                                fields: _control
                            });
                            // 是否必输
                            if (AnnotationHelper.isPropertyFieldControl(this._EntityType, _field)) {
                                _groupElement.getLabelControl().setRequired(true);
                            }
                            arrFormElements.push(_groupElement);
                        }
                    } else {
                        var navigationProperty = annotationPath.split("/")[0];
                        var length = this._AnnotationData[this._NameSpace + this._EntityType][navigationProperty]["$Type"].split(".").length;
                        var navigationEntityType = this._AnnotationData[this._NameSpace + this._EntityType][navigationProperty]["$Type"].split(".")[length - 1];
                        var navigationEntitySet = AnnotationHelper.getNavigationPropertyBindingByEntitySet(this.quickCreateSet, navigationProperty);
                        var navigationAnnotaiton = this._AnnotationData["$Annotations"][this._NameSpace + navigationEntityType];
                        if (navigationAnnotaiton["@UI.LineItem#QuickCreate"]) {
                            var arrFields = navigationAnnotaiton["@UI.LineItem#QuickCreate"];
                            for (var j = 0; j < arrFields.length; j++) {
                                var _field = arrFields[j].Value.$Path;
                                var _label = arrFields[j]["com.sap.vocabularies.Common.v1.Label"] ? arrFields[j]["com.sap.vocabularies.Common.v1.Label"] : _field;
                                var _control;
                                _control = new SmartField({
                                    id: this.getId() + "--quickcreateNavgationProperty--" + navigationProperty + "--" + _field,
                                    entitySet: navigationEntitySet,
                                    entityField: _field
                                });
                                var _groupElement = new GroupElement({
                                    label: _label,
                                    fields: _control
                                });
                                var _fieldAnnotation = this._AnnotationData["$Annotations"][this._NameSpace + this._EntityType + "/" + _field];
                                if (_fieldAnnotation && _fieldAnnotation["@com.sap.vocabularies.Common.v1.FieldControl"]) {
                                    _groupElement.getLabelControl().setRequired(true);
                                }
                                arrFormElements.push(_groupElement);
                            }
                        }
                    }
                }
            }

            var oFormLayout = new ColumnLayout({ columnsXL: 3, columnsL: 3, columnsM: 2 });
            this.setLayout(oFormLayout);
            this.addFormContainer(new Group({
                formElements: arrFormElements
            }));
        };

        // 快速创建保存
        SmartForm.prototype.quickCreateSave = function (callback) {
            var postData = {};
            var navData = [];
            var _control = this;
            var formElements = this.getElements();
            var _smartFieldType;
            var that = this;

            formElements.forEach(function (item, index) {
                var arrFields = item.getAggregation("fields");
                for (var k = 0; k < arrFields.length; k++) {
                    var _smartField = arrFields[k];
                    var _id = _smartField.getId();
                    var length = _id.split("--").length;
                    var _field = _id.split("--")[length - 1];
                    _smartFieldType = _smartField.oFieldInfo.$Type;
                    if (_id.indexOf("quickcreateNavgationProperty") > -1) {
                        var navigationEntitySet = AnnotationHelper.getNavigationPropertyBindingByEntitySet(that.quickCreateSet, _id.split("--")[length - 2]);
                        navData.push({
                            fields: _field,
                            key: _id.split("--")[length - 2] + "@odata.bind",
                            navigationEntitySet: navigationEntitySet,
                            value: _smartField.getValue()
                        });
                    } else {
                        if (_smartFieldType === "Edm.Decimal" || _smartFieldType === "Edm.Float" || _smartFieldType === "Edm.Double") {
                            postData[_field] = parseFloat(_smartField.getValue());
                        } else if (_smartFieldType === "Edm.Single" || _smartFieldType === "Edm.Int16" || _smartFieldType === "Edm.Int32" || _smartFieldType === "Edm.Int64" || _smartFieldType === "Edm.Byte") {
                            postData[_field] = parseInt(_smartField.getValue());
                        } else if (_smartFieldType === "Edm.DateTimeOffset") {
                            postData[_field] = sap.ui.getCore().byId(that.getId() + "--" + _field).getFormatedDateValue();
                        } else if (_smartFieldType === "com.dpbird.Bool") {
                            postData[_field] = _smartField._oControl.edit.getSelectedKey();
                        } else {
                            postData[_field] = _smartField.getValue();
                        }
                    }
                }
            });

            let dataInfo = {};
            navData.forEach((item, index) => {
                let { key } = item;
                if (!dataInfo[key]) {
                    dataInfo[key] = {
                        id: index,
                        key,
                        child: []
                    }
                }
                dataInfo[key].child.push(item);
            });
            let list = Object.values(dataInfo);

            // 组合NavigationProperty
            list.forEach((item, index) => {
                var str = "(";
                let length = item.child.length;
                if (length === 1) {
                    if (item.child[0].value !== "")
                        postData[item.child[0].key] = item.child[0].navigationEntitySet + "('" + item.child[0].value + "')";
                } else {
                    item.child.forEach((elem, ind) => {
                        str = str + elem.fields + "='" + elem.value + "',";
                    });
                    postData[item.child[0].key] = str.substring(0, str.length - 1) + ")";
                }
            });

            for (var obj in postData) {
                postData[obj] = postData[obj] ? postData[obj] : null
            }

            o3Tool.setBusy(true);
            o3Tool.request([{
                url: this.getQuickCreateSet(),
                method: "POST",
                body: postData
            }]).then(function (message) {
                o3Tool.setBusy(false);
                if (message[0] && message[0].error && message[0].error.message) {
                    MessageBox.error(message[0].error.message);
                } else {
                    MessageToast.show("创建成功！");
                    _control.clearFormData();
                    callback(message);
                }
            });
        };

        SmartForm.prototype.getElements = function () {
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

        // check error
        SmartForm.prototype.check = function () {
            var that = this;
            var flag = false;
            var formElements = this.getElements();
            var oModel = this.getModel();
            this._AnnotationData = oModel.getMetaModel().getData();
            this._NameSpace = AnnotationHelper.getNameSpace(oModel);

            formElements.forEach(function (item, index) {
                var arrFields = item.getAggregation("fields");
                for (var k = 0; k < arrFields.length; k++) {
                    var _smartField = arrFields[k];

                    // 不是SmartField
                    if (!_smartField.isA("o3.library.control.smart.smartfield.SmartField")) {
                        if (_smartField.getLabels()[0].getRequired() && _smartField.getValue() === "") {
                            _smartField.setValueState("Error");
                            flag = true;
                            continue;
                        } else {
                            _smartField.setValueState("None");
                        }
                        continue;
                    } else {
                        var _field = _smartField.getEntityField(),
                            _smartFieldValue = _smartField.getValue(),
                            maxLengh = _smartField.oFieldInfo.$Precision ? _smartField.oFieldInfo.$Precision : _smartField.oFieldInfo.$MaxLength,
                            minLength = _smartField.oFieldInfo.$Scale,
                            _sLength = _smartFieldValue.toString().length,
                            _smartFieldType = _smartField.oFieldInfo.$Type,
                            _smartFieldValue,
                            smartfieldSet = _smartField.getEntitySet();
                        this._EntityType = AnnotationHelper.getEntityTypeByEntitySet(smartfieldSet);
                    }

                    if (_smartField.getValueState() === "Error") {
                        flag = true;
                        continue;
                    }
                    // 先判断是否必输，在判断值是否符合要求
                    if (AnnotationHelper.isPropertyFieldControl(this._EntityType, _field)) {
                        if (_smartFieldValue === "") {
                            _smartField.setValueState("Error");
                            flag = true;
                            continue;
                        } else {
                            _smartField.setValueState("None");
                        }
                    }
                    if (_smartFieldValue) {
                        if (_smartFieldType === "Edm.Decimal" || _smartFieldType === "Edm.Float" || _smartFieldType === "Edm.Double") {
                            if (!isNaN(_smartFieldValue)) {
                                let _strNumber = _smartFieldValue.toString().split(".");
                                if (_strNumber[0].length > (maxLengh - minLength) || (_strNumber[1] && _strNumber[1].length > (minLength))) {
                                    _smartField.setValueState("Error");
                                    flag = true;
                                    continue;
                                } else {
                                    _smartField.setValueState("None");
                                }
                            } else {
                                _smartField.setValueState("Error");
                                flag = true;
                                continue;
                            }
                        } else if (_smartFieldType === "Edm.Single" || _smartFieldType === "Edm.Int16" || _smartFieldType === "Edm.Int32" || _smartFieldType === "Edm.Int64" || _smartFieldType === "Edm.Byte") {
                            if (!isNaN(_smartFieldValue)) {
                                if (_smartFieldValue.toString().includes(".") || _smartFieldValue.toString().length > maxLengh) {
                                    _smartField.setValueState("Error");
                                    flag = true;
                                    continue;
                                } else {
                                    _smartField.setValueState("None");
                                }
                            } else {
                                _smartField.setValueState("Error");
                                flag = true;
                                continue;
                            }
                        } else if (_smartFieldType === "Edm.String") {
                            // 长度是否有效(字符串)
                            if (_sLength > maxLengh) {
                                _smartField.setValueState("Error");
                                flag = true;
                                continue;
                            } else {
                                _smartField.setValueState("None");
                            }
                        } else { }
                    }
                }
            });

            if (flag) {
                MessageBox.error("Invalid entry");
            }
            return flag;
        }

        // 清空表单数据
        SmartForm.prototype.clearFormData = function () {
            var arrFormContainers = this.getFormContainers();
            for (var i = 0; i < arrFormContainers.length; i++) {
                var arrFormElements = arrFormContainers[i].getFormElements();
                for (var j = 0; j < arrFormElements.length; j++) {
                    var arrFields = arrFormElements[j].getAggregation("fields");
                    for (var k = 0; k < arrFields.length; k++) {
                        var _smartField = arrFields[k];
                        _smartField.setValue();
                        _smartField.setValueState("None");
                        if (_smartField.getParent().getFields()[0].oFieldInfo && _smartField.getParent().getFields()[0].oFieldInfo.$Type === "Edm.DateTimeOffset") {
                            _smartField.getControl().setDateValue();
                        }
                        if (_smartField.setSelectedKey) {
                            _smartField.setSelectedKey();
                        }
                        if (_smartField.getControl() && _smartField.getControl().setSelectedKey) {
                            _smartField.getControl().setSelectedKey();
                        }
                    }
                }
            }
        }

        // 保存修改
        // SmartForm.prototype.Save = function (serviceUrl, method, body, callback) {
        //     var that = this;
        //     var dialog = new Dialog({
        //         title: 'Warning',
        //         type: 'Message',
        //         state: 'Warning',
        //         content: new Text({
        //             text: '是否确定修改?'
        //         }),
        //         beginButton: new Button({
        //             text: '确定',
        //             press: function () {
        //                 var requestUrl = [{
        //                     url: serviceUrl,
        //                     method: method,
        //                     body: body
        //                 }];
        //                 o3Tool.request(requestUrl).then(function (message) {
        //                     if (message && message.length > 0 && message[0] && message[0].error && message[0].error.message) {
        //                         if (callback) {
        //                             callback(message);
        //                         } else {
        //                             MessageToast.show(message[0].error.message);
        //                         }
        //                     } else {
        //                         that.setEditable(false);
        //                         that.fireEditToggled({
        //                             editable: that.getEditable()
        //                         });
        //                         if (callback) {
        //                             callback("更新成功！");
        //                         } else {
        //                             MessageToast.show("更新成功！");
        //                         }
        //                     }
        //                 });
        //                 dialog.close();
        //             }
        //         }),
        //         endButton: new Button({
        //             text: '取消',
        //             press: function () {
        //                 dialog.close();
        //             }
        //         }),
        //         afterClose: function () {
        //             dialog.destroy();
        //         }
        //     });
        //     dialog.open();
        // }

        // 手动创建
        SmartForm.prototype._onCreateBtnPress = function () {
            this.fireCreate();
        };

        // 设置页面状态 编辑&非编辑状态
        SmartForm.prototype.setFieldEditable = function (bool) {
            var arrFormContainers = this.getFormContainers();
            for (var i = 0; i < arrFormContainers.length; i++) {
                var arrFormElements = arrFormContainers[i].getFormElements();
                for (var j = 0; j < arrFormElements.length; j++) {
                    var arrFields = arrFormElements[j].getFields();
                    for (var k = 0; k < arrFields.length; k++) {
                        // SmartField
                        if (arrFields[k].mProperties.entityField) {
                            // 字段/实体
                            var entityField = arrFields[k].getProperty("entityField");
                            var entitySet = arrFields[k].getProperty("entitySet");
                            //字段是否可更新
                            if (this.getCreatable()) {
                                arrFields[k].setEditable(true);
                            } else {
                                if (bool && AnnotationHelper.isPropertyUpdatable(entitySet, entityField)) {
                                    arrFields[k].setEditable(true);
                                } else {
                                    arrFields[k].setEditable(false);
                                }
                            }
                            // 字段是否必输
                            if (bool && AnnotationHelper.isPropertyFieldControl(AnnotationHelper.getEntityTypeByEntitySet(entitySet), entityField)) {
                                arrFormElements[j].getLabelControl().setRequired(true);
                            } else {
                                arrFormElements[j].getLabelControl().setRequired(false);
                            }
                            continue;
                        }
                        // 普通的输入框
                        else {
                            if (arrFields[k].setEditable) {
                                arrFields[k].setEditable(bool);
                            }
                        }
                    }
                }
            }
        };

        // 设置标签
        SmartForm.prototype._setFieldLabel = function (bool) {
            var arrFormContainers = this.getFormContainers();
            for (var i = 0; i < arrFormContainers.length; i++) {
                var arrFormElements = arrFormContainers[i].getFormElements();
                for (var j = 0; j < arrFormElements.length; j++) {
                    var label = "";
                    var arrFields = arrFormElements[j].getFields()[0];
                    var entityField, entitySet, entityType;
                    if (arrFields.mProperties.entityField) {
                        entityField = arrFields.getProperty("entityField");
                        entitySet = arrFields.getProperty("entitySet");
                        entityType = AnnotationHelper.getEntityTypeByEntitySet(entitySet);
                        label = AnnotationHelper.getFieldLabel(entityType, entityField);
                    }
                    else {
                        if (arrFields.mBindingInfos && arrFields.mBindingInfos.selectedKey && arrFields.mBindingInfos.selectedKey.binding) {
                            label = arrFields.mBindingInfos.selectedKey.binding.sPath;
                            if (label) {
                                label = label.split("/")[label.split("/").length - 1];
                            }
                        } else if (arrFields.mBindingInfos && arrFields.mBindingInfos.text && arrFields.mBindingInfos.text.parts[0].path) {
                            label = arrFields.mBindingInfos.text.parts[0].path;
                            if (label) {
                                label = label.split("/")[label.split("/").length - 1];
                            }
                            label = label.split("/")[label.split("/").length - 1];
                        }
                    }

                    // if (arrFormElements[j].getLabel() !== null && arrFormElements[j].getLabel() !== "") { }
                    // else if (arrFormElements[j].getLabel() !== null && arrFormElements[j].getLabel().getText !== undefined && arrFormElements[j].getLabel().getText() !== "") { }
                    // else {
                    //     arrFormElements[j].setLabel(label);
                    // }
                    if (label && arrFormElements[j].setLabel) {
                        arrFormElements[j].setLabel(label);
                    }
                    // 字段是否必输
                    if (entityField && entityType && AnnotationHelper.isPropertyFieldControl(entityType, entityField)) {
                        arrFormElements[j].getLabelControl().setRequired(true);
                    }
                }
            }
        };


        // -----------------------------------------------------------------------------
        // 重定义bind方法 使用 $$updateGroupId 参数
        SmartForm.prototype.reBindElement = function (sPath) {
            var that = this;
            this.bindElement({
                path: sPath,
                parameters: {
                    // expand: "HEADTOITEM"
                    $$updateGroupId: 'update'
                },
                events: {
                    dataRequested: function (oData) {
                    },
                    dataReceived: function (odata) {
                        if (odata.getParameter("error")) {
                            MessageToast.show(odata.getParameter("error"));
                        }
                    }
                }
            });
        };

        // 调用此方法，可用于快速创建
        SmartForm.prototype.onCreate = function (sUrl, data, callback) {
            o3Tool.request([{
                url: sUrl,
                method: "POST",
                body: data
            }]).then(function (message) {
                if (message[0] && message[0].error && message[0].error.message) {
                    if (callback) {
                        callback(message)
                    } else {
                        MessageBox.error(message[0].error.message);
                    }
                } else {
                    if (callback) {
                        callback(message);
                    } else {
                        MessageToast.show("创建成功！");
                    }
                }
            });
        };

        SmartForm.prototype.exit = function (sPath) {
            this.bIsInitialised = null;
            this._oToolbar = null;
            this._oTitle = null;
            this._oCustomToolbar = null;
            this._AnnotationData = null;
            this._NameSpace = null;
            this.quickCreateSet01 = null;
            this.quickCreateSet = null;
            this._EntityType = null;
        }

        return SmartForm;
    }
);