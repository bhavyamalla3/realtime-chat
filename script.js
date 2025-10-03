// WebSocket connection
const ws = new WebSocket(`ws://${location.host}`);

// DOM Elements
const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const chatUsername = document.getElementById('chat-username');
const chatAvatar = document.getElementById('chat-avatar');
const menuBtn = document.getElementById('menu-btn');
const menuOptions = document.getElementById('menu-options');
const clearBtn = document.getElementById('clear-chat');
const blockBtn = document.getElementById('block-user');
const reportBtn = document.getElementById('report-user');
const callBtn = document.getElementById('call-user');
const emojiBtn = document.getElementById('emoji-btn');
const imageBtn = document.getElementById('image-btn');
const imageInput = document.getElementById('image-input');
const voiceBtn = document.getElementById('voice-btn');

let selectedUser = null;
let myId = 'me';
let myName = 'Me';

// 15 users
const usersList = [
  {id:'u1', name:'Buffyard', avatar:'https://i.pravatar.cc/150?img=1'},
  {id:'u2', name:'Yarn', avatar:'https://i.pravatar.cc/150?img=2'},
  {id:'u3', name:'Bhavya', avatar:'https://i.pravatar.cc/150?img=3'},
  {id:'u4', name:'Aarav', avatar:'https://i.pravatar.cc/150?img=4'},
  {id:'u5', name:'Isha', avatar:'https://i.pravatar.cc/150?img=5'},
  {id:'u6', name:'Rohan', avatar:'https://i.pravatar.cc/150?img=6'},
  {id:'u7', name:'Priya', avatar:'https://i.pravatar.cc/150?img=7'},
  {id:'u8', name:'Karan', avatar:'https://i.pravatar.cc/150?img=8'},
  {id:'u9', name:'Ananya', avatar:'https://i.pravatar.cc/150?img=9'},
  {id:'u10', name:'Dev', avatar:'https://i.pravatar.cc/150?img=10'},
  {id:'u11', name:'Sana', avatar:'https://i.pravatar.cc/150?img=11'},
  {id:'u12', name:'Kabir', avatar:'https://i.pravatar.cc/150?img=12'},
  {id:'u13', name:'Neha', avatar:'https://i.pravatar.cc/150?img=13'},
  {id:'u14', name:'Arjun', avatar:'https://i.pravatar.cc/150?img=14'},
  {id:'u15', name:'Meera', avatar:'https://i.pravatar.cc/150?img=15'}
];

// Render all users
usersList.forEach(u=>{
  const li = document.createElement('li');
  li.innerHTML = `<img src="${u.avatar}" class="avatar"><span class="username">${u.name}</span>`;
  li.addEventListener('click', ()=> startChat(u));
  userList.appendChild(li);
});

// Start chat when user clicked
function startChat(user){
  selectedUser = user;
  chatUsername.textContent = user.name;
  chatAvatar.src = user.avatar;

  // Enable buttons
  input.disabled = false;
  sendBtn.disabled = false;
  emojiBtn.disabled = false;
  imageBtn.disabled = false;
  voiceBtn.disabled = false;

  messagesDiv.innerHTML='';

  // Highlight selected
  Array.from(userList.children).forEach(li => li.classList.remove('selected'));
  const index = usersList.findIndex(u => u.id===user.id);
  userList.children[index].classList.add('selected');
}

// Send text
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });

function sendMessage(){
  if(!selectedUser) return alert("Select a user to chat!");
  const text = input.value.trim();
  if(!text) return;
  appendMessage('me', text);
  ws.send(JSON.stringify({
    type:'chat',
    from:myId,
    to:selectedUser.id,
    content:text,
    msgType:'text',
    time:new Date().toLocaleTimeString()
  }));
  input.value='';
}

// Append messages
function appendMessage(type, content, msgType='text', time=new Date().toLocaleTimeString()){
  const div = document.createElement('div');
  div.className = `message ${type}`;
  if(msgType==='image') div.innerHTML=`<img src="${content}" style="max-width:150px;border-radius:10px;"><span class="timestamp">${time}</span>`;
  else if(msgType==='voice') div.innerHTML=`<audio controls src="${content}"></audio><span class="timestamp">${time}</span>`;
  else div.innerHTML=`${content}<span class="timestamp">${time}</span>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Menu
menuBtn.addEventListener('click', ()=>menuOptions.classList.toggle('show'));
clearBtn.addEventListener('click', ()=> messagesDiv.innerHTML='');
blockBtn.addEventListener('click', ()=> alert(`Blocked ${selectedUser.name}`));
reportBtn.addEventListener('click', ()=> alert(`Reported ${selectedUser.name}`));
callBtn.addEventListener('click', ()=> alert(`Calling ${selectedUser.name}...`));

// Emoji
emojiBtn.addEventListener('click', ()=> { const e = prompt("Enter emoji"); if(e) input.value+=e; });

// Image
imageBtn.addEventListener('click', ()=> imageInput.click());
imageInput.addEventListener('change', ()=>{
  if(!selectedUser) return alert("Select a user first!");
  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = ()=>{
    appendMessage('me', reader.result,'image');
    ws.send(JSON.stringify({
      type:'chat',
      from:myId,
      to:selectedUser.id,
      content:reader.result,
      msgType:'image',
      time:new Date().toLocaleTimeString()
    }));
  };
  reader.readAsDataURL(file);
});

// Voice
voiceBtn.addEventListener('click', async ()=>{
  if(!selectedUser) return alert("Select a user first!");
  if(!navigator.mediaDevices) return alert("Microphone not supported");

  const stream = await navigator.mediaDevices.getUserMedia({audio:true});
  const mediaRecorder = new MediaRecorder(stream);
  let chunks = [];

  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.onstop = ()=>{
    const blob = new Blob(chunks, {type:'audio/webm'});
    const url = URL.createObjectURL(blob);
    appendMessage('me', url, 'voice');
    ws.send(JSON.stringify({
      type:'chat',
      from:myId,
      to:selectedUser.id,
      content:url,
      msgType:'voice',
      time:new Date().toLocaleTimeString()
    }));
    chunks = [];
  };

  mediaRecorder.start();
  setTimeout(()=>mediaRecorder.stop(), 3000);
});
