require('dotenv').config()
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json())

// In-memory store (replace with DB in production)
const users = [] // { username, password }
let refreshTokens = []

// Helper
function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}

// Signup - create a new user and return tokens (no password hashing as requested)
app.post('/signup', (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password required' })
    const exists = users.find(u => u.username === username)
    if (exists) return res.status(409).json({ success: false, error: 'user already exists' })

    const user = { username, password }
    users.push(user)

    const tokenUser = { name: username }
    const accessToken = generateAccessToken(tokenUser)
    const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)

    return res.status(201).json({ success: true, user: { username }, accessToken, refreshToken })
})

// Signin - authenticate and return tokens
app.post('/signin', (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password required' })

    const user = users.find(u => u.username === username && u.password === password)
    if (!user) return res.status(401).json({ success: false, error: 'invalid credentials' })

    const tokenUser = { name: username }
    const accessToken = generateAccessToken(tokenUser)
    const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)

    return res.status(200).json({ success: true, user: { username }, accessToken, refreshToken })
})

// Signout - remove refresh token
app.post('/signout', (req, res) => {
    const { token } = req.body || {}
    if (!token) return res.status(400).json({ success: false, error: 'token required' })
    refreshTokens = refreshTokens.filter(t => t !== token)
    return res.status(200).json({ success: true })
})

// Token refresh
app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (!refreshToken) return res.status(401).json({ success: false, error: 'no token provided' })
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ success: false, error: 'invalid refresh token' })

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, error: 'invalid token' })
        const accessToken = generateAccessToken({ name: user.name })
        return res.status(200).json({ success: true, accessToken })
    })
})

app.listen(4000, () => console.log('Auth server listening on port 4000'))

