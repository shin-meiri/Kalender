<?php
$xmlFile = 'data.xml';

// Load XML dengan DOMDocument
$dom = new DOMDocument('1.0', 'UTF-8');
if (!file_exists($xmlFile)) {
    $root = $dom->createElement('holidays');
    $dom->appendChild($root);
    $dom->save($xmlFile);
}
$dom->load($xmlFile);
$xpath = new DOMXPath($dom);

// Tambah Data
if (isset($_POST['action']) && $_POST['action'] === 'add') {
    $day = intval($_POST['day']);
    $month = intval($_POST['month']);
    $desc = htmlspecialchars($_POST['description']);

    $holiday = $dom->createElement('holiday');

    // Cari id terbesar
    $maxId = 0;
    foreach ($xpath->query('//holiday/@id') as $attr) {
        $id = intval($attr->value);
        if ($id > $maxId) $maxId = $id;
    }

    $holiday->setAttribute('id', $maxId + 1);
    $holiday->appendChild($dom->createElement('day', $day));
    $holiday->appendChild($dom->createElement('month', $month));
    $holiday->appendChild($dom->createElement('description', $desc));

    $dom->documentElement->appendChild($holiday);
    $dom->save($xmlFile);
    header("Location: edit.php");
    exit;
}

// Hapus Data
if (isset($_GET['delete'])) {
    $targetId = intval($_GET['delete']);
    $nodes = $xpath->query("//holiday[@id='$targetId']");
    if ($nodes->length > 0) {
        $node = $nodes->item(0);
        $node->parentNode->removeChild($node);
        $dom->save($xmlFile);
    }
    header("Location: edit.php");
    exit;
}

// Edit Data
if (isset($_POST['action']) && $_POST['action'] === 'edit') {
    $targetId = intval($_POST['id']);
    $newDay = intval($_POST['day']);
    $newMonth = intval($_POST['month']);
    $newDesc = htmlspecialchars($_POST['description']);

    $nodes = $xpath->query("//holiday[@id='$targetId']");
    if ($nodes->length > 0) {
        $holidayNode = $nodes->item(0);

        foreach ($holidayNode->childNodes as $child) {
            switch ($child->nodeName) {
                case 'day':
                    $child->nodeValue = $newDay;
                    break;
                case 'month':
                    $child->nodeValue = $newMonth;
                    break;
                case 'description':
                    $child->nodeValue = $newDesc;
                    break;
            }
        }

        $dom->save($xmlFile);
    }

    header("Location: edit.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit Libur - CRUD XML</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"  rel="stylesheet">
</head>
<body class="container mt-4">

  <h2>CRUD Hari Libur</h2>

  <!-- Form Tambah -->
  <form method="post" class="mb-4">
    <input type="hidden" name="action" value="add">
    <div class="row g-2 align-items-center mb-2">
      <div class="col-auto"><label>Tanggal:</label></div>
      <div class="col-auto">
        <input type="number" name="day" min="1" max="31" required class="form-control">
      </div>
      <div class="col-auto"><label>Bulan:</label></div>
      <div class="col-auto">
        <input type="number" name="month" min="1" max="12" required class="form-control">
      </div>
      <div class="col-auto"><label>Keterangan:</label></div>
      <div class="col-auto">
        <input type="text" name="description" required class="form-control">
      </div>
      <div class="col-auto">
        <button type="submit" class="btn btn-success">Tambah</button>
      </div>
    </div>
  </form>

  <!-- Daftar Libur -->
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>ID</th>
        <th>Tanggal</th>
        <th>Bulan</th>
        <th>Keterangan</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
      <?php
      $holidays = $xpath->query('//holiday');
      foreach ($holidays as $holiday): 
          $id = $holiday->getAttribute('id');
          $day = $xpath->query('day', $holiday)->item(0)->nodeValue ?? '';
          $month = $xpath->query('month', $holiday)->item(0)->nodeValue ?? '';
          $desc = $xpath->query('description', $holiday)->item(0)->nodeValue ?? '';
      ?>
        <tr>
          <td><?= htmlspecialchars($id) ?></td>
          <td><?= htmlspecialchars($day) ?></td>
          <td><?= htmlspecialchars($month) ?></td>
          <td><?= htmlspecialchars($desc) ?></td>
          <td>
            <!-- Tombol Edit -->
            <button class="btn btn-sm btn-primary" data-bs-toggle="modal"
                    data-bs-target="#editModal<?= htmlspecialchars($id) ?>">Edit</button>

            <!-- Tombol Hapus -->
            <a href="?delete=<?= htmlspecialchars($id) ?>" class="btn btn-sm btn-danger"
               onclick="return confirm('Yakin hapus?')">Hapus</a>

            <!-- Modal Edit -->
            <div class="modal fade" id="editModal<?= htmlspecialchars($id) ?>" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Edit Libur</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <form method="post">
                    <input type="hidden" name="action" value="edit">
                    <input type="hidden" name="id" value="<?= htmlspecialchars($id) ?>">
                    <div class="modal-body">
                      <div class="mb-3">
                        <label class="form-label">Tanggal</label>
                        <input type="number" name="day" value="<?= htmlspecialchars($day) ?>"
                                class="form-control" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Bulan</label>
                        <input type="number" name="month" value="<?= htmlspecialchars($month) ?>"
                                class="form-control" min="1" max="12" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Keterangan</label>
                        <input type="text" name="description" value="<?= htmlspecialchars($desc) ?>"
                                class="form-control" required>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                      <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>

  <a href="index.html" class="btn btn-secondary">← Kembali ke Kalender</a>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script> 
</body>
</html>