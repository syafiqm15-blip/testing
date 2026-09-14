# Bandar Ceria: Misi Bahasa Melayu

Prototaip Fasa 1 permainan persediaan Tahun 1 berasaskan Google Apps Script.

## Kandungan

- Bandar mini 3D dan watak blok
- Kawalan WASD/anak panah serta joystick telefon
- NPC Cikgu Aina
- Tiga soalan kosa kata Bahasa Melayu
- Arahan suara Bahasa Melayu
- XP, syiling dan simpanan kemajuan
- Kod lesen, status lesen dan had peranti
- Google Sheets sebagai pangkalan data

## Cara memasang

1. Buka https://script.google.com dan cipta **New project**.
2. Salin kandungan `Code.gs` ke fail `Code.gs` projek.
3. Tambah fail HTML bernama tepat `Index`.
4. Salin kandungan `Index.html` ke fail tersebut.
5. Di editor Apps Script, pilih fungsi `setupDatabase`, kemudian tekan **Run**.
6. Benarkan akses yang diminta. Satu Google Sheet akan dicipta secara automatik.
7. Buka **Deploy > New deployment > Web app**.
8. Pilih **Execute as: Me** dan akses **Anyone**.
9. Tekan Deploy dan buka URL Web App.

Kod demo: **DEMO-BAHASA**

## Menjana lesen pembeli

Di editor, jalankan sementara:

```javascript
function testCreateLicense() {
  Logger.log(createLicense('Nama Pembeli', 2));
}
```

Lihat kod yang terhasil melalui **Execution log**, kemudian berikan kod tersebut kepada pembeli. Padam fungsi ujian selepas digunakan jika mahu.

## Nota keselamatan

Kod sumber dalam repositori ini bersifat public. Jangan masukkan ID Google Sheet, kata laluan, token pembayaran atau data pembeli ke dalam fail GitHub. ID Sheet disimpan dalam Script Properties oleh `setupDatabase()`.


## Kemas kini Visual V2

- NPC sekolah ditukar kepada Cikgu Shafiq.
- Tiga stesen berurutan: Sekolah, Perpustakaan dan Kedai Ceria.
- Stesen seterusnya hanya aktif selepas misi semasa selesai.
- Avatar mempunyai muka, tangan dan animasi berjalan.
- Kamera boleh dipusing menggunakan seretan tetikus atau sentuhan.
- Bangunan mempunyai bumbung, pintu, tingkap, laluan dan hiasan bandar.
- Kemajuan stesen disimpan di lajur STESEN.

Jika menaik taraf daripada V1, salin semula kedua-dua fail `Code.gs` dan `Index.html`, jalankan `setupDatabase()` sekali lagi, kemudian pilih **Deploy > Manage deployments > Edit > New version > Deploy**.


## Mod Akses Awam

Versi prototaip kini tidak memerlukan kod lesen. Pemain hanya memasukkan nama. Nama, ID peranti tanpa nama asal, masa log masuk dan kemajuan disimpan dalam tab `PEMAIN` serta `KEMAJUAN`.

Selepas menyalin fail terkini, jalankan `setupDatabase()` sekali untuk mencipta tab `PEMAIN`, kemudian deploy sebagai versi baharu. Sistem lesen lama masih dikekalkan dalam `Code.gs` untuk kegunaan komersial pada masa hadapan.
