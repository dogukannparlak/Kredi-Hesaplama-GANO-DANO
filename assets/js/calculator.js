import { BASARISIZ_NOTLAR, HESAPLAMA_DISI_NOTLAR } from './config.js';

export const dersGecerliMi = (not) => not && !HESAPLAMA_DISI_NOTLAR.includes(not);

export const tekrarDegeri = (val) => {
    if (typeof val === 'boolean') return val;
    if (!val) return false;
    const s = String(val).toLowerCase().trim();
    return ['evet', 'e', 'true', '1', 'yes', 'x'].includes(s);
};

export const durumDegerlendir = (ortalama) => {
    if (ortalama >= 3.50) return { metin: 'Çok Başarılı!', sinif: 'durum-success' };
    if (ortalama >= 3.00) return { metin: 'Başarılı!', sinif: 'durum-success' };
    if (ortalama >= 2.50) return { metin: 'Orta Düzey', sinif: 'durum-warning' };
    if (ortalama >= 2.00) return { metin: 'Geliştirilmeli', sinif: 'durum-orange' };
    return { metin: 'Kritik Durum', sinif: 'durum-danger' };
};

export const dersHesapla = (dersler, puanlar) => {
    const detaylar = [];
    let toplamPuan = 0;
    let toplamKredi = 0;

    dersler.forEach((d, index) => {
        const ad = d.ad || d.ders || `Ders ${index + 1}`;

        if (!dersGecerliMi(d.not)) {
            detaylar.push(`<li style="color: var(--text-muted)">${ad} (${d.not}, ${d.akts} kredi):  hesaba katılmadı</li>`);
            return;
        }

        const puan = puanlar[d.not];
        if (puan === undefined) {
            detaylar.push(`<li class="text-yellow-400">${ad} (${d.not}):  tanınmayan not</li>`);
            return;
        }

        const satirPuan = puan * d.akts;
        toplamPuan += satirPuan;
        toplamKredi += d.akts;

        if (BASARISIZ_NOTLAR.includes(d.not)) {
            detaylar.push(`<li style="color: var(--danger)">${ad} (${d.not}, ${d.akts} kredi):  başarısız, katıldı</li>`);
        } else {
            detaylar.push(`<li><span class="font-semibold text-white">${ad} (${d.not}):</span> ${puan.toFixed(2)} x ${d.akts} = <span class="font-semibold text-white">${satirPuan.toFixed(2)}</span></li>`);
        }
    });

    return {
        ortalama: toplamKredi > 0 ? toplamPuan / toplamKredi : null,
        toplamPuan,
        toplamKredi,
        detaylar
    };
};

export const ganoHesapla = (oncekiKredi, oncekiGano, dersler, puanlar) => {
    let genelPuan = oncekiKredi * oncekiGano;
    let genelKredi = oncekiKredi;
    const detaylar = [];
    const tekrarDetaylari = [];

    if (oncekiKredi > 0) {
        detaylar.push(`<li style="color: #38bdf8">Önceki dönemler: ${oncekiKredi} kredi x ${oncekiGano.toFixed(2)} = ${genelPuan.toFixed(2)}</li>`);
    }

    dersler.forEach((d, index) => {
        const ad = d.ad || d.ders || `Ders ${index + 1}`;
        if (!dersGecerliMi(d.not)) return;

        const yeniPuan = puanlar[d.not];
        if (yeniPuan === undefined) return;

        if (d.tekrar) {
            if (!d.eskiNot) {
                tekrarDetaylari.push(`<li class="text-yellow-400">${ad}:  tekrar işaretli ama eski not girilmedi</li>`);
                genelPuan += yeniPuan * d.akts;
                genelKredi += d.akts;
                return;
            }
            const eskiPuan = puanlar[d.eskiNot];
            if (eskiPuan === undefined) {
                tekrarDetaylari.push(`<li class="text-yellow-400">${ad}:  tanınmayan eski not: ${d.eskiNot}</li>`);
                return;
            }
            const fark = (yeniPuan - eskiPuan) * d.akts;
            genelPuan += fark;
            tekrarDetaylari.push(`<li style="color: var(--orange)">${ad}: ${d.eskiNot} → ${d.not} (${fark >= 0 ? '+' : ''}${fark.toFixed(2)} puan, kredi sabit)</li>`);
        } else {
            genelPuan += yeniPuan * d.akts;
            genelKredi += d.akts;
        }
    });

    return {
        ortalama: genelKredi > 0 ? genelPuan / genelKredi : null,
        genelPuan,
        genelKredi,
        detaylar,
        tekrarDetaylari
    };
};

export const importSatirNormalize = (row) => {
    const ad = row.ders || row.ad || row.dersAdi || row['Ders Adı'] || row['Ders Adi'] || '';
    const not = row.not || row.harfNotu || row.Not || row['Harf Notu'] || '';
    const akts = row.akts || row.kredi || row.Kredi || row['AKTS'] || '';
    const tekrar = tekrarDegeri(row.tekrar ?? row.tekrarAldim ?? row['Tekrar'] ?? row['Tekrar Aldım']);
    const eskiNot = row.eskiNot || row.eski_not || row['Eski Not'] || row['EskiNot'] || '';
    return { ad, not, akts, tekrar: tekrar || !!eskiNot, eskiNot };
};

export const txtSatirParse = (line) => {
    const p = line.split(',').map(s => s.trim());
    if (p.length >= 5) {
        return { ad: p[0], not: p[1], akts: p[2], tekrar: p[3], eskiNot: p[4] };
    }
    if (p.length === 4 && p[3]) {
        return { ad: p[0], not: p[1], akts: p[2], eskiNot: p[3], tekrar: true };
    }
    return { ad: p[0], not: p[1], akts: p[2] };
};
