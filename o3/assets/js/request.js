const Request = {
    request: function (params, success, error) {
        jQuery.ajax(o3Tool.sServiceUrl + params.url, {
            data: params.body,
            headers: Object.assign({
                "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "X-CSRF-Token": "Fetch"
            }, params.headers || {}),
            method: params.method || "GET"
        }).then(function (data, textStatus, jqXHR) {
            var match;
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
            var match;
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
}

export default Request