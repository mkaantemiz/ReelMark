const https = require('https');

const API_KEY = '77b7934e0c4fb3e58435131124dd1685';
const query = 'inception';
const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=tr-TR`;

console.log('TMDB API test başlıyor...');
https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode === 200) {
            console.log('✅ TMDB API ÇALIŞIYOR!');
            console.log('Sonuç sayısı:', parsed.results?.length);
            console.log('İlk film:', parsed.results?.[0]?.title);
        } else {
            console.log('❌ HATA:', res.statusCode, parsed.status_message);
        }
    });
}).on('error', (e) => {
    console.log('❌ AĞ HATASI:', e.message);
});
