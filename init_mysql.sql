-- 创建用户 ningbomat_uilab
CREATE USER 'ningbomat_uilab'@'%' IDENTIFIED BY 'mKD2egevDOmFwMNkningbomat';

-- 授予用户权限访问三个数据库
GRANT ALL PRIVILEGES ON ningbomat_ofbiz.* TO 'ningbomat_uilab'@'%';
GRANT ALL PRIVILEGES ON ningbomat_olap.* TO 'ningbomat_uilab'@'%';
GRANT ALL PRIVILEGES ON ningbomat_tenant.* TO 'ningbomat_uilab'@'%';

-- 创建三个数据库
CREATE DATABASE ningbomat_ofbiz;
CREATE DATABASE ningbomat_olap;
CREATE DATABASE ningbomat_tenant;
