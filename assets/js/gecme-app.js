import { GECME_VARSAYILAN, NOT_SISTEMLERI, HARF_NOT_ESIKLERI, BASARISIZ_NOTLAR } from './config.js';
import { gecmeHesapla, toplamAgirlik } from './gecme-calculator.js';

export function initGecmeApp() {
    const kalemListesi = document.getElementById('kalem-listesi');
    const kalemEkleBtn = document.getElementById('kalem-ekle-btn');
    const hesaplaBtn = document.getElementById('hesapla-btn');
    const sifirlaBtn = document.getElementById('sifirla-btn');
    const sonucAlani = document.getElementById('sonuc-alani');
    const gecmeNotuInput = document.getElementById('gecme-notu');
    const finalMinCheck = document.getElementById('final-min-check');
    const finalMinInput = document.getElementById('final-min-not');
    const hedefHarfCheck = document.getElementById('hedef-harf-check');
    const hedefHarfSelect = document.getElementById('hedef-harf');
    const notSistemiSelect = document.getElementById('not-sistemi');
    const agirlikToplam = document.getElementById('agirlik-toplam');
    const hedefNotEl = document.getElementById('hedef-not-sonuc');
    const gerekliFinalEl = document.getElementById('gerekli-final-sonuc');
    const gerekliFinalBaslik = document.getElementById('gerekli-final-baslik');
    const agirlikliOrtalamaEl = document.getElementById('agirlikli-ortalama-sonuc');
    const harfNotEl = document.getElementById('harf-not-sonuc');
    const harfDurumEl = document.getElementById('harf-durum-sonuc');
    const durumKutusu = document.getElementById('durum-kutusu');
    const durumSonuc = document.getElementById('durum-sonuc');
    const detayAciklama = document.getElementById('detay-aciklama');
    const hedefHarfAlani = document.getElementById('hedef-harf-alani');
    const hedefHarfMesajEl = document.getElementById('hedef-harf-mesaj');
    const gecmeHataEl = document.getElementById('gecme-hata');

    const harfSecenekleriniGuncelle = () => {
        const sistem = notSistemiSelect.value;
        const harfler = NOT_SISTEMLERI[sistem].harfler;
        const secili = hedefHarfSelect.value;
        hedefHarfSelect.innerHTML = harfler
            .map((h) => `<option value="${h}" ${h === secili ? 'selected' : ''}>${h}</option>`)
            .join('');

        if (!harfler.includes(secili)) {
            hedefHarfSelect.value = GECME_VARSAYILAN.hedefHarf;
            if (!harfler.includes(hedefHarfSelect.value)) {
                hedefHarfSelect.value = harfler[harfler.length - 2] || harfler[0];
            }
        }
    };

    const agirlikToplamGuncelle = () => {
        const kalemler = kalemleriOku();
        const toplam = toplamAgirlik(kalemler);
        agirlikToplam.textContent = `Toplam ağırlık: %${toplam.toFixed(1)}`;
        agirlikToplam.className = Math.abs(toplam - 100) < 0.01
            ? 'agirlik-toplam agirlik-toplam--ok'
            : 'agirlik-toplam agirlik-toplam--warn';
    };

    const satirVerisiOku = (satir, index) => {
        const puanRaw = satir.querySelector('.kalem-puan')?.value.trim();
        return {
            ad: satir.querySelector('.kalem-ad')?.value.trim() || `Kalem ${index + 1}`,
            agirlik: parseFloat(satir.querySelector('.kalem-agirlik')?.value),
            puan: puanRaw === '' ? null : parseFloat(puanRaw),
            hedefIndex: satir.querySelector('.hedef-kalem')?.checked ? index : null
        };
    };

    const kalemleriOku = () => {
        return Array.from(kalemListesi.querySelectorAll('.gecme-row')).map((satir, i) => {
            const v = satirVerisiOku(satir, i);
            return { ad: v.ad, agirlik: v.agirlik, puan: v.puan };
        });
    };

    const hedefIndexOku = () => {
        const satirlar = kalemListesi.querySelectorAll('.gecme-row');
        for (let i = 0; i < satirlar.length; i++) {
            if (satirlar[i].querySelector('.hedef-kalem')?.checked) return i;
        }
        return null;
    };

    const hedefRadioOtomatikSec = () => {
        const satirlar = kalemListesi.querySelectorAll('.gecme-row');
        if (hedefIndexOku() != null) return;

        const bosIndeksler = [];
        satirlar.forEach((satir, i) => {
            const puanRaw = satir.querySelector('.kalem-puan')?.value.trim();
            if (puanRaw === '') bosIndeksler.push(i);
        });

        if (bosIndeksler.length !== 1) return;

        const radio = satirlar[bosIndeksler[0]].querySelector('.hedef-kalem');
        if (radio) radio.checked = true;
    };

    const hataGoster = (mesaj) => {
        if (!gecmeHataEl) return;
        if (mesaj) {
            gecmeHataEl.textContent = mesaj;
            gecmeHataEl.hidden = false;
        } else {
            gecmeHataEl.textContent = '';
            gecmeHataEl.hidden = true;
        }
    };

    const kalemSatiriEkle = (veri = {}) => {
        const satirDiv = document.createElement('div');
        satirDiv.className = 'glass-row gecme-row';

        const ad = veri.ad ?? '';
        const agirlik = veri.agirlik ?? '';
        const puan = veri.puan != null ? veri.puan : '';

        satirDiv.innerHTML = `
            <div class="gecme-row-grid">
                <div>
                    <label class="field-mobile-label">Değerlendirme</label>
                    <input type="text" value="${ad}" placeholder="Sınav adı" aria-label="Değerlendirme adı" class="kalem-ad glass-input">
                </div>
                <div>
                    <label class="field-mobile-label">Yüzde (%)</label>
                    <div class="input-with-suffix">
                        <input type="number" value="${agirlik}" placeholder="Yüzde" aria-label="Yüzde ağırlık" min="0" max="100" step="0.01" class="kalem-agirlik glass-input">
                        <span class="input-suffix" aria-hidden="true">%</span>
                    </div>
                </div>
                <div>
                    <label class="field-mobile-label">Not</label>
                    <input type="number" value="${puan}" placeholder="Not (0-100)" aria-label="Sınav notu" min="0" max="100" step="0.01" class="kalem-puan glass-input">
                </div>
                <div class="kalem-durum-cell" aria-live="polite"></div>
                <div class="hedef-cell">
                    <label class="hedef-label">
                        <input type="radio" name="hedef-kalem" class="hedef-kalem">
                        Hedef
                    </label>
                </div>
                <div class="kalem-sil-cell">
                    <button type="button" class="sil-btn btn-sm-danger">Sil</button>
                </div>
            </div>
        `;

        satirDiv.querySelector('.sil-btn').addEventListener('click', () => {
            satirDiv.remove();
            agirlikToplamGuncelle();
            hedefRadioOtomatikSec();
        });

        satirDiv.querySelectorAll('.kalem-agirlik, .kalem-puan').forEach((el) => {
            el.addEventListener('input', () => {
                agirlikToplamGuncelle();
                hedefRadioOtomatikSec();
            });
        });

        kalemListesi.appendChild(satirDiv);
        agirlikToplamGuncelle();
        hedefRadioOtomatikSec();
    };

    const kalemDurumlariniTemizle = () => {
        kalemListesi.querySelectorAll('.kalem-durum').forEach((el) => el.remove());
    };

    const kalemDurumGuncelle = (kalemIndex, mesaj, gecti) => {
        kalemDurumlariniTemizle();
        if (kalemIndex == null || !mesaj) return;

        const satir = kalemListesi.querySelectorAll('.gecme-row')[kalemIndex];
        if (!satir) return;

        const durumHucre = satir.querySelector('.kalem-durum-cell');
        if (!durumHucre) return;

        const durumEl = document.createElement('span');
        durumEl.className = `kalem-durum ${gecti ? 'kalem-durum--ok' : 'kalem-durum--warn'}`;
        durumEl.textContent = mesaj;
        durumHucre.appendChild(durumEl);
    };

    const harfSonucGoster = (sonuc) => {
        if (sonuc.harfNotu) {
            harfNotEl.textContent = sonuc.harfNotu;
            harfDurumEl.textContent = sonuc.harfAciklama || '';
            harfDurumEl.className = sonuc.harfGecti ? 'harf-durum-metin harf-durum-metin--ok' : 'harf-durum-metin harf-durum-metin--warn';
        } else {
            harfNotEl.textContent = '-';
            harfDurumEl.textContent = '';
            harfDurumEl.className = 'harf-durum-metin';
        }
    };

    const gerekliFinalBaslikGuncelle = (mod, kalemAdi = 'Hedef Kalem') => {
        if (mod === 'girilen') {
            gerekliFinalBaslik.textContent = `Girdiğin ${kalemAdi} Notu`;
        } else {
            gerekliFinalBaslik.textContent = `Gerekli Min. ${kalemAdi} Notu`;
        }
    };

    const agirlikliOrtalamaGuncelle = (sonuc, mod) => {
        if (sonuc.mevcutPuan == null || Number.isNaN(Number(sonuc.mevcutPuan))) {
            agirlikliOrtalamaEl.textContent = '';
            agirlikliOrtalamaEl.hidden = true;
            return;
        }

        const etiket = mod === 'girilen' ? 'Ağırlıklı ortalama' : 'Mevcut ağırlıklı ortalama';
        agirlikliOrtalamaEl.textContent = `${etiket}: ${Number(sonuc.mevcutPuan).toFixed(2)}`;
        agirlikliOrtalamaEl.hidden = false;
    };

    const hedefHarfMesajGoster = (sonuc) => {
        if (!hedefHarfCheck.checked || !sonuc.hedefHarfMesaji) {
            hedefHarfAlani.hidden = true;
            hedefHarfMesajEl.textContent = '';
            return;
        }

        hedefHarfMesajEl.textContent = sonuc.hedefHarfMesaji;
        hedefHarfAlani.className = sonuc.hedefHarfGecti
            ? 'hedef-harf-alani hedef-harf-alani--ok'
            : 'hedef-harf-alani hedef-harf-alani--warn';
        hedefHarfAlani.hidden = false;
    };

    const sonuclariTemizle = () => {
        kalemDurumlariniTemizle();
        hedefNotEl.textContent = '';
        gerekliFinalEl.textContent = '';
        gerekliFinalBaslik.textContent = 'Gerekli Min. Not';
        agirlikliOrtalamaEl.textContent = '';
        agirlikliOrtalamaEl.hidden = true;
        harfNotEl.textContent = '';
        harfDurumEl.textContent = '';
        harfDurumEl.className = 'harf-durum-metin';
        durumSonuc.textContent = '';
        detayAciklama.textContent = '';
        durumKutusu.className = 'result-card';
        durumSonuc.className = 'durum-metin';
        hedefHarfAlani.hidden = true;
        hedefHarfMesajEl.textContent = '';
        hataGoster('');
    };

    const hesapla = () => {
        hataGoster('');
        hedefRadioOtomatikSec();

        const kalemler = kalemleriOku();
        const gecmeNotuRaw = parseFloat(gecmeNotuInput.value);
        const sonuc = gecmeHesapla({
            gecmeNotu: Number.isNaN(gecmeNotuRaw) ? GECME_VARSAYILAN.gecmeNotu : gecmeNotuRaw,
            finalMinAktif: finalMinCheck.checked,
            finalMinNot: parseFloat(finalMinInput.value),
            kalemler,
            hedefIndex: hedefIndexOku(),
            notSistemi: notSistemiSelect.value,
            esikler: HARF_NOT_ESIKLERI,
            basarisizNotlar: BASARISIZ_NOTLAR,
            hedefHarf: hedefHarfSelect.value,
            hedefHarfAktif: hedefHarfCheck.checked
        });

        if (sonuc.durum === 'hata') {
            hataGoster(sonuc.mesaj);
            sonucAlani.classList.remove('goster');
            return;
        }

        const gosterilenAd = sonuc.hedefKalemAdi;
        const gosterilenPuan = sonuc.girilenPuan ?? sonuc.finalPuan;
        const gosterilenIndex = sonuc.girilenIndex ?? sonuc.finalIndex;

        hedefNotEl.textContent = String(sonuc.gecmeNotu);
        harfSonucGoster(sonuc);
        hedefHarfMesajGoster(sonuc);

        if (sonuc.durum === 'gecildi') {
            gerekliFinalBaslikGuncelle('girilen', gosterilenAd);
            gerekliFinalEl.textContent = Number(gosterilenPuan).toFixed(2);
            durumSonuc.textContent = 'Geçtin';
            durumKutusu.className = 'result-card durum-success';
            kalemDurumGuncelle(gosterilenIndex, sonuc.kisaMesaj, true);
        } else if (sonuc.durum === 'kalindi') {
            gerekliFinalBaslikGuncelle('girilen', gosterilenAd);
            gerekliFinalEl.textContent = Number(gosterilenPuan).toFixed(2);
            durumSonuc.textContent = 'Geçemedin';
            durumKutusu.className = 'result-card durum-danger';
            kalemDurumGuncelle(sonuc.finalIndex ?? gosterilenIndex, sonuc.kisaMesaj, false);
        } else if (sonuc.durum === 'geciyor') {
            gerekliFinalBaslikGuncelle('gerekli', gosterilenAd);
            gerekliFinalEl.textContent = '0';
            durumSonuc.textContent = sonuc.finalMinMesaji ? 'Geçme notu tamam; final min. kontrol et' : 'Zaten geçiyorsun';
            durumKutusu.className = 'result-card durum-success';
            kalemDurumlariniTemizle();
        } else if (sonuc.durum === 'imkansiz') {
            gerekliFinalBaslikGuncelle('gerekli', sonuc.hedefKalemAdi);
            gerekliFinalEl.textContent = sonuc.gerekliFinal.toFixed(2);
            durumSonuc.textContent = 'Geçilemez';
            durumKutusu.className = 'result-card durum-danger';
            kalemDurumlariniTemizle();
        } else {
            gerekliFinalBaslikGuncelle('gerekli', sonuc.hedefKalemAdi);
            gerekliFinalEl.textContent = sonuc.gerekliFinal.toFixed(2);
            durumSonuc.textContent = `${sonuc.hedefKalemAdi} gerekli min.`;
            durumKutusu.className = 'result-card durum-warning';
            kalemDurumlariniTemizle();
        }

        const ortalamaMod = ['gecildi', 'kalindi'].includes(sonuc.durum) ? 'girilen' : 'gerekli';
        agirlikliOrtalamaGuncelle(sonuc, ortalamaMod);

        let aciklama = sonuc.aciklama;
        if (sonuc.harfAciklama) {
            aciklama += ` ${sonuc.harfAciklama}`;
        }
        detayAciklama.textContent = aciklama;
        sonucAlani.classList.add('goster');
        sonucAlani.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const sifirla = () => {
        kalemListesi.innerHTML = '';
        sonucAlani.classList.remove('goster');
        sonuclariTemizle();
        gecmeNotuInput.value = GECME_VARSAYILAN.gecmeNotu;
        notSistemiSelect.value = GECME_VARSAYILAN.notSistemi;
        harfSecenekleriniGuncelle();
        hedefHarfSelect.value = GECME_VARSAYILAN.hedefHarf;
        hedefHarfCheck.checked = false;
        hedefHarfSelect.disabled = true;
        finalMinCheck.checked = false;
        finalMinInput.value = GECME_VARSAYILAN.finalMinNot;
        finalMinInput.disabled = true;
        GECME_VARSAYILAN.kalemler.forEach((k) => kalemSatiriEkle(k));
    };

    finalMinCheck.addEventListener('change', () => {
        finalMinInput.disabled = !finalMinCheck.checked;
    });

    hedefHarfCheck.addEventListener('change', () => {
        hedefHarfSelect.disabled = !hedefHarfCheck.checked;
    });

    notSistemiSelect.addEventListener('change', harfSecenekleriniGuncelle);

    kalemEkleBtn.addEventListener('click', () => kalemSatiriEkle());
    hesaplaBtn.addEventListener('click', hesapla);
    sifirlaBtn.addEventListener('click', sifirla);

    harfSecenekleriniGuncelle();
    sifirla();
}
