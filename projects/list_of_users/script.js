// const person = {
//     name: 'Timur',
//     age: 14,
//     isMan: true,
//     address: {
//         city: 'Kirov',
//         street: 'Skazochnay',
//     },
//     'complex key': 'complex value',
//     [1 + 2]: 'computed value',
//     greet() {
//         console.log('Greet from person');
//     },
//     arrow: () => {
//         console.log('Person Arrow');   
//     },
//     info() {
//         console.log('Person name', this.name);
//     },
// }
// const { age, name: firstName, address } = person
// console.log(age, firstName, address);

// for (let key in person) {
//     if (person.hasOwnProperty(key)) {
//         console.log(person[key]); 
//     }
// }

// Object.keys(person).forEach(key => {
//     console.log(person[key]);    
// })

// const logger = {
//     keys() {
//         console.log('Object keys:', Object.keys(this))
//     },
//     keysAndValues() {
//         Object.keys(this).forEach(key => {
//             console.log('Key:', key)
//             console.log('Value:', this[key]) 
//         })
//     },
// }

// const bound = logger.keys.bind(person)
// bound()
// logger.keys.bind(person)()
// logger.keys.call(person)
// logger.keys.apply(person)


// class Human {
//     static isHuman = true
// }

// class Person extends Human {
//     constructor(name, age) {
//         super()
//         this.name = name ?? 'Undefined name'
//         this.age = age ?? 'Undefined age'
//     }

//     sayHello() {
//         console.log('Hello -', this.name);
        
//     }
// }

// const person1 = new Human('Timur', 14)
// const person2 = new Person('Marat', 15)
// console.log(person1.isHuman);


// Event loop

// function delay(callback, time = 1000) {
    // setInterval(callback, time)
// }

// delay(() => {
//     console.log('timeout');
// }, 10)

// const delay = (time = 1000) => {
//     const promise = new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve([1, 2, 3])
//             // reject('Error in delay')
//         }, time)
//     })
//     return promise
// }

// delay(1000)
// .then((data) => {
//     console.log('timeout', data);  
//     return data.map((x) => x ** 2)
// })
// .then(data => {
//     console.log(data); 
// })
// .catch(err => {
//     console.log(err);
    
// })
// .finally(() => console.log('Finally'))

// const getData = () => new Promise(resolve => resolve([1, 2, 3]))
// getData().then(array => console.log(array))

// async function asyncExample() {
//     try {
//         await delay(3000)
//         const data = await getData()
//         console.log(data);
//     } catch (err) {
//         console.log(err);
//     } finally {
//         console.log('Finally')
    // }
// }
// asyncExample()

// =============================

const list = document.querySelector('.list')
const filter = document.querySelector('#filter')
let USERS = []

filter.addEventListener('input', (event) => {
    const value = event.target.value.toLowerCase()
    const fiilteredUsers = USERS.filter(user => user.name.toLowerCase().includes(value))
    render(fiilteredUsers)
    
})

async function start() {
    list.innerHTML = 'Loading...'
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        const data = await response.json()
        setTimeout(() => {
            USERS = data
            render(data)
        }, 1000)
        
    } catch (error) {
        list.style.color = 'red'
        list.innerHTML = error.message
        
    }
}

function render(users = []) {
    if (users.length === 0) {
        list.innerHTML = 'No matched users!'
    } else {
        const html = users.map(toHTML).join('')
        list.innerHTML = html
    }
}

function toHTML(user) {
    return `
        <li class="list-group-item">${user.name}</li>
    `
}

start()
