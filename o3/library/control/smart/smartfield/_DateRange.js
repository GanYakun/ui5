/*!
 * ${copyright}
 * @version ${version}
 */
sap.ui.define([
  'o3/sap/ui/comp/config/condition/DateRangeType',
], function (DateRangeType) {
  "use strict";

  var AnnotationHelper;
  var _DateRange = DateRangeType.extend('o3.library.control.smart.smartfield._DateRange', {
    metadata: {
      properties: {
        annotationHelper: {type: 'o3.library.model.AnnotationHelper'},
        entitySet: {type: 'string'},
        entityType: {type: 'string'},
        entityField: {type: 'string'},
      }
    },
  });

  return _DateRange;
});