<?php

//default locale
$sLocale = 'en';

$sLocaleTemp = NULL;
if(isset($_GET['l'])) {
    //check if different locale is set
    $sLocaleTemp = $_GET['l'] = str_replace('/', '', trim(strtolower($_GET['l'])));
} elseif(isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
    //browser locale
    $sLocaleTemp = strtolower(substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2));
}

//re-set locale
if($sLocaleTemp !== NULL && is_readable('i18n_'.$sLocaleTemp.'.json')) {
    $sLocale = $sLocaleTemp;
}

//redirect if necessary
if(!isset($_GET['l']) || $_GET['l'] != $sLocale) {
    header('Location: /'.$sLocale.'/');
    die();
} else {
    //load template
    $sTemplate = file_get_contents('frontend.html');

    //replace markers with apppropriate locales
    $aLocale = json_decode(file_get_contents('i18n_'.$sLocale.'.json'), TRUE);
    foreach($aLocale as $sKeyMain => $mValueMain) {
        if(is_array($mValueMain)) {
            foreach($mValueMain as $sKeySub => $sValueSub) {
                $sTemplate = str_replace('{{'.$sKeyMain.'.'.$sKeySub.'}}', $sValueSub, $sTemplate);
            }
        } else {
            $sTemplate = str_replace('{{'.$sKeyMain.'}}', $mValueMain, $sTemplate);
        }
    }

    //output
    echo $sTemplate;
}

?>