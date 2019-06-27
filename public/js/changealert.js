$(function () {
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
})
