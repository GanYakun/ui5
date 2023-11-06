/**
 * @copyright Copyright (c) 2019 dpbird
 * @description odata client for o3
 * @author xwk
 */

/**
 示例
 //////////////////// 1. 读取操作 uri为字符串模式 ///////////////////////////
 o3Odata.read("Facilities?$filter=facilityId eq '10001'", function (data, response) {
    console.log(data)
}, function (response) {
    console.log(response)
});

 //////////////////// 2. 读取操作 uri为json模式 ///////////////////////////
 o3Odata.read({
    path: 'Facilities',
    parameters: {
        $filter: "facilityId eq '10001'"
    }
}, function (data, response) {
    console.log(data)
}, function (response) {
    console.log(response)
});

 //////////////////// 3. 读取操作 parameters 里为多层expand ///////////////////////////
 o3Odata.read({
    path: "Products",
    parameters: {
        $filter: `productId  eq 'B183BL02' and ((introductionDate eq null) or (introductionDate lt 2019-08-13T09:18:24.204Z)) and ((salesDiscontinuationDate eq null) or (salesDiscontinuationDate gt 2019-08-13T09:18:24.204Z))`,
        $expand: {
            ProductPrice: {
                $filter: `productPriceTypeId eq 'DEFAULT_PRICE' and fromDate le 2019-08-13T09:18:24.204Z and (thruDate eq null or thruDate gt 2019-08-13T09:18:24.204Z) and productStoreGroupId eq '_NA_' and currencyUomId eq 'CNY'`
            },
            ProductFeatureAppl: {
                $orderby: "sequenceNum desc",
                $expand: "ProductFeature"
            }
        }
    }
}, function (data, response) {
    console.log(data)
}, function (response) {
    console.log(response)
});

 //////////////////// 4.读取操作 batch批量读取 ///////////////////////////
 o3Odata.read([
 {
        path: 'Facilities',
        parameters: {
            $filter: "facilityTypeId eq 'RETAIL_STORE'",
            $skip: 0,
            $top: 20
        }
    },
 "Facilities?$filter=facilityTypeId eq 'WAREHOUSE'&$skip=0&$top=20",
 ], function (data, response) {
    console.log(data)
}, function (response) {
    console.log(response)
});

 //////////////////// 5.提交操作 单个提交 ///////////////////////////
 o3Odata.submit({
    path: 'addToCart',
    method: 'POST',
    body: {productId: 'B183BL02-05', quantity: 1}
}, function (data) {
    console.log(data);
});

 //////////////////// 6.提交操作 batch批量提交 ///////////////////////////
 o3Odata.submit([{
    path: 'addToCart',
    method: 'POST',
    body: {productId: 'B183BL02-05', quantity: 1}
}, {
    path: 'addToCart',
    method: 'POST',
    body: {productId: 'B183BL02-05', quantity: 1}
}], function (data) {
    console.log(data);
});
 */

var o3Odata = {
    //请求的uri
    dataSources: {
        uri: '/server_hook/fmd/odata_server.svc/'
    },
    //每个客户端在这里实现request
    request: function (params, success, error) {
        //小程序
        /*wx.request({
            url: params.url,
            data: params.body,
            header: Object.assign({
                "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "X-CSRF-Token": "Fetch"
            }, params.headers || {}),
            method: params.method || "GET",
            success(resp) {
                var response = {
                    requestUri: url,
                    statusCode: resp.statusCode,
                    statusText: resp.errMsg,
                    headers: resp.header,
                    body: resp.data
                };
                success && success(response);
            },
            fail(resp) {
                var response = {
                    requestUri: url,
                    statusCode: resp.statusCode,
                    statusText: resp.errMsg,
                    headers: resp.header,
                    body: resp.data
                };
                error && error({message: response.body.error.message, request: params, response: response});
            }
        });*/
        //h5
        jQuery.ajax(params.url, {
            data: params.body,
            headers: Object.assign({
                "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "X-CSRF-Token": "Fetch"
            }, params.headers || {}),
            method: params.method || "GET"
        }).then(function (data, textStatus, jqXHR) {
            var responseHeaders = {};
            var rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
            while ((match = rheaders.exec(jqXHR.getAllResponseHeaders()))) {
                responseHeaders[match[1].toLowerCase()] = match[2];
            }

            var response = {
                requestUri: params.url,
                statusCode: jqXHR.status,
                statusText: textStatus,
                headers: responseHeaders,
                body: data
            };
            success && success(response);
        }, function (jqXHR, textStatus, errorThrown) {
            var responseHeaders = {};
            var rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
            while ((match = rheaders.exec(jqXHR.getAllResponseHeaders()))) {
                responseHeaders[match[1].toLowerCase()] = match[2];
            }
            var response = {
                requestUri: params.url,
                statusCode: jqXHR.status,
                statusText: jqXHR.statusText,
                headers: responseHeaders,
                body: jqXHR.responseJSON || jqXHR.responseText
            };
            error && error({message: response.body.error.message, request: params, response: response});
        });
    }
};

