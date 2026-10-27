import React, { useRef, useState } from 'react';

const depoAnahtari = 'staj-defterim-gorevler';
const ornekGorevler = [
  { kimlik: 'ornek-1', baslik: 'React bileşenlerini oluştur', aciklama: 'Görev formunu ve görev listesini hazırlayarak arayüzü tamamla.', tamamlandi: false },
  { kimlik: 'ornek-2', baslik: 'LocalStorage ile kayıtları sakla', aciklama: 'Sayfa yenilendiğinde görevlerin korunduğunu kontrol et.', tamamlandi: false },
  { kimlik: 'ornek-3', baslik: 'Proje gereksinimlerini incele', aciklama: 'Yönergede istenen özellikleri belirle ve çalışma planını oluştur.', tamamlandi: true },
];

function gorevleriOku() {
  try {
    const kayit = localStorage.getItem(depoAnahtari);
    const gorevler = kayit === null ? ornekGorevler : JSON.parse(kayit);
    if (!Array.isArray(gorevler) || !gorevler.every((gorev) =>
      gorev && typeof gorev.kimlik === 'string' && typeof gorev.baslik === 'string' &&
      typeof gorev.aciklama === 'string' && typeof gorev.tamamlandi === 'boolean'
    ) || new Set(gorevler.map((gorev) => gorev.kimlik)).size !== gorevler.length) {
      throw new Error('Geçersiz kayıt');
    }
    return { gorevler, hata: '' };
  } catch {
    return { gorevler: [], hata: 'Tarayıcıdaki görevler okunamadı. Kayıtlarınız korunuyor. Tarayıcı ayarlarını kontrol edip sayfayı yenileyin.' };
  }
}

