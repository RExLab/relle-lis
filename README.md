# relle-lis
Relle component for scheduling of lab instances

## Dependencies
This application were written using node.js v.0.12.9 and MySQL 5.5, but it should also work on greater versions.

## Installing

Make sure you have [Node.js](http://nodejs.org/) installed. 

```sh
git clone git@github.com:RExLab/relle-lis.git # or download
cd relle-lis
npm install
```

The relle-lis dependencies should now be ok, but we need to specify some configuration parameters on config.js file.  

## Setting up
Two tables are shared with Relle main application: labs and instances. If you have not installed it yet, both are available on [database.sql](https://github.com/RExLab/relle-lis/blob/master/db/database.js) for import. 
After importing labs and instances tables, you have to set up the database configuration on config.js, as showed below:  
```
dbconfig: {
    host: '127.0.0.1',
    port     : '3306',
    user: 'user',
    password: 'password',
    database: 'relledb'
} 
``` 
Mailing configuration:   

```
    mailOptions: {
        from: '"RELLE notification" <rellesmtp@gmail.com>', 
        to: 'admins@gmail.com',
        subject: 'Notification', // Subject line
        text: 'Hello', // plaintext body
        html: '' // html body
    },    
    mailTransport: 'smtps://rellesmtp%40gmail.com:password@smtp.gmail.com'

```

General application parameters:
``` 
  port: 8080, 
  maxListeners: 30, // Maximum number of namespaces, should always be higher than the number of labs. **Each lab uses a namespace.**
  labVerifyInterval: 5, // it checks lab availability every 5 minutes
  reportInterval: 12 * 60, // it stores availability reports every 12 hours
  sitePath: "/teste/exp_data", // site path to the public folder of all lab clients
  scriptFile: "exp_script.js", // the default name of the main Javascript file 
  styleFile: "exp_style.css", // the default name of the main CSS file 
  pt_html: "pt.html", // the default name of HTML file for a specific language and so on...
  en_html: "en.html",
  default_html: "index.html" 
