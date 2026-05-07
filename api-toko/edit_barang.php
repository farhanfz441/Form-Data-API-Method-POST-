<?php
include "koneksi.php";

// Izinkan request dari mana saja (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Tangkap kiriman JSON
$json_data = file_get_contents("php://input");
$data      = json_decode($json_data, true);

// Validasi parameter wajib
if (isset($data['id']) && isset($data['nama_barang']) && isset($data['harga'])) {

    $id          = mysqli_real_escape_string($koneksi, $data['id']);
    $nama_barang = mysqli_real_escape_string($koneksi, $data['nama_barang']);
    $harga       = mysqli_real_escape_string($koneksi, $data['harga']);

    $query = "UPDATE barang SET nama_barang='$nama_barang', harga='$harga' WHERE id='$id'";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode([
            "status" => "success",
            "pesan"  => "Data barang berhasil diperbarui!"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "pesan"  => "Gagal memperbarui data: " . mysqli_error($koneksi)
        ]);
    }

} else {
    echo json_encode([
        "status" => "error",
        "pesan"  => "Parameter id, nama_barang, dan harga wajib dikirim!"
    ]);
}
?>