/*!
 * ${copyright}
 * @version ${version}
 * @author xwk
 */
sap.ui.define([
    'o3/library/model/AnnotationHelper',
    'o3/sap/ui/comp/filterbar/FilterBar',
    'sap/ui/model/Filter',
    'o3/library/model/FilterOperator',
    'o3/sap/ui/comp/filterbar/FilterGroupItem',
    'o3/library/control/smart/smartfield/_MultiInput',
    'o3/library/control/smart/smartfield/_DateRange',
    'o3/library/control/smart/smartfield/_MultiComboBox',
    'sap/ui/core/Item',
    'o3/library/model/formatter',
    'o3/library/control/smart/smartfilterbar/ControlConfiguration'
], function (AnnotationHelper, FilterBar, Filter, FilterOperator, FilterGroupItem, _MultiInput, _DateRange, _MultiComboBox, Item, formatter, ControlConfiguration) {
    'use strict';

    var SmartFilterBar = FilterBar.extend('o3.library.control.smart.smartfilterbar.SmartFilterBar', {
        metadata: {
            interfaces: ['sap.ui.core.IFormContent'],
            properties: {
                entitySet: { type: 'string', defaultValue: '' },
                smartVariant: { type: "string", group: "Misc", defaultValue: null },
                configurations: { type: 'string', defaultValue: '' }
            },
            defaultAggregation: 'controlConfiguration',
            aggregations: {
                field: { type: 'sap.ui.core.Control', multiple: false, },
                controlConfiguration: {
                    type: 'o3.library.control.smart.smartfilterbar.ControlConfiguration',
                    multiple: true,
                    singularName: 'controlConfiguration'
                },
            },
            events: {}
        },

        renderer: function (oRm, oControl) {
            FilterBar.getMetadata().getRenderer().render(oRm, oControl);
            // oControl.addConfigurations();
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

    SmartFilterBar.prototype.init = function () {
        FilterBar.prototype.init.apply(this);

        this.oMetadataInitialised = false;
        this.attachModelContextChange(this.onModelContextChange);
        this.oEntityType = '';
        this.oConditionFields = [];

        this.registerGetFiltersWithValues(this.onGetFiltersWithValues);
        this.attachSearch(this.onSearch);
        this.setUseToolbar(false);  // 是否显示“隐藏过滤器”按钮，false则其它按钮放在filterbar最后，true，放在上面
    };

    SmartFilterBar.prototype.setConfigurations = function (configurations) {
        this.setProperty("configurations", configurations, true);

        var arrConfigurations = configurations.split(",");
        var that = this;
        this.removeAllControlConfiguration();
        arrConfigurations.forEach(function(item){
            that.addControlConfiguration(new ControlConfiguration({
                entityField: item
            }));
        })
    };

    SmartFilterBar.prototype.addConfigurations = function () {
        var configurations = this.getConfigurations().split(",");
        var that = this;
        
        this.removeAllControlConfiguration();
        configurations.forEach(function(item){
            that.addControlConfiguration(new ControlConfiguration({
                entityField: item
            }));
        })
    };

    SmartFilterBar.prototype.onModelContextChange = function () {
        var oModel = this.getModel();
        AnnotationHelper.init(oModel).then(() => {
            if (this.oMetadataInitialised) {
                return;
            }
            this.oMetadataInitialised = true;


            var group = [],
                oControl,
                entityObject;

            this.oEntityType = AnnotationHelper.getEntityTypeByEntitySet(this.getEntitySet());
            entityObject = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + this.oEntityType);

            if (entityObject) {
                for (var key in entityObject) {
                    if (entityObject[key]['$kind']
                        && (entityObject[key]['$kind'] === 'Property' || entityObject[key]['$kind'] === 'NavigationProperty' && !entityObject[key]['$isCollection'])
                        && AnnotationHelper.isPropertyFilterable(this.oEntityType, key)) {
                        this.oConditionFields[key] = entityObject[key];
                    }
                    // NavigationProperty 是collection的
                    if (entityObject[key]['$kind'] && entityObject[key]['$kind'] === 'NavigationProperty' && entityObject[key]['$isCollection']
                        && AnnotationHelper.isPropertyFilterable(this.oEntityType, key)) {
                        // 取type获取set
                        var navigationEntityType = entityObject[key]["$Type"].split(".")[entityObject[key]["$Type"].split(".").length - 1];
                        var navigationEntitySet = AnnotationHelper.getNavigationPropertyBindingByEntitySet(this.getEntitySet(), navigationEntityType);
                        let typeAnnotation = AnnotationHelper.getEntityFieldAnnotation(this.oEntityType, key);
                        let oConditionFields = [];

                        if (!navigationEntitySet) {
                            console.log("未配置" + this.getEntitySet() + "的" + navigationEntityType + "对应的NavigationPropertyBinding");
                        }
                        oConditionFields["GroupInfo"] = { navigatationProperty: key, entitySet: navigationEntitySet, entityType: navigationEntityType };
                        if (typeAnnotation["@com.sap.vocabularies.Common.v1.ValueList"] && typeAnnotation["@com.sap.vocabularies.Common.v1.ValueList"].Parameters.length > 0) {
                            let para = typeAnnotation["@com.sap.vocabularies.Common.v1.ValueList"].Parameters;
                            oConditionFields["GroupInfo"].groupName = typeAnnotation["@com.sap.vocabularies.Common.v1.ValueList"].Label;
                            for (var i = 0; i < para.length; i++) {
                                let _label = para[i]["@com.sap.vocabularies.Common.v1.Label"] || "";
                                oConditionFields[para[i].ValueListProperty] = { label: _label };
                            }
                            group.push(oConditionFields);
                        }
                    }
                }
            }

            var oFilterGroupItemsKeys = [];
            this.getControlConfiguration().some((oItem) => {
                oFilterGroupItemsKeys.push(oItem.getEntityField());
            });
            if (this.oConditionFields) {
                for (let key in this.oConditionFields) {
                    let oField = this.oConditionFields[key];
                    let oFilterGroupItem;

                    oField.isCollectionNavigationProperty = 0; // 用于过滤条件的判断
                    oField.EntityType = this.oEntityType;
                    oField.EntitySet = this.getEntitySet();

                    // 创建控件
                    this.oFieldInfo = AnnotationHelper.getAllFieldInfo(this.getEntitySet(), key);
                    oControl = this.createControl(this.getEntitySet(), key, oField);

                    oFilterGroupItem = new FilterGroupItem({
                        groupTitle: '基本信息',
                        groupName: "basicInfo",
                        name: key,
                        label: AnnotationHelper.getFieldLabel(this.oEntityType, key),
                        control: oControl,
                        visibleInFilterBar: true
                    });

                    this._handleEnter(oControl);

                    if (oFilterGroupItem) {
                        this.addFilterGroupItem(oFilterGroupItem);
                        oFilterGroupItem.setVisibleInFilterBar(oFilterGroupItemsKeys.indexOf(key) !== -1 ? true : false);
                    }
                }
            }
            if (group) {
                for (var i = 0; i < group.length; i++) {
                    let entitySet = group[i]["GroupInfo"].entitySet;
                    let entityType = group[i]["GroupInfo"].entityType;
                    let navigatationProperty = group[i]["GroupInfo"].navigatationProperty;
                    let groupName = group[i]["GroupInfo"].groupName;

                    for (var key in group[i]) {
                        let oField = group[i][key];
                        let oFilterGroupItem;

                        oField.isCollectionNavigationProperty = 1; // 用于过滤条件的判断
                        oField.EntityType = entityType;
                        oField.EntitySet = entitySet;
                        oField.navigatationProperty = navigatationProperty;

                        if (key === "GroupInfo") {
                            continue;
                        }

                        // 创建控件
                        this.oFieldInfo = AnnotationHelper.getAllFieldInfo(entitySet, key);
                        oControl = this.createControl(entitySet, key, oField);

                        oFilterGroupItem = new FilterGroupItem({
                            groupTitle: groupName,
                            groupName: navigatationProperty,
                            name: navigatationProperty + key,
                            label: group[i][key].label || AnnotationHelper.getFieldLabel(entityType, key),
                            control: oControl,
                            visibleInFilterBar: true
                        });

                        this._handleEnter(oControl);

                        if (oFilterGroupItem) {
                            this.addFilterGroupItem(oFilterGroupItem);
                            oFilterGroupItem.setVisibleInFilterBar(oFilterGroupItemsKeys.indexOf(group[i].GroupInfo.navigatationProperty) !== -1 ? true : false);
                        }
                    }
                }
            }
            if (this.getSmartVariant()) {
                if (sap.ui.getCore().byId(this.getSmartVariant())) {
                    sap.ui.getCore().byId(this.getSmartVariant()).fireInitvalue();
                } else {
                    if (this._getView() && this._getView().byId(this.getSmartVariant())) {
                        this._getView().byId(this.getSmartVariant()).fireInitvalue();
                    }
                }
            }
        });
    }

    SmartFilterBar.prototype.createControl = function (entitySet, key, oField) {
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
        var oControl;

        if (this.oFieldInfo.isEnumeration) {
            mMethods[this.oFieldInfo["$Type"]] = "_createEnumeration";
        }

        if (this.oFieldInfo["@Common.ValueListWithFixedValues"]) {
            oControl = this._createCombobox(AnnotationHelper, this.oFieldInfo["$Type"]);
        } else if (mMethods[this.oFieldInfo["$Type"]]) {
            if (this[mMethods[this.oFieldInfo["$Type"]]]) {
                oControl = this[mMethods[this.oFieldInfo["$Type"]]](AnnotationHelper, this.oFieldInfo["$Type"]);
            }
        } else {
            oControl = this._createEdmString(AnnotationHelper, this.oFieldInfo["$Type"]);
        }

        oControl.data('AnnotationConfig', oField);
        oControl.oFieldInfo = this.oFieldInfo;
        if (oControl.setEntityType) {
            oControl.setEntitySet(entitySet);
            oControl.setEntityType(this.oFieldInfo.entityType);
            oControl.setEntityField(key);
            oControl.initAnnotation(this, AnnotationHelper);
        }

        if (oControl.attachEvent) {
            oControl.attachEvent('_change', function (oEvent) {
                this.fireFilterChange(oEvent);
            }, this);
        }
        if (oControl.addToken) {
            oControl.attachTokenUpdate((oEvent) => {
                setTimeout(() => {
                    this.fireFilterChange(oEvent);
                });
            })
        }
        if (oControl.addSelectedKeys) {
            oControl.attachSelectionFinish((oEvent) => {
                setTimeout(() => {
                    this.fireFilterChange(oEvent);
                });
            })
        }
        return oControl;
    };

    SmartFilterBar.prototype._handleEnter = function (oControl) {
        oControl.attachBrowserEvent("keydown", function (e) {
            if (e.which === 13) {
                oControl.__bSuggestInProgress = (oControl._oSuggestionPopup && oControl._oSuggestionPopup.isOpen());
            }
        });
        oControl.attachBrowserEvent("keyup", function (e) {
            if (e.which === 13 && !oControl.__bSuggestInProgress && oControl.isA("sap.m.InputBase")) {
                this._search();
            }
        }.bind(this));
    };

    SmartFilterBar.prototype._search = function () {
        var that = this;
        var flag = true;
        var aSelectionSet = this.getAllFilterItems();
        aSelectionSet.some((oControl) => {
            if (oControl.getControl() && oControl.getControl().getValueState() === "Error") {
                flag = false;
                return false;
            }
        });
        if (flag) {
            this.fireSearch({ selectionSet: this._retrieveCurrentSelectionSet(false, true) });
        }
    }

    SmartFilterBar.prototype.onGetFiltersWithValues = function () {
        var i;
        var oControl;
        var aFilters = this.getFilterGroupItems();
        var aFiltersWithValue = [];

        for (i = 0; i < aFilters.length; i++) {
            oControl = this.determineControlByFilterItem(aFilters[i]);
            if (oControl) {
                let hasValue = false;
                if (oControl.isA('sap.m.MultiInput')) {
                    if (oControl.getTokens().length) {
                        hasValue = true;
                    }
                } else if (oControl.isA('sap.m.ComboBox') || oControl.isA('sap.m.Select')) {
                    if (oControl.getSelectedKey()) {
                        hasValue = true;
                    }
                } else if (oControl.isA("sap.m.MultiComboBox")) {
                    if (oControl.getSelectedKeys().length) {
                        hasValue = true;
                    }
                } else {
                    if (oControl.getValue()) {
                        hasValue = true;
                    }
                }
                if (hasValue) {
                    aFiltersWithValue.push(aFilters[i]);
                }
            }
        }
        return aFiltersWithValue;
    };

    SmartFilterBar.prototype.onSearch = function (oEvent) {
        var aSelectionSet = oEvent.getParameter('selectionSet');
        let baseFilters = [];
        let enumFilters = [];
        let enumFiltersOr = [];
        let lanmadaAnEnumFilters = [];
        let idx = 0;
        let variable;

        aSelectionSet.some((oControl) => {
            let aFieldInfo = oControl.oFieldInfo;
            if (aFieldInfo.isEnumeration) {
                if (oControl.getSelectedKeys()) {
                    if (oControl.data().AnnotationConfig.isCollectionNavigationProperty === 1) {
                        variable = "variable" + (idx++);
                        oControl.getSelectedKeys().some((key) => {
                            if (key === "") {
                                key = null;
                            }
                            enumFiltersOr.push(new Filter({
                                path: variable + '/' + oControl.oFieldInfo.entityField,
                                operator: FilterOperator.EQ,
                                value1: key,
                            }));
                        });

                        if (enumFiltersOr.length > 0) {
                            lanmadaAnEnumFilters.push(new Filter({
                                path: oControl.data().AnnotationConfig.navigatationProperty,
                                operator: FilterOperator.Any,
                                variable: variable,
                                condition: new Filter({
                                    filters: enumFiltersOr,
                                    and: false
                                })
                            }));
                        }
                    } else {
                        enumFiltersOr = [];
                        oControl.getSelectedKeys().some((key) => {
                            if (key === "") {
                                key = null;
                            }
                            enumFiltersOr.push(new Filter({
                                path: oControl.oFieldInfo.entityField,
                                operator: FilterOperator.EQ,
                                value1: key,
                            }));
                        });
                        if (enumFiltersOr.length > 0) {
                            enumFilters.push(new Filter(enumFiltersOr, false));
                        }
                    }
                }
                enumFiltersOr = [];
            } else {
                if (oControl.isA('sap.m.MultiInput') || aFieldInfo.isEnumeration) {
                    if (oControl.getTokens().length) {
                        let aFilterArrReference;
                        let aArrayFilters = [];
                        let aExcludeFilters = [];
                        let oExcludeFilters = null;
                        let _isNavigationSet = false;
                        let navigationSetFilters = [];

                        oControl.getTokens().some((oToken) => {
                            var oTokenData = oToken.data('range');
                            if (!oTokenData) {//没有data.range,表示是valueHelpDialog里直接选中的精准数据
                                oTokenData = {
                                    exclude: false,
                                    keyField: oControl.oFieldInfo.entityField,
                                    operation: FilterOperator.EQ,
                                    value1: oToken.getKey()
                                };
                            }

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

                            if (oControl.data().AnnotationConfig.isCollectionNavigationProperty === 0 && this.isProperty(oControl)) {
                                aFilterArrReference.push(new Filter({
                                    path: oTokenData.keyField,
                                    operator: operation,
                                    value1: oTokenData.value1,
                                    value2: oTokenData.value2,
                                }));
                            } else {
                                let aFieldInfo = AnnotationHelper.getFieldInfo(oControl.data().AnnotationConfig.EntityType, oControl.oFieldInfo.entityField);
                                if (aFieldInfo['$Type']) {
                                    let key = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + oControl.data().AnnotationConfig.EntityType)['$Key'][0];//一个外键的实体只会有一个主键
                                    if (oControl.data().AnnotationConfig.isCollectionNavigationProperty === 1) {
                                        //NavigationProperty集合
                                        _isNavigationSet = true;
                                        variable = "variable" + (idx++);
                                        navigationSetFilters.push(new Filter({
                                            path: variable + '/' + oControl.oFieldInfo.entityField,
                                            operator: operation,
                                            value1: oTokenData.value1
                                        }));
                                    } else {
                                        //NavigationProperty单个
                                        aFilterArrReference.push(new Filter({
                                            path: oControl.oFieldInfo.entityField + '/' + key,
                                            operator: operation,
                                            value1: oTokenData.value1,
                                            value2: oTokenData.value2,
                                        }));
                                    }
                                }
                            }
                            if (oTokenData.value1 === null) {
                                aFilterArrReference.push(new Filter({
                                    path: oTokenData.keyField,
                                    operator: operation,
                                    value1: '',
                                    value2: oTokenData.value2,
                                }));
                            }

                        });

                        if (_isNavigationSet) {
                            aFilterArrReference.push(new Filter({
                                path: oControl.data().AnnotationConfig.navigatationProperty,
                                operator: FilterOperator.Any,
                                variable: variable,
                                condition: new Filter({
                                    filters: navigationSetFilters,
                                    and: false
                                })
                            }));
                        }
                        if (aExcludeFilters.length) {
                            oExcludeFilters = new Filter(aExcludeFilters, true);
                        }
                        if (aArrayFilters.length) {
                            if (oExcludeFilters) {
                                baseFilters.push(new Filter([
                                    new Filter(aArrayFilters, false), oExcludeFilters
                                ], true));
                            } else {
                                baseFilters.push(new Filter(aArrayFilters, false));
                            }
                        } else if (oExcludeFilters) {
                            baseFilters.push(oExcludeFilters);
                        }
                    }
                } else if (oControl.isA('sap.m.MultiComboBox')) {
                    if (oControl.data().AnnotationConfig.isCollectionNavigationProperty === 0 && this.isProperty(oControl)) {
                        let aArrayFilters = [];
                        oControl.getSelectedKeys().forEach(function (item) {
                            aArrayFilters.push(new Filter({
                                path: oControl.oFieldInfo.entityField,
                                operator: "EQ",
                                value1: oControl.getSelectedKeys()
                            }));
                        });
                        baseFilters.push(new Filter(aArrayFilters, false));
                    } else {
                        let _isNavigationSet = false;
                        let aArrayFilters = [];
                        let navigationSetFilters = [];
                        let aFieldInfo = AnnotationHelper.getFieldInfo(oControl.data().AnnotationConfig.EntityType, oControl.oFieldInfo.entityField);
                        if (aFieldInfo['$Type']) {
                            let key = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + oControl.data().AnnotationConfig.EntityType)['$Key'][0];//一个外键的实体只会有一个主键
                            idx++;
                            oControl.getSelectedKeys().forEach(function (item) {
                                if (oControl.data().AnnotationConfig.isCollectionNavigationProperty === 1) {
                                    //NavigationProperty集合
                                    _isNavigationSet = true;
                                    // variable = "variable" + (idx++);
                                    variable = "variable" + idx;
                                    navigationSetFilters.push(new Filter({
                                        path: variable + '/' + oControl.oFieldInfo.entityField,
                                        operator: "EQ",
                                        value1: item
                                    }));
                                } else {
                                    //NavigationProperty单个
                                    aArrayFilters.push(new Filter({
                                        path: oControl.oFieldInfo.entityField + '/' + key,
                                        operator: "EQ",
                                        value1: item
                                    }));
                                }
                            });
                        }
                        if (_isNavigationSet) {
                            aArrayFilters.push(new Filter({
                                path: oControl.data().AnnotationConfig.navigatationProperty,
                                operator: FilterOperator.Any,
                                variable: variable,
                                condition: new Filter({
                                    filters: navigationSetFilters,
                                    and: false
                                })
                            }));
                        }
                        if (aArrayFilters.length) {
                            baseFilters.push(new Filter(aArrayFilters, false));
                        }
                    }
                }
                else {
                    if (oControl.getValue()) {
                        var oRange;
                        if (oRange = oControl.data('dateRange')) {
                            var condition = this.getFormatedFilterRanges(oControl)[0];
                            baseFilters.push(new Filter({
                                path: oControl.oFieldInfo.entityField,
                                operator: condition.operation,
                                value1: condition.value1,
                                value2: condition.value2
                            }));
                        } else {
                            baseFilters.push(new Filter({
                                path: oControl.oFieldInfo.entityField,
                                operator: FilterOperator.EQ,
                                value1: oControl.getValue()
                            }));
                        }
                    }
                }
            }
        });
        this._aFilters = baseFilters;
        this._emumFilters = enumFilters;
        this._lanmadaAnEnumFilters = lanmadaAnEnumFilters;
    }

    SmartFilterBar.prototype.getLanmadaAnEnumFilters = function () {
        if (this._aFilters) {
            return Object.assign([], this._lanmadaAnEnumFilters);
        }
    };

    SmartFilterBar.prototype.getFilters = function () {
        if (this._aFilters) {
            return Object.assign([], this._aFilters);
        }
    };

    SmartFilterBar.prototype.getEnumTypeFilters = function () {
        if (this._emumFilters) {
            return Object.assign([], this._emumFilters);
        }
    };

    SmartFilterBar.prototype._createEdmString = function () {
        return new _MultiInput({
            id: jQuery.sap.uid() + '-multiInput',
            showValueHelp: true
        });
    };

    SmartFilterBar.prototype._createEdmDateTimeOffset = function () {
        var oControl;
        var oFilterProvider = {
            oModel: {
                setProperty: function () { },
            },
            _oSmartFilter: {
                getLiveMode: function () {
                    return false;
                },
                fireFilterChange: function () { },
            },
            setFilterData: function () { },
            _createFilterControlId: function () {
                return jQuery.sap.uid() + '-filterItemControl';
            }
        };
        var oDateRange = new _DateRange(jQuery.sap.uid() + '-dateRange', oFilterProvider, {});

        oDateRange.initialize({});
        oControl = oDateRange.initializeFilterItem();
        oControl.data('dateRange', oDateRange);

        return oControl;
    }

    SmartFilterBar.prototype._createEdmNumeric = function () {
        return new _MultiInput({
            id: jQuery.sap.uid() + '-input',
            showValueHelp: true
        });
    };

    SmartFilterBar.prototype._createEnumeration = function (AnnotationHelper, Type) {
        var oControl,
            arr = this.oFieldInfo.isEnumeration,
            items = [],
            that = this;

        items.push(new Item({
            key: '',
            text: '_NA_'
        }));
        arr.forEach(function (item) {
            items.push(new Item({
                key: that.oFieldInfo["$Type"] + "'" + item.key + "'",
                text: item.value
            }));
        });

        oControl = new _MultiComboBox({
            id: jQuery.sap.uid() + "-MultiComboBoxEnum",
            items: items
        });

        return oControl;
    };

    SmartFilterBar.prototype._createCombobox = function (AnnotationHelper, Type) {
        var oControl, oCollectionPath, key, description;
        if (this.oFieldInfo && this.oFieldInfo['@com.sap.vocabularies.Common.v1.ValueList'] &&
            this.oFieldInfo['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
            oCollectionPath = this.oFieldInfo['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
            key = this.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][0]["ValueListProperty"];
            description = this.oFieldInfo["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][1]["ValueListProperty"]
        }

        oControl = new _MultiComboBox({
            id: jQuery.sap.uid() + "-MultiComboBoxEnum"
        });
        var oItemTemplate = new sap.ui.core.Item({
            key: { path: key },
            text: { path: description }
        });
        oControl.bindItems("/" + oCollectionPath, oItemTemplate);
        return oControl;
    };

    SmartFilterBar.prototype.isProperty = function (oControl) {
        let AnnotationConfig = oControl.data('AnnotationConfig');
        if (AnnotationConfig && AnnotationConfig['$kind'] === 'Property') {
            return true;
        }
        return false;
    }

    SmartFilterBar.prototype.getFormatedFilterRanges = function (oSmartControl) {
        var oControl = oSmartControl.data('dateRange');
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

    return SmartFilterBar;
}, true);
