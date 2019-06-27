window.onload = function () {

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


  
}