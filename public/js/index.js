//聊天室主要功能

//1.連接socketio服務
let socket=io('http://localhost:3000');

let save_username,save_avatar;

//切換頭像
$('.avatars div').on('click',function(){
    $(this).addClass('active').siblings().removeClass('active');
})

//點擊登錄按鈕
$('.goChat').on('click',function(){
//獲取用戶名
    // let username=$("input:text[class='login_name']").val;
    let username=$("input:text").val();

    console.log(username);
    if(!username){
        alert('請輸入用戶名稱');
        return;
    }
//獲取選擇的頭像
    // let avatar=$('#login_avatar div.active').attr('src');
    let avatar=$('.avatars div.active').attr('style');
    let avatar_arr=avatar.split("");
    let location_num=avatar.indexOf('jpg');

    avatar="./imgs/"+avatar_arr[location_num-2]+".jpg";
    console.log(avatar_arr[location_num-2]);
    console.log(avatar);
    //告訴socket io服務登入
    socket.emit('login',{
        username:username,
        avatar:avatar
    })
})

//監聽登入失敗的請求
socket.on('loginError',data=>{
    alert('登入失敗了，用戶已經存在');
})

//監聽登入成功的請求
socket.on('loginSuccess',data=>{
    // alert('登入成功了');

    //隱藏登入窗口
    $('.login').fadeOut();
    // 顯示聊天窗口
    $('.out').fadeIn();

    $('.avatar_url').attr('src',data.avatar);
    $('.top .loginSucc_name').text(data.username);

    save_username=data.username;
    save_avatar=data.avatar;
})

//監聽用戶加入的訊息
socket.on('addUser',data=>{
    $('.chat').append(`
    <div>
    <p class="message_system">
        <span class="system_content">${data.username}加入了群聊</span>
    </p>
    </div>      
    `);
    scroll_bottom();
})

//監聽用戶離開的訊息
socket.on('delUser',data=>{
    $('.chat').append(`
    <div>
    <p class="message_system">
        <span class="system_content">${data.username}離開了群聊</span>
    </p>
    </div>      
    `);
    scroll_bottom();
})

//監聽用戶列表的訊息
socket.on('userList',data=>{
    $('.list').html('');//如有更新先清空
    //把userList中的數據，動態渲染到左側菜單中
    data.forEach(item=>{
        $('.list').append(`
                <li class="all_users">
                    <div class="user_avatar"><img class="avatar" src="${item.avatar}" alt=""/></div>
                    <div class="user_name">${item.username}</div>
                </li>   
        `);
    })
    $('#user_amount').text(data.length);
})

//聊天輸入功能
$('.send').on('click',()=>{
    //獲取到聊天的內容
    // let msg_content =$('.message_content').val().trim();
    // $('.message_content').val('');
    let msg_content=$('.message_content').html();
    $('.message_content').html('');
    if(!msg_content){
        return alert('請輸入內容');
    }

    //發送訊息給伺服器
    socket.emit('sendMessage',{
        msg:msg_content,
        username:save_username,
        avatar:save_avatar
    })
})

//監聽全部聊天的訊息
socket.on('receiveMessage',data=>{
    //把聊天消息顯示到窗口中    
    //if(data.username===save_username){
        $('.chat').append(`
                <div>
                    <img class="avatar" src="${data.avatar}" alt=""/>
                    <div class="content_text">
                        <div class="bubble_content">${data.msg}</div>
                    </div>
                </div>
        `)
    //}

    scroll_bottom();
})

//畫面捲動至最下方
function scroll_bottom(){
    $('.chat').children(':last').get(0).scrollIntoView(false);
}

//發送圖片功能
$('#file').on('change',function(){
    let file=this.files[0];

    // 需要把這個圖片發送到伺服器，借助於HTML5新增的FileReader
    let fr=new FileReader();
    fr.readAsDataURL(file);
    fr.onload=function(){
        socket.emit('sendImage',{
            username:save_username,
            avatar:save_avatar,
            img:fr.result
        })
        
    }
})

//監聽圖片聊天訊息
socket.on('receiveImage',data=>{
    //把聊天消息顯示到窗口中    
    //if(data.username===save_username){
        $('.chat').append(`
                <div>
                    <img class="avatar" src="${data.avatar}" alt=""/>
                    <div class="content_text">
                        <div class="bubble_content">
                            <img class="up_img" src="${data.img}">
                        </div>
                    </div>
                </div>
        `)
    //}
    //等待圖片加載完成，再捲動到最下面
    $('.chat img:last').on('load',function(){
        scroll_bottom();
    })
    
})

$('.emoji_place').on('click',function(){
    $('.message_content').emoji({
        button: '.emoji_place',
        showTab: false,
        animation: 'slide',
        position: 'topLeft',
        icons: [{
            name: "QQ表情",
            path: "lib/jquery-emoji/qq/",
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: ".gif"
        }]
    })
})

//摺疊聊天室登入
let fold_show=document.getElementsByClassName('fold_icon');
fold_show[0].addEventListener("click",function(){
    if($('.login_fold')[0].style.display=="block"){
        $('.login_fold').hide();
        $('.login')[0].style.maxWidth="10px";
        $('.login')[0].style.minWidth="10px";
    }else{
        $('.login_fold').fadeIn();
        $('.login')[0].style.maxWidth="300px";
        $('.login')[0].style.minWidth="200px";
    }
})


