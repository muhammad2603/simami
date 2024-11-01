require('dotenv').config()
const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mysql = require('mysql2')
const xss = require('xss')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
// Initialize Express
const app = express()
// Get PORT from Environment
const PORT = process.env.PORT
// Get Secret Key from ENV
const secretKey = process.env.SECRET_KEY
// Use static for accessing folder public source
app.use(express.static(path.join(__dirname, '../public')))
// Use Express JSON for Parsing Request Body (JSON Format)
app.use(express.json())
// Let app (Express) using helmet
app.use(helmet())
app.use(
    // Set Content Security Policy (CSP)
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js", "http://192.168.100.167"],
            styleSrc: ["'self'", "http://192.168.100.167"],
            imgSrc: ["'self'", "http://192.168.100.167"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    })
)

// Let app (Express) using Cookie Parser
app.use(cookieParser())

// Set View Engine to EJS
app.set('view engine', 'ejs')
// Set views folder
app.set('views', path.join(__dirname, 'views'))

// Create Pool with config MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'fattahillah',
    password: 'F4tt4h1ll4h20040326',
    database: 'simami',
    connectionLimit: 10
})

pool.getConnection((err) => {
    // If error finded while connecting to DB, return and print error message to console 
    if( err ) return console.error("Error while connect to DB:", err)
    // If DB is connected, print message to console
    console.log("Connection connected!")
})

const makeHash = async (stringPassword) => {
    // Create Hash from params stringPassword with salt 10
    const hash = await bcrypt.hash(stringPassword, 10)
    // Return hashed password
    return hash
}

const verifyHash = async (res, stringPass, hashPass) => {
    try {
        // Compare Hash, if matched, they will returned true
        compareHash = await bcrypt.compare(stringPass, hashPass)
        // Validation Compared Hash, if doesn't matched, then throw an error
        if( !compareHash ) throw new Error("Login Gagal! Username atau Password Salah.")
        // Return true
        return true
    }catch(err) {
        return res.status(400).json({
            message: err.message,
            status: 400
        })
    }
}

const generateTokenJwt = (payload) => {
    // Return generate Token
    return jwt.sign(payload, secretKey, { expiresIn: '1h' })
}

const verifyTokenJwt = (req, res, next) => {
    // Get Token JWT from cookies or Headers Request
    const tokenJwt = req.cookies.token || req.headers['authorization']?.split(' ')[1]
    // If Token JWT is not exist, redirect user (Not Authenticated) to Root or Login Page
    if( !tokenJwt ) return res.redirect('/')
    // Verify JWT with Token and secret key, then decoded Token
    jwt.verify(tokenJwt, secretKey, (err, decoded) => {
        // If error or Token is not Valid, redirecting user (sniffing expected) to Root or Login Page
        if( err ) return res.redirect('/')
        // Save Decoded Token to Object Request with key user and value is Decoded Token
        req.user = decoded
        // Next Endpoint
        next()        
    })

}

app.get('/', (req, res) => {
    // Return with rendered page on file index.ejs
    return res.render('index', { title: "Login SiMAMI" })
})

app.post('/login', async (req, res) => {
    try {
        // Get Username and Password from Request Body
        let { username, password } = req.body
        // Set XSS to username value
        username = xss(username)
        // Set XSS to password value
        password = xss(password)
        // If username and password not exist in Request Body, return with status 400 (Bad Request) and message
        if( !username || !password ) return res.status(400).json({
            message: "Pastikan Username dan Password tidak kosong!",
            status: 400
        })
        // SQL Command for selecting password by username
        sql = "SELECT password, role FROM login WHERE username=?"
        // Make first pool query: Getting password for user
        pool.query(sql, [username], async (err, result) => {
            // If error, throw error
            if( err ) throw new Error("Ada kesalahan saat pengambilan data!")
            // Get hash password user from database
            const hashPass = result[0]?.password,
                  role = result[0]?.role
            // If hash password is not finded on database, return error with status 404 (Not Found) and message
            if( !hashPass ) return res.status(404).json({
                message: "Pengguna tidak ditemukan.",
                status: 404
            })
            // Verify hash password with password from Request Body and hash password from database, if error, throw an error (throw exist inside function)
            await verifyHash(res, password, hashPass)
            // Generate token JWT with payload
            const token = generateTokenJwt({
                username: username,
                role: role
            })
            // Make Cookie for "remember me" and set max-age expires for 1 hour
            res.cookie('token', token, {
                maxAge: 1 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            })
            // Return response
            return res.status(200).json({
                message: "Login Berhasil!",
                token: token,
                status: 200
            })
        })
    } catch (err) {
        // If error, return response with status 500 (Internal Server Error) and message
        return res.status(500).json({
            message: err.message,
            status: 500
        })
    }
})

