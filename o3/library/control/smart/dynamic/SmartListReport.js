sap.ui.define([
    'sap/f/DynamicPage',
    'o3/library/control/smart/smartfilterbar/SmartFilterBar',
    'o3/library/control/smart/variants/SmartVariantManagement',
    'o3/library/control/smart/smarttableV2/SmartTable'
], function (DynamicPage, SmartFilterBar, SmartVariantManagement, SmartTable) {
    "use strict";

    var SmartListReport = DynamicPage.extend('o3.library.control.smart.dynamic.SmartListReport', {
        metadata: {
            properties: {
                entitySet: { type: "string", group: "Misc" },
                showVariant: { type: "boolean", defaultValue: false },
                filterBarConfigurations: { type: "string", group: "Misc" },
                tableHeader: { type: "string", group: "Misc" },
                initiallyVisibleFields: { type: "string", group: "Misc" },
                quickCreatable: { type: "boolean", defaultValue: false },
                useNavigation: { type: "boolean", defaultValue: false },
                mode: { type: "string", group: "Misc", defaultValue: "None" },
                deletable: { type: "boolean", defaultValue: false },
                editTogglable: { type: "boolean", defaultValue: false },
                creatable: { type: "boolean", defaultValue: false },
                useExportToExcel: { type: "boolean", group: "Misc", defaultValue: true }
            }
        },
        init: function () {
            DynamicPage.prototype.init.apply(this, arguments);
            this.initailized = false;
            this._oConfigurations = {};
            this.oController = undefined;
        },
        renderer: function (oRm, oControl) {
            sap.f.DynamicPageRenderer.render(oRm, oControl);
            if (!oControl.initailized) {
                oControl.initailized = true;
                oControl.initConfigurations();
                oControl.initDynamicPage();
            }
        }
    });

    SmartListReport.prototype.initConfigurations = function () {
        var oList = {
            entitySet: this.getEntitySet(),
            variant: {
                visible: this.getShowVariant()
            },
            filterBar: {
                configurations: this.getFilterBarConfigurations()
            },
            table: {
                header: this.getTableHeader(),
                initiallyVisibleFields: this.getInitiallyVisibleFields(),
                quickCreatable: this.getQuickCreatable(),
                useNavigation: this.getUseNavigation(),
                mode: this.getMode(),
                deletable: this.getDeletable(),
                editTogglable: this.getEditTogglable(),
                creatable: this.getCreatable(),
                useExportToExcel: this.getUseExportToExcel(),
                route: {}
            }
        };
        this._oConfigurations = this.getDefaultConfigurations(oList);
    };

    // 返回配置
    SmartListReport.prototype.getConfigurations = function () {
        return this._oConfigurations;
    };

    SmartListReport.prototype._getView = function () {
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

    SmartListReport.prototype.getDefaultConfigurations = function (configurations) {
        var _showRowCount = true,
            _editTogglable = true,
            _useNavigation = true,
            _growingScrollToLoad = true,
            _creatable = true,
            _deletable = true,
            _visibleVariant = true,
            _quickCreatable = false,
            _useExportToExcel = true;

        if (configurations.table.showRowCount !== undefined && !configurations.table.showRowCount) {
            _showRowCount = false;
        }
        if (configurations.table.editTogglable !== undefined && !configurations.table.editTogglable) {
            _editTogglable = false;
        }
        if (configurations.table.useNavigation !== undefined && !configurations.table.useNavigation) {
            _useNavigation = false;
        }
        if (configurations.table.growingScrollToLoad !== undefined && !configurations.table.growingScrollToLoad) {
            _growingScrollToLoad = false;
        }
        if (configurations.table.creatable !== undefined && !configurations.table.creatable) {
            _creatable = false;
        }
        if (configurations.table.deletable !== undefined && !configurations.table.deletable) {
            _deletable = false;
        }
        if (configurations.table.quickCreatable) {
            _quickCreatable = true;
        }
        if (configurations.table.useExportToExcel !== undefined && !configurations.table.useExportToExcel) {
            _useExportToExcel = false;
        }
        // _visibleVariant = undefined 时，不显示变式管理
        if (configurations.variant.visible === false) {
            _visibleVariant = undefined;
        } else {
            _visibleVariant = configurations.variant.id || "Variants";
        }
        var obj = {
            variant: {
                id: _visibleVariant,
                entitySet: configurations.variant.entitySet || configurations.entitySet
            },
            filterBar: {
                id: configurations.filterBar.id || "smartFilterBar",
                entitySet: configurations.filterBar.entitySet || configurations.entitySet,
                smartVariant: configurations.filterBar.smartVariant || "Variants",
                configurations: configurations.filterBar.configurations
            },
            table: {
                entitySet: configurations.table.entitySet || configurations.entitySet,
                header: configurations.table.header,
                smartFilterId: configurations.table.smartFilterId || "smartFilterBar",
                showRowCount: _showRowCount,
                editTogglable: _editTogglable,
                useNavigation: _useNavigation,
                growingScrollToLoad: _growingScrollToLoad,
                growingThreshold: configurations.table.growingThreshold || 20,
                creatable: _creatable,
                mode: configurations.table.mode || "MultiSelect",
                deletable: _deletable,
                initiallyVisibleFields: configurations.table.initiallyVisibleFields,
                createToggled: configurations.table.createToggled || "onCreateBtnPress",
                columnItemPress: configurations.table.columnItemPress || "onColumnItemPress",
                quickCreatable: _quickCreatable,
                useExportToExcel: _useExportToExcel,
                route: {
                    toDetail: configurations.table.route.toDetail || "Detail",
                    parameter1: configurations.table.route.parameter1 || "detail",
                    create: configurations.table.route.create || "Create"
                }
            }
        };
        return obj;
    };

    SmartListReport.prototype.initDynamicPage = function (configurations) {
        var configurations = this.getConfigurations();
        var oView = this._getView();
        if (oView) {
            this.oController = oView.getController();
            // 设置controller中的方法
            this.setControllerMethod(configurations);
            this.setDynamicPageProperty(configurations);
        }
    };

    SmartListReport.prototype.setDynamicPageProperty = function (configurations) {
        var tableProperty = configurations.table, filterBarProperty = configurations.filterBar, variantProperty = configurations.variant;

        if (variantProperty && variantProperty.id && variantProperty.entitySet) {
            this.setTitle(new sap.f.DynamicPageTitle({
                heading: new SmartVariantManagement(configurations.id, {
                    entitySet: variantProperty.entitySet
                })
            }));
        }
        if (filterBarProperty) {
            this.setHeader(new sap.f.DynamicPageHeader({
                content: [
                    new SmartFilterBar(filterBarProperty.id, {
                        entitySet: filterBarProperty.entitySet,
                        smartVariant: filterBarProperty.smartVariant,
                        configurations: filterBarProperty.configurations
                    })
                ]
            }));
        }
        if (tableProperty) {
            var obj = {
                smartFilterId: tableProperty.smartFilterId,
                entitySet: tableProperty.entitySet,
                header: tableProperty.header,
                showRowCount: tableProperty.showRowCount,
                editTogglable: tableProperty.editTogglable,
                useNavigation: tableProperty.useNavigation,
                columnItemPress: this.oController[tableProperty.columnItemPress] ? this.oController[tableProperty.columnItemPress].bind(this.oController) : this.oController[tableProperty.columnItemPress],
                growingScrollToLoad: tableProperty.growingScrollToLoad,
                growingThreshold: tableProperty.growingThreshold,
                creatable: tableProperty.creatable,
                createToggled: this.oController[tableProperty.createToggled] ? this.oController[tableProperty.createToggled].bind(this.oController) : this.oController[tableProperty.createToggled],
                mode: tableProperty.mode,
                deletable: tableProperty.deletable,
                initiallyVisibleFields: tableProperty.initiallyVisibleFields,
                quickCreatable: tableProperty.quickCreatable,
                useExportToExcel: tableProperty.useExportToExcel
            }
            this.setContent(new SmartTable(obj));
            this.addStyleClass("sapUiResponsiveContentPadding"); // 正解
        }
    };

    SmartListReport.prototype.setControllerMethod = function (configurations) {
        var that = this;

        this.oController.oRouter = sap.ui.core.UIComponent.getRouterFor(this.oController);

        // 跳转到创建页面
        if (configurations.table.createToggled) {
            this.oController[configurations.table.createToggled] = function () {
                that.oController.oRouter.navTo(configurations.table.route.create, false);
            }
        }

        // 行点击事件
        if (configurations.table.columnItemPress) {
            this.oController[configurations.table.columnItemPress] = function (oEvent) {
                var obj = {};
                // var targetName = that.oController.appModel.getProperty("/list/table/route/toDetail");
                // var parameter1 = that.oController.appModel.getProperty("/list/table/route/parameter1");
                var parameter1 = configurations.table.route.parameter1;
                var oDataID = oEvent.getParameter("columnItem")["@odata.id"];

                obj[parameter1] = oDataID;
                // that.oController.oRouter.navTo(targetName, obj, false);
                that.oController.oRouter.navTo(configurations.table.route.toDetail, obj, false);
            }
        }
    };

    return SmartListReport;
});