(function () {
    function _read(requests, success, error) {
        if (requests instanceof Array) {
            //batch
            _sendBatch(requests).then(function (response) {
                success && success(response);
            }, function (response) {
                error && error(response);
            });
        } else {
            //redirect
            _sendRequest('GET', _processUri(requests)).then(function (response) {
                success && success(response.body, response);
            }, function (response) {
                error && error(response);
            });
        }
    }

    function _submit(requests, success, error) {
        var isArray = true;
        if (!(requests instanceof Array)) {
            requests = [requests];
            isArray = false;
        }
        var _requests = [];
        for (var i = 0; i < requests.length; i++) {
            _requests.push({
                path: _processUri(requests[i].path),
                method: requests[i].method ? requests[i].method : "PATCH",
                body: typeof requests[i].body == 'string' ? requests[i].body : JSON.stringify(requests[i].body)
            });
        }

        _sendBatch(_requests).then(function (response) {
            if (!isArray) {
                response = response[0];
            }
            success && success(response);
        }, function (response) {
            if (!isArray) {
                response = response[0];
            }
            error && error(response);
        });
    }

    function _sendRequest(sMethod, sResourcePath, mHeaders, sPayload) {
        var sRequestUrl = o3Odata.dataSources.uri + encodeURI(sResourcePath);
        return new Promise(function (fnResolve, fnReject) {
            return o3Odata.request({
                url: sRequestUrl,
                body: sPayload,
                method: sMethod,
                headers: mHeaders
            }, fnResolve, fnReject);
        });
    }

    function _serializeBatchRequest(aRequests, iChangeSetIndex) {
        var sBatchBoundary = (iChangeSetIndex !== undefined ? "changeset_" : "batch_") + _createBoundary(),
            bIsChangeSet = iChangeSetIndex !== undefined,
            aRequestBody = [];

        if (bIsChangeSet) {
            aRequestBody = aRequestBody.concat("Content-Type: multipart/mixed;boundary=",
                sBatchBoundary, "\r\n\r\n");
        }
        aRequests.forEach(function (iRequest, iRequestIndex) {
            var sContentIdHeader = "";
            var oRequest = iRequest;
            var rContentIdReference = /\$\d+/;

            if (bIsChangeSet) {
                sContentIdHeader = "Content-ID:" + iRequestIndex + "." + iChangeSetIndex + "\r\n";
            }
            aRequestBody = aRequestBody.concat("--", sBatchBoundary, "\r\n");

            if (Array.isArray(oRequest)) {
                if (bIsChangeSet) {
                    throw new Error('Change set must not contain a nested change set.');
                }
                aRequestBody = aRequestBody.concat(_serializeBatchRequest(oRequest, iRequestIndex).body);
            } else {
                if (typeof iRequest === 'string') {
                    oRequest = {
                        url: _processUri(iRequest)
                    }
                } else {
                    if (!iRequest['path']) {
                        console.error('missing path');
                        return;
                    }
                    oRequest['url'] = _processUri(iRequest);
                }
                if (!oRequest['method']) {
                    oRequest['method'] = 'GET';
                }
                if (!oRequest['headers']) {
                    oRequest['headers'] = [];
                }

                if (!oRequest.headers['Accept']) {
                    oRequest.headers['Accept'] = 'application/json;odata.metadata=minimal;IEEE754Compatible=true';
                }
                if (!oRequest.headers['Content-Type']) {
                    oRequest.headers['Content-Type'] = 'application/json;charset=UTF-8;IEEE754Compatible=true';
                }

                var sUrl = encodeURI(oRequest.url);

                sUrl = sUrl.replace(rContentIdReference, "$&." + iChangeSetIndex);
                aRequestBody = aRequestBody.concat(
                    "Content-Type:application/http\r\n",
                    "Content-Transfer-Encoding:binary\r\n",
                    sContentIdHeader,
                    "\r\n",
                    oRequest.method, " ", sUrl, " HTTP/1.1\r\n",
                    _serializeHeaders(oRequest.headers),
                    "\r\n",
                    JSON.stringify(oRequest.body) || "" || "", "\r\n");
            }
        });
        aRequestBody = aRequestBody.concat("--", sBatchBoundary, "--\r\n");

        return {body: aRequestBody, batchBoundary: sBatchBoundary};

    }

    function _sendBatch(requests) {
        return new Promise(function (fnResolve, fnReject) {
            var oBatchRequest = _serializeBatchRequest(requests);
            _sendRequest('POST', '$batch', {
                "Accept": "multipart/mixed",
                "Content-Type": "multipart/mixed; boundary=" + oBatchRequest.batchBoundary,
                "MIME-Version": "1.0"
            }, oBatchRequest.body.join("")).then(function (sResponse) {
                var aBatchParts = sResponse.body.split(new RegExp('--' + _getHeaderParameterValue(sResponse.headers['content-type'], 'boundary') + '(?:[ \t]*\r\n|--)')),
                    aResponses = [];
                aBatchParts = aBatchParts.slice(1, -1);
                aBatchParts.forEach(function (sBatchPart, index) {
                    var sChangeSetContentType, sCharset, iColonIndex, sHeader, sHeaderName, sHeaderValue, aHttpHeaders,
                        aHttpStatusInfos, i, sMimeHeaders, oResponse = {}, iResponseIndex, aResponseParts;

                    aResponseParts = sBatchPart.split("\r\n\r\n");
                    sMimeHeaders = aResponseParts[0];

                    aHttpHeaders = aResponseParts[1].split("\r\n");
                    aHttpStatusInfos = aHttpHeaders[0].split(" ");

                    // oResponse.requestUri = aRequestsUrl[index];
                    oResponse.statusCode = parseInt(aHttpStatusInfos[1], 10);
                    oResponse.statusText = aHttpStatusInfos.slice(2).join(' ');
                    oResponse.headers = {};

                    for (i = 1; i < aHttpHeaders.length; i++) {
                        sHeader = aHttpHeaders[i];
                        iColonIndex = sHeader.indexOf(':');
                        sHeaderName = sHeader.slice(0, iColonIndex).trim();
                        sHeaderValue = sHeader.slice(iColonIndex + 1).trim();
                        oResponse.headers[sHeaderName] = sHeaderValue;
                    }

                    oResponse.body = aResponseParts[2].slice(0, -2);
                    if (aResponseParts[1].indexOf('application/json') > -1) {
                        oResponse.body = JSON.parse(oResponse.body);
                    }
                    aResponses.push(oResponse);
                });

                fnResolve(aResponses);
            }, function (someThing) {
                fnReject(someThing);
            });
        });
    }

    function _processUri(option) {
        if (typeof option == 'string') {
            return option;
        }
        var url = option.path;
        var params = [];
        for (var key in option.parameters) {
            var value = option.parameters[key];
            if (typeof value == 'object') {
                if (key === '$expand') {
                    params.push('$expand=' + _processExpand(value));
                }
            } else {
                params.push(key + '=' + value);
            }
        }
        return url + '?' + params.join('&');
    }

    function _processExpand(expand) {
        var rtn = [];
        for (var entity in expand) {
            var param = expand[entity];
            var params = [];
            for (var key in param) {
                var value = param[key];
                if (typeof value == 'string') {
                    params.push(key + '=' + value);
                } else {
                    params.push('$expand=' + _processExpand(value));
                }
            }
            rtn.push(entity + '(' + params.join(';') + ')');
        }
        return rtn.join(',');
    }

    function _hex16() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
    }

    function _createBoundary(prefix) {
        if (!prefix) {
            prefix = '';
        }
        return prefix + _hex16() + "-" + _hex16() + "-" + _hex16();
    }

    function _serializeHeaders(mHeaders) {
        var sHeaderName,
            aHeaders = [];
        for (sHeaderName in mHeaders) {
            aHeaders = aHeaders.concat(sHeaderName, ":", mHeaders[sHeaderName], "\r\n");
        }
        return aHeaders;
    }

    function _getHeaderParameterValue(sHeaderValue, sParameterName) {
        var iParamIndex,
            aHeaderParts = sHeaderValue.split(";"),
            rHeaderParameter = /(\S*?)=(?:"(.+)"|(\S+))/,
            aMatches;

        sParameterName = sParameterName.toLowerCase();
        for (iParamIndex = 1; iParamIndex < aHeaderParts.length; iParamIndex++) {
            aMatches = rHeaderParameter.exec(aHeaderParts[iParamIndex]);
            if (aMatches[1].toLowerCase() === sParameterName) {
                return aMatches[2] || aMatches[3];
            }
        }
    }

    o3Odata.read = _read;
    o3Odata.submit = _submit;
})();

o3Odata.read([{
    path: 'Facilities',
    parameters: {
        $filter: "facilityTypeId eq 'RETAIL_STORE'",
        $skip: 0,
        $top: 20
    }
}, [{
    path: 'createCustomer?groupId=batchCustomerPartyGroupId',
    method: 'POST',
    body: {"lastName": "changeset_test_xwk", "firstNameaa": "aaa"}
}, {
    path: 'createCustomer?groupId=batchCustomerPartyGroupId',
    method: 'POST',
    body: {"lastName": "changeset_test_xwk", "firstName": "bbb"}
}]], function (response) {
    console.log(response)
});