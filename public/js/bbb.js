$(function () {
  //所有代码都是等dom加载完毕才会去执行！
  leadAddress = "http://127.0.0.1:3000/";
  userId = "用户id";
  shineFlag = false;
  s = 0;   //用作是否点击过具体联系人详细信息的标记
  p = 0;   //用作是否点击过联系人发消息的标记

  //获取当前时间
  function CurrentTime() {
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
  }

  //切换登录/注册
  var selectSign = function () {
    $('.login_box .text-button').on('click', function () {
      $('.login_box').removeClass('open');
      setTimeout(function () {
        $('.login_box').addClass('none');
        $('.register_box').removeClass('none');
      }, 300);
      setTimeout(function () {
        $('.register_box').addClass('open');
      }, 350);
    })
    $('.register_box .text-button').on('click', function () {
      $('.register_box').removeClass('open');
      setTimeout(function () {
        $('.register_box').addClass('none');
        $('.login_box').removeClass('none');
      }, 300);
      setTimeout(function () {
        $('.login_box').addClass('open');
      }, 350);
    })

  }()

  // 设置cookie  
  var setCookie = function (c_name, value, expiremMinutes) {
    var exdate = new Date();
    exdate.setTime(exdate.getTime() + expiremMinutes * 60 * 1000);  //设置日期毫秒数
    document.cookie += c_name + "=" + escape(value) + ((expiremMinutes == null) ? "" : ";expires=" + exdate.toGMTString());
  };
  // 读取cookie  
  getCookie = function (c_name) {
    if (document.cookie.length > 0) {
      var c_start = document.cookie.indexOf(c_name + "=");  //找到c_name=首次出现的地方
      if (c_start != -1)  //说明c_name=存在
      {
        c_start = c_start + c_name.length + 1;  //找到=的下一个位置
        var c_end = document.cookie.indexOf(";", c_start);  //从上一步的位置开始查找，直到";"的位置
        if (c_end == -1) { c_end = document.cookie.length; }
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return "";
  };
  // 删除cookie  
  delCookie = function (c_name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = this.getCookie(c_name);
    if (cval != null) {
      document.cookie = c_name + "=" + cval + ";expires=" + exp.toGMTString();
    }
  };


  //发送消息表情处理
  faceReplace = function (content) {
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

  //存储聊天数据
  function creatPerson(id) {
    this.id = id;
    this.m = 1;//判断是否显示时间
    this.message = Array();//储存聊天消息内容
    this.note = "";
    this.meFlag = Array();//储存发送人(自己或好友)
    this.time = Array();//储存时间
    //储存消息
    this.getMessage = function () {
      for (i = 2; i < $(".message").length; i++) {
        this.message[i - 2] = $(".message").eq(i).find(".message_plain").html();
        this.time[i - 2] = $(".message-time").eq(i).find(" .content").text();
        if ($(".message").eq(i).is(".me")) { this.meFlag[i - 2] = 1; }
        else { this.meFlag[i - 2] = 0; }
      }
    }
    //添加消息
    this.setMessage = function () {
      for (i = 0; i < this.message.length; i++) {
        if (this.meFlag[i] == 1) {
          $(".mm-repeat").append(($(".me").eq(0)).clone(true));
          $(".me").last().show();
          $(".me").last().find(".message_plain").html(this.message[i]);
          if (this.time[i]) {
            $(".me").last().find($(".message-time")).removeClass("none");
            $(".me").last().find($(".message-time")).find(".content").text(this.time[i])
          }
        }
        else {
          $(".mm-repeat").append(($(".you").eq(0)).clone(true));
          $(".you").last().show();
          $(".you").last().find(".message_plain").html(this.message[i]);
          if (this.time[i]) {
            $(".you").last().find($(".message-time")).removeClass("none");
            $(".you").last().find($(".message-time .content")).text(this.time[i])
          }
        }
      }
    }
    //删除消息内容
    this.emptyMessage = function () {
      this.message = "";
      this.time = "";
      this.meFlag = "";
      this.message = Array();//储存消息内容
      this.meFlag = Array();//储存发送人
      this.time = Array();//储存时间
    }
  }
  Num = Array();

  //查找对象对应Num位置
  function findNum(rs) {
    for (i = 0; i < Num.length; i++) {
      if (Num[i].id == rs) { return i; }
    }
  }

  //刷新时间显示
  var renovateTime = function () {
    for (i = 0; i < Num.length; i++) {
      if (Num[i].time != "") {
        var l = Num[i].time.length - 1;
        var k;
        for (var j = 0; j <= l; j++) {
          if (Num[i].time[j] != "") { k = j }
        }//找到上一次显示的时间
        var h = Num[i].time[k].substring(0, 2);
        var m = Num[i].time[k].substring(3, 5);
        var now = new Date();
        var hh = now.getHours();
        var mm = now.getMinutes();
        if (h != hh) { Num[i].m = 1; }
        else {
          var aaa = m - mm;
          if (Math.abs(aaa) < 3) return false;
          else { Num[i].m = 1 }
        }
      }
    }
  }

  //初始化登录窗口
  document.getElementById("account").focus();
  if (window.localStorage) {
    $("#account").val(localStorage.getItem("lastLoginName"))//显示上次记住密码时的登录账号
    var pas = localStorage.getItem($.trim($("#account").val()));//获取账号对应的密码值
    $("#password").val(pas);  //赋值给password
    if (pas == "" || pas == undefined || pas == null) {
      $("#passwordkeeping").prop("checked", false)
    } else {
      $("#passwordkeeping").prop("checked", true)
    }
  }


  //登录表单验证
  $("#account,#account_b,#password,#password_b").blur(function () {
    //验证选项是否为空
    if ($(this).val() == "") {
      $(this).next().next().show();
    } else {
      $(this).next().next().hide();
    }
  });
  $("#repassword_b").blur(function () {
    //验证密码是否相同
    if ($("#password_b").val() != $(this).val()) {
      $(this).next().next().show();
    } else {
      $(this).next().next().hide();
    }
  });

  //获取密码
  $("#account").keyup(function () {
    if (window.localStorage) {
      var pas = localStorage.getItem($.trim($("#account").val()));//获取账号对应的密码值
      $("#password").val(pas);  //赋值给password
      if (pas == "" || pas == undefined || pas == null) {
        $("#passwordkeeping").prop("checked", false)
      } else {
        $("#passwordkeeping").prop("checked", true)
      }
    }
    else {
      var pas = getCookie($.trim($("#account").val()));//获取cookie
      $("#password").val(pas);  //赋值给password
    }
  });

  //注册接口
  $('#register_form').submit(function (event) {
    event.preventDefault();
    if ($(".box_overlay").hasClass("none")) {
      var account = $("#account_b").val();
      var password = $("#password_b").val();
      var repassword = $('#repassword_b').val();
      if (account && password && repassword == password) {
        $.ajax({
          url: leadAddress + 'register',
          dataType: 'json',
          type: 'post',
          data: { account: account, password: password },
          error: function () {
            $(".warning .dec_txt").text("服务器错误");
            setTimeout("finishLoadingRender4()", 100);
          },
          success: function (data) {
            var result = data.result
            // var result = JSON.parse(data).result;
            if (result == "success") {
              $(".success .dec_txt").text("注册成功");
              setTimeout("finishLoadingRender3()", 100);
            }
            if (result == "failed") {
              $(".lose .dec_txt").text(data.reason);
              setTimeout("finishLoadingRender2()", 100);
            }
          },
        });
      }
      else {
        $(".warning .dec_txt").text("请输入账号和密码");
        errorRender();
      }
    }
  });


  //登录接口
  $("#login_form").submit(function (event) {
    event.preventDefault();
    if ($(".box_overlay").hasClass("none")) {
      var form = $(this);
      if ($("#account").val() != "" && $("#password").val() != "" && $(".box_overlay").hasClass("none")) {
        $.ajaxSetup({ xhrFields: { withCredentials: true }, crossDomain: true });
        $.ajax({
          url: leadAddress + "login",
          dataType: "json", //返回格式为json
          type: "post",
          data: form.serialize(),
          error: function () {
            $(".warning .dec_txt").text("服务器错误");
            setTimeout("finishLoadingRender4()", 100);
          },
          beforeSend: function () {
            if ($("#passwordkeeping").prop('checked') == true) {
              if (window.localStorage) {
                localStorage.setItem("lastLoginName", $("#account").val()) //记住账号
                localStorage.setItem($("#account").val(), $("#password").val())
              }
              else {
                if (getCookie($("#account").val())) { delCookie($("#account").val()); };
                setCookie($("#account").val(), $("#password").val(), 1440);
              }
            }//记住密码
            else {
              if (window.localStorage) {
                localStorage.setItem($("#account").val(), "")
              }//不记住密码
              else { delCookie($("#account").val()); }
            }
            loadRender();
          },
          success: function (data) {
            var result = data.result
            // var result = JSON.parse(data).result;
            if (result == "success") {
              console.log(data)
              callback(data.userid);//调用callback获取用户信息
              callback1(data.userid);//调用callback1获取好友列表
              callback2(data.userid);//调用callback2获取未读消息
              userId = data.userid;
              setTimeout("finishLoadingRender1()", 100);
            }
            if (result == "failed") {
              $(".lose .dec_txt").text(data.reason);
              setTimeout("finishLoadingRender2()", 100);
            }
          },
        });
      }
      else {
        $(".warning .dec_txt").text("请输入账号和密码");
        errorRender();
      }
    }
  });

  //登录成功后调用接口
  var callback = function (rs) {//rs为登录接口ajax方法返回的数据  
    var userid = rs;
    //登出后不记住密码
    $("#password").val("");
    //获取用户本人信息
    $.ajax({
      url: leadAddress + "getUserInfor",
      dataType: "json", //返回格式为json
      type: "get",
      data: { id: userid },
      error: function () {
        $(".warning .dec_txt").text("获取用户个人信息失败");
        errorRender();
      },
      success: function (data) {
        console.log(arguments);
        if (data.result == "failed") {
          $(".lose .dec_txt").text(data.reason);
          failRender();
        }
        else {
          //昵称信息
          $(".header").find(".nickname").text(data.nickname);
          //小个人信息框
          $(".profile_mini_m_bd").find(".nickname").text(data.nickname);
          $(".profile_mini_m_bd").find(".age").text(data.age);
          $(".profile_mini_m_bd").find(".mailbox").text(data.mailbox);
          $(".profile_mini_m_bd").find(".address").text(data.address);
          //对更改个人信息框初始化
          $(".change_account").attr("value", data.nickname);
          $(".change_age").attr("value", data.age);
          $(".change_mailbox").attr("value", data.mailbox);
          $(".change_address").attr("value", data.address);
          $(".change_introduction").attr("value", data.introduction);
        }
      },
    })
  }
  var callback1 = function (rs) {//rs为登录接口ajax方法返回的数据  
    var userid = rs;
    //建立并获取好友列表
    $.ajax({
      url: leadAddress + "getList",
      dataType: "json", //返回格式为json
      type: "POST",
      error: function () {
        $(".warning .dec_txt").text("获取好友列表失败");
        errorRender();
      },
      success: function (data) {
        console.log(arguments);
        if (data.result == "failed") {
          $(".lose .dec_txt").text(data.reason);
          failRender();
        }
        else {
          var t = data.length;
          for (var i = 1; i < t; i++) {
            //插入联系人节点
            $(".lists").append(($(".ng-repeat").eq(0)).clone(true));
          };
          for (var i = 0; i < t; i++) {
            //插入联系人昵称
            $(".contact-list").find(".nickname").eq(i).text(data[i].nickname);
            //给每个联系人加入一个储存账户id的属性
            $(".contact-list").find(".ng-repeat").eq(i).data("signal", data[i].id);
            Num[i] = new creatPerson(data[i].id);//函数实例化
          };
        }
      }
    })
  }

  var callback2 = function (rs) {
    var userid = rs;
    //收到未读信息
    $(function () {
      function getUnreadChatRecord() {
        $.ajax({
          url: leadAddress + "getUnreadChatRecord",
          dataType: "json", //返回格式为json
          type: "get",
          error: function () {
            $(".warning .dec_txt").text("服务器错误");
            errorRender();
          },
          success: function (data) {
            console.log(arguments);
            if (data.result == "failed") {
              $(".lose .dec_txt").text(data.reason);
              failRender();
            }
            else {
              var t = data.length;
              //判断是否有未读信息
              if (t) {
                $(".hint").removeClass("none");
                if (!$(".menuicon_volume").hasClass("menuicon_volume_off")) { $('#tidings')[0].play(); }//新消息提示音
                shineFlag = true;
                //获取未读信息
                for (var i = 0; i < t; i++) {
                  var idx;
                  var h = 1;
                  //用h来判断发消息者是否在最近联系人中
                  $(".chat-repeat").each(function (index, element) {
                    if ($(this).data("signal") == data[i].sender) {
                      h = 0; //标志发消息者在最近联系人中，不需重新创建节点
                      idx = $(this).index();
                      return false;
                    }
                    else { return; }
                  });
                  //时间判断
                  var clock = CurrentTime();
                  var time = data[i].date;
                  var d = time.slice(0, 10);
                  var dd = time.slice(8, 10);
                  var m = time.slice(0, 7);
                  var showTime = d + ' ' + time.slice(11, 16);
                  if (d == clock.date) { showTime = time.slice(11, 16) };
                  if (parseFloat(dd) == parseFloat(clock.ddate) - 1 && m == clock.m) { showTime = "昨天" + time.slice(11, 16) };

                  if (h == 0) {
                    $(".chats").prepend($(".chat-repeat").eq(idx));//把发消息者移到最近联系人顶部
                  }
                  else {
                    //创造一个新的最近联系人
                    $(".message_empty").addClass("none");
                    $(".chats").prepend(($(".chat-repeat").eq(0)).clone(true));
                    $(".chat-repeat").eq(0).removeClass("none");
                    $(".chat-repeat").eq(0).removeClass("active");
                    //利用属性lefts记录未读消息数
                    $(".chat-repeat").eq(0).data("lefts", 0);
                  }
                  var demonstrate = faceReplace(data[i].content);//代入表情 
                  //储存聊天信息
                  var k = findNum(data[i].sender);
                  var l = Num[k].message.length;
                  Num[k].message[l] = demonstrate;
                  Num[k].meFlag[l] = 0;
                  //如果联系人刚好为当前聊天框则直接添加消息
                  if ($(".mm-repeat").data("signal") == data[i].sender) {
                    $(".message_empty").addClass("none");
                    $(".mm-repeat").append(($(".you").eq(0)).clone(true));
                    $(".mm-repeat").find($(".you").last()).show();
                    $(".mm-repeat").find($(".you").last()).find(".message_plain").html(demonstrate);
                    if (Num[k].m == 1) {
                      //插入时间
                      $(".you").last().find($(".message-time")).removeClass("none");
                      $(".you").last().find($(".message-time .content")).text(showTime);
                    }
                  }
                  //获取发消息人的昵称    
                  var nickname;
                  $(".ng-repeat").each(function (index, element) {
                    if ($(this).data("signal") == data[i].sender) {
                      nickname = $(this).find(".nickname").text();
                    }
                  });
                  if (!$(".menuicon_push").hasClass("menuicon_push_off")) { showNotice(nickname, data[i].content); }//新消息桌面通知
                  $(".chat-repeat").eq(0).find(".nickname").text(nickname);
                  $(".chat-repeat").eq(0).find(".msg").html(demonstrate);
                  //获取未读信息数目
                  var b = $(".chat-repeat").eq(0).data("lefts");
                  b++;
                  $(".chat-repeat").eq(0).data("lefts", b);
                  $(".chat-repeat").eq(0).find(".icon").removeClass("none");
                  if (b < 100) {
                    $(".chat-repeat").eq(0).find(".icon").text(b);
                  }
                  else {
                    $(".chat-repeat").eq(0).find(".icon").addClass("web_wechat_reddot_bbig")
                    $(".chat-repeat").eq(0).find(".icon").text("...")
                  }
                  //获取聊天时间 
                  $(".chat-repeat").eq(0).find(".msg-time").text(showTime);
                  if (Num[k].m == 1) {
                    //储存时间
                    Num[k].time[l] = showTime;
                    Num[k].m = 0;
                  }
                  renovateTime();
                  $(".chat-repeat").eq(0).data("signal", data[i].sender);
                  $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部
                }
              };
            }
          }
        })
      }
      setInterval(getUnreadChatRecord, 3000);
    });
  }


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
      if (p == 1) {
        $(".chatin").removeClass("none");
        $(".chatout").removeClass("none");
        $(".mm-repeat").removeClass("none");
        $(".noones").addClass("none");
        $(".nonotes").removeClass("none");
      }
      if (p == 0) {
        $(".noones").removeClass("none");
        $(".mm-repeat").addClass("none");
        $(".contacts_message").addClass("none");
      }
      if (p == 2) {
        $(".noones").removeClass("none");
        $(".title_poi").addClass("none");
        $(".chatin").addClass("none");
        $(".mm-repeat").addClass("none");
        $(".message_empty").removeClass("none");
      }
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
      if (s == 1) { $(".empty").addClass("none"); $(".contacts_message").removeClass("none"); }
      else { $(".empty").removeClass("none"); };
      //判断是否曾点击过具体联系人详细信息
      $(".chatin").addClass("none");
      $(".mm-repeat").addClass("none");
      $(".title_poi").addClass("none");
      $(".title_wrap .title").removeClass("none");
    }
  });


  //搜索框搜索
  $(".frm_search").keyup(function () {
    $(".ss-repeat").not($(".ss-repeat").last()).detach();
    var txt = $(".frm_search").val();
    var j = 0;
    if ($.trim(txt) != "") {
      $(".recommendation").show();
      for (var i = 0; i < $(".ng-repeat").length; i++) {
        if ($(".ng-repeat").eq(i).find(".nickname").text().indexOf($.trim(txt)) > -1) {
          $(".recommendation .contact-title").text("好友");
          $(".search-list").append(($(".ss-repeat").last()).clone(true));
          $(".ss-repeat").eq(j).find(".nickname").text($(".ng-repeat").eq(i).find(".nickname").text());
          $(".ss-repeat").eq(j).removeClass("none");
          j++;
          console.log($(".ng-repeat").eq(i).find(".nickname").text());
        }
      }
      if ($(".ss-repeat").length == 1) { $(".recommendation .contact-title").text("找不到匹配的结果"); }
    }
    else {
      $(".recommendation").hide();
    }
  })


  //设置按钮触发框
  $(".header .opt").click(function toggleSystemMenu() {
    $("#mmpop").toggle();
    $(".mmpop").not($("#mmpop")).hide();
    $(".dropdown").addClass("none");
    $(".slide-top").animate({ top: "-252px", opacity: 0 }, 150);
    setTimeout('$(".slide-top").hide()', 150);
  });

  //是否打开提示音选择
  $(".tidings_ctrl").click(function () {
    $("#mmpop").hide();
    $(".menuicon_volume").toggleClass("menuicon_volume_off");
    var str = $(".tidings_ctrl").html();
    if ($(".menuicon_volume").hasClass("menuicon_volume_off")) {
      $(".tidings_ctrl").html(str.replace("关闭", "打开").replace("关闭", "打开"));
    }
    else { $(".tidings_ctrl").html(str.replace("打开", "关闭").replace("打开", "关闭")); }
  })

  //是否打开桌面通知选择
  $(".notice_ctrl").click(function () {
    $("#mmpop").hide();
    $(".menuicon_push").toggleClass("menuicon_push_off");
    var str = $(".notice_ctrl").html();
    if ($(".menuicon_push").hasClass("menuicon_push_off")) {
      $(".notice_ctrl").html(str.replace("关闭", "打开").replace("关闭", "打开"));
    }
    else { $(".notice_ctrl").html(str.replace("打开", "关闭").replace("打开", "关闭")); }
  })


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

  //用户更改个人信息触发框
  $(".web_chat_tab_change").click(function () {
    var obj = $(".change_box");
    drag(obj);
    var w = document.body.scrollWidth;//浏览器全文宽
    if ($("#mmpop_profile").offset().left + 230 + 370 > w) { var x = $("#mmpop_profile").offset().left - 380; }
    else { var x = $("#mmpop_profile").offset().left + 230; }
    var y = $("#mmpop_profile").offset().top - 8;
    $(".change_box").toggle(200).css({
      "top": y + "px",
      "left": x + "px"
    });
    $("#mmpop").hide();

    //关闭更改信息框
    $(".exit img").click(function () {
      $(".change_box").hide();
      $(".change_success").hide();
    });
  });

  key = [1, 1, 1, 1, 1];//检验表单能否通过验证

  //更改个人信息表单样式·表单验证
  $(".changes").focus(function () {
    $(this).css("color", "#0e0e0e");
  });
  $(".changes").blur(function () {
    $(this).css("color", "#bbb");
    //验证昵称、
    if ($(this).is(".change_account")) {
      //使用正则表达式验证
      if (!/^[\u4e00-\u9fa5a-zA-Z0-9]{1,9}$/.test(this.value)) {
        var errorMsg = "用户昵称必须为1-10位数字字母汉字下划线组合！";
        $(".tip").text(errorMsg);
        $(".tip").show();
        key[0] = 0;
      }
      else { key[0] = 1; $(".tip").hide(); }
    }
    //验证签名(可以为空)
    if ($(this).is(".change_introduction")) {
      if (this.value.length > 30) {
        var errorMsg = "个性签名最多不超过30个字！";
        $(".tip").text(errorMsg);
        $(".tip").show();
        key[1] = 0;
      }
      else { key[1] = 1; $(".tip").hide(); }
    }
    //验证年龄(可以为空)
    if ($(this).is(".change_age")) {
      if ($.trim(this.value) != "" && (isNaN(this.value) || this.value < 1 || this.value > 120)) {
        var errorMsg = "请输入正确的年龄格式！";
        $(".tip").text(errorMsg);
        $(".tip").show();
        key[2] = 0;
      }
      else { key[2] = 1; $(".tip").hide(); }
    }
    //验证邮箱(可以为空)
    if ($(this).is(".change_mailbox")) {
      //使用正则表达式验证
      if (($.trim(this.value) != "" && ! /^[a-z0-9]+@[a-z0-9]{2,3}(\.[a-z]{2,3}){1,2}$/.test(this.value))) {
        var errorMsg = "请输入正确的E-Mail地址！";
        $(".tip").text(errorMsg);
        $(".tip").show();
        key[3] = 0;
      }
      else { key[3] = 1; $(".tip").hide(); }
    }
  });

  //更改个人信息表单提交
  $("#change_form").submit(function (event) {
    event.preventDefault();
    if ($(".box_overlay").hasClass("none")) {
      if (key == "1,1,1,1,1") {
        var form = $(this);
        $.ajaxSetup({ xhrFields: { withCredentials: true }, crossDomain: true });
        $.ajax({
          url: leadAddress + "updateUserInfor",
          dataType: "json", //返回格式为json
          type: "post",
          async: false,
          data: form.serialize(),
          beforeSend: function () { loadRender(); },
          error: function () {
            $(".warning .dec_txt").text("提交失败");
            errorRender();
          },
          success: function (data) {
            console.log(arguments);
            if (data.result == "success") {
              $(".change_success").text("更改成功!");
              $(".change_success").show();
              $(".success .dec_txt").text("更改成功");
              setTimeout("finishLoadingRender3()", 100);
              callback(userId);//调用callback更改用户本人信息
            }
            if (data.result == "failed") {
              $(".lose .dec_txt").text(data.reason);
              setTimeout("finishLoadingRender2()", 100);
            }
          },
        });
      };
    }
  });

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


  //右键事件：
  //最近联系人框添加右键事件
  $(".chat-repeat").contextmenu(function (event) {
    $("#chatMenu").addClass("none");
    $("#MsgMenu").addClass("none");
    //兼容IE浏览器；获取鼠标点击的坐标     
    var oEvent = event || client;
    var x = oEvent.clientX;
    var y = oEvent.clientY;
    $("#contextMenu").removeClass("none");
    $("#contextMenu").css({ "left": x + "px", "top": y + "px" });
    var idx = $(this).index();
    var pointer = $(this).data("signal");
    $("#contextMenu .item").off();
    callback4(idx, pointer);
    return false;
  })

  //关闭聊天
  var callback4 = function (idx, pointer) {
    $("#contextMenu .item").on("click", function () {
      $(".chat-repeat").eq(idx).detach();
      var k = findNum(pointer);
      Num[k].emptyMessage();
      Num[k].m = 1;
      if ($(".mm-repeat").data("signal") == pointer) {
        p = 2;
        $(".noones").removeClass("none");
        $(".title_poi").addClass("none");
        $(".chatin").addClass("none");
        $(".mm-repeat").addClass("none");
        $(".message_empty").removeClass("none");
      }
      $("#contextMenu").addClass("none");
    });
  }

  //聊天框添加右键事件
  $(".mm-repeat").contextmenu(function (event) {
    $("#contextMenu").addClass("none");
    $("#MsgMenu").addClass("none");
    //兼容IE浏览器；获取鼠标点击的坐标     
    var oEvent = event || client;
    var x = oEvent.clientX;
    var y = oEvent.clientY;
    $("#chatMenu").removeClass("none");
    $("#chatMenu").css({ "left": x + "px", "top": y + "px" });
    var pointer = $(this).data("signal");
    $("#chatMenu .item").off();
    callback6(pointer);
    return false;
  })

  //清空聊天框消息
  var callback6 = function (pointer) {
    $("#chatMenu .item").on("click", function () {
      var k = findNum(pointer);
      Num[k].emptyMessage();
      Num[k].m = 1;
      $(".message").slice(2).detach();
      $(".message_empty").removeClass("none");
      $(".message_empty .nonotes").removeClass("none");
      $("#chatMenu").addClass("none");
    });
  }

  //消息添加右键事件
  $(".bubble_cont").contextmenu(function (event) {
    event.stopPropagation();
    $("#chatMenu").addClass("none");
    $("#contextMenu").addClass("none");
    //兼容IE浏览器；获取鼠标点击的坐标     
    var oEvent = event || client;
    var x = oEvent.clientX;
    var y = oEvent.clientY;
    $("#MsgMenu").removeClass("none");
    $("#MsgMenu").css({ "left": x + "px", "top": y + "px" });
    var idx = $(this).parent().parent().parent().index() - 1;
    var pointer = $(".mm-repeat").data("signal");
    $("#MsgMenu .item").off();
    callback7(idx, pointer);
    return false;
  })

  //删除聊天消息
  var callback7 = function (idx, pointer) {
    $("#MsgMenu .item").on("click", function () {
      var k = findNum(pointer);
      $(".message").eq(idx).detach();
      Num[k].emptyMessage();
      Num[k].getMessage();
      $("#MsgMenu").addClass("none");
    })
  }

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



  //点击通讯录联系人
  $(".ng-repeat").bind("click", function () {
    s = 1;  //标记曾点击过具体联系人详细信息
    $(".empty").addClass("none");
    $(".contacts_message").removeClass("none");
    $(".chatin").addClass("none");
    var idx = $(this).index(".ng-repeat");
    var t = $(".ng-repeat").eq(idx).data("signal");
    //点击联系人更换背景色
    $(".ng-repeat").eq(idx).addClass("active");
    $(".ng-repeat").not($(".ng-repeat").eq(idx)).removeClass("active");

    //获取联系人详细信息
    $.ajax({
      url: leadAddress + "getUserInfor",
      dataType: "json", //返回格式为json
      type: "get",
      data: { id: t },
      error: function () {
        $(".warning .dec_txt").text("获取联系人信息失败");
        errorRender();
      },
      success: function (data) {
        console.log(arguments);
        if (data.result == "failed") {
          $(".lose .dec_txt").text(data.reason);
          failRender();
        }
        else {
          //插入联系人信息
          $(".profile").find(".nickname").text(data.nickname);
          //加入if语句兼容联系人部分信息为空的情况
          if (data.introduction) { $(".profile").find(".introduce").text(data.introduction); }
          else { $(".profile").find(".introduce").text(" "); }
          if (data.age) { $(".profile").find(".age").text(data.age); }
          else { $(".profile").find(".age").text(" ") }
          if (data.mailbox) { $(".profile").find(".mailbox").text(data.mailbox); }
          else { $(".profile").find(".mailbox").text(" "); }
          if (data.address) { $(".profile").find(".address").text(data.address); }
          else { $(".profile").find(".address").text(" "); }
          $(".profile").find("img").attr("src", $(".ng-repeat").eq(idx).find("img").attr("src"));
        }
      },
    })
  });

  //发起聊天
  var a = function (t, name) {
    p = 1;
    var h = 1;
    var idx;
    $(".chat-repeat").each(function (index, element) {
      if ($(this).data("signal") == t) {
        h = 0;
        idx = $(this).index();
        return false;
      }
      else { return; }
    });
    //把该最近联系人放到最前   
    if (h == 0) { $(".chats").prepend($(".chat-repeat").eq(idx)); }
    else {
      //创建新的最近联系人
      $(".chats").prepend(($(".chat-repeat").eq(0)).clone(true));
      $(".chat-repeat").eq(0).removeClass("none");
      $(".chat-repeat").eq(0).find(".nickname").text(name);
      $(".chat-repeat").eq(0).find(".msg").text("");
      $(".chat-repeat").eq(0).find(".msg-time").text("");
    }
    //同时创建一个新的聊天消息框
    $(".mm-repeat").find(".more .content").removeClass("none");
    $(".mm-repeat").data("signal", t);
    $(".message").slice(2).detach();
    var k = findNum(t);
    Num[k].setMessage();
    //利用属性lefts记录未读消息数
    $(".chat-repeat").eq(0).data("lefts", 0);
    $(".chat-repeat").eq(0).find(".icon").addClass("none");
    $(".chat-repeat").eq(0).find(".icon").removeClass("web_wechat_reddot_bbig")
    //储存联系人的账户id
    $(".chat-repeat").eq(0).data("signal", t);
    //点击后背景色改变
    $(".chat-repeat").eq(0).addClass("active");
    $(".chat-repeat").not($(".chat-repeat").eq(0)).removeClass("active");
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
    $("#editArea").val(Num[k].note);
    $(".box .web_wechat_turn").removeClass("none");
    $(".box .title_name").text(name);
    $(".hint").addClass("none");//取消未读信息小圆点提示
    shineFlag = false;//取消标题新消息闪烁
    //tab样式改变
    $(".web_chat_tab_chat").addClass("web_chat_tab_chat_h1");
    $(".web_chat_tab_friends").removeClass("web_chat_tab_friends_h1");
    $(".nav_view").eq(0).removeClass("none");
    $(".nav_view").eq(2).addClass("none");
    $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部

    $(".chatin").undelegate();//解除绑定
    $(".more").undelegate();//解除绑定
    callback3(t);//调用callback3发送信息或获取聊天记录};
  }

  //五种方式触发聊天
  //点击“发消息”
  $(".profile .button").on("click", function () {
    var name = $(".contacts_message .nickname").text();
    for (var i = 0; i < $(".ng-repeat").length; i++)
      if ($(".ng-repeat").eq(i).find(".nickname").text() == name) { var t = $(".ng-repeat").eq(i).data("signal"); }
    a(t, name);
  })
  //双击联系人
  $(".ng-repeat").on("dblclick", function () {
    var name = $(".contacts_message .nickname").text();
    for (var i = 0; i < $(".ng-repeat").length; i++)
      if ($(".ng-repeat").eq(i).find(".nickname").text() == name) { var t = $(".ng-repeat").eq(i).data("signal"); }
    a(t, name);
  })
  //搜索栏点击联系人
  $(".ss-repeat").on("click", function () {
    var name = $(this).find(".nickname").text();
    for (var i = 0; i < $(".ng-repeat").length; i++)
      if ($(".ng-repeat").eq(i).find(".nickname").text() == name) { var t = $(".ng-repeat").eq(i).data("signal"); }
    $(".frm_search").val("");
    $(".recommendation").hide();
    a(t, name);
  })
  //好友信息框点击聊天
  $(".chatting").on("click", function () {
    var name = $("#mmpop_f_profile .nickname").text();
    for (var i = 0; i < $(".ng-repeat").length; i++)
      if ($(".ng-repeat").eq(i).find(".nickname").text() == name) { var t = $(".ng-repeat").eq(i).data("signal"); }
    $(".members_wrp,#mmpop_f_profile").hide();
    a(t, name);
  })
  //点击最近聊天联系人
  $(".chats").delegate(".chat-repeat", "click", function (event) {
    p = 1;
    var idx = $(this).index(".chat-repeat");
    var t = $(".chat-repeat").eq(idx).data("signal");
    $(".chat-repeat").eq(idx).addClass("active");
    $(".chat-repeat").not($(".chat-repeat").eq(idx)).removeClass("active");
    $(".hint").addClass("none");//取消未读信息小圆点提示
    shineFlag = false;//取消标题新消息闪烁
    //利用属性lefts记录未读消息数
    $(".chat-repeat").eq(idx).data("lefts", 0);
    $(".chat-repeat").eq(idx).find(".icon").addClass("none");
    $(".chat-repeat").eq(idx).find(".icon").removeClass("web_wechat_reddot_bbig")
    $(".box .web_wechat_turn").removeClass("none");
    $(".title_name").text($(".chat-repeat").eq(idx).find(".nickname").text());
    $("#editArea").focus();
    $(".noones").addClass("none");
    $(".contacts_message").addClass("none");
    $(".title_wrap .title").addClass("none");
    $(".noones").addClass("none");
    $(".title_poi").removeClass("none");
    //创建一个新的聊天消息框
    $(".mm-repeat").find(".more .content").removeClass("none");
    $(".mm-repeat").removeClass("none");
    $(".mm-repeat").data("signal", t);
    $(".message").slice(2).detach();
    var k = findNum(t);
    Num[k].setMessage();
    $("#editArea").val(Num[k].note);
    $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部
    $(".chatin").removeClass("none");
    $(".chatin").undelegate();//取消由点击联系人触发的发送信息的绑定
    if ($(".mm-repeat").find($(".message")).length == 2) { $(".message_empty").removeClass("none"); }
    else { $(".message_empty").addClass("none"); }
    $(".chatin").undelegate();//解除绑定
    $(".more").undelegate();//解除绑定
    callback3(t); //调用callback3发送信息或获取聊天记录
  })
  curr = 0;//记录消息输入框中光标位置
  $("#editArea").keyup(function () {
    curr = getCaret(this);
    var k = findNum($(".mm-repeat").data("signal"));
    Num[k].note = $("#editArea").val();
  })
  $("#editArea").click(function () {
    curr = getCaret(this);
  })

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

  //点击发送表情
  $(".face").on("click", function () {
    var v = "[" + $(this).text() + "]";
    var val = $("#editArea").val();
    var end = val.length;
    $("#editArea").val(val.substr(0, curr) + v + val.substr(curr, end));
    $("#editArea").focus();
    document.getElementById("editArea").selectionStart = curr + v.length;
    document.getElementById("editArea").selectionEnd = curr + v.length;
    curr = getCaret(document.getElementById("editArea"));
  })

  //实现Ctrl+Enter换行和Enter发送消息
  $("#editArea").keydown(function (e) {
    //Ctrl+Enter换行
    if (e.ctrlKey && e.which == 13) {
      var val = $(this).val();
      var end = val.length;
      $(this).val(val.substr(0, curr) + '\n' + val.substr(curr, end));

      this.selectionEnd = curr + 1;
      curr = getCaret(this);
    }
    //Enter发送消息
    if (e.which == 13 && !e.ctrlKey) {
      e.preventDefault();
      $(".btn_send").click();
    }
  })
  function getCaret(el) {
    if (el.selectionStart) {
      return el.selectionStart;
    }
    else if (document.selection) {
      el.focus();
      var r = document.selection.createRange();
      if (r == null) {
        return 0;
      }
      var re = el.createTextRange(),
        rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);
      return rc.text.length;
    }
    return 0;
  }

  intervals = 0;

  var callback3 = function (receiver) {
    //发送信息  
    $(".chatin").delegate(".btn_send", "click", function (event) {
      event.preventDefault();
      intervals++;
      setTimeout("intervals = 0;", 6000)
      if (intervals > 5) { $(".warning .dec_txt").text("发送时间过于频繁"); errorRender(); }
      else {
        var contents = $("#editArea").val();
        var clock = CurrentTime();
        var idx;
        var k = findNum(receiver);
        //找到发送消息的对象
        $(".chat-repeat").each(function (index, element) {
          if ($(this).data("signal") == receiver) {
            idx = $(this).index();
            return false;
          }
          else { return; }
        });
        //排除发送内容为空的情况
        if ($.trim(contents).length > 0) {
          //草稿中代入表情
          var demonstrate = faceReplace(contents);
          $(".btn_send").unbind();
          $(".message_empty").addClass("none");
          $("#editArea").val("");
          Num[k].note = "";
          $(".mm-repeat").append(($(".me").eq(0)).clone(true));
          $(".me").last().show();
          $(".me").last().find(".message_plain").html(demonstrate);

          $(".chat-repeat").eq(idx).find(".msg").html(demonstrate);
          $(".chat-repeat").eq(idx).find(".msg-time").text(clock.time);
          $(".chat-repeat").eq(idx).data("lefts", 0);
          $(".chat-repeat").eq(idx).find(".icon").addClass("none");
          $(".chat-repeat").eq(idx).find(".icon").removeClass("web_wechat_reddot_bbig")
          $(".hint").addClass("none");//取消未读信息小圆点提示
          shineFlag = false;//取消标题新消息闪烁
          $(".chats").prepend($(".chat-repeat").eq(idx));
          if (Num[k].m == 1) {
            //插入时间
            $(".me").last().find($(".message-time")).removeClass("none");
            $(".me").last().find($(".message-time .content")).text(clock.time);
            Num[k].m = 0;
          }
          renovateTime();
          $("#editArea").focus();
          $.ajax({
            url: leadAddress + "sendContent",
            dataType: "json", //返回格式为json
            type: "post",
            data: { receiver: receiver, content: contents },
            beforeSend: function () {
              $(".message .loading").last().html('<img src="image2/loading.gif" height="16" width="16" alt="loading"/>');//发送loading的图标
            },
            error: function () {
              $(".warning .dec_txt").text("发送失败");
              errorRender();
              $(".message.loading").last().empty();
              $(".message .loading").last().html('<img src="image2/fail1.png" height="17" width="16" alt="fail"/>');//发送fail的图标
            },
            success: function (data) {
              console.log(arguments);
              $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部
              if (data.result == "failed") {
                $(".message .loading").last().empty();
                $(".message .loading").last().html('<img src="image2/fail1.png" height="17" width="16" alt="fail"/>');
                $(".lose .dec_txt").text(data.reason);
                failRender();
              }
              else {
                $(".message .loading").last().empty();
                //储存聊天消息
                Num[k].getMessage();
              }
            },
          })
        }
        else {
          $(".warning .dec_txt").text("发送消息不能为空");
          errorRender();
          return false;
        }
      }
    });

    //获取聊天记录
    $(".more").delegate(".content", "click", function (event) {
      event.preventDefault();
      $.ajax({
        url: leadAddress + "getChatRecord",
        dataType: "json", //返回格式为json
        type: "get",
        data: { id: receiver },
        beforeSend: function () {
          $(".more .loading").last().html('<img src="image2/loading.gif" height="16" width="16" alt="loading"/>');//发送loading的图标
          $(".mm-repeat").find(".more .content").addClass("none");
        },
        error: function () {
          $(".warning .dec_txt").text("获取聊天记录失败");
          errorRender();
          $(".more .loading").last().empty();
          $(".more .loading").last().html('<img src="image2/fail1.png" height="17" width="16" alt="fail"/ >');//发送fail的图标
        },
        success: function (data) {
          console.log(arguments);
          if (data.result == "failed") {
            $(".more .loading").last().empty();
            $(".more .content").removeClass("none");
            $(".lose .dec_txt").text(data.reason);
            failRender();
          }
          else {
            var idx;
            //找到聊天的对象
            $(".chat-repeat").each(function (index, element) {
              if ($(this).data("signal") == receiver) {
                idx = $(this).index();
                return false;
              }
              else { return; }
            });
            if (data == "") { $(".more .loading").empty(); $(".mm-repeat").find(".more .content").addClass("none"); }
            else {
              $(".message_empty").addClass("none");
              //消息数目判断
              var i = $(".mm-repeat").find($(".message")).length - 2;//聊天框消息数
              var j = data.length - 1;//聊天记录消息数-1;即消息记录最大序列数
              //每次获取十条消息记录
              for (var k = j - i; k > j - i - 10 && k >= 0; k--) {
                //表情处理
                var demonstrate = faceReplace(data[k].content);
                //时间判断
                var clock = CurrentTime();
                var time = data[k].date;
                var d = time.slice(0, 10);
                var dd = time.slice(8, 10);
                var m = time.slice(0, 7);
                var showTime = d + ' ' + time.slice(11, 16);
                if (d == clock.date) { showTime = time.slice(11, 16) };
                if (parseFloat(dd) == parseFloat(clock.ddate) - 1 && m == clock.m) { showTime = "昨天" + time.slice(11, 16) };
                //获取消息记录和时间
                if (data[k].sender == $(".chat-repeat").eq(idx).data("signal")) {
                  $(".mm-repeat").find($(".message")).eq(1).after(($(".you").eq(0)).clone(true));
                  $(".mm-repeat").find($(".message")).eq(2).show();
                  $(".mm-repeat").find($(".message")).eq(2).find(".message_plain").html(demonstrate);
                  //插入时间
                  $(".mm-repeat").find($(".message")).eq(2).find($(".message-time")).removeClass("none");
                  $(".mm-repeat").find($(".message")).eq(2).find($(".message-time .content")).text(showTime);
                }
                else {
                  $(".mm-repeat").find($(".message")).eq(1).after(($(".me").eq(0)).clone(true));
                  $(".mm-repeat").find($(".message")).eq(2).show();
                  $(".mm-repeat").find($(".message")).eq(2).find(".message_plain").html(demonstrate);
                  //插入时间
                  $(".mm-repeat").find($(".message")).eq(2).find($(".message-time")).removeClass("none");
                  $(".mm-repeat").find($(".message")).eq(2).find($(".message-time .content")).text(showTime);
                }
              }
              $(".more .loading").empty();
              $(".more .content").removeClass("none");
              //储存聊天消息
              var k = findNum(receiver);
              Num[k].getMessage();
            }
          }
        }
      })
    });
  }

  //退出登录
  $(".last_child").click(function () {
    $.ajax({
      url: leadAddress + "logout",
      dataType: "json", //返回格式为json
      type: "GET",
      error: function () { $(".warning .dec_txt").text("服务器错误"); failRender(); },
      success: function (data) {
        console.log(arguments);
        var result = data.result;
        if (result == "success") {
          window.location.reload();
          //切换到登录页面
          $(".sign").addClass("block");
          $(".main").addClass("none");
        }
        if (result == "failed") {
          $(".lose .dec_txt").text(data.reason);
          failRender();
        }
      },
    })
  });

  //自定义弹出提示框
  //点击ok按钮
  $(".okoButton").click(function () {
    $(".tips").addClass("none");
    $(".okoButton").removeClass("redOkoButton");
  })
  //成功效果显示
  successRender = function () {
    $(".box_overlay,.okoButton").removeClass("none");
    $("#animationTipBox").removeClass("none");
    $(".success").removeClass("none");
    $("#animationTipBox").mousedown();
  }
  //失败效果显示
  failRender = function () {
    $(".box_overlay,.okoButton").removeClass("none");
    $("#animationTipBox").removeClass("none");
    $(".lose").removeClass("none");
    $(".okoButton").addClass("redOkoButton");
  }
  //提示效果显示
  errorRender = function () {
    $(".box_overlay,.okoButton").removeClass("none");
    $("#animationTipBox").removeClass("none");
    $(".warning").removeClass("none");
  }
  //loading效果显示
  loadRender = function () {
    $(".box_overlay").removeClass("none");
    $("#animationTipBox").removeClass("none");
    $(".load").removeClass("none");
  }
  //登录loading结束
  finishLoadingRender1 = function () {
    $(".box_overlay,#animationTipBox,.load").addClass("none");
    $(".sign").addClass("none");
    $(".main").addClass("block");
  }
  //loading失败显示
  finishLoadingRender2 = function () {
    $(".box_overlay,#animationTipBox,.load").addClass("none");
    failRender();
  }
  //loading成功显示
  finishLoadingRender3 = function () {
    $(".box_overlay,#animationTipBox,.load").addClass("none");
    successRender();
  }
  //loading错误显示
  finishLoadingRender4 = function () {
    $(".box_overlay,#animationTipBox,.load").addClass("none");
    errorRender();
  }
  $("body").keyup(function (event) {
    if (event.which == 13) {
      if ($(".box_overlay").hasClass("none") && !($(".sign").hasClass("none"))) {
        if (!($(".login_box").hasClass("none"))) {
          $("#login_form").submit();
        }
        if (!($(".register_box").hasClass("none"))) {
          $("#register_form").submit();
        }
      }
      else { $(".okoButton").click(); }
    }
  });
  $(".login_box input").keyup(function (event) {
    event.stopPropagation();
  });

  //标题新消息提示
  var titleInit = document.title, isShine = true;
  setInterval(function () {
    var title = document.title;
    if (isShine == true && shineFlag == true) {
      if (/新/.test(title) == false) {
        document.title = '【新消息】' + titleInit;
      } else {
        document.title = '【　　　】' + titleInit;
      }
    }
    else {
      document.title = titleInit;
    }
  }, 500);

  window.onfocus = function () {
    isShine = false;
  };
  window.onblur = function () {
    isShine = true;
  };
  // 兼容 IE
  document.onfocusin = function () {
    isShine = false;
  };
  document.onfocusout = function () {
    isShine = true;
  };
  support = 1; //让浏览器只显示一次不支持Notification；
  //桌面通知弹框
  var showNotice = function (msg_title, msg_body) {
    if (support == 1) {
      if (window.Notification) {
        var popNotice = function () {
          if (Notification.permission == "granted") {
            var notification = new Notification(msg_title, {
              body: msg_body,
              icon: "image2/contactsHead.jpg",
            });
            setTimeout(function () {
              notification.close();//关闭桌面通知  
            }, 5000);
            notification.onclick = function () {
              notification.close();//关闭桌面通知  
            };
          }
        };
        if (Notification.permission == "granted") {
          popNotice();
        }
      } else {
        $(".warning .dec_txt").text("浏览器不支持Notification");
        errorRender();
        support = 0;
      }
    }
    else { return false; }
  };
});
