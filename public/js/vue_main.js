//通讯录
var addressList = {
    el: '#list_view',
    vue: new Vue({
        el: '#list_view',
        data: {
            fris: [],//用户列表，包含两个参数：name，ip
            s: Infinity,//标记高亮
        },
        methods: {
            //点击通讯录联系人
            clickList: function (item, index) {
                this.s = index;
                $(".empty").addClass("none");
                $(".contacts_message").removeClass("none");
                $(".chatin").addClass("none");
                $(".profile").find(".name").text(item.name);
                $(".profile").find(".nickname").text(item.name);
                $(".profile").find(".ip").text(item.ip);
                $(".profile").find("img").attr("src", $(".ng-repeat").eq(index).find("img").attr("src"));
            },
            //双击通讯录联系人
            dblClickList: function () {
                var name = $(".contacts_message .nickname").text();
                var ip = $(".contacts_message .ip").text();
                api.toChat(name, ip);
            }
        },
    })
}

//聊天人列表（已建立联系）
var chatList = {
    el: '#chat_view',
    vue: new Vue({
        el: '#chat_view',
        data: {
            dans: [],//聊天对象列表，包含参数：用户名name，ip,最近消息msg,未读消息数lefts,聊天数据messes: [{obj:1,value:'',time:''}],
            c: Infinity,//标记高亮
        },
        methods: {
            //点击聊天对象
            clickChat: function (item, index) {
                this.c = index;
                this.dans[index].lefts = 0;
                $(".box .web_wechat_turn").removeClass("none");
                $(".title_name").text(item.name);
                $("#editArea").focus();
                //利用属性lefts记录未读消息数,清空
                chatList.vue.dans[0].lefts = 0;
                //把消息数组同步到显示的消息列表
                messList.vue.messes = item.messes
                // $(".noones").addClass("none");
                // $(".contacts_message").addClass("none");
                // $(".title_wrap .title").addClass("none");
                $(".title_poi").removeClass("none");
                $(".chatin").removeClass("none");
                $(".mm-repeat").removeClass("none");
                $(".chatin").undelegate();//解除绑定
                api.callback3(item.name, item.ip);//调用callback3发送信息};
                $(".box_bd").animate({ scrollTop: $(".box_bd")[0].scrollHeight }, 1000);//让滚动条滚动到底部
            }
        },

    })
}

//聊天数据
var messList = {
    el: '#message_view',
    vue: new Vue({
        el: '#message_view',
        data: {
            messes: []//聊天数据：messes: [{obj:1,value:'',time:''}]
        },
        watch: {
            'messes': {
                handler: function (newValue, oldValue) {
                    if (newValue != []) {
                        $(".message_empty").addClass("none");
                        $(".message_empty .nonotes").addClass("none");
                        $('.mm-repeat').removeClass('none');
                    }
                },
                deep: true,
            }
        },
    })
}











// var friList = {
//     el: '#chat_fri_dan',
//     vue: new Vue({
//         el: '#chat_fri_dan',
//         data: {
//             fris: [],
//         },
//         watch: {
//             'fris': {
//                 handler: function(newValue, oldValue){
//                     for(var i = 0; i < newValue.length; i++)
//                         if(newValue[i].dot > 0)
//                             newValue[i].dot_class = '';
//                         else 
//                             newValue[i].dot_class = 'none';
//                 },
//                 deep: true,
//             }
//         }
//     }),
// }

// var qunList = {
//     el: '#chat_fri_qun',
//     vue: new Vue({
//         el: '#chat_fri_qun',
//         data: {
//             quns: [],
//         },
//         watch: {
//             'quns': {
//                 handler: function(newValue, oldValue){
//                     for(var i = 0; i < newValue.length; i++)
//                         if(newValue[i].dot > 0)
//                             newValue[i].dot_class = '';
//                         else 
//                             newValue[i].dot_class = 'none';
//                 },
//                 deep: true,
//             }
//         }
//     }),    
// }

// var messList = {
//     el: '#chat_mess',
//     _this: this,
//     vue: new Vue({
//         el: '#chat_mess',
//         data: {
//             messs: [],
//             ifqun: 'none',
//             qunfirs: [],
//         },
//         watch: {
//             messs: function(){
//                 if(!this.messs[this.messs.length-1].type){
//                     check(this.messs.length-1);
//                     console.log(this.messs.length-1);
//                     this.messs[this.messs.length-1].img_src = '../image/fri_img.jpg';
//                     this.messs[this.messs.length-1].img_class = 'chat_mess_main_img';
//                     this.messs[this.messs.length-1].div_class = 'chat_mess_main_fri';
//                 }
//                 else{
//                     this.messs[this.messs.length-1].img_src = '../image/my_img.jpg';
//                     this.messs[this.messs.length-1].img_class = 'chat_mess_main_img_mine';       
//                     this.messs[this.messs.length-1].div_class = 'chat_mess_main_mine';            
//                 }
//             }
//         }
//     }),   

// } 

// //检测多条对方信息
// function check(i){
//     if(i > 0 && !messList.vue.messs[i-1].img_src){
//         messList.vue.messs[i-1].img_src = '../image/fri_img.jpg';
//         messList.vue.messs[i-1].img_class = 'chat_mess_main_img';
//         messList.vue.messs[i-1].div_class = 'chat_mess_main_fri';
//         check(i-1);
//     } 
// }