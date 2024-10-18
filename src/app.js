const express = require('express')
const app = express()
const path = require('path')

const PORT = 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {

    res.render('index', { title: "Home SiMAMI" })
    
})

app.listen(PORT, () => {
    console.log('Server Running on Port:', PORT)
})