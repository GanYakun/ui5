/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
    'sap/ui/base/Object',
    'o3/sap/ui/comp/providers/TokenParser',
    'sap/m/Token',
], function (Object, TokenParser, Token) {
    "use strict";
    var _TokenParser = Object.extend('o3.library.control.smart.smartfield._TokenParser', {
        constructor: function (sDefaultOperation) {
            this.oTokenParser = new TokenParser(sDefaultOperation);
        }
    });

    _TokenParser.prototype.getTokenByText = function (oKeyField, sText) {
        var oToken;
        for (var k in this.oTokenParser.getOperations()) {
            var item = this.oTokenParser.getOperations()[k];
            if (item.match(sText)) {
                var range = item.getConditionData(sText, oKeyField);
                range.keyField = oKeyField;

                var text = item.getFilledTemplate(sText, oKeyField);
                oToken = new Token({
                    key: jQuery.sap.uid() + oKeyField,
                    text: text,
                    tooltip: text
                }).data('range', range);

                return oToken;
            }
        }

        //默认表达式
        sText = TokenParser._templateReplace(this.oTokenParser._mOperations[this.oTokenParser._sDefaultOperation].template, [sText]);
        var item = this.oTokenParser._mOperations[this.oTokenParser._sDefaultOperation];
        if (item.match(sText)) {
            var range = item.getConditionData(sText, oKeyField);
            range.keyField = oKeyField;
            var text = item.getFilledTemplate(sText, oKeyField);
            oToken = new Token({
                key: jQuery.sap.uid() + oKeyField,
                text: text,
                tooltip: text
            }).data('range', range);

            return oToken;
        }

        return null;
    }

    return _TokenParser;
}, true);