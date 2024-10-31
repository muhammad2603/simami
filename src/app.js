const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mysql = require('mysql2')
const xss = require('xss')
const helmet = require('helmet')

const app = express()

const PORT = 3000

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(helmet())
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js", "http://192.168.100.167:3000"],
            styleSrc: ["'self'", "http://192.168.100.167:3000"],
            imgSrc: ["'self'", "http://192.168.100.167:3000"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    })
)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


const pool = mysql.createPool({
    host: 'localhost',
    user: 'fattahillah',
    password: 'F4tt4h1ll4h20040326',
    database: 'simami',
    connectionLimit: 10
})
pool.getConnection((err) => {

    if( err ) return console.error("Error while connect to DB:", err)

    console.log("Connection connected!")

})

const verifyHash = async (res, stringPass, hashPass) => {

    try {
        
        compareHash = await bcrypt.compare(stringPass, hashPass)

        if( !compareHash ) throw new Error("Login Gagal! Username atau Password Salah.")
        
        return true

    }catch(err) {
        return res.status(400).json({
            message: err.message,
            status: 400
        })
    }

}

app.get('/', (req, res) => {

    return res.render('index', { title: "Login SiMAMI" })

})

app.post('/login', async (req, res) => {

    try {
        let { username, password } = req.body

        username = xss(username)

        password = xss(password)

        if( !username || !password ) return res.status(400).json({
            message: "Pastikan Username dan Password tidak kosong!",
            status: 400
        })

        sql = "SELECT password FROM login WHERE username=?"

        pool.query(sql, [username], async (err, result) => {

            if( err ) throw new Error("Ada kesalahan saat pengambilan data!")

            const hashPass = result[0]?.password

            if( !hashPass ) return res.status(404).json({
                message: "Pengguna tidak ditemukan.",
                status: 404
            })

            await verifyHash(res, password, hashPass)

            return res.status(200).json({
                message: "Login Berhasil!",
                status: 200
            })
        })
        
    } catch (err) {
        console.error("Error:", err.message)
    }
    
})

app.get('/sign-up', (req, res) => {

    return res.render('signup', { title: "Sign Up SiMAMI" })

})

app.listen(PORT, () => {
    console.log('Server Running on Port:', PORT)
})