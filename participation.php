<?php
ob_start("ob_gzhandler");

$template = file_get_contents('./templates/template.html');

$head           = file_get_contents('./templates/head.html');
$header         = file_get_contents('./templates/header.html');
$content        = file_get_contents('./templates/participation.html');
$footer         = file_get_contents('./templates/footer.html');

$my_scripts = '
    <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/vfs_fonts.js"></script>
    <script src="js/datamaps.world.min.js"></script>
    <script src="js/participation.js"></script>
';
$head = str_replace('###MY_SCRIPTS###', $my_scripts, $head);

$template = str_replace('###HEAD###', $head, $template);
$template = str_replace('###HEADER###', $header, $template);
$template = str_replace('###CONTENT###', $content, $template);
$template = str_replace('###FOOTER###', $footer, $template);


echo $template;

ob_end_flush();
?>