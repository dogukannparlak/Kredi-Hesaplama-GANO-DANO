export const SITE = {
    brand: 'Doğukan Parlak',
    homeUrl: '/',
    repoUrl: 'https://github.com/dogukannparlak/Kredi-Hesaplama-GANO-DANO',
    links: {
        about: 'https://dogukanparlak.com/about',
        projects: 'https://dogukanparlak.com/projects',
        contact: 'https://dogukanparlak.com/contact',
        blog: 'https://dogukanparlak.com'
    },
    social: {
        instagram: 'https://instagram.com/dogukanparlak_',
        github: 'https://github.com/dogukannparlak',
        x: 'https://x.com/dogukanpariak'
    }
};

export const NOT_SISTEMLERI = {
    sistem1: {
        harfler: ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'],
        puanlar: {
            'AA': 4.00, 'BA': 3.50, 'BB': 3.00, 'CB': 2.50,
            'CC': 2.00, 'DC': 1.50, 'DD': 1.00, 'FD': 0.50, 'FF': 0.00
        }
    },
    sistem2: {
        harfler: ['AA', 'AB', 'BA', 'BB', 'BC', 'CB', 'CC', 'CD', 'DC', 'DD', 'FF'],
        puanlar: {
            'AA': 4.00, 'AB': 3.75, 'BA': 3.50, 'BB': 3.25,
            'BC': 3.00, 'CB': 2.75, 'CC': 2.50, 'CD': 2.25,
            'DC': 2.00, 'DD': 1.75, 'FF': 0.00
        }
    },
    sistem3: {
        harfler: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
        puanlar: {
            'A': 4.00, 'A-': 3.70, 'B+': 3.30, 'B': 3.00,
            'B-': 2.70, 'C+': 2.30, 'C': 2.00, 'C-': 1.70,
            'D+': 1.30, 'D': 1.00, 'D-': 0.70, 'F': 0.00
        }
    },
    sistem4: {
        harfler: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'F1', 'F2'],
        puanlar: {
            'A1': 4.00, 'A2': 3.75, 'A3': 3.50, 'B1': 3.25,
            'B2': 3.00, 'B3': 2.75, 'C1': 2.50, 'C2': 2.25,
            'C3': 2.00, 'D1': 1.75, 'F1': 0.00, 'F2': 0.00
        }
    }
};

export const BASARISIZ_NOTLAR = ['F', 'FF', 'FD', 'F1', 'F2'];
export const HESAPLAMA_DISI_NOTLAR = ['M', 'G', 'K', 'S', 'Ç'];

/** Not sistemine göre kaldığı/tekrar ders varsayılan başarısız harf notu. */
export const VARSAYILAN_BASARISIZ_NOT = {
    sistem1: 'FF',
    sistem2: 'FF',
    sistem3: 'F',
    sistem4: 'F1'
};

export function varsayilanBasarisizNot(notSistemi) {
    const tercih = VARSAYILAN_BASARISIZ_NOT[notSistemi];
    if (tercih && NOT_SISTEMLERI[notSistemi]?.harfler.includes(tercih)) {
        return tercih;
    }
    return NOT_SISTEMLERI[notSistemi]?.harfler.find((h) => BASARISIZ_NOTLAR.includes(h)) ?? 'FF';
}

/** Ağırlıklı sayısal puana karşılık gelen harf notu alt sınırları (100 üzerinden). */
export const HARF_NOT_ESIKLERI = {
    sistem1: [
        { harf: 'AA', min: 90 }, { harf: 'BA', min: 85 }, { harf: 'BB', min: 80 },
        { harf: 'CB', min: 75 }, { harf: 'CC', min: 70 }, { harf: 'DC', min: 65 },
        { harf: 'DD', min: 60 }, { harf: 'FD', min: 50 }, { harf: 'FF', min: 0 }
    ],
    sistem2: [
        { harf: 'AA', min: 90 }, { harf: 'AB', min: 85 }, { harf: 'BA', min: 80 },
        { harf: 'BB', min: 75 }, { harf: 'BC', min: 70 }, { harf: 'CB', min: 65 },
        { harf: 'CC', min: 60 }, { harf: 'CD', min: 55 }, { harf: 'DC', min: 50 },
        { harf: 'DD', min: 45 }, { harf: 'FF', min: 0 }
    ],
    sistem3: [
        { harf: 'A', min: 90 }, { harf: 'A-', min: 85 }, { harf: 'B+', min: 80 },
        { harf: 'B', min: 75 }, { harf: 'B-', min: 70 }, { harf: 'C+', min: 65 },
        { harf: 'C', min: 60 }, { harf: 'C-', min: 55 }, { harf: 'D+', min: 50 },
        { harf: 'D', min: 45 }, { harf: 'D-', min: 40 }, { harf: 'F', min: 0 }
    ],
    sistem4: [
        { harf: 'A1', min: 95 }, { harf: 'A2', min: 90 }, { harf: 'A3', min: 85 },
        { harf: 'B1', min: 80 }, { harf: 'B2', min: 75 }, { harf: 'B3', min: 70 },
        { harf: 'C1', min: 65 }, { harf: 'C2', min: 60 }, { harf: 'C3', min: 55 },
        { harf: 'D1', min: 50 }, { harf: 'F1', min: 0 }, { harf: 'F2', min: 0 }
    ]
};

export const GECME_VARSAYILAN = {
    gecmeNotu: 50,
    finalMinNot: 50,
    notSistemi: 'sistem1',
    hedefHarf: 'DD',
    kalemler: [
        { ad: 'Vize 1', agirlik: 40, puan: null },
            { ad: 'Final', agirlik: 60, puan: null }
    ]
};
