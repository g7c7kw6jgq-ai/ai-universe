let userId = "";
let activeChar = "";

async function login() {
  const res = await fetch("/auth", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      username:username.value,
      password:password.value
    })
  });

  const data = await res.json();
  userId = data.userId;

  auth.classList.add("hidden");
  app.classList.remove("hidden");

  loadCharacters();
}

async function createCharacter() {
  await fetch("/create-character", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      userId,
      name:charName.value,
      personality:personality.value
    })
  });

  loadCharacters();
}

async function loadCharacters() {
  const res = await fetch("/get-characters", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({userId})
  });

  const chars = await res.json();
  charList.innerHTML = "";

  chars.forEach(c=>{
    charList.innerHTML += `<button onclick="selectChar('${c._id}','${c.name}')">${c.name}</button>`;
  });
}

function selectChar(id,name){
  activeChar=id;
  activeName.innerText=name;
  chatSection.classList.remove("hidden");
}

function startVoice(){
  const r=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
  r.start();
  r.onresult=e=>{
    msg.value=e.results[0][0].transcript;
    sendMessage();
  };
}

function speak(t){
  const s=new SpeechSynthesisUtterance(t);
  speechSynthesis.speak(s);
}

async function sendMessage(){
  chatBox.innerHTML+=`<p>You: ${msg.value}</p>`;

  const res=await fetch("/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      charId:activeChar,
      message:msg.value
    })
  });

  const data=await res.json();

  chatBox.innerHTML+=`<p>AI: ${data.reply}</p>`;
  speak(data.reply);

  msg.value="";
}