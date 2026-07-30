# Adaptif Eğitim, Sınav ve Öğrenme Analitiği Platformu

🔗 **Canlı Demo:**https://adaptif-egitim-platformu.vercel.app

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
| Program Yöneticisi | Can Aydın | Kazanım haritası, program (ders), cohort, yayın süreçleri |
| Gözlemci | Zeynep Şahin | Yetkili cohort için salt okunur raporlar |
| Platform Yöneticisi | Ozan Çelik | Rol, izin, dönem, sistem parametreleri |

## Kurulum ve Çalıştırma

```bash
npm install
npm start        # http://localhost:4200
npm test         # Karma/Jasmine unit + component testleri (87 test)
npm run build    # production build (dist/ altına)
```

## Mimari Kararlar

- **Feature-based + katmanlı mimari:** her `features/<isim>` klasörü kendi
  `pages/ (route bileşenleri) / components/ (modüle özel) / data-access/
  (facade + repository) / state/ (signal store) / models/` katmanlarına sahiptir.
  Örn. `courses` özelliği artık kendi `CourseRepository`/`CourseStore`/`CourseFacade`
  üçlüsüne sahip; `outcomes` özelliği ders verisine bu facade üzerinden erişir
  (tek doğruluk kaynağı, cross-feature doğrudan repository erişimi yok).
- **State yönetimi:** Angular Signals; asenkron akışlar RxJS operatörleriyle yönetiliyor.
- **Formlar:** Kritik domain kuralları içeren formlar (soru düzenleme, kazanım
  önkoşulu ekleme, ders oluşturma) Reactive Forms ile kurulmuştur. Kazanım
  önkoşulu formunda, döngü oluşturup oluşturmayacağı (İş Kuralı #1) senkron bir
  `ValidatorFn` ile anlık olarak (submit beklemeden) kontrol edilir.
- **Mock API katmanı:** `core/api/mock-transport.ts` üzerinden gecikme, hata ve
  yetkisiz erişim simülasyonu; `core/api/mock-data/*` altında birbiriyle ilişkili demo veri.
- **Rol/izin kontrolü:** route seviyesinde `role.guard.ts`, bileşen seviyesinde
  `HasPermissionDirective` ile UI'dan tamamen kaldırma, repository seviyesinde
  yetkisiz işlem denemelerinin reddedilmesi (örn. `ExamRepository.publish`,
  `QuestionRepository.publish`, `GradingRepository.updateCriterionScore`,
  `CourseRepository.publish`).
- **Sınav sayacı:** istemci saatine değil, mutlak bitiş zaman damgasına (sunucu
  referans zamanı simülasyonu) dayalı hesaplama yapar; sekme arka plana alınıp
  tekrar öne geldiğinde doğru kalan süreyi gösterir.
- **Offline dayanıklılık:** sınav oturumunda bağlantı kaybında cevaplar yerel
  kuyruğa alınır, bağlantı gelince sırayla senkronize edilir.
- **Cohort gizliliği:** minimum öğrenci sayısının altındaki gruplarda (İş Kuralı
  #10) ortalama/detay skorlar gösterilmez, yerine gizlilik uyarısı gösterilir.
- **Gerçek zamanlı akış:** `AuditLogService.eventStream$` (RxJS Subject) her
  yeni denetim kaydını (yayın, puan değişikliği, oturum sonlandırma) anlık
  yayınlar; `audit-log` ekranındaki "Canlı Bağlan" özelliği buna abone olur.
- **Erişilebilirlik/Responsive:** kritik durum göstergelerinde `aria-live`/
  `role="status"`, hata mesajlarında `role="alert"`; topbar dar ekranda
  hamburger menüye dönüşür, liste/tablo ekranları taşmadan görüntülenir.

## Bilinen Eksikler / Teknik Notlar

- Reactive Forms şu an kritik domain kuralı olan formlarda (soru düzenleme,
  kazanım önkoşulu, ders oluşturma) kullanılıyor; sınav oturumu cevap girişi
  gibi daha basit formlar hâlâ template-driven yaklaşımla yazılmış.
- Bazı liste ekranlarında (exam-list, question-list) arama/filtre var ama
  tam sunucu taraflı pagination (sayfa başı N öğe) henüz eklenmedi.
- Mock API hata simülasyonu (errorRate) tüm repository'lerde düşük bir oranla
  (%2-8) aktif; kapsamlı bir "her yazma işlemi için ayrı hata senaryosu"
  matrisi yerine temsili bir örnek seti uygulanmıştır.

## Testler

`npm test` ile 87 test çalıştırılır: kritik facade/repository/validator birim
testleri (rol kontrolü, döngü/gizlilik/versiyon kuralları dahil) ve
exam-session, exam-builder, grading, outcome-list, recommendation-list
ekranları için component/integration testleri içerir.