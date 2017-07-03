$(function() {

  //初始化常量
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [        // 颜色值数组
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // 利用jQuery初始化DOM节点变量
  var $window = $(window); // 全局window对象
  var $usernameInput = $('.usernameInput'); // 用户名输入
  var $messages = $('.messages'); // 消息展示区域
  var $inputMessage = $('.inputMessage'); // 输入消息区域

  var $loginPage = $('.login.page'); // 登陆页面
  var $chatPage = $('.chat.page'); // 聊天室界面

  // 用户名设置提示
  // 下面这些“全局”变量，相当于状态锁，了解他们的状态对后面业务逻辑的理解很有帮助
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();  
  //.focus()是.trigger('focus')的简写，相当于直接触发focus事件，保证登陆页面默认聚焦在输入框

  //无参数调用表示自动适配服务端设置，文件可移植性高，如果输入url则需要带上port
  var socket = io('http://localhost:3000');  

  //添加聊天室通知信息
  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "聊天室有 1 位用户";
    } else {
      message += "聊天室有 " + data.numUsers + " 位用户";
    }
    log(message);  //调用后面定义的log函数，显示在屏幕上
  }

  // 设置用户名
  function setUsername () {
    username = cleanInput($usernameInput.val().trim()); 
    //val()获取input输入框中的值，trim()去掉首、尾空格,cleanInput注释见函数声明处  

    // 如果用户名有效
    if (username) {
      $loginPage.fadeOut();//以动画形式隐藏登陆页(设置成透明)，动画时长默认400ms
      $chatPage.show(); //以动画形式显示聊天室页面，默认时长400ms
      $loginPage.off('click'); //移除登录页的'click'事件处理程序
      $currentInput = $inputMessage.focus(); //聚焦消息输入框，并将该节点的jQuery对象赋值给$currentInput

      // 发射'add user'事件，并将username传给服务器
      socket.emit('add user', username);
    }
  }

  // 发送聊天消息
  function sendMessage () {
    var message = $inputMessage.val();
    // 防止注入攻击
    message = cleanInput(message);
    // 如果连接成功且消息框不为空
    if (message && connected) {
      $inputMessage.val('');  //清空输入框内容
      addChatMessage({    //将用户名，聊天框内容传给addChatMessage()，data为固定格式的对象
        username: username,
        message: message
      });
      // 告知服务器执行'new message'事件，并传递message
      socket.emit('new message', message);
    }
  }

  // 显示信息
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message); 
    //$('<li>')表示新增一个<li>元素，addClass()添加class属性,text()将message作为<li>元素的文本
    addMessageElement($el, options);  //调用addMessageElement将前面新增的元素节点增加到聊天室页面
  }

  // 增加聊天信息
  function addChatMessage (data, options) {
    //如果已经显示"XX正在输入"，则不要重复显示"XX正在输入"了
    var $typingMessages = getTypingMessages(data);  //得到“XX正在输入”消息的节点
    options = options || {};  //初始化options对象
    if ($typingMessages.length !== 0) {  //如果有”xx正在输入“
      options.fade = false;        //取消渐显动画
      $typingMessages.remove();   //删除原有节点，避免同时出现两个"XX正在输入"
    }

    var $usernameDiv = $('<span class="username"/>')  //新建<span>节点存放用户名信息
      .text(data.username)  //元素文本是data对象中的username
      .css('color', getUsernameColor(data.username)); //为用户名设置字体颜色
    var $messageBodyDiv = $('<span class="messageBody">') //新建<span>节点存放聊天信息
      .text(data.message);  //元素文本是data对象中的message

    var typingClass = data.typing ? 'typing' : '';  //根据data.typing的值来赋值
    var $messageDiv = $('<li class="message"/>')    //新建<li>元素，该元素class值为message
      .data('username', data.username)    //将用户名以数据形式储存在元素中
      .addClass(typingClass)              //增加class属性
      .append($usernameDiv, $messageBodyDiv); //将之前新增的用户名，聊天消息增加到<li>元素中

    addMessageElement($messageDiv, options);  //调用addMessageElement将新增的元素节点增加到聊天室页面
  }

  // 添加"XX正在输入"消息
  function addChatTyping (data) {
    data.typing = true;
    data.message = '正在输入';
    addChatMessage(data);  //添加"xx正在输入",xx为其它用户
  }

  // 移除"XX正在输入"消息
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  
  // 添加消息元素到聊天信息列表，并滚动到底部 
  // el - 需要添加的元素 
  // options.fade - 元素是否需要显示 
  // options.prepend - 元素是否应该插入在某个元素前
  
  function addMessageElement (el, options) {
    var $el = $(el);

    // 设置默认配置选项
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // 应用配置选项
    if (options.fade) {    //如果值为true
      $el.hide().fadeIn(FADE_TIME); //渐显动画，默认情况
      // console.log("test1");
    }
    if (options.prepend) {
      $messages.prepend($el);   //插到消息列表顶部
    } else {
      $messages.append($el);    //插到消息列表尾部，默认情况
      // console.log("test2");
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;  //滚动条滚到最底部
  }

  // 防止注入攻击
  function cleanInput (input) {
    return $('<div/>').html(input).text();
  }

  // 更新输入状态
  function updateTyping () {    
    if (connected) {  //如果连接成功
      if (!typing) {  //如果typing状态为false
        typing = true;  //typing状态设置为true
        socket.emit('typing');  //发送"typing"事件给服务器，广播给其它用户，注意，只有typing是false才会执行大括号内代码，
                                //也就是说只有后面的"stop typing"发送完，typing状态变为false，才会重新触发typing，
                                //如果长时间按同一个键，会重复调用updatTyping()，但定时器的回调函数不会调用。
                                //也就是说长按某个按键相当于只发送一次typing事件，后面的emit('stop typing')会被阻塞
                                //对于其它用户而言，在此期间不会收到"stop typing"事件，“XX正在输入”相当于一个永久节点，一直显示
                                //对于系统而言，这种设计可以避免用户错误操作(长按某个按键)消耗系统资源
        // console.log("test1")
      }
      lastTypingTime = (new Date()).getTime();   //保存最后一次调用updateTyping()的时间
      
      setTimeout(function () { //设置定时器，消除"xx正在输入"显示，当用户长按某个按键后，会设置多个定时器  
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;   //保存距上次调用updateTyping()的时间差
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {  //TYPING_TIMER_LENGTH保证只会在updatetyping()调用完，又400ms之后才会执行大括号内代码                                                                                                              
                                                          //假如在400ms内连续按两次按键，则第一个定时器中的回调函数不会执行大括号内代码，第二次会执行
                                                          //typing是必须的，若不加，当A用户一直按摸个按键后，当取消按键后会发送
                                                          //给服务器很多个'stop typing'事件
                                                          //两个条件逻辑与的结果就是如果某用户停止长按某个按键400ms后，前台才会发送一次"stop"事件                                                        
          socket.emit('stop typing');   //发送"stop typing"给服务器
          typing = false;    //typing状态恢复false，便于下次触发"typing"事件
        }
      }, TYPING_TIMER_LENGTH);   //这个时间值影响"xx正在输入"状态的延迟，时间越长，延迟约严重
    }
  }

  // 得到"正在输入"节点
  function getTypingMessages (data) {
    //在所有class属性同时有"typing"和"message"的元素中筛选
    return $('.typing.message').filter(function (i) { 
      //username与getTypingMessages()的形参的username属性相同的元素会被筛选出来
      return $(this).data('username') === data.username;
    });
  }

  // 为用户设置用户名颜色
  function getUsernameColor (username) {
    // 计算哈希码
    var hash = 7;    //初始值
    for (var i = 0; i < username.length; i++) { 
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // 计算颜色
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard 事件

  $window.keydown(function (event) {
    // 除了ctrl,alt,window(command)键，按下其它按键
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();  //都会激活输入框
    }
    // 当用户点击回车键时
	//event.which 是兼容所有浏览器的方法，因为有些浏览器是keyCode有些浏览器是charCode
    if (event.which === 13) {
      if (username) {    //如果用户已登陆
        sendMessage();   //调用sendMessage()
        socket.emit('stop typing');  //发送事件
        typing = false; //更新输入状态
      } else {          //否则
        setUsername();  //设置用户名
      }
    }
  });

  $inputMessage.on('input', function() {
    // console.log("test3");
    updateTyping();     //当输入框内容发生变化时，调用updateTyping()
  });

  // Click 事件

  // 在登陆页面任意位置点击都激活输入框
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // 点击消息输入框的边框时激活输入框
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket 事件

  // 只要服务器发送login事件，则显示信息
  socket.on('login', function (data) {
    connected = true;
    // 展示欢迎消息
    var message = "– 欢迎来到imOline –";
    log(message, {
      prepend: true     //表示欢迎信息要显示在最顶部
    });
    addParticipantsMessage(data);
  });

  // 当服务器发送 'new message', 更新消息列表
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // 当服务器发送'user joined', 显示XX加入
  socket.on('user joined', function (data) {
    log(data.username + ' 已加入!');
    addParticipantsMessage(data);
  });

  // 当服务器发送 'user left', 显示XX离开
  socket.on('user left', function (data) {
    log(data.username + ' 已离开!');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // 当服务器发送'typing', 显示"正在输入"
  socket.on('typing', function (data) {
    addChatTyping(data);
    // console.log("test2");
  });

  // 当服务器发送 'stop typing'事件时, 清除“正在输入”消息
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
    log('您已失去连接');
  });

  socket.on('reconnect', function () {
    log('您已经重新连接');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function () {
    log('尝试重连失败');
  });

});
