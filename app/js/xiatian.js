$(function(){
	var $window = $(window);//用来捕获整个屏幕的键盘事件
	var $usernameInput = $('.usernameInput');
	var FADE_TIME = 150; 
	var userName;//全局变量
	var connected = false;
  	var COLORS = [        // 颜色值数组
	    '#e21400', '#91580f', '#f8a700', '#f78b00',
	    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
	    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  	];
	var $messages = $('.messages'); // Messages area
	var $chatPage = $('.chat.page');
	var $loginPage = $('.login.page');
	var $inputMessage = $('.inputMessage');
	var socket = io('http://localhost:8217');
	//console.log(socket.connected);
	function setUserName(){
		userName = $usernameInput.val().trim();
		socket.emit('add user',userName);
	}
	 // 增加聊天信息
  function addChatMessage (data, options) {
    // 如果已经显示"XX正在输入"，则不要重复显示"XX正在输入"了
    //var $typingMessages = getTypingMessages(data);  //得到“XX正在输入”消息的节点
    options = options || {};  //初始化options对象
    /*
    if ($typingMessages.length !== 0) {  //如果有”xx正在输入“
      options.fade = false;        //取消渐显动画
      $typingMessages.remove();   //删除原有节点
    }
	*/
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
	 // Log a message
	function log (message, options) {
		var $el = $('<li>').addClass('log').text(message);
		addMessageElement($el, options);
	}
	function addMessageElement (el, options) {
		var $el = $(el);
		// Setup default options
		if (!options) {
		  options = {};
		}
		if (typeof options.fade === 'undefined') {
		  options.fade = true;
		}
		if (typeof options.prepend === 'undefined') {
		  options.prepend = false;
		}

		// Apply options
		if (options.fade) {
		  $el.hide().fadeIn(FADE_TIME);
		}
		if (options.prepend) {
		  $messages.prepend($el);
		} else {
		  $messages.append($el);
		}
		$messages[0].scrollTop = $messages[0].scrollHeight;
  }
	socket.on('user joined',function(data){
		var string  = data.username+'加入聊天室';
		log(string, {
		  prepend: true
		});
	});
	socket.on('user login',function(data){
		connected = true;//已登录
		var message = '欢迎'+data.username+'加入聊天室，你是第'+data.userNum+'位成员';
		$loginPage.fadeOut();
		$chatPage.show();
		log(message, {
		  prepend: true
		});
	});
	socket.on('send msg',function(data){
		//console.log(data);接收服务器穿回来的新消息，展示到前端页面
		addChatMessage({    
	        username: data.username,
	        message: data.msg
	      });
	});
	socket.on('user left',function(data){
		var string = data.username+'离开了聊天室，当前聊天室人数'+data.userNum;
		log(string);
	});
	//console.log($usernameInput);
	$window.keydown(function(e){
		if(e.altKey == true || e.ctrlKey == true || e.metaKey == true){
			$usernameInput.focus();
		}
		if(e.which === 13 ){
			//setUserName();
			if(userName){
				var msg = $inputMessage.val();
				addChatMessage({    //将用户名，聊天框内容传给addChatMessage()，data为固定格式的对象
			        username: userName,
			        message: msg
			      });
				socket.emit('send message',{message:msg,userName:userName,type:1});
			
			}else{
				setUserName();//用户名
			}
		}
	});
});