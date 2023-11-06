/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
  'sap/ui/core/Control',
], function (Control) {
  'use strict';

  var ControlConfiguration = Control.extend('o3.library.control.smart.smartfilterbar.ControlConfiguration', {
    metadata: {
      properties: {
        entityField: {type: 'string', defaultValue: ''},
      },
      defaultAggregation: 'control',
      aggregations: {
        control: {type: 'sap.ui.core.Control', multiple: false}
      },
    }
  });

  return ControlConfiguration;
});