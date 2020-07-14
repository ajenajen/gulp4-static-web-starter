

<?php
$route = @$_GET['route']?:"home";

// for sub /
if(strpos($route, "assets") != 0)
{
	header('Location: /'.substr($route, strpos($route, "assets")));
	die();
}
$route = str_replace("/", "_", $route);
require_once __DIR__ . "/shared/header.php";

require_once __DIR__ . "/$route.php";

require_once __DIR__ . "/shared/footer.php";