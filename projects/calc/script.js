const resultElement = document.getElementById('result')
const input1 = document.getElementById('input-1')
const input2 = document.getElementById('input-2')
const sumbitBtn = document.getElementById('submit')
const plusBtn = document.getElementById('+')
const misusBtn = document.getElementById('-')
const multiplyBtn = document.getElementById('*')
const divisionBtn = document.getElementById('/')

let action = '+'


plusBtn.onclick = () => {
    action = '+'
}

misusBtn.onclick = () => {
    action = '-'
}

multiplyBtn.onclick = () => {
    action = '*'
}

divisionBtn.onclick = () => {
    action = '/'
}



function printResult(sum) {
    resultElement.style.color = sum < 0 ? 'red' : 'green'
    resultElement.textContent = sum
}

function computeNumbersWithAction(ipt1, ipt2, actionSymbol) {
    const num1 = Number(ipt1.value)
    const num2 = Number(ipt2.value)

    return actionSymbol == '+' ? num1 + num2 : 
           actionSymbol == '-' ? num1 - num2 : 
           actionSymbol == '*' ? num1 * num2 : num1 / num2
}


sumbitBtn.onclick = () => {
    const result = computeNumbersWithAction(input1, input2, action)
    printResult(result)
}