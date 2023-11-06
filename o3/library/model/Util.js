sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        // 数字类型校验
        CheckNumeric: function (oSource) {
            if (!oSource.getParent())
                return;

            var smartField = oSource.getParent(),
                oFieldInfo = smartField.oFieldInfo,
                maxLengh = oFieldInfo.$Precision ? oFieldInfo.$Precision : oFieldInfo.$MaxLength,
                minLength = oFieldInfo.$Scale,
                _number = Number(oSource.getValue()),
                maxValue,
                minValue;

            if (oFieldInfo["$Type"] === "Edm.Int16") {
                minValue = -32768;
                maxValue = 32767;
            } else if (oFieldInfo["$Type"] === "Edm.Int32") {
                minValue = -2147483648;
                maxValue = 2147483647;
            } else if (oFieldInfo["$Type"] === "Edm.Int64") {
                minValue = -9223372036854775808;
                maxValue = 9223372036854775808;
            }
            if (this.isNullable) {
                if (oSource.getValue() === "") {
                    smartField.setValueState("Error");
                    return false;
                } else {
                    smartField.setValueState("None");
                }
            }
            if (!isNaN(_number)) {
                let _strNumber = _number.toString().split(".");
                if (minValue && maxValue) {
                    if (_number >= minValue && _number <= maxValue) {
                        smartField.setValueState("None");
                    } else {
                        smartField.setValueState("Error");
                        return false;
                    }
                } else {
                    if (_strNumber[0].length > maxLengh || (_strNumber[1] && _strNumber[1].length > minLength)) {
                        smartField.setValueState("Error");
                        return false;
                    } else {
                        smartField.setValueState("None");
                    }
                }
            } else {
                oSource.setValueState("Error");
                return false;
            }
            return true;
        },

        // String类型校验
        CheckString: function (oSource) {
            if (!oSource.getParent())
                return;

            var smartField = oSource.getParent(),
                oFieldInfo = smartField.oFieldInfo,
                maxLengh = oFieldInfo.$MaxLength || oFieldInfo.$Precision,
                sLength = oSource.getValue().length;
            if (oFieldInfo.isNullable) {
                if (oSource.getValue() === "") {
                    smartField.setValueState("Error");
                    return false;
                } else {
                    smartField.setValueState("None");
                }
            } else if (sLength > maxLengh) {
                smartField.setValueState("Error");
                return false;
            } else {
                smartField.setValueState("None");
            }
            return true;
        },

        // 判断是否是数字类型
        isNumic: function (type) {
            var mMethods = [
                "Edm.Decimal",
                "Edm.Double",
                "Edm.Float",
                "Edm.Single",
                "Edm.Int16",
                "Edm.Int32",
                "Edm.Int64",
                "Edm.Byte"
            ];
            return mMethods.includes(type);
        }

    };
});