/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    "sap/m/library",
    "sap/ui/core/library",
    "sap/ui/core/Control",
    'sap/ui/core/mvc/View',
    'sap/ui/model/json/JSONModel',
    'o3/library/model/AnnotationHelper',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    'sap/m/ColumnListItem',
    'sap/ui/core/Item',
    'sap/m/Text',
    'sap/m/Input',
    'sap/m/ComboBox',
    'sap/m/MultiComboBox',
    'sap/m/HBox',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/MessageToast'
], function (library, coreLib, Control, View, JSONModel, AnnotationHelper,
    Filter, FilterOperator, Sorter, ColumnListItem, Item, Text, Input, ComboBox, MultiComboBox, HBox, Dialog, Button, MessageToast) {
    "use strict";

    var ViewType = coreLib.mvc.ViewType;

    return Control.extend("o3.library.control.smart.smarttable.SmartTable", {
        oJSONModel: null, // 保存当前状态
        initailizedataModel: null, //保存初始化配置，保存最初始状态
        afokModel: null, //保存ok之后的状态，用于下次过滤条件变了，点击取消使用
        stateModel: null,

        metadata: {
            interfaces: ["sap.ui.core.IFormContent"],
            properties: {
                entitySet: {
                    type: "string",
                    group: "Misc",
                    defaultValue: ""
                },
                showRowCount: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                }
            },
            aggregations: {
                field: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
            },
            associations: {
                ariaLabelledBy: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "ariaLabelledBy"
                }
            },
            events: {}
        },

        renderer: {
            render: function (oRm, oValueHelp) {
                oRm.write("<div");
                oRm.writeControlData(oValueHelp);
                oRm.writeClasses();
                oRm.write(">");
                oRm.renderControl(oValueHelp.getAggregation("field"));
                oRm.write("</div>");
            }
        },

        init: async function () {
            jQuery.sap.require("o3.library.control.smart.smarttable.FactoryDefinition");
            this.attachModelContextChange(this.onModelContextChange);
        },

        // 预加载table
        onModelContextChange: async function (oEvent) {
            var that = this;
            var oModel = this.getModel();
            var oMetaModel = oModel.getMetaModel();
            this.oJSONModel = new JSONModel(await this._initTableColumnByAnnotations(oModel));
            this.initailizedataModel = new JSONModel(await this._initTableColumnByAnnotations(oModel));
            this.afokModel = new JSONModel(await this._initTableColumnByAnnotations(oModel));
            this.stateModel = new JSONModel({
                edit: false,
                visible: false
            });

            View.create({
                async: true,
                bindingContexts: {
                    undefined: oModel.createBindingContext('/' + this.getEntitySet())
                },
                models: {
                    undefined: oModel,
                    metaModel: oMetaModel,
                },
                preprocessors: {
                    xml: {
                        bindingContexts: {
                            data: oModel.createBindingContext('/' + this.getEntitySet())
                        },
                        models: {
                            data: oModel,
                            meta: oMetaModel
                        }
                    }
                },
                type: ViewType.XML,
                viewName: 'o3.library.control.smart.smarttable.TableTemplate'
            }).then(async oView => {
                oView.setModel(that.oJSONModel, 'columns');
                oView.setModel(that.initailizedataModel, 'oDataInitial');
                oView.setModel(that.afokModel, 'oDataOk');
                oView.setModel(that.stateModel, 'stateModel');
                that.setAggregation("field", oView);
            });
        },

        //初始化选列数据
        _initTableColumnByAnnotations: async function (oModel) {
            await AnnotationHelper.init(oModel)
            let entityType = AnnotationHelper.getEntityTypeByEntitySet(this.getEntitySet());
            const oData = oModel.getMetaModel().getData();
            const nameSpace = AnnotationHelper.getNameSpace(oModel)
            const LineItem = oData['$Annotations'][`${nameSpace}${entityType}`]['@com.sap.vocabularies.UI.v1.LineItem'];

            const Columns = {
                columnItems: [],
                allColumnsItems: [],
                sortItems: [],// 默认排序字段
                allSortItem: [],// 所有可用于排序的列
                filterItems: [],// 默认过滤字段
                allFilterItem: [],// 所有可用于过滤的字段
                groupItems: [], //默认的分组字段
                allGroupItems: [], //默认的可用于分组的字段
                ShowResetEnabled: false
            };

            // 选列
            LineItem.map((item, index) => {
                Columns.columnItems.push({
                    columnKey: item.Value.$Path,
                    text: item.Label,
                    show: true,
                    index: index,
                    visible: true
                })
                Columns.allColumnsItems.push({
                    columnKey: item.Value.$Path,
                    index: index,
                    visible: true,
                    text: item.Label,
                    show: true
                })
            });

            // 排序 & 分组
            var SortRestrictions = "@Org.OData.Capabilities.V1.SortRestrictions";
            for (var key in oData[nameSpace + entityType]) {
                for (var item in oData.$Annotations) {
                    // 所有可排序的字段
                    if (oData.$Annotations[item] && oData.$Annotations[item][SortRestrictions] && oData.$Annotations[item][SortRestrictions].Sortable) {
                        if ((nameSpace + entityType + "/" + key) === item) {
                            Columns.allSortItem.push({
                                columnKey: key,
                                text: oData["$Annotations"][item]["@com.sap.vocabularies.Common.v1.Label"]
                            });
                            Columns.allGroupItems.push({
                                columnKey: key,
                                text: oData["$Annotations"][item]["@com.sap.vocabularies.Common.v1.Label"]
                            });
                        }
                    }
                }
            }

            // 过滤器
            var FilterRestrictions = "@Org.OData.Capabilities.V1.FilterRestrictions";
            for (var key in oData[nameSpace + entityType]) {
                for (var item in oData.$Annotations) {
                    // 所有可过滤的字段
                    if (oData.$Annotations[item] && oData.$Annotations[item][FilterRestrictions] && oData.$Annotations[item][FilterRestrictions].Filterable) {
                        if ((nameSpace + entityType + "/" + key) === item) {
                            var type;
                            if (oData[nameSpace + entityType][key].$Type === "Edm.DateTime")
                                type = "datetime";
                            else if (oData[nameSpace + entityType][key].$Type === "Edm.DateTimeOffset")
                                type = "datetime"
                            else if (oData[nameSpace + entityType][key].$Type === "Edm.Boolean")
                                type = "boolean"
                            else
                                type = "string";
                            Columns.allFilterItem.push({
                                columnKey: key,
                                text: oData["$Annotations"][item]["@com.sap.vocabularies.Common.v1.Label"],
                                type: type
                            });

                        }
                    }
                }
            }

            return Columns;
        },

        // setShowRowCount = function(bShow) {
        //     this.setProperty("showRowCount", bShow, true);
        //     this._refreshHeaderText();
        // },

        //选列的MODAL
        onPersonalizationDialogPress: function (oEvent) {
            var oPersonalizationDialog = sap.ui.xmlfragment("o3.library.control.smart.smarttable.PersonalizationDialog", this);
            this.oView.addDependent(oPersonalizationDialog);
            this.oView.getModel('columns').setProperty("/ShowResetEnabled", this._isChanged());
            oPersonalizationDialog.open();
        },

        onOK: function (oEvent) {
            var table = oEvent.getSource().getParent().getAggregation("content")[0].getAggregation("items")[0];
            var oBinding = table.getBinding("items");

            // sort & group-----------------
            var aSorter = [],
                groupId,
                groupItems = this.oView.getModel("columns").getProperty("/groupItems"),
                isExistInSorterItem = false; // 用于判断分组字段是否在过滤字段中，不在则需根据分组字段，新建一个排序
            if (groupItems.length > 0) {
                groupId = groupItems[0].columnKey;
            }
            this.oView.getModel("columns").getProperty("/sortItems").forEach(function (item, index) {
                if (item.columnKey === groupId) {
                    isExistInSorterItem = true;
                    var sorterItem = new sap.ui.model.Sorter(item.columnKey, item.operation === 'Descending', true);
                }
                else {
                    var sorterItem = new sap.ui.model.Sorter(item.columnKey, item.operation === 'Descending');
                }
                aSorter.push(sorterItem);
            });
            if (!isExistInSorterItem && groupItems.length > 0) {
                aSorter.unshift(new sap.ui.model.Sorter(groupId, false, true));
            }
            oBinding.sort(aSorter, "application");

            // filter-----------------
            var aFilter = [];
            this.oView.getModel("columns").getProperty("/filterItems").forEach(function (item, index) {
                var value1 = item.value1,
                    value2 = item.value2;
                if (value1 instanceof Date) {
                    value1 = dayjs(value1).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                }
                if (value2 instanceof Date) {
                    value2 = dayjs(value2).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                }
                var filterItem = new sap.ui.model.Filter({ path: item.columnKey, operator: item.operation, value1: value1, value2: value2 });
                aFilter.push(filterItem);
            });
            oBinding.filter(aFilter, "application");

            // column-----------------
            let columnItems = $.extend(true, [], this.oView.getModel("columns").getData().columnItems);
            let allColumnsItems = $.extend(true, [], this.oView.getModel("columns").getData().allColumnsItems);

            for (let a of columnItems) {
                for (let b of allColumnsItems) {
                    if (a.columnKey === b.columnKey) {
                        a.show = b.visible;
                    }
                }
            }
            this.oView.getModel('columns').setProperty("/columnItems", columnItems);
            this.oView.getModel('oDataOk').setProperty("/", this.oView.getModel('columns').getData());
            oEvent.getSource().close();
        },

        onCancel: function (oEvent) {
            this.oView.getModel('columns').setProperty("/", jQuery.extend(true, [], this.oView.getModel('oDataOk').getData()));
            oEvent.getSource().close();
            oEvent.getSource().destroy();
        },

        onReset: function () {
            this.oView.getModel('columns').setProperty("/", jQuery.extend(true, [], this.oView.getModel('oDataInitial').getData()));
        },

        // change reset button state
        onChangeColumnsItems: function (oEvent) {
            var aMColumnsItems = oEvent.getParameter("items").map(function (oMChangedColumnsItem) {
                return oMChangedColumnsItem;
            });
            this.oView.getModel("columns").setProperty("/allColumnsItems", aMColumnsItems);
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        onAddSortItem: function (oEvent) {
            var oParameters = oEvent.getParameters();
            var aSortItems = this.oView.getModel("columns").getProperty("/sortItems");
            oParameters.index > -1 ? aSortItems.splice(oParameters.index, 0, {
                columnKey: oParameters.sortItemData.getColumnKey(),
                operation: oParameters.sortItemData.getOperation()
            }) : aSortItems.push({
                columnKey: oParameters.sortItemData.getColumnKey(),
                operation: oParameters.sortItemData.getOperation()
            });
            this.oView.getModel("columns").setProperty("/sortItems", aSortItems);
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        onRemoveSortItem: function (oEvent) {
            var oParameters = oEvent.getParameters();
            if (oParameters.index > -1) {
                var aSortItems = this.oView.getModel("columns").getProperty("/sortItems");
                aSortItems.splice(oParameters.index, 1);
                this.oView.getModel("columns").setProperty("/sortItems", aSortItems);
            }
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        onAddFilterItem: function (oEvent) {
            var oParameters = oEvent.getParameters();
            var aFilterItems = this.oView.getModel("columns").getProperty("/filterItems");
            oParameters.index > -1 ? aFilterItems.splice(oParameters.index, 0, {
                columnKey: oParameters.filterItemData.getColumnKey(),
                operation: oParameters.filterItemData.getOperation(),
                value1: oParameters.filterItemData.getValue1(),
                value2: oParameters.filterItemData.getValue2()
            }) : aFilterItems.push({
                columnKey: oParameters.filterItemData.getColumnKey(),
                operation: oParameters.filterItemData.getOperation(),
                value1: oParameters.filterItemData.getValue1(),
                value2: oParameters.filterItemData.getValue2()
            });
            this.oView.getModel("columns").setProperty("/filterItems", aFilterItems);
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        onRemoveFilterItem: function (oEvent) {
            var oParameters = oEvent.getParameters();
            if (oParameters.index > -1) {
                var aFilterItems = this.oView.getModel("columns").getProperty("/filterItems");
                aFilterItems.splice(oParameters.index, 1);
                this.oView.getModel("columns").setProperty("/filterItems", aFilterItems);
            }
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        onAddGroupItem: function (oEvent) {
            var oParameters = oEvent.getParameters();
            var aGroupItems = this.oView.getModel("columns").getProperty("/groupItems");
            oParameters.index > -1 ? aGroupItems.splice(oParameters.index, 0, {
                colukeymnKey: oParameters.key,
                columnKey: oParameters.groupItemData.getColumnKey(),
                operation: oParameters.groupItemData.getOperation(),
                showIfGrouped: oParameters.groupItemData.getShowIfGrouped()
            }) : aGroupItems.push({
                colukeymnKey: oParameters.key,
                columnKey: oParameters.groupItemData.getColumnKey(),
                operation: oParameters.groupItemData.getOperation(),
                showIfGrouped: oParameters.groupItemData.getShowIfGrouped()
            });
            this.oView.getModel("columns").setProperty("/groupItems", aGroupItems);
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        onRemoveGroupItem: function (oEvent) {
            var oParameters = oEvent.getParameters();
            if (oParameters.index > -1) {
                var aGroupItems = this.oView.getModel("columns").getProperty("/groupItems");
                aGroupItems.splice(oParameters.index, 1);
                this.oView.getModel("columns").setProperty("/groupItems", aGroupItems);
            }
            this.oView.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
        },

        _isChangedSortItems: function () {
            var fnGetUnion = function (aDataBase, aData) {
                if (!aData) {
                    return jQuery.extend(true, [], aDataBase);
                }
                return jQuery.extend(true, [], aData);
            };
            var fnIsEqual = function (aDataBase, aData) {
                if (!aData) {
                    return true;
                }
                return JSON.stringify(aDataBase) === JSON.stringify(aData);
            };

            console.log('111',this.oView.getModel("oDataInitial").getProperty("/sortItems"))
            console.log('222',this.oView.getModel("columns").getProperty("/sortItems"))

            var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.oView.getModel("oDataInitial").getProperty("/sortItems")), this.oView.getModel("columns").getProperty("/sortItems"));
            var aDataInitialTotal = jQuery.extend(true, [], this.oView.getModel("oDataInitial").getProperty("/sortItems"));
            return !fnIsEqual(aDataTotal, aDataInitialTotal);
        },

        _isChangedFilterItems: function () {
            var fnGetUnion = function (aDataBase, aData) {
                if (!aData) {
                    return jQuery.extend(true, [], aDataBase);
                }
                return jQuery.extend(true, [], aData);
            };
            var fnIsEqual = function (aDataBase, aData) {
                if (!aData) {
                    return true;
                }
                return JSON.stringify(aDataBase) === JSON.stringify(aData);
            };

            var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.oView.getModel("oDataInitial").getProperty("/filterItems")), this.oView.getModel("columns").getProperty("/filterItems"));
            var aDataInitialTotal = jQuery.extend(true, [], this.oView.getModel("oDataInitial").getProperty("/filterItems"));
            return !fnIsEqual(aDataTotal, aDataInitialTotal);
        },

        _isChangedColumnsItems: function () {
            var fnGetArrayElementByKey = function (sKey, sValue, aArray) {
                var aElements = aArray.filter(function (oElement) {
                    return oElement[sKey] !== undefined && oElement[sKey] === sValue;
                });
                return aElements.length ? aElements[0] : null;
            };
            var fnGetUnion = function (aDataBase, aData) {
                if (!aData) {
                    return jQuery.extend(true, [], aDataBase);
                }
                var aUnion = jQuery.extend(true, [], aData);
                aDataBase.forEach(function (oMItemBase) {
                    var oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
                    if (!oMItemUnion) {
                        aUnion.push(oMItemBase);
                        return;
                    }
                    if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
                        oMItemUnion.visible = oMItemBase.visible;
                    }
                    if (oMItemUnion.width === undefined && oMItemBase.width !== undefined) {
                        oMItemUnion.width = oMItemBase.width;
                    }
                    if (oMItemUnion.total === undefined && oMItemBase.total !== undefined) {
                        oMItemUnion.total = oMItemBase.total;
                    }
                    if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
                        oMItemUnion.index = oMItemBase.index;
                    }
                });
                return aUnion;
            };
            var fnIsEqual = function (aDataBase, aData) {
                if (!aData) {
                    return true;
                }
                if (aDataBase.length !== aData.length) {
                    return false;
                }
                var fnSort = function (a, b) {
                    if (a.columnKey < b.columnKey) {
                        return -1;
                    } else if (a.columnKey > b.columnKey) {
                        return 1;
                    } else {
                        return 0;
                    }
                };
                aDataBase.sort(fnSort);
                aData.sort(fnSort);
                var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
                    return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !== aData[iIndex].index || oDataBase.width !== aData[iIndex].width || oDataBase.total !== aData[iIndex].total;
                });
                return aItemsNotEqual.length === 0;
            };

            var aDataRuntime = fnGetUnion(this.oView.getModel("oDataInitial").getProperty("/allColumnsItems"), this.oView.getModel("columns").getProperty("/allColumnsItems"));

            return !fnIsEqual(aDataRuntime, this.oView.getModel("oDataInitial").getProperty("/allColumnsItems"));
        },

        _isChangedGroupItems: function () {
            var fnGetUnion = function (aDataBase, aData) {
                if (!aData) {
                    return jQuery.extend(true, [], aDataBase);
                }
                return jQuery.extend(true, [], aData);
            };
            var fnIsEqual = function (aDataBase, aData) {
                if (!aData) {
                    return true;
                }
                return JSON.stringify(aDataBase) === JSON.stringify(aData);
            };

            var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.oView.getModel("oDataInitial").getProperty("/groupItems")), this.oView.getModel("columns").getProperty("/groupItems"));
            var aDataInitialTotal = jQuery.extend(true, [], this.oView.getModel("oDataInitial").getProperty("/groupItems"));
            return !fnIsEqual(aDataTotal, aDataInitialTotal);
        },

        _isChanged: function () {
            var resetEditable = this._isChangedSortItems() || this._isChangedFilterItems() || this._isChangedColumnsItems() || this._isChangedGroupItems();
            return resetEditable;
        },


        //table edit
        onEditBtnPress: function () {
            var edittable = this.oView.getModel("stateModel").getProperty("/edit");
            this.oView.getModel("stateModel").setProperty("/edit", !edittable);

            var visible = this.oView.getModel("stateModel").getProperty("/visible");
            this.oView.getModel("stateModel").setProperty("/visible", !visible);
        },

        onCancelBtnPress: function () {
            var that = this;
            that.oView.getModel("stateModel").setProperty("/visible", false);
            this.oView.getModel().resetChanges("update");
        },

        onSaveBtnPress: function () {
            var that = this;
            var dialog = new Dialog({
                title: 'Warning',
                type: 'Message',
                state: 'Warning',
                content: new Text({
                    text: '是否确定修改?'
                }),
                beginButton: new Button({
                    text: '确定',
                    press: function () {
                        var model = that.oView.getModel();
                        model.submitBatch("update").then(function (oEvent) {
                            var bHasErrors = model.hasPendingChanges("update");
                            if (bHasErrors) {
                                MessageToast.show("更新失败,请重新操作!");
                            } else {
                                MessageToast.show("修改成功!")
                            }
                        }.bind(this)).catch(function (oEvent) {
                            MessageToast.show(oEvent);
                        }.bind(this));

                        dialog.close();
                        that.oView.getModel("stateModel").setProperty("/visible", false);
                    }
                }),
                endButton: new Button({
                    text: '取消',
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },

        Factory: function (id, context) {
            var columnItems = this.oView.getModel("columns").getProperty("/columnItems");
            var arr = []
            for (var i = 0; i < columnItems.length; i++) {
                var key = "{" + columnItems[i].columnKey + "}";
                var hbox = new HBox();
                hbox.addItem(new Text({
                    text: key,
                    visible: "{= !${stateModel>/visible}}"
                }));
                // visible: "{= !${stateModel>/visible} && ${columns>/columnItems/"+i+"/edit}}"
                hbox.addItem(new Input({
                    value: key,
                    visible: "{= ${stateModel>/visible}}",
                    editable: true
                }));
                // visible: "{= ${stateModel>/visible} && ${columns>/columnItems/"+i+"/edit}}",
                arr.push(hbox);
            }

            return new ColumnListItem({
                cells: arr
            });
        }


    });
});