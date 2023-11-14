package com.dpbird.odata.login;

import org.apache.ofbiz.base.util.Debug;
import org.apache.ofbiz.base.util.UtilHttp;
import org.apache.ofbiz.base.util.UtilMisc;
import org.apache.ofbiz.base.util.UtilValidate;
import org.apache.ofbiz.entity.Delegator;
import org.apache.ofbiz.entity.GenericEntityException;
import org.apache.ofbiz.entity.GenericValue;
import org.apache.ofbiz.entity.condition.EntityCondition;
import org.apache.ofbiz.entity.condition.EntityOperator;
import org.apache.ofbiz.entity.util.EntityQuery;
import org.apache.ofbiz.service.GenericServiceException;
import org.apache.ofbiz.service.LocalDispatcher;
import org.apache.ofbiz.service.ServiceUtil;
import org.apache.ofbiz.webapp.control.LoginWorker;
import org.apache.ofbiz.webapp.webdav.WebDavUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author zhuwenchao
 * externalLoginKey login
 */
public class LoginEvents {
    public static final String module = LoginEvents.class.getName();
    private static Map<String, GenericValue> externalLoginKeys = new ConcurrentHashMap<String, GenericValue>();

    public static String login(HttpServletRequest request, HttpServletResponse response) {
        String loginResult = LoginWorker.login(request, response);
        if ("success".equals(loginResult)) {
            // fix for upgrade，looks like nothing should do here
            // getExternalLoginKey(request);
        }
        return loginResult;
    }

    public static String logInUser(HttpServletRequest request, HttpServletResponse response) throws GenericServiceException, GenericEntityException {
        Delegator delegator = (Delegator) request.getAttribute("delegator");
        GenericValue userLogin;
        Map<String, Object> serviceMap = WebDavUtil.getCredentialsFromRequest(request);
        HttpSession httpSession = request.getSession(true);
        Debug.logInfo("========== Current SessionID: " + httpSession.getId(), module);
        if (serviceMap == null) {
            userLogin = (GenericValue) request.getSession().getAttribute("userLogin");
            request.setAttribute("userLogin", userLogin);
            GenericValue organization = getOrganization(delegator, userLogin);
            if (UtilValidate.isNotEmpty(organization)) {
                request.setAttribute("company", organization);
                httpSession.setAttribute("company", organization);
            }
            return "success";
        } else if (UtilValidate.isNotEmpty(serviceMap.get("login.username"))) {
            //Compatible with tel login and externalId login
            EntityCondition findCondition = EntityCondition.makeCondition(UtilMisc.toList(EntityCondition.makeCondition("externalId", serviceMap.get("login.username")),
                    EntityCondition.makeCondition("phoneMobile", serviceMap.get("login.username"))), EntityOperator.OR);
            GenericValue partyAndContact = EntityQuery.use(delegator).from("PartyAndContact").where(findCondition).queryFirst();
            if (UtilValidate.isEmpty(partyAndContact)) {
                return "error";
            }
            userLogin = EntityQuery.use(delegator).from("UserLogin").where("partyId", partyAndContact.getString("partyId")).queryFirst();
            if (UtilValidate.isEmpty(userLogin)) {
                return "error";
            }
            serviceMap.put("login.username", userLogin.getString("userLoginId"));
        }
        serviceMap.put("locale", UtilHttp.getLocale(request));
        LocalDispatcher dispatcher = (LocalDispatcher) request.getAttribute("dispatcher");
        Map<String, Object> result = dispatcher.runSync("userLogin", serviceMap);
        if (ServiceUtil.isError(result) || ServiceUtil.isFailure(result)) {
            return "error";
        }
        userLogin = (GenericValue) result.get("userLogin");
        request.setAttribute("userLogin", userLogin);
        httpSession.setAttribute("userLogin", userLogin);
        //添加组织机构信息到session
        GenericValue organization = getOrganization(delegator, userLogin);
        if (UtilValidate.isNotEmpty(organization)) {
            request.setAttribute("company", organization);
            httpSession.setAttribute("company", organization);
        }
        return "success";
    }

    private static GenericValue getOrganization(Delegator delegator, GenericValue userLogin) throws GenericEntityException {
        if (UtilValidate.isNotEmpty(userLogin)) {
            String partyId = userLogin.getString("partyId");
//            GenericValue organizationRelation = EntityQuery.use(delegator).from("PartyRelationship")
//                    .where("roleTypeIdFrom", "ORGANIZATION_UNIT", "partyIdTo", partyId).queryFirst();
            GenericValue organizationRelation = EntityQuery.use(delegator).from("PartyRelationship")
                    .where("roleTypeIdTo","ORD_EMPLOYEE","partyIdTo", partyId).queryFirst();
            if (UtilValidate.isNotEmpty(organizationRelation)) {
                return organizationRelation.getRelatedOne("FromParty", false);
            }
        }
        return null;
    }


    public static String extensionCheckLogin(HttpServletRequest request, HttpServletResponse response) {
        return checkLogin(request, response);
    }

    public static String checkLogin(HttpServletRequest request, HttpServletResponse response) {
        GenericValue userLogin = (GenericValue) request.getAttribute("userLogin");
        if (userLogin == null) {
            response.setStatus(401);
            return "error";
        }
        return "success";
    }

}
