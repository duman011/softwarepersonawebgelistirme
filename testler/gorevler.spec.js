import { test, expect } from '@playwright/test';

async function gorevEkle(sayfa, baslik, aciklama = '') {
  await sayfa.getByLabel('Görev başlığı').fill(baslik);
  await sayfa.getByLabel('Açıklama').fill(aciklama);
  await sayfa.getByRole('button', { name: 'Görev ekle' }).click();
}

test('ekleme, listeleme, güncelleme, kalıcılık, filtre ve silme', async ({ page: sayfa }) => {
  await sayfa.goto('/');
  await sayfa.evaluate(() => localStorage.setItem('staj-defterim-gorevler', '[]'));
  await sayfa.reload();
  await expect(sayfa.getByText('İlk adım senden')).toBeVisible();
  await gorevEkle(sayfa, 'React öğren', 'Bileşen ve state kavramlarını çalış.');
  await expect(sayfa.getByRole('heading', { name: 'React öğren', exact: true })).toBeVisible();
  await sayfa.getByRole('button', { name: 'React öğren görevini düzenle' }).click();
  await sayfa.getByLabel('Görev başlığı').fill('React bileşenlerini öğren');
  await sayfa.getByRole('button', { name: 'Değişiklikleri kaydet' }).click();
  await sayfa.getByRole('checkbox').check();
  await sayfa.reload();
  await expect(sayfa.getByRole('checkbox')).toBeChecked();
  await expect(sayfa.getByText('Bileşen ve state kavramlarını çalış.')).toBeVisible();
  await sayfa.getByRole('button', { name: 'Devam eden', exact: true }).click();
  await expect(sayfa.getByText('Bu listede görev yok')).toBeVisible();
  await sayfa.getByRole('button', { name: 'Tamamlanan', exact: true }).click();
  sayfa.once('dialog', (pencere) => pencere.dismiss());
  await sayfa.getByRole('button', { name: 'React bileşenlerini öğren görevini sil' }).click();
  await expect(sayfa.getByRole('checkbox')).toBeVisible();
  sayfa.once('dialog', (pencere) => pencere.accept());
  await sayfa.getByRole('button', { name: 'React bileşenlerini öğren görevini sil' }).click();
  await sayfa.reload();
  await expect(sayfa.getByText('İlk adım senden')).toBeVisible();
});

test('boş başlık reddedilir ve depolama hatasında görev kaybolmaz', async ({ page: sayfa }) => {
  await sayfa.goto('/');
  await sayfa.evaluate(() => localStorage.setItem('staj-defterim-gorevler', '[]'));
  await sayfa.reload();
  await gorevEkle(sayfa, '   ');
  await expect(sayfa.getByRole('alert')).toContainText('görev başlığı');
  await gorevEkle(sayfa, 'Korunacak görev');
  await sayfa.evaluate(() => {
    Storage.prototype.setItem = () => { throw new Error('Depolama dolu'); };
  });
  await sayfa.getByRole('checkbox').click();
  await expect(sayfa.getByRole('alert')).toContainText('kaydedilemedi');
  await expect(sayfa.getByRole('checkbox')).not.toBeChecked();
  await sayfa.reload();
  await expect(sayfa.getByRole('heading', { name: 'Korunacak görev' })).toBeVisible();
});

test('bozuk kayıt üzerine yazılmaz', async ({ page: sayfa }) => {
  await sayfa.goto('/');
  await sayfa.evaluate(() => localStorage.setItem('staj-defterim-gorevler', 'bozuk kayıt'));
  await sayfa.reload();
  await expect(sayfa.getByRole('alert')).toContainText('okunamadı');
  await expect(sayfa.getByLabel('Görev başlığı')).toBeDisabled();
  expect(await sayfa.evaluate(() => localStorage.getItem('staj-defterim-gorevler'))).toBe('bozuk kayıt');
});

test('masaüstü ve mobil ekran görüntüleri', async ({ page: sayfa }) => {
  await sayfa.setViewportSize({ width: 1440, height: 1080 });
  await sayfa.goto('/');
  await sayfa.evaluate(() => document.fonts.ready);
  await sayfa.screenshot({ path: 'belgeler/ekran-goruntusu.png', fullPage: true });
  await sayfa.setViewportSize({ width: 390, height: 844 });
  expect(await sayfa.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(sayfa.getByRole('button', { name: 'Görev ekle' })).toBeVisible();
  await sayfa.screenshot({ path: 'belgeler/mobil-ekran-goruntusu.png', fullPage: true });
});

test('örnek görevler düzenlenebilir; Reset onayı, form ve filtreyi başlangıca döndürür', async ({ page: sayfa }) => {
  await sayfa.goto('/');
  await expect(sayfa.getByRole('checkbox')).toHaveCount(3);
  await sayfa.getByRole('button', { name: 'React bileşenlerini oluştur görevini düzenle' }).click();
  await sayfa.getByLabel('Görev başlığı').fill('Değiştirilmiş örnek');
  await sayfa.getByRole('button', { name: 'Değişiklikleri kaydet' }).click();
  await gorevEkle(sayfa, 'Ziyaretçinin görevi');
  sayfa.once('dialog', (pencere) => pencere.accept());
  await sayfa.getByRole('button', { name: 'LocalStorage ile kayıtları sakla görevini sil' }).click();
  await sayfa.reload();
  await expect(sayfa.getByRole('heading', { name: 'Değiştirilmiş örnek', exact: true })).toBeVisible();
  sayfa.once('dialog', (pencere) => pencere.dismiss());
  await sayfa.getByRole('button', { name: /Reset/ }).click();
  await expect(sayfa.getByRole('heading', { name: 'Ziyaretçinin görevi' })).toBeVisible();
  await sayfa.getByRole('button', { name: 'Değiştirilmiş örnek görevini düzenle' }).click();
  await sayfa.getByRole('button', { name: 'Tamamlanan', exact: true }).click();
  sayfa.once('dialog', (pencere) => pencere.accept());
  await sayfa.getByRole('button', { name: /Reset/ }).click();
  await expect(sayfa.getByLabel('Görev başlığı')).toHaveValue('');
  await expect(sayfa.getByRole('button', { name: 'Tümü', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await sayfa.reload();
  await expect(sayfa.getByRole('checkbox')).toHaveCount(3);
  await expect(sayfa.getByRole('heading', { name: 'React bileşenlerini oluştur', exact: true })).toBeVisible();
  await expect(sayfa.getByRole('heading', { name: 'LocalStorage ile kayıtları sakla', exact: true })).toBeVisible();
  await expect(sayfa.getByRole('heading', { name: 'Ziyaretçinin görevi' })).toHaveCount(0);
});

test('yeni ziyaretçi başka ziyaretçinin değişikliklerini görmez', async ({ page: sayfa, browser: tarayici }) => {
  await sayfa.goto('/');
  await gorevEkle(sayfa, 'Sadece ilk ziyaretçiye ait görev');
  const yeniOturum = await tarayici.newContext();
  try {
    const yeniSayfa = await yeniOturum.newPage();
    await yeniSayfa.goto('http://127.0.0.1:5173/');
    await expect(yeniSayfa.getByRole('checkbox')).toHaveCount(3);
    await expect(yeniSayfa.getByRole('heading', { name: 'Sadece ilk ziyaretçiye ait görev' })).toHaveCount(0);
    await expect(sayfa.getByRole('checkbox')).toHaveCount(4);
  } finally {
    await yeniOturum.close();
  }
});
