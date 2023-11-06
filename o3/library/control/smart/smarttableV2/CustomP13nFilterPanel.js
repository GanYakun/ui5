sap.ui.define([
    'sap/m/library',
    'sap/m/P13nFilterPanel',
    'o3/library/control/smart/smarttableV2/CustomP13nConditionPanel'
], function (library, P13nFilterPanel, CustomP13nConditionPanel) {
    "use strict";
    var P13nPanelType = library.P13nPanelType;

    const CustomP13nFilterPanel = P13nFilterPanel.extend("o3.library.control.smart.smarttableV2.CustomP13nFilterPanel", {
        metadata: {
            library: "o3.library.control.smart.smarttableV2"
        },
        renderer(oRm, oControl) {
            oRm.openStart("section", oControl);
            oRm.class("sapMFilterPanel");
            oRm.openEnd();

            oRm.openStart("div");
            oRm.class("sapMFilterPanelContent");
            oRm.class("sapMFilterPanelBG");
            oRm.openEnd();

            oControl.getAggregation("content").forEach(function (oChildren) {
                oRm.renderControl(oChildren);
            });

            oRm.close("div");
            oRm.close("section");
        }
    });

    CustomP13nFilterPanel.prototype.init = function () {
        this.setType(P13nPanelType.filter);
        this.setTitle(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("FILTERPANEL_TITLE"));

        sap.ui.getCore().loadLibrary("sap.ui.layout");

        this._aKeyFields = [];

        // init some resources
        this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

        this._aIncludeOperations = {};
        this._aExcludeOperations = {};

        // 设置可以选择的操作符
        if (!this._aIncludeOperations["select"]) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ
            ], "select");
        }

        this._oIncludePanel = new sap.m.Panel({
            expanded: true,
            expandable: true,
            headerText: this._oRb.getText("FILTERPANEL_INCLUDES"),
            width: "auto"
        }).addStyleClass("sapMFilterPadding");

        this._oIncludeFilterPanel = new CustomP13nConditionPanel({
            maxConditions: this.getMaxIncludes(),
            alwaysShowAddIcon: false,
            layoutMode: this.getLayoutMode(),
            dataChange: this._handleDataChange()
        });
        this._oIncludeFilterPanel._sAddRemoveIconTooltipKey = "FILTER";

        this._oIncludePanel.addContent(this._oIncludeFilterPanel);

        this.addAggregation("content", this._oIncludePanel);

        this._oExcludePanel = new sap.m.Panel({
            expanded: false,
            expandable: true,
            headerText: this._oRb.getText("FILTERPANEL_EXCLUDES"),
            width: "auto"
        }).addStyleClass("sapMFilterPadding");

        this._oExcludeFilterPanel = new CustomP13nConditionPanel({
            exclude: true,
            maxConditions: this.getMaxExcludes(),
            alwaysShowAddIcon: false,
            layoutMode: this.getLayoutMode(),
            dataChange: this._handleDataChange()
        });
        this._oExcludeFilterPanel._sAddRemoveIconTooltipKey = "FILTER";

        if (!this._oOperationsHelper) {
            this._oOperationsHelper = new sap.m.P13nOperationsHelper();
        }
        this._updateOperations();

        var sType;
        for (sType in this._aExcludeOperations) {
            this._oExcludeFilterPanel.setOperations(this._aExcludeOperations[sType], sType);
        }

        for (sType in this._aIncludeOperations) {
            this._oIncludeFilterPanel.setOperations(this._aIncludeOperations[sType], sType);
        }

        this._oExcludePanel.addContent(this._oExcludeFilterPanel);

        this.addAggregation("content", this._oExcludePanel);

        this._updatePanel();
    };



    CustomP13nFilterPanel.prototype.init_copy = function () {
        this.setType(P13nPanelType.filter);
        this.setTitle(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("FILTERPANEL_TITLE"));

        sap.ui.getCore().loadLibrary("sap.ui.layout");

        this._aKeyFields = [];
        this.addStyleClass("sapMFilterPanel");

        // init some resources
        this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

        this._aIncludeOperations = {};
        this._aExcludeOperations = {};

        if (!this._aIncludeOperations.default) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
            ]);
        }

        if (!this._aIncludeOperations.string) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.Contains, sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.StartsWith, sap.m.P13nConditionOperation.EndsWith, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
            ], "string");
        }
        if (!this._aIncludeOperations.datetime) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
            ], "datetime");
        }
        if (!this._aIncludeOperations.date) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
            ], "date");
        }
        if (!this._aIncludeOperations.time) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
            ], "time");
        }
        if (!this._aIncludeOperations.numeric) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE, sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE
            ], "numeric");
        }
        if (!this._aIncludeOperations.boolean) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ
            ], "boolean");
        }
        if (!this._aIncludeOperations["select"]) {
            this.setIncludeOperations([
                sap.m.P13nConditionOperation.EQ
            ], "select");
        }


        if (!this._aExcludeOperations.default) {
            this.setExcludeOperations([
                sap.m.P13nConditionOperation.EQ
            ]);
        }

        this._oIncludePanel = new sap.m.Panel({
            expanded: true,
            expandable: true,
            headerText: this._oRb.getText("FILTERPANEL_INCLUDES"),
            width: "auto"
        }).addStyleClass("sapMFilterPadding");

        this._oIncludeFilterPanel = new CustomP13nConditionPanel({
            maxConditions: this.getMaxIncludes(),
            alwaysShowAddIcon: false,
            layoutMode: this.getLayoutMode(),
            dataChange: this._handleDataChange()
        });
        this._oIncludeFilterPanel._sAddRemoveIconTooltipKey = "FILTER";

        for (const sType in this._aIncludeOperations) {
            this._oIncludeFilterPanel.setOperations(this._aIncludeOperations[sType], sType);
        }

        this._oIncludePanel.addContent(this._oIncludeFilterPanel);

        this.addAggregation("content", this._oIncludePanel);

        this._oExcludePanel = new sap.m.Panel({
            expanded: false,
            expandable: true,
            headerText: this._oRb.getText("FILTERPANEL_EXCLUDES"),
            width: "auto"
        }).addStyleClass("sapMFilterPadding");

        this._oExcludeFilterPanel = new CustomP13nConditionPanel({
            exclude: true,
            maxConditions: this.getMaxExcludes(),
            alwaysShowAddIcon: false,
            layoutMode: this.getLayoutMode(),
            dataChange: this._handleDataChange()
        });
        this._oExcludeFilterPanel._sAddRemoveIconTooltipKey = "FILTER";

        for (const sType in this._aExcludeOperations) {
            this._oExcludeFilterPanel.setOperations(this._aExcludeOperations[sType], sType);
        }

        this._oExcludePanel.addContent(this._oExcludeFilterPanel);

        this.addAggregation("content", this._oExcludePanel);

        this._updatePanel();
    };

    return CustomP13nFilterPanel;
});