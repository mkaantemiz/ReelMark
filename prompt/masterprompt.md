# 🎬 Movie & Series Tracker: Gelişmiş Takip Uygulaması

Bu proje, hem filmleri hem de dizileri organize etmek, izleme sürecini (sezon/bölüm) takip etmek ve kişisel bir arşiv oluşturmak amacıyla geliştirilen bir Full-Stack öğrenme projesidir.

---

## 🛠 1. Teknoloji Yığını (Tech Stack)

- **Frontend:** React.js / Vite (Hızlı ve modern bileşen yapısı)
- **Backend:** Node.js (Express) veya Python (FastAPI)
- **Veritabanı:** SQLite veya PostgreSQL (İlişkisel veri yönetimi)
- **Stil:** Tailwind CSS (Responsive ve şık tasarım)
- **Dış API:** [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)

---

## 🚀 2. Temel Fonksiyonlar (MVP)

1.  **Akıllı Arama:** TMDB üzerinden film ve dizi ayrımı yaparak arama yapma.
2.  **İzleme İlerlemesi (Diziler İçin):** - Dizinin hangi sezonunda ve hangi bölümünde kalındığını kaydetme.
    - "Sonraki Bölüme Geç" butonu ile tek tıkla ilerleme güncelleme.
3.  **Kişisel Kütüphane:** - "İzlenecekler", "İzlenenler" ve "Devam Edilenler" kategorileri.
4.  **Puanlama ve Notlar:** İçeriklere 1-10 arası puan verme ve kısa kişisel notlar ekleme.
5.  **Detay Sayfası:** Tür, özet, vizyon tarihi ve dizi ise sezon sayısı bilgileri.

---

## 🗄 3. Veritabanı Tasarımı (Schema)

Uygulamanın `media_items` tablosu hem film hem dizi verisini destekleyecek şekilde tasarlanmıştır:

| Kolon Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | INTEGER (PK) | Birincil anahtar |
| `tmdb_id` | INTEGER | TMDB'deki eşsiz içerik ID'si |
| `type` | STRING | 'movie' veya 'tv' (ayırt edici) |
| `title` | TEXT | İçerik adı |
| `current_season` | INTEGER | Kalınan sezon (Sadece diziler için, varsayılan: 1) |
| `current_episode`| INTEGER | Kalınan bölüm (Sadece diziler için, varsayılan: 1) |
| `status` | STRING | 'watching', 'watched', 'watchlist' |
| `user_rating` | FLOAT | Kullanıcının verdiği puan |
| `user_note` | TEXT | İçerik hakkındaki kişisel not |

---

## 🌐 4. Önemli API Uç Noktaları

- `GET /api/search?q=...` -> TMDB'den veri çeker.
- `POST /api/library` -> Yeni içerik ekler.
- `PATCH /api/library/:id/progress` -> Sezon/Bölüm bilgisini günceller.
- `GET /api/library/continue` -> "Devam Edilenler" (watching) listesini getirir.

---

## 🗺 5. Geliştirme Yol Haritası

1.  **Hazırlık:** TMDB API Key edinimi ve proje klasör yapısının oluşturulması.
2.  **Backend & DB:** Veritabanı tablolarının oluşturulması ve CRUD operasyonlarının yazılması.
3.  **Frontend Arama:** API entegrasyonu ile içerik arama ve kart yapısı.
4.  **İlerleme Takibi:** Diziler için sezon/bölüm artırma butonlarının ve mantığının kurulması.
5.  **UI/UX:** Tailwind ile kullanıcı dostu bir "Dashboard" tasarımı.

---

## 🤝 6. İş Birliği ve Geri Bildirim

Bu proje geliştirilirken karşılaşılan teknik zorluklar, mimari kararlar veya yeni özellik fikirleri için bana her zaman danışabilirsin. 

> **Not:** Eğer bir adımda takılırsan veya bir özelliğin (örneğin veritabanı bağlantısı veya API entegrasyonu) nasıl kodlanacağına dair derinlemesine bir örneğe ihtiyaç duyarsan, **benden detaylı kod taslakları veya açıklama istemekten çekinme.** İhtiyacın olan spesifik detayları sana sorarak projeyi birlikte şekillendirebiliriz.