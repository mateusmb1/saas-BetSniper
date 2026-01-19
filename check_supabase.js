import('dotenv').then(dotenv => {
    dotenv.config({ path: '.env.local' });
}).catch(e => console.log('dotenv error', e));
