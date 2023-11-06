/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/Device',
    'o3/sap/ui/comp/valuehelpdialog/ValueHelpDialog',
    'sap/ui/model/json/JSONModel',
    'sap/m/SearchField',
    'o3/sap/ui/comp/filterbar/FilterBar',
    'o3/sap/ui/comp/filterbar/FilterGroupItem',
    'sap/ui/model/Filter',
    'o3/library/model/FilterOperator',
    'sap/m/Token',
    'sap/m/MultiInput',
    'sap/m/ColumnListItem',
    'o3/library/control/smart/smartfield/_TokenParser',
    'sap/ui/core/Item',
    'sap/m/MultiComboBox',
    'sap/ui/model/odata/ODataUtils',
    'o3/library/control/smart/smartfield/SmartField'
], function (Device, ValueHelpDialog, JSONModel, SearchField, FilterBar, FilterGroupItem, Filter, FilterOperator,
    Token, MultiInput, ColumnListItem, _TokenParser, Item, MultiComboBox, ODataUtils, SmartField) {
    'use strict';

    var AnnotationHelper;
    var _ValueHelpDialog = ValueHelpDialog.extend('o3.library.control.smart.smartfield._ValueHelpDialog', {
        metadata: {
            properties: {
                annotationHelper: { type: 'o3.library.model.AnnotationHelper' },
                entitySet: { type: 'string' },
                entityType: { type: 'string' },
                entityField: { type: 'string' },
            }
        },
        init: function () {
            ValueHelpDialog.prototype.init.apply(this, arguments);

            this.oTokenParser = new _TokenParser('Contains');
            this.oField;//smartfield控件
            this.oField2;//input控件
            this.oColumnsModel = new JSONModel({ cols: [] });
            this.oFieldData = '';//字段annotation
            this.oFieldInfo = '';//字段类型信息
            this.oSearchSupported = false;//是否支持快速搜索
            this.oCollectionPath = '';//EntitySet
            this.oCollectionPathEntityType = '';//EntityType
            this.oColumnKey = '';//主键
            this.oColumnDescriptionKey = '';//描述

            this.attachOk((oControlEvent) => {
                this._onValueHelpDialogCancel(this);
                this._onValueHelpDialogOk(oControlEvent, this.oField2);
            });
            this.attachCancel(() => {
                this._onValueHelpDialogCancel(this);
            });
            this.attachAfterClose(() => {
                this.destroy();
            });
        },
        renderer: function (oRm, oControl) {
            o3.sap.ui.comp.valuehelpdialog.ValueHelpDialogRenderer.render(oRm, oControl);
        }
    });

    _ValueHelpDialog.prototype.initAnnotation = function (oField, oField2, oAnnotationHelper) {
        var that = this;
        this.setProperty('annotationHelper', oAnnotationHelper);
        AnnotationHelper = oAnnotationHelper;

        this.oField = oField;
        this.oField2 = oField2;
        this.oFieldData = AnnotationHelper.getEntityFieldAnnotation(this.getEntityType(), this.getEntityField());
        this.oFieldInfo = AnnotationHelper.getFieldInfo(this.getEntityType(), this.getEntityField());

        if (this.oFieldData && this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']) {
            this.oSearchSupported = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['SearchSupported'];
            this.oCollectionPath = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
            this.oCollectionPathEntityType = AnnotationHelper.getEntityTypeByEntitySet(this.oCollectionPath);
            var Parameters = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['Parameters'];
            var vhdTitle = this.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']["Label"];
            var cols = [];

            // 优先级，如果VHD中配置了Title，优先级最高
            if (vhdTitle) {
                this.setTitle(vhdTitle);
            }
            if (Parameters) {
                var cols = [];
                Parameters.some((parameter) => {
                    if (AnnotationHelper.isCommonValueListParameterInOut(parameter)) {
                        this.oColumnKey = parameter['ValueListProperty'];
                    } else {
                        if (!this.oColumnDescriptionKey) {
                            this.oColumnDescriptionKey = parameter['ValueListProperty'];
                        }
                    }
                    var label = parameter['@com.sap.vocabularies.Common.v1.Label'];
                    if (!label && this.oCollectionPathEntityType) {//先读valuelist parameters里的,没有的话读全局的
                        label = AnnotationHelper.getFieldLabel(this.oCollectionPathEntityType, parameter['ValueListProperty']);
                    }
                    let isPropertySortGoup = AnnotationHelper.isPropertySortGoup(this.oCollectionPathEntityType, parameter['ValueListProperty']);
                    cols.push({
                        'label': label,
                        'tooltip': '',
                        'width': '',
                        'template': parameter['ValueListProperty'],
                        'sortProperty': parameter['ValueListProperty']
                    });
                    // isPropertySortGoup ? parameter['ValueListProperty'] : ''

                });
                if (!this.oColumnDescriptionKey) {
                    this.oColumnDescriptionKey = this.oColumnKey;
                }
            }
            this.oColumnsModel.setProperty('/cols', cols);

            //filterbar
            this.oFilterBar = new FilterBar({
                advancedMode: true,
                search: (oEvent) => {
                    this._rebindTable(oEvent);
                },
            });

            let parameterLabels = [];
            Parameters.some((parameter) => {
                // let label = parameter['Label'];
                let label = parameter["@com.sap.vocabularies.Common.v1.Label"]; //先读valuelist parameters里的,没有的话读全局的
                if (!label && this.oCollectionPathEntityType) {
                    label = AnnotationHelper.getFieldLabel(this.oCollectionPathEntityType, parameter['ValueListProperty']);
                }
                parameterLabels[parameter['ValueListProperty']] = label;
                var sInputId = jQuery.sap.uid() + '-input';
                var smartControl;

                if (AnnotationHelper.isEnumeration(this.oCollectionPathEntityType, parameter['ValueListProperty'])) {
                    var arr = AnnotationHelper.isEnumeration(this.oCollectionPathEntityType, parameter['ValueListProperty']),
                        oFieldInfo = AnnotationHelper.getFieldInfo(this.oCollectionPathEntityType, parameter['ValueListProperty']),
                        items = [],
                        sInputId = jQuery.sap.uid() + '-MultiComboBox-' + parameter['ValueListProperty'];
                    items.push(new Item({
                        key: '',
                        text: '_NA_'
                    }));
                    arr.forEach(function (item) {
                        items.push(new Item({
                            key: oFieldInfo["$Type"] + "'" + item.key + "'",
                            text: item.value
                        }));
                    });
                    smartControl = new MultiComboBox({
                        id: sInputId,
                        items: items
                    });
                } else {
                    smartControl = new MultiInput({
                        id: sInputId,
                        name: parameter['ValueListProperty'],
                        change: (oEvent) => {
                            var iptControl = oEvent.getSource();
                            var val = iptControl.getValue();
                            iptControl.setValue('');
                            var oToken = this.oTokenParser.getTokenByText(iptControl.getName(), val);
                            if (oToken) {
                                iptControl.addToken(oToken);
                                iptControl.fireTokenUpdate();
                            }
                        },
                        showValueHelp: true,
                        valueHelpRequest: (oEvent) => {
                            var iptControl = oEvent.getSource();
                            var oFieldValueHelpDialog = new ValueHelpDialog({
                                stretch: Device.system.phone,
                                basicSearchText: '',
                                supportRangesOnly: true,
                                key: iptControl.getName(),
                                descriptionKey: iptControl.getName(),
                                title: parameterLabels[iptControl.getName()],
                                supportRanges: true,
                                ok: (oControlEvent) => {
                                    this._onValueHelpDialogCancel(oFieldValueHelpDialog);
                                    this._onValueHelpDialogOk(oControlEvent, sap.ui.getCore().byId(iptControl.getId()));
                                },
                                cancel: () => {
                                    this._onValueHelpDialogCancel(oFieldValueHelpDialog);
                                },
                                afterClose: function () {
                                    oFieldValueHelpDialog.destroy();
                                }
                            });
                            oFieldValueHelpDialog.setTokens(iptControl.getTokens());
                            //range
                            oFieldValueHelpDialog.setRangeKeyFields([{
                                label: parameterLabels[iptControl.getName()],
                                key: iptControl.getName(),
                                type: "string",
                                // typeInstance: new typeString({}, {
                                //     maxLength: 7
                                // })
                            }]);

                            oFieldValueHelpDialog.open();
                        }
                    });
                }
                var oFilterGroupItem = new FilterGroupItem({
                    groupTitle: 'More Fields',
                    groupName: FilterBar.INTERNAL_GROUP,
                    name: parameter['ValueListProperty'],
                    label: label,
                    control: smartControl,
                    visibleInFilterBar: true
                });
                this.oFilterBar.addFilterGroupItem(oFilterGroupItem);

                smartControl.attachBrowserEvent("keydown", function (e) {
                    if (e.which === 13) {
                        smartControl.__bSuggestInProgress = smartControl.getValue() ? true : false;
                    }
                });
                smartControl.attachBrowserEvent("keyup", function (e) {
                    if (e.which === 13 && !smartControl.__bSuggestInProgress && smartControl.isA("sap.m.InputBase")) {
                        this.oFilterBar.fireSearch();
                    }
                }.bind(this));

            });
            //basicSearch
            if (this.oSearchSupported) {
                this.oBasicSearchField = new SearchField({
                    showSearchButton: false
                });
                this.oFilterBar.setBasicSearch(this.oBasicSearchField);
            }

            this.setFilterBar(this.oFilterBar);

            this.getTableAsync().then((oTable) => {
                oTable.setModel(this.oColumnsModel, 'columns');

                // 需要重新bindColumns指定type，否则enumeration出不来
                if (oTable.bindColumns) { // ui.table
                    oTable.bindColumns("columns>/cols", function (sId, oContext) {
                        return new sap.ui.table.Column({
                            label: oContext.getObject().label,
                            template: new o3.library.control.smart.smartfield.SmartField({
                                entitySet: that.oCollectionPath,
                                entityField: oContext.getObject().template,
                                value: {
                                    path: oContext.getObject().template,
                                    type: 'sap.ui.model.odata.type.String'
                                },
                                editable: false
                            })
                            // template: new sap.m.Text({
                            //     text: {
                            //         path: oContext.getObject().template,
                            //         type: 'sap.ui.model.odata.type.String'
                            //     }
                            // })
                        });
                    });
                }
                if (oTable.bindItems) {
                    var aCols = oTable.getModel("columns").getData().cols;
                    this.mTableTemplate = new sap.m.ColumnListItem({
                        cells: aCols.map(function (column) {
                            var colname = column.template;
                            return new o3.library.control.smart.smartfield.SmartField({
                                entitySet: that.oCollectionPath,
                                entityField: colname,
                                value: {
                                    path: colname,
                                    type: 'sap.ui.model.odata.type.String'
                                },
                                editable: false
                            });
                            // return new sap.m.Label({
                            //     text: {
                            //         path: colname,
                            //         type: 'sap.ui.model.odata.type.String'
                            //     }
                            // });
                        })
                    });
                    oTable.setGrowingScrollToLoad(true);
                }

                this._rebindTable();
            });
        }

        //loadToken
        if (this.oField2.isA('sap.m.MultiInput')) {
            this.setTokens(this.oField2.getTokens());
        } else {
            var oToken = new Token({
                key: this.oField2.getSelectedKey(),
                text: this.oField2.getValue(),
            });

            this.setTokens([oToken]);
        }

        this.setKey(this.oColumnKey);
        this.setDescriptionKey(this.oColumnDescriptionKey);

        //range
        this.setRangeKeyFields([{
            label: AnnotationHelper.getFieldLabel(this.getEntityType(), this.getEntityField()),
            key: this.getEntityField(),
            type: 'string',
            // typeInstance: new typeString({}, {
            //     maxLength: 7
            // })
        }]);
    }

    _ValueHelpDialog.prototype._rebindTable = function (oEvent) {
        let oTable = this.getTable();
        this.TableStateDataSearching();

        // sort
        if (oTable.bindRows) {
            let _sortCols = oTable.getModel("columns").getData().cols;
            oTable.getColumns().forEach((item, index) => {
                item.setSortProperty(_sortCols[index].sortProperty);
            });
        }

        let mFilter, enumFi = [];
        let sSearchQuery = this.oBasicSearchField ? this.oBasicSearchField.getValue() : '';
        let aSelectionSet = [];
        if (oEvent && oEvent.getSource() && oEvent.getSource().getFilterGroupItems()) {
            oEvent.getSource().getFilterGroupItems().forEach(function (item) {
                aSelectionSet.push(item.getControl());
            });
        } else {
            aSelectionSet = oEvent ? oEvent.getParameter('selectionSet') : [];
        }
        let aFilters = aSelectionSet.reduce(function (aResult, oControl) {
            if (oControl.isA('sap.m.MultiInput')) {
                if (oControl.getTokens().length) {
                    var aFilterArrReference;
                    var aArrayFilters = [];
                    var aExcludeFilters = [];
                    var oExcludeFilters = null;
                    oControl.getTokens().some((oToken) => {
                        var oTokenData = oToken.data('range');
                        aFilterArrReference = (oTokenData.exclude ? aExcludeFilters : aArrayFilters);
                        var operation = oTokenData.operation;
                        if (oTokenData.exclude) {
                            if (operation == FilterOperator.EQ) {
                                operation = FilterOperator.NE;
                            } else if (operation == FilterOperator.Empty) {
                                operation = FilterOperator.NE;
                                oTokenData.value1 = null;
                            }
                        } else {
                            if (operation == FilterOperator.Empty) {
                                operation = FilterOperator.EQ;
                                oTokenData.value1 = null;
                            }
                        }
                        aFilterArrReference.push(new Filter({
                            path: oTokenData.keyField,
                            operator: operation,
                            value1: oTokenData.value1,
                            value2: oTokenData.value2,
                        }));
                        if (oTokenData.value1 === null) {
                            aFilterArrReference.push(new Filter({
                                path: oTokenData.keyField,
                                operator: operation,
                                value1: '',
                                value2: oTokenData.value2,
                            }));
                        }

                    });
                    if (aExcludeFilters.length) {
                        oExcludeFilters = new Filter(aExcludeFilters, true);
                    }
                    if (aArrayFilters.length) {
                        if (oExcludeFilters) {
                            aResult.push(new Filter([
                                new Filter(aArrayFilters, false), oExcludeFilters
                            ], true));
                        } else {
                            aResult.push(new Filter(aArrayFilters, false));
                        }
                    } else if (oExcludeFilters) {
                        aResult.push(oExcludeFilters);
                    }
                }
            } else if (oControl.isA('sap.m.MultiComboBox')) {
                var enumFilters = [];
                var _sPath = oControl.getId().split("-")[oControl.getId().split("-").length - 1];
                oControl.getSelectedKeys().some((key) => {
                    if (key === "") {
                        key = null;
                    }
                    enumFilters.push(new Filter({
                        path: _sPath,
                        operator: FilterOperator.EQ,
                        value1: key,
                    }));
                });
                if (enumFilters.length > 0) {
                    enumFi.push(new Filter(enumFilters, false));
                }
            } else {
                aResult.push(new Filter({
                    path: oControl.getName(),
                    operator: FilterOperator.EQ,
                    value1: oControl.getValue()
                }));
            }

            return aResult;
        }, []);
        if (aFilters.length) {
            mFilter = new Filter({
                filters: aFilters,
                and: true
            })
        }
        var mParameters = {};
        if (sSearchQuery) {
            mParameters['$search'] = sSearchQuery;
        }
        mParameters['$count'] = true;

        if (oTable.bindRows) {
            let mBindingParams = {
                path: '/' + this.oCollectionPath,
                filters: mFilter,
                parameters: mParameters,
                events: {
                    dataReceived: (oEvt) => {
                        this.TableStateDataFilled();
                        var oBinding = oEvt.getSource(), iBindingLength;
                        if (oBinding) {
                            iBindingLength = oBinding.getLength();
                            // Infinite number of requests are triggered if an error occurs, so don't update if no data is present
                            // The below code is mainly required for token handling on the ValueHelpDialog.
                            //解决第二次弹出valueHelpDialog的时候没有选中table的问题
                            var oRowaKeys = oTable.getBinding('rows').aKeys = [];
                            var oContexts = oEvt.getSource().aContexts;
                            for (var i = 0; i < oContexts.length; i++) {
                                oRowaKeys.push(oContexts[i].sPath.split('/')[1]);
                            }
                            if (iBindingLength) {
                                this.update();
                            } else {
                                this._updateTitles();
                            }
                        }
                    }
                }
            };
            oTable.bindRows(mBindingParams);
        }
        if (oTable.bindItems) {
            let mBindingParams = {
                path: '/' + this.oCollectionPath,
                filters: mFilter,
                parameters: mParameters,
                template: this.mTableTemplate,
                events: {
                    dataReceived: (oEvt) => {
                        this.TableStateDataFilled();
                        var oBinding = oEvt.getSource(), iBindingLength;
                        if (oBinding) {
                            iBindingLength = oBinding.getLength();
                            if (iBindingLength) {
                                this.update();
                            } else {
                                this._updateTitles();
                            }
                        }
                    }
                }
            };
            oTable.bindItems(mBindingParams);
        }

        if (oTable.getBinding && oTable.getBinding("rows")) {
            let oBinding = oTable.getBinding("rows");
            if (enumFi.length) {
                let filterStr = ODataUtils.createFilterParams(enumFi);
                let mParameters = oBinding.mParameters;
                mParameters["$filter"] = decodeURIComponent(filterStr.replace('$filter=', ''));
                oBinding.applyParameters(mParameters);
                oBinding.refresh();
            } else {
                let mParameters = oBinding.mParameters;
                if(oBinding.mParameters.$filter){
                    delete oBinding.mParameters.$filter;
                    oBinding.applyParameters(mParameters);
                    oBinding.refresh();
                }
            }
        }
    }

    _ValueHelpDialog.prototype._onValueHelpDialogOk = function (oControlEvent, oControl) {
        var aTokens = oControlEvent.getParameter('tokens'), oRangeData, sKey, i = 0, aRowData = [], oRowData = null,
            oFormat;

        oControl.data('ValueHelpDialogColumnKey', this.oColumnKey);
        if (oControl.isA('sap.m.MultiInput')) {
            oControl.setValue('');
            oControl.destroyTokens();
            oControl.setTokens(aTokens);
            oControl.fireTokenUpdate();

            i = aTokens.length;
            while (i--) {
                oRowData = aTokens[i].data('row');
                if (oRowData) {
                    aRowData.push(oRowData);
                }
            }
        } else {
            if (aTokens[0]) {
                sKey = aTokens[0].getKey();
                oControl.setValue(aTokens[0].getText());
            }

            oControl.fireChange({
                value: sKey,
                validated: true
            });
        }
    }

    _ValueHelpDialog.prototype._onValueHelpDialogCancel = function (oValueHelpDialog) {
        oValueHelpDialog.close();
        oValueHelpDialog.setModel(null);
    }

    return _ValueHelpDialog;
});