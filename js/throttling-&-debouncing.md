Debouncing and throttling are techniques used to optimize the performance of functions triggered by events that occur frequently, such as scrolling, resizing, or typing. They help in managing how often these functions are executed, which can improve user experience and system performance. Here’s a detailed comparison of both techniques.

### Debouncing

Debouncing is a technique that delays the execution of a function until a specified time has passed after the last event. It’s mainly used for events that fire rapidly, like scroll, resize, or button clicks. This prevents unnecessary function calls and improves performance.

- The function executes only after the user stops triggering the event.
- Multiple rapid events are collapsed into a single call.
- Example: If a user clicks 5 times in 100ms, the function won’t run during that burst.
- With a 2000ms debounce delay, the function runs 2 seconds after the final click.
- Helps reduce lag, avoid unnecessary processing, and optimize UI performance.

**Advantages:** 

- Decreases the frequency with which a function is invoked, which can enhance performance and avoid pointless effort. 
- Prevents pointless network and API requests, which can conserve resources and cut expenses.
- This can be utilized to handle frequent occurrences, such as scrolling or resizing, without taxing the system.

**Disadvantages:**

- This may cause a function to take longer to complete, which might be problematic when a quick answer is needed.
- The result can in missed events if the debounce time is too long.


**Example**

```
function debounce(callback, delay=3000){
    let timerId=""
    
    return function(...args){
        clearTimeout(timerId);
        timerId = setTimeout(()=>callback(...args, timerId), delay)       
    }
}


set = debounce(function(name){
    console.log(`HI Your name: ${name}`);
}, 3000);


set("B");
set("Ba");
set("Bat");
set("Batman");
```

### Throttling

Throttling is a technique that limits how often a function can run over a set period, unlike debouncing which delays execution. It’s helpful for events like mousemove or keydown that fire continuously but don’t need to run the attached function every time.

- The function runs once per fixed interval regardless of how many times the event fires.
- It maintains a regular and controlled execution pattern.
- Reduces unnecessary calls and helps prevent performance slowdowns.
- Commonly used in scroll tracking, window resize handling, and real-time UI updates.

**Advantages:**

- This decreases the frequency of function calls, which can assist in avoiding performance problems and optimizing resource consumption.
- This is used to restrict the rate at which users enter data using their keyboards or mice in order to stop mistakes or undesirable behaviors.

**Disadvantages:**

- Given that the function will only be called at specific intervals, it could not respond right away.
- If the throttle time is too long, some events can be skipped, which could cause a loss of detail.

**Example**

```
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

throt("Su");
throt("Sup");
throt("Super");
setTimeout(()=>throt("Superman"),5000);
```