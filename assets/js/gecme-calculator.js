export function toplamAgirlik(kalemler) {
    return kalemler.reduce((s, k) => s + (Number(k.agirlik) || 0), 0);
}

export function puanToHarf(puan, notSistemi, esikler) {
    const liste = esikler[notSistemi];
    if (!liste || puan == null || Number.isNaN(Number(puan))) return null;

    const sayi = Number(puan);
    for (const { harf, min } of liste) {
        if (sayi >= min) return harf;
    }
    return liste[liste.length - 1]?.harf ?? null;
}

export function harfMinPuan(harf, notSistemi, esikler) {
    const entry = esikler[notSistemi]?.find((e) => e.harf === harf);
    return entry?.min ?? null;
}

export function harfGecti(harf, basarisizNotlar) {
    return harf != null && !basarisizNotlar.includes(harf);
}

function kalemdeGerekliPuan(kalemler, kalem, hedefToplam) {
    const mevcut = mevcutAgirlikliPuan(kalemler);
    const agirlik = Number(kalem.agirlik);
    if (!agirlik || agirlik <= 0) return null;

    const kalemPuan = puanGirildi(kalem) ? Number(kalem.puan) : null;
    const kalemKatkisi = kalemPuan != null ? (agirlik / 100) * kalemPuan : 0;
    const diger = mevcut - kalemKatkisi;
    const gerekli = (hedefToplam - diger) / (agirlik / 100);
    const eksik = kalemPuan != null ? Math.max(gerekli - kalemPuan, 0) : gerekli;

    return { gerekli, eksik, kalemPuan };
}

function hedefKalemIhtiyacMesaji(hedefHarf, kalemAdi, { gerekli, eksik, kalemPuan }) {
    if (gerekli == null || Number.isNaN(gerekli)) return '';
    if (gerekli > 100) {
        return `${hedefHarf} ile geçmek mümkün görünmüyor; ${kalemAdi}den ${gerekli.toFixed(2)} gerekir (100'ü aşıyor).`;
    }
    if (kalemPuan != null) {
        return `${hedefHarf} ile geçmek için ${kalemAdi}den ${eksik.toFixed(2)} puan daha alman gerekiyor (${gerekli.toFixed(2)}).`;
    }
    return `${hedefHarf} ile geçmek için ${kalemAdi}den en az ${gerekli.toFixed(2)} alman gerekiyor.`;
}

function kisaKalemMesaji({ gerekli, eksik, kalemPuan }) {
    if (gerekli == null || gerekli > 100) return null;
    if (kalemPuan != null) {
        return `${eksik.toFixed(2)} puan daha lazım (${gerekli.toFixed(2)})`;
    }
    return `En az ${gerekli.toFixed(2)} gerekli`;
}

function hedefKalemSec(kalemler, hedefIndex) {
    if (hedefIndex != null && kalemler[hedefIndex]) {
        return { kalem: kalemler[hedefIndex], index: hedefIndex };
    }
    return finalKalemiBul(kalemler);
}

