let mode = ''
const output = document.getElementById('output')
const fullBtn = document.getElementById('full')
const dateBtn = document.getElementById('date')
const timeBtn = document.getElementById('time')


function bindMode(name) {
    return function() {
        mode = name
        update()
    }
}

fullBtn.onclick = bindMode('full')
dateBtn.onclick = bindMode('date')
timeBtn.onclick = bindMode('time')

setInterval(update, 100)
update()

function update() {
    output.textContent = format(mode)
}


function format(formatMode) {
    const now = new Date()
    switch (formatMode) {
        case 'full': 
            return now.toLocaleDateString() + ' ' + now.toLocaleTimeString()
        case 'date': 
            return now.toLocaleDateString()
        case 'time': 
            return now.toLocaleTimeString() + '.' + now.getMilliseconds()
        default:
            return now.toLocaleTimeString()
    }
}

