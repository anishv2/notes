// person object
 
const person = {
    firstName:"Billy",
    lastName: "Paul",
    age: 32,
    showGreeting: function (greeting) {
        return `${greeting}, My name is ${this.firstName} ${this.lastName}`
    }
};


// call method

function showGreeting(greeting){
    console.log(`${greeting}, My name is ${this.firstName} ${this.lastName}`);
}

showGreeting.call(person, "Hello, Good Evening!");


// apply method

function addThreeNumbers(num1, num2, num3){
    console.log(`Sum of numbers are: ${num1+num2+num3}`);
}

addThreeNumbers.apply(null, [3,5,65]);


// bind method

const greeting = person.showGreeting.bind(person);

console.log(greeting("Hello Good Evening!"))