function hedefHarfMesajiOlustur({
    hedefHarf,
    hedefMin,
    puan,
    harfNotu,
    durum,
    gerekliFinal,
    hedefKalemAdi,
    mevcutPuan,
    finalMinGecti,
    finalMinAktif,
    kalemler,
    hedefKalem
}) {
    if (!hedefHarf || hedefMin == null) {
        return { mesaj: '', gecti: false };
    }

    const p = Number(puan);
    const fark = p - hedefMin;
    const kalem = hedefKalem || kalemler?.find((k) => k.ad === hedefKalemAdi);
    const kalemIhtiyac = kalem ? kalemdeGerekliPuan(kalemler, kalem, hedefMin) : null;

    if (durum === 'geciyor') {
        return {
            mesaj: `${hedefHarf} hedefini şimdiden karşılıyorsun, mevcut ağırlıklı katkın ${Number(mevcutPuan).toFixed(2)}.`,
            gecti: true
        };
    }

    if (durum === 'hesaplandi') {
        const harfIhtiyac = kalem && kalemler ? kalemdeGerekliPuan(kalemler, kalem, hedefMin) : null;
        if (harfIhtiyac) {
            return {
                mesaj: hedefKalemIhtiyacMesaji(hedefHarf, hedefKalemAdi, harfIhtiyac),
                gecti: false
            };
        }
    }

    if (durum === 'imkansiz') {
        const harfIhtiyac = kalem && kalemler ? kalemdeGerekliPuan(kalemler, kalem, hedefMin) : null;
        const gerekli = harfIhtiyac?.gerekli ?? gerekliFinal;
        if (gerekli != null) {
            return {
                mesaj: `${hedefHarf} ile geçmek mümkün görünmüyor; ${hedefKalemAdi}den ${gerekli.toFixed(2)} gerekir (100'ü aşıyor).`,
                gecti: false
            };
        }
    }

    if (durum === 'gecildi') {
        if (finalMinAktif && finalMinGecti === false) {
            return {
                mesaj: `${hedefHarf} harf hedefini karşılıyorsun; ancak final minimum şartını sağlamıyorsun.`,
                gecti: false
            };
        }
        if (p < hedefMin) {
            const harfIhtiyac = kalem && kalemler ? kalemdeGerekliPuan(kalemler, kalem, hedefMin) : null;
            if (harfIhtiyac) {
                return {
                    mesaj: hedefKalemIhtiyacMesaji(hedefHarf, hedefKalemAdi, harfIhtiyac),
                    gecti: false
                };
            }
        }
        if (fark > 0.01) {
            const harfBilgi = harfNotu && harfNotu !== hedefHarf ? `${harfNotu} (${p.toFixed(2)})` : p.toFixed(2);
            return {
                mesaj: `${hedefHarf} hedefinin üzerinde geçiyorsun: ${harfBilgi} (+${fark.toFixed(2)} puan fark).`,
                gecti: true
            };
        }
        return {
            mesaj: `${hedefHarf} ile geçiyorsun, ağırlıklı toplamın ${p.toFixed(2)}.`,
            gecti: true
        };
    }

    if (durum === 'kalindi') {
        if (p >= hedefMin && finalMinAktif && finalMinGecti === false) {
            return {
                mesaj: `${hedefHarf} harf hedefini karşılıyorsun; ancak final minimum şartını sağlamıyorsun.`,
                gecti: false
            };
        }
        const harfIhtiyac = kalem && kalemler ? kalemdeGerekliPuan(kalemler, kalem, hedefMin) : kalemIhtiyac;
        if (harfIhtiyac) {
            return {
                mesaj: hedefKalemIhtiyacMesaji(hedefHarf, hedefKalemAdi, harfIhtiyac),
                gecti: false
            };
        }
    }

    return { mesaj: '', gecti: false };
}

function gecmeKalemIhtiyacMesaji(kalemAdi, ihtiyac) {
    if (!ihtiyac || ihtiyac.gerekli > 100) return '';
    if (ihtiyac.kalemPuan != null) {
        return `Geçmek için ${kalemAdi}den ${ihtiyac.eksik.toFixed(2)} puan daha alman gerekiyor (${ihtiyac.gerekli.toFixed(2)}).`;
    }
    return `Geçmek için ${kalemAdi}den en az ${ihtiyac.gerekli.toFixed(2)} alman gerekiyor.`;
}

function finalMinIhtiyacMesaji(kalemAdi, finalPuan, finalMinNot) {
    const min = Number(finalMinNot);
    const puan = Number(finalPuan);
    if (Number.isNaN(min) || Number.isNaN(puan)) return null;

    const eksik = Math.max(min - puan, 0);
    if (eksik <= 0) return null;

    return `${kalemAdi} notun ${puan.toFixed(2)}; en az ${min.toFixed(2)} olmalı — ${eksik.toFixed(2)} puan eksik.`;
}

