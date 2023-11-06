sap.ui.define([
    "sap/m/VBox",
    "o3/sap/ui/comp/variants/VariantItem",
    "o3/sap/ui/comp/variants/VariantManagement",
    "sap/ui/model/json/JSONModel",
    "o3/library/model/AnnotationHelper",
    "o3/library/control/smart/smartfield/_TokenParser"
], function (VBox, VariantItem, VariantManagement, JSONModel, AnnotationHelper, _TokenParser) {
    "use strict";

    var SmartVariantManagement = VBox.extend("o3.library.control.smart.variants.SmartVariantManagement", {
        metadata: {
            library: "sap.ui.comp",
            properties: {
                entitySet: { type: "string", group: "Misc", defaultValue: null }
            },
            events: {
                initvalue: {}
            }
        },
        renderer: {
            apiVersion: 2
        },
        constructor: function () {
            VBox.apply(this, arguments);
            this.entitySet = null;
            this.entityType = null;
            this._oVariantManagement = null;
            this.createVariantManagement();
            this.attachModelContextChange(this._initialiseMetadata, this);
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

    SmartVariantManagement.prototype.init = function () {
        VBox.prototype.init.call(this);
        this.attachInitvalue(function (oEvent) {
            if (!this.isHaveSetVisible) {
                // 设置默认变式
                var defaultKey = AnnotationHelper.getSelectionPresentationVariant(this.getEntitySet());
                if (defaultKey) {
                    var selectKey = defaultKey.SelectionVariant.$Path.split("#");
                    if (selectKey.length > 1) {
                        this.getModel("initialSelectionModel").setProperty("/defaultKey", selectKey[1]);
                    } else {
                        this.getModel("initialSelectionModel").setProperty("/defaultKey", "*standard*");
                    }
                }
                this.setVisibleSmartFilterItems()
                this.isHaveSetVisible = true;
            }
            this.setFilterItemsByAnnotation();
        }.bind(this));
    };

    SmartVariantManagement.prototype._initialiseMetadata = function (oEvt) {
        const oModel = this.getModel();
        if (!this.bIsInitialised && oModel) {
            AnnotationHelper.init(oModel).then((oDataAnnotations) => {
                this.bIsInitialised = true;
                // 读取 Annotation 里面的 filter 信息
                this.setModel(new JSONModel({ "defaultKey": "*standard*" }), "initialSelectionModel");
                this.entitySet = this.getEntitySet();
                this.entityType = AnnotationHelper.getEntityTypeByEntitySet(this.entitySet);
                this.setVariantCollection(oDataAnnotations);
            })
        }
    };

    SmartVariantManagement.prototype.setVisibleSmartFilterItems = function () {
        var allFilterItems = this.getSmartFilterItems();
        allFilterItems.forEach(item => {
            item.setVisibleInFilterBar(false);
        });
    };

    SmartVariantManagement.prototype.createVariantManagement = function () {
        this.setModel(new JSONModel(), "oVariantModel");

        if (!this._oVariantManagement) {
            this._oVariantManagement = new VariantManagement({
                select: this.select.bind(this),
                save: this.save.bind(this),
                manage: this.manage.bind(this),
                initialSelectionKey: "{initialSelectionModel>/defaultKey}"
            });
            this._oVariantManagement.bindAggregation("variantItems", "oVariantModel>/", new VariantItem({
                key: "{oVariantModel>key}",
                text: "{oVariantModel>text}"
            }));
        }
        this.insertItem(this._oVariantManagement);
    };

    SmartVariantManagement.prototype.getSmartFilterItems = function () {
        var allControls = sap.ui.core.Element.registry.all();
        for (var obj in allControls) {
            if (allControls[obj].getSmartVariant && allControls[obj].getSmartVariant() && this._getView().byId(allControls[obj].getSmartVariant())) {
                return allControls[obj].getAllFilterItems();
            }
        }
        return false;
    };

    SmartVariantManagement.prototype.setFilterItemsByAnnotation = function () {
        var selectionKey = this._oVariantManagement.getSelectionKey();
        var filters = AnnotationHelper.getFiltersByAnnotation(this.getEntitySet(), selectionKey);  // Annotation 里面所有的过滤变式
        var smartFilterItems = this.getSmartFilterItems();
        var nameSapce = AnnotationHelper.getNameSpace();

        this.oTokenParser = new _TokenParser("Contains");

        function getDescription(url, str, _oControl, foreignKey, description) {
            o3Tool.request(url + "?$filter=" + str).then((rsp) => {
                for (var i = 0; i < rsp.value.length; i++) {
                    _oControl.addToken(new sap.m.Token({
                        key: rsp.value[i][foreignKey],
                        text: rsp.value[i][description] + ' (' + rsp.value[i][foreignKey] + ')'
                    }));
                }
            });
        }

        if (filters) {
            for (var i = 0; i < filters.SelectOptions.length; i++) {
                var option = filters.SelectOptions[i],
                    key = option.PropertyName.$PropertyPath, // Annotation 中定义的field
                    flag = true,
                    akey = [],
                    str = "",
                    _oControl, foreignKey, description, entitySet, entityField, navigationPropertyName, navigationPropertyField, oFieldInfo;

                // 设置隐藏显示
                for (var k = 0; k < smartFilterItems.length; k++) {
                    oFieldInfo = smartFilterItems[k].getControl().oFieldInfo;
                    entitySet = oFieldInfo.EntitySet;
                    entityField = oFieldInfo.entityField;
                    _oControl = smartFilterItems[k].getControl();

                    if (!_oControl) {
                        break;
                    }

                    if (smartFilterItems[k].getGroupName() === "basicInfo" && key === oFieldInfo.entityField) {
                        smartFilterItems[k].setVisibleInFilterBar(true);
                        flag = false;
                        break;
                    } else {
                        navigationPropertyName = key.split("/")[0];
                        navigationPropertyField = key.split("/")[1];
                        if (navigationPropertyName === smartFilterItems[k].getGroupName() && entityField === navigationPropertyField) {
                            smartFilterItems[k].setVisibleInFilterBar(true);
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag) {
                    continue;
                }
                // 外键 key, 取描述使用
                if (_oControl && _oControl.oFieldInfo && _oControl.oFieldInfo.isHaveValueListCollection) {
                    foreignKey = _oControl.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][0]["ValueListProperty"];
                    description = _oControl.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][1]["ValueListProperty"];
                }

                // 设置值
                for (var j = 0; j < option.Ranges.length; j++) {  // 取数
                    var range = option.Ranges[j];
                    var operator = range.Option.$EnumMember.split("/")[1];
                    var value = range.Low;
                    var value2 = range.High;

                    if (_oControl.isA("sap.m.MultiInput")) {
                        let oToken;
                        if (operator === "Contains") {
                            oToken = this.oTokenParser.getTokenByText(key, value);
                        } else if (operator === "EQ") {
                            if (_oControl.oFieldInfo.isHaveValueListCollection) {
                                str = str + foreignKey + " eq '" + value + "' or ";
                            } else {
                                oToken = this.oTokenParser.getTokenByText(key, "=" + value);
                            }
                        } else if (operator === "BT") {
                            oToken = this.oTokenParser.getTokenByText(key, value + "..." + value2);
                        } else if (operator === "StartsWith") {
                            oToken = this.oTokenParser.getTokenByText(key, value + "*");
                        } else if (operator === "EndsWith") {
                            oToken = this.oTokenParser.getTokenByText(key, "*" + value);
                        } else if (operator === "LT") {
                            oToken = this.oTokenParser.getTokenByText(key, "<" + value);
                        } else if (operator === "LE") {
                            oToken = this.oTokenParser.getTokenByText(key, "<=" + value);
                        } else if (operator === "GT") {
                            oToken = this.oTokenParser.getTokenByText(key, ">" + value);
                        } else if (operator === "GE") {
                            oToken = this.oTokenParser.getTokenByText(key, ">=" + value);
                        } else if (operator === "Empty") {                                             // nullable 没有
                            oToken = this.oTokenParser.getTokenByText(key, "<空>");
                        }
                        if (oToken) {
                            _oControl.addToken(oToken);
                        }
                    } else if (_oControl.isA("sap.m.MultiComboBox")) {
                        if (_oControl.oFieldInfo.$Type.includes(nameSapce)) {
                            akey.push(_oControl.oFieldInfo.$Type + "'" + value + "'");
                        } else {
                            akey.push(value);
                        }

                    } else if (_oControl.isA("o3.sap.ui.comp.config.condition.DateRangeType")) {
                        debugger;
                    }
                }
                if (str) {
                    str = str.substr(0, str.lastIndexOf(" or"));
                    let url = _oControl.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["CollectionPath"];
                    new getDescription(url, str, _oControl, foreignKey, description);
                }
                if (akey && akey.length > 0) {
                    _oControl.setSelectedKeys(akey);
                }
                if (_oControl.fireSelectionFinish) {
                    _oControl.fireSelectionFinish();
                }
            }
        }
    };

    SmartVariantManagement.prototype.clearData = function () {
        var smartFilterItems = this.getSmartFilterItems();

        smartFilterItems.forEach(function (smartFilterItem) {
            let _oControl = smartFilterItem.getControl();
            if (_oControl) {
                if (_oControl.removeAllTokens) {
                    _oControl.removeAllTokens();
                } else if (_oControl.removeAllSelectedItems) {
                    _oControl.removeAllSelectedItems();
                } else {
                    _oControl.setValue();
                }
            }
        });
    };

    SmartVariantManagement.prototype.setVariantCollection = function (oDataAnnotations) {
        var annotations = oDataAnnotations.$Annotations[AnnotationHelper.getNameSpace() + this.entityType];
        var arr = [];
        for (var obj in annotations) {
            if (obj.includes("@com.sap.vocabularies.UI.v1.SelectionVariant")) {
                var key;
                if (obj.split("#").length > 1) {
                    key = obj.split("#")[1];
                } else {
                    key = "*standard*";
                }
                arr.push({
                    key: key,
                    text: annotations[obj].Text
                });
            }
        }
        this.getModel("oVariantModel").setData(arr);
        this.getModel("oVariantModel").refresh();
    };



    SmartVariantManagement.prototype.save = function (oVariantInfo) {
        debugger;
    };

    SmartVariantManagement.prototype.select = function (oVariantInfo) {
        this.getModel("initialSelectionModel").setProperty("/defaultKey", oVariantInfo.getParameter("key"));
        this.clearData();
        this.setVisibleSmartFilterItems();
        this.setFilterItemsByAnnotation();
    };

    SmartVariantManagement.prototype.manage = function (oVariantInfo) {
        debugger;
    };

    return SmartVariantManagement;
});