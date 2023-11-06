sap.ui.define([
  'o3/library/lib/Requestor',
  'sap/m/MessageBox',
  'sap/fe/core/CommonUtils'
], function(Requestor, MessageBox, CommonUtils){
  "use strict";
  var DeleteAction = {};
  var that = {
    oRequestor: undefined,
    oPopDialog: undefined,
    oTable: undefined,
    oContext: undefined
  };

  function executeCommon(oExtensionAPI, oContext, aSelectedContexts, callback){
    that.oRequestor = new Requestor(oExtensionAPI, oContext);
    that.oContext = oContext;
    console.log(oContext, aSelectedContexts);

    //是否删除所选对象？
    var deleteText = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL");
    MessageBox.warning(deleteText, {
      title: CommonUtils.getTranslatedText('C_COMMON_OBJECT_PAGE_DELETE'),
      actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
      emphasizedAction: MessageBox.Action.OK,
      onClose: sAction => {
        if(sAction == MessageBox.Action.CANCEL){
          return;
        }
        var requests = [];
        aSelectedContexts.some(function(item){
          if(item.sPath){
            var actionName = 'com.dpbird.delete' + item.oBinding.sPath;
            requests.push({
              method: 'POST',
              uri: item.sPath + '/' + actionName,
              body: {}
            });
          }
        });
        if(requests.length){
          callback && callback(requests);
        }
      }
    });
  }

  DeleteAction.execute = function(oContext, aSelectedContexts){
    executeCommon(this, oContext, aSelectedContexts, requests => {
      that.oRequestor.sendBatch(requests).then(response => {
        that.oContext.refresh();
      });
    });
  }

  DeleteAction.executeWithChangeSet = function(oContext, aSelectedContexts){
    executeCommon(this, oContext, aSelectedContexts, requests => {
      that.oRequestor.sendBatch([requests], 'deleteAction').then(response => {
        that.oContext.refresh();
      });
    });
  }

  return DeleteAction;
});