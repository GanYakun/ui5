sap.ui.define([
  'sap/m/DialogRenderer',
  'sap/ui/model/json/JSONModel',
  'sap/m/upload/Uploader',
  'sap/m/ObjectStatus',
  'sap/m/library',
  'sap/ui/core/ValueState',
  'sap/m/Button',
  'sap/m/upload/UploadSetItem',
  'sap/m/Dialog',
  'sap/m/DialogType',
  'sap/ui/core/IconPool',
  'sap/m/Text',
  'sap/m/upload/UploadSet',
  'sap/m/OverflowToolbar',
  'sap/m/ToolbarSpacer'
], function(DialogRenderer, JSONModel, Uploader, ObjectStatus, MobileLibrary, ValueState, Button, UploadSetItem, Dialog, DialogType, IconPool, Text, UploadSet, OverflowToolbar, ToolbarSpacer){
  "use strict";

  var UploadState = MobileLibrary.UploadState;

  var CustomUploader = Uploader.extend("o3.library.control.fileuploaddialog.CustomUploader", {
    metadata: {},
    terminateItem: function(oItem){
      this.fireUploadAborted({item: oItem});
    }
  });

  var FileUploadDialog = Dialog.extend("o3.library.control.fileuploaddialog.FileUploadDialog", {
    metadata: {
      properties: {
        uploadSignatureUrl: {type: "string", group: "Misc", defaultValue: null},
        uploadButtonConfigUrl: {type: "string", group: "Misc", defaultValue: null},
      },
    },
    renderer: {
      apiVersion: 2,
      render: DialogRenderer.render
    },
    constructor: function(){
      var defaultOptions = {
        title: 'Upload',
        type: 'Standard',
        // resizable: true,
        // draggable: true,
        contentWidth: '80rem',
        contentHeight: '50rem',
      };
      arguments[0] = $.extend({}, defaultOptions, arguments[0]);
      Dialog.apply(this, arguments);
    }
  });

  FileUploadDialog.prototype.open = function(){

    Dialog.prototype.open.call(this);
  }
  FileUploadDialog.prototype.close = function(force){
    this._checkUnfinishedWorkAndCloseDialog(force);
  }

  FileUploadDialog.prototype.init = function(){
    this._oRb = sap.ui.getCore().getLibraryResourceBundle('o3.library.i18n');

    Dialog.prototype.init.call(this);
    FileUploadDialog.prototype._initUI.call(this);
    FileUploadDialog.prototype._initFileSelect.call(this);
  }

  FileUploadDialog.prototype._initUI = function(){
    var that = this;

    this.setEscapeHandler(this._checkUnfinishedWorkAndCloseDialog.bind(that));
    this.attachAfterOpen(this._bindUploadButton.bind(this));
    this.attachAfterClose(function(){
      that.destroy();
      that.oUploadSet.destroy();
      delete that.oUploadSet;
    });

    this.oUploadButtonId = this.getId() + "_UploadDialog_uploadButtonId";

    var toolbar = new OverflowToolbar({
      content: [
        new ToolbarSpacer(),
        new Button({
          id: this.oUploadButtonId,
          text: 'Select'
        }).addStyleClass('como-hide')
      ]
    });
    this.oUploadSet = new UploadSet({
      // instantUpload: false
      toolbar: toolbar
    });

    this.oUploadButton = new Button({
      text: '开始上传',
      enabled: false,
      press: function(){
        that.oUploader.start();
      }
    });
    toolbar.addContent(this.oUploadButton);
    this.oUploadSet.getDefaultFileUploader().setEnabled(false);
    this.oUploadSet.getDefaultFileUploader().setButtonText(this._oRb.getText('SELECT_FILE'));
    this.oUploadSet.getDefaultFileUploader().setTooltip(this._oRb.getText('SELECT_FILE'));

    this.addContent(this.oUploadSet);
  }

  FileUploadDialog.prototype._openMessageDialog = function(message, callback){
    var dialogTmp = new Dialog({
      title: "注意",
      escapeHandler: function(){
      },
      content: new Text({text: message}),
      type: DialogType.Message,
      icon: IconPool.getIconURI("message-information"),
      buttons: [
        new Button({
          text: "确定",
          press: function(){
            callback && callback();

            dialogTmp.close();
            dialogTmp.destroy();
          }
        })
      ]
    });
    dialogTmp.open();
  }
  FileUploadDialog.prototype._initFileSelect = function(){
    var that = this;
    this.oUploadSet.attachAfterItemAdded(function(oEvent){
      var oItem = oEvent.getParameter('item');
      that.oUploadSet.addItem(oItem);

      var reader = new FileReader();
      reader.onload = function(e){
        oItem.setThumbnailUrl(e.target.result);
      };
      reader.readAsDataURL(oItem.getFileObject());

      var avaliableCount = 0;
      that.oUploadSet.getItems().some(function(oItem){
        if(oItem.getVisibleEdit()){
          avaliableCount++;
        }
      });

      if(that.oUploadConfig.multiple == false && avaliableCount > 1){
        that._openMessageDialog('选择的文件已达到最大数量!', function(){
          that.oUploadSet.removeItem(oItem);
        });
      }else{
        if(oItem.getUploadState() == UploadState.Ready){
          var fileObject = oItem.getFileObject();
          fileObject.ui5FileReady = true;//设置一个标志位,有这个类型的 才会出现 文件类型不正确对话框
          fileObject.ui5ItemId = oItem.getId();//把ui5 item id 放到file对象里作为mapping
          // that.oUploader.addFile(new plupload.File(fileObject));
          that.oUploader.addFile(fileObject);
        }
        that._checkUploadButton.call(that);
      }
    });

    this.oUploadSet.attachAfterItemRemoved(function(oEvent){
      var oItem = oEvent.getParameter('item');
      that.oUploader.files.some(function(_file){
        if(_file.getSource().getSource().ui5ItemId == oItem.getId()){
          try{
            that.oUploader.removeFile(_file);//防止plupload抛异常
          }catch(e){

          }
          return false;
        }
      });
      that._checkUploadButton.call(that);
    });

    this.oUploadSet.attachFileTypeMismatch(function(oEvent){
      var oItem = oEvent.getParameter('item');
      // that._setUploadError(oItem, '文件类型不正确');
      setTimeout(function(){
        if(oItem.getFileObject().ui5FileReady){
          that._openMessageDialog('文件类型不正确!', function(){
            that.oUploadSet.removeItem(oItem);
          });
        }
      });

    });
  }

  FileUploadDialog.prototype._checkUnfinishedWorkAndCloseDialog = function(force){
    var that = this;
    if(force){
      Dialog.prototype.close.call(that);
      return;
    }
    //检查是否有未完成的任务
    var pendingIdx = that.oUploader.files.findIndex(function(_file){
      return _file.status !== plupload.DONE;
    });
    if(pendingIdx >= 0){
      if(!that.oConfirmEscapePreventDialog){
        that.oConfirmEscapePreventDialog = new Dialog({
          title: "注意",
          content: new Text({text: "还有未上传的任务!"}),
          type: DialogType.Message,
          icon: IconPool.getIconURI("message-information"),
          buttons: [
            new Button({
              text: "确定",
              press: function(){
                that.oConfirmEscapePreventDialog.close();
              }.bind(that)
            })
          ]
        });
      }
      that.oConfirmEscapePreventDialog.open();
    }else{
      Dialog.prototype.close.call(that);
    }
  }

  FileUploadDialog.prototype._checkUploadButton = function(){
    var that = this;
    var _idx = that.oUploadSet.getItems().findIndex(function(oItem){
      return oItem.getUploadState() == UploadState.Ready;
    });
    that.oUploadButton.setEnabled(_idx >= 0);
  }
  FileUploadDialog.prototype._setUploadError = function(oItem, message){
    oItem.removeAllStatuses();
    oItem.addStatus(new ObjectStatus({
      text: message,
      state: ValueState.Error,
      icon: 'sap-icon://message-error',
      active: false
    }));
    oItem.setVisibleEdit(false);
    oItem.setUploadState(UploadState.Complete);
  }
  FileUploadDialog.prototype._get_suffix = function(filename){
    var pos = filename.lastIndexOf('.');
    var suffix = '';
    if(pos != -1){
      suffix = filename.substring(pos);
    }
    return suffix;
  }
  FileUploadDialog.prototype._bindUploadButton = function(){
    var that = this;
    $.ajax({
      type: 'get',
      async: false,
      url: this.getUploadButtonConfigUrl(),
      dataType: 'json',
      success: function(btnConfig){
        that.oUploadConfig = btnConfig;
        if(btnConfig.multiple == false){
          that.oUploadSet.getDefaultFileUploader().setMultiple(false);
        }
        that.oUploadSet.getDefaultFileUploader().setEnabled(true);

        that.oUploadSet.setFileTypes(btnConfig.fileTypes);
        that.oUploadSet.setMaxFileSize(btnConfig.maxFileSize);

        that.oUploader = new plupload.Uploader({
          runtimes: 'html5',
          browse_button: that.oUploadButtonId,
          url: btnConfig.uploadUrl,
          init: {
            FilesAdded: function(up, files){

            },
            BeforeUpload: function(up, file){
              var oItem = that.oUploadSet.getItems().find(function(oItem){
                return file.getSource().getSource().ui5ItemId == oItem.getId();
              });
              oItem.setUploadState(UploadState.Uploading);

              $.ajax({
                type: 'get',
                async: false,
                url: that.getUploadSignatureUrl(),
                dataType: 'json',
                success: function(sign){
                  var oItem = that.oUploadSet.getItems().find(function(oItem){
                    return file.getSource().getSource().ui5ItemId == oItem.getId();
                  });

                  var filename = oItem.getFileName();
                  var new_multipart_params = {
                    // 'key': sign.dir + '/' + '${filename}',
                    'key': sign.dir + sign.fileName + that._get_suffix(filename),
                    'policy': sign.policy,
                    'OSSAccessKeyId': sign.accessid,
                    'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                    'callback': sign.callback,
                    'signature': sign.signature,
                  };
                  up.setOption({
                    'url': sign.host,
                    'multipart_params': new_multipart_params
                  });
                },
                error: function(rsp){
                  console.log(rsp);
                }
              });
            },
            UploadProgress: function(up, file){
              that.oUploadSet.getItems().some(function(oItem){
                if(file.getSource().getSource().ui5ItemId == oItem.getId()){
                  oItem.setProgress(file.percent);
                  return false;
                }
              });
            },
            FileUploaded: function(up, file, info){
              var oItem = that.oUploadSet.getItems().find(function(oItem){
                return file.getSource().getSource().ui5ItemId == oItem.getId();
              });

              if(info.response){
                var response = JSON.parse(info.response);
                if(response.ImageUrl){
                  oItem.setThumbnailUrl(response.ImageUrl);

                  oItem.removeAllStatuses();
                  oItem.addStatus(new ObjectStatus({
                    text: '上传成功',
                    state: ValueState.Success,
                    icon: 'sap-icon://message-success',
                    active: false
                  }));
                  oItem.setVisibleEdit(false);
                  oItem.setUploadState(UploadState.Complete);

                  that._checkUploadButton.call(that);
                }
              }
            },
            Error: function(up, err){
              that._checkUploadButton.call(that);

              console.log('UploadFile error', up, err);
              if(err.file){
                var file = err.file;
                var oItem = that.oUploadSet.getItems().find(function(oItem){
                  return file.getSource().getSource().ui5ItemId == oItem.getId();
                });
                if(oItem){
                  var response = jQuery(err.response);
                  that._setUploadError(oItem, response.find('Message').text());
                }
              }
            }
          }
        });
        that.oUploader.init();
      }
    });
  }

  return FileUploadDialog;
});