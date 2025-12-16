const tab = document.getElementById("tabuleiro");
let vez="X";

for(let i=0;i<9;i++){
  const d=document.createElement("div");
  d.className="casa";
  d.onclick=()=> {
    if(!d.textContent){
      d.textContent=vez;
      vez=vez==="X"?"O":"X";
    }
  };
  tab.appendChild(d);
}

function voltarMenu(){
  window.location.href="../../index.html";
}
