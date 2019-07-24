const express = require('express')
const Eauth = require('express-eauth');
const expressNunjucks = require('express-nunjucks')
const session = require('express-session')
const rp = require('request-promise')
const async = require('async')
const MobileDetect = require('mobile-detect')

const app = express()
app.set('views', __dirname + '/dist');
const isDev = app.get('env') === 'development'
const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev
})


/* ----------- OAuth example----------- */
const OAUTH_CLIENT_ID = 'eauth'
const OAUTH_URL_PREFIX = 'http://eauth.local:8080/oauth'
const OAUTH_CREDIENTALS = Buffer.from(`${OAUTH_CLIENT_ID}:SEEEECRET`).toString('base64')
const OAUTH_REDIRECT_URI = 'http://localhost:59011/oauth_success'

app.use(session({
    secret: 'SSSEEEcret',
    resave: false,
    saveUninitialized: true,
}))

app.get('/', (req, resp) => {
    const cxt = {
        session: req.session,
    }

    if (!req.session.address) {
        Object.assign(cxt, {
            clientID: OAUTH_CLIENT_ID,
            oauthURL: `${OAUTH_URL_PREFIX}/authorize`,
            redirectURI: OAUTH_REDIRECT_URI,
            sessionID: req.sessionID,
        })

        resp.render('index', cxt)
    } else {
        resp.render('index', cxt)
    }

})

app.get('/oauth_success', (req, resp) => {
    if (req.query.state != req.sessionID) {
        resp.status(400)
            .send('Invalid session')
        return
    }

    const rpJson = rp.defaults({ json: true })
    Promise.resolve(null)
    .then(() => {
        return rpJson(`${OAUTH_URL_PREFIX}/token`, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${OAUTH_CREDIENTALS}` },
            form: {
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: OAUTH_REDIRECT_URI,
            },
            json: true,
        })
    })
    .then(authResult => {
        return rpJson(`${OAUTH_URL_PREFIX}/user`, {
            headers: { 'Authorization': `Bearer ${authResult.access_token}` },
        })
    })
    .then(userData => {
        const { id, address } = userData
        req.session.address = address
        console.log(req.session)
        resp.redirect('/')
    })
    .catch(err => {
        console.log(err)
        resp.status(500)
            .send('Error occurs while authenticating...')
    })
})


/* ----------- SDK example----------- */
const eauthDefault = new Eauth({ banner: 'Eauth Sample' })
const eauthMobile = new Eauth({ banner: 'Eauth Sample', method: 'personal_sign' }) // only for mobile

async function eauthMiddleware(req, res, next) {
  let middleware = eauthDefault
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile()) middleware = eauthMobile

  async.series([middleware.bind(null, req, res)], (err) => {
    return err ? next(err) : next()
  })
}

/* --- Step 1: authentication request --- */
app.get('/auth/:Address', eauthMiddleware, (req, res) => {
  return req.eauth.message ? res.send(req.eauth.message) : res.status(400).send()
});

/* --- Step 2: challenge response --- */
app.post('/auth/:Message/:Signature', eauthMiddleware, (req, res) => { 
  const address = req.eauth.recoveredAddress

  if (!address) res.status(400).send()
  else {
    req.session.address = address
    console.log(req.session)
    res.json({
        success: true,
        message: 'Eauth Success',
        address: address,
    })
  }
});





app.get('/logout', (req, resp) => {
    req.session.destroy()
    resp.redirect('/')
})

app.use(express.static(__dirname + '/dist'))

Promise.resolve()
.then(() => {
    app.listen(59011, () => {
      console.log('Server is up')
    })
})
