var schedule = require('node-schedule');//加载定时任务
var rule     = new schedule.RecurrenceRule();  
var times    = [1,6,11,16,21,26,31,36,41,46,51,56];//每五秒执行一次  
rule.second  = times;//按秒来执行

var log4js = require("log4js");  
var log4js_config = require("./log4js.json");  //加载配置文件
log4js.configure(log4js_config); 
var LogFile = log4js.getLogger('log_date');

//读取redis数据
schedule.scheduleJob(rule, function(){  
    LogFile.info('---程序开始运行---');
    //判断redis中是否有待执行消息，如果没有就退出程序
}); 