function finalMinToplamGectiAciklamasi(harfNotu, toplamPuan, kalemAdi, finalPuan, finalMinNot) {
    const min = Number(finalMinNot);
    const puan = Number(finalPuan);
    const eksik = Math.max(min - puan, 0);
    if (eksik <= 0) return null;

    return `Ağırlıklı ortalaman ${Number(toplamPuan).toFixed(2)} (${harfNotu}) geçmeye yetiyor. `
        + `Ancak ${kalemAdi}'den en az ${min.toFixed(2)} alman şart; `
        + `girdiğin ${puan.toFixed(2)}, ${eksik.toFixed(2)} puan eksik.`;
}

function finalMinKisaMesaj(finalPuan, finalMinNot) {
    const eksik = Math.max(Number(finalMinNot) - Number(finalPuan), 0);
    if (eksik <= 0) return null;
    return `Min. ${Number(finalMinNot).toFixed(0)} için ${eksik.toFixed(2)} puan eksik`;
}

function harfKartAciklamasi(harfNotu, puan, ekMesaj) {
    const temel = `Seçilen sisteme göre ${harfNotu} (${Number(puan).toFixed(2)})`;
    return ekMesaj ? `${temel}. ${ekMesaj}` : `${temel}.`;
}

function harfBilgisiEkle(sonuc, {
    puan,
    notSistemi,
    esikler,
    basarisizNotlar,
    hedefHarf,
    hedefHarfAktif,
    finalMinAktif,
    finalMinNot,
    finalPuan,
    finalMinGecti = true,
    kalemler,
    hedefKalem
}) {
    const harfNotu = puanToHarf(puan, notSistemi, esikler);
    const harfBasarili = harfGecti(harfNotu, basarisizNotlar);
    const hedefMin = hedefHarfAktif && hedefHarf ? harfMinPuan(hedefHarf, notSistemi, esikler) : null;
    const hedefKarsiladi = hedefMin == null || Number(puan) >= hedefMin;
    const finalSartiSaglandi = !finalMinAktif || finalMinGecti !== false;
    const gecmeNotu = sonuc.gecmeNotu;
    const toplamGecti = Number(puan) >= gecmeNotu;
    const eksikToplam = Math.max(gecmeNotu - Number(puan), 0);
    const kalem = hedefKalem || kalemler?.find((k) => k.ad === sonuc.hedefKalemAdi);

    let hedefHarfMesaji = '';
    let hedefHarfGecti = false;
    if (hedefHarfAktif && hedefHarf) {
        const hedefSonuc = hedefHarfMesajiOlustur({
            hedefHarf,
            hedefMin,
            puan,
            harfNotu,
            durum: sonuc.durum,
            gerekliFinal: sonuc.gerekliFinal,
            hedefKalemAdi: sonuc.hedefKalemAdi,
            mevcutPuan: sonuc.mevcutPuan,
            finalMinGecti,
            finalMinAktif,
            kalemler,
            hedefKalem: kalem
        });
        hedefHarfMesaji = hedefSonuc.mesaj;
        hedefHarfGecti = hedefSonuc.gecti;
        if (hedefMin != null && hedefMin > gecmeNotu && hedefHarfMesaji) {
            hedefHarfMesaji += ` (Ana hesap geçme notuna göre; ${hedefHarf} için ${hedefMin} gerekir.)`;
        }
    }

    let harfAciklama = '';
    if (harfNotu != null) {
        if (hedefHarfAktif && hedefHarf && !hedefKarsiladi && kalem && kalemler && hedefMin != null) {
            const harfIhtiyac = kalemdeGerekliPuan(kalemler, kalem, hedefMin);
            harfAciklama = harfKartAciklamasi(
                harfNotu,
                puan,
                harfIhtiyac ? hedefKalemIhtiyacMesaji(hedefHarf, sonuc.hedefKalemAdi, harfIhtiyac) : ''
            );
        } else if (hedefHarfAktif && hedefHarf && hedefHarfMesaji && hedefHarfGecti) {
            harfAciklama = `Seçilen sisteme göre ${hedefHarf} (${Number(puan).toFixed(2)}) ile dersi geçiyorsun.`;
        } else if (hedefHarfAktif && hedefHarf && hedefHarfMesaji && !hedefHarfGecti) {
            harfAciklama = harfKartAciklamasi(harfNotu, puan, hedefHarfMesaji);
        } else if (!toplamGecti) {
            const gecmeIhtiyac = kalem && kalemler ? kalemdeGerekliPuan(kalemler, kalem, gecmeNotu) : null;
            const gecmeMesaj = gecmeIhtiyac ? gecmeKalemIhtiyacMesaji(sonuc.hedefKalemAdi, gecmeIhtiyac) : null;
            harfAciklama = harfKartAciklamasi(harfNotu, puan, gecmeMesaj || `Geçmek için ${gecmeNotu} gerekir (${eksikToplam.toFixed(2)} puan eksik).`);
            if (finalMinAktif && finalMinGecti === false && finalPuan != null) {
                const finalKalem = kalemler ? finalKalemiBul(kalemler).kalem : null;
                const finalMesaj = finalKalem
                    ? finalMinIhtiyacMesaji(finalKalem.ad, finalPuan, finalMinNot)
                    : null;
                if (finalMesaj) {
                    harfAciklama += ` ${finalMesaj}`;
                }
            }
        } else if (finalMinAktif && finalMinGecti === false && finalPuan != null) {
            const finalKalem = kalemler ? finalKalemiBul(kalemler).kalem : null;
            const finalMesaj = finalKalem
                ? finalMinToplamGectiAciklamasi(harfNotu, puan, finalKalem.ad, finalPuan, finalMinNot)
                : null;
            harfAciklama = finalMesaj || harfKartAciklamasi(
                harfNotu,
                puan,
                `Finalden en az ${finalMinNot} alman gerekiyor (girdiğin: ${Number(finalPuan).toFixed(2)}).`
            );
        } else if (harfBasarili && hedefKarsiladi && finalSartiSaglandi) {
            harfAciklama = `Seçilen sisteme göre ${hedefHarfAktif && hedefHarf ? hedefHarf : harfNotu} (${Number(puan).toFixed(2)}) ile dersi geçiyorsun.`;
        } else if (!harfBasarili) {
            const gecmeIhtiyac = kalem && kalemler ? kalemdeGerekliPuan(kalemler, kalem, gecmeNotu) : null;
            harfAciklama = harfKartAciklamasi(
                harfNotu,
                puan,
                gecmeIhtiyac ? gecmeKalemIhtiyacMesaji(sonuc.hedefKalemAdi, gecmeIhtiyac) : 'Geçme eşiğinin altında kalırsın.'
            );
        } else {
            harfAciklama = harfKartAciklamasi(harfNotu, puan, '');
        }
    }

    return {
        ...sonuc,
        harfNotu,
        harfGecti: harfBasarili && hedefKarsiladi && finalSartiSaglandi && toplamGecti,
        harfAciklama,
        hedefHarf: hedefHarfAktif ? hedefHarf : null,
        hedefHarfMesaji,
        hedefHarfGecti
    };
}

