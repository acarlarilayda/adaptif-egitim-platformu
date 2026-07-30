# Adaptif Eğitim, Sınav ve Öğrenme Analitiği Platformu

🔗 **Canlı Demo:** https://adaptif-egitim-platformu.vercel.app/

Angular 17+ tabanlı, öğrencinin kazanım performansına göre içerik/soru öneren,
sınav oturumlarını yöneten, soru bankası kalite analizleri ve öğrenme
analitiği sunan kapsamlı bir eğitim platformu.

## Kullanıcı Rolleri ve Demo Hesapları

Uygulamada gerçek bir login akışı yoktur; üst bardan (topbar) rol değiştirilerek
aşağıdaki demo kullanıcılar arasında geçiş yapılabilir:

| Rol | Demo kullanıcı | Yetkileri |
|---|---|---|
| Öğrenci | Ayşe Yıldız | Atanan dersler, adaptif çalışma planı, sınav oturumu |
| Eğitmen | Mehmet Kaya | İçerik, soru, rubrik, değerlendirme, öğrenci ilerlemesi |
| Ölçme Uzmanı | Elif Demir | Soru kalitesi, blueprint, zorluk/ayırt edicilik analizleri |
| Program Yöneticisi | Can Aydın | Kazanım haritası, program, cohort, yayın süreçleri |
| Gözlemci | Zeynep Şahin | Yetkili cohort için salt okunur raporlar |
| Platform Yöneticisi | Ozan Çelik | Rol, izin, dönem, sistem parametreleri |

## Kurulum ve Çalıştırma

```bash
npm install
npm start        # http://localhost:4200
npm test         # Karma/Jasmine unit testleri
npm run build    # production build (dist/ altına)
```

## Mimari Kararlar

- **Feature-based + katmanlı mimari:** her `features/<isim>` klasörü kendi
  `pages/ (route bileşenleri) / components/ (modüle özel) / data-access/
  (facade + repository) / state/ (signal store) / models/` katmanlarına sahiptir.
- **State yönetimi:** Angular Signals; asenkron akışlar RxJS operatörleriyle yönetiliyor.
- **Mock API katmanı:** `core/api/mock-transport.ts` üzerinden gecikme, hata ve
  yetkisiz erişim simülasyonu; `core/api/mock-data/*` altında birbiriyle ilişkili demo veri.
- **Rol/izin kontrolü:** route seviyesinde `role.guard.ts`, bileşen seviyesinde
  `HasPermissionDirective` ile UI'dan tamamen kaldırma, repository seviyesinde
  yetkisiz işlem denemelerinin reddedilmesi.
- **Sınav sayacı:** istemci saatine değil, mutlak bitiş zaman damgasına (sunucu
  referans zamanı simülasyonu) dayalı hesaplama yapar.
- **Offline dayanıklılık:** sınav oturumunda bağlantı kaybında cevaplar yerel
  kuyruğa alınır, bağlantı gelince sırayla senkronize edilir.

## Bilinen Eksikler / Teknik Notlar

- Courses (Dersler) modülü için ayrı bir `data-access` katmanı ve create/edit
  akışı planlanıyor, şu an salt okunur listeleme mevcut.
- Bazı liste ekranlarında (exam-list, grading-list) sunucu taraflı pagination/
  sıralama henüz eklenmedi.
- Reactive Forms şu an sadece soru düzenleme ekranında kullanılıyor; diğer
  formlara yaygınlaştırılması planlanıyor.

## Testler

`ng test` ile unit testler çalıştırılır: kritik facade/repository/validator
birim testleri ve exam-session, exam-builder, grading, outcome-list, recommendation-list
ekranları için component/integration testleri içerir.