app.get('/sign-up', (req, res) => {
    // Return with rendered page on file signup.ejs
    return res.render('signup', { title: "Sign Up SiMAMI" })
})

app.post('/sign-up', async (req, res) => {
    try {
        // Get username, password, and confirm password from Request Body
        let { username, password, confirmPassword } = req.body
        // Set XSS on username value
        username = xss(username)
        // Set XSS on password value
        password = xss(password)
        // Set xss on confirm password value
        confirmPassword = xss(confirmPassword)
        // If three inputs above doesn't exist, throw an error
        if( !username || !password || !confirmPassword ) throw new Error('Pastikan tidak ada input-an yang kosong!')
        // If password length belowed 8 characters, throw an error 
        if( password.length < 8 ) throw new Error('Password setidaknya harus memiliki 8 karakter atau lebih!')
        // If password is not match with confirm password, throw an error
        if( password !== confirmPassword ) throw new Error('Password tidak cocok dengan Confirm Password!')
        // Make hash password from password value
        password = await makeHash(password)
        // Get Last ID Login on Database
        lastIdSql = "SELECT id_login AS id FROM login ORDER BY created DESC LIMIT 1"
        // Make first pool query: Get Last ID
        pool.query(lastIdSql, (err, result) => {
            // If error found, throw an error
            if( err ) throw new Error(`Error while fetching Last ID: ${err.message}`)
                // Initialize id and newId
                let id = result[0].id,
                    newId
                // Test RegExp on id, if id exist "ID0" value inside
                if( /^ID0/.test(id) ) {
                    // Split (Str to Arr) id with (trunct is "ID0"), then pop last index (Ex: "1" from "ID01"), and make String Number to Number
                    id = Number(id.split("ID0").pop())
                    // Then Increase ID to +1 (Ex: 1 + 1 = 2)
                    newId = `ID0${++id}`
                }else { // If id not exist "ID0" inside
                    // Split (Str to Arr) id with (trunct is "ID"), then pop last index (Ex: "10" from "ID10"), and make String Number to Number
                    id = Number(id.split("ID").pop())
                    // Then Increase ID to +1 (Ex: 10 + 1 = 11)
                    newId = `ID${++id}`
                }
                // SQL Command for Inserting new user
                const insertUser = "INSERT INTO login(id_login, username, password) VALUES (?, ?, ?)"
                // Make second pool query: Inserting new user
                pool.query(insertUser, [newId, username, password], (err, result) => {
                    // If error, throw an error
                    if( err ) throw new Error(`Error while inserting user: ${err.message}`)
                    // If affectedRows is 0 or nothing row get affected, throw an error
                    if( result.affectedRows === 0 ) throw new Error(`Oops! Unexpected Error while inserting user. Please try again!`)
                    // Return response with status 201 (Source is Created), then give payload and message inside response
                    return res.status(201).json({
                        payload: {
                            newId: newId,
                            username: username
                        },
                        message: "User telah dibuat!",
                        status: 201
                    })
                })
        })
    }catch(err) {
        // If error founded, return status 400 (Bad Request), and give message error inside response
        return res.status(400).json({
            message: err.message,
            status: 400
        })
    }
})

app.get('/dashboard', verifyTokenJwt, (req, res) => {
    // Get username and role from user inside Request Body object
    const { username, role } = req.user
    // If role is user, Render User Dashboard Page
    if( role === 'user' ) return res.render('dashboard/user/user', { username: username })
    // If role is admin, Render Admin Dashboard Page
    return res.render('dashboard/admin/admin', { username: username })
})

app.listen(PORT, () => {
    // If server status is running, print to console
    console.log('Server Running on Port:', PORT)
})