export function mevcutAgirlikliPuan(kalemler) {
    return kalemler
        .filter((k) => k.puan !== null && k.puan !== '' && !Number.isNaN(Number(k.puan)))
        .reduce((s, k) => s + (Number(k.agirlik) / 100) * Number(k.puan), 0);
}

function isFinalAd(ad) {
    return /final/i.test(ad || '');
}

function puanGirildi(k) {
    return k.puan !== null && k.puan !== '' && !Number.isNaN(Number(k.puan));
}

function finalMinGecerliMi(finalMinAktif, finalMinNot) {
    return finalMinAktif
        && finalMinNot != null
        && !Number.isNaN(Number(finalMinNot))
        && Number(finalMinNot) >= 0
        && Number(finalMinNot) <= 100;
}

function finalMinHedefeUygula(hedefKalem, gerekli, finalMinAktif, finalMinNot) {
    if (!finalMinGecerliMi(finalMinAktif, finalMinNot) || !isFinalAd(hedefKalem.ad)) {
        return { gerekli, uygulandi: false };
    }
    const min = Number(finalMinNot);
    if (gerekli < min) {
        return { gerekli: min, uygulandi: true };
    }
    return { gerekli, uygulandi: false };
}

function bosFinalMinMesaji(kalemler, hedefKalem, finalMinAktif, finalMinNot) {
    if (!finalMinGecerliMi(finalMinAktif, finalMinNot)) return null;

    const { kalem: finalKalem } = finalKalemiBul(kalemler);
    if (!finalKalem || puanGirildi(finalKalem) || isFinalAd(hedefKalem.ad)) {
        return null;
    }

    const min = Number(finalMinNot);
    return `Final minimum şartı: ${finalKalem.ad}'den en az ${min.toFixed(2)} alman gerekiyor.`;
}

