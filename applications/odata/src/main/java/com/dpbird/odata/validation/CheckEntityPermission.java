package com.dpbird.odata.validation;

import com.dpbird.odata.OfbizAppEdmProvider;
import com.dpbird.odata.OfbizODataException;
import org.apache.ofbiz.base.util.UtilMisc;
import org.apache.ofbiz.base.util.UtilProperties;
import org.apache.ofbiz.base.util.UtilValidate;
import org.apache.ofbiz.entity.Delegator;
import org.apache.ofbiz.entity.GenericEntityException;
import org.apache.ofbiz.entity.GenericValue;
import org.apache.ofbiz.entity.util.EntityQuery;
import org.apache.olingo.commons.api.edm.EdmBindingTarget;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author scy
 * @date 2023/8/29
 */
public class CheckEntityPermission {
    private static final String MODULE = CheckEntityPermission.class.getName();

    /**
     * 验证权限
     */
    public static void checkPermission(Map<String, Object> odataContext, EdmBindingTarget edmBindingTarget) throws OfbizODataException {
        String errMsg = UtilProperties.getMessage("OdataUiLabels", "verifyMsg.auth.NO_ACCESS", (Locale) odataContext.get("locale"));
        if (edmBindingTarget == null) {
            throw new OfbizODataException(errMsg);
        }
        Delegator delegator = (Delegator) odataContext.get("delegator");
        GenericValue userLogin = (GenericValue) odataContext.get("userLogin");
        OfbizAppEdmProvider edmProvider = (OfbizAppEdmProvider) odataContext.get("edmProvider");
        String targetName = edmBindingTarget.getName();
        String appName = edmProvider.getWebapp();
        try {
            GenericValue needPermission = delegator.findOne("EntitySetPermission", UtilMisc.toMap(
                    "appId", appName, "entitySetName", targetName), false);
            if (UtilValidate.isEmpty(needPermission)) {
                //不需要权限
                return;
            }
            String partyId = userLogin.getString("partyId");
            if (UtilValidate.isEmpty(partyId)) {
                throw new OfbizODataException(errMsg);
            }
            GenericValue partyRole = EntityQuery.use(delegator).from("PartyRole").where("partyId", partyId).queryFirst();
            if (UtilValidate.isEmpty(partyRole)) {
                throw new OfbizODataException(errMsg);
            }
            if ("SUPER_ADMIN".equals(partyRole.getString("roleTypeId"))) {
                return;
            }
            List<String> currentUserPermission = EntityQuery.use(delegator).from("RoleTypeSecurityPermission")
                    .where("roleTypeId", partyRole.getString("roleTypeId")).getFieldList("permissionId");
            if (!currentUserPermission.contains(needPermission.getString("permissionId"))) {
                throw new OfbizODataException(errMsg);
            }
        } catch (GenericEntityException e) {
            throw new OfbizODataException(e.getMessage());
        }

    }


}
