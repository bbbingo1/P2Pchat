//引用滚动条插件
$(document).ready(function(){
        $("body, .scrolls").niceScroll({
        cursorcolor: "gray",//滚动条的颜色
        cursoropacitymin: 0.3, // 当滚动条是隐藏状态时改变透明度, 值范围 1 到 0
        cursoropacitymax: 1, //当滚动条是显示状态时改变透明度，从0-1
        touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
        cursorwidth: "5px", //滚动条的宽度
        cursorborder: "0", // 游标边框css定义
        cursorborderradius: "5px",//以像素为光标边界半径  圆角
　　　　　　//autohidemode最好设置为true，这样切换的时候会自动隐藏滚动条
        autohidemode: true, //是否隐藏滚动条  true的时候默认不显示滚动条，当鼠标经过的时候显示滚动条
        zindex:"auto",//给滚动条设置z-index值
        railpadding: { top:0, right:0, left:0, bottom:0 },//滚动条的位置
        background: "#ccc",//轨道的颜色
    });
});