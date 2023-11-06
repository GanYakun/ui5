sap.ui.define([
    'sap/base/util/deepEqual',
    'o3/library/control/smart/smartform/SmartForm',
    'o3/library/control/smart/smarttableV2/SmartTable',
    'o3/library/control/smart/smartfilterbar/SmartFilterBar',
    'o3/library/control/smart/variants/SmartVariantManagement',
    'o3/library/control/smart/dynamic/SmartBaseSection',
    'o3/library/control/smart/dynamic/SmartSubSection'
], function (deepEqual, SmartForm, SmartTable, SmartFilterBar, SmartVariantManagement, SmartBaseSection, SmartSubSection) {
    "use strict";

    return {
        setToolBarEditableFalse: function (that, viewEditable) {
            viewEditable.forEach(element => {
                var control = that.getView().byId(element) || sap.ui.getCore().byId(element);
                control.setEditable(false);
                if (control && control.getToolBar) {
                    control.getToolBar().setEnabled(true);
                }
            });
        },

        setToolBarEnabled: function (that, oEvent) {
            var editable = oEvent.getParameter("editable"),
                oSource = oEvent.getSource();

            that.arrId.forEach(element => {
                var control = that.getView().byId(element) || sap.ui.getCore().byId(element);
                if (control && control.getToolBar) {
                    control.getToolBar().setEnabled(deepEqual(oSource, control) && editable ? editable : !editable);
                }
            });
        },

        setTwoStage: function (that, sPath, detailTableIdAndEntitySet) {
            for (var obj in detailTableIdAndEntitySet) {
                var control = that.getView().byId(obj) || sap.ui.getCore().byId(obj);
                control.setEntitySet(sPath + "/" + detailTableIdAndEntitySet[obj]);
            }
        },

        initSections: function (objectPageLayout, configData) {
            var index = 0;
            for (var element in configData.allSections) {
                var smartControl;
                if (configData.allSections[element].length === 0) {

                } else if (configData.allSections[element].length === 1) {
                    if (configData.allSections[element][0].type === "form")
                        smartControl = new SmartForm(configData.allSections[element][0].id, {});
                    else {
                        smartControl = new SmartTable(configData.allSections[element][0].id, {});
                    }
                } else { // VBox
                    smartControl = new sap.m.VBox();
                    for (var i = 0; i < configData.allSections[element].length; i++) {
                        if (configData.allSections[element][i].type === "form")
                            smartControl.insertItem(new SmartForm(configData.allSections[element][i].id, {

                            }), i);
                        else {
                            smartControl.insertItem(new SmartTable(configData.allSections[element][i].id, {}), i);
                        }
                    }
                }
                objectPageLayout.addSection(new SmartBaseSection({
                    subSections: new SmartSubSection({
                        title: configData.sectionTitle[index],
                        blocks: smartControl
                    })
                }));
                index++;
            }
        },

        initObjectHeader: function (objectPageLayout, configData) {
            // objectPageLayout.setHeaderTitle(
            //     new sap.uxap.ObjectPageHeader({
            //         isObjectTitleAlwaysVisible: true,
            //         showPlaceholder: true,
            //         isObjectIconAlwaysVisible: true,
            //         objectTitle:"{internalName}",
            //         objectSubtitle: "{productId}",
            //         actions: [
            //         ]
            //     })
            // );

            // objectPageLayout.addHeaderContent(
            //     new sap.m.Label({
            //         text:"{internalName}", 
            //         wrapping: true
            //     })
            // );
        },

        setObjectPageSubSectionProperty: function (that, sPath, detailData) {
            var obj = {}, arrId = [];
            for (var element in detailData.allSections) {
                for (var i = 0; i < detailData.allSections[element].length; i++) {
                    var control = that.getView().byId(detailData.allSections[element][i].id) || sap.ui.getCore().byId(detailData.allSections[element][i].id);
                    if (!control) {
                        continue;
                    }
                    arrId.push(detailData.allSections[element][i].id);
                    if (detailData.allSections[element][i].type === "table") {
                        obj[detailData.allSections[element][i].id] = detailData.allSections[element][i].navgationProperty;
                        // 设置SmartTable属性
                        for (var item in detailData.allSections[element][i]) {
                            var property = detailData.allSections[element][i][item];
                            if (item === "header") {
                                control.setHeader(property);
                            } else if (item === "useNavigation") {
                                control.setUseNavigation(property);
                            } else if (item === "editTogglable") {
                                control.setEditTogglable(property);
                            } else if (item === "quickCreatable") {
                                control.setQuickCreatable(property);
                            } else if (item === "mode") {
                                control.setMode(property);
                            } else if (item === "deletable") {
                                control.setDeletable(property);
                            } else if (item === "initiallyVisibleFields") {
                                control.setInitiallyVisibleFields(property);
                            } else if (item === "editToggled") {
                                control.attachEditToggled(that[property].bind(that));
                            } else if (item === "columnItemPress") {
                                control.attachColumnItemPress(that[property].bind(that));
                            }
                        }
                    } else {
                        // 设置SmartForm属性
                        for (var item in detailData.allSections[element][i]) {
                            var property = detailData.allSections[element][i][item];
                            if (item === "entitySet") {
                                control.setEntitySet(property);
                            } else if (item === "formContainers") {
                                control.setAllFormContainers(property);
                            } else if (item === "formTitle") {
                                control.setTitle(property);
                            } else if (item === "editable") {
                                control.setEditable(property);
                            } else if (item === "editTogglable") {
                                control.setEditTogglable(property);
                            } else if (item === "editToggled") {
                                control.attachEditToggled(that[property].bind(that));
                            }
                        }
                    }
                }
            }
            // 设置两段式
            this.setTwoStage(that, sPath, obj);
            // 设置不可编辑
            this.setToolBarEditableFalse(that, arrId);

            // 保存所有的Smart控件id
            that.arrId = arrId;
        },

        setDynamicPageProperty: function (that, dynamicPage, listData) {
            var tableProperty = listData.table, filterBarProperty = listData.filterBar, variantProperty = listData.variant;

            if (variantProperty && variantProperty.id && variantProperty.entitySet) {
                dynamicPage.setTitle(new sap.f.DynamicPageTitle({
                    heading: new SmartVariantManagement(listData.id, {
                        entitySet: variantProperty.entitySet
                    })
                }));
            }
            if (filterBarProperty) {
                dynamicPage.setHeader(new sap.f.DynamicPageHeader({
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
                    columnItemPress: that[tableProperty.columnItemPress] ? that[tableProperty.columnItemPress].bind(that) : that[tableProperty.columnItemPress],
                    growingScrollToLoad: tableProperty.growingScrollToLoad,
                    growingThreshold: tableProperty.growingThreshold,
                    creatable: tableProperty.creatable,
                    createToggled: that[tableProperty.createToggled] ? that[tableProperty.createToggled].bind(that) : that[tableProperty.createToggled],
                    mode: tableProperty.mode,
                    deletable: tableProperty.deletable,
                    initiallyVisibleFields: tableProperty.initiallyVisibleFields,
                    quickCreatable: tableProperty.quickCreatable,
                    useExportToExcel: tableProperty.useExportToExcel
                }
                dynamicPage.setContent(new SmartTable(obj));
            }
        }

    };
}, /* bExport= */ true);
