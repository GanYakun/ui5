/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([], function () {
    "use strict";

    var _Suggestion = function () {

    }
    _Suggestion.prototype.attachSuggestion = function (oInput, AnnotationHelper) {
        if (oInput.oFieldData && oInput.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']
            && oInput.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath']) {

            oInput.setShowSuggestion(true);
            oInput.setShowTableSuggestionValueHelp(true);
            oInput.attachSuggest((oEvent) => {
                let sTerm = oEvent.getParameter('suggestValue');
                this.bindSuggestion(oInput, AnnotationHelper, sTerm);
            });
        }
    }
    _Suggestion.prototype.bindSuggestion = function (oInput, AnnotationHelper, sTerm) {
        var that = this;
        let oCollectionPath = oInput.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['CollectionPath'];
        let oCollectionPathEntityType = AnnotationHelper.getEntityTypeByEntitySet(oCollectionPath);
        let Parameters = oInput.oFieldData['@com.sap.vocabularies.Common.v1.ValueList']['Parameters'];
        let oCollectionPathObject = AnnotationHelper.getEntityTypeObject(AnnotationHelper.getNameSpace() + oCollectionPathEntityType);
        //过滤Parameters里类型是String的字段，才作为搜索条件匹配
        let ParametersNew = [];
        Parameters.some((parameter) => {
            if (oCollectionPathObject[parameter['ValueListProperty']]
                && oCollectionPathObject[parameter['ValueListProperty']]['$Type'] === 'Edm.String') {
                ParametersNew.push(parameter);
            }
        });

        if (Parameters.length) {
            let aFilters = [];
            ParametersNew.some((parameter) => {
                aFilters.push(new sap.ui.model.Filter({
                    path: parameter['ValueListProperty'],
                    operator: 'Contains',
                    value1: sTerm
                }));
            });
            let oFilters = new sap.ui.model.Filter({
                filters: aFilters,
                and: false
            });

            if (this._bindSuggestionRowsed) {
                oInput.getBinding('suggestionRows').filter(oFilters);
                return;
            }
            this._bindSuggestionRowsed = true;

            let listItem = new sap.m.ColumnListItem();
            Parameters.some((parameter) => {
                let label = parameter["@com.sap.vocabularies.Common.v1.Label"];
                if (!label && oCollectionPathEntityType) {//先读valuelist parameters里的,没有的话读全局的
                    label = AnnotationHelper.getFieldLabel(oCollectionPathEntityType, parameter['ValueListProperty']);
                }

                let column = new sap.m.Column({
                    width: that.getWidth(oInput, 15)
                });
                column.setHeader(new sap.m.Text({
                    text: label
                }));
                oInput.addSuggestionColumn(column);
                listItem.addCell(new sap.m.Text({
                    text: {
                        path: parameter['ValueListProperty'],
                        type: 'sap.ui.model.odata.type.String'
                    }
                }));
            });
            oInput.bindSuggestionRows({
                path: '/' + oCollectionPath,
                filters: oFilters,
                length: 20,
                template: listItem
            });
        }
        this._setSuggestWidth(oInput)
    }

    _Suggestion.prototype.getWidth = function (oInput, iMax, iMin) {
        var oFieldInfo = oInput.oField.oFieldInfo;
        var sWidth = oFieldInfo.$MaxLength || oFieldInfo.$Precision || 18, iWidth, bIsDefaultMin;
        if (!iMax) {
            iMax = 30;
        }
        if (!iMin) {
            iMin = 3;
            bIsDefaultMin = true;
        }
        // Force set the width to 9em for date fields
        if (oFieldInfo.$Type === "Edm.DateTimeOffset" || oFieldInfo.displayFormat === "DateTime") {
            sWidth = "9em";
        } else if (sWidth) {
            // Use Max width for description&Id and descriptionOnly use-case to accommodate description texts better on the UI
            if (oFieldInfo.$Type === "Edm.String") {
                sWidth = "Max";
            }

            // Use max width if "Max" is set in the metadata or above
            if (sWidth === "Max") {
                sWidth = iMax + "";
            }
            iWidth = parseInt(sWidth);
            if (!isNaN(iWidth)) {
                // Add additional .75 em (~12px) to avoid showing ellipsis in some cases!
                iWidth += 0.75;
                // use a max initial width of 30em (default)
                if (iWidth > iMax) {
                    iWidth = iMax;
                } else if (iWidth < iMin) {
                    // use a min width of 3em (default)
                    iWidth = iMin;
                }
                sWidth = iWidth + "em";
            } else {
                // if NaN reset the width so min width would be used
                sWidth = null;
            }
        }
        if (!sWidth) {
            sWidth = iMax + "em";
        }
        return sWidth;
    }

    _Suggestion.prototype._setSuggestWidth = function (oInput) {
        var aCols = oInput.getSuggestionColumns(),
            iLen = aCols.length,
            fSuggestWidth = 0;
        for (var i = 0; i < iLen; i++) {
            var sMinScreenWidth = "1px", sWidth = aCols[i].getWidth();
            if (sap.ui.Device.system.phone) {
                sWidth = undefined;
                if (i >= 2) {
                    sMinScreenWidth = (i + 1) * 10 + "rem";
                }
            }
            if (sWidth) {
                fSuggestWidth += parseFloat(sWidth.substring(0, sWidth.length - 2));
            }
        }
        if (fSuggestWidth > 0) {
            oInput.setMaxSuggestionWidth(fSuggestWidth + iLen + "em");
        }
    }
    return _Suggestion;
});