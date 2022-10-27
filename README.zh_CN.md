# ODataLab GBMS
ODataLab是一个基于Apache OFBiz的OData服务

## 快速启动
+ 初始化OFBiz<br>./gradlew cleanAll
+ 加载种子数据<br>./gradlew "ofbiz --load-data readers=seed,ext"
+ 如果仅仅测试，加载测试数据<br>./gradlew "ofbiz --load-data readers=test"
+ 如果金地项目，加载金地数据<br>./gradlew "ofbiz --load-data readers=jindi"
+ 如果京东项目，加载京东数据<br>./gradlew "ofbiz --load-data readers=jingdong"
+ 启动OFBiz<br>./gradlew ofbiz
+ 启动浏览器访问OData服务的metadata<br>http://localhost:8080/gbms/control/odataAppSvc/gbms/$metadata
+ 根据环境变成生成配置文件
  + gradlew generateConfigFile 
> 注意,如果指定的数据库不是derby,则需要配置环境变量,
如果创建失败,可以通过 `gradlew getConfigFileEvn` 命令来查看环境变量中是否存在
```bash
# 所有环境变量配置案例
DB_PLAT_FORM=mysql (值只能为:derby或mysql)
DB_IP=localhost
DB_PORT=3306
OFBIZ_DB_NAME=xxx
OLAP_DB_NAME=xxx
TENANT_DB_NAME=xxx
DB_USER=xxx
DB_PASSWORD=xxx
HOST_HEADERS_ALLOWED=例如:localhost,127.0.0.1
JAVA_NAMING_PROVIDER_URL=例如:tcp://xxx.xxx.xxx:port
```
> 注意事项:
> 1. 如果选择Derby为存储,只需要设置DB_PLAT_FORM值 
> 2. `HOST_HEADERS_ALLOWED`如果设置将会在`ofbiz/framework/security/config/`下生成`security.properties`文件
> 3. `JAVA_NAMING_PROVIDER_URL`如果设置将会在`ofbiz/framework/base/config/`下生成`jndi.properties`文件
