/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

//Provides class sap.ui.model.odata.v4.lib._Requestor
sap.ui.define([
  'sap/ui/core/message/Message',
  'sap/ui/core/MessageType'
], function(Message, MessageType){
  "use strict";
  var oContext = undefined;
  var oExtensionAPI = undefined;

  function Requestor(oExtensionAPI, oContext){
    this.oContext = oContext;
    this.oExtensionAPI = oExtensionAPI;
  }

  Requestor.prototype.showMessageDialog = function(oMessages){
    if(oMessages.length === 0){
      return true;
    }
    var messageHandler = this.oExtensionAPI._controller._editFlow.getMessageHandler();
    var oMessageManager = sap.ui.getCore().getMessageManager();
    oMessages.some(oMessage => {
      oMessageManager.addMessages(
        new Message({
          message: oMessage.message,
          type: oMessage.type ? oMessage.type : MessageType.Success,
          target: "",
          persistent: true,
          code: oMessage.code ? oMessage.code : 200
        })
      );
    });
    messageHandler.showMessageDialog();
    return false;
  }

  Requestor.prototype.buildMessages = function(responses){
    var that = this;
    var oMessages = [];
    var hasError = false;
    responses.forEach(function(item){
      if(item.status >= 300){
        hasError = true;
        var responseJson = JSON.parse(item.responseText);
        oMessages.push({
          message: responseJson.error.message,
          code: item.status,
          type: MessageType.Error
        });
      }else{
        var msg = {
          message: item.responseText,
          code: item.status,
          type: MessageType.Success
        };
        if(!msg.message && item.headers && item.headers['sap-messages']){
          var responseJson = JSON.parse(item.headers['sap-messages']);
          if(responseJson instanceof Array){
            responseJson.some(rsp => {
              msg.message = rsp.message;
              oMessages.push(msg);
            });
          }
        }
      }
    });

    that.showMessageDialog(oMessages);
    return hasError;
  }

  Requestor.prototype.request = function(method, uri, body){
    var fullUri = this.getFullUrl(uri);
    var queryParams = this.oContext.oModel.oRequestor.sQueryParams;
    if(fullUri.indexOf('?') !== -1){
      queryParams = '&' + queryParams.substr(1);
    }
    if(method === 'GET'){
      return this.oContext.oModel.oRequestor.request(
        'GET',
        fullUri + queryParams
      );
    }else if(method === 'POST'){
      console.log(method, body);
    }
  }

  Requestor.prototype.get = function(uri){
    return this.request('GET', uri);
  }

  Requestor.prototype.getFullOdataUrl = function(uri, boundContext){
    if(uri.indexOf('/') === 0){
      uri = uri.substr(1);
    }

    var fullUri = '';
    if(boundContext){
      fullUri = this.oContext.oModel.oRequestor.sServiceUrl + this.oContext.sPath.substr(1) + '/' + uri;
    }else{
      fullUri = this.oContext.oModel.oRequestor.sServiceUrl + uri;
    }
    var queryParams = this.oContext.oModel.oRequestor.sQueryParams;
    if(fullUri.indexOf('?') !== -1){
      queryParams = '&' + queryParams.substr(1);
    }
    return fullUri + queryParams;
  }

  Requestor.prototype.getFullUrl = function(uri){
    var fullUri = '';
    uri = this.processUri(uri);
    if(uri.indexOf('/') === 0){
      fullUri = uri.substr(1);
    }else{
      fullUri = this.oContext.sPath.substr(1) + '/' + uri;
    }
    return fullUri;
  }

  Requestor.prototype.sendBatch = function(aRequests, sGroupId){
    var that = this;
    if(!sGroupId){
      sGroupId = '$auto';
    }
    var mHeaders = that.oContext.oModel.oRequestor.mHeaders;
    mHeaders['Accept'] = 'application/json;odata.metadata=minimal;IEEE754Compatible=true';
    mHeaders['Content-Type'] = 'application/json;charset=UTF-8;IEEE754Compatible=true';

    if(Array.isArray(aRequests)){
      aRequests.some(function(request){
        if(Array.isArray(request)){
          request.some(function(request2){
            if(request2.uri){
              request2.url = that.getFullUrl(request2.uri);
              delete request2.uri;
            }
            request2.headers = $.extend(request2.headers, mHeaders);
          });
        }else{
          if(request.uri){
            request.url = that.getFullUrl(request.uri);
            delete request.uri;
          }
          request.headers = $.extend(request.headers, mHeaders);
        }
      });
    }else{
      if(aRequests.uri){
        aRequests.url = that.getFullUrl(aRequests.uri);
        delete aRequests.uri;
      }
      aRequests.headers = $.extend(aRequests.headers, mHeaders);
    }
    return new Promise(function(resolve, reject){
      that.oContext.oModel.oRequestor.sendBatch(aRequests, sGroupId).then(responses => {
        var hasError = that.buildMessages(responses);
        resolve({responses, hasError});
      });
    });
  }

  Requestor.prototype.processUri = function(option){
    if(typeof option == 'string'){
      return option;
    }
    var url = option.path;
    var params = [];
    for(var key in option.parameters){
      var value = option.parameters[key];
      if(typeof value == 'object'){
        if(key === '$expand'){
          params.push('$expand=' + this.processExpand(value));
        }
      }else{
        params.push(key + '=' + value);
      }
    }
    return url + '?' + params.join('&');
  }

  Requestor.prototype.processExpand = function(expand){
    var rtn = [];
    for(var entity in expand){
      var param = expand[entity];
      var params = [];
      for(var key in param){
        var value = param[key];
        if(typeof value == 'string'){
          params.push(key + '=' + value);
        }else{
          params.push('$expand=' + this.processExpand(value));
        }
      }
      rtn.push(entity + '(' + params.join(';') + ')');
    }
    return rtn.join(',');
  }

  return Requestor;
}, /* bExport= */false);