window.onload = function () {
  var socket;
  var globalItem = {
    myName: '',
    myIp: '',
    mess: {
      type: 0,//判断连接交互类型，0为上传用户信息，1位私聊，2位多播
      user: { ip: '', name: '', }//用户信息
    },
  }


  //登录业务
  $("#login_form").submit(function (event) {
    event.preventDefault();

    if ($(".box_overlay").hasClass("none")) {
      if ($("#account").val() != "" && $("#password").val() != "") {

        //websocket操作
        if (!window.WebSocket) {
          //兼容Moz
          window.WebSocket = window.MozWebSocket;
        }
        if (window.WebSocket) {

          //连接到服务器
          socket = new WebSocket("ws://127.0.0.1:3000/ws");

          //建立连接成功后的回调
          socket.onopen = function (req) {
            globalItem.myName = $("#account").val();
            globalItem.myIp = $('#password').val();
            globalItem.mess = {};
            globalItem.mess.type = 0; //设置交互类型为上传用户信息
            globalItem.mess.user = { ip: $('#password').val(), name: $("#account").val() }
            socket.send(JSON.stringify(globalItem.mess))
            api.beforeLogin();
          }

          //接收到服务器数据的回调
          socket.onmessage = function (req) {
            var data = JSON.parse(req.data);

            if (data.type == 0)//初始化或更新在线用户列表
              if (data.host == true) {
                setTimeout("finishLoadingRender1()", 100);
                $(".header").find(".nickname").text(globalItem.myName);
                $(".profile_mini_m_bd").find(".nickname").text(globalItem.myName);
                $(".profile_mini_m_bd").find(".ip").text(globalItem.myIp);
              }
            addressList.vue.fris = data.user.filter(function (item, index) {
              console.log(data.user[index])
              if (item.ip != globalItem.myIp) return true;
              else { return false; }
            })
            // for (var i = 0; i < data.user.length; i++) {
            //   console.log(data.user[i])
            //   if (data.user[i].name != globalItem.myName) {
            //     // data.user[i].dot = 0;
            //     // data.user[i].dot_class = 'none';		//加入两个小红点的样式
            //     addressList.vue.fris.push(data.user[i]);
            //   }
            // }

          }

          //连接关闭后的回调
          socket.onclose = function (req) {
          }

          //连接发生错误
          websocket.onerror = function () {
            alert("连接发生错误");
          }

          //监听窗口关闭
          window.onbeforeunload = function () {
            websocket.close();
          }
        }
      }
      else {
        $(".warning .dec_txt").text("输入不能为空");
        errorRender();
      }
    }
  });
}
var api = {
  //登录前操作
  beforeLogin: function () {
    if ($("#passwordkeeping").prop('checked') == true) {
      if (window.localStorage) {
        localStorage.setItem("lastLoginName", $("#account").val()) //记住账号
        localStorage.setItem($("#account").val(), $("#password").val())
      }
      else {
        if (loginItem.getCookie($("#account").val())) { loginItem.delCookie($("#account").val()); };
        loginItem.setCookie($("#account").val(), $("#password").val(), 1440);
      }
    }//记住密码
    else {
      if (window.localStorage) {
        localStorage.setItem($("#account").val(), "")
      }//不记住密码
      else { loginItem.delCookie($("#account").val()); }
    }
    loadRender();
  },
  //发起聊天
  toChat: function (name, ip) {
    var idx;
    var h = 1;
    chatList.vue.dans.forEach(function (item, index) {
      if (item.name == name) {
        h = 0;
        idx = index;
        return false;
      }
      else { return; }
    })
    var dan = new Object();
    //把该联系人放到最前
    if (h == 0) {
      dan = chatList.vue.dans[idx];
      chatList.vue.dans.splice(idx, 1);
    }
    //创建新的最近联系人
    else {
      dan = {
        name: name,
        msg: '',
        ip: ip,
        lefts: 0
      }
    }
    chatList.vue.dans.unshift(dan);
    chatList.vue.c = 0;
    //同时创建一个新的聊天消息框
    // $(".mm-repeat").find(".more .content").removeClass("none");
    $(".message").slice(2).detach();
    // var k = findNum(t);
    // Num[k].setMessage();a
    //利用属性lefts记录未读消息数
    chatList.vue.dans[0].lefts = 0;
    //储存联系人的账户id
    // $(".chat-repeat").eq(0).data("signal", t);
    //样式改变
    $(".contacts_message").addClass("none");
    $(".title_wrap .title").addClass("none");
    $(".noones").addClass("none");
    $(".empty").addClass("none");
    $(".title_poi").removeClass("none");
    $(".chatin").removeClass("none");
    $(".mm-repeat").removeClass("none");
    if ($(".mm-repeat").find($(".message")).length == 2) { $(".message_empty").removeClass("none"); $(".message_empty .nonotes").removeClass("none"); }
    else { $(".message_empty").addClass("none"); }

    $("#editArea").focus();//鼠标聚焦在输入框
    // $("#editArea").val(Num[k].note);
    $(".box .web_wechat_turn").removeClass("none");
    $(".box .title_name").text(name);
    $(".hint").addClass("none");//取消未读信息小圆点提示
    // shineFlag = false;//取消标题新消息闪烁
    //tab样式改变
    $(".web_chat_tab_chat").addClass("web_chat_tab_chat_h1");
    $(".web_chat_tab_friends").removeClass("web_chat_tab_friends_h1");
    $(".nav_view").eq(0).removeClass("none");
    $(".nav_view").eq(2).addClass("none");
    $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部

    // $(".chatin").undelegate();//解除绑定
    // $(".more").undelegate();//解除绑定
    // callback3(t);//调用callback3发送信息或获取聊天记录};
  },

  //立即执行函数
  initItem: function () {

    //关闭弹出的小窗口
    var c = function () {
      $(".mmpop").hide();
      $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
      setTimeout('$(".slide-top").hide()', 150);
      $(".dropdown").addClass("none");
      $(".members_wrp").slideUp(150);
      $(".web_wechat_turn").addClass("web_wechat_down_icon");
      $(".web_wechat_turn").removeClass("web_wechat_up_icon");
    };
    $(document).click(c);
    $(".mmpop").click(function (event) {
      $(".dropdown").addClass("none");
    })
    $(".stop , .mmpop").click(function (event) {
      event.stopPropagation();
    })
    $(".slide-top").click(function (event) {
      event.stopPropagation();
      $(".dropdown").addClass("none");
    })
    $(".frm_search").click(c);

    //tab栏切换
    $(".chat").bind("click", function (event) {
      event.preventDefault();
      var idx = $(this).index(".chat");
      //tab下框切换
      $(".nav_view").eq(idx).removeClass("none");
      $(".nav_view").not($(".nav_view").eq(idx)).addClass("none");
      if (idx == 0) {
        $(".hint").addClass("none");//取消未读信息小圆点提示
        shineFlag = false;//取消标题新消息闪烁
        //tab图标更改颜色  
        $(".web_chat_tab_chat").addClass("web_chat_tab_chat_h1");
        $(".web_chat_tab_public").removeClass("web_chat_tab_public_h1");
        $(".web_chat_tab_friends").removeClass("web_chat_tab_friends_h1");
        //联系人详细信息框隐藏
        $(".contacts_message").addClass("none");
        $(".empty").addClass("none");
        $(".title_poi").removeClass("none");
        $(".title_wrap .title").addClass("none");
        if ($(".mm-repeat").find($(".message")).length == 2) { $(".message_empty").removeClass("none"); }
        //tab右侧信息框切换
        if (chatList.vue.c != Infinity) {
          $(".chatin").removeClass("none");
          $(".chatout").removeClass("none");
          $(".mm-repeat").removeClass("none");
          $(".noones").addClass("none");
          $(".nonotes").removeClass("none");
        }
        else {
          $(".noones").removeClass("none");
          $(".mm-repeat").addClass("none");
          $(".contacts_message").addClass("none");
        }
        // if (p == 2) {
        //   $(".noones").removeClass("none");
        //   $(".title_poi").addClass("none");
        //   $(".chatin").addClass("none");
        //   $(".mm-repeat").addClass("none");
        //   $(".message_empty").removeClass("none");
        // }
        $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部
      }
      if (idx == 1) {
        //tab图标更改颜色  
        $(".web_chat_tab_public").addClass("web_chat_tab_public_h1");
        $(".web_chat_tab_friends").removeClass("web_chat_tab_friends_h1");
        $(".web_chat_tab_chat").removeClass("web_chat_tab_chat_h1");
      }
      if (idx == 2) {
        //tab图标更改颜色  
        $(".web_chat_tab_friends").addClass("web_chat_tab_friends_h1");
        $(".web_chat_tab_chat").removeClass("web_chat_tab_chat_h1");
        $(".web_chat_tab_public").removeClass("web_chat_tab_public_h1");
        //联系人详细信息框切换
        $(".message_empty").addClass("none");
        $(".empty").removeClass("none");
        if (addressList.vue.s != Infinity) { $(".empty").addClass("none"); $(".contacts_message").removeClass("none"); }
        else { $(".empty").removeClass("none"); };
        //判断是否曾点击过具体联系人详细信息
        $(".chatin").addClass("none");
        $(".mm-repeat").addClass("none");
        $(".title_poi").addClass("none");
        $(".title_wrap .title").removeClass("none");
      }
    });

    //设置按钮触发框
    $(".header .opt").click(function toggleSystemMenu() {
      $("#mmpop").toggle();
      $(".mmpop").not($("#mmpop")).hide();
      $(".dropdown").addClass("none");
      $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
      setTimeout('$(".slide-top").hide()', 150);
    });

    //用户个人信息小框触发
    $(".userHead img , .me img ").click(function toggleSystemMenu1(ev) {
      var obj = $("#mmpop_profile");
      drag(obj);
      //兼容IE浏览器；获取鼠标点击的坐标     
      var oEvent = ev || client;
      var w = document.body.scrollWidth;
      var h = document.body.scrollHeight;
      if (oEvent.clientX + 8 + 220 > w) { var x = oEvent.clientX - 8 - 220 }
      else { var x = oEvent.clientX + 8; }
      if (oEvent.clientY + 20 + 336 > h) { var y = oEvent.clientY - 20 - 336 }
      else { var y = oEvent.clientY + 23; }
      $("#mmpop_profile").fadeOut(50).fadeIn(150).css({
        "top": y + "px",
        "left": x + "px"
      });
      $("#mmpop").hide();
      $(".change_box").hide();
      $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
      setTimeout('$(".slide-top").hide()', 150);
      $(".members_wrp").slideUp(150);
      $(".web_wechat_turn").addClass("web_wechat_down_icon");
      $(".web_wechat_turn").removeClass("web_wechat_up_icon");
      $("#mmpop_f_profile").fadeOut(150);
      $(".dropdown").addClass("none");
    });

    //拖动信息框
    function drag(obj) {
      obj.on("mousedown", star);
      var deltaY, deltaX;

      function star(event) {
        deltaX = event.clientX - obj.offset().left;
        deltaY = event.clientY - obj.offset().top;
        $(document).on("mousemove", move);
        $(document).on("mouseup", stop);
      }
      function move(event) {
        obj.css({
          "left": (event.clientX - deltaX) + "px",
          "top": (event.clientY - deltaY) + "px",
        });
      }
      function stop() {
        $(document).off("mousemove", move);
        $(document).off("mouseup", stop);
      }
    }
    $(".change_item ,.change_box img ,#mmpop_profile img ,#mmpop_f_profile img").mousemove(function (event) {
      event.stopPropagation();
    })

    //搜索框搜索
    $(".frm_search").keyup(function () {
      $(".ss-repeat").not($(".ss-repeat").last()).detach();
      var txt = $(".frm_search").val();
      var j = 0;
      if ($.trim(txt) != "") {
        $(".recommendation").show();
        for (var i = 0; i < $(".ng-repeat").length; i++) {
          if ($(".ng-repeat").eq(i).find(".nickname").text().indexOf($.trim(txt)) > -1) {
            $(".recommendation .contact-title").text("用户");
            $(".search-list").append(($(".ss-repeat").last()).clone(true));
            $(".ss-repeat").eq(j).find(".nickname").text($(".ng-repeat").eq(i).find(".nickname").text());
            $(".ss-repeat").eq(j).data("ip", addressList.vue.fris[j].ip);
            $(".ss-repeat").eq(j).removeClass("none");
            j++;
            // console.log($(".ng-repeat").eq(i).find(".nickname").text());
          }
        }
        if ($(".ss-repeat").length == 1) { $(".recommendation .contact-title").text("找不到匹配的结果"); }
      }
      else {
        $(".recommendation").hide();
      }
    })

    //点击“发消息”
    $(".profile .button").on("click", function () {
      var name = $(".contacts_message .nickname").text();
      var ip = $(".contacts_message .ip").text();
      api.toChat(name, ip);
    })
    //搜索栏点击联系人
    $(".ss-repeat").on("click", function () {
      var name = $(this).find(".nickname").text();
      var ip = $(this).data("ip")
      for (var i = 0; i < $(".ng-repeat").length; i++)
        $(".frm_search").val("");
      $(".recommendation").hide();
      api.toChat(name, ip);
    })

    //点击聊天窗上方聊天对象
    $(".title_poi").click(function () {
      $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
      setTimeout('$(".slide-top").hide()', 150);
      $(".mmpop").hide();
      $(".dropdown").addClass("none");
      $(".web_wechat_turn").toggleClass("web_wechat_down_icon");
      $(".web_wechat_turn").toggleClass("web_wechat_up_icon");
      $(".members_wrp").slideToggle(150);
      var name = $(".box_hd .title_name ").text();
      $(".member .nickname").text(name);
      $(".profile_f_mini_bd").find(".nickname").text(name);
    });

  }(),
}
