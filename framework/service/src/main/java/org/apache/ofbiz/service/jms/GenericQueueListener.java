package org.apache.ofbiz.service.jms;

import org.apache.ofbiz.base.util.UtilProperties;
import org.apache.ofbiz.entity.Delegator;
import org.apache.ofbiz.service.LocalDispatcher;

import javax.jms.MapMessage;
import javax.jms.Message;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @ClassName: GenericQueueListener
 * @Description: TODO
 * @Author: banff
 * @Date: 2023/5/26 17:50
 */
public class GenericQueueListener extends JmsQueueListener {
    /**
     * Creates a new JmsQueueListener - Should only be called by the JmsListenerFactory.
     *
     * @param delegator
     * @param jndiServer
     * @param jndiName
     * @param queueName
     * @param userName
     * @param password
     */
    public GenericQueueListener(Delegator delegator, String jndiServer, String jndiName, String queueName, String userName, String password) {
        super(delegator, jndiServer, jndiName, queueName, userName, password);
    }


    @Override
    public void onMessage(Message message) {
        if (message instanceof MapMessage) {
            super.onMessage(message);
        } else {
            String topicProcessorClassName = UtilProperties.getPropertyValue("service", "jmsQueueProcessor");
            String methodName = "onMessage";
            try {
                Class topicProcessorClass = Class.forName(topicProcessorClassName);
                Method method = topicProcessorClass.getMethod(methodName, LocalDispatcher.class, Message.class);
                method.invoke(topicProcessorClass, dispatcher, message);
            } catch (ClassNotFoundException | NoSuchMethodException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
            return;
        }

    }
}
