sap.ui.define([
    'sap/m/VBox',
    'sap/m/Table',
    'sap/ui/table/Table',
    'o3/library/model/AnnotationHelper',
    'sap/m/OverflowToolbar',
    'sap/m/FlexItemData',
    'sap/m/library',
    'sap/m/Title',
    'sap/ui/core/format/NumberFormat',
    'sap/m/ToolbarSpacer',
    'sap/ui/core/Core',
    'sap/m/OverflowToolbarButton',
    'sap/m/TablePersoController',
    './_PersoService',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Sorter',
    'sap/ui/model/Filter',
    'o3/sap/ui/export/Spreadsheet',
    'o3/library/control/smart/smartfield/SmartField',
    'sap/ui/model/odata/ODataUtils',
    'o3/library/model/Util',
    'o3/library/control/smart/smartform/SmartForm',
    'o3/library/control/smart/smartform/SmartFormAF'
], function (VBox, ResponsiveTable, Table, AnnotationHelper, OverflowToolbar, FlexItemData, MLibrary, Title, NumberFormat, ToolbarSpacer, Core, OverflowToolbarButton,
    TablePersoController, PersoService, JSONModel, Sorter, Filter, Spreadsheet, SmartField, ODataUtils, Util, SmartForm, SmartFormAF) {
    "use strict";

    // shortcut for sap.m.ToolbarDesign
    var ToolbarDesign = MLibrary.ToolbarDesign;

    var SmartTable = VBox.extend("o3.library.control.smart.smarttableV2.SmartTable",
        {
            metadata: {
                library: "sap.ui.comp",
                properties: {
                    entitySet: { type: "string", group: "Misc", defaultValue: null },
                    tableType: { type: "string", group: "Misc", defaultValue: "ResponsiveTable" },
                    header: { type: "string", group: "Misc", defaultValue: null },
                    showRowCount: { type: "boolean", group: "Misc", defaultValue: true },
                    useVariantManagement: { type: "boolean", group: "Misc", defaultValue: true },
                    placeToolbarInTable: { type: "boolean", group: "Misc", defaultValue: false },
                    useTablePersonalisation: { type: "boolean", group: "Misc", defaultValue: true },
                    showTablePersonalisation: { type: "boolean", group: "Misc", defaultValue: true },
                    smartFilterId: { type: "string", group: "Misc", defaultValue: null },
                    useExportToExcel: { type: "boolean", group: "Misc", defaultValue: true },
                    useNavigation: { type: "boolean", group: "Misc", defaultValue: false },//使用跳转路由
                    editable: { type: "boolean", group: "Misc", defaultValue: false },
                    editTogglable: { type: "boolean", group: "Misc", defaultValue: false },//使用切换编辑按钮
                    creatable: { type: "boolean", group: "Misc", defaultValue: false },
                    createTogglable: { type: "boolean", group: "Misc", defaultValue: false },//使用切换创建按钮
                    initiallyVisibleFields: { type: "string", group: "Misc", defaultValue: null },//初始化列
                    growingScrollToLoad: { type: "boolean", group: "Misc", defaultValue: false },
                    growingThreshold: { type: "int", group: "Misc", defaultValue: 10 },
                    mode: { type: "string", group: "Misc", defaultValue: "None" },
                    quickCreatable: { type: "boolean", group: "Misc", defaultValue: false },
                    deletable: { type: "boolean", group: "Misc", defaultValue: false }
                },
                associations: {
                    smartVariant: { type: "sap.ui.core.Control", multiple: false }
                },
                aggregations: {
                    customToolbar: { type: "sap.m.Toolbar", multiple: false }
                },
                events: {
                    //行点击触发事件
                    columnItemPress: {},
                    //编辑按钮触发事件
                    editToggled: {},
                    //创建按钮触发事件
                    createToggled: {}
                }
            },
            renderer: {
                apiVersion: 2
            },
            constructor: function () {
                VBox.apply(this, arguments);
                this._aExistingColumns = [];
                this._aAlwaysSelect = [];
                this._oTemplate = null;
                this._mFieldMetadataByKey = {};
                this._mViewSettingsDialogs = {};
                this._AnnotationData = null;
                this._NameSpace = null;
                this._EntityType = null;
                this._EntitySet = this.getEntitySet();
                this._createToolbar();
                this._createTable();
                this.attachModelContextChange(this._initialiseMetadata, this);

                //odata4 错误处理
                // var oMessageManager = sap.ui.getCore().getMessageManager(),
                //     oMessageModel = oMessageManager.getMessageModel(),
                //     oMessageModelBinding = oMessageModel.bindList('/' + this.getEntitySet())
                // this.setModel(oMessageModel, "message");
                // oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
            }
        });

    SmartTable.prototype.init = function () {
        VBox.prototype.init.call(this);
        this.addStyleClass("sapUiCompSmartTable");
        this.setFitContainer(true);
        this._aColumnKeys = [];
        this._aDeactivatedColumns = [];
        this._mLazyColumnMap = {};
    };

    //监听表单内的错误变化
    SmartTable.prototype.onMessageBindingChange = function (oEvent) {
        var aContexts = oEvent.getSource().getContexts(),
            aMessages,
            bMessageOpen = false;
        if (bMessageOpen || !aContexts.length) {
            return;
        }

        // Extract and remove the technical messages
        aMessages = aContexts.map(function (oContext) {
            return oContext.getObject();
        });

        // console.log('aMessages', aMessages)
        // sap.ui.getCore().getMessageManager().removeMessages(aMessages);

        // this._setUIChanges(true);
        // this._bTechnicalErrors = true;
        // MessageBox.error(aMessages[0].message, {
        //     id: "serviceErrorMessageBox",
        //     onClose: function () {
        //         bMessageOpen = false;
        //     }
        // });

        // bMessageOpen = true;
    };

    SmartTable.prototype.setEntitySet = function (sEntitySetName) {
        this.setProperty("entitySet", sEntitySetName, true);
        // 判断entitySet是否改变
        if (sEntitySetName !== "") {
            this.bIsInitialised = false;
            this._initialiseMetadata();
        }
    };

    SmartTable.prototype.setMode = function (mode) {
        this.setProperty("mode", mode, true);
        // 判断entitySet是否改变
        if (this._oTable) {
            this._oTable.setMode(mode);
        }
    };

    SmartTable.prototype.setGrowingScrollToLoad = function (growingScrollToLoad) {
        this.setProperty("growingScrollToLoad", growingScrollToLoad, true);
        if(this._oTable){
            this._oTable.setGrowingScrollToLoad(growingScrollToLoad);
        }
    };

    SmartTable.prototype.setEditable = function (sEditable) {
        this.setProperty("editable", sEditable, true);
        if (this.bIsInitialised) {
            if (!this.getEditTogglable() && !this.getEditable()) {
                this.setProperty("editable", !sEditable, true);
                if (this._oEditButton) {
                    this._oEditButton.firePress();
                }
            }
        }
    };

    //初始化Metadata数据
    SmartTable.prototype._initialiseMetadata = function (oEvt) {
        var that = this, oControl = that;
        const oModel = this.getModel()
        // if (oEvt) {
        //     oControl = oEvt.getSource();
        // }
        if (this.getEntitySet() === "") {
            return;
        }
        if (!oControl.bIsInitialised && oModel) {
            //等待metadata加载完
            AnnotationHelper.init(oModel).then((oDataAnnotations) => {
                this.bIsInitialised = true;
                if (this.getEntitySet().includes("/")) {
                    var toNavitationProperty = this.getEntitySet().split("/")[1];
                    var entitySet = this.getEntitySet().split("(")[0];
                    this._EntitySet = oDataAnnotations["com.dpbird.O3Container"][entitySet]["$NavigationPropertyBinding"][toNavitationProperty];
                } else {
                    this._EntitySet = this.getEntitySet();
                }

                this._listenToSmartFilter();//监听filterBar事件
                this._createToolbarContent();
                // !this._AnnotationData && this._setTableByAnnotations(oModel);
                this._setTableByAnnotations(oModel, oDataAnnotations);
                this._initTablePersoController()

                // Create a local JSONModel to handle editable switch
                this._oEditModel = new JSONModel({
                    editable: this.getEditable()
                });
                // Set the local model on the SmartTable
                this.setModel(this._oEditModel, "sm4rtM0d3l");

                if (this._isMobileTable && !this.getEditable() && this.getUseNavigation()) {
                    this.getModel("sm4rtM0d3l").setProperty("/isNavigation", "Navigation");
                }
                this.getModel("sm4rtM0d3l").setProperty("/infoToolBarVisible", false);
                this.getModel("sm4rtM0d3l").setProperty("/selectedRow", 0);
                this._getView();
            })
        }
    };

    //初始化table选列
    SmartTable.prototype._initTablePersoController = function () {
        const that = this
        if (this._oTable) {
            if (this.getTableType() === "ResponsiveTable") {
                if (!this._oTPC) {
                    this._oTPC = new TablePersoController(jQuery.sap.uid() + "--tablePersoContorller", {
                        table: this._oTable,
                        componentName: "demoApp",
                        persoService: PersoService,
                    }).activate();
                    this._oTPC.attachPersonalizationsDone(function () {
                        that._setTableColumns();
                    });
                }
            } else {
                //其他table的选列实现
            }
        }
    }

    SmartTable.prototype._createTable = function () {
        var aContent = this.getItems(), iLen = aContent ? aContent.length : 0, oTable, sId;
        this._sAggregation = "items";

        //检查table 是否已经存在
        while (iLen--) {
            oTable = aContent[iLen];
            if (oTable instanceof Table || oTable instanceof ResponsiveTable) {
                break;
            }
            oTable = null;
        }

        //实例化Table
        if (oTable) {
            this._oTable = oTable;
            if (oTable instanceof AnalyticalTable) {
                this._isAnalyticalTable = true;
            } else if (oTable instanceof ResponsiveTable) {
                this._isMobileTable = true;
                this._oTemplate = (oTable.getItems() && oTable.getItems().length > 0) ? oTable.getItems()[0] : new ColumnListItem();
                oTable.removeAllItems();
            } else if (oTable instanceof TreeTable) {
                this._isTreeTable = true;
            }
            this._updateInitialColumns();
        } else {
            sId = this.getId() + "-ui5table";
            if (this.getTableType() === "AnalyticalTable") {
                this._isAnalyticalTable = true;

            } else if (this.getTableType() === "ResponsiveTable") {
                this._isMobileTable = true;
                this._oTable = new ResponsiveTable(sId, {
                    growing: true,
                    growingScrollToLoad: this.getGrowingScrollToLoad(),
                    growingThreshold: this.getGrowingThreshold(),
                    fixedLayout: false,
                    mode: this.getMode()
                });
                this._oTable.bActiveHeaders = true
                this._oTable.attachEvent("columnPress", this._onColumnPress, this);
                this._oTable.setLayoutData(new sap.m.FlexItemData({
                    growFactor: 1,
                    baseSize: "auto"
                }));
                this._oTable.addStyleClass("sapUiCompSmartTableInnerTable")
                this._oTable.attachSelect(this.mTableSelect.bind(this));
            } else if (this.getTableType() === "TreeTable") {
                this._isTreeTable = true;
            } else {
                this._oTable = new Table(sId, {
                    selectionMode: "MultiToggle"
                });
            }
        }

        this._oTable.setSticky(['HeaderToolbar', 'InfoToolbar', 'ColumnHeaders'])
        this._oTable.setEnableBusyIndicator(true);
        this._oTable.setBusyIndicatorDelay(100);
        this.insertItem(this._oTable, 2);
    };

    //设置table初始化数据(默认列，可选排序，可选过滤，可选分组) 通过annotations
    SmartTable.prototype._setTableByAnnotations = function (oModel, oDataAnnotations) {
        this._AnnotationData = oModel.getMetaModel().getData() || oDataAnnotations;
        this._EntityType = AnnotationHelper.getEntityTypeByEntitySet(this._EntitySet);
        this._NameSpace = AnnotationHelper.getNameSpace(oModel)
        // console.log('this._AnnotationData', this._AnnotationData)
        // console.log('this._EntityType', this._EntityType)
        // console.log('this._NameSpace', this._NameSpace)
        if (!this._AnnotationData)
            return

        //拿到所有的属性
        this._propertyFields = [];
        var entityObject = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + this._EntityType);
        if (entityObject) {
            for (var key in entityObject) {
                if (entityObject[key]['$kind']
                    && (entityObject[key]['$kind'] === 'Property' || entityObject[key]['$kind'] === 'NavigationProperty')) {
                    this._propertyFields[key] = entityObject[key];
                }
            }
        }

        const Columns = {
            columnItems: [],
            allColumnsItems: [],
            sortItems: [],// 默认排序字段
            allSortItem: [],// 所有可用于排序的列
            filterItems: [],// 默认过滤字段
            allFilterItem: [],// 所有可用于过滤的字段
            groupItems: [], //默认的分组字段
            allGroupItems: [], //默认的可用于分组的字段
            ShowResetEnabled: false,
            fieldType: {} // 保存数据类型
        };

        // 排序 & 分组
        var _annoEntityType, _columnkey, _fieldEntityType, _feildType, _feildText, type, str, arrIt;
        var annotations = this._AnnotationData.$Annotations;

        for (var item in annotations) {
            arrIt = item.split(".");
            if (arrIt.length > 2 && arrIt[arrIt.length - 1].split("/").length > 1) {
                _annoEntityType = arrIt[arrIt.length - 1].split("/")[0];
                if (this._EntityType === _annoEntityType) {
                    str = arrIt[arrIt.length - 1].replace("/", "_");
                    _fieldEntityType = str.split("_")[0];
                    _columnkey = str.split("_")[1];
                    // 是否可排序分组
                    if (AnnotationHelper.isPropertySortGoup(_fieldEntityType, _columnkey)) {
                        _feildText = AnnotationHelper.getFieldLabel(_fieldEntityType, _columnkey);
                        Columns.allSortItem.push({
                            columnKey: str.split("_")[1],
                            text: _feildText
                        });
                        Columns.allGroupItems.push({
                            columnKey: str.split("_")[1],
                            text: _feildText
                        });
                    }
                }
            }
        }

        // 过滤器
        // item = com.dpbird.Product/ProductType/productTypeId demo
        for (var item in annotations) {
            arrIt = item.split(".");
            if (arrIt.length > 2 && arrIt[arrIt.length - 1].split("/").length > 1) {
                _annoEntityType = arrIt[arrIt.length - 1].split("/")[0];
                if (this._EntityType === _annoEntityType) {
                    str = arrIt[arrIt.length - 1].replace("/", "_");
                    _fieldEntityType = str.split("_")[0];
                    _columnkey = str.split("_")[1];

                    if (_columnkey.split("/").length === 1) {
                        _feildType = this._AnnotationData[this._NameSpace + _fieldEntityType][_columnkey]["$Type"];
                    } else {
                        let _arrColumnKey = _columnkey.split("/");
                        if (_arrColumnKey.length === 2) {
                            let ab = this._AnnotationData[this._NameSpace + _fieldEntityType][_arrColumnKey[0]]["$Type"];
                            _feildType = this._AnnotationData[ab][_arrColumnKey[1]]["$Type"];
                        }
                        if (_arrColumnKey.length === 3) {
                            let ab = this._AnnotationData[this._NameSpace + _fieldEntityType][_arrColumnKey[0]]["$Type"];
                            let cd = this._AnnotationData[ab][_arrColumnKey[1]]["$Type"];
                            _feildType = this._AnnotationData[cd][_arrColumnKey[2]]["$Type"];
                        }
                    }
                    // 是否可过滤
                    if (AnnotationHelper.isPropertyFilterable(_fieldEntityType, _columnkey) &&
                        AnnotationHelper.getEntityTypeObject(this._NameSpace + _fieldEntityType)[_columnkey] &&
                        !AnnotationHelper.getEntityTypeObject(this._NameSpace + _fieldEntityType)[_columnkey]['$isCollection']) {
                        // if (AnnotationHelper.isPropertyFilterable(_fieldEntityType, _columnkey)) {
                        let values;
                        if (_feildType === "Edm.DateTime") type = "datetime";
                        else if (_feildType === "Edm.DateTimeOffset") type = "datetime"
                        else if (_feildType === "Edm.Boolean") type = "boolean"
                        else if (_feildType === "Edm.Decimal") type = "numeric"
                        else if (AnnotationHelper.isEnumeration(_fieldEntityType, _columnkey)) {
                            type = "select";
                            values = [AnnotationHelper.getFieldType(_fieldEntityType, _columnkey), JSON.stringify(AnnotationHelper.isEnumeration(_fieldEntityType, _columnkey))];
                        }
                        else if (AnnotationHelper.isSelectControl(_fieldEntityType, _columnkey)) {
                            type = "select";
                            values = [JSON.stringify(AnnotationHelper.getSelectItems(_fieldEntityType, _columnkey))];
                        }
                        else type = "string";
                        _feildText = AnnotationHelper.getFieldLabel(_fieldEntityType, _columnkey);
                        Columns.allFilterItem.push({
                            columnKey: _columnkey,
                            text: _feildText,
                            type: type,
                            values: values
                        });
                        Columns.fieldType[_columnkey] = type;
                    }
                }
            }
        }

        this.setModel(new JSONModel($.extend(true, [], Columns)), 'oDataInitial');//table的初始状态
        this.setModel(new JSONModel($.extend(true, [], Columns)), 'columns');//操作的状态
        this.setModel(new JSONModel($.extend(true, [], Columns)), 'oDataOk');//调整后要保存的状态
        this._setTableColumns()
    }

    SmartTable.prototype._updateColumnsPopinFeature = function () {
        var aColumns = this._oTable.getColumns();
        if (!aColumns) {
            return;
        }

        // get only visible columns
        aColumns = aColumns.filter(function (col) {
            return col.getVisible();
        });

        // sort columns according to their order property
        aColumns.sort(function (col1, col2) {
            return col1.getOrder() - col2.getOrder();
        });

        var oColumn, vWidth, fTotalWidth = 0, iLength = aColumns.length, fBaseFontSize = parseFloat(MLibrary.BaseFontSize);

        for (var i = 0; i < iLength; i++) {
            oColumn = aColumns[i];
            vWidth = oColumn.getWidth();

            if (vWidth && vWidth.endsWith("px")) {
                vWidth = parseFloat(vWidth) / fBaseFontSize;
            } else if (vWidth && (vWidth.endsWith("rem") || vWidth.endsWith("em"))) {
                vWidth = parseFloat(vWidth);
            } else {
                vWidth = 12;
            }

            fTotalWidth = fTotalWidth + vWidth;

            if (i < 2) { // ensure always two columns
                oColumn.setDemandPopin(false);
                oColumn.setMinScreenWidth("1px");
            } else {
                oColumn.setDemandPopin(true);
                if (oColumn.getPopinDisplay() != "WithoutHeader") {
                    oColumn.setPopinDisplay("Inline");
                }
                oColumn.setMinScreenWidth(fTotalWidth + "rem");
            }

        }
    }

    SmartTable.prototype._setTableColumns = function () {
        this.errorItems = []; // 保存错误数据
        const that = this
        const LineItem = this._AnnotationData['$Annotations'][`${this._NameSpace}${this._EntityType}`]['@com.sap.vocabularies.UI.v1.LineItem'];
        const cells = []
        const parameters = {
            $$updateGroupId: 'update',
            $count: true,
        }
        const expand = {}
        const initiallyVisibleFieldsArray = this.getInitiallyVisibleFields() ? this.getInitiallyVisibleFields().split(',') : []
        let selectStr = ''

        if (this._oTPC) {
            initiallyVisibleFieldsArray.length = 0;
            this._getTablePersoDialogColumns().forEach(function (item, index) {
                if (item.visible) {
                    let _field = item.id.split("-")[item.id.split("-").length - 1];
                    while (_field.includes("_")) {
                        _field = _field.replace("_", "/");
                    }
                    initiallyVisibleFieldsArray.push(_field);
                }
            });
        }

        //根据table类型渲染column
        if (this.getTableType() === 'ResponsiveTable') {
            //配置查询选择字段
            initiallyVisibleFieldsArray.map((item) => {
                if (!item.includes('/') && (!this._propertyFields[item] || this._propertyFields[item]['$kind'] !== 'NavigationProperty')) {
                    selectStr += item + ','
                    // 是否有单位
                    if (this._AnnotationData["$Annotations"][this._NameSpace + this._EntityType + "/" + item] && this._AnnotationData["$Annotations"][this._NameSpace + this._EntityType + "/" + item]["@Org.OData.Measures.V1.Unit"]) {
                        selectStr += this._AnnotationData["$Annotations"][this._NameSpace + this._EntityType + "/" + item]["@Org.OData.Measures.V1.Unit"]["$Path"] + ','
                    }
                    //判断是否需要expand 例：annotations 中存在 ProductType/description 说明需要同时查询关联表数据并显示
                    if (AnnotationHelper.getNavigationPropertyByForeignKey(this._EntityType, item)) {
                        let navitation = AnnotationHelper.getNavigationPropertyByForeignKey(this._EntityType, item);
                        if (!expand[navitation]) {
                            expand[navitation] = true;
                        }
                    }
                } else {
                    let _expand = item.split('/');
                    let length = _expand.length;
                    if (length === 2) {
                        if (!expand[_expand[0]]) {
                            expand[_expand[0]] = true
                        }
                    }
                    if (length === 3) {
                        if (!expand[_expand[0]] || (expand[_expand[0]] && !expand[_expand[0]]["$expand"])) {
                            expand[_expand[0]] = { $expand: {} };
                            expand[_expand[0]]["$expand"][_expand[1]] = true;
                        } else {
                            expand[_expand[0]]["$expand"][_expand[1]] = true;
                        }
                    }
                }
            });

            // 20200708 table取消，保存时，增加过滤条件
            var aFilter = [],
                aSorter = [],
                groupId,
                groupItems = this.getModel("columns").getProperty("/groupItems"),
                fieldType = this.getModel("columns").getProperty("/fieldType"),
                isExistInSorterItem = false;

            if (this._oTable && that._oTable.getAggregation("columns")) {
                var _columns = that._oTable.getAggregation("columns");

                _columns.some(function (obj) {
                    obj.setSortIndicator("None");
                });
                if (groupItems.length > 0) {
                    groupId = groupItems[0].columnKey;
                }
                this.getModel("columns").getProperty("/sortItems").forEach(function (item, index) {
                    if (item.columnKey === groupId) {
                        isExistInSorterItem = true;
                        var sorterItem = new Sorter(item.columnKey, item.operation === 'Descending', true);
                    } else {
                        var sorterItem = new Sorter(item.columnKey, item.operation === 'Descending');
                    }
                    aSorter.push(sorterItem);
                    _columns.some(function (obj) {
                        let _columnkey = item.columnKey;
                        while (_columnkey.includes("/")) {
                            _columnkey = _columnkey.replace("/", "_");
                        }
                        if (obj.getId().indexOf(_columnkey) > -1) {
                            obj.setSortIndicator(item.operation);
                            return true;
                        }
                    });
                });
                if (!isExistInSorterItem && groupItems.length > 0) {
                    aSorter.unshift(new Sorter(groupId, false, true));
                }

                if (this._oSmartFilter && this._oSmartFilter.getFilters()) { //判断filterBar是否存在过滤条件
                    aFilter = this._oSmartFilter.getFilters();
                }
                this.getModel("columns").getProperty("/filterItems").forEach(function (item, index) {
                    var value1 = item.value1,
                        value2 = item.value2;
                    if (value1 && fieldType[item.columnKey] === "datetime") {
                        value1 = dayjs(value1).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                    }
                    if (value2 && fieldType[item.columnKey] === "datetime") {
                        value2 = dayjs(value2).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                    }
                    // 排除enum类型的filter
                    if (!value1.includes(that._NameSpace)) {
                        var filterItem = new Filter({
                            path: item.columnKey,
                            operator: item.operation,
                            value1: value1,
                            value2: value2
                        });
                        aFilter.push(filterItem);
                    }
                });
            }

            if (JSON.stringify(expand) != "{}") {
                parameters['$expand'] = expand;
            }

            LineItem.map((item, index) => {
                let oField = item.Value['$Path']
                let reField = item.Value['$Path']
                let isNavigationProperty = oField.includes('/')//判断是否是关联表
                var _field_id = item.Value['$Path'];
                while (_field_id.includes('/')) {
                    _field_id = _field_id.replace('/', '_');
                }
                // let ColumnId = jQuery.sap.uid() + '-' + reField.replace('/', '_') //Id 不可以包含 / 所以 替换 _
                let ColumnId = jQuery.sap.uid() + '-' + _field_id;
                let oVisible = initiallyVisibleFieldsArray.includes(oField)

                //除了判断包含/以外，还要判断是否本身就是"NavigationProperty"
                if (!isNavigationProperty && this._propertyFields[oField] && this._propertyFields[oField]['$kind'] === 'NavigationProperty' && !this._propertyFields[oField]['$isCollection']) {
                    isNavigationProperty = true;
                }

                //再判断该字段是否配置了 ValueList 和 CollectionPath
                if (!isNavigationProperty) {
                    var fieldAnnotation = this._AnnotationData["$Annotations"][this._NameSpace + this._EntityType + "/" + oField];
                    if (fieldAnnotation && fieldAnnotation['@com.sap.vocabularies.Common.v1.ValueList']
                        && fieldAnnotation['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
                        isNavigationProperty = true;
                    }
                }

                // 设置对齐方式
                var _hAlign = "Left", type
                if (!isNavigationProperty) {
                    type = this._AnnotationData[this._NameSpace + this._EntityType][oField].$Type;
                    if (type === "Edm.DateTime" || type === "Edm.DateTimeOffset" || Util.isNumic(type))
                        _hAlign = "Right";
                }

                //只有初始化时 初始化列
                if (!this._oTemplate) {
                    this._oTable.addColumn(
                        new sap.m.Column(ColumnId, {
                            hAlign: _hAlign,
                            header: new sap.m.Label({
                                textAlign: _hAlign,
                                text: item.Label
                            }),
                            visible: oVisible,
                            width: undefined
                        })
                    )
                }
                //添加行内容  不显示的cell需要用Lable占位
                if (oVisible) {
                    // if (isNavigationProperty) {
                    //     if (oField.includes('/')) {
                    //         cells.push(new sap.m.Text({ text: `{${oField}}` }))
                    //     } else {
                    //         cells.push(new SmartLink({
                    //             entitySet: this._EntitySet,
                    //             entityField: oField
                    //         }))
                    //     }
                    // } else {
                    //  指定type，ODataModel不做校验
                    // cells.push(new sap.m.Input({
                    //     value: `{${oField}}`,
                    //     valueLiveUpdate: true
                    // }))
                    let isPropertyUpdatable = AnnotationHelper.isPropertyUpdatable(this._EntitySet, oField);

                    cells.push(new SmartField({
                        entitySet: this._EntitySet,
                        entityField: oField,
                        editable: "{= ${sm4rtM0d3l>/editable} && " + isPropertyUpdatable + "}",
                        value: {
                            path: oField,
                            type: 'sap.ui.model.odata.type.String'
                        },
                        valueLiveUpdate: true,
                        check: function (oEvent) {
                            var oSource = oEvent.getSource();
                            if (oEvent.getSource().getValueState() === "Error") {
                                // TODO: 判断
                                let flag = true;
                                for (var i = 0; i < that.errorItems.length; i++) {
                                    if (that.errorItems[i] === oSource) {
                                        flag = false;
                                        break;
                                    }
                                }
                                if (flag) {
                                    that.errorItems.push(oEvent.getSource());
                                }
                            } else {
                                that.errorItems.forEach(function (item, index) {
                                    if (oSource === item) {
                                        that.errorItems = that.errorItems.splice(0, index);
                                    }
                                });
                            }
                        }
                    }))
                    // }
                } else {
                    cells.push(new sap.m.Label())
                }
            });

            this._updateColumnsPopinFeature();

            if (selectStr) {
                parameters['$select'] = selectStr.substring(0, selectStr.lastIndexOf(','));
            }

            // console.log('cells===>', cells)
            // console.log('parameters===>', parameters)

            this._oTemplate = new sap.m.ColumnListItem(jQuery.sap.uid() + "listItem", {
                cells: cells,
                // type: (!this.getEditable() && this.getUseNavigation()) ? 'Navigation' : null,
                type: "{=${sm4rtM0d3l>/isNavigation}}",
                press: (oEvent) => {
                    const columnItem = oEvent.getSource().getBindingContext().getObject()
                    this.fireColumnItemPress({ columnItem: columnItem })
                }
            })

            var sPath = '/' + this.getEntitySet();

            this._parameters = parameters;
            this._sPath = sPath;
            // TODO: 需要优化，有点乱
            if (this._oTable && this._oTable.getBinding("items")) {
                let oBinding = this._oTable.getBinding("items");
                var _mParam = [];
                if (oBinding.mParameters.$filter) {
                    _mParam["$filter"] = oBinding.mParameters.$filter
                }
                if (oBinding.mParameters.$sorter) {
                    _mParam["$sorter"] = oBinding.mParameters.$sorter || [];
                }
            }
            this._oTable.bindItems({
                path: sPath,
                parameters: parameters,
                filters: aFilter,
                sorter: aSorter,
                template: this._oTemplate,
                events: {
                    dataRequested: function (oEvent) {
                        //
                    },
                    dataReceived: function (oEvent) {
                        if (that.getShowRowCount()) {
                            var sText = that.getHeader();
                            sText += " (" + oEvent.getSource().iMaxLength + ")";
                            that._headerText.setText(sText);
                        }
                    },
                    change: function (mEventParams) {
                        //
                    }
                }
            });
            // if (this._oTable && this._oTable.getBinding("items") && _mParam && JSON.stringify(_mParam) !== "[]") {
            if (this._oTable && this._oTable.getBinding("items") && _mParam && _mParam["$filter"]) {
                let oBinding = this._oTable.getBinding("items");
                let mParameters = oBinding.mParameters;
                if (_mParam && _mParam["$filter"]) {
                    mParameters["$filter"] = _mParam["$filter"];
                }
                if (_mParam && _mParam["$sorter"]) {
                    mParameters["$sorter"] = _mParam["$sorter"];
                }
                oBinding.applyParameters(mParameters);
                oBinding.refresh();
            }
        } else {
            // LineItem.map((item, index) => {
            //     let ColumnId = item.Value['$Path'].replace('/', '0') //****后期优化吧 暂时没有方案 */
            //     this._oTable.addColumn(
            //         new sap.ui.table.Column(ColumnId, {
            //             label: new sap.m.Label({ text: item.Label }),
            //             template: "text",
            //             visible: initiallyVisibleFieldsArray.includes(item.Value['$Path'])
            //         }),
            //     )
            //     cells.push(new sap.m.Text({ text: `{${item.Value['$Path']}}` }))
            // });

            // this._oTable.bindRows({
            //     path: '/' + this.getEntitySet(),
            //     parameters: parameters,
            //     template: new sap.ui.table.Row("Row", {
            //         cells: cells
            //     })
            // })
        }
    }

    SmartTable.prototype._onColumnPress = function (oEvent) {
        var that = this;
        var _oColumnClicked = oEvent.getParameter("column")
        var oColumnKey = _oColumnClicked.getId().split("-")[_oColumnClicked.getId().split("-").length - 1];
        var allSortItem = that.getModel("columns").getData().allSortItem;

        while (oColumnKey.includes('_')) {
            oColumnKey = oColumnKey.replace("_", "/");
        }
        if (JSON.stringify(allSortItem).indexOf("columnKey\":\"" + oColumnKey) === -1) {
            return;
        }

        sap.ui.core.Fragment.load({
            type: "XML",
            definition: `
                <core:FragmentDefinition
                    xmlns="sap.m"
                    xmlns:core="sap.ui.core"
                    xmlns:u="sap.ui.unified">
                        <u:Menu itemSelect="handleMenuItemPress">
                            <u:MenuItem text="升序排序" icon="sap-icon://sort-ascending"/>
                            <u:MenuItem text="降序排序" icon="sap-icon://sort-descending"/>
                        </u:Menu>
                </core:FragmentDefinition>`,
            controller: {
                handleMenuItemPress: (oEvent) => {
                    if (oEvent.getParameter("item").getProperty("text") === "升序排序") {
                        that.getModel("columns").setProperty("/sortItems", [{
                            columnKey: oColumnKey,
                            operation: "Ascending"
                        }]);
                        that.onOK();
                    } else {
                        that.getModel("columns").setProperty("/sortItems", [{
                            columnKey: oColumnKey,
                            operation: "Descending"
                        }]);
                        that.onOK();
                    }
                }
            }
        }).then(function (dialog) {
            that._menu = dialog;
            this._menu.open(null, _oColumnClicked, sap.ui.core.Popup.Dock.BeginTop, sap.ui.core.Popup.Dock.BeginBottom, _oColumnClicked);
        }.bind(that));
    }

    //获取TablePersoDialog的数据  两种情况 是否使用调整过
    SmartTable.prototype._getTablePersoDialogColumns = function () {
        let oColumns
        //判断是否调整过table columns
        if (this._oTPC.getTablePersoDialog()._oP13nModel.oData.aColumns) {
            oColumns = this._oTPC.getTablePersoDialog()._oP13nModel.oData.aColumns
        } else {
            oColumns = this._oTPC.getTablePersoDialog().mProperties.initialColumnState
        }

        return oColumns
    }

    SmartTable.prototype.getToolBar = function () {
        if (!this._oToolbar) {
            this._createToolbar();
            return this._oToolbar;
        }
        return this._oToolbar;
    };

    SmartTable.prototype._createToolbar = function () {
        var oCustomToolbar = null;
        if (!this._oToolbar) {
            oCustomToolbar = this.getCustomToolbar();
            if (oCustomToolbar) {
                this._oToolbar = oCustomToolbar;
            } else {
                this._oToolbar = new OverflowToolbar({
                    design: ToolbarDesign.Transparent
                });
                this._oToolbar.addStyleClass("sapUiCompSmartTableToolbar");
            }
            this._oToolbar.setLayoutData(new FlexItemData({
                shrinkFactor: 0
            }));
        }
        this._oToolbar.attachEvent("_change", this.onSetTableNavigation, this);
    };

    SmartTable.prototype.onSetTableNavigation = function () {
        var enabled = this._oToolbar.getEnabled();
        if (this._isMobileTable && this.getUseNavigation()) {
            this.getModel("sm4rtM0d3l").setProperty("/isNavigation", enabled ? "Navigation" : "Inactive");
        }
    };

    SmartTable.prototype._createToolbarContent = function () {
        if (!this._oToolbar) {
            this._createToolbar();
        }

        // insert the items in the custom toolbar in reverse order => insert always at position 0
        this._addVariantManagementToToolbar();
        this._addSeparatorToToolbar();
        this._addHeaderToToolbar();

        // add spacer to toolbar
        this._addSpacerToToolbar();

        this._addActionFunctionButtonToToolbar();

        // First show Display/Edit icon, then Personalisation and finally Excel Export
        this._addCreateTogglableToToolbar();//创建按钮
        this._addSaveToToolbar()
        this._addEditTogglableToToolbar();//编辑状态按钮
        this._addDeleteToToolbar(); // 删除按钮
        this._addTableSortAndFilterAndGroupToToolbar();//排序 分组 过滤
        this._addTablePersonalisationToToolbar();//编辑列
        this._addExportToExcelToToolbar();//table导出excel
        this._addInfoToolBar();

        this._bToolbarInsertedIntoItems = true;
        this._placeToolbar();
    };

    SmartTable.prototype._addInfoToolBar = function () {
        var that = this;
        if (!this._oInfoToolBar) {
            this._oInfoToolBar = new OverflowToolbar({
                active: true,
                press: function () {
                    var oPersonalizationDialog = sap.ui.xmlfragment("o3.library.control.smart.smarttableV2.dialog.PersonalizationDialogInfoToolBar", that);
                    that.addDependent(oPersonalizationDialog);
                    that.getModel('columns').setProperty("/ShowResetEnabled", that._isChanged());
                    oPersonalizationDialog.open();
                },
                visible: "{= ${sm4rtM0d3l>/infoToolBarVisible}}",
                content: [new sap.m.Label({ text: "{sm4rtM0d3l>/infoToolBar}" })]
            })
        }
        if (this._oTable) {
            this._oTable.setInfoToolbar(this._oInfoToolBar);
        }
    };

    SmartTable.prototype._addDeleteToToolbar = function () {
        var that = this;
        if (this._oDeleteButton) {
            this._oToolbar.removeContent(this._oDeleteButton);
        }
        if (!this._oDeleteButton) {
            let _visible = false;
            if ((this.getMode() === "MultiSelect" || this.getMode() === "SingleSelectLeft") && this.getDeletable()) {
                _visible = true;
            }
            this._oDeleteButton = new sap.m.Button(this.getId() + "-btnDeleteToggle", {
                text: "删除",
                visible: _visible,
                enabled: "{= !${sm4rtM0d3l>/editable} && ${sm4rtM0d3l>/selectedRow} > 0}",
                press: [
                    function () {
                        if (this.errorItems.length !== 0) {
                            sap.m.MessageBox.error("Invalid entry");
                            return;
                        }
                        var dialog = new sap.m.Dialog({
                            title: 'Warning',
                            type: 'Message',
                            state: 'Warning',
                            content: new sap.m.Text({
                                text: '是否确定删除?'
                            }),
                            beginButton: new sap.m.Button({
                                text: '确定',
                                press: function () {
                                    var requestURL = [];
                                    var selectedContexts = that._oTable.getSelectedContexts();
                                    for (var i = 0; i < selectedContexts.length; i++) {
                                        let sPath = selectedContexts[i].getObject()["@odata.id"];
                                        requestURL.push({
                                            url: sPath,
                                            method: 'DELETE'
                                        });
                                    }
                                    o3Tool.request(requestURL).then(function (message) {
                                        if (message && message[0] && message[0].error) {
                                            sap.m.MessageBox.error(JSON.stringify(message[0].error.message));
                                        } else {
                                            that.rebindTable();
                                            sap.m.MessageToast.show("删除成功！");
                                        }
                                    });
                                    dialog.close();
                                }
                            }),
                            endButton: new sap.m.Button({
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
                    }, this
                ]
            });
        }
        this._oToolbar.addContent(this._oDeleteButton);
    };

    SmartTable.prototype.mTableSelect = function (oEvent) {
        if (this._oTable.getSelectedItems().length > 0) {
            this.getModel("sm4rtM0d3l").setProperty("/selectedRow", this._oTable.getSelectedItems().length);
        } else {
            this.getModel("sm4rtM0d3l").setProperty("/selectedRow", 0);
        }
    }

    SmartTable.prototype._placeToolbar = function () {
        // if (!this.getPlaceToolbarInTable()) {
        //     this.insertItem(this._oToolbar, 0);
        // } else if (this._isMobileTable) {
        //     this._oTable.setHeaderToolbar(this._oToolbar);
        // } else {
        //     this._oTable.addExtension(this._oToolbar);
        // }
        if (this._isMobileTable) {
            this._oTable.setHeaderToolbar(this._oToolbar);
        } else {
            this._oTable.addExtension(this._oToolbar);
        }
    };

    SmartTable.prototype._addActionFunctionButtonToToolbar = function () {
        let buttons = AnnotationHelper.getEntityBoundFunctionAction(this._EntitySet);
        if (!buttons) {
            return;
        }
        if (this._oActionFunctionButtons) {
            this._oActionFunctionButtons.some((btn) => {
                this._oToolbar.removeContent(btn);
            });
        }
        // if (this.getEditTogglable()) {
            if (!this._oActionFunctionButtons) {
                this._oActionFunctionButtons = [];
                var btnConfigModel = new JSONModel();
                this.setModel(btnConfigModel, "btnConfigModel");
                ['Action', 'Function'].some((act) => {
                    if (buttons[act] && buttons[act].some((btnConfig) => {
                        btnConfigModel.setProperty("/" + btnConfig.name, btnConfig.$Parameter.length);
                        let strtest = "{= (${sm4rtM0d3l>/selectedRow} === 1 && ${btnConfigModel>/" + btnConfig.name + "} > 1) || (${sm4rtM0d3l>/selectedRow} > 0 && ${btnConfigModel>/" + btnConfig.name + "} === 1)}";
                        var btn = new sap.m.Button({
                            text: btnConfig.text,
                            enabled: strtest,
                            press: this._actionFunctionPress.bind(this, btnConfig)
                        });
                        this._oActionFunctionButtons.push(btn);
                        this._oToolbar.addContent(btn);
                    })) {

                    }
                });
            }
        // }
    }

    SmartTable.prototype._actionFunctionPress = function (btnConfig) {
        var oDialogName = btnConfig.name + 'Dialog';
        if (!this[oDialogName]) {
            let _SmartFormAf = new SmartFormAF({
                config: btnConfig,
                annotationData: this._AnnotationData
            });

            this[oDialogName] = new sap.m.Dialog({
                title: btnConfig.text,
                contentWidth: "70%",
                contentHeight: "70%",
                draggable: true,
                resizable: true,
                content: [_SmartFormAf],
                beginButton: new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "执行",
                    press: function () {
                        _SmartFormAf.execute(this._oTable, this[oDialogName]);
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "取消",
                    press: function () {
                        _SmartFormAf.cancel(this[oDialogName]);
                    }.bind(this)
                })
            });
        }
        this[oDialogName].open();
    }

    SmartTable.prototype._addVariantManagementToToolbar = function () {
        if (this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
            // always remove content first
            this._oToolbar.removeContent(this._oVariantManagement);
            if (this.getUseVariantManagement()) {
                this._oToolbar.insertContent(this._oVariantManagement, 0);
                if (!this._oVariantManagement.isPageVariant()) {
                    this._oVariantManagement.setVisible(this.getShowVariantManagement());
                }
            }
        }
    };

    SmartTable.prototype._addSeparatorToToolbar = function () {
        // always remove content first
        if (this._oSeparator) {
            this._oToolbar.removeContent(this._oSeparator);
        }
        if (this.getHeader() && this.getUseVariantManagement() && this._oVariantManagement && !this._oVariantManagement.isPageVariant()) {
            if (!this._oSeparator) {
                this._oSeparator = new ToolbarSeparator(this.getId() + "-toolbarSeperator");
                // Hide ToolbarSeparator if VariantManagement button is hidden
                if (!this.getShowVariantManagement()) {
                    this._oSeparator.setVisible(false);
                }
            }
            this._oToolbar.insertContent(this._oSeparator, 0);
        }

        if (this._oToolbar) {
            this._oToolbar.addStyleClass("sapMTBHeader-CTX");
        }
    };

    SmartTable.prototype._addHeaderToToolbar = function () {
        // always remove content first
        if (this._headerText) {
            this._oToolbar.removeContent(this._headerText);
        }

        if (!this._headerText) {
            this._headerText = new Title(this.getId() + "-header");
            this._headerText.addStyleClass("sapMH4Style");
            this._headerText.addStyleClass("sapUiCompSmartTableHeader");
        }

        this._refreshHeaderText();
        this._oToolbar.insertContent(this._headerText, 0);
    };

    SmartTable.prototype.setCustomToolbar = function (oCustomToolbar) {
        this._oCustomToolbar = oCustomToolbar;
        return this;
    };

    SmartTable.prototype.getCustomToolbar = function () {
        return this._oCustomToolbar;
    };

    SmartTable.prototype._refreshHeaderText = function () {
        if (!this._headerText) {
            return;
        }

        if (!this._oNumberFormatInstance) {
            this._oNumberFormatInstance = NumberFormat.getFloatInstance();
        }

        var sText = this.getHeader();
        this._headerText.setVisible(!!sText);
        if (this.getShowRowCount()) {
            var iRowCount = parseInt(this._getRowCount(true));
            var sValue = this._oNumberFormatInstance.format(iRowCount);
            sText += " (" + sValue + ")";
        }

        this._headerText.setText(sText);
    };

    //获取table 行数
    SmartTable.prototype._getRowCount = function (bConsiderTotal) {
        var oRowBinding = this._getRowBinding();

        if (!oRowBinding) {
            return 0;
        }

        var iRowCount = 0;
        if (bConsiderTotal && oRowBinding.getTotalSize) {
            iRowCount = oRowBinding.getTotalSize();
        } else {
            iRowCount = oRowBinding.getLength();
        }

        if (iRowCount < 0 || iRowCount === "0") {
            iRowCount = 0;
        }

        return iRowCount;
    };

    SmartTable.prototype._getRowBinding = function () {
        if (this._oTable) {
            return this._oTable.getBinding(this._sAggregation);
        }
    };

    //添加table Toolbar
    SmartTable.prototype._addSpacerToToolbar = function () {
        var bFoundSpacer = false, aItems = this._oToolbar.getContent(), i, iLength;
        if (aItems) {
            iLength = aItems.length;
            i = 0;
            for (i; i < iLength; i++) {
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

    //添加设置列属性按钮
    SmartTable.prototype._addTablePersonalisationToToolbar = function () {
        if (this._oTablePersonalisationButton) {
            this._oToolbar.removeContent(this._oTablePersonalisationButton);
        }
        if (!this._oTablePersonalisationButton) {
            this._oTablePersonalisationButton = new sap.m.Button(jQuery.sap.uid() + this.getId() + "-btnPersonalisation", {
                icon: "sap-icon://action-settings",
                enabled: "{= !${sm4rtM0d3l>/editable}}",
                press: [
                    function (oEvent) {
                        this._oTPC.openDialog();
                    }, this
                ]
            });
        }
        this._oToolbar.addContent(this._oTablePersonalisationButton);
    };

    //排序 过滤 分组 P13
    SmartTable.prototype._addTableSortAndFilterAndGroupToToolbar = function () {
        if (this._oTableSortButton) {
            this._oToolbar.removeContent(this._oTableSortButton);
        }

        if (!this._oTableSortButton) {
            this._oTableSortButton = new OverflowToolbarButton(this.getId() + "-btnSort", {
                icon: "sap-icon://filter",
                enabled: "{= !${sm4rtM0d3l>/editable}}",
                press: [
                    function (oEvent) {
                        this._onPersonalizationDialogPress()
                    }, this
                ]
            });
        }
        this._oToolbar.addContent(this._oTableSortButton);
    };

    SmartTable.prototype._onPersonalizationDialogPress = function (oEvent) {
        var oPersonalizationDialog = sap.ui.xmlfragment("o3.library.control.smart.smarttableV2.dialog.PersonalizationDialog", this);
        this.addDependent(oPersonalizationDialog);
        this.getModel('columns').setProperty("/ShowResetEnabled", this._isChanged());
        oPersonalizationDialog.open();
    };

    //排序 过滤 分组 P13  确定
    SmartTable.prototype.onOK = function (oEvent) {
        var that = this;
        var oBinding = this._oTable.getBinding("items");
        this.errorItems = []; // 保存错误数据
        // sort & group-----------------
        var aSorter = [],
            groupId,
            groupItems = this.getModel("columns").getProperty("/groupItems"),
            fieldType = this.getModel("columns").getProperty("/fieldType"),
            isExistInSorterItem = false, // 用于判断分组字段是否在过滤字段中，不在则需根据分组字段，新建一个排序
            isGroupable = false;
        var _columns = that._oTable.getAggregation("columns");

        _columns.some(function (obj) {
            obj.setSortIndicator("None");
        });
        if (groupItems.length > 0) {
            groupId = groupItems[0].columnKey;
        }
        this.getModel("columns").getProperty("/sortItems").forEach(function (item, index) {
            if (item.columnKey === groupId) {
                isExistInSorterItem = true;
                // 设置分组名称
                let text,
                    enumrations = AnnotationHelper.isEnumeration(that._EntityType, item.columnKey);
                _columns.some(column => {
                    if (column.getVisible() && column.getId().includes(item.columnKey)) {
                        text = column.getHeader().getText()
                        isGroupable = true;
                        return true;
                    }
                });
                if (isGroupable) {
                    var sorterItem = new Sorter({
                        path: item.columnKey,
                        descending: item.operation === 'Descending',
                        group: function (oEvent) {
                            let arr = item.columnKey.split("/");
                            let groupName = oEvent.getValue();
                            arr.forEach(function (item) {
                                if (groupName)
                                    groupName = groupName[item];
                            });
                            if (groupName && fieldType[item.columnKey] === "datetime") {
                                return text + "： " + dayjs(groupName).format("YYYY-MM-DD HH:mm:ss");
                            } else if (enumrations) {
                                for (var k = 0; k < enumrations.length; k++) {
                                    if (enumrations[k].key === groupName) {
                                        return text + "： " + enumrations[k].value;
                                    }
                                }
                            } else {
                                return text + "： " + groupName;
                            }
                        }
                    });
                } else {
                    sap.m.MessageBox.warning("请选择相应的列后进行分组!");
                }

            } else {
                var sorterItem = new Sorter(item.columnKey, item.operation === 'Descending');
            }
            aSorter.push(sorterItem);

            // 过滤图标设置
            _columns.some(function (obj) {
                let _columnkey = item.columnKey;
                while (_columnkey.includes("/")) {
                    _columnkey = _columnkey.replace("/", "_");
                }
                if (obj.getId().indexOf(_columnkey) > -1) {
                    obj.setSortIndicator(item.operation);
                    return true;
                }
            });
        });
        if (!isExistInSorterItem && groupItems.length > 0) {
            let text,
                enumrations = AnnotationHelper.isEnumeration(that._EntityType, groupId);
            _columns.some(column => {
                if (column.getVisible() && column.getId().includes(groupId.replace("/", "_"))) {
                    text = column.getHeader().getText();
                    isGroupable = true;
                    return true;
                }
            });
            if (isGroupable) {
                aSorter.unshift(new Sorter({
                    path: groupId,
                    descending: false,
                    group: function (oEvent) {
                        let arr = groupId.split("/");
                        let groupName = oEvent.getValue();
                        arr.forEach(function (item) {
                            if (groupName)
                                groupName = groupName[item];
                        });
                        if (groupName && fieldType[groupId] === "datetime") {
                            return text + "： " + dayjs(groupName).format("YYYY-MM-DD HH:mm:ss");
                        } else if (enumrations) {
                            for (var k = 0; k < enumrations.length; k++) {
                                if (enumrations[k].key === groupName) {
                                    return text + "： " + enumrations[k].value;
                                }
                            }
                        } else {
                            return text + "： " + groupName;
                        }
                    }
                }));
            } else {
                sap.m.MessageBox.warning("请选择相应的列后进行分组!");
            }

        }
        oBinding.aSorters = aSorter;

        // filter-----------------
        var aFilter = [];
        if (this._oSmartFilter && this._oSmartFilter.getFilters()) { //判断filterBar是否存在过滤条件
            aFilter = this._oSmartFilter.getFilters();
        }
        var objEnum = {};
        this.getModel("columns").getProperty("/filterItems").forEach(function (item, index) {
            var value1 = item.value1,
                value2 = item.value2;

            // if (value1 instanceof Date) {
            if (value1 && fieldType[item.columnKey] === "datetime") {
                value1 = dayjs(value1).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
            }
            if (value2 && fieldType[item.columnKey] === "datetime") {
                value2 = dayjs(value2).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
            }
            // enumeration类型 包含命名空间
            if (value1.includes(that._NameSpace)) {
                if (!objEnum[item.columnKey]) {
                    objEnum[item.columnKey] = [];
                    objEnum[item.columnKey].push({ value: value1 });
                } else {
                    objEnum[item.columnKey].push({ value: value1 });
                }
            } else {
                var filterItem = new Filter({
                    path: item.columnKey,
                    operator: item.operation,
                    value1: value1,
                    value2: value2
                });
                aFilter.push(filterItem);
            }
        });
        // enumeration
        let enumArr = [], enumOr = [];
        for (var item in objEnum) {
            enumOr = []; // 置空~
            for (var i = 0; i < objEnum[item].length; i++) {
                var filterItem = new Filter({
                    path: item,
                    operator: "EQ",
                    value1: objEnum[item][i].value
                });
                enumOr.push(filterItem);
            }
            enumArr.push(new Filter(enumOr, false));
        }
        this._reBindTable();
        let mParameters = oBinding.mParameters;
        if (mParameters["$filter"]) {
            if (enumArr.length) {
                mParameters["$filter"] = mParameters["$filter"] + " and " + decodeURIComponent(ODataUtils.createFilterParams(enumArr).replace('$filter=', ''));
                oBinding.applyParameters(mParameters);
            }
        } else {
            if (enumArr.length) {
                mParameters["$filter"] = decodeURIComponent(ODataUtils.createFilterParams(enumArr).replace('$filter=', ''));
                oBinding.applyParameters(mParameters);
            }
        }
        oBinding.filter(aFilter, "application");

        // column-----------------
        let columnItems = $.extend(true, [], this.getModel("columns").getData().columnItems);
        let allColumnsItems = $.extend(true, [], this.getModel("columns").getData().allColumnsItems);

        for (let a of columnItems) {
            for (let b of allColumnsItems) {
                if (a.columnKey === b.columnKey) {
                    a.show = b.visible;
                }
            }
        }
        this.getModel('columns').setProperty("/columnItems", columnItems);
        this.getModel('oDataOk').setProperty("/", this.getModel('columns').getData());
        if (oEvent) {
            oEvent.getSource().close();
        }

        // 设置InfoToolBar
        var allFilterItem = this.getModel("columns").getProperty("/allFilterItem");
        var filterItems = this.getModel("columns").getProperty("/filterItems");
        var str = "过滤条件：";
        var obj = {};

        filterItems = filterItems.reduce((item, next) => {
            obj[next.columnKey] ? '' : obj[next.columnKey] = true && item.push(next)
            return item
        }, []);
        for (var i = 0; i < filterItems.length; i++) {
            for (var j = 0; j < allFilterItem.length; j++) {
                if (filterItems[i].columnKey === allFilterItem[j].columnKey) {
                    str = str + allFilterItem[j].text + "，";
                    break;
                }
            }
        }
        str = str.substring(0, str.lastIndexOf('，'));
        that.getModel("sm4rtM0d3l").setProperty("/infoToolBar", str);
        that.getModel("sm4rtM0d3l").setProperty("/infoToolBarVisible", filterItems.length > 0 ? true : false);
    };

    //cancel
    SmartTable.prototype.onCancel = function (oEvent) {
        this.getModel('columns').setProperty("/", jQuery.extend(true, [], this.getModel('oDataOk').getData()));
        oEvent.getSource().close();
        oEvent.getSource().destroy();
    };

    //reset
    SmartTable.prototype.onReset = function () {
        this.getModel('columns').setProperty("/", jQuery.extend(true, [], this.getModel('oDataInitial').getData()));
    };

    //添加Sort项
    SmartTable.prototype.onAddSortItem = function (oEvent) {
        var oParameters = oEvent.getParameters();
        var aSortItems = this.getModel("columns").getProperty("/sortItems");
        oParameters.index > -1 ? aSortItems.splice(oParameters.index, 0, {
            columnKey: oParameters.sortItemData.getColumnKey(),
            operation: oParameters.sortItemData.getOperation()
        }) : aSortItems.push({
            columnKey: oParameters.sortItemData.getColumnKey(),
            operation: oParameters.sortItemData.getOperation()
        });
        this.getModel("columns").setProperty("/sortItems", aSortItems);
        this.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
    };

    //移除Sort项
    SmartTable.prototype.onRemoveSortItem = function (oEvent) {
        var oParameters = oEvent.getParameters();
        if (oParameters.index > -1) {
            var aSortItems = this.getModel("columns").getProperty("/sortItems");
            aSortItems.splice(oParameters.index, 1);
            this.getModel("columns").setProperty("/sortItems", aSortItems);
        }
        this.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
    };

    //添加filter项
    SmartTable.prototype.onAddFilterItem = function (oEvent) {
        var oParameters = oEvent.getParameters();
        var aFilterItems = this.getModel("columns").getProperty("/filterItems");

        var keyField = oEvent.getSource().getConditions()[oEvent.getSource().getConditions().length - 1].keyField,
            fieldType = this.getModel("columns").getProperty("/fieldType");

        if (fieldType[keyField] === "datetime") {
            oParameters.index > -1 ? aFilterItems.splice(oParameters.index, 0, {
                columnKey: oParameters.filterItemData.getColumnKey(),
                operation: oParameters.filterItemData.getOperation(),
                // value1: oParameters.filterItemData.getValue1() ? dayjs(oParameters.filterItemData.getValue1()).format("YYYY-MM-DD") : "",
                // value2: oParameters.filterItemData.getValue2() ? dayjs(oParameters.filterItemData.getValue2()).format("YYYY-MM-DD") : ""
                value1: oParameters.filterItemData.getValue1(),
                value2: oParameters.filterItemData.getValue2()
            }) : aFilterItems.push({
                columnKey: oParameters.filterItemData.getColumnKey(),
                operation: oParameters.filterItemData.getOperation(),
                value1: oParameters.filterItemData.getValue1(),
                value2: oParameters.filterItemData.getValue2()
            });
        } else if (fieldType[keyField] === "select") {
            oParameters.index > -1 ? aFilterItems.splice(oParameters.index, 0, {
                columnKey: oParameters.filterItemData.getColumnKey(),
                operation: oParameters.filterItemData.getOperation(),
                value1: oParameters.filterItemData.getValue1()
            }) : aFilterItems.push({
                columnKey: oParameters.filterItemData.getColumnKey(),
                operation: oParameters.filterItemData.getOperation(),
                value1: oParameters.filterItemData.getValue1(),
                value2: oParameters.filterItemData.getValue2()
            });
        } else {
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
        }

        this.getModel("columns").setProperty("/filterItems", aFilterItems);
        this.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
    };

    //删除filter项
    SmartTable.prototype.onRemoveFilterItem = function (oEvent) {
        var oParameters = oEvent.getParameters();
        if (oParameters.index > -1) {
            var aFilterItems = this.getModel("columns").getProperty("/filterItems");
            aFilterItems.splice(oParameters.index, 1);
            this.getModel("columns").setProperty("/filterItems", aFilterItems);
        }
        this.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
    };

    //添加group项
    SmartTable.prototype.onAddGroupItem = function (oEvent) {
        var oParameters = oEvent.getParameters();
        var aGroupItems = this.getModel("columns").getProperty("/groupItems");
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
        this.getModel("columns").setProperty("/groupItems", aGroupItems);
        this.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
    };

    //删除group项
    SmartTable.prototype.onRemoveGroupItem = function (oEvent) {
        var oParameters = oEvent.getParameters();
        if (oParameters.index > -1) {
            var aGroupItems = this.getModel("columns").getProperty("/groupItems");
            aGroupItems.splice(oParameters.index, 1);
            this.getModel("columns").setProperty("/groupItems", aGroupItems);
        }
        this.getModel("columns").setProperty("/ShowResetEnabled", this._isChanged());
    };

    //判断Sort是否有修改
    SmartTable.prototype._isChangedSortItems = function () {
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

        var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.getModel("oDataInitial").getProperty("/sortItems")), this.getModel("columns").getProperty("/sortItems"));
        var aDataInitialTotal = jQuery.extend(true, [], this.getModel("oDataInitial").getProperty("/sortItems"));
        return !fnIsEqual(aDataTotal, aDataInitialTotal);
    }

    //判断Filter是否有修改
    SmartTable.prototype._isChangedFilterItems = function () {
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

        var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.getModel("oDataInitial").getProperty("/filterItems")), this.getModel("columns").getProperty("/filterItems"));
        var aDataInitialTotal = jQuery.extend(true, [], this.getModel("oDataInitial").getProperty("/filterItems"));
        return !fnIsEqual(aDataTotal, aDataInitialTotal);
    };

    //判断Group是否有修改
    SmartTable.prototype._isChangedGroupItems = function () {
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

        var aDataTotal = fnGetUnion(jQuery.extend(true, [], this.getModel("oDataInitial").getProperty("/groupItems")), this.getModel("columns").getProperty("/groupItems"));
        var aDataInitialTotal = jQuery.extend(true, [], this.getModel("oDataInitial").getProperty("/groupItems"));
        return !fnIsEqual(aDataTotal, aDataInitialTotal);
    };

    //判断P13是否有条件修改
    SmartTable.prototype._isChanged = function () {
        return this._isChangedSortItems() || this._isChangedFilterItems() || this._isChangedGroupItems();
    };

    SmartTable.prototype.setHeader = function (sText) {
        var sOldText = this.getProperty("header"), bPreventUpdateContent;
        this.setProperty("header", sText, true);
        if (this.bIsInitialised && this._oToolbar) {
            // Update Toolbar content to show/hide separator only if text changes from empty to some value -or- from some value to empty
            // else there could be a re-render triggered on the inner table!
            bPreventUpdateContent = (!sOldText === !sText);
            if (!bPreventUpdateContent) {
                this._createToolbarContent();
            } else {
                this._refreshHeaderText();
            }
        }
        return this;
    };

    SmartTable.prototype.setShowRowCount = function (bShow) {
        this.setProperty("showRowCount", bShow, true);
        this._refreshHeaderText();
        return this;
    };

    //监听smarfilterbar
    SmartTable.prototype._listenToSmartFilter = function () {
        var sSmartFilterId, sInitialNoDataText, bWithFilterBar = false;
        // Register for SmartFilter Search
        sSmartFilterId = this.getSmartFilterId();
        this._oSmartFilter = this._findControl(sSmartFilterId, "o3.library.control.smart.smartfilterbar.SmartFilterBar");

        if (this._oSmartFilter) {
            // this._oSmartFilter.attachSearch(this._reBindTable, this);
            this._oSmartFilter.attachSearch(this.rebindTable, this);
            this._oSmartFilter.attachFilterChange(this._filterChangeEvent, this);
            bWithFilterBar = true;
        }
    };

    //监听filterbar change事件
    SmartTable.prototype._filterChangeEvent = function () {
        if (this._isTableBound() && this._oSmartFilter && this._oSmartFilter.onGetFiltersWithValues().length) {//  && !this._oSmartFilter.getLiveMode() && !this._oSmartFilter.isDialogOpen()
            // if (this._isTableBound() && this._oSmartFilter && !this._oSmartFilter.isDialogOpen()) {
            this._showOverlay(true);
        }
    };

    SmartTable.prototype._isTableBound = function () {
        if (this._bIsTableBound) {
            return true;
        }
        if (this._oTable) {
            return this._oTable.isBound(this._sAggregation);
        }
        return false;
    };

    //table遮罩
    SmartTable.prototype._showOverlay = function (bShow) {
        // if (bShow) {
        //     var oOverlay = {
        //         show: true
        //     };
        //     this.fireShowOverlay({
        //         overlay: oOverlay
        //     });
        //     bShow = oOverlay.show;
        // }

        this._oTable.setShowOverlay(bShow);
        this._oToolbar.setEnabled(!bShow);
    };

    SmartTable.prototype.rebindTable = function (bForceRebind) {
        // this._reBindTable(null, bForceRebind);
        this.onOK();
    };

    SmartTable.prototype._reBindTable = function (mEventParams, bForceRebind) {
        var oBinding = this._oTable.getBinding("items");
        // rebind之前先删除所有的enum filter
        if (oBinding.mParameters["$filter"]) {
            delete oBinding.mParameters.$filter;
            oBinding.applyParameters(oBinding.mParameters);
        }
        if (this._oSmartFilter) {
            let enumTypeFiltersLength = this._oSmartFilter.getEnumTypeFilters() ? this._oSmartFilter.getEnumTypeFilters().length : 0,
                lanmadaAnEnumFiltersLenght = this._oSmartFilter.getLanmadaAnEnumFilters() ? this._oSmartFilter.getLanmadaAnEnumFilters().length : 0;
            let enumTypeFilterStr = "", lanmadaAnEnumFilterStr = "";

            if (enumTypeFiltersLength || lanmadaAnEnumFiltersLenght) {
                let mParameters = oBinding.mParameters;

                if (enumTypeFiltersLength) {
                    enumTypeFilterStr = ODataUtils.createFilterParams(this._oSmartFilter.getEnumTypeFilters());
                }
                if (lanmadaAnEnumFiltersLenght) {
                    let lanmadaAnEnumFilters = this._oSmartFilter.getLanmadaAnEnumFilters();
                    for (var i = 0; i < lanmadaAnEnumFilters.length; i++) {
                        let aFilters = lanmadaAnEnumFilters[i].oCondition.aFilters;
                        let vaiable, key, lefStr = "";
                        if (aFilters.length === 1) {
                            vaiable = aFilters[0].sPath.split("/")[0];
                            key = aFilters[0].sPath.split("/")[1];
                            lefStr = lanmadaAnEnumFilters[i].sPath + "/any(" + vaiable + ":" + vaiable + "/" + key + " eq " + aFilters[0].oValue1 + ")";
                        } else {
                            vaiable = aFilters[0].sPath.split("/")[0];
                            key = aFilters[0].sPath.split("/")[1];
                            for (var j = 0; j < aFilters.length; j++) {
                                if (j === 0) {
                                    lefStr = lanmadaAnEnumFilters[i].sPath + "/any(" + vaiable + ":" + vaiable + "/" + key + " eq " + aFilters[0].oValue1;
                                } else {
                                    lefStr = lefStr + " or " + vaiable + "/" + key + " eq " + aFilters[j].oValue1;
                                }
                            }
                            lefStr = lefStr + ")";
                        }
                        if (i < lanmadaAnEnumFilters.length - 1) {
                            lanmadaAnEnumFilterStr = lanmadaAnEnumFilterStr + "(" + lefStr + ") and ";
                        } else {
                            lanmadaAnEnumFilterStr = lanmadaAnEnumFilterStr + "(" + lefStr + ")";
                        }
                    }
                }
                if (enumTypeFiltersLength && !lanmadaAnEnumFiltersLenght) {
                    mParameters["$filter"] = decodeURIComponent(enumTypeFilterStr.replace('$filter=', ''));
                }
                if (!enumTypeFiltersLength && lanmadaAnEnumFiltersLenght) {
                    mParameters["$filter"] = lanmadaAnEnumFilterStr;
                }
                if (enumTypeFiltersLength && lanmadaAnEnumFiltersLenght) {
                    mParameters["$filter"] = "(" + decodeURIComponent(enumTypeFilterStr.replace('$filter=', '')) + ") and " + lanmadaAnEnumFilterStr;
                }
                oBinding.applyParameters(mParameters);
            } else {
                let mParameters = oBinding.mParameters;
                delete oBinding.mParameters.$filter;
                oBinding.applyParameters(mParameters);
            }
            this._bIsTableBound = true;
        }
        if (this._isMobileTable) {
            // this.onOK();
        }
        this._showOverlay(false);
    };

    //查找控件
    SmartTable.prototype._findControl = function (sId, sType) {
        var oResultControl, oView;
        if (sId) {
            oResultControl = Core.byId(sId);
            if (!oResultControl || !oResultControl.isA(sType)) {
                oView = this._getView();
                if (oView) {
                    oResultControl = oView.byId(sId);
                }
            }
        }

        return oResultControl;
    };

    SmartTable.prototype._getView = function () {
        if (!this._oView) {
            var oObj = this.getParent();
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

    //工具栏添加 导出EXCEL功能按钮
    SmartTable.prototype._addExportToExcelToToolbar = function () {

        if (!this.getUseExportToExcel()) {
            return;
        }

        if (!this._oUseExportToExcel) {
            this._oUseExportToExcel = new OverflowToolbarButton(this.getId() + "-btnExcelExport", {
                icon: "sap-icon://excel-attachment",
                enabled: "{= !${sm4rtM0d3l>/editable}}",
                press: [
                    function (oEvent) {
                        this._exportToExcel()
                    }, this
                ]
            });
        }
        this._oToolbar.addContent(this._oUseExportToExcel);
    };

    //确定导出
    SmartTable.prototype._exportToExcel = function () {
        var aCols = [], oSettings, oSheet, dataUrl, expand = '', expandArr = {};

        this._getTablePersoDialogColumns().map((item, index) => {
            let Column = item.id.replace('_', '/').split('-')[2].replace('_', '/').replace('_', '/');
            let _expand = Column.split('/');
            let length = _expand.length;
            if (length === 2) {
                if (!expandArr[_expand[0]]) {
                    expandArr[_expand[0]] = [];
                }
            }
            if (length === 3) {
                if (!expandArr[_expand[0]]) {
                    expandArr[_expand[0]] = [];
                    expandArr[_expand[0]].push(_expand[1]);
                } else {
                    if (!expandArr[_expand[0]][_expand[1]]) {
                        expandArr[_expand[0]].push(_expand[1]);
                    }
                }
            }

            if (item.visible) {
                var property = Column
                aCols.push({
                    label: item.text,
                    property: property
                })
            }
        });

        for (var item in expandArr) {
            if (expandArr[item].length) {
                let selectStr = item + "($expand=";
                for (var i = 0; i < expandArr[item].length; i++) {
                    selectStr += expandArr[item][i] + ",";
                }
                selectStr = selectStr.substring(0, selectStr.lastIndexOf(',')) + ")"
                expand += selectStr + ",";
            } else {
                expand += item + ",";
            }
        }
        expand = expand.substring(0, expand.lastIndexOf(','));

        let filter = this._oTable.getBinding("items").mCacheQueryOptions.$filter;

        dataUrl = this.getModel().sServiceUrl + this.getEntitySet();

        //请求路径
        if (expand && filter) {
            dataUrl = dataUrl + '?$expand=' + expand + "&$filter=" + filter;
        } else if (expand) {
            dataUrl = dataUrl + '?$expand=' + expand;
        } else if (filter) {
            dataUrl = dataUrl + "?$filter=" + filter;
        }

        // 没有走到 beforeSend 方法中，手动拼
        let ownerComponent = this._oView.getController().getOwnerComponent(), edmConfigPath;
        if (ownerComponent) {
            edmConfigPath = ownerComponent.getManifest()["sap.app"].dataSources.edmConfig;
        } else {
            MessageBox.show("导出失败，请尝试清新导出或联系管理员！")
            return;
        }
        dataUrl += dataUrl.match(/\?/) ? "&" : "?";
        dataUrl += "app=" + edmConfigPath + "&userTenantId=" + o3Tool.cookie('userTenantId')

        let serviceUrl = this.getModel().sServiceUrl;
        serviceUrl += serviceUrl.match(/\?/) ? "&" : "?";
        serviceUrl += "app=" + edmConfigPath + "&userTenantId=" + o3Tool.cookie('userTenantId');

        oSettings = {
            workbook: {
                columns: aCols,
                context: {
                    sheetName: `this is ${this._EntitySet} list`,
                }
            },
            dataSource: {
                type: 'OData',
                dataUrl: dataUrl,
                serviceUrl: serviceUrl,
                headers: {
                    "Accept": "application/json",
                    "Accept-Language": "zh-CN",
                    "Authorization": o3Tool.cookie('Authorization')
                },
                count: this._oTable.getGrowingInfo().total,
            },
            fileName: `${this._EntitySet}.xlsx`
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
            oSheet.destroy();
        });
    };

    SmartTable.prototype._addEditTogglableToToolbar = function () {
        var model = this.getModel();
        if (this._oEditButton) {
            this._oToolbar.removeContent(this._oEditButton);
        }
        if (this.getEditTogglable()) {
            if (!this._oEditButton) {
                this._oEditButton = new sap.m.Button(this.getId() + "-btnEditToggle", {
                    text: "编辑",
                    press: [
                        function () {
                            var bEditable = this.getEditable();
                            bEditable = !bEditable;
                            // this.setEditable(bEditable, true);
                            this.setProperty("editable", bEditable, true)
                            this.fireEditToggled({
                                editable: bEditable
                            });

                            if (!bEditable) {
                                //重新绘制table column内容
                                //this._oTemplate.destroy()
                                // console.log('_addEditTogglableToToolbar===>重新绘制table column内容')
                                // this._setTableColumns()
                                if (model.hasPendingChanges()) {
                                    let updateGroupId = this._oTable.getBinding("items").getUpdateGroupId();
                                    model.resetChanges(updateGroupId);
                                }
                                this._oTable.bActiveHeaders = true; // header不可排序
                            } else {
                                this._oTable.bActiveHeaders = false; // header可排序
                            }
                            if (this._isMobileTable && this.getUseNavigation()) {
                                this.getModel("sm4rtM0d3l").setProperty("/isNavigation", !bEditable ? "Navigation" : "Inactive");
                            }

                            this.getModel("sm4rtM0d3l").setProperty("/editable", bEditable);
                            this._oEditButton.setText(!bEditable ? "编辑" : "取消")
                            this.setProperty("editTogglable", !bEditable, true);
                            if (this.getMode() === "MultiSelect")
                                this._oTable.setMode(bEditable ? "None" : "MultiSelect");
                        }, this
                    ]
                });
            }
            this._oToolbar.addContent(this._oEditButton);
        }
    };

    SmartTable.prototype._addSaveToToolbar = function () {
        var that = this;
        if (this._oSaveButton) {
            this._oToolbar.removeContent(this._oSaveButton);
        }
        if (this.getEditTogglable()) {
            if (!this._oSaveButton) {
                this._oSaveButton = new sap.m.Button(this.getId() + "-btnSaveToggle", {
                    text: "保存",
                    visible: "{=${sm4rtM0d3l>/editable}}",
                    // enabled: "{= ${message>/}.length === 0}",
                    press: [
                        function () {
                            if (this.errorItems.length !== 0) {
                                sap.m.MessageBox.error("Invalid entry");
                                return;
                            }
                            var dialog = new sap.m.Dialog({
                                title: 'Warning',
                                type: 'Message',
                                state: 'Warning',
                                content: new sap.m.Text({
                                    text: '是否确定修改?'
                                }),
                                beginButton: new sap.m.Button({
                                    text: '确定',
                                    press: function () {
                                        var model = that._oTable.getModel();
                                        model.submitBatch("update").then(function (oEvent) {
                                            var bHasErrors = model.hasPendingChanges("update");
                                            if (bHasErrors) {
                                                sap.m.MessageBox.error("更新失败,请重新操作!");
                                            } else {
                                                //重新绘制table column内容
                                                that.setEditable(false);
                                                that.fireEditToggled({
                                                    editable: that.getEditable()
                                                });
                                                that._oEditButton.setText("编辑")
                                                that.getModel("sm4rtM0d3l").setProperty("/editable", false);
                                                that._oTemplate.destroy()
                                                that._setTableColumns()

                                                sap.m.MessageToast.show("修改成功!")
                                            }
                                        }.bind(this)).catch(function (oEvent) {
                                            sap.m.MessageBox.error(oEvent);
                                        }.bind(this));
                                        dialog.close();
                                    }
                                }),
                                endButton: new sap.m.Button({
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
                        }, this
                    ]
                });
            }
            this._oToolbar.addContent(this._oSaveButton);
        }
    };

    SmartTable.prototype._addCreateTogglableToToolbar = function () {
        if (this._oCreateButton) {
            this._oToolbar.removeContent(this._oCreateButton);
        }
        if (!this._oCreateButton) {
            this._oCreateButton = new sap.m.Button(this.getId() + "-btnCreateToggle", {
                text: '创建',
                enabled: "{= !${sm4rtM0d3l>/editable}}",
                visible: this.getCreatable() || this.getQuickCreatable(),
                press: [
                    function () {
                        if (this.getQuickCreatable()) {
                            this.openQuickCreateFormDialog();
                        } else {
                            var bCreatable = this.getCreatable();
                            bCreatable = !bCreatable;
                            this.setCreatable(bCreatable, true);
                            this.fireCreateToggled({
                                creatable: bCreatable
                            });
                        }
                    }, this
                ]
            });
        }
        this._oToolbar.addContent(this._oCreateButton);
    };

    SmartTable.prototype.openQuickCreateFormDialog = function () {
        if (!this.oSmartForm) {
            this.oSmartForm = new SmartForm({
                quickCreateSet: this.getEntitySet()
            });
        }
        if (!this.oQuickCreateDialog) {
            this.oQuickCreateDialog = new sap.m.Dialog({
                title: "创建" + this.getHeader(),
                showHeader: true,
                contentWidth: "500px",
                contentHeight: "80%",
                resizable: true,
                draggable: true,
                beginButton: new sap.m.Button({
                    text: "创建",
                    press: function () {
                        if (!this.oSmartForm.check()) {
                            this.oSmartForm.quickCreateSave(function () {
                                this.rebindTable();
                            }.bind(this));
                            this.oQuickCreateDialog.close();
                        }
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "取消",
                    press: function () {
                        this.oQuickCreateDialog.close();
                        this.oSmartForm.clearFormData();
                        this.oSmartForm.destroy();
                        this.oSmartForm = null;
                        this.oQuickCreateDialog.destroy();
                        this.oQuickCreateDialog = null;
                    }.bind(this)
                }),
                content: [this.oSmartForm]
            });
        }
        this.addDependent(this.oQuickCreateDialog);
        this.oQuickCreateDialog.open();
    };

    SmartTable.prototype.exit = function () {
        this.bIsInitialised = null;
        this._oTPC.getTablePersoDialog().destroy();
        this._oTPC = null;
        // Cleanup smartFilter events as it can be used again stand-alone without being destroyed!
        if (this._oSmartFilter) {
            this._oSmartFilter.detachSearch(this._reBindTable, this);
            this._oSmartFilter.detachFilterChange(this._filterChangeEvent, this);
            this._oSmartFilter = null;
        }
        if (this._oTPC && this._oTPC.destroy) {
            this._oTPC.destroy();
        }
        this._oTPC = null;

        if (this._oVariantManagement && this._oVariantManagement.destroy) {
            this._oVariantManagement.destroy();
        }

        this._oNumberFormatInstance = null;

        if (this._oEditModel) {
            this._oEditModel.destroy();
        }
        if (this.getModel("oDataInitial")) {
            this.getModel("oDataInitial").destroy();
        }
        if (this.getModel("columns")) {
            this.getModel("columns").destroy();
        }
        if (this.getModel("oDataOk")) {
            this.getModel("oDataOk").destroy();
        }
        this._mFieldMetadataByKey = null;
        this._oEditModel = null;
        this._oVariantManagement = null;
        this._aExistingColumns = null;
        this._mLazyColumnMap = null;
        this._aColumnKeys = null;
        this._aDeactivatedColumns = null;
        this._aAlwaysSelect = null;
        this._oCustomToolbar = null;
        this._headerText = null;
        // Destroy the toolbar if it is not already inserted into items; else it will automatically be destroyed
        if (this._oToolbar && !this._bToolbarInsertedIntoItems) {
            this._oToolbar.destroy();
        }
        this._oToolbar = null;
        if (this._oUseExportToExcel && !this.getUseExportToExcel()) {
            this._oUseExportToExcel.destroy();
        }
        this._oUseExportToExcel = null;
        this._oTablePersonalisationButton = null;
        if (this._oTemplate) {
            this._oTemplate.destroy();
        }
        this._oTemplate = null;
        this._oView = null;
        this._oTable = null;
        this._propertyFields = null;
    }

    return SmartTable;
});