function gecmeGirdileriniDogrula({ gecmeNotu, finalMinAktif, finalMinNot, kalemler }) {
    const gecme = Number(gecmeNotu);
    if (gecmeNotu == null || Number.isNaN(gecme) || gecme < 0 || gecme > 100) {
        return 'Geçme notu 0–100 arasında olmalı.';
    }

    if (finalMinAktif) {
        const fMin = Number(finalMinNot);
        if (finalMinNot == null || Number.isNaN(fMin) || fMin < 0 || fMin > 100) {
            return 'Final minimum notu 0–100 arasında olmalı.';
        }
    }

    for (let i = 0; i < kalemler.length; i++) {
        const k = kalemler[i];
        const ad = k.ad || `Kalem ${i + 1}`;
        const agirlik = Number(k.agirlik);
        if (Number.isNaN(agirlik) || agirlik < 0) {
            return `${ad}: ağırlık geçersiz.`;
        }
        if (puanGirildi(k)) {
            const puan = Number(k.puan);
            if (puan < 0 || puan > 100) {
                return `${ad}: not 0–100 arasında olmalı.`;
            }
        }
    }

    return null;
}

function sonucaFinalMinMesajiEkle(sonuc, mesaj) {
    if (!mesaj) return sonuc;
    return {
        ...sonuc,
        finalMinMesaji: mesaj,
        aciklama: sonuc.aciklama ? `${sonuc.aciklama} ${mesaj}` : mesaj
    };
}

export function finalKalemiBul(kalemler) {
    const finals = kalemler.filter((k) => isFinalAd(k.ad));
    if (finals.length === 1) return { kalem: finals[0], index: kalemler.indexOf(finals[0]) };
    if (finals.length > 1) {
        const kalem = finals[finals.length - 1];
        return { kalem, index: kalemler.indexOf(kalem) };
    }
    const index = kalemler.length - 1;
    return { kalem: kalemler[index], index };
}

