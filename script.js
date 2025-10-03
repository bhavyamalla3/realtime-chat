// DOM elements
const userList = document.getElementById('user-list');
const searchInput = document.getElementById('search');
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

// Users list
const usersList = [
  {id:'u1', name:'Buffyard', avatar:'https://i.pravatar.cc/150?img=1'},
  {id:'u2', name:'Diyan', avatar:'https://i.pravatar.cc/150?img=2'},
  {id:'u3', name:'Wastefellow', avatar:'https://i.pravatar.cc/150?img=3'},
  {id:'u4', name:'Aarav', avatar:'https://i.pravatar.cc/150?img=4'},
  {id:'u5', name:'Bhavya', avatar:'https://i.pravatar.cc/150?img=5'},
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

// Preloaded messages
const fakeMessages = {};
usersList.forEach(u=>{
  fakeMessages[u.id] = [
    {from:u.id, content:`Hello! I am ${u.name}`},
    {from:'me', content:`Hi ${u.name}, nice to meet you!`}
  ];
});

// Render sidebar
function renderUsers(users){
  userList.innerHTML='';
  users.forEach(u=>{
    const li=document.createElement('li');
    li.innerHTML=`<img src="${u.avatar}" class="avatar"><span class="username">${u.name}</span>`;
    li.addEventListener('click', ()=> openChat(u, li));
    userList.appendChild(li);
  });
}

// Open chat
function openChat(user, li){
  selectedUser=user;
  chatUsername.textContent=user.name;
  chatAvatar.src=user.avatar;
  messagesDiv.innerHTML='';

  Array.from(userList.children).forEach(li=>li.classList.remove('selected'));
  li.classList.add('selected');

  // Load fake messages
  fakeMessages[user.id].forEach(m=>{
    appendMessage(m.from==='me'?'me':'other', m.from==='me'?myName:user.name, m.content);
  });
}

// Search users
searchInput.addEventListener('input', ()=>{
  const term = searchInput.value.toLowerCase();
  const filtered = usersList.filter(u=>u.name.toLowerCase().includes(term));
  renderUsers(filtered);
});

// Send text
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });

function sendMessage(){
  if(!selectedUser) return;
  const text = input.value.trim();
  if(!text) return;
  appendMessage('me', myName, text);
  fakeMessages[selectedUser.id].push({from:'me', content:text});
  input.value='';
}

// Append message
function appendMessage(senderType, senderName, content, type='text'){
  const div=document.createElement('div');
  div.className=`message ${senderType}`;

  const avatarImg=document.createElement('img');
  avatarImg.className='avatar-msg';
  avatarImg.src=senderType==='me'?'https://i.pravatar.cc/150?img=0':(selectedUser?selectedUser.avatar:'https://i.pravatar.cc/150?img=1');

  const contentDiv=document.createElement('div');
  contentDiv.className='message-content';
  if(type==='text') contentDiv.innerHTML=`<b>${senderName}:</b> ${content}<span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
  else if(type==='image') contentDiv.innerHTML=`<b>${senderName}:</b><br><img src="${content}" class="msg-image"><span class="timestamp">${new Date().toLocaleTimeString()}</span>`;
  else if(type==='voice') contentDiv.innerHTML=`<b>${senderName}:</b><br><audio controls src="${content}"></audio><span class="timestamp">${new Date().toLocaleTimeString()}</span>`;

  div.appendChild(avatarImg);
  div.appendChild(contentDiv);
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Three-dot menu
menuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    menuOptions.style.display = menuOptions.style.display==='block'?'none':'block';
});
document.addEventListener('click', ()=> menuOptions.style.display='none');

// Menu button actions
clearBtn.addEventListener('click', ()=>{
    if(selectedUser){
        messagesDiv.innerHTML = '';
        fakeMessages[selectedUser.id] = [];
    }
    menuOptions.style.display='none';
});
blockBtn.addEventListener('click', ()=>{
    if(selectedUser) alert(`Blocked ${selectedUser.name}`);
    menuOptions.style.display='none';
});
reportBtn.addEventListener('click', ()=>{
    if(selectedUser) alert(`Reported ${selectedUser.name}`);
    menuOptions.style.display='none';
});
callBtn.addEventListener('click', ()=>{
    if(selectedUser) alert(`Calling ${selectedUser.name}...`);
    menuOptions.style.display='none';
});

// Emoji
emojiBtn.addEventListener('click', ()=>{
  const e = prompt("Enter emoji");
  if(e) input.value+=e;
});

// Image
imageBtn.addEventListener('click', ()=> imageInput.click());
imageInput.addEventListener('change', ()=>{
  if(!selectedUser) return;
  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = ()=> {
    appendMessage('me', myName, reader.result,'image');
    fakeMessages[selectedUser.id].push({from:'me', content:reader.result});
  };
  reader.readAsDataURL(file);
});

// Voice
voiceBtn.addEventListener('click', async ()=>{
  if(!selectedUser) return;
  if(!navigator.mediaDevices) return alert("Microphone not supported");
  const stream = await navigator.mediaDevices.getUserMedia({audio:true});
  const mediaRecorder = new MediaRecorder(stream);
  let chunks=[];
  mediaRecorder.ondataavailable = e=>chunks.push(e.data);
  mediaRecorder.onstop = ()=>{
    const blob = new Blob(chunks,{type:'audio/webm'});
    const url = URL.createObjectURL(blob);
    appendMessage('me', myName, url,'voice');
    fakeMessages[selectedUser.id].push({from:'me', content:url});
    chunks=[];
  };
  mediaRecorder.start();
  setTimeout(()=>mediaRecorder.stop(),3000);
});

// Initialize
renderUsers(usersList);

// Welcome message initially
chatUsername.textContent = "Welcome ❤️";
messagesDiv.innerHTML = `<div class="message welcome">
  <div class="message-content">
    Welcome to the chat! ❤️
  </div>
</div>`;
