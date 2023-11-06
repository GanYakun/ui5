sap.ui.define([
    'sap/uxap/ObjectPageLayout',
    'o3/library/model/AnnotationHelper',
    'o3/library/control/smart/smartform/SmartForm',
    'o3/library/control/smart/dynamic/SmartBaseSection',
    'o3/library/control/smart/smarttableV2/SmartTable',
    'o3/library/control/smart/dynamic/SmartSubSection',
    'o3/library/control/smart/smartfield/SmartField',
    'sap/m/Title',
    'sap/m/FlexBox',
    'sap/m/Avatar',
    'sap/m/Text',
    'sap/m/Label',
    'sap/m/HBox',
    'sap/ui/layout/VerticalLayout',
    'sap/m/VBox',
    'sap/uxap/ObjectPageDynamicHeaderTitle'
], function (ObjectPageLayout, AnnotationHelper, SmartForm, SmartBaseSection, SmartTable, SmartSubSection, SmartField, Title, FlexBox,
    Avatar, Text, Label, HBox, VerticalLayout, VBox, ObjectPageDynamicHeaderTitle) {
    "use strict";

    var SmartObjectPage = ObjectPageLayout.extend('o3.library.control.smart.dynamic.SmartObjectPage', {
        metadata: {
            library: "sap.uxap",
            properties: {
                entitySet: { type: "string", group: "Misc" },
                odataId: { type: "string", group: "Misc" },
                excludeNavigationProperty: { type: "string", group: "Misc" },
                showBasicInfoSection: { type: "boolean", group: "Misc", defaultValue: true },
                showNavigationSection: { type: "boolean", group: "Misc", defaultValue: true },
                upperCaseAnchorBar: { type: "boolean", group: "Misc", defaultValue: false },
                /**
                 * 只在默认显示的BasicInfo中起作用
                 */
                excludeFields: { type: "string", group: "Misc", defaultValue: "" }
            },
            defaultAggregation: "sections",
            aggregations: {
                sections: { type: "o3.library.control.smart.dynamic.SmartBaseSection", multiple: true, singularName: "section" }
            }
        },
        init: function () {
            ObjectPageLayout.prototype.init.apply(this, arguments);
            this.bInitiaMetadata = false;
            this.bInitOdataId = false;
            this.oController = undefined;
            this._oConfigurations = {
                sections: []
            };
            this._excludeNavigationProperty = [];
            this.attachModelContextChange(this._initialiseMetadata, this);
        },
        renderer: function (oRm, oControl) {
            sap.uxap.ObjectPageLayoutRenderer.render(oRm, oControl);
        }
    });

    SmartObjectPage.prototype._initialiseMetadata = function (oEvt) {
        var that = this;
        var oModel = this.getModel();

        if (!that.bInitiaMetadata && oModel) {
            //等待metadata加载完
            AnnotationHelper.init(oModel).then((oDataAnnotations) => {
                if (that._getView()) {
                    that.bInitiaMetadata = true;
                    that.oController = that._getView().getController();
                    that.initConfigurations(oDataAnnotations); // 生成创建页面的json格式数据

                }
                if (that.getOdataId() && that.oController && !that.bInitOdataId) {
                    that.bInitOdataId = true;
                    that.initObjectHeader(); // 初始化ObjectHeader
                    that.initSections(); // 根据上面的数据创建页面
                    that.setControlProperty(); // 设置页面控件的属性
                }
            })
        }
    };

    SmartObjectPage.prototype.initConfigurations = function (oDataAnnotations) {
        var that = this;
        var sEntitySet = this.getEntitySet();
        var sEntityType = AnnotationHelper.getEntityTypeByEntitySet(sEntitySet);
        var sNameSpace = AnnotationHelper.getNameSpace();
        var oEntitySetNnnotations = oDataAnnotations[sNameSpace + sEntityType];
        var aNavigationProperty = [];
        var aFormFields = [];
        var index = 0;

        // 取所有的NavigationProperty和EntitySet的字段
        for (var item in oEntitySetNnnotations) {
            if (oEntitySetNnnotations[item] && oEntitySetNnnotations[item]["$kind"] && oEntitySetNnnotations[item]["$kind"] === "NavigationProperty" &&
                oEntitySetNnnotations[item]["$isCollection"]) {
                aNavigationProperty.push({ "key": item, "value": oEntitySetNnnotations[item]["$Type"] });
            }
            if (oEntitySetNnnotations[item] && oEntitySetNnnotations[item]["$kind"] && oEntitySetNnnotations[item]["$kind"] === "Property") {
                aFormFields.push(item);
            }
        }

        // 排除不需要显示的字段
        aFormFields = this.getFormFields(aFormFields);

        // 取标签中的section（defaultFormable=true放在第一个section中）
        this.getViewPageSections(aFormFields);

        // 去重
        this._excludeNavigationProperty = this._excludeNavigationProperty.concat(this.getExcludeNavigationProperty().split(","));
        this._excludeNavigationProperty = Array.from(new Set(this._excludeNavigationProperty));

        // 取自动显示的section
        if (this.getShowNavigationSection()) {
            aNavigationProperty.forEach(function (element) {
                var flag = true;
                for (var i = 0; i < that._excludeNavigationProperty.length; i++) {
                    if (that._excludeNavigationProperty[i] === element.key) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    var _oEntitySetNnnotations = oDataAnnotations[element.value];
                    var _sTableId = "annotationTable" + index;
                    var _sInitiallyVisibleFields = "";
                    for (var item in _oEntitySetNnnotations) {
                        if (_oEntitySetNnnotations[item] && _oEntitySetNnnotations[item]["$kind"] && _oEntitySetNnnotations[item]["$kind"] === "Property") {
                            _sInitiallyVisibleFields += item + ",";
                        }
                    }
                    _sInitiallyVisibleFields = _sInitiallyVisibleFields.substring(0, _sInitiallyVisibleFields.lastIndexOf(','));
                    that._oConfigurations.sections.push({
                        sectionTitle: element.key,
                        subSections: [{
                            subsectionTitle: element.key,
                            blocks: [{
                                type: "table",
                                id: _sTableId,
                                navgationProperty: element.key,
                                header: element.key,
                                mode: "MultiSelect",
                                editable: false,
                                editTogglable: true,
                                quickCreatable: true,
                                deletable: true,
                                initiallyVisibleFields: _sInitiallyVisibleFields
                            }]
                        }]
                    });
                    index++;
                }
            });
        }
    };

    // 渲染header
    SmartObjectPage.prototype.initObjectHeader = function () {
        // return;
        var that = this;
        var oObjectHeaderTemplate = AnnotationHelper.getObjectHeaderTemplate(this.getEntitySet());
        var oHeaderInfo = oObjectHeaderTemplate.headerInfo;
        var oHeaderFacets = oObjectHeaderTemplate.headerFacets;
        var sImageUrl = oHeaderInfo.string_imageUrl;

        if (oHeaderInfo.spth_imageUrl) {
            sImageUrl = {
                path: oHeaderInfo.spth_imageUrl
            }
        }

        this.reSetHeaderTitle(oHeaderInfo, sImageUrl);

        var aFlexBoxItems = [];
        var aGroupItem = [];

        aFlexBoxItems.push(new Avatar({
            src: sImageUrl,
            displaySize: "L",
            visible: !!sImageUrl
        }).addStyleClass("sapUiSmallMarginEnd"));

        oHeaderFacets.forEach(function (item) {
            if (item.fieldGroup) {
                aGroupItem.push(new Title({ text: item.title, visible: !!item.title}).addStyleClass("sapUiTinyMarginBottom"));
                item.fieldGroup.forEach(function (element) {
                    aGroupItem.push(new HBox({
                        items: [
                            new Label({ text: element.title + "：" }),
                            new SmartField({
                                value: {
                                    path: element.value,
                                    type: 'sap.ui.model.odata.type.String'
                                },
                                entitySet: that.getEntitySet(),
                                entityField: element.value,
                                editable: false
                            })
                        ]
                    }));
                });
                aFlexBoxItems.push(new VerticalLayout({
                    content: aGroupItem
                }).addStyleClass("sapUiMediumMarginEnd"));
            }
            if (item.dataPoint) {
                aFlexBoxItems.push(new VerticalLayout({
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: item.dataPoint.title + "：" }),
                                new SmartField({
                                    value: {
                                        path: item.dataPoint.value,
                                        type: 'sap.ui.model.odata.type.String'
                                    },
                                    entitySet: that.getEntitySet(),
                                    entityField: item.dataPoint.value,
                                    editable: false
                                }).addStyleClass("O3TitleH3")
                            ]
                        })
                    ]
                }).addStyleClass("sapUiMediumMarginEnd"));
            }
        });

        this.addHeaderContent(
            new FlexBox({
                wrap: "Wrap",
                items: [
                    new HBox({
                        items: aFlexBoxItems
                    })
                ]
            })
        );
    };

    // 设置headerTitle
    SmartObjectPage.prototype.reSetHeaderTitle = function (oHeaderInfo, sImageUrl) {
        var sObjectTitle = oHeaderInfo.string_description,
            sObjectSubtitle = oHeaderInfo.string_title;

        if (oHeaderInfo.spth_description && oHeaderInfo.spth_title) {
            this.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
                expandedHeading: new Title({ text: { path: oHeaderInfo.spth_description }, wrapping: true }),
                snappedHeading: new FlexBox({
                    fitContainer: false,
                    alignItems: "Center",
                    items: [
                        new Avatar({ src: sImageUrl, visible: !!sImageUrl }).addStyleClass("sapUiTinyMarginEnd"),
                        new Title({ text: { path: oHeaderInfo.spth_description }, wrapping: true })
                    ]
                }),
                expandedContent: [
                    new Title({ text: { path: oHeaderInfo.spth_title }, wrapping: true })
                ],
                snappedContent: [
                    new Title({ text: { path: oHeaderInfo.spth_title }, wrapping: true })
                ],
                actions: []
            }));
        } else if (oHeaderInfo.spth_description && !oHeaderInfo.spth_title) {
            this.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
                expandedHeading: new Title({ text: { path: oHeaderInfo.spth_description }, wrapping: true }),
                snappedHeading: new FlexBox({
                    fitContainer: false,
                    alignItems: "Center",
                    items: [
                        new Avatar({ src: sImageUrl, visible: !!sImageUrl }).addStyleClass("sapUiTinyMarginEnd"),
                        new Title({ text: { path: oHeaderInfo.spth_description }, wrapping: true })
                    ]
                }),
                expandedContent: [
                    new Text({ text: sObjectSubtitle })
                ],
                snappedContent: [
                    new Text({ text: sObjectSubtitle })
                ],
                actions: []
            }));
        } else if (!oHeaderInfo.spth_description && oHeaderInfo.spth_title) {
            this.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
                expandedHeading: new Title({ text: sObjectTitle, wrapping: true }),
                snappedHeading: new FlexBox({
                    fitContainer: false,
                    alignItems: "Center",
                    items: [
                        new Avatar({ src: sImageUrl, visible: !!sImageUrl }).addStyleClass("sapUiTinyMarginEnd"),
                        new Title({ text: sObjectTitle, wrapping: true })
                    ]
                }),
                expandedContent: [
                    new Title({ text: { path: oHeaderInfo.spth_title }, wrapping: true })
                ],
                snappedContent: [
                    new Title({ text: { path: oHeaderInfo.spth_title }, wrapping: true })
                ],
                actions: []
            }));
        } else {
            this.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
                expandedHeading: new Title({ text: sObjectTitle, wrapping: true }),
                snappedHeading: new FlexBox({
                    fitContainer: false,
                    alignItems: "Center",
                    items: [
                        new Avatar({ src: sImageUrl, visible: !!sImageUrl }).addStyleClass("sapUiTinyMarginEnd"),
                        new Title({ text: sObjectTitle, wrapping: true })
                    ]
                }),
                expandedContent: [
                    new Text({ text: sObjectSubtitle })
                ],
                snappedContent: [
                    new Text({ text: sObjectSubtitle })
                ],
                actions: []
            }));
        }
    }

    // 基本信息去掉排除的字段
    SmartObjectPage.prototype.getFormFields = function (aFormFields) {
        var excludeFields = this.getExcludeFields() ? this.getExcludeFields().split(",") : [];
        for (var i = 0; i < aFormFields.length; i++) {
            for (var j = 0; j < excludeFields.length; j++) {
                if (aFormFields[i] === excludeFields[j]) {
                    aFormFields.splice(i, 1);
                    break;
                }
            }
        }
        return aFormFields;
    };

    // 获取view中标签里含有的Form、Table
    SmartObjectPage.prototype.getViewPageSections = function (aFormFields) {
        var oAggregations = this.getAggregation("sections");

        // 是否需要显示默认 BasicInfo
        if (this.getShowBasicInfoSection()) {
            // 显示默认的Section
            this._oConfigurations.sections.push({
                sectionTitle: "基本信息",
                subSections: [{
                    subsectionTitle: "基本信息",
                    blocks: [{
                        type: "form",
                        id: "defaultForm1",
                        title: "",
                        entitySet: this.getEntitySet(),
                        editable: false,
                        editTogglable: true,
                        editToggled: "onEditToggled",
                        formContainers: {
                            groupA: {
                                title: "",
                                elements: aFormFields
                            }
                        }
                    }]
                }]
            });
            // 替换默认的Section，需要清空默认的 BasicInfo
            for (var i = 0; i < oAggregations.length; i++) {
                if (oAggregations[i].isA("o3.library.control.smart.dynamic.SmartBasicInfoSection")) {
                    this._oConfigurations.sections = [];
                    var _objSection = {
                        sectionTitle: "基本信息",
                        subSections: []
                    };
                    this._setObjSection(oAggregations, _objSection, i);
                    break;
                }
            }
        }

        // SmartNavigationSection（table）
        if (this.getShowNavigationSection()) {
            for (var i = 0; i < oAggregations.length; i++) {
                if (oAggregations[i].isA("o3.library.control.smart.dynamic.SmartNavigationSection")) {
                    var _objSection = {
                        sectionTitle: oAggregations[i].getTitle(),
                        subSections: []
                    };
                    this._setObjSection(oAggregations, _objSection, i);
                    // 是否需要覆盖
                    if (oAggregations[i].getReplace()) {
                        this._excludeNavigationProperty.push(oAggregations[i].getReplace());
                    }
                }
            }
        }
    };

    // 提取公共部分
    SmartObjectPage.prototype._setObjSection = function (oAggregations, _objSection, i) {
        var oSubSections = oAggregations[i].getAggregation("subSections"); // 取 subSection
        for (var j = 0; j < oSubSections.length; j++) {
            var _objSubSection = {
                subsectionTitle: oSubSections[j].getTitle(),
                blocks: []
            }
            var oBlocks = oSubSections[j].getAggregation("blocks"); // 取 block
            for (var k = 0; k < oBlocks.length; k++) {
                var block = oBlocks[k];
                var _editToggled = block.getEditToggled() ? block.getEditToggled() : "onEditToggled",
                    _quickCreatable = false,
                    _deletable = false;

                if (block.isA("o3.library.control.smart.dynamic.SmartFormBlock")) {
                    var _objForm = {
                        type: "form",
                        id: "idForm" + i + j + k,
                        title: block.getTitle(),
                        entitySet: block.getEntitySet() || this.getEntitySet(),
                        editable: block.getEditable(),
                        editTogglable: block.getEditTogglable(),
                        editToggled: _editToggled,
                        formContainers: {}
                    };
                    var groups = block.getAggregation("smartformgroup");
                    for (var m = 0; m < groups.length; m++) {
                        var groupKey = "formGroup" + i + j + k + m;
                        _objForm.formContainers[groupKey] = {
                            title: groups[m].getTitle(),
                            elements: groups[m].getFields().split(",")
                        }
                    }
                    _objSubSection.blocks.push(_objForm);
                }
                if (block.isA("o3.library.control.smart.dynamic.SmartTableBlock")) {
                    if (block.getQuickCreatable() || block.getQuickCreatable() === "undefined") {
                        _quickCreatable = true;
                    }
                    if (block.getDeletable() || block.getDeletable() === "undefined") {
                        _deletable = true;
                    }

                    var _columnItemPress = block.getColumnItemPress() ? block.getColumnItemPress() : "onColumnItemPress";
                    var _objTable = {
                        type: "table",
                        id: "idTable" + i + j + k,
                        navgationProperty: block.getNavgationProperty(),
                        header: block.getHeader(),
                        useNavigation: block.getUseNavigation(),
                        editTogglable: block.getEditTogglable(),
                        editToggled: _editToggled,
                        columnItemPress: _columnItemPress,
                        quickCreatable: _quickCreatable,
                        mode: block.getMode(),
                        deletable: _deletable,
                        initiallyVisibleFields: block.getInitiallyVisibleFields()
                    };
                    _objSubSection.blocks.push(_objTable);
                }
            }
            _objSection.subSections.push(_objSubSection);
        }
        this._oConfigurations.sections.push(_objSection);
    };

    // 返回配置
    SmartObjectPage.prototype.getConfigurations = function () {
        return this._oConfigurations;
    };

    // 创建每个section的 Form、Table
    SmartObjectPage.prototype.initSections = function () {
        // TODO：可优化
        this.clearSections();
        var oConfigurations = this.getConfigurations();
        for (var i = 0; i < oConfigurations.sections.length; i++) {
            var oSection = oConfigurations.sections[i];
            var aSubSections = oSection.subSections;
            var oSmartBaseSection = new SmartBaseSection({
                title: oSection.sectionTitle
            });
            for (var j = 0; j < aSubSections.length; j++) {
                var oSubSection = aSubSections[j];
                var aBlocks = oSubSection.blocks;
                var oVbox = new VBox();
                for (var k = 0; k < aBlocks.length; k++) {
                    var oSmartProperty = aBlocks[k];
                    if (oSmartProperty.type === "form") {
                        oVbox.insertItem(new SmartForm(oSmartProperty.id, {}));
                    }
                    if (oSmartProperty.type === "table") {
                        oVbox.insertItem(new SmartTable(oSmartProperty.id, {}));
                    }
                }
                oSmartBaseSection.addSubSection(new SmartSubSection({
                    title: oSubSection.subsectionTitle,
                    blocks: oVbox
                }));
            }
            this.addSection(oSmartBaseSection);
        }
    };

    // 清空section内容
    SmartObjectPage.prototype.clearSections = function () {
        // 可以做定制化清空内容
        this.removeAllSections();
    };

    // 设置 Table、Form 的属性
    SmartObjectPage.prototype.setControlProperty = function () {
        var oConfigurations = this.getConfigurations();
        var obj = {}, arrId = [];

        for (var i = 0; i < oConfigurations.sections.length; i++) {
            var aSubSections = oConfigurations.sections[i].subSections;
            for (var j = 0; j < aSubSections.length; j++) {
                var aBlocks = aSubSections[j].blocks;
                for (var k = 0; k < aBlocks.length; k++) {
                    var oSmartProperty = aBlocks[k];
                    var oControl = this.oController.getView().byId(oSmartProperty.id) || sap.ui.getCore().byId(oSmartProperty.id);
                    if (!oControl) {
                        continue;
                    }
                    arrId.push(oSmartProperty.id);
                    if (oSmartProperty.type === "table") {
                        obj[oSmartProperty.id] = oSmartProperty.navgationProperty;
                        for (var item in oSmartProperty) {
                            var property = oSmartProperty[item];
                            if (item === "header") {
                                oControl.setHeader(property);
                            } else if (item === "useNavigation") {
                                oControl.setUseNavigation(property);
                            } else if (item === "editTogglable") {
                                oControl.setEditTogglable(property);
                            } else if (item === "quickCreatable") {
                                oControl.setQuickCreatable(property);
                            } else if (item === "mode") {
                                oControl.setMode(property);
                            } else if (item === "deletable") {
                                oControl.setDeletable(property);
                            } else if (item === "initiallyVisibleFields") {
                                oControl.setInitiallyVisibleFields(property);
                            } else if (item === "editToggled") {
                                if (this.oController[property]) {
                                    oControl.attachEditToggled(this.oController[property].bind(this.oController));
                                }
                            } else if (item === "columnItemPress") {
                                if (this.oController[property]) {
                                    oControl.attachColumnItemPress(this.oController[property].bind(this.oController));
                                }
                            }
                        }
                    }
                    if (oSmartProperty.type === "form") {
                        for (var item in oSmartProperty) {
                            var property = oSmartProperty[item];
                            if (item === "entitySet") {
                                oControl.setEntitySet(property);
                            } else if (item === "formContainers") {
                                oControl.setAllFormContainers(property);
                            } else if (item === "title") {
                                oControl.setTitle(property);
                            } else if (item === "editable") {
                                oControl.setEditable(property);
                            } else if (item === "editTogglable") {
                                oControl.setEditTogglable(property);
                            } else if (item === "editToggled") {
                                oControl.attachEditToggled(this.oController[property].bind(this.oController));
                            }
                        }
                    }
                }
            }
        }

        // 设置两段式
        for (var item in obj) {
            var control = this.oController.getView().byId(item) || sap.ui.getCore().byId(item);
            control.setEntitySet(this.getOdataId() + "/" + obj[item]);
        }
        // 设置不可编辑
        this.setToolBarEditableFalse(arrId);
        // 保存所有的Smart控件id
        this.oController.arrId = arrId;
    };

    SmartObjectPage.prototype.setToolBarEditableFalse = function (arrId) {
        var that = this;
        arrId.forEach(function (element) {
            var control = that.oController.getView().byId(element) || sap.ui.getCore().byId(element);
            control.setEditable(false);
            if (control && control.getToolBar) {
                control.getToolBar().setEnabled(true);
            }
        });
    };

    // TODO：Rename Section Title
    SmartObjectPage.prototype.setRedefineSectionTitle = function () {
        if (this._oConfigurations) {
            for (var element in this._oConfigurations.allSections) {
                if (element === "basicSection") {
                    this._oConfigurations.sectionTitle.push("基本信息");
                } else {
                    var aBlocks = this._oConfigurations.allSections[element];
                    var sName = "";
                    aBlocks.forEach(function (item) {
                        if (item.navgationProperty) {
                            sName += item.navgationProperty + "/";
                        }
                    });
                    if (aBlocks.length > 0) {
                        sName = sName.substring(0, sName.lastIndexOf('/'));
                        this._oConfigurations.sectionTitle.push(sName);
                    }
                }
            }
        }
    };

    // 路由跳转是动态设置odataid
    SmartObjectPage.prototype.setOdataId = function (odataId) {
        this.setProperty("odataId", odataId, true);
        if (odataId && this.oController && !this.bInitOdataId) {
            this.bInitOdataId = true;
            this.initObjectHeader(); // 初始化ObjectHeader
            this.initSections(); // 根据上面的数据创建页面
            this.setControlProperty(); // 设置页面控件的属性
        }
        if (odataId && this.bInitOdataId && this.oController) {
            this.setControlProperty();
        }
    };

    SmartObjectPage.prototype._getView = function () {
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

    return SmartObjectPage;
});