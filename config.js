module.exports = {
    port: 8080,
    maxListeners: 30, 
    labVerifyInterval: 5, // 5 minutos
    reportInterval: 12 * 60, // 12 horas
    sitePath: "/teste/exp_data",
    scriptFile: "exp_script.js",
    styleFile: "exp_style.css",
    pt_html: "pt.html",
    es_html: "es.html",
    en_html: "en.html",
    default_html: "index.html",
    dbconfig: {
        host: '127.0.0.1',
        port     : '3306',
        user: 'user',
        password: 'password',
        database: 'relle'
    },
    mailOptions: {
        from: '"RELLE notification" <rellesmtp@gmail.com>', 
        to: 'admins@gmail.com',
        subject: 'Notification', // Subject line
        text: 'Hello', // plaintext body
        html: '' // html body
    },
    mailTransport: 'smtps://rellesmtp%40gmail.com:password@smtp.gmail.com'
};
