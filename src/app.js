const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()

const PORT = 3000

app.use(express.static(path.join(__dirname, '../public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.json())

app.get('/', async (req, res) => {

    res.render('index', { title: "Login SiMAMI" })
    
})

app.get('/sign-up', (req, res) => {

    res.render('signup', { title: "Sign Up SiMAMI" })

})

app.listen(PORT, () => {
    console.log('Server Running on Port:', PORT)
})