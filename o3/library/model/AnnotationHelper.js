/*!
 * ${copyright}
 * @version ${version}
 *
 */
sap.ui.define([], function () {
    "use strict";
    var _oNamespace = undefined;
    var _oData = undefined;
    var _dataSourcesUrl = undefined;
    var _oCommonNamespace = 'com.sap.vocabularies.Common.v1.';
    var _oFieldLables = [];
    var _oEntityTypeEntitySetMapping = [];
    var AnnotationHelper = function () {
        // nothing to do here.
    };

    AnnotationHelper.getCachedData = () => {
        return _oData;
    }

    /**
     *
     * @param oDataModel
     * @returns {Promise<unknown>}
     * eg:
     AnnotationHelper.init(this.getModel()).then(function (data) {
                console.log(data);
             });
     */
    AnnotationHelper.init = (oDataModel) => {
        return new Promise((resolve, reject) => {
            // if (_oData && oDataModel && _dataSourcesUrl === oDataModel.sServiceUrl) {
            if (_oData && oDataModel && _dataSourcesUrl === o3Tool.cookie("edmConfigPath")) {
                _dataSourcesUrl = o3Tool.cookie("edmConfigPath");
                resolve(_oData);
            } else {
                if (oDataModel) {
                    var metaModel = oDataModel.getMetaModel();
                    metaModel.fetchData().then((data) => {
                        _dataSourcesUrl = o3Tool.cookie("edmConfigPath");
                        _oData = data;
                        resolve(_oData);
                    });
                }
            }
        });
    }
    /**
     * 获取 Odata NameSpace
     * @param oDataModel
     * @returns string
     * eg:
     AnnotationHelper.getNameSpace(this.getModel()).then(function (data) {
                console.log(data);
             });
     */
    AnnotationHelper.getNameSpace = () => {
        if (!_oNamespace) {
            if (_oData) {
                for (var key in _oData) {
                    if (_oData[key]['$kind'] === 'Schema') {
                        _oNamespace = key
                        break;
                    }
                }
                return _oNamespace;
            }
        }
        return _oNamespace;

    };
    /**
     *
     * @param oDataModel
     * @param entitySet
     * @returns {Promise<unknown>}
     * eg:
     AnnotationHelper.getEntityTypeByEntitySet(this.getModel(),'Products').then(function (data) {
                console.log( data);
             });
     */
    AnnotationHelper.getEntityTypeByEntitySet = (entitySet) => {
        if (_oData) {
            var Container = _oData['$EntityContainer'];
            if (Container && _oData[Container]) {
                var entityData = _oData[Container];
                if (entityData[entitySet]) {
                    return entityData[entitySet]['$Type'].replace(AnnotationHelper.getNameSpace(), '');
                }
            }
        }
    };
    AnnotationHelper.getNavigationPropertyBindingByEntitySet = (entitySet, navigationPropertyName) => {
        if (_oData) {
            var Container = _oData['$EntityContainer'];
            if (Container && _oData[Container]) {
                var entityData = _oData[Container];
                if (entityData[entitySet]) {
                    if (navigationPropertyName) {
                        if (entityData[entitySet]['$NavigationPropertyBinding']) {
                            return entityData[entitySet]['$NavigationPropertyBinding'][navigationPropertyName];
                        }
                        return false;
                    }
                    return entityData[entitySet]['$NavigationPropertyBinding'];
                }
            }
        }
    };
    AnnotationHelper.getEntityFieldAnnotation = (entityType, entityField) => {
        if (_oData) {
            if (_oData['$Annotations']) {
                return _oData['$Annotations'][AnnotationHelper.getNameSpace() + entityType + '/' + entityField];
            }
        }
    };

    AnnotationHelper.getEntityTypeAnnotation = (entityType) => {
        if (_oData) {
            if (_oData['$Annotations']) {
                return _oData['$Annotations'][entityType];
            }
        }
    };

    AnnotationHelper.getEntityTypeObject = (entityType) => {
        if (_oData) {
            return _oData[entityType];
        }
    };

    AnnotationHelper.getFieldLabel = (entityType, entityField) => {
        if (_oData) {
            var _cacheKey = entityType + '-' + entityField;
            if (_oFieldLables[_cacheKey]) {
                return _oFieldLables[_cacheKey];
            }

            _oFieldLables[_cacheKey] = '' + entityField;
            var fieldDataParameter = AnnotationHelper.getEntityFieldAnnotation(entityType, entityField);
            if (fieldDataParameter && fieldDataParameter['@com.sap.vocabularies.Common.v1.Label']) {
                _oFieldLables[_cacheKey] = fieldDataParameter['@com.sap.vocabularies.Common.v1.Label'];
            }
            return _oFieldLables[_cacheKey];
        }
    };

    AnnotationHelper.getFieldInfo = (entityType, entityField) => {
        if (_oData) {
            return _oData[AnnotationHelper.getNameSpace() + entityType][entityField];
        }
    };

    AnnotationHelper._getObject = function (sPath, oObject) {
        var oNode = oObject, aParts = sPath.split("/"), iIndex = 0;

        while (oNode && aParts[iIndex]) {
            oNode = oNode[aParts[iIndex]];
            iIndex++;
        }

        return oNode;
    };

    AnnotationHelper.isCommonValueListParameterInOut = function (oRecord) {
        return oRecord && oRecord['$Type'] && oRecord['$Type'] === _oCommonNamespace + 'ValueListParameterInOut';
    };

    // EntitySet是否可创建实体
    AnnotationHelper.isEntitySetCreatable = function (oRecord) {
        if (_oData) {
            var restriction = _oData.$Annotations[AnnotationHelper.getNameSpace() + "O3Container/" + oRecord];
            return restriction["@Org.OData.Capabilities.V1.InsertRestrictions"].Insertable;
        }
    };
    // EntitySet是否可更新
    AnnotationHelper.isEntitySetUpdatable = function (oRecord) {
        if (_oData) {
            var restriction = _oData.$Annotations[AnnotationHelper.getNameSpace() + "O3Container/" + oRecord];
            return restriction["@Org.OData.Capabilities.V1.UpdateRestrictions"].Updatable;
        }
    };
    // 字段是否可以创建
    AnnotationHelper.isPropertyUpdatable = function (oRecord, entityField) {
        if (_oData) {
            var restriction = _oData.$Annotations[AnnotationHelper.getNameSpace() + "O3Container/" + oRecord];
            var nonInsertableProperties = restriction["@Org.OData.Capabilities.V1.InsertRestrictions"].NonInsertableProperties;
            for (var i = 0; i < nonInsertableProperties.length; i++) {
                if (entityField === nonInsertableProperties[i].$PropertyPath) {
                    return false;
                }
            }
        }
        return true;
    };
    // 字段是否可更新
    AnnotationHelper.isPropertyUpdatable = function (oRecord, entityField) {
        if (_oData) {
            var restriction = _oData.$Annotations[AnnotationHelper.getNameSpace() + "O3Container/" + oRecord];
            var nonUpdatableProperties = [];
            if (restriction && restriction["@Org.OData.Capabilities.V1.UpdateRestrictions"]) {
                if (restriction["@Org.OData.Capabilities.V1.UpdateRestrictions"].NonUpdatableProperties) {
                    nonUpdatableProperties = restriction["@Org.OData.Capabilities.V1.UpdateRestrictions"].NonUpdatableProperties;
                }
            }
            for (var i = 0; i < nonUpdatableProperties.length; i++) {
                if (entityField === nonUpdatableProperties[i].$PropertyPath) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * 字段是否可过滤
     * @param entityType
     * @param entityField
     * @returns {boolean}
     */
    AnnotationHelper.isPropertyFilterable = function (entityType, entityField) {
        let oFieldInfo = AnnotationHelper.getEntityFieldAnnotation(entityType, entityField);
        if (oFieldInfo && oFieldInfo['@Org.OData.Capabilities.V1.FilterRestrictions']
            && oFieldInfo['@Org.OData.Capabilities.V1.FilterRestrictions']['Filterable']) {
            return true;
        }
        return false;
    };
    /**
     * 字段是否可排序分组
     * @param entityType
     * @param entityField
     * @returns {boolean}
     */
    AnnotationHelper.isPropertySortGoup = function (entityType, entityField) {
        let oFieldInfo = AnnotationHelper.getEntityFieldAnnotation(entityType, entityField);
        if (oFieldInfo && oFieldInfo['@Org.OData.Capabilities.V1.SortRestrictions']
            && oFieldInfo['@Org.OData.Capabilities.V1.SortRestrictions']['Sortable']) {
            return true;
        }
        return false;
    };
    /**
     * 字段是否必须在过滤时填写
     * @param entityType
     * @param entityField
     * @returns {boolean}
     */
    AnnotationHelper.isPropertyRequiresFilter = function (entityType, entityField) {
        if (AnnotationHelper.isPropertyFilterable(entityType, entityField)) {
            let oFieldInfo = AnnotationHelper.getEntityFieldAnnotation(entityType, entityField);
            if (oFieldInfo && oFieldInfo['@Org.OData.Capabilities.V1.FilterRestrictions']
                && oFieldInfo['@Org.OData.Capabilities.V1.FilterRestrictions']['RequiresFilter']) {
                return true;
            }
        }
        return false;
    };

    // 创建修改时，字段是否必输
    AnnotationHelper.isPropertyFieldControl = function (entityType, entityField) {
        var _fieldAnnotation = _oData["$Annotations"][AnnotationHelper.getNameSpace() + entityType + "/" + entityField];
        if (_fieldAnnotation && _fieldAnnotation["@com.sap.vocabularies.Common.v1.FieldControl"]) {
            return true
        } else {
            return false;
        }
    };

    // 获取字段类型
    AnnotationHelper.getFieldType = function (entityType, entityField) {
        if (_oData) {
            if (!entityField.includes("/"))
                return _oData[AnnotationHelper.getNameSpace() + entityType][entityField]["$Type"];
        }
    };

    /**
     * 获取外键对应的
     * @param property
     */
    AnnotationHelper.getNavigationPropertyByForeignKey = function (entityType, entityField) {
        var allFields = _oData[AnnotationHelper.getNameSpace() + entityType];
        var oNavigationProperty = '';
        for (var key in allFields) {
            if (allFields[key]['$ReferentialConstraint'] && allFields[key]['$ReferentialConstraint'][entityField]) {
                oNavigationProperty = key;
                break;
            }
        }
        return oNavigationProperty;
    }

    // 是否有配置valueList
    AnnotationHelper.hasValueList = function (entityType, entityField) {
        var fieldDataParameter = AnnotationHelper.getEntityFieldAnnotation(entityType, entityField);
        if (fieldDataParameter && fieldDataParameter['@com.sap.vocabularies.Common.v1.ValueList'] && fieldDataParameter['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {
            return true;
        }
        return false;
    }

    // 是否有单位
    AnnotationHelper.hasUnit = function (entityType, entityField) {
        var fieldDataParameter = AnnotationHelper.getEntityFieldAnnotation(entityType, entityField);
        if (fieldDataParameter && fieldDataParameter["@Org.OData.Measures.V1.Unit"] && fieldDataParameter["@Org.OData.Measures.V1.Unit"]["$Path"]) {
            return fieldDataParameter["@Org.OData.Measures.V1.Unit"]["$Path"];
        }
        return false;
    }

    // 是否是enum类型
    AnnotationHelper.isEnumeration = function (entityType, entityField) {
        if (_oData) {
            let propertyType = this.getFieldType(entityType, entityField);
            let enumitem = _oData[propertyType];
            let arr = [];
            if (_oData[this.getNameSpace() + entityType][entityField] && _oData[this.getNameSpace() + entityType][entityField]["$kind"] !== "Property") {
                return false;
            }
            if (enumitem) {
                if (enumitem.$kind)
                    delete enumitem.$kind;
                if (enumitem.$Key)
                    delete enumitem.$Key;
                for (var obj in enumitem) {
                    if (!_oData.$Annotations[propertyType + "/" + obj]) {
                        continue;
                    }
                    arr.push({
                        key: obj,
                        value: _oData.$Annotations[propertyType + "/" + obj]["@Org.OData.Core.V1.Description"]
                    });
                }
                return arr;
            }
            return false;
        }
    };

    AnnotationHelper.isCollectionNavigationProperty = function (entityType, entityField) {
        if (_oData) {
            debugger;
        }
    };

    // 获取Filter的annotation
    AnnotationHelper.getFiltersByAnnotation = function (entitySet, selectionKey) {
        if (_oData) {
            if (selectionKey === "*standard*") {
                return _oData.$Annotations[AnnotationHelper.getNameSpace() + AnnotationHelper.getEntityTypeByEntitySet(entitySet)]["@com.sap.vocabularies.UI.v1.SelectionVariant"];
            } else {
                let path = "@com.sap.vocabularies.UI.v1.SelectionVariant#" + selectionKey;
                // let path = _oData.$Annotations[AnnotationHelper.getNameSpace() + AnnotationHelper.getEntityTypeByEntitySet(entitySet)]["@com.sap.vocabularies.UI.v1.SelectionPresentationVariant"].SelectionVariant.$Path;
                return _oData.$Annotations[AnnotationHelper.getNameSpace() + AnnotationHelper.getEntityTypeByEntitySet(entitySet)][path];
            }
        }
        return false;
    };

    AnnotationHelper.getSelectionPresentationVariant = function (entitySet) {
        if (_oData) {
            return _oData.$Annotations[AnnotationHelper.getNameSpace() + AnnotationHelper.getEntityTypeByEntitySet(entitySet)]["@com.sap.vocabularies.UI.v1.SelectionPresentationVariant"];
        }
        return false;
    };

    // 是否配置了模板
    AnnotationHelper.isHaveTemplate = function (entitySet, entityType, entityField) {
        let oNavigationProperty = this.getNavigationPropertyByForeignKey(entityType, entityField);
        let oNavigationPropertyEntitySet = this.getNavigationPropertyBindingByEntitySet(entitySet, oNavigationProperty);
        let oNavigationPropertyEntityType = this.getEntityTypeByEntitySet(oNavigationPropertyEntitySet);
        let oNavigationPropertyEntityTypeObject = this.getEntityTypeObject(this.getNameSpace() + oNavigationPropertyEntityType);
        let oNavigationPropertyEntityAnnotation = this.getEntityTypeAnnotation(this.getNameSpace() + oNavigationPropertyEntityType);
        let template;

        if (oNavigationPropertyEntityAnnotation) {
            if (oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.ConnectedFields']) {
                template = oNavigationPropertyEntityAnnotation['@com.sap.vocabularies.UI.ConnectedFields']['Template'];
            }
            // 没有配置模板，不需要自己设置默认模板。。。
            // if (!template) {
            //     if (oNavigationPropertyEntityTypeObject['$Key']) {
            //         template = '({' + oNavigationPropertyEntityTypeObject['$Key'][0] + '})';
            //     }
            // }
            if (template) {
                return true
            } else {
                return false;
            }
        }
        return false;

    };

    AnnotationHelper.isSelectControl = function (entityType, entityField) {
        if (_oData) {
            if (_oData["$Annotations"][AnnotationHelper.getNameSpace() + entityType + "/" + entityField]
                && _oData["$Annotations"][AnnotationHelper.getNameSpace() + entityType + "/" + entityField]["@Common.ValueListWithFixedValues"]) {
                return true;
            }
            return false;
        }
    };

    AnnotationHelper.getSelectItems = function (entityType, entityField) {
        if (_oData) {
            let entityFieldAnnotation = _oData["$Annotations"][AnnotationHelper.getNameSpace() + entityType + "/" + entityField];
            if (entityFieldAnnotation) {
                let arr = []
                let oCollectionPath = entityFieldAnnotation["@com.sap.vocabularies.Common.v1.ValueList"]["CollectionPath"];
                let key = entityFieldAnnotation["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][0].ValueListProperty;
                let description = entityFieldAnnotation["@com.sap.vocabularies.Common.v1.ValueList"]["Parameters"][1].ValueListProperty;
                arr.push({
                    collection: oCollectionPath,
                    key: key,
                    text: description
                });
                return arr;
            }
        }
        return [];
    };

    AnnotationHelper.getNavEntityType = function (entitySet, entityField) {
        var entityType = this.getEntityTypeByEntitySet(entitySet);
        let _expand = entityField.split('/');
        if (_oData) {
            if (_expand.length === 2) {
                let type = _oData[this.getNameSpace() + entityType][_expand[0]]["$Type"];
                return type.split(".")[type.split(".").length - 1];
            }
            if (_expand.length === 3) {
                let type = _oData[this.getNameSpace() + entityType][_expand[0]]["$Type"];
                type = _oData[type][_expand[1]]["$Type"];
                return type.split(".")[type.split(".").length - 1];
            }
        }
    };

    AnnotationHelper.getForeignKeyInfo = function (oNavigationPropertyEntityType, navigationEntityType) {
        if (_oData) {
            var obj = {};
            var referentialConstraint = _oData[this.getNameSpace() + oNavigationPropertyEntityType][navigationEntityType]["$ReferentialConstraint"];
            for (var key in referentialConstraint)
                obj["ReferencedProperty"] = referentialConstraint[key];
            obj["entitySet"] = this.getEntitySetByEntityType(navigationEntityType);

            return obj;
        }
    };

    AnnotationHelper.getAllFieldInfo = function (entitySet, entityField, flag) {
        var entityType;
        if (flag) {
            entityType = entitySet;
        } else {
            entityType = this.getEntityTypeByEntitySet(entitySet);
        }
        var oFieldAnnotation = this.getEntityFieldAnnotation(entityType, entityField);
        var oFieldInfo = this.getFieldInfo(entityType, entityField);
        var isHaveValueListCollection = this.hasValueList(entityType, entityField); // 搜索帮助是否有 列表选择
        var isNullable = this.isPropertyFieldControl(entityType, entityField); //必输项
        var isSortable = this.isPropertySortGoup(entityType, entityField); // 可过滤分组
        var isHaveUnit = this.hasUnit(entityType, entityField); //单位
        var isNavigationPropertyByForeignKey = this.getNavigationPropertyByForeignKey(entityType, entityField); // 外键，使用模板
        var isEnumeration = this.isEnumeration(entityType, entityField); // enumeration类型的数据
        // var isCollectionNavigationProperty = this.isCollectionNavigationProperty(); // NavigationProperty 是否是 Collection 的类型
        var isHaveTemplate = this.isHaveTemplate(entitySet, entityType, entityField); // 是否配置了模板
        return $.extend(
            { entityField: entityField },
            { entityType: entityType },
            oFieldAnnotation,
            oFieldInfo,
            { isHaveValueListCollection: isHaveValueListCollection },
            { isNullable: isNullable },
            { isSortable: isSortable },
            { isHaveUnit, isHaveUnit },
            { isNavigationPropertyByForeignKey, isNavigationPropertyByForeignKey },
            { isEnumeration: isEnumeration },
            { isHaveTemplate: isHaveTemplate }
        );
    }

    AnnotationHelper.getEntitySetByEntityType = function (entityType) {
        if (!_oEntityTypeEntitySetMapping[entityType]) {
            if (_oData) {
                var Container = _oData['$EntityContainer'];
                if (Container && _oData[Container]) {
                    var entityData = _oData[Container];
                    let _entityType = entityType.replace(AnnotationHelper.getNameSpace(), '');
                    for (let key in entityData) {
                        if (typeof (entityData[key]) == 'object' && entityData[key]['$kind'] && entityData[key]['$kind'] == 'EntitySet'
                            && entityData[key]['$Type'] == AnnotationHelper.getNameSpace() + _entityType) {
                            _oEntityTypeEntitySetMapping[entityType] = key;
                        }
                    }
                }
            }
        }
        return _oEntityTypeEntitySetMapping[entityType];
    }
    AnnotationHelper.getEntityBoundFunctionAction = function (entitySet) {
        let _oActionFunction = [];
        if (!_oData) {
            return _oActionFunction;
        }
        for (let key in _oData) {
            if (typeof (_oData[key]) == 'object' && _oData[key][0] && _oData[key][0]['$kind']
                && _oData[key][0]['$IsBound'] == true
                && _oData[key][0]['$Parameter']
                && (_oData[key][0]['$kind'] == 'Action' || _oData[key][0]['$kind'] == 'Function')) {
                var _entitySet = AnnotationHelper.getEntitySetByEntityType(_oData[key][0]['$Parameter'][0]['$Type']);
                if (!_oActionFunction[_entitySet]) {
                    _oActionFunction[_entitySet] = [];
                }
                if (!_oActionFunction[_entitySet][_oData[key][0]['$kind']]) {
                    _oActionFunction[_entitySet][_oData[key][0]['$kind']] = [];
                }
                var obj = _oData[key][0];
                obj['name'] = key.replace(AnnotationHelper.getNameSpace(), '');
                obj['text'] = _oData["$Annotations"][key] ? _oData["$Annotations"][key]["@com.sap.vocabularies.Common.v1.Label"] : key.replace(AnnotationHelper.getNameSpace(), '');
                _oActionFunction[_entitySet][_oData[key][0]['$kind']].push(obj);
            }
        }
        if (entitySet) {
            return _oActionFunction[entitySet];
        }
        return _oActionFunction;
    };

    // 获取SmartObjectPage header的模板
    AnnotationHelper.getObjectHeaderTemplate = function (entitySet) {
        var entityType = this.getEntityTypeByEntitySet(entitySet);
        var oEntityTypeAnnotation = _oData.$Annotations[_oNamespace + entityType];
        var oHeaderInfoAnnotation = oEntityTypeAnnotation["@UI.HeaderInfo"];
        var oHeaderFacetsAnnotation = oEntityTypeAnnotation["@UI.HeaderFacets"];
        if (!_oData) {
            return;
        }
        var oObjectHeaderTempalte = {
            headerInfo: {},
            headerFacets: []
        };
        if (oHeaderInfoAnnotation && oHeaderInfoAnnotation["Title"] && oHeaderInfoAnnotation["Title"]["Value"]) {
            if (oHeaderInfoAnnotation["Title"]["Value"]["$Path"]) {
                oObjectHeaderTempalte.headerInfo.spth_title = oHeaderInfoAnnotation["Title"]["Value"]["$Path"];
            } else {
                oObjectHeaderTempalte.headerInfo.string_title = oHeaderInfoAnnotation["Title"]["Value"];
            }
        }
        if (oHeaderInfoAnnotation && oHeaderInfoAnnotation["Description"] && oHeaderInfoAnnotation["Description"]["Value"]) {
            if (oHeaderInfoAnnotation["Description"]["Value"]["$Path"]) {
                oObjectHeaderTempalte.headerInfo.spth_description = oHeaderInfoAnnotation["Description"]["Value"]["$Path"];
            } else {
                oObjectHeaderTempalte.headerInfo.string_description = oHeaderInfoAnnotation["Description"]["Value"];
            }
        }
        if (oHeaderInfoAnnotation && oHeaderInfoAnnotation["ImageUrl"]) {
            if (oHeaderInfoAnnotation["ImageUrl"]["$Path"]) {
                oObjectHeaderTempalte.headerInfo.spth_imageUrl = oHeaderInfoAnnotation["ImageUrl"];
            } else {
                oObjectHeaderTempalte.headerInfo.string_imageUrl = oHeaderInfoAnnotation["ImageUrl"];
            }
        }
        if (oHeaderFacetsAnnotation) {
            oHeaderFacetsAnnotation.forEach(function (item) {
                if (item["$Type"] === "UI.ReferenceFacet" && item["Target"]) {
                    var sReferenceFacetTarget = item["Target"]["$AnnotationPath"];
                    var oFeildGroupAnnotation = oEntityTypeAnnotation[sReferenceFacetTarget];
                    // 为一组上下排列
                    if (oFeildGroupAnnotation && oFeildGroupAnnotation["$Type"] === "UI.FieldGroupType") {
                        var _oFieldGroup = [];
                        oFeildGroupAnnotation["Data"].forEach(function (element) {
                            _oFieldGroup.push({
                                title: element["Label"] ? element["Label"] : element["Value"]["$Path"],
                                value: element["Value"]["$Path"]
                            });
                        });
                        oObjectHeaderTempalte.headerFacets.push({
                            title: item["Label"],
                            fieldGroup: _oFieldGroup
                        });
                    }
                    // 为一列，上下排列，仅有一个字段，值为大号字体显示
                    if (oFeildGroupAnnotation && oFeildGroupAnnotation["Value"] && oFeildGroupAnnotation["Value"]["$Path"]) {
                        oObjectHeaderTempalte.headerFacets.push({
                            title: item["Label"],
                            dataPoint: {
                                title: oFeildGroupAnnotation["Title"] ? oFeildGroupAnnotation["Title"] : oFeildGroupAnnotation["Value"]["$Path"],
                                value: oFeildGroupAnnotation["Value"]["$Path"]
                            }
                        });
                    }
                }
            });
        }
        return oObjectHeaderTempalte;
    };

    // 获取外键的NavigationProperty
    AnnotationHelper.getReferentialConstraint = function (entitySet) {
        // TODO: 有外键的时候需要修改
        if (sap.ui.getCore().getModel("oMetadataModel")) {
            _oData = sap.ui.getCore().getModel("oMetadataModel").getData();
        }

        if (!_oData) {
            return;
        }

        function getEntityTypeBySet(entitySet) {
            if (_oData) {
                var Container = _oData['$EntityContainer'];
                if (Container && _oData[Container]) {
                    var entityData = _oData[Container];
                    if (entityData[entitySet]) {
                        return entityData[entitySet]['$Type'].replace(AnnotationHelper.getNameSpace(), '');
                    }
                }
            }
        }

        var entityType = getEntityTypeBySet(entitySet);
        var allFields = _oData[AnnotationHelper.getNameSpace() + entityType];
        var oNavigationProperty = '';
        for (var key in allFields) {
            if (allFields[key]['$ReferentialConstraint']) {
                for (var field in allFields[key]["$ReferentialConstraint"]) {
                    if (this.isHaveTemplate(entitySet, entityType, field)) {
                        oNavigationProperty += key + ",";
                    }
                }
            }
        }

        oNavigationProperty = oNavigationProperty.substring(0, oNavigationProperty.lastIndexOf(','));
        return oNavigationProperty;
    };

    return AnnotationHelper;
}, true);
