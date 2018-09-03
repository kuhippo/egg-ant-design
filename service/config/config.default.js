'use strict';

module.exports = appInfo => {
  const config = (exports = {
    knex: {
      client: {
        dialect: 'mysql',
        connection: {
          host: '127.0.0.1',
          port: '8889',
          user: 'root',
          password: '123456',
          database: 'qban',
        },
        pool: { min: 0, max: 5 },
        acquireConnectionTimeout: 30000,
      },
      app: true,
      agent: false,
    },
    jwt: {
      secret: 'scscms',
      expiresIn: '20d',
    },
    security: {
      csrf: { enable: false },
      domainWhiteList: [ '127.0.0.1:8000', 'localhost:8000' ],
    },
    multipart: {
      whitelist: [ '.png', '.jpg', '.bmp' ],
      fileSize: '5mb',
    },
    errorHandler: {
      // match: '/admin',
    },
    auth: {
      match: '/admin',
    },
    mobileAuth: {
      match: '/mobile',
    },
  });

    // use for cookie sign key, should change to your own and keep security
    // config.keys = appInfo.name + '_1534816541755_8766';
  config.keys = '1';
  // add your config here
  config.middleware = [ 'auth', 'errorHandler', 'mobileAuth' ];
  // config.middleware = [ 'auth' ];
  return config;
};
