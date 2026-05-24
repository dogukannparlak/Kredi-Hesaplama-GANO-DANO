import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gecmeHesapla, puanToHarf } from './gecme-calculator.js';
import { HARF_NOT_ESIKLERI, BASARISIZ_NOTLAR } from './config.js';

const opts = {
    notSistemi: 'sistem1',
    esikler: HARF_NOT_ESIKLERI,
    basarisizNotlar: BASARISIZ_NOTLAR,
    hedefHarf: 'DD',
    hedefHarfAktif: false
};

describe('gecmeHesapla', () => {
    it('geciyor dalinda final min aktifse hesaplandi doner', () => {
        const sonuc = gecmeHesapla({
            gecmeNotu: 50,
            finalMinAktif: true,
            finalMinNot: 50,
            kalemler: [
                { ad: 'Vize 1', agirlik: 70, puan: 80 },
                { ad: 'Final', agirlik: 30, puan: null }
            ],
            hedefIndex: null,
            ...opts
        });

        assert.equal(sonuc.durum, 'hesaplandi');
        assert.equal(sonuc.gerekliFinal, 50);
    });

    it('final min hedef final degilken ayri mesaj uretir', () => {
        const sonuc = gecmeHesapla({
            gecmeNotu: 50,
            finalMinAktif: true,
            finalMinNot: 50,
            kalemler: [
                { ad: 'Vize 1', agirlik: 50, puan: null },
                { ad: 'Final', agirlik: 50, puan: null }
            ],
            hedefIndex: 0,
            ...opts
        });

        assert.equal(sonuc.durum, 'hesaplandi');
        assert.match(sonuc.finalMinMesaji || '', /Final minimum şartı/);
        assert.equal(sonuc.gerekliFinal, 100);
    });

    it('tam dolu final min basarisizliginda final puanini kullanir', () => {
        const sonuc = gecmeHesapla({
            gecmeNotu: 50,
            finalMinAktif: true,
            finalMinNot: 50,
            kalemler: [
                { ad: 'Vize 1', agirlik: 40, puan: 80 },
                { ad: 'Final', agirlik: 60, puan: 40 }
            ],
            hedefIndex: null,
            ...opts
        });

        assert.equal(sonuc.durum, 'kalindi');
        assert.equal(sonuc.girilenPuan, 40);
        assert.match(sonuc.aciklama, /Final/);
    });

    it('final min mesaji final notu eksigini dogru gosterir', () => {
        const sonuc = gecmeHesapla({
            gecmeNotu: 50,
            finalMinAktif: true,
            finalMinNot: 50,
            kalemler: [
                { ad: 'Vize 1', agirlik: 40, puan: 85 },
                { ad: 'Final', agirlik: 60, puan: 49 }
            ],
            hedefIndex: null,
            notSistemi: 'sistem4',
            esikler: HARF_NOT_ESIKLERI,
            basarisizNotlar: BASARISIZ_NOTLAR,
            hedefHarf: 'C3',
            hedefHarfAktif: false
        });

        assert.equal(sonuc.durum, 'kalindi');
        assert.match(sonuc.harfAciklama, /Ağırlıklı ortalaman .* geçmeye yetiyor/);
        assert.match(sonuc.harfAciklama, /girdiğin 49\.00, 1\.00 puan eksik/);
        assert.doesNotMatch(sonuc.harfAciklama, /Seçilen sisteme göre/);
    });

    it('toplam agirlik 100 degilse hata doner', () => {
        const sonuc = gecmeHesapla({
            gecmeNotu: 60,
            finalMinAktif: false,
            finalMinNot: 50,
            kalemler: [
                { ad: 'Vize 1', agirlik: 30, puan: 70 },
                { ad: 'Final', agirlik: 60, puan: null }
            ],
            hedefIndex: null,
            ...opts
        });

        assert.equal(sonuc.durum, 'hata');
    });

    it('gecersiz gecme notu icin hata doner', () => {
        const sonuc = gecmeHesapla({
            gecmeNotu: NaN,
            finalMinAktif: false,
            finalMinNot: 50,
            kalemler: [
                { ad: 'Vize 1', agirlik: 40, puan: 70 },
                { ad: 'Final', agirlik: 60, puan: null }
            ],
            hedefIndex: null,
            ...opts
        });

        assert.equal(sonuc.durum, 'hata');
    });
});

describe('puanToHarf', () => {
    it('sistem4 F2 esigi listede bulunur', () => {
        const f2Var = HARF_NOT_ESIKLERI.sistem4.some((e) => e.harf === 'F2');
        assert.equal(f2Var, true);
    });
});
