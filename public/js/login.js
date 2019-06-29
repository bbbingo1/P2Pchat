$(document).ready(function () {

  loginItem = {

    //立即执行函数
    initItem: function () {
      //初始化登录窗口
      document.getElementById("account").focus();
      if (window.localStorage) {
        $("#account").val(localStorage.getItem("lastLoginName"))//显示上次记住ip时的登录账号
        var pas = localStorage.getItem($.trim($("#account").val()));//获取账号对应的ip值

        getUserIP(function (ip) {
          $('#password').val(ip);//自动填入IP地址
        });
        // if (returnCitySN["cip"])		//自动填入IP地址
        //   $('#password').val(returnCitySN["cip"]);
        // else {
        //   $("#password").val(pas);  //赋值给password
        //   //获取ip
        //   $("#account").keyup(function () {
        //     if (window.localStorage) {
        //       var pas = localStorage.getItem($.trim($("#account").val()));//获取账号对应的ip值
        //       $("#password").val(pas);  //赋值给password
        //       if (pas == "" || pas == undefined || pas == null) {
        //         $("#passwordkeeping").prop("checked", false)
        //       } else {
        //         $("#passwordkeeping").prop("checked", true)
        //       }
        //     }
        //     else {
        //       var pas = getCookie($.trim($("#account").val()));//获取cookie
        //       $("#password").val(pas);  //赋值给password
        //     }
        //   });
        // }
        if (pas == "" || pas == undefined || pas == null) {
          $("#passwordkeeping").prop("checked", false)
        } else {
          $("#passwordkeeping").prop("checked", true)
        }
      }
      //切换登录/注册
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

      //登录注册表单验证
      $("#account,#account_b,#password,#password_b").blur(function () {
        //验证选项是否为空
        if ($(this).val() == "") {
          $(this).next().next().show();
        } else {
          $(this).next().next().hide();
        }
      });
      $("#repassword_b").blur(function () {
        //验证ip是否相同
        if ($("#password_b").val() != $(this).val()) {
          $(this).next().next().show();
        } else {
          $(this).next().next().hide();
        }
      });


    }(),

    // 设置cookie  
    setCookie: function (c_name, value, expiremMinutes) {
      var exdate = new Date();
      exdate.setTime(exdate.getTime() + expiremMinutes * 60 * 1000);  //设置日期毫秒数
      document.cookie += c_name + "=" + escape(value) + ((expiremMinutes == null) ? "" : ";expires=" + exdate.toGMTString());
    },

    // 读取cookie  
    getCookie: function (c_name) {
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
    },

    // 删除cookie  
    delCookie: function (c_name) {
      var exp = new Date();
      exp.setTime(exp.getTime() - 1);
      var cval = this.getCookie(c_name);
      if (cval != null) {
        document.cookie = c_name + "=" + cval + ";expires=" + exp.toGMTString();
      }
    },
  }

})