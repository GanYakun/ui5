sap.ui.define([
	'sap/m/ColumnListItem',
	'sap/ui/core/Item',
	'sap/m/Text',
	'sap/m/Input',
	'sap/m/ComboBox',
	'sap/m/MultiComboBox'
], function(ColumnListItem, Item, Text, Input, ComboBox, MultiComboBox) {
	"use strict";
	var FactoryDefinition = {
		factory: function(id, context) {
			var oTemplate = new Item({
				text: "{Text}"
			});
			// var oContext = context.getProperty("Control");
			if (1) {
				return new ColumnListItem({
          // TODO：获取columnItems 的值去创建不同的控件
					cells: [new Text({
							text: "{productId}"
						}),
						new Text({
							text: "{productTypeId}"
						}),
						new Text({
							text: "{productName}"
						}),
						new Input({
							value: "{internalName}",
							editable: false
						}),
						new Input({
							value: "{description}",
							editable: false
						}),
						new Input({
							value: "{createdDate}",
							editable: false
						})
					]
				})
			} else if (oContext == "P") {
				return new ColumnListItem({
					cells: [new Text({
							text: "{ProductId}"
						}),
						new Text({
							text: "{Name}"
						}),
						new Text({
							text: "{Weight}"
						}),
						new ComboBox({
							width: "100%",
							selectedKey: "{Availability}"
						}).bindAggregation("items", "/oValues", oTemplate)
					]
				})
			} else if (oContext == "M") {
				return new ColumnListItem({
					cells: [new sap.m.Text({
							text: "{ProductId}"
						}),
						new Text({
							text: "{Name}"
						}),
						new Text({
							text: "{Weight}"
						}),
						new MultiComboBox({
							selectedKeys: ["{Availability}"]
						}).bindAggregation("items", "/oValues", oTemplate)
					]
				})
			}
		}
	};
	return FactoryDefinition;
}, /* bExport= */ true);