function tamDoluGecmeDegerlendir({ gecmeNotu, finalMinAktif, finalMinNot, kalemler, notSistemi, esikler, basarisizNotlar, hedefHarf, hedefHarfAktif, hedefIndex }) {
    const etkinGecme = gecmeNotu;
    const mevcut = mevcutAgirlikliPuan(kalemler);
    const { kalem: hedefKalem, index: hedefKalemIndex } = hedefKalemSec(kalemler, hedefIndex);
    const { kalem: finalKalem, index: finalKalemIndex } = finalKalemiBul(kalemler);
    const hedefKalemPuan = Number(hedefKalem.puan);
    const finalPuan = Number(finalKalem.puan);
    const fark = mevcut - etkinGecme;
    const toplamGecti = mevcut >= etkinGecme;

    let finalMinGecti = true;
    if (finalMinGecerliMi(finalMinAktif, finalMinNot)) {
        finalMinGecti = finalPuan >= Number(finalMinNot);
    }

    const gecti = toplamGecti && finalMinGecti;
    const girilenDetay = kalemler
        .filter(puanGirildi)
        .map((k) => `${k.ad}: ${k.puan} × %${k.agirlik} = ${((Number(k.agirlik) / 100) * Number(k.puan)).toFixed(2)}`)
        .join('; ');

    let aciklama = '';
    let kisaMesaj = '';
    const kalemIhtiyac = kalemdeGerekliPuan(kalemler, hedefKalem, etkinGecme);
    const durumIndex = !finalMinGecti && finalMinGecerliMi(finalMinAktif, finalMinNot)
        ? finalKalemIndex
        : hedefKalemIndex;
    const finalMinKaynakli = !finalMinGecti && toplamGecti && finalMinGecerliMi(finalMinAktif, finalMinNot);
    const gosterAd = finalMinKaynakli ? finalKalem.ad : hedefKalem.ad;
    const gosterPuan = finalMinKaynakli ? finalPuan : hedefKalemPuan;

    if (gecti) {
        kisaMesaj = fark > 0.01
            ? `Bu notla geçersin (+${fark.toFixed(2)} puan fark)`
            : 'Bu notla geçersin';
        aciklama = `${hedefKalem.ad} notun (${hedefKalemPuan}) ile ağırlıklı toplamın ${mevcut.toFixed(2)}. Geçme notu ${etkinGecme}. ${kisaMesaj}.`;
    } else if (!toplamGecti) {
        kisaMesaj = kisaKalemMesaji(kalemIhtiyac) || `${(etkinGecme - mevcut).toFixed(2)} puan daha lazım`;
        aciklama = `${hedefKalem.ad} notun (${hedefKalemPuan}) ile ağırlıklı toplamın ${mevcut.toFixed(2)}. Geçmek için ${etkinGecme} gerekir. ${kisaMesaj}.`;
    } else {
        const eksikFinal = Number(finalMinNot) - finalPuan;
        kisaMesaj = finalMinKisaMesaj(finalPuan, finalMinNot) || `${eksikFinal.toFixed(2)} puan daha lazım`;
        aciklama = `Ağırlıklı toplamın ${mevcut.toFixed(2)} ile geçme notunu karşılıyorsun; ancak ${finalKalem.ad}'den en az ${finalMinNot} alman gerekiyor. Girdiğin ${finalKalem.ad} notu ${finalPuan}. ${kisaMesaj}.`;
    }

    if (girilenDetay) {
        aciklama += ` Kalemler: ${girilenDetay}.`;
    }

    return harfBilgisiEkle({
        durum: gecti ? 'gecildi' : 'kalindi',
        mevcutPuan: mevcut,
        gecmeNotu: etkinGecme,
        fark,
        finalPuan,
        finalIndex: durumIndex,
        finalKalemAdi: finalKalem.ad,
        hedefKalemAdi: gosterAd,
        girilenPuan: gosterPuan,
        girilenIndex: durumIndex,
        hedefAgirlik: hedefKalem.agirlik,
        gerekliFinal: hedefKalemPuan,
        kisaMesaj,
        aciklama
    }, {
        puan: mevcut,
        notSistemi,
        esikler,
        basarisizNotlar,
        hedefHarf,
        hedefHarfAktif,
        finalMinAktif,
        finalMinNot,
        finalPuan,
        finalMinGecti,
        kalemler,
        hedefKalem
    });
}

export function hedefKalemiBul(kalemler, hedefIndex) {
    const bos = kalemler.filter((k) => !puanGirildi(k));

    if (hedefIndex != null && kalemler[hedefIndex] && !puanGirildi(kalemler[hedefIndex])) {
        return { index: hedefIndex, kalem: kalemler[hedefIndex] };
    }

    const finalBos = bos.filter((k) => isFinalAd(k.ad));
    if (finalBos.length === 1) {
        const idx = kalemler.indexOf(finalBos[0]);
        return { index: idx, kalem: finalBos[0] };
    }

    if (bos.length === 1) {
        const idx = kalemler.indexOf(bos[0]);
        return { index: idx, kalem: bos[0] };
    }

    if (bos.length > 1) {
        return { error: 'Birden fazla boş kalem var. Hedef kalem seçin (radio).' };
    }

    return { error: 'Henüz girilmemiş kalem yok. En az bir kalemin puanını boş bırakın.' };
}

