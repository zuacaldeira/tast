<?php
ob_start("ob_gzhandler");

require_once('./utils.php');
header('Content-type:application/json;charset=utf-8');

$name = getRequestParameter('name');
$width = getRequestParameter('width');
$height = getRequestParameter('height');
$force_db = false;

if($force_db) {
    resizeAndStore($name, $width, $height);
}

else {
    resizeOnly($name, $width, $height);
}


function resizeOnly($name, $width, $height) {
    $im = resizeImage($name, $width, $height);
        echo json_encode(['url' => toDataUrl($im->getImageBlob()), 'stored' => false]);
}

function resizeAndStore($name, $width, $height) {
    $pdo = getPDO();
    $image = getImage($pdo, $name, $width, $height);

    if($image) {
        echo json_encode(['url' => toDataUrl($image->data)]);
    }
    else {
        $im = resizeImage($name, $width, $height);
        echo json_encode(['url' => toDataUrl($im->getImageBlob()), 'stored' => true]);
        storeImageInDatabase(
                    $pdo, 
                    $im->getImageBlob(), 
                    $im->getImageFormat(), 
                    $width, 
                    $height, 
                    $name
        );
}




}

function getImage($pdo, $name, $width, $height) {
    $query = "SELECT * FROM images WHERE name='$name' AND width=$width AND height=$height";
    $erg = $pdo->query($query);
    $result = $erg->fetch(PDO::FETCH_OBJ);
    return $result;
}

function toDataUrl($blob) {
    return 'data:image/jpg;base64,' . base64_encode($blob);
}

function resizeImage($name, $width, $height) {
    $input = realpath("./test/images/original/$name");
    
    $im = new Imagick($input);
    $im->optimizeImageLayers();

    // Compression and quality
    $im->setImageCompression(Imagick::COMPRESSION_JPEG);
    $im->setImageCompressionQuality(50);
    $im->cropThumbnailImage($width, $height);
    
    return $im;
}

function storeImageInDatabase($pdo, $data, $mime, $width, $height, $name) {
    $query = "INSERT INTO images(name, width, height, data) VALUES (:name, :width, :height, :data)";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':width', $width);
    $stmt->bindParam(':height', $height);
    $stmt->bindParam(':data', $data, PDO::PARAM_LOB);
    $result = $stmt->execute();
    
    return toDataUrl($data);
}

ob_end_flush();
?>