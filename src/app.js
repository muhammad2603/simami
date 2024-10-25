const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()

const PORT = 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.json())

app.get('/', (req, res) => {

    res.render('index', { title: "Home SiMAMI" })
    
})

app.listen(PORT, () => {
    console.log('Server Running on Port:', PORT)
})