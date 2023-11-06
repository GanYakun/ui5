/*!
 * ${copyright}
 * @version ${version}
 *
 */
sap.ui.define(function () {
    'use strict';
    var FilterOperator = {
        EQ: 'EQ',
        NE: 'NE',
        LT: 'LT',
        LE: 'LE',
        GT: 'GT',
        GE: 'GE',
        BT: 'BT',
        NB: 'NB',
        Contains: 'Contains',
        NotContains: 'NotContains',
        StartsWith: 'StartsWith',
        NotStartsWith: 'NotStartsWith',
        EndsWith: 'EndsWith',
        NotEndsWith: 'NotEndsWith',
        All: 'All',
        Any: 'Any',
        Initial: "Initial",
        Empty: "Empty",
        NotEmpty: "NotEmpty",
        Ascending: "Ascending",
        Descending: "Descending",
        GroupAscending: "GroupAscending",
        GroupDescending: "GroupDescending",
        Total: "Total",
        Average: "Average",
        Minimum: "Minimum",
        Maximum: "Maximum"
    };

    return FilterOperator;

}, true);
