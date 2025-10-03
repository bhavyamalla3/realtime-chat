import { createServer } from 'http';
import staticHandler from 'serve-handler';
import { WebSocketServer } from 'ws';

const server = createServer((req,res)=>staticHandler(req,res,{public:'public'}));
const wss = new WebSocketServer({server});

const usersList = [
  {id:'u1', name:'Bhavya', avatar:'https://i.pravatar.cc/150?img=1'},
  {id:'u2', name:'Aarav', avatar:'https://i.pravatar.cc/150?img=2'},
  {id:'u3', name:'Isha', avatar:'https://i.pravatar.cc/150?img=3'},
  {id:'u4', name:'Rohan', avatar:'https://i.pravatar.cc/150?img=4'},
  {id:'u5', name:'Priya', avatar:'https://i.pravatar.cc/150?img=5'},
  {id:'u6', name:'Karan', avatar:'https://i.pravatar.cc/150?img=6'},
  {id:'u7', name:'Ananya', avatar:'https://i.pravatar.cc/150?img=7'},
  {id:'u8', name:'Dev', avatar:'https://i.pravatar.cc/150?img=8'},
  {id:'u9', name:'Sana', avatar:'https://i.pravatar.cc/150?img=9'},
  {id:'u10', name:'Kabir', avatar:'https://i.pravatar.cc/150?img=10'},
  {id:'u11', name:'Neha', avatar:'https://i.pravatar.cc/150?img=11'},
  {id:'u12', name:'Arjun', avatar:'https://i.pravatar.cc/150?img=12'},
  {id:'u13', name:'Meera', avatar:'https://i.pravatar.cc/150?img=13'},
  {id:'u14', name:'Vivaan', avatar:'https://i.pravatar.cc/150?img=14'},
  {id:'u15', name:'Anika', avatar:'https://i.pravatar.cc/150?img=15'}
];

const clients = new Map();
const messages = {};

wss.on('connection', client=>{
  clients.set(client,{id:null});
  client.send(JSON.stringify({type:'users', users:usersList}));

  client.on('message', msg=>{
    try{
      const data=JSON.parse(msg);
      handleMessage(data);
    }catch(e){console.log(e);}
  });

  client.on('close', ()=>clients.delete(client));
});

function handleMessage(data){
  if(data.type==='chat'){
    const msgObj={from:data.from,to:data.to,content:data.content,time:new Date().toLocaleTimeString(),msgType:data.msgType||'text'};
    
    messages[data.from]=messages[data.from]||{};
    messages[data.from][data.to]=messages[data.from][data.to]||[];
    messages[data.from][data.to].push(msgObj);

    messages[data.to]=messages[data.to]||{};
    messages[data.to][data.from]=messages[data.to][data.from]||[];
    messages[data.to][data.from].push(msgObj);

    for(const c of wss.clients) c.send(JSON.stringify({type:'chat', ...msgObj}));
  }
  else if(data.type==='clear'){
    if(messages[data.from] && messages[data.from][data.to]) messages[data.from][data.to]=[];
    if(messages[data.to] && messages[data.to][data.from]) messages[data.to][data.from]=[];
    for(const c of wss.clients) c.send(JSON.stringify({type:'clear', from:data.from, to:data.to}));
  }
}

server.listen(8080,()=>console.log('Server running on port 8080'));
