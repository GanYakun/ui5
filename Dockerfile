FROM registry.cn-hangzhou.aliyuncs.com/banff/ubuntujava8:20.04
# FROM ubuntujava8:latest



ENV JAVA_HOME=/root/jdk1.8.0_351 \
    PATH=$PATH:$JAVA_HOME/bin \
    TZ=Asia/Shanghai  \
    LANG=en_US.UTF-8  \
    LANGUAGE=en_US:en  \
    LC_ALL=en_US.UTF-8

COPY ./ /root/ofbiz/
WORKDIR /root/ofbiz

RUN ["chmod", "+x", "/root/ofbiz/startofbiz.sh"]

RUN ["/root/ofbiz/startofbiz.sh"]

ENTRYPOINT ["java -Xms128M -Xmx512M -Dfile.encoding=UTF-8 -Duser.country=CN -Duser.language=en -Duser.variant -cp ./build/libs/ofbiz.jar org.apache.ofbiz.base.start.Start"]
