sap.ui.define([
  'sap/ui/core/Control',
  'sap/m/MenuButton',
  'sap/m/Menu',
  'sap/m/MenuItem',
  'sap/m/Button',
  'sap/m/MessageToast',
],function (Control, MenuButton, Menu, MenuItem, Button, MessageToast) {
  let fn = {
    insertToHeader() {
      this.oHeader = this.byId('header');

      let
        insertIndex = this.oHeader.indexOfContent(this.oTitle) + 1,
        oControl =  new Control({
          id: 'appMenu',
          dependents: {
            path:'rootData>/appMenu',
            factory: fn.menuButtonFactory.bind(this)
          }
        });

      this.oView.addDependent(oControl);
      oControl.getDependents().forEach(MenuButton => {
        this.oHeader.insertContent(MenuButton, insertIndex ++);
      });
    },
    menuButtonFactory(id, context) {
      if (context.getObject().subMenu) {
        return new MenuButton({
          id,
          text: '{rootData>text}',
          type: 'Transparent',
          layoutData: new sap.m.OverflowToolbarLayoutData({
            priority: 'Low'
          }),
          menu: new Menu({
            itemSelected: oEvent => {
              let
                oItem = oEvent.getParameter('item'),
                {text, navTo} = oItem.getBindingContext('rootData').getObject();

              fn.navTo.call(this, {text, navTo});
            },
            items: {
              path: 'rootData>subMenu', 
              factory: fn.menuItemsFactory.bind(this)
            }
          })
        });
      } else {
        return new Button({
          id,
          text: '{rootData>text}',
          type: 'Transparent',
          press: oEvent => {
            let
              oBtn = oEvent.getSource(),
              {text, navTo} = oBtn.getBindingContext('rootData').getObject();

            fn.navTo.call(this, {text, navTo});
          },
          layoutData: new sap.m.OverflowToolbarLayoutData({
            priority: 'Low'
          })
        })
      }
    },
    menuItemsFactory() {
      return new MenuItem({
        text: '{rootData>text}',
        items: {
          path: 'rootData>subMenu',
          factory: fn.menuItemsFactory.bind(this)
        }
      })
    },
    navTo({navTo, text}) {
      if (navTo) {
        this.oRouter.navTo(navTo)
      } else {
        MessageToast.show(text + ' (未定义跳转链接)')
      }
    }
  }
  return fn;
});