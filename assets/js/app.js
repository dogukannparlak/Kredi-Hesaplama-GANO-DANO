import { NOT_SISTEMLERI, varsayilanBasarisizNot } from './config.js';
import {
    dersHesapla,
    ganoHesapla,
    durumDegerlendir,
    importSatirNormalize,
    txtSatirParse
} from './calculator.js';

export function initApp() {
    const dersListesi = document.getElementById('ders-listesi');
    const dersEkleBtn = document.getElementById('ders-ekle-btn');
    const hesaplaBtn = document.getElementById('hesapla-btn');
    const sifirlaBtn = document.getElementById('sifirla-btn');
    const sonucAlani = document.getElementById('sonuc-alani');
    const danoSonuc = document.getElementById('dano-sonuc');
    const ortalamaSonuc = document.getElementById('ortalama-sonuc');
    const yuzdelikSonuc = document.getElementById('yuzdelik-sonuc');
    const durumSonuc = document.getElementById('durum-sonuc');
    const durumKutusu = document.getElementById('durum-kutusu');
    const durumBaslik = document.getElementById('durum-baslik');
    const detayListesi = document.getElementById('detay-listesi');
    const notSistemiSelect = document.getElementById('not-sistemi');
    const oncekiKrediInput = document.getElementById('onceki-kredi');
    const oncekiOrtalamaInput = document.getElementById('onceki-ortalama');
    const donemDersSayisiSelect = document.getElementById('donem-ders-sayisi');
    const fileInput = document.getElementById('file-input');
    const fileSelectBtn = document.getElementById('file-select-btn');
    const selectedFileSpan = document.getElementById('selected-file');

    const harfSecenekleriHtml = (secili = '') => {
        const harfler = NOT_SISTEMLERI[notSistemiSelect.value].harfler;
        return harfler.map(h => `<option value="${h}" ${h === secili ? 'selected' : ''}>${h}</option>`).join('');
    };

    const sonuclariTemizle = () => {
        danoSonuc.textContent = '';
        ortalamaSonuc.textContent = '';
        yuzdelikSonuc.textContent = '';
        durumSonuc.textContent = '';
        durumKutusu.className = 'result-card';
        durumBaslik.className = 'durum-baslik';
        durumSonuc.className = 'durum-metin';
    };

    const tekrarAlaniGuncelle = (satir) => {
        const checkbox = satir.querySelector('.tekrar-checkbox');
        const alan = satir.querySelector('.tekrar-alan');
        if (!checkbox || !alan) return;
        alan.classList.toggle('hidden', !checkbox.checked);
    };

    const satirVerisiOku = (satir) => {
        const tekrar = satir.querySelector('.tekrar-checkbox')?.checked || false;
        return {
            ad: satir.querySelector('.ders-adi')?.value.trim() || '',
            not: satir.querySelector('.harf-notu')?.value || '',
            akts: parseFloat(satir.querySelector('.kredi')?.value),
            tekrar,
            eskiNot: tekrar ? (satir.querySelector('.eski-not')?.value || '') : ''
        };
    };

    const formDersleriniOku = () => {
        return Array.from(document.querySelectorAll('#ders-listesi > div'))
            .map(satirVerisiOku)
            .filter(d => !isNaN(d.akts) && d.akts > 0);
    };

    const dersSatiriEkle = (veri = {}) => {
        const satirDiv = document.createElement('div');
        satirDiv.className = 'glass-row';

        const siraNo = veri.sira ?? (dersListesi.children.length + 1);
        const ad = veri.ad || veri.ders || `Ders ${siraNo}`;
        const not = veri.not || '';
        const akts = veri.akts || veri.kredi || '';
        const tekrar = veri.tekrar || false;
        const eskiNot = veri.eskiNot || (tekrar ? varsayilanBasarisizNot(notSistemiSelect.value) : '');

        satirDiv.innerHTML = `
            <div class="grid-12">
                <div class="col-4">
                    <label class="field-mobile-label">Ders Adı</label>
                    <input type="text" value="${ad}" placeholder="Ders Adı" class="ders-adi glass-input">
                </div>
                <div class="col-2">
                    <label class="field-mobile-label">Not</label>
                    <select class="harf-notu glass-select">${harfSecenekleriHtml(not)}</select>
                </div>
                <div class="col-2">
                    <label class="field-mobile-label">Kredi</label>
                    <input type="number" value="${akts}" placeholder="Kredi" min="0" step="0.5" class="kredi glass-input">
                </div>
                <div class="col-3 tekrar-row">
                    <input type="checkbox" class="tekrar-checkbox" ${tekrar ? 'checked' : ''}>
                    <label class="tekrar-label">Bu dersi tekrar aldım</label>
                </div>
                <div class="col-1">
                    <button type="button" class="sil-btn btn-sm-danger">Sil</button>
                </div>
            </div>
            <div class="tekrar-alan grid-12 ${tekrar ? '' : 'hidden'}" style="margin-top: var(--space-sm);">
                <div class="col-4 col-start-5">
                    <label class="field-mobile-label" style="color: var(--accent-tekrar);">Eski Not</label>
                    <select class="eski-not glass-select tekrar-select">${harfSecenekleriHtml(eskiNot)}</select>
                </div>
            </div>
        `;

        const checkbox = satirDiv.querySelector('.tekrar-checkbox');
        const label = satirDiv.querySelector('.tekrar-label');
        const id = `tekrar-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        checkbox.id = id;
        label.setAttribute('for', id);

        satirDiv.querySelector('.sil-btn').addEventListener('click', () => satirDiv.remove());
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                const eskiSelect = satirDiv.querySelector('.eski-not');
                if (eskiSelect) {
                    eskiSelect.value = varsayilanBasarisizNot(notSistemiSelect.value);
                }
            }
            tekrarAlaniGuncelle(satirDiv);
        });

        dersListesi.appendChild(satirDiv);
    };

    const processImportedData = (data) => {
        dersListesi.innerHTML = '';
        const basarisiz = varsayilanBasarisizNot(notSistemiSelect.value);
        data.forEach((row) => {
            const normalized = importSatirNormalize(row);
            if (normalized.tekrar && !normalized.eskiNot) {
                normalized.eskiNot = basarisiz;
            }
            dersSatiriEkle(normalized);
        });
        if (data.length > 0) donemDersSayisiSelect.value = String(data.length);
        sonucAlani.classList.remove('goster');
        sonuclariTemizle();
    };

    const ortalamaHesapla = () => {
        const puanlar = NOT_SISTEMLERI[notSistemiSelect.value].puanlar;
        const formDersleri = formDersleriniOku();

        if (formDersleri.length === 0) {
            alert('Lütfen en az bir ders ekleyin veya dosyadan yükleyin.');
            return;
        }

        const danoSonucu = dersHesapla(formDersleri, puanlar);
        const oncekiKredi = parseFloat(oncekiKrediInput.value) || 0;
        const oncekiGano = parseFloat(oncekiOrtalamaInput.value) || 0;
        const ganoSonucu = ganoHesapla(oncekiKredi, oncekiGano, formDersleri, puanlar);

        danoSonuc.textContent = danoSonucu.ortalama !== null ? danoSonucu.ortalama.toFixed(2) : 'N/A';

        if (ganoSonucu.ortalama !== null) {
            ortalamaSonuc.textContent = ganoSonucu.ortalama.toFixed(2);
            yuzdelikSonuc.textContent = `${((ganoSonucu.ortalama / 4) * 100).toFixed(1)}%`;
            const durum = durumDegerlendir(ganoSonucu.ortalama);
            durumSonuc.textContent = durum.metin;
            durumKutusu.className = `result-card ${durum.sinif}`;
            durumBaslik.className = 'durum-baslik';
            durumSonuc.className = 'durum-metin';
        } else {
            ortalamaSonuc.textContent = 'N/A';
            yuzdelikSonuc.textContent = 'N/A';
            durumSonuc.textContent = 'Geçerli veri yok';
        }

        let detaylarHTML = ganoSonucu.detaylar.join('') + danoSonucu.detaylar.join('');
        if (ganoSonucu.tekrarDetaylari.length > 0) {
            detaylarHTML += `<li class="detail-divider detail-accent">Tekrar ders düzeltmeleri:</li>`;
            detaylarHTML += ganoSonucu.tekrarDetaylari.join('');
        }
        if (danoSonucu.toplamKredi > 0) {
            detaylarHTML += `<li class="detail-divider detail-info">Dönem özeti: ${danoSonucu.toplamKredi} AKTS, DANO = ${danoSonuc.textContent}</li>`;
        }

        detayListesi.innerHTML = detaylarHTML;
        sonucAlani.classList.add('goster');
        sonucAlani.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const sayfayiSifirla = () => {
        dersListesi.innerHTML = '';
        sonucAlani.classList.remove('goster');
        sonuclariTemizle();
        oncekiKrediInput.value = '';
        oncekiOrtalamaInput.value = '';
        donemDersSayisiSelect.value = '';
        fileInput.value = '';
        selectedFileSpan.textContent = '';
        dersSatiriEkle({ sira: 1 });
        dersSatiriEkle({ sira: 2 });
        dersSatiriEkle({ sira: 3 });
    };

    notSistemiSelect.addEventListener('change', () => {
        const sistem = notSistemiSelect.value;
        const yeniBasarisiz = varsayilanBasarisizNot(sistem);
        document.querySelectorAll('#ders-listesi > div').forEach((satir) => {
            satir.querySelectorAll('.harf-notu, .eski-not').forEach((select) => {
                const mevcut = select.value;
                select.innerHTML = NOT_SISTEMLERI[sistem].harfler
                    .map(h => `<option value="${h}" ${h === mevcut ? 'selected' : ''}>${h}</option>`).join('');
                if (!NOT_SISTEMLERI[sistem].harfler.includes(mevcut)) {
                    if (select.classList.contains('eski-not') && satir.querySelector('.tekrar-checkbox')?.checked) {
                        select.value = yeniBasarisiz;
                    } else {
                        select.selectedIndex = 0;
                    }
                }
            });
        });
    });

    donemDersSayisiSelect.addEventListener('change', () => {
        const sayi = parseInt(donemDersSayisiSelect.value, 10);
        if (!sayi) return;
        dersListesi.innerHTML = '';
        for (let i = 0; i < sayi; i++) dersSatiriEkle({ sira: i + 1 });
        sonucAlani.classList.remove('goster');
        sonuclariTemizle();
    });

    fileSelectBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        selectedFileSpan.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = ev.target.result;
            try {
                if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(data);
                    const liste = Array.isArray(parsed) ? parsed : (parsed.dersler || []);
                    if (!Array.isArray(liste) || liste.length === 0) {
                        alert('JSON geçersiz: dizi veya { "dersler": [...] } bekleniyor.');
                        return;
                    }
                    processImportedData(liste);
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    const wb = XLSX.read(data, { type: 'binary' });
                    const sheet = wb.Sheets[wb.SheetNames[0]];
                    processImportedData(XLSX.utils.sheet_to_json(sheet));
                } else if (file.name.endsWith('.txt')) {
                    const lines = data.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    const jsonData = lines
                        .filter((line, i) => {
                            if (i !== 0) return true;
                            const lower = line.toLowerCase();
                            return !(lower.includes('ders') && lower.includes('not'));
                        })
                        .map(txtSatirParse)
                        .filter(r => r.not && r.akts);
                    processImportedData(jsonData);
                }
            } catch (err) {
                alert('Dosya okunamadı: ' + err.message);
            }
        };

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) reader.readAsBinaryString(file);
        else reader.readAsText(file);
    });

    dersEkleBtn.addEventListener('click', () => dersSatiriEkle());
    hesaplaBtn.addEventListener('click', ortalamaHesapla);
    sifirlaBtn.addEventListener('click', sayfayiSifirla);

    sayfayiSifirla();
}
