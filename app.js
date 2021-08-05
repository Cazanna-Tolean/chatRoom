const app=require('express')();
const http=require('http');
// let server=require('http').Server(app);
const httpServer= require('http').createServer(app);
const io=require('socket.io')(httpServer);

//記錄已經登錄的使用者
const users=[];

httpServer.listen(3000,function(){
    console.log('伺服器啟動成功');
});

//cors跨域
app.use(cors())

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
})

app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80')
})

//express處理靜態資源
//把public資料夾設置為靜態資源目錄
app.use(require('express').static('public'));

// "/"表示路由
app.get('/',function(req,res){
    // res.sendFile(__dirname,+'index.html');
    res.redirect('/index.html');
});

io.on('connection',socket=>{
    /* socket.emit('news',{hello:'world'});
    socket.on('my other event',function(data){
        console.log(data);
    }); */
    console.log('新用戶連線了');
    socket.on('login',data=>{
        //判斷如果data 在user中存在，說明該用戶已經登入，不允許登入
        // let user =users.find(item=>item.username===data.username);
        let user;
        users.forEach(item=>{
            if(item.username===data.username){
                user=true;
            }            
        })
        if(user){
            //表示用戶存在，登入失敗，伺服器需要給當前用戶響應，告訴登入失敗
            socket.emit('loginError',{msg:'登入失敗'})
        }else{
            //表示用戶不存在，登入成功
            users.push(data);
            socket.emit('loginSuccess',data);
            // console.log('登入成功');

            //告訴所有的使用者，有用戶加入了聊天室，廣播消息
            // socket.io: 告訴當前用戶
            // io.emit :廣播事件
            io.emit('addUser',data);

            // 告訴所有用戶，目前聊天室有多少人
            io.emit('userList',users);

            // 把登入成功的用戶名和頭像儲存起來
            socket.username=data.username;
            socket.avatar=data.avatar;
        }
    })

    socket.on('disconnect',()=>{
        //把離開用戶的訊息從users中刪除
        let id_exist=users.findIndex(item=>item.username===socket.username);
        //刪除掉斷開連接的人
        users.splice(id_exist,1);
        // 1.告訴所有人，有人離開了聊天室
        io.emit('delUser',{
            username:socket.username,
            avatar:socket.avatar
        })
        // 2.告訴所有人，userList發生更新
        io.emit('userList',users);
    })

    //監聽聊天的訊息
    socket.on('sendMessage',data=>{
        console.log(data);
        // 廣播給所有用戶
        data.msg=escapeHtml(data.msg);
        io.emit('receiveMessage',data)
    })

    //接收圖片訊息
    socket.on('sendImage',data=>{
        
        io.emit('receiveImage',data)
    })
});


function escapeHtml(text) {
    if(text.indexOf('emoji')==-1){
        return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
    }else{
        return text;
    } 
}