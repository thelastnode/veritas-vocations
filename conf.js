module.exports = {
    port: process.env.PORT || 3000,
    mongo_uri: process.env.MONGOLAB_URI || 'mongodb://localhost/veritas-vocations',
    sendgrid: {
        username: process.env.SENDGRID_USERNAME,
        password: process.env.SENDGRID_PASSWORD,
        host: 'smtp.sendgrid.net',
        port: '587',
    },
    domain: 'veritasvocations.com',
    email: 'noreply@veritasvocations.com',
};