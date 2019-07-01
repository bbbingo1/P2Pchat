var socket;
var socket2;
var globalItem = {
  myName: '',
  myIp: '',
  mess: {
    type: 0,//判断连接交互类型，0为上传用户信息，1位私聊，2位多播
    user: { ip: '', name: '', }//用户信息
  },
  users: []//好友列表
};

window.onload = function () {

  (function () {
    //websocket操作
    if (!window.WebSocket) {
      //兼容Moz
      window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {

      //连接到服务器
      socket = new WebSocket("ws://localhost:3030/ws");

      //建立连接成功后的回调
      socket.onopen = function (req) {
      }

      //接收到服务器数据的回调
      socket.onmessage = function (req) {
        console.log(req.data)
        var data = JSON.parse(req.data);
        if (data.type == 99)//初始化
        {
          globalItem.myIp = data.myIp;
          setTimeout("finishLoadingRender1()", 100);
          $(".header").find(".nickname").text(globalItem.myName);
          $(".profile_mini_m_bd").find(".nickname").text(globalItem.myName);
          $(".profile_mini_m_bd").find(".ip").text(globalItem.myIp);
        }
        if (data.type == 0) {//初始化或更新在线用户列表
          globalItem.users.forEach((item, index) => {
            if (data.user.ip == item.ip) {
              globalItem.users.splice(index, 1)
            }
          });
          globalItem.users.push(data.user)
          addressList.vue.fris = globalItem.users.filter(function (item, index) {
            console.log(globalItem.users[index])
            if (item.ip != globalItem.myIp) return true;
            else { return false; }
          })
        }
        if (data.type == 2) {//收到信息
          var mess = data.mes;
          var idx;
          var h = 1;
          chatList.vue.dans.forEach(function (item, index) {
            if (item.name == data.sender.name) {
              h = 0;
              idx = index;
              return false;
            }
            else { return; }
          })
          var dan = new Object();
          //把该联系人放到最前
          if (h == 0) {
            console.log(123)
            dan = chatList.vue.dans[idx];
            dan.lefts++;
            dan.msg = mess.value;
            chatList.vue.dans.splice(idx, 1);
          }
          //创建新的最近联系人
          else {
            dan = {
              name: data.sender.name,
              msg: mess.value,
              ip: data.sender.ip,
              lefts: 1,
              messes: []
            }
          }
          console.log(mess)
          dan.messes.push(mess)
          chatList.vue.dans.push(dan);
          chatList.vue.c = 0;
        }

      }

      //连接关闭后的回调
      socket.onclose = function (req) {
      }

      //连接发生错误
      socket.onerror = function (err) {
        $(".lose .dec_txt").text("与服务器断开连接");
        failRender();
      }


      //文件传输用websocket服务器
      socket2 = new WebSocket("ws://localhost:3030/ws")

      //接收到服务器数据的回调
      socket2.onmessage = function (req) {}

      //连接发生错误
      socket2.onerror = function (err) {
        $(".lose .dec_txt").text("与服务器断开连接");
        failRender();
      }

      //监听窗口关闭
      window.onbeforeunload = function () {
        var mess = { type: 100 }
        socket.send(JSON.stringify(mess))
        socket.close()
      }
    }
  }());

  //登录业务
  $("#login_form").submit(function (event) {
    event.preventDefault();

    if ($(".box_overlay").hasClass("none")) {
      if ($("#account").val() != "" && $("#password").val() != "") {
        globalItem.myName = $("#account").val();
        globalItem.myIp = $('#password').val();
        console.log(globalItem.myIp)
        globalItem.mess = {};
        globalItem.mess.type = 0; //设置交互类型为上传用户信息
        globalItem.mess.user = { ip: $('#password').val(), name: $("#account").val() }
        socket.send(JSON.stringify(globalItem.mess))
        api.beforeLogin();
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
  //发起聊天，建立TCP连接
  toChat: function (name, ip) {
    //主动发送TCP建立连接请求，先经过客户端自己与服务器建立的websocket连接，再通过服务器的TCP服务传到目标服务器的客户端
    var mess = {
      type: 1,
      receiver: {
        name: name,
        ip: ip.split(":")[0]
      },
      sender: {
        name: globalItem.myName,
        ip: globalItem.myIp.split(":")[0]
      }
    }
    socket.send(JSON.stringify(mess))
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
      dan.lefts = 0;
      chatList.vue.dans.splice(idx, 1);
    }
    //创建新的最近联系人
    else {
      dan = {
        name: name,
        msg: '',
        ip: ip,
        lefts: 0,
        messes: []
      }
    }
    chatList.vue.dans.push(dan);
    chatList.vue.c = 0;
    //利用属性lefts记录未读消息数
    chatList.vue.dans[0].lefts = 0;
    //把消息数组同步到显示的消息列表
    chatList.vue.dans.forEach(function (item, index) {
      if (ip == item.ip) {
        idx = index;
        return;
      }
    })
    messList.vue.messes = chatList.vue.dans[idx].messes
    //样式改变
    $(".contacts_message").addClass("none");
    $(".title_wrap .title").addClass("none");
    $(".noones").addClass("none");
    $(".empty").addClass("none");
    $(".title_poi").removeClass("none");
    $(".chatin").removeClass("none");
    $(".mm-repeat").removeClass("none");
    if ($(".mm-repeat").find($(".message")).length == 0) { $(".message_empty").removeClass("none"); $(".message_empty .nonotes").removeClass("none"); }
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

    $(".chatin").undelegate();//解除绑定
    // $(".more").undelegate();//解除绑定
    api.callback3(name, ip);//调用callback3发送信息};
    api.callback4(name, ip);//调用callback3发送信息};

  },
  intervals: 0,
  //发送信息
  callback3: function (name, ip) {
    var that = this
    $(".chatin").delegate(".btn_send", "click", function (event) {
      event.preventDefault();
      that.intervals++;
      setTimeout("api.intervals = 0;", 6000)
      if (that.intervals > 5) { $(".warning .dec_txt").text("发送时间过于频繁"); errorRender(); }
      else {
        var contents = $("#editArea").val();
        if ($.trim(contents).length > 0) {
          var clock = api.currentTime();
          var idx;
          //把发送的信息存入联系人的消息数组中
          chatList.vue.dans.forEach(function (item, index) {
            if (ip == item.ip) {
              idx = index;
              return;
            }
          })
          var mes = new Object();
          mes = { obj: 1, value: contents, time: clock }
          chatList.vue.dans[idx].msg = contents;
          chatList.vue.dans[idx].messes.push(mes)
          //把消息数组同步到显示的消息列表
          messList.vue.messes = chatList.vue.dans[idx].messes
          //向服务端发送数据（TCP）
          var mess = {
            type: 2,
            mes: { obj: 2, value: contents, time: clock },
            receiver: {
              name: name,
              ip: ip
            },
            sender: {
              name: globalItem.myName,
              ip: globalItem.myIp
            }
          }
          $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部
          console.log(messList.vue.messes)
          socket.send(JSON.stringify(mess))
          $("#editArea").val("");
        } else {
          $(".warning .dec_txt").text("发送消息不能为空");
          errorRender();
          return false;
        }
      }

    })
  },

  //发送arraybuffer（二进制文件）
  callback4: function (name, ip) {
    $(".chatin").delegate(".web_chat_pic_label", "click", function (event) {
      $('#fileUpload').click()
    })

  },

  //立即执行函数
  initItem: function () {

    //文件提交
    $('#fileUpload').change(function () {
      console.log(123)
      var inputElement = document.getElementById("fileUpload");
      var fileList = inputElement.files;
      console.log(fileList)
      var reader = new FileReader();
      //以二进制发送文件
      reader.readAsArrayBuffer(fileList[0]);
      //文件读取完毕后该函数响应
      reader.onload = function loaded(evt) {
        // console.log("文件读取完毕")
        var binaryString = evt.target.result;
        console.log(binaryString)
        //发送文件
        socket2.send(binaryString);
      }
    })

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
        if ($(".mm-repeat").find($(".message")).length == 0) { $(".message_empty").removeClass("none"); }
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


    //好友个人信息小框触发
    $(".member img , .you img").click(function toggleSystemMenu2(ev) {
      var obj = $("#mmpop_f_profile");
      drag(obj);
      $(".profile_f_mini_bd").find(".id").text($(".mm-repeat").data("signal"));
      var name = $(".box_hd .title_name ").text();
      $(".profile_f_mini_bd").find(".nickname").text(name);
      //兼容IE浏览器；获取鼠标点击的坐标     
      var oEvent = ev || client;
      var w = document.body.scrollWidth;
      var h = document.body.scrollHeight;
      var hideX = document.body.scrollLeft;
      if (oEvent.clientX + 8 + 220 > w) { var x = oEvent.clientX - 8 - 220 }
      else { var x = oEvent.clientX + 8; }
      if (oEvent.clientY + 20 + 336 > h) { var y = oEvent.clientY - 20 - 336 }
      else { var y = oEvent.clientY; }
      $("#mmpop_f_profile").fadeOut(150).fadeIn(150).css({
        "top": y + "px",
        "left": x + hideX + "px"
      });
      $("#mmpop").hide();
      $(".dropdown").addClass("none");
      $(".change_box").hide();
      $("#mmpop_profile").fadeOut(150);
      $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
      setTimeout('$(".slide-top").hide()', 150);
    });

    //点击弹出发送表情框
    $(".web_chat_face").click(function (event) {
      event.stopPropagation();
      $(".dropdown").addClass("none");
      $(".mmpop").hide();
      if ($(".slide-top").is(":hidden")) {
        $(".slide-top").show().animate({ top: "-272px", opacity: 100 }, 100);
      }
      else {
        $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
        setTimeout('$(".slide-top").hide()', 150);
      }
    })
    //点击更换表情列表
    $(".exp_hd_item").click(function () {
      var idx = $(this).index();
      $(this).addClass("exp_hd_active");
      $(".exp_hd_item").not($(this)).removeClass("exp_hd_active");
      $(".exp_cont").eq(idx).removeClass("none");
      $(".exp_cont").not($(".exp_cont").eq(idx)).addClass("none");
    })

  }(),

  //获取当前时间
  currentTime: function () {
    var clock = { time: "", date: "", ddate: "", m: "" };
    var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日
    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分        
    //time：时分；date：年月日；ddate：日；m：年月
    if (hh < 10)
      clock.time += "0";
    clock.time += hh + ":";
    if (mm < 10)
      clock.time += '0';
    clock.time += mm;

    clock.date = year + "-";
    if (month < 10)
      clock.date += "0";
    clock.date += month + "-";
    if (day < 10)
      clock.date += "0";
    clock.date += day;

    if (day < 10)
      clock.ddate += "0";
    clock.ddate += day;

    clock.m = year + "-";
    if (month < 10)
      clock.m += "0";
    clock.m += month;

    return (clock);
  },

  //发送消息表情处理
  faceReplace: function (content) {
    var str = "<xmp>" + content + "</xmp>";
    //处理表情
    var callback5 = function () {
      $(".exp_bd .face").each(function foo(index, element) {
        var val = "[" + $(this).text() + "]";
        var f_start = str.indexOf(val);
        if (f_start != -1)  //说明val表情存在
        {
          var f_end = f_start + val.length;
          var s_end = str.length;
          var before = str.substring(0, f_start);
          var after = str.substring(f_end, s_end);
          var c = $(this).attr("class");
          //把内容中[...]替换为显示表情的标签，用xmp过滤其他内容，防止不友好操作
          str = before + "</xmp>" + '<div class="' + c + '"></div>' + "<xmp>" + after;
          var f_start = str.indexOf(val);
          if (f_start != -1) { callback5(); } //处理重复出现的表情
        }
      })
    }
    callback5();
    return str;
  }
}
