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
+ 指定数据库存储(values: D(Derby), M(MySQL))
  + gradlew createEntityengineFile -PdbPlatform="M"
> 注意,如果指定的数据库不是derby,则需要配置环境变量,
如果创建失败,可以通过 `gradlew getDatabaseEvn` 命令来查看环境变量中是否存在
```bash
# 环境变量名称必须为下列名称 
DB_IP=localhost
DB_PORT=3306
OFBIZ_DB_NAME=xxx
OLAP_DB_NAME=xxx
TENANT_DB_NAME=xxx
DB_USER=xxx
DB_PASSWORD=xxx
```
