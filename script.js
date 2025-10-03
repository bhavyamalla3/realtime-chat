import { createServer } from 'http';
import staticHandler from 'serve-handler';
import { WebSocketServer } from 'ws';

const server = createServer((req,res)=>staticHandler(req,res,{public:'public'}));
const wss = new WebSocketServer({server});

// Predefined users with colors
const usersList = [
  {id:'u1', name:'Bhavya', avatar:'https://i.pravatar.cc/150?img=1', color:'#128C7E'},
  {id:'u2', name:'Aarav', avatar:'https://i.pravatar.cc/150?img=2', color:'#075E54'},
  {id:'u3', name:'Isha', avatar:'https://i.pravatar.cc/150?img=3', color:'#25D366'},
  {id:'u4', name:'Rohan', avatar:'https://i.pravatar.cc/150?img=4', color:'#34B7F1'},
  {id:'u5', name:'Priya', avatar:'https://i.pravatar.cc/150?img=5', color:'#FF5722'},
  {id:'u6', name:'Karan', avatar:'https://i.pravatar.cc/150?img=6', color:'#FF9800'},
  {id:'u7', name:'Ananya', avatar:'https://i.pravatar.cc/150?img=7', color:'#9C27B0'},
  {id:'u8', name:'Dev', avatar:'https://i.pravatar.cc/150?img=8', color:'#E91E63'},
  {id:'u9', name:'Sana', avatar:'https://i.pravatar.cc/150?img=9', color:'#3F51B5'},
  {id:'u10', name:'Kabir', avatar:'https://i.pravatar.cc/150?img=10', color:'#009688'},
  {id:'u11', name:'Neha', avatar:'https://i.pravatar.cc/150?img=11', color:'#795548'},
  {id:'u12', name:'Arjun', avatar:'https://i.pravatar.cc/150?img=12', color:'#607D8B'},
  {id:'u13', name:'Meera', avatar:'https://i.pravatar.cc/150?img=13', color:'#FF4081'},
  {id:'u14', name:'Vivaan', avatar:'https://i.pravatar.cc/150?img=14', color:'#4CAF50'},
  {id:'u15', name:'Anika', avatar:'https://i.pravatar.cc/150?img=15', color:'#FFC107'}
];

const clients = new Map();
const messages = {}; // messages[from][to] = []

wss.on('connection', client=>{
  clients.set(client,{id:null}); 

  client.send(JSON.stringify({type:'users', users:usersList}));

  client.on('message', msg=>{
    try{
      const data = JSON.parse(msg);
      handleMessage(client,data);
    }catch{}
  });

  client.on('close', ()=>clients.delete(client));
});

function handleMessage(client,data){
  if(data.type==='chat'){
    const sender = usersList.find(u=>u.id===data.from);
    const receiver = usersList.find(u=>u.id===data.to);
    if(!sender || !receiver) return;

    const msgObj = {
      type:'chat',
      from:data.from,
      to:data.to,
      content:data.content,
      time:new Date().toLocaleTimeString(),
      color:sender.color,
      delivered:false
    };

    // Store messages
    messages[data.from] = messages[data.from]||{};
    messages[data.from][data.to] = messages[data.from][data.to]||[];
    messages[data.from][data.to].push(msgObj);

    messages[data.to] = messages[data.to]||{};
    messages[data.to][data.from] = messages[data.to][data.from]||[];
    messages[data.to][data.from].push(msgObj);

    // Broadcast to all clients
    for(const c of wss.clients){
      const cData = clients.get(c);
      if(!cData) continue;
      const toSend = {...msgObj, delivered:cData===client};
      c.send(JSON.stringify(toSend));
    }
  }
  else if(data.type==='typing'){
    for(const c of wss.clients){
      c.send(JSON.stringify({type:'typing', from:data.from, to:data.to, isTyping:data.isTyping}));
    }
  }
}
server.listen(8080, ()=>console.log('Server running on port 8080'));
