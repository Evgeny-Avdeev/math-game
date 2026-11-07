// One introduction per activity, shared by all collection worlds in this browser.
export function tutorialVisit(activity,show){
 const key=`schitay-tutorial-${activity}-seen-v1`;let shown=false;
 function open(){show();shown=true;try{localStorage.setItem(key,'1');}catch{}}
 function openIfFirst(){if(shown)return;try{if(localStorage.getItem(key)==='1'){shown=true;return;}}catch{}open();}
 return {open,openIfFirst};
}
