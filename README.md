# Eauth Examples

Examples for using Eauth

## Usage

```
yarn
yarn start
```


| Use Case | Using URL | Frontend | Backend |
| -------- | -------- | -------- | -------- |
| using [node-eauth-server](https://github.com/pelith/node-eauth-server) for OAuth     | http://localhost:59011/     | [src/index.html#L49](https://github.com/pelith/eauth-examples/blob/master/src/index.html#L49)     | [server.js#L18](https://github.com/pelith/eauth-examples/blob/master/server.js#L18)     |
| using [Eauth SDK (express)](https://github.com/pelith/express-eauth)     | http://localhost:59011/     | [src/index.html#L60](https://github.com/pelith/eauth-examples/blob/master/src/index.html#L60)     | [server.js#L90](https://github.com/pelith/eauth-examples/blob/master/server.js#L90)     |
| using [node-eauth-server](https://github.com/pelith/node-eauth-server) as auth server through proxy     | http://localhost/     | [src/index.html#L76](https://github.com/pelith/eauth-examples/blob/master/src/index.html#L76)     | Checkout Setup     |


## Setup

### Browser

- For Eauth

   ```
   <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/pelith/eauth.js/dist/eauth.min.js"></script>
   ```

- For Fortmatic

   ```
   <script type="text/javascript" src="//cdn.jsdelivr.net/npm/fortmatic@latest/dist/fortmatic.js"></script>
   ```

### For local [node-eauth-server](https://github.com/pelith/node-eauth-server)

1. follow the installation
2. add a new record `id=1, name=NULL, client_id='eauth', client_secret='SEEEECRET', redirect_uri='http://localhost:59011/oauth_success', grant_types=NULL, scope=NULL, user_id=NULL` to `oauth_clients` table which migrated by [config.json](https://github.com/pelith/node-eauth-server/blob/master/config/config.json.example)
3. to prevent the session conflicts in localhost, add `127.0.0.1 eauth.local` in /etc/hosts

[About the session conflicts](https://stackoverflow.com/questions/1612177/are-http-cookies-port-specific)
> For historical reasons, cookies contain a number of security and privacy infelicities. For example, a server can indicate that a given cookie is intended for “secure” connections, but the Secure attribute does not provide integrity in the presence of an active network attacker. **Similarly, cookies for a given host are shared across all the ports on that host, even though the usual “same-origin policy” used by web browsers isolates content retrieved via different ports.**

### Setup proxy for Eauth server using local [node-eauth-server](https://github.com/pelith/node-eauth-server)

1. You can use the config below for `/etc/nginx/sites-available/default`

   ```
   server {
           listen 80 default_server;
           listen [::]:80 default_server;
   
           root /var/www/html;
   
           index index.html index.htm index.nginx-debian.html;
   
           server_name _;
   
           location / {
                   proxy_pass http://localhost:59011/;
                   proxy_http_version 1.1;
                   proxy_set_header Upgrade $http_upgrade;
                   proxy_set_header Connection 'upgrade';
                   proxy_set_header Host $host;
                   proxy_set_header X-Real-IP $remote_addr;
                   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                   proxy_cache_bypass $http_upgrade;
   
                   try_files $uri $uri/ =404;
           }
   
           location /eauth/ {
                   proxy_pass http://localhost:8080/;
                   proxy_http_version 1.1;
                   proxy_set_header Upgrade $http_upgrade;
                   proxy_set_header Connection 'upgrade';
                   proxy_set_header Host $host;
                   proxy_set_header X-Real-IP $remote_addr;
                   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                   proxy_cache_bypass $http_upgrade;
           }
   }

   ```

2. `sudo systemctl reload nginx`

Here's the [default nginx configuration file](https://gist.github.com/Gilg4mesh/b0e91dd6b25a2a6d46c40696742d3354) if you need it 😏

