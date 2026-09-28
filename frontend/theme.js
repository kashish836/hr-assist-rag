(function(){
  var k='hrAssistTheme',t='dark',r=document.documentElement;
  try{t=localStorage.getItem(k)||'dark'}catch(e){}
  r.dataset.theme=t;
  window.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('themeBtn');
    if(!b)return;
    b.onclick=function(){
      t=t==='dark'?'light':'dark';
      r.dataset.theme=t;
      try{localStorage.setItem(k,t)}catch(e){}
    };
  });
})();