export default function Uygulama() {
  const [ilkKayit] = useState(gorevleriOku);
  const [gorevler, gorevleriAyarla] = useState(ilkKayit.gorevler);
  const [baslik, basligiAyarla] = useState('');
  const [aciklama, aciklamayiAyarla] = useState('');
  const [duzenlenenKimlik, duzenlenenKimligiAyarla] = useState(null);
  const [filtre, filtreyiAyarla] = useState('Tümü');
  const [hata, hatayiAyarla] = useState(ilkKayit.hata);
  const [bildirim, bildirimiAyarla] = useState('');
  const baslikAlani = useRef(null);
  const tamamlanan = gorevler.filter((gorev) => gorev.tamamlandi).length;
  const gorunenGorevler = gorevler.filter((gorev) => filtre === 'Tümü' ||
    (filtre === 'Tamamlanan' ? gorev.tamamlandi : !gorev.tamamlandi));

  function kaydet(yeniGorevler, mesaj) {
    if (ilkKayit.hata) return false;
    try {
      localStorage.setItem(depoAnahtari, JSON.stringify(yeniGorevler));
      gorevleriAyarla(yeniGorevler);
      hatayiAyarla('');
      bildirimiAyarla(mesaj);
      return true;
    } catch {
      hatayiAyarla('Değişiklik kaydedilemedi. Tarayıcı depolama alanını ve izinlerini kontrol edip tekrar deneyin.');
      return false;
    }
  }

  function formuTemizle() {
    basligiAyarla('');
    aciklamayiAyarla('');
    duzenlenenKimligiAyarla(null);
  }

  function formuGonder(olay) {
    olay.preventDefault();
    if (!baslik.trim()) {
      hatayiAyarla('Lütfen bir görev başlığı yazın.');
      baslikAlani.current.focus();
      return;
    }
    const yeniGorevler = duzenlenenKimlik
      ? gorevler.map((gorev) => gorev.kimlik === duzenlenenKimlik
        ? { ...gorev, baslik: baslik.trim(), aciklama: aciklama.trim() } : gorev)
      : [...gorevler, { kimlik: crypto.randomUUID(), baslik: baslik.trim(), aciklama: aciklama.trim(), tamamlandi: false }];
    if (kaydet(yeniGorevler, duzenlenenKimlik ? 'Görev güncellendi.' : 'Yeni görev eklendi.')) {
      formuTemizle();
      filtreyiAyarla('Tümü');
    }
  }

  function duzenle(gorev) {
    duzenlenenKimligiAyarla(gorev.kimlik);
    basligiAyarla(gorev.baslik);
    aciklamayiAyarla(gorev.aciklama);
    baslikAlani.current.focus();
  }

  function sil(gorev) {
    if (!window.confirm(`“${gorev.baslik}” görevi silinsin mi?`)) return;
    if (kaydet(gorevler.filter((kayit) => kayit.kimlik !== gorev.kimlik), 'Görev silindi.') &&
      duzenlenenKimlik === gorev.kimlik) formuTemizle();
  }

  function sifirla() {
    if (!window.confirm('Yaptığınız değişiklikler silinip örnek görevler geri yüklensin mi?')) return;
    if (kaydet(ornekGorevler, 'Örnek görevler geri yüklendi.')) {
      formuTemizle();
      filtreyiAyarla('Tümü');
    }
  }

  return (
    <div className="sayfa">
      <header className="ust-cubuk">
        <a className="marka" href="./"><span className="marka-simgesi" aria-hidden="true">✓</span> staj defterim<span className="marka-noktasi">.</span></a>
        <span className="ust-not">KÜÇÜK ADIMLAR, YENİ BECERİLER</span>
      </header>
      <main>
        <section className="giris" aria-labelledby="sayfa-basligi">
          <div><p className="etiket">ÇALIŞMA ALANIN</p><h1 id="sayfa-basligi">Bugün bir adım daha.</h1><p className="aciklama">Staj görevlerini planla, ilerlemeni gör, öğrendiklerine yer aç.</p></div>
          <div className="tarih-notu"><span aria-hidden="true">✦</span><p>Her tamamlanan görev,<br /><strong>yeni bir deneyim.</strong></p></div>
        </section>
        <section className="ozet" aria-label="Görev özeti">
          <div><span>Toplam görev</span><strong>{gorevler.length.toString().padStart(2, '0')}</strong></div>
          <div><span>Devam eden</span><strong>{(gorevler.length - tamamlanan).toString().padStart(2, '0')}</strong></div>
          <div><span>Tamamlanan</span><strong className="yesil">{tamamlanan.toString().padStart(2, '0')}</strong></div>
          <div className="ilerleme"><span>İlerleme <b>%{gorevler.length ? Math.round(tamamlanan / gorevler.length * 100) : 0}</b></span><progress aria-label="Tamamlanma oranı" value={tamamlanan} max={gorevler.length || 1} /></div>
        </section>
        {hata && <p className="hata" role="alert">{hata}</p>}
        <p className="bildirim" role="status">{bildirim}</p>
        <div className="calisma-alani">
          <section className="form-karti" aria-labelledby="form-basligi">
            <span className="bolum-no">01 / PLANLA</span>
            <h2 id="form-basligi">{duzenlenenKimlik ? 'Görevi düzenle' : 'Yeni bir görev'}</h2>
            <p>Aklındakini yaz, ilk adımı at.</p>
            <form onSubmit={formuGonder}>
              <fieldset disabled={Boolean(ilkKayit.hata)}>
                <label htmlFor="baslik">Görev başlığı <span aria-hidden="true">*</span></label>
                <input ref={baslikAlani} id="baslik" value={baslik} onChange={(olay) => basligiAyarla(olay.target.value)} maxLength={100} required placeholder="Örn. React bileşenlerini öğren" />
                <label htmlFor="aciklama">Açıklama <small>isteğe bağlı</small></label>
                <textarea id="aciklama" value={aciklama} onChange={(olay) => aciklamayiAyarla(olay.target.value)} maxLength={500} rows={5} placeholder="Bu görev için neler yapacaksın?" />
                <button className="ana-buton" type="submit">{duzenlenenKimlik ? 'Değişiklikleri kaydet' : 'Görev ekle'} <span aria-hidden="true">{duzenlenenKimlik ? '✓' : '+'}</span></button>
                {duzenlenenKimlik && <button className="vazgec" type="button" onClick={formuTemizle}>Düzenlemekten vazgeç</button>}
              </fieldset>
            </form>
            <div className="depo-notu"><span aria-hidden="true">◉</span> Değişikliklerin yalnızca bu tarayıcıda saklanır; diğer ziyaretçileri etkilemez.</div>
            <button className="reset-buton" type="button" onClick={sifirla} disabled={Boolean(ilkKayit.hata)}>Reset · Örnek verileri geri yükle</button>
          </section>
          <section className="liste-alani" aria-labelledby="liste-basligi">
            <div className="liste-baslik"><div><span className="bolum-no">02 / TAKİP ET</span><h2 id="liste-basligi">Görevlerim <span>{gorevler.length}</span></h2></div><span className="liste-notu">Her seferinde bir görev.</span></div>
            <div className="filtreler" role="group" aria-label="Görev filtresi">{['Tümü', 'Devam eden', 'Tamamlanan'].map((secenek) => <button type="button" key={secenek} aria-pressed={filtre === secenek} onClick={() => filtreyiAyarla(secenek)}>{secenek}</button>)}</div>
            {gorunenGorevler.length === 0 ? <div className="bos-liste"><span aria-hidden="true">✓</span><h3>{gorevler.length ? 'Bu listede görev yok' : 'İlk adım senden'}</h3><p>{gorevler.length ? 'Diğer görevlerini görmek için filtreyi değiştirebilirsin.' : 'Yeni bir görev ekleyerek staj planını oluşturmaya başla.'}</p></div>
              : <ul className="gorevler">{gorunenGorevler.map((gorev) => <li key={gorev.kimlik} className={gorev.tamamlandi ? 'gorev tamamlandi' : 'gorev'}>
                <input className="onay" type="checkbox" checked={gorev.tamamlandi} disabled={Boolean(ilkKayit.hata)} aria-label={`${gorev.baslik}: tamamlandı`} onChange={() => kaydet(gorevler.map((kayit) => kayit.kimlik === gorev.kimlik ? { ...kayit, tamamlandi: !kayit.tamamlandi } : kayit), 'Görev durumu güncellendi.')} />
                <div className="gorev-icerigi"><span className="durum">{gorev.tamamlandi ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}</span><h3>{gorev.baslik}</h3>{gorev.aciklama && <p>{gorev.aciklama}</p>}<div className="islemler"><button type="button" onClick={() => duzenle(gorev)} aria-label={`${gorev.baslik} görevini düzenle`}>Düzenle</button><button type="button" className="sil" onClick={() => sil(gorev)} aria-label={`${gorev.baslik} görevini sil`}>Sil</button></div></div>
              </li>)}</ul>}
          </section>
        </div>
      </main>
      <footer><span>staj defterim.</span><span>Planla. Uygula. Öğren.</span></footer>
    </div>
  );
}
