/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/core/Control',
    'sap/m/Link',
    'sap/m/Label',
    'sap/ui/model/json/JSONModel',
    'o3/library/model/AnnotationHelper',
    'sap/m/ResponsivePopover',
    'sap/m/VBox',
    'sap/m/HBox',
    'sap/m/Button',
    'sap/m/QuickViewPage',
    'sap/m/Text',
    'sap/m/P13nDialog',
    'sap/m/P13nSelectionPanel',
    'sap/m/P13nItem',
    'sap/m/P13nSelectionItem',
    'sap/ui/layout/form/Form',
    'sap/ui/layout/form/GridLayout',
    'sap/ui/layout/form/FormContainer',
    'sap/ui/layout/form/FormElement',
], function (Control, Link, Label, JSONModel, AnnotationHelper, ResponsivePopover, VBox, HBox, Button, QuickViewPage, Text, P13nDialog,
    P13nSelectionPanel, P13nItem, P13nSelectionItem, Form, GridLayout, FormContainer, FormElement) {
    'use strict';

    var SmartLink = Control.extend('o3.library.control.smart.smartlink.SmartLink', {
        metadata: {
            properties: {
                entitySet: { type: 'string', defaultValue: '' },
                entityField: { type: 'string', defaultValue: '' },
            },
            aggregations: {
                _control: { type: 'sap.ui.core.Control', multiple: false, }
            },
            events: {}
        },

        renderer: {
            render: function (oRm, oControl) {
                oRm.write('<div ');
                oRm.writeControlData(oControl);
                oRm.write('>');
                oRm.renderControl(oControl.getControl());
                oRm.write('</div>');
            }
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

    SmartLink.prototype.init = function () {
        this.attachModelContextChange(this.onModelContextChange);
    }

    SmartLink.prototype.setControl = function (oContent) {
        return this.setAggregation('_control', oContent);
    };

    SmartLink.prototype.getControl = function () {
        return this.getAggregation('_control');
    };

    SmartLink.prototype.onModelContextChange = function () {
        var oBinding = this.getBinding('value'),
            that = this;
        var oModel = this.getModel();
        AnnotationHelper.init(oModel).then(() => {
            if (this.oMetadataInitialised) {
                return;
            }
            this.oMetadataInitialised = true;

            this.oEntityType = AnnotationHelper.getEntityTypeByEntitySet(this.getEntitySet());
            this.oFieldData = AnnotationHelper.getEntityFieldAnnotation(this.oEntityType, this.getEntityField());
            this.oFieldInfo = AnnotationHelper.getFieldInfo(this.oEntityType, this.getEntityField());

            this.oNavigationProperty = AnnotationHelper.getNavigationPropertyByForeignKey(this.oEntityType, this.getEntityField());
            if (this.oNavigationProperty) {
                //oNavigationProperty = PrimaryProductCategory
                //oNavigationPropertyEntitySet = ProductCategories
                //oNavigationPropertyEntityType = ProductCategory

                this.oNavigationPropertyEntitySet = AnnotationHelper.getNavigationPropertyBindingByEntitySet(this.getEntitySet(), this.oNavigationProperty);
                this.oNavigationPropertyEntityType = AnnotationHelper.getEntityTypeByEntitySet(this.oNavigationPropertyEntitySet);

                this.oNavigationPropertyEntityTypeObject = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + this.oNavigationPropertyEntityType);
                let oNavigationPropertyEntityAnnotation = AnnotationHelper.getEntityTypeAnnotation(AnnotationHelper.getNameSpace() + this.oNavigationPropertyEntityType);

                let template = '';
                if (oNavigationPropertyEntityAnnotation) {
                    if (oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.ConnectedFields']) {
                        template = oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.ConnectedFields']['Template'];
                    }
                    if (!template) {
                        if (this.oNavigationPropertyEntityTypeObject['$Key']) {
                            template = '({' + this.oNavigationPropertyEntityTypeObject['$Key'][0] + '})';
                        }
                    }
                    template = template.replace(/{/g, '{' + this.oNavigationProperty + '/');
                    // console.log(template);
                    // return;
                    var pattern = /\{[^\}]+\}/gi;
                    var parts = [], oLink;
                    template.match(pattern).some(function (mch) {
                        parts.push({
                            path: mch.replace(/\{|\}/ig, '')
                        });
                    });

                    var textConfig = {
                        parts: parts,
                        formatter: function () {
                            var newTemplate = template;
                            var hasValue = false;
                            for (var i = 0; i < arguments.length; i++) {
                                if (!$.isEmptyObject(arguments[i])) {
                                    hasValue = true;
                                    break;
                                }
                            }
                            if (hasValue) {
                                for (var i = 0; i < template.match(pattern).length; i++) {
                                    newTemplate = newTemplate.replace(template.match(pattern)[i], arguments[i]);
                                }
                            } else {
                                newTemplate = '';
                            }

                            return newTemplate;
                        }
                    };
                    if (oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.QuickViewFacets']) {
                        //有quickview 显示链接
                        this.buildQuickView(oNavigationPropertyEntityAnnotation);
                        oLink = new Link({
                            text: textConfig,
                            press: this.handleQuickViewBtnPress.bind(this)
                        });
                    } else {
                        oLink = new Label({
                            text: textConfig
                        });
                    }
                    this.setControl(oLink);
                }
            } else {
                //没有配置 ReferentialConstraint  只能显示外键
                var oLink = new Label({
                    text: {
                        path: this.getEntityField()
                    }
                });
                this.setControl(oLink);
            }
        })
    }

    SmartLink.prototype.buildQuickView = function (oNavigationPropertyEntityAnnotation) {
        var oQuickViewFacets = oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.QuickViewFacets'];
        this.oHeaderInfo = oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.HeaderInfo'];
        this.oFieldGroups = [];
        oQuickViewFacets.some((oFaect) => {
            if (oFaect['$Type'] === 'com.sap.vocabularies.UI.ReferenceFacet') {
                var oAnnotationPath = oFaect['Target']['$AnnotationPath'];
                if (!oNavigationPropertyEntityAnnotation[oAnnotationPath]) {
                    throw new Error('Missing $AnnotationPath: ' + oAnnotationPath);
                }
                if (oAnnotationPath.indexOf('@com.sap.vocabularies.UI.FieldGroup') !== -1) {
                    this.oFieldGroups.push({
                        Label: oFaect['Label'],
                        Data: oNavigationPropertyEntityAnnotation[oAnnotationPath]['Data']
                    });
                    /*Data 结构eg:
                    $Type: "com.sap.vocabularies.UI.DataField"
                    Label: "categoryName"
                    Value:
                      $Path: "categoryName"
                     */
                }
            } else {
                throw new Error('Unsupported $Type: ' + oFaect['$Type']);
            }
        });
    }
    SmartLink.prototype.handleQuickViewBtnPress = function (oEvent) {
        let oButton = oEvent.getSource();
        let oButtonBindingInfo = oButton.getBindingContext().getObject();

        //links
        let links = {
            links: [
                // {key: 'link1', text: 'Google', href: 'http://www.google.com', target: '_blank', selected: true},
                // {key: 'link2', text: '柯穆网络1', href: 'http://www.comonetwork.com', target: '_blank', selected: false},
                // {key: 'link3', text: '柯穆网络2', href: 'http://www.comonetwork.com', target: '_blank', selected: false},
                // {key: 'link4', text: '柯穆网络3', href: 'http://www.comonetwork.com', target: '_blank', selected: false},
                // {key: 'link5', text: '柯穆网络4', href: 'http://www.comonetwork.com', target: '_blank', selected: false},
                // {key: 'link6', text: '柯穆网络5', href: 'http://www.comonetwork.com', target: '_blank', selected: false},
                // {key: 'link7', text: '柯穆网络6', href: 'http://www.comonetwork.com', target: '_blank', selected: false},
                // {key: 'link8', text: 'O3', href: 'https://t10293.dev.dpbirdlab.com', target: '_blank', selected: true},
            ],
            selectedLinks: []
        };
        window.getSemanticObjectQuickLinks(this.oNavigationPropertyEntityType).some((item) => {
            links.links.push({
                key: item.route.name,
                text: item.text,
                selected: item.selected,
                target: item.target ? item.target : '_self',
                pattern: item.route.pattern
            });
        });
        let mainLink = links.links.shift();

        if (!this._oResponsivePopover) {
            //popover
            this._oResponsivePopover = new ResponsivePopover({
                title: AnnotationHelper.getFieldLabel(this.oEntityType, this.getEntityField()),
                showHeader: '{device>/system/phone}',
                contentWidth: '380px',
                placement: 'Auto'
                // beginButton: new Button({
                //   text: "More links",
                //   press: function (oEvent) {
                //     this._oResponsivePopover.close();
                //   }.bind(this)
                // })
            }).addStyleClass('navPopover');

            //header begin
            //has icon
            let oVBoxHeader = new VBox().addStyleClass('navPopover-header');
            let oHeader;
            let oHeaderTitle = this.oHeaderInfo['Title'] ? { path: this.oNavigationProperty + '/' + this.oHeaderInfo['Title']['Value']['$Path'] } : '';
            let oHeaderDescription = this.oHeaderInfo['Description'] ? { path: this.oNavigationProperty + '/' + this.oHeaderInfo['Description']['Value']['$Path'] } : '';
            if (this.oHeaderInfo['ImageUrl']) {
                oHeader = new QuickViewPage({
                    icon: this.oHeaderInfo['ImageUrl'],
                    title: oHeaderTitle,
                    titleUrl: {
                        parts: [this.oNavigationProperty + '/' + this.oNavigationPropertyEntityTypeObject['$Key'][0]],
                        formatter: (primaryId) => {
                            let oNavigationPropertyEntityTypeObjectKey = this.oNavigationPropertyEntityTypeObject['$Key'][0];
                            let param = [];
                            param[oNavigationPropertyEntityTypeObjectKey] = primaryId;
                            return window.getGlobalRoute().getURL(mainLink.key, param);
                        }
                    },
                    description: oHeaderDescription,
                });
                oVBoxHeader.addItem(oHeader);
            } else {
                if (mainLink) {
                    oVBoxHeader.addItem(new Link({
                        href: {
                            parts: [this.oNavigationProperty + '/' + this.oNavigationPropertyEntityTypeObject['$Key'][0]],
                            formatter: (primaryId) => {
                                // let oNavigationPropertyEntityTypeObjectKey = this.oNavigationPropertyEntityTypeObject['$Key'][0];
                                let param = [];
                                // param[oNavigationPropertyEntityTypeObjectKey] = primaryId;
                                // return window.getGlobalRoute().getURL(mainLink.key, param);
                                let routPattern = mainLink.pattern.split("{")[1].split("}")[0];
                                param[routPattern] = this.oNavigationPropertyEntitySet + "('" + primaryId + "')";
                                return window.getGlobalRoute().getURL(mainLink.key, param);
                            }
                        },
                        text: oHeaderTitle,
                        target: mainLink.target
                    }).addStyleClass('navPopover-title'));
                } else {
                    oVBoxHeader.addItem(new Text({
                        text: oHeaderTitle
                    }).addStyleClass('navPopover-title'));
                }
                oVBoxHeader.addItem(new Text({
                    text: oHeaderDescription
                }));
            }
            this._oResponsivePopover.addContent(oVBoxHeader);
            //header end

            //form begin
            let oForm = new Form();
            oForm.setLayout(new GridLayout({ singleColumn: true }));
            this.oFieldGroups.some((oGroup) => {
                let oFormContainer = new FormContainer({
                    title: oGroup['Label']
                });
                oGroup['Data'].some((item) => {
                    let oFormElement;
                    if (item['Value']['$Path'].includes("/")) {
                        let navigationEntityType = item['Value']['$Path'].split("/")[0];
                        let NavigationData = oButtonBindingInfo[this.oNavigationProperty];
                        let fornkeyInfo = AnnotationHelper.getForeignKeyInfo(this.oNavigationPropertyEntityType, navigationEntityType);

                        oFormElement = new FormElement({
                            label: item['Label'] ? item['Label'] : AnnotationHelper.getFieldLabel(this.oNavigationPropertyEntityType, item['Value']['$Path']),
                            fields: [
                                new Text({
                                    text: {
                                        path: item['Value']['$Path'].split("/")[1],
                                        type: 'sap.ui.model.odata.type.String'
                                    }
                                }).bindElement({
                                    path: `/${fornkeyInfo["entitySet"]}('${NavigationData[fornkeyInfo["ReferencedProperty"]]}')`
                                })
                            ]
                        });
                    } else {
                        oFormElement = new FormElement({
                            label: item['Label'] ? item['Label'] : AnnotationHelper.getFieldLabel(this.oNavigationPropertyEntityType, item['Value']['$Path']),
                            fields: [
                                new Text({
                                    text: {
                                        path: this.oNavigationProperty + '/' + item['Value']['$Path'],
                                        type: 'sap.ui.model.odata.type.String'
                                    }
                                })
                            ]
                        });
                    }
                    oFormContainer.addFormElement(oFormElement);
                });
                oForm.addFormContainer(oFormContainer);
            })
            this._oResponsivePopover.addContent(oForm);
            //form end

            this.linkModelName = 'oLinksModel' + this.getEntitySet();
            this.oLinksModel = this._getView().getModel(this.linkModelName);
            if (!this.oLinksModel) {
                this.oLinksModel = new JSONModel(links);
                this._getView().setModel(this.oLinksModel, this.linkModelName);
            }

            if (links.links.length > 0) {
                this.applySelectedLinks();
                //navPopover-separator
                let oVBoxNav = new VBox();
                oVBoxNav.addStyleClass('navPopover-separator');
                this._oResponsivePopover.addContent(oVBoxNav);

                let oVBoxLinks = new VBox({
                    items: {
                        path: this.linkModelName + '>/selectedLinks',
                        templateShareable: false,
                        template: new VBox({
                            items: [
                                new Link({
                                    // href: '{' + this.linkModelName + '>href}',
                                    href: {
                                        parts: [this.linkModelName + '>key', this.oNavigationProperty + '/' + this.oNavigationPropertyEntityTypeObject['$Key'][0]],
                                        formatter: (key, primaryId) => {
                                            let oNavigationPropertyEntityTypeObjectKey = this.oNavigationPropertyEntityTypeObject['$Key'][0];
                                            let param = [];
                                            param[oNavigationPropertyEntityTypeObjectKey] = primaryId;
                                            return window.getGlobalRoute().getURL(key, param);
                                        }
                                    },
                                    text: '{' + this.linkModelName + '>text}',
                                    visible: '{' + this.linkModelName + '>selected}',
                                    target: '{' + this.linkModelName + '>target}'
                                })
                            ]
                        }).addStyleClass('navPopover-link-item')
                    }
                }).addStyleClass('navPopover-link-group');
                this._oResponsivePopover.addContent(oVBoxLinks);

                //more link
                var oHBoxMoreLink = new HBox({
                    justifyContent: 'End'
                }).addStyleClass('navPopover-button');
                oHBoxMoreLink.addItem(new Button({
                    type: 'Transparent',
                    text: sap.ui.getCore().getLibraryResourceBundle("o3.sap.ui.comp").getText("POPOVER_DEFINE_LINKS"),
                    press: (oEvent) => {
                        this.openSelectionDialog();
                    }
                }));
                this._oResponsivePopover.addContent(oHBoxMoreLink);
            }
            this.addDependent(this._oResponsivePopover);
        }
        this._oResponsivePopover.openBy(oButton);
    }

    SmartLink.prototype.applySelectedLinks = function () {
        let selectedLinks = [];
        this.oLinksModel.getProperty('/links').some((item) => {
            if (item.selected) {
                selectedLinks.push(JSON.parse(JSON.stringify(item)));
            }
        });
        this.oLinksModel.setProperty('/selectedLinks', selectedLinks);
    }
    SmartLink.prototype.cancelSelectedLinks = function () {
        let links = this.oLinksModel.getProperty('/links');
        links.some((item) => {
            item.selected = false;
        });
        this.oLinksModel.getProperty('/selectedLinks').some((item) => {
            links.some((item2) => {
                if (item.key === item2.key) {
                    item2.selected = item.selected;
                    return false;
                }
            });
        });
        this.oLinksModel.setProperty('/links', links);
    }
    SmartLink.prototype.openSelectionDialog = function () {
        this._oResponsivePopover.setModal(true);
        if (!this._oSelectDialog) {
            this._oSelectDialog = new P13nDialog({
                contentWidth: "25rem",
                contentHeight: "35rem",
                showReset: true,
                panels: [
                    new P13nSelectionPanel({
                        titleLarge: sap.ui.getCore().getLibraryResourceBundle("o3.sap.ui.comp").getText("POPOVER_SELECTION_TITLE"),
                        items: {
                            path: this.linkModelName + '>/links',
                            // templateShareable: false,
                            template: new P13nItem({
                                columnKey: '{' + this.linkModelName + '>key}',
                                text: '{' + this.linkModelName + '>text}',
                                href: {
                                    parts: [this.linkModelName + '>key', this.oNavigationProperty + '/' + this.oNavigationPropertyEntityTypeObject['$Key'][0]],
                                    formatter: (key, primaryId) => {
                                        let oNavigationPropertyEntityTypeObjectKey = this.oNavigationPropertyEntityTypeObject['$Key'][0];
                                        let param = [];
                                        param[oNavigationPropertyEntityTypeObjectKey] = primaryId;
                                        return window.getGlobalRoute().getURL(key, param);
                                    }
                                },
                                target: '{' + this.linkModelName + '>target}'
                            })
                        }
                        , selectionItems: {
                            path: this.linkModelName + '>/links',
                            template: new P13nSelectionItem({
                                columnKey: '{' + this.linkModelName + '>key}',
                                selected: '{' + this.linkModelName + '>selected}',
                            })
                        }, changeSelectionItems: (oEvent) => {
                            oEvent.getParameter('items').some((oItem, k) => {
                                this.oLinksModel.setProperty('/links/' + k + '/selected', oItem.selected);
                            });
                        }
                    })
                ],
                ok: (oEvent) => {
                    this.applySelectedLinks();
                    this._oResponsivePopover.setModal(false);
                    oEvent.getSource().close();
                    this._oSelectDialog.destroy();
                    this._oSelectDialog = undefined;
                },
                cancel: (oEvent) => {
                    this.cancelSelectedLinks();
                    this._oResponsivePopover.setModal(false);
                    oEvent.getSource().close();
                    this._oSelectDialog.destroy();
                    this._oSelectDialog = undefined;
                },
                reset: () => {

                },
            }).addStyleClass('sapUiSizeCompact');
            this._oResponsivePopover.addDependent(this._oSelectDialog);
        }
        this._oSelectDialog.open();
    }
    return SmartLink;
}, true);