export function gecmeHesapla({
    gecmeNotu,
    finalMinAktif,
    finalMinNot,
    kalemler,
    hedefIndex,
    notSistemi = 'sistem1',
    esikler,
    basarisizNotlar,
    hedefHarf,
    hedefHarfAktif
}) {
    const etkinGecme = gecmeNotu;
    const harfOpts = { notSistemi, esikler, basarisizNotlar, hedefHarf, hedefHarfAktif, finalMinAktif, finalMinNot, kalemler };

    const dogrulamaHatasi = gecmeGirdileriniDogrula({ gecmeNotu, finalMinAktif, finalMinNot, kalemler });
    if (dogrulamaHatasi) {
        return {
            durum: 'hata',
            mesaj: dogrulamaHatasi,
            mevcutPuan: mevcutAgirlikliPuan(kalemler),
            gecmeNotu: etkinGecme
        };
    }

    const toplam = toplamAgirlik(kalemler);
    if (Math.abs(toplam - 100) > 0.01) {
        return {
            durum: 'hata',
            mesaj: `Toplam ağırlık %${toplam.toFixed(1)}; %100 olmalı.`,
            mevcutPuan: mevcutAgirlikliPuan(kalemler),
            gecmeNotu: etkinGecme
        };
    }

    const mevcut = mevcutAgirlikliPuan(kalemler);
    const tumDolu = kalemler.length > 0 && kalemler.every(puanGirildi);

    if (tumDolu) {
        return tamDoluGecmeDegerlendir({
            gecmeNotu,
            finalMinAktif,
            finalMinNot,
            kalemler,
            notSistemi,
            esikler,
            basarisizNotlar,
            hedefHarf,
            hedefHarfAktif,
            hedefIndex
        });
    }

    const hedef = hedefKalemiBul(kalemler, hedefIndex);

    if (hedef.error) {
        return { durum: 'hata', mesaj: hedef.error, mevcutPuan: mevcut, gecmeNotu: etkinGecme };
    }

    const hedefKalem = hedef.kalem;
    if (hedefKalem.agirlik <= 0) {
        return {
            durum: 'hata',
            mesaj: 'Hedef kalemin ağırlığı 0 olamaz.',
            mevcutPuan: mevcut,
            gecmeNotu: etkinGecme
        };
    }

    const kalan = etkinGecme - mevcut;
    const agirlikliGerekli = (kalan / hedefKalem.agirlik) * 100;

    let gerekli = agirlikliGerekli;
    const { gerekli: gerekliFinalMin, uygulandi: finalMinUygulandi } = finalMinHedefeUygula(
        hedefKalem,
        gerekli,
        finalMinAktif,
        finalMinNot
    );
    gerekli = gerekliFinalMin;

    const girilenDetay = kalemler
        .filter(puanGirildi)
        .map((k) => `${k.ad}: ${k.puan} × %${k.agirlik} = ${((Number(k.agirlik) / 100) * Number(k.puan)).toFixed(2)}`)
        .join('; ');

    const paralelFinalMin = bosFinalMinMesaji(kalemler, hedefKalem, finalMinAktif, finalMinNot);

    if (gerekli <= 0) {
        const finalMinGerekli = finalMinGecerliMi(finalMinAktif, finalMinNot) && isFinalAd(hedefKalem.ad)
            ? Number(finalMinNot)
            : 0;

        if (finalMinGerekli > 0) {
            let aciklama = `Mevcut ağırlıklı puanınız (${mevcut.toFixed(2)}) geçme notunu (${etkinGecme}) karşılıyor.`;
            if (girilenDetay) {
                aciklama += ` ${girilenDetay}.`;
            }
            aciklama += ` Ancak ${hedefKalem.ad} henüz girilmedi; final minimum şartı nedeniyle en az ${finalMinGerekli.toFixed(2)} alman gerekiyor.`;

            const projeksiyonPuan = mevcut + (hedefKalem.agirlik / 100) * finalMinGerekli;
            const sonuc = harfBilgisiEkle({
                durum: 'hesaplandi',
                mevcutPuan: mevcut,
                gecmeNotu: etkinGecme,
                gerekliFinal: finalMinGerekli,
                hedefKalemAdi: hedefKalem.ad,
                hedefAgirlik: hedefKalem.agirlik,
                aciklama
            }, { puan: projeksiyonPuan, ...harfOpts, hedefKalem: hedef.kalem });

            return sonucaFinalMinMesajiEkle(sonuc, paralelFinalMin);
        }

        let aciklama = `Mevcut ağırlıklı puanınız (${mevcut.toFixed(2)}) geçme notunu (${etkinGecme}) karşılıyor.`;
        if (girilenDetay) {
            aciklama += ` ${girilenDetay}.`;
        }
        aciklama += ` ${hedefKalem.ad} henüz girilmedi; 0 alsanız bile geçersiniz.`;

        const sonuc = harfBilgisiEkle({
            durum: 'geciyor',
            mevcutPuan: mevcut,
            gecmeNotu: etkinGecme,
            gerekliFinal: 0,
            hedefKalemAdi: hedefKalem.ad,
            hedefAgirlik: hedefKalem.agirlik,
            aciklama
        }, { puan: mevcut, ...harfOpts, hedefKalem: hedef.kalem });

        return sonucaFinalMinMesajiEkle(sonuc, paralelFinalMin);
    }

    if (gerekli > 100) {
        const projeksiyon = mevcut + (hedefKalem.agirlik / 100) * 100;
        const sonuc = harfBilgisiEkle({
            durum: 'imkansiz',
            mevcutPuan: mevcut,
            gecmeNotu: etkinGecme,
            gerekliFinal: gerekli,
            hedefKalemAdi: hedefKalem.ad,
            hedefAgirlik: hedefKalem.agirlik,
            aciklama: `Mevcut katkı: ${mevcut.toFixed(2)}. ${hedefKalem.ad} (%${hedefKalem.agirlik}) en az ${gerekli.toFixed(2)} gerekir (100'ün üstünde, ders geçilemez).`
        }, { puan: projeksiyon, ...harfOpts, hedefKalem: hedef.kalem });

        return sonucaFinalMinMesajiEkle(sonuc, paralelFinalMin);
    }

    let aciklama = '';
    if (girilenDetay) {
        aciklama += `Girilen kalemler: ${girilenDetay}. `;
    }
    aciklama += `Mevcut ağırlıklı puan: ${mevcut.toFixed(2)}. Geçmek için toplam ${etkinGecme} gerekir → kalan ${Math.max(kalan, 0).toFixed(2)} puan ${hedefKalem.ad} ile kapanmalı: ${Math.max(kalan, 0).toFixed(2)} ÷ (${hedefKalem.agirlik}/100) = ${agirlikliGerekli.toFixed(2)}.`;
    if (finalMinUygulandi) {
        aciklama += ` Final minimum şartı (${finalMinNot}) nedeniyle gereken not ${gerekli.toFixed(2)}'ye yükseltildi.`;
    }

    const projeksiyonPuan = mevcut + (hedefKalem.agirlik / 100) * gerekli;

    const sonuc = harfBilgisiEkle({
        durum: 'hesaplandi',
        mevcutPuan: mevcut,
        gecmeNotu: etkinGecme,
        gerekliFinal: gerekli,
        hedefKalemAdi: hedefKalem.ad,
        hedefAgirlik: hedefKalem.agirlik,
        aciklama
    }, { puan: projeksiyonPuan, ...harfOpts, hedefKalem: hedef.kalem });

    return sonucaFinalMinMesajiEkle(sonuc, paralelFinalMin);
}
