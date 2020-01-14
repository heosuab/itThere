var lex = require('greenlock-express').create({
    version: 'draft-11',
    configDir:'/etc/letsencrypt',
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    approveDomains: (opts, certs, cb)=>{
        if(certs){
            opts.domains = ['itthere.co.kr', 'www.itthere.co.kr'];
        }else{
            opts.email = '77sy777@gmail.com';
            opts.aggreeTos = true;
        }
        cb(null,{ options: opts, certs});
     },
     renewWithin: 81 *24*60*60*1000,
     renewBy:80*24*60*60*1000
});

module.exports = lex;