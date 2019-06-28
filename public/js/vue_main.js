var addressList = {
    el: '#list_view',
    vue: new Vue({
        el: '#list_view',
        data: {
            fris: [],
            s: Infinity,
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
            }
        },
    })
}

var chatList = {
    el: '#chat_view',
    vue: new Vue({
        el: '#chat_view',
        data: {
            groups: [],
            dans: [],
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