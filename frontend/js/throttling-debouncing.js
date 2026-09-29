
function debounce(callback, delay=3000){
    let timerId=""
    
    return function(...args){
        clearTimeout(timerId);
        timerId = setTimeout(()=>callback(...args, timerId), delay)       
    }
}

function throttle(callback, delay=3000){
    let lastCall = 0;

    return function(...args){
        const now = new Date().getTime();

       if(now - lastCall < delay) return;
        lastCall = now;
       callback(...args);
    }
}

throt = throttle(function(name){
    console.log(`Searching: ${name}`);
}, 3000)

set = debounce(function(name){
    console.log(`HI Your name: ${name}`);
}, 3000);


throt("Su");
throt("Sup");
throt("Super");
setTimeout(()=>throt("Superman"),5000);

set("B");
set("Ba");
set("Bat");
set("Batman");
