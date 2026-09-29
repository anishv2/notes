/**
    Currying is used in JavaScript to break down complex function calls into smaller, more manageable steps. It transforms a function with multiple arguments into a series of functions, each taking a single argument.
    It converts a function with multiple parameters into a sequence of functions.
    Each function takes a single argument and returns another function until all arguments are received.
    Helps in functional programming by enabling function reusability and composition.
 */



    function currying(arg1){
    console.log("ARGUMENT",arg1);
    return function(arg2){
        console.log("ARGUMENT",arg2);
        return function(arg3){
            console.log("ARGUMENT",arg3);
        }
    }
}


// function invoke

// Method 1: ordinary/common way

curr1 = currying(1);
curr2 = curr1(2);
curr3 = curr2(3);

// Method 2: by currying technique

currying(1)(2)(3)



// 1. Creating Reusable Specialized Functions
// Fix fixed baseline values (like tax rates, discounts, or configuration headers) and re-use the customized function throughout your app.

const applyDiscount = discount => price => price - (price * discount);

// Pre-configure specialized utility functions
const twentyPercentOff = applyDiscount(0.20);
const blackFridaySale = applyDiscount(0.50);

console.log(twentyPercentOff(100)); // 80
console.log(blackFridaySale(100));  // 50


// 2. Custom Logging Middleware
// Pass contextual parameters step-by-step (e.g., environment -> severe level -> message).


const log = level => timestamp => message => 
  `[${level.toUpperCase()}] [${timestamp}] ${message}`;

const logErrorNow = log('error')(new Date().toISOString());

logErrorNow('Database connection failed.'); 
// Logs: [ERROR] [2026-09-02T...] Database connection failed.


// 3. Higher-Order Array Operations
// Pass pre-configured curried functions cleanly into methods like map or filter.

JavaScript
const getProperty = key => object => object[key];

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

// Clean functional mapping without writing inline arrow logic: user => user.name
const names = users.map(getProperty('name')); 
// Output: ['Alice', 'Bob']