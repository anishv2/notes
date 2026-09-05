
Person Object

```
const person = {
    firstName:"Billy",
    lastName: "Paul",
    age: 32,
    showGreeting: function (greeting) {
        return `${greeting}, My name is ${this.firstName} ${this.lastName}`
    }
};
```

**Call Method**

The call() method allows you to call a function with a specified this value and arguments provided individually. The first argument to call() sets the this value for the function being called, and the remaining arguments are passed to the function as arguments.

```
function showGreeting(greeting){
    console.log(`${greeting}, My name is ${this.firstName} ${this.lastName}`);
}

showGreeting.call(person, "Hello, Good Evening!");
```

**Apply Method**

The apply() method is similar to the call() method, but it takes an array of arguments instead of individual arguments. The first argument to apply() sets the this value for the function being called, and the second argument is an array of arguments to pass to the function.

```
function addThreeNumbers(num1, num2, num3){
    console.log(`Sum of numbers are: ${num1+num2+num3}`);
}

addThreeNumbers.apply(null, [3,5,65]);
```

**Bind Method**

The bind() method returns a new function with a specified this value and any arguments that are passed to it. The bind() method does not call the function immediately but instead returns a new function that can be called later.

```
const greeting = person.showGreeting.bind(person);

console.log(greeting("Hello Good Evening!"))
```