/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#include "settings/i18n_store.h"

#include <ctype.h>
#include <dirent.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <sys/stat.h>

extern const uint8_t i18n_zh_cn_json_start[] asm("_binary_i18n_zh_cn_json_start");
extern const uint8_t i18n_zh_tw_json_start[] asm("_binary_i18n_zh_tw_json_start");

static const char *I18N_BUILTIN_DE =
    "{\"lvgl\":{"
    "\"common\":{\"on\":\"AN\",\"off\":\"AUS\",\"unavailable\":\"nicht verfuegbar\",\"paused\":\"pausiert\",\"playing\":\"spielt\"},"
    "\"topbar\":{\"ha\":\"HA\",\"ap\":\"AP\"},"
    "\"sensor\":{\"age\":{\"just_now\":\"gerade eben\",\"min_one\":\"vor 1 Min\",\"min_many\":\"vor %d Min\",\"hour_one\":\"vor 1 Std\",\"hour_many\":\"vor %d Std\",\"day_one\":\"vor 1 Tag\",\"day_many\":\"vor %d Tagen\"}},"
    "\"heating\":{\"target_format\":\"Soll %.1f C\",\"active\":\"Heizen aktiv\"},"
    "\"light\":{\"color_title\":\"Lichtfarbe\",\"white\":\"Weiss\",\"color_temperature\":\"Farbtemperatur\",\"warm\":\"Warm\",\"cool\":\"Kalt\",\"rgb_color\":\"RGB Farbe\",\"presets\":\"Presets\",\"hue\":\"Farbton\",\"saturation\":\"Saettigung\",\"effects\":\"Effekte\",\"no_effects\":\"Keine Effekte\"},"
    "\"weather\":{\"unavailable\":\"Nicht verfuegbar\",\"humidity_format\":\"Luftfeuchte %d%%\"},"
    "\"graph\":{\"no_history\":\"keine Historie\",\"no_data\":\"keine Daten\",\"min\":\"min\",\"max\":\"max\"},"
    "\"energy\":{\"title\":\"Energie\",\"waiting\":\"Warte auf Energiedaten\",\"ha_waiting\":\"HA Energy Daten\",\"today\":\"Heute\",\"grid\":\"Netz\",\"solar\":\"Solar\",\"home\":\"Zuhause\",\"battery\":\"Batterie\",\"grid_in\":\"Bezug\",\"grid_out\":\"Einspeisung\",\"battery_charge\":\"Laden\",\"battery_out\":\"Entladen\",\"home_now\":\"Haus jetzt\"},"
    "\"boot\":{\"initializing_system\":\"System wird initialisiert\",\"initializing_wifi\":\"WLAN wird initialisiert\",\"initializing_touch\":\"Touch wird initialisiert\",\"wifi_setup_title\":\"WLAN Setup\",\"wifi_connect_failed\":\"WLAN Verbindung fehlgeschlagen\",\"wifi_credentials_missing\":\"WLAN Zugangsdaten fehlen\",\"open_editor\":\"BETTA Editor oeffnen:\",\"ha_setup_title\":\"Home Assistant Setup\",\"wifi_connected\":\"WLAN verbunden\",\"ha_credentials_missing\":\"HA Zugangsdaten fehlen\",\"set_ha_url_token\":\"HA URL und Token setzen\",\"loading_dashboard\":\"Dashboard wird geladen\",\"mounting_sd\":\"microSD-Karte wird eingebunden\",\"setup_ap_prefix\":\"Setup AP\",\"offline_mode\":\"Offline Modus\"},"
    "\"screen\":{\"title\":\"Bildschirmeinstellungen\",\"brightness\":\"Helligkeit\",\"saver_brightness\":\"Uhrhelligkeit\",\"screensaver\":\"Bildschirmschoner\",\"screen_off\":\"Bildschirm aus\",\"clock_24h\":\"24h Uhr\",\"show_seconds\":\"Sekunden\",\"show_date\":\"Datum\",\"description\":\"Anzeige und Energie einstellen\",\"brightness_description\":\"Bildschirmhelligkeit einstellen\",\"screensaver_description\":\"Bildschirmschoner starten nach\",\"saver_brightness_description\":\"Uhrhelligkeit einstellen\",\"screen_off_description\":\"Bildschirm ausschalten nach\",\"clock_24h_description\":\"24-Stunden-Format verwenden\",\"show_seconds_description\":\"Sekunden auf der Uhr anzeigen\",\"show_date_description\":\"Datum auf dem Bildschirm anzeigen\"}"
    "}}";

static const char *I18N_BUILTIN_EN =
    "{\"lvgl\":{"
    "\"common\":{\"on\":\"ON\",\"off\":\"OFF\",\"unavailable\":\"unavailable\",\"paused\":\"paused\",\"playing\":\"playing\"},"
    "\"topbar\":{\"ha\":\"HA\",\"ap\":\"AP\"},"
    "\"sensor\":{\"age\":{\"just_now\":\"just now\",\"min_one\":\"1 min ago\",\"min_many\":\"%d min ago\",\"hour_one\":\"1 hour ago\",\"hour_many\":\"%d hours ago\",\"day_one\":\"1 day ago\",\"day_many\":\"%d days ago\"}},"
    "\"heating\":{\"target_format\":\"Target %.1f C\",\"active\":\"heating active\"},"
    "\"light\":{\"color_title\":\"Light color\",\"white\":\"White\",\"color_temperature\":\"Color temperature\",\"warm\":\"Warm\",\"cool\":\"Cool\",\"rgb_color\":\"RGB color\",\"presets\":\"Presets\",\"hue\":\"Hue\",\"saturation\":\"Saturation\",\"effects\":\"Effects\",\"no_effects\":\"No effects\"},"
    "\"weather\":{\"unavailable\":\"Unavailable\",\"humidity_format\":\"Humidity %d%%\"},"
    "\"graph\":{\"no_history\":\"no history\",\"no_data\":\"no data\",\"min\":\"min\",\"max\":\"max\"},"
    "\"energy\":{\"title\":\"Energy\",\"waiting\":\"Waiting for energy data\",\"ha_waiting\":\"HA Energy data\",\"today\":\"Today\",\"grid\":\"Grid\",\"solar\":\"Solar\",\"home\":\"Home\",\"battery\":\"Battery\",\"grid_in\":\"in\",\"grid_out\":\"out\",\"battery_charge\":\"chg\",\"battery_out\":\"out\",\"home_now\":\"Home now\"},"
    "\"boot\":{\"initializing_system\":\"Initializing system\",\"initializing_wifi\":\"Initializing Wi-Fi\",\"initializing_touch\":\"Initializing touch\",\"wifi_setup_title\":\"Wi-Fi Setup\",\"wifi_connect_failed\":\"Wi-Fi connect failed\",\"wifi_credentials_missing\":\"Wi-Fi credentials missing\",\"open_editor\":\"Open BETTA Editor:\",\"ha_setup_title\":\"Home Assistant Setup\",\"wifi_connected\":\"Wi-Fi connected\",\"ha_credentials_missing\":\"HA credentials missing\",\"set_ha_url_token\":\"Set HA URL and token\",\"loading_dashboard\":\"Loading dashboard\",\"mounting_sd\":\"Mounting microSD card\",\"setup_ap_prefix\":\"Setup AP\",\"offline_mode\":\"Offline mode\"},"
    "\"alarm\":{\"disarmed\":\"Disarmed\",\"armed_home\":\"Armed (home)\",\"armed_away\":\"Armed (away)\",\"armed_night\":\"Armed (night)\",\"armed_vacation\":\"Armed (vacation)\",\"armed_custom\":\"Armed (custom)\",\"arming\":\"Arming...\",\"pending\":\"Pending...\",\"disarming\":\"Disarming...\",\"triggered\":\"ALARM!\",\"unavailable\":\"Unavailable\",\"waiting\":\"Waiting...\",\"busy\":\"Sending...\",\"send_failed\":\"Command failed\",\"changed_by\":\"by\",\"code_title\":\"Enter code\",\"code_hint\":\"----\",\"btn_away\":\"Away\",\"btn_home\":\"Home\",\"btn_night\":\"Night\",\"btn_vacation\":\"Vacation\",\"btn_custom\":\"Custom\",\"btn_disarm\":\"Disarm\",\"open_prefix\":\"Open\",\"bypassed\":\"Bypassed\",\"force_title\":\"Sensors are open\",\"force_hint\":\"Arm anyway and bypass them?\",\"force_confirm\":\"Arm anyway\",\"cancel\":\"Cancel\",\"kind_door\":\"door\",\"kind_window\":\"window\",\"kind_motion\":\"motion\",\"kind_smoke\":\"smoke\",\"kind_water\":\"water\",\"kind_tamper\":\"tamper\",\"failed_arm\":\"Arming failed\",\"reason_open_sensors\":\"open sensors\",\"reason_invalid_code\":\"invalid code\",\"reason_not_allowed\":\"not allowed now\"},"
    "\"clock_alarm\":{\"title\":\"Clock\",\"day_mon\":\"Mon\",\"day_tue\":\"Tue\",\"day_wed\":\"Wed\",\"day_thu\":\"Thu\",\"day_fri\":\"Fri\",\"day_sat\":\"Sat\",\"day_sun\":\"Sun\"},"
    "\"cover\":{\"open\":\"Open\",\"closed\":\"Closed\",\"opening\":\"Opening...\",\"closing\":\"Closing...\",\"stopped\":\"Stopped\",\"busy\":\"Sending...\",\"send_failed\":\"Command failed\",\"btn_open\":\"Open\",\"btn_close\":\"Close\",\"btn_stop\":\"Stop\",\"set_position\":\"Drag to set\"},"
    "\"scene\":{\"hint\":\"Tap to run\",\"running\":\"Running...\",\"done\":\"Done\",\"failed\":\"Command failed\"},"
    "\"person\":{\"home\":\"Home\",\"away\":\"Away\"},"
    "\"timer\":{\"status_idle\":\"Idle\",\"status_active\":\"Running\",\"status_paused\":\"Paused\",\"status_done\":\"Done\",\"status_sending\":\"Sending...\",\"status_failed\":\"Command failed\",\"btn_start\":\"Start\",\"btn_pause\":\"Pause\",\"btn_resume\":\"Resume\",\"btn_cancel\":\"Cancel\",\"btn_reset\":\"Reset\",\"btn_min1\":\"1 min\",\"btn_min5\":\"5 min\",\"btn_min10\":\"10 min\"},"
    "\"screen\":{\"title\":\"Screen settings\",\"brightness\":\"Brightness\",\"saver_brightness\":\"Clock brightness\",\"screensaver\":\"Screensaver\",\"screen_off\":\"Screen off\",\"clock_24h\":\"24h clock\",\"show_seconds\":\"Seconds\",\"show_date\":\"Date\",\"description\":\"Adjust display and power settings\",\"brightness_description\":\"Adjust screen brightness\",\"screensaver_description\":\"Turn on screensaver after\",\"saver_brightness_description\":\"Adjust clock display brightness\",\"screen_off_description\":\"Turn off screen after\",\"clock_24h_description\":\"Use 24-hour time format\",\"show_seconds_description\":\"Show seconds in clock\",\"show_date_description\":\"Show date on screen\"}"
    "}}";

static const char *I18N_BUILTIN_ES =
    "{\"lvgl\":{"
    "\"common\":{\"on\":\"ENC\",\"off\":\"APAG\",\"unavailable\":\"no disponible\",\"paused\":\"pausado\",\"playing\":\"reproduciendo\"},"
    "\"topbar\":{\"ha\":\"HA\",\"ap\":\"AP\"},"
    "\"sensor\":{\"age\":{\"just_now\":\"ahora mismo\",\"min_one\":\"hace 1 min\",\"min_many\":\"hace %d min\",\"hour_one\":\"hace 1 hora\",\"hour_many\":\"hace %d horas\",\"day_one\":\"hace 1 dia\",\"day_many\":\"hace %d dias\"}},"
    "\"heating\":{\"target_format\":\"Objetivo %.1f C\",\"active\":\"calefaccion activa\"},"
    "\"light\":{\"color_title\":\"Color de luz\",\"white\":\"Blanco\",\"color_temperature\":\"Temperatura de color\",\"warm\":\"Calido\",\"cool\":\"Frio\",\"rgb_color\":\"Color RGB\",\"presets\":\"Preajustes\",\"hue\":\"Tono\",\"saturation\":\"Saturacion\",\"effects\":\"Efectos\",\"no_effects\":\"Sin efectos\"},"
    "\"weather\":{\"unavailable\":\"No disponible\",\"humidity_format\":\"Humedad %d%%\"},"
    "\"graph\":{\"no_history\":\"sin historial\",\"no_data\":\"sin datos\",\"min\":\"min\",\"max\":\"max\"},"
    "\"energy\":{\"title\":\"Energia\",\"waiting\":\"Esperando datos de energia\",\"ha_waiting\":\"Datos de HA Energy\",\"today\":\"Hoy\",\"grid\":\"Red\",\"solar\":\"Solar\",\"home\":\"Hogar\",\"battery\":\"Bateria\",\"grid_in\":\"entrada\",\"grid_out\":\"salida\",\"battery_charge\":\"carga\",\"battery_out\":\"descarga\",\"home_now\":\"Hogar ahora\"},"
    "\"boot\":{\"initializing_system\":\"Inicializando sistema\",\"initializing_wifi\":\"Inicializando Wi-Fi\",\"initializing_touch\":\"Inicializando tactil\",\"wifi_setup_title\":\"Configuracion Wi-Fi\",\"wifi_connect_failed\":\"Error de conexion Wi-Fi\",\"wifi_credentials_missing\":\"Faltan credenciales Wi-Fi\",\"open_editor\":\"Abrir BETTA Editor:\",\"ha_setup_title\":\"Configuracion Home Assistant\",\"wifi_connected\":\"Wi-Fi conectado\",\"ha_credentials_missing\":\"Faltan credenciales HA\",\"set_ha_url_token\":\"Configurar URL y token de HA\",\"loading_dashboard\":\"Cargando panel\",\"mounting_sd\":\"Montando tarjeta microSD\",\"setup_ap_prefix\":\"AP de configuracion\",\"offline_mode\":\"Modo sin conexion\"},"
    "\"screen\":{\"title\":\"Ajustes de pantalla\",\"brightness\":\"Brillo\",\"saver_brightness\":\"Brillo del reloj\",\"screensaver\":\"Salvapantallas\",\"screen_off\":\"Apagar pantalla\",\"clock_24h\":\"Reloj 24h\",\"show_seconds\":\"Segundos\",\"show_date\":\"Fecha\",\"description\":\"Ajustar pantalla y energia\",\"brightness_description\":\"Ajustar brillo de pantalla\",\"screensaver_description\":\"Activar salvapantallas tras\",\"saver_brightness_description\":\"Ajustar brillo del reloj\",\"screen_off_description\":\"Apagar pantalla tras\",\"clock_24h_description\":\"Usar formato de 24 horas\",\"show_seconds_description\":\"Mostrar segundos en el reloj\",\"show_date_description\":\"Mostrar fecha en pantalla\"}"
    "}}";

static const char *I18N_BUILTIN_FR =
    "{\"lvgl\":{"
    "\"common\":{\"on\":\"ON\",\"off\":\"OFF\",\"unavailable\":\"indisponible\",\"paused\":\"en pause\",\"playing\":\"lecture\"},"
    "\"topbar\":{\"ha\":\"HA\",\"ap\":\"AP\"},"
    "\"sensor\":{\"age\":{\"just_now\":\"a l'instant\",\"min_one\":\"il y a 1 min\",\"min_many\":\"il y a %d min\",\"hour_one\":\"il y a 1 h\",\"hour_many\":\"il y a %d h\",\"day_one\":\"il y a 1 jour\",\"day_many\":\"il y a %d jours\"}},"
    "\"heating\":{\"target_format\":\"Cible %.1f C\",\"active\":\"chauffage actif\"},"
    "\"light\":{\"color_title\":\"Couleur lumiere\",\"white\":\"Blanc\",\"color_temperature\":\"Temperature couleur\",\"warm\":\"Chaud\",\"cool\":\"Froid\",\"rgb_color\":\"Couleur RGB\",\"presets\":\"Prereglages\",\"hue\":\"Teinte\",\"saturation\":\"Saturation\",\"effects\":\"Effets\",\"no_effects\":\"Aucun effet\"},"
    "\"weather\":{\"unavailable\":\"Indisponible\",\"humidity_format\":\"Humidite %d%%\"},"
    "\"graph\":{\"no_history\":\"aucun historique\",\"no_data\":\"aucune donnee\",\"min\":\"min\",\"max\":\"max\"},"
    "\"energy\":{\"title\":\"Energie\",\"waiting\":\"Attente des donnees energie\",\"ha_waiting\":\"Donnees HA Energy\",\"today\":\"Aujourd'hui\",\"grid\":\"Reseau\",\"solar\":\"Solaire\",\"home\":\"Maison\",\"battery\":\"Batterie\",\"grid_in\":\"import\",\"grid_out\":\"export\",\"battery_charge\":\"charge\",\"battery_out\":\"decharge\",\"home_now\":\"Maison maintenant\"},"
    "\"boot\":{\"initializing_system\":\"Initialisation du systeme\",\"initializing_wifi\":\"Initialisation Wi-Fi\",\"initializing_touch\":\"Initialisation tactile\",\"wifi_setup_title\":\"Configuration Wi-Fi\",\"wifi_connect_failed\":\"Echec connexion Wi-Fi\",\"wifi_credentials_missing\":\"Identifiants Wi-Fi manquants\",\"open_editor\":\"Ouvrir BETTA Editor:\",\"ha_setup_title\":\"Configuration Home Assistant\",\"wifi_connected\":\"Wi-Fi connecte\",\"ha_credentials_missing\":\"Identifiants HA manquants\",\"set_ha_url_token\":\"Definir URL HA et token\",\"loading_dashboard\":\"Chargement du tableau de bord\",\"mounting_sd\":\"Montage de la carte microSD\",\"setup_ap_prefix\":\"AP de configuration\",\"offline_mode\":\"Mode hors ligne\"},"
    "\"screen\":{\"title\":\"Reglages ecran\",\"brightness\":\"Luminosite\",\"saver_brightness\":\"Luminosite horloge\",\"screensaver\":\"Economiseur\",\"screen_off\":\"Ecran eteint\",\"clock_24h\":\"Horloge 24h\",\"show_seconds\":\"Secondes\",\"show_date\":\"Date\",\"description\":\"Regler affichage et energie\",\"brightness_description\":\"Regler la luminosite de l'ecran\",\"screensaver_description\":\"Activer l'economiseur apres\",\"saver_brightness_description\":\"Regler la luminosite de l'horloge\",\"screen_off_description\":\"Eteindre l'ecran apres\",\"clock_24h_description\":\"Utiliser le format 24 heures\",\"show_seconds_description\":\"Afficher les secondes\",\"show_date_description\":\"Afficher la date sur l'ecran\"}"
    "}}";

static const char *I18N_BUILTIN_PL =
    "{\"lvgl\":{"
    "\"common\":{\"on\":\"W\u0141\",\"off\":\"WY\u0141\",\"unavailable\":\"niedost\u0119pny\",\"paused\":\"wstrzymano\",\"playing\":\"odtwarzanie\",\"unknown\":\"nieznany\",\"pause\":\"Pauza\",\"start\":\"Start\"},"
    "\"topbar\":{\"ha\":\"HA\",\"ap\":\"AP\"},"
    "\"sensor\":{\"age\":{\"just_now\":\"przed chwil\u0105\",\"min_one\":\"1 min temu\",\"min_many\":\"%d min temu\",\"hour_one\":\"1 godz. temu\",\"hour_many\":\"%d godz. temu\",\"day_one\":\"1 dzie\u0144 temu\",\"day_many\":\"%d dni temu\"}},"
    "\"heating\":{\"target_format\":\"Zadana %.1f\u00b0C\",\"active\":\"grzanie aktywne\"},"
    "\"light\":{\"color_title\":\"Kolor \u015bwiat\u0142a\",\"white\":\"Biel\",\"color_temperature\":\"Temperatura barwowa\",\"warm\":\"Ciep\u0142o\",\"cool\":\"Zimno\",\"rgb_color\":\"Kolor RGB\",\"presets\":\"Presety\",\"hue\":\"Barwa\",\"saturation\":\"Nasycenie\",\"effects\":\"Efekty\",\"no_effects\":\"Brak efekt\u00f3w\"},"
    "\"weather\":{\"unavailable\":\"Niedost\u0119pne\",\"humidity_format\":\"Wilgotno\u015b\u0107 %d%%\"},"
    "\"graph\":{\"no_history\":\"brak historii\",\"no_data\":\"brak danych\",\"min\":\"min\",\"max\":\"maks\"},"
    "\"energy\":{\"title\":\"Energia\",\"waiting\":\"Oczekiwanie na dane energii\",\"ha_waiting\":\"Dane HA Energy\",\"today\":\"Dzi\u015b\",\"grid\":\"Sie\u0107\",\"solar\":\"S\u0142o\u0144ce\",\"home\":\"Dom\",\"battery\":\"Bateria\",\"grid_in\":\"import\",\"grid_out\":\"eksport\",\"battery_charge\":\"\u0142adowanie\",\"battery_out\":\"roz\u0142adowanie\",\"home_now\":\"Dom teraz\",\"autarky\":\"Autarkia\",\"gas\":\"Gaz\",\"water\":\"Woda\"},"
    "\"boot\":{\"initializing_system\":\"Inicjalizacja systemu\",\"initializing_wifi\":\"Inicjalizacja Wi-Fi\",\"initializing_touch\":\"Inicjalizacja dotyku\",\"wifi_setup_title\":\"Konfiguracja Wi-Fi\",\"wifi_connect_failed\":\"Nie uda\u0142o si\u0119 po\u0142\u0105czy\u0107 z Wi-Fi\",\"wifi_credentials_missing\":\"Brak danych Wi-Fi\",\"open_editor\":\"Otw\u00f3rz BETTA Editor:\",\"ha_setup_title\":\"Konfiguracja Home Assistant\",\"wifi_connected\":\"Po\u0142\u0105czono z Wi-Fi\",\"ha_credentials_missing\":\"Brak danych HA\",\"set_ha_url_token\":\"Ustaw adres URL i token HA\",\"loading_dashboard\":\"\u0141adowanie panelu\",\"mounting_sd\":\"Montowanie karty microSD\",\"setup_ap_prefix\":\"AP konfiguracji\",\"offline_mode\":\"Tryb offline\"},"
    "\"roborock\":{\"loading_rooms\":\"\u0141adowanie pomieszcze\u0144\",\"rooms_failed_hint\":\"Nie uda\u0142o si\u0119 od\u015bwie\u017cy\u0107 listy pomieszcze\u0144.\",\"no_rooms_hint\":\"Brak metadanych pomieszcze\u0144 na mapie.\",\"map_failed\":\"Podgl\u0105d mapy niedost\u0119pny\",\"map_waiting\":\"Oczekiwanie na map\u0119\",\"map_loading\":\"\u0141adowanie mapy\",\"rooms_failed\":\"Nie uda\u0142o si\u0119 za\u0142adowa\u0107\",\"selected_singular\":\"wybrane\",\"selected_plural\":\"wybrane\",\"room_singular\":\"pomieszczenie\",\"room_plural\":\"pomieszcze\u0144\",\"no_rooms\":\"Brak pomieszcze\u0144\",\"tap_room_list_hint\":\"Dotknij pomieszcze\u0144, aby je wybra\u0107.\",\"tap_rooms_hint\":\"Dotknij pomieszcze\u0144 na mapie, aby je wybra\u0107.\",\"clean_selected_short\":\"Sprz\u0105taj\",\"command_failed\":\"Polecenie nie powiod\u0142o si\u0119\",\"cleaning\":\"Sprz\u0105tanie\",\"returning\":\"Powr\u00f3t\",\"fan\":\"Moc ssania\",\"map_ready\":\"Mapa po\u0142\u0105czona\",\"ready_to_charge\":\"Na doku\",\"ready\":\"Gotowy\",\"dock\":\"Dokuj\"},"
    "\"todo\":{\"empty\":\"brak otwartych zada\u0144\",\"loading\":\"\u0142adowanie...\"},"
    "\"alarm\":{\"disarmed\":\"Rozbrojony\",\"armed_home\":\"Uzbrojony (dom)\",\"armed_away\":\"Uzbrojony (poza domem)\",\"armed_night\":\"Uzbrojony (noc)\",\"armed_vacation\":\"Uzbrojony (urlop)\",\"armed_custom\":\"Uzbrojony (w\u0142asny)\",\"arming\":\"Uzbrajanie...\",\"pending\":\"Op\u00f3\u017anienie...\",\"disarming\":\"Rozbrajanie...\",\"triggered\":\"ALARM!\",\"unavailable\":\"Niedost\u0119pny\",\"waiting\":\"Oczekiwanie...\",\"busy\":\"Wysy\u0142anie...\",\"send_failed\":\"Polecenie nie powiod\u0142o si\u0119\",\"changed_by\":\"przez\",\"code_title\":\"Wpisz kod\",\"code_hint\":\"----\",\"btn_away\":\"Poza\",\"btn_home\":\"Dom\",\"btn_night\":\"Noc\",\"btn_vacation\":\"Urlop\",\"btn_custom\":\"W\u0142asny\",\"btn_disarm\":\"Rozbr\u00f3j\",\"open_prefix\":\"Otwarte\",\"bypassed\":\"Pomini\u0119te\",\"force_title\":\"Czujniki s\u0105 otwarte\",\"force_hint\":\"Uzbroi\u0107 mimo to i pomin\u0105\u0107 je?\",\"force_confirm\":\"Uzbr\u00f3j mimo to\",\"cancel\":\"Anuluj\",\"kind_door\":\"drzwi\",\"kind_window\":\"okno\",\"kind_motion\":\"ruch\",\"kind_smoke\":\"dym\",\"kind_water\":\"woda\",\"kind_tamper\":\"sabota\u017c\",\"failed_arm\":\"Nie uda\u0142o si\u0119 uzbroi\u0107\",\"reason_open_sensors\":\"otwarte czujniki\",\"reason_invalid_code\":\"nieprawid\u0142owy kod\",\"reason_not_allowed\":\"teraz niedozwolone\"},"
    "\"clock_alarm\":{\"title\":\"Zegar\",\"day_mon\":\"pon\",\"day_tue\":\"wt\",\"day_wed\":\"\u015br\",\"day_thu\":\"czw\",\"day_fri\":\"pt\",\"day_sat\":\"sob\",\"day_sun\":\"niedz\"},"
    "\"cover\":{\"open\":\"Otwarta\",\"closed\":\"Zamkni\u0119ta\",\"opening\":\"Otwieranie...\",\"closing\":\"Zamykanie...\",\"stopped\":\"Zatrzymana\",\"busy\":\"Wysy\u0142anie...\",\"send_failed\":\"Polecenie nie powiod\u0142o si\u0119\",\"btn_open\":\"Otw\u00f3rz\",\"btn_close\":\"Zamknij\",\"btn_stop\":\"Stop\",\"set_position\":\"Przesu\u0144, aby ustawi\u0107\"},"
    "\"scene\":{\"hint\":\"Dotknij, aby uruchomi\u0107\",\"running\":\"Uruchamianie...\",\"done\":\"Gotowe\",\"failed\":\"Polecenie nie powiod\u0142o si\u0119\"},"
    "\"person\":{\"home\":\"Dom\",\"away\":\"Poza domem\"},"
    "\"timer\":{\"status_idle\":\"Bezczynny\",\"status_active\":\"Odliczanie\",\"status_paused\":\"Wstrzymany\",\"status_done\":\"Gotowe\",\"status_sending\":\"Wysy\u0142anie...\",\"status_failed\":\"Polecenie nie powiod\u0142o si\u0119\",\"btn_start\":\"Start\",\"btn_pause\":\"Wstrzymaj\",\"btn_resume\":\"Wzn\u00f3w\",\"btn_cancel\":\"Anuluj\",\"btn_reset\":\"Reset\",\"btn_min1\":\"1 min\",\"btn_min5\":\"5 min\",\"btn_min10\":\"10 min\"},"
    "\"screen\":{\"title\":\"Ustawienia ekranu\",\"brightness\":\"Jasno\u015b\u0107\",\"saver_brightness\":\"Jasno\u015b\u0107 zegara\",\"screensaver\":\"Wygaszacz\",\"screen_off\":\"Wy\u0142\u0105czenie ekranu\",\"clock_24h\":\"Format 24h\",\"show_seconds\":\"Sekundy\",\"show_date\":\"Data\",\"description\":\"Ustawienia obrazu i zasilania\",\"brightness_description\":\"Dostosuj jasność ekranu\",\"screensaver_description\":\"Włącz wygaszacz po\",\"saver_brightness_description\":\"Dostosuj jasność zegara\",\"screen_off_description\":\"Wyłącz ekran po\",\"clock_24h_description\":\"Używaj formatu 24-godzinnego\",\"show_seconds_description\":\"Pokazuj sekundy na zegarze\",\"show_date_description\":\"Pokazuj datę na ekranie\"}"
    "}}";

static bool i18n_store_is_valid_language_code(const char *code)
{
    if (code == NULL) {
        return false;
    }

    size_t len = strlen(code);
    if (len < 2 || len >= APP_UI_LANGUAGE_MAX_LEN) {
        return false;
    }

    for (size_t i = 0; i < len; i++) {
        char c = code[i];
        bool ok = (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_';
        if (!ok) {
            return false;
        }
    }
    return true;
}

bool i18n_store_normalize_language_code(const char *input, char *out_code, size_t out_len)
{
    if (input == NULL || out_code == NULL || out_len == 0) {
        return false;
    }

    while (*input != '\0' && isspace((unsigned char)*input)) {
        input++;
    }

    size_t out = 0;
    while (input[out] != '\0' && !isspace((unsigned char)input[out])) {
        if (out + 1 >= out_len) {
            return false;
        }

        char c = (char)tolower((unsigned char)input[out]);
        out_code[out] = c;
        out++;
    }
    out_code[out] = '\0';

    if (out == 0) {
        return false;
    }
    return i18n_store_is_valid_language_code(out_code);
}

bool i18n_store_is_builtin_language(const char *language_code)
{
    if (language_code == NULL) {
        return false;
    }
    return strcmp(language_code, "de") == 0 || strcmp(language_code, "en") == 0 || strcmp(language_code, "es") == 0 ||
           strcmp(language_code, "fr") == 0 || strcmp(language_code, "pl") == 0 ||
           strcmp(language_code, "zh-cn") == 0 || strcmp(language_code, "zh-tw") == 0;
}

const char *i18n_store_builtin_translation_json(const char *language_code)
{
    if (language_code == NULL) {
        return NULL;
    }
    if (strcmp(language_code, "en") == 0) {
        return I18N_BUILTIN_EN;
    }
    if (strcmp(language_code, "de") == 0) {
        return I18N_BUILTIN_DE;
    }
    if (strcmp(language_code, "es") == 0) {
        return I18N_BUILTIN_ES;
    }
    if (strcmp(language_code, "fr") == 0) {
        return I18N_BUILTIN_FR;
    }
    if (strcmp(language_code, "pl") == 0) {
        return I18N_BUILTIN_PL;
    }
    if (strcmp(language_code, "zh-cn") == 0) {
        return (const char *)i18n_zh_cn_json_start;
    }
    if (strcmp(language_code, "zh-tw") == 0) {
        return (const char *)i18n_zh_tw_json_start;
    }
    return NULL;
}

static bool i18n_store_ensure_dir(void)
{
    struct stat st = {0};
    if (stat(APP_I18N_DIR, &st) == 0 && S_ISDIR(st.st_mode)) {
        return true;
    }

    (void)mkdir(APP_I18N_DIR, 0775);
    if (stat(APP_I18N_DIR, &st) == 0 && S_ISDIR(st.st_mode)) {
        return true;
    }
    return false;
}

static bool i18n_store_build_path(const char *language_code, char *out_path, size_t out_path_len)
{
    if (language_code == NULL || out_path == NULL || out_path_len == 0) {
        return false;
    }
    int written = snprintf(out_path, out_path_len, "%s/%s.json", APP_I18N_DIR, language_code);
    return written > 0 && (size_t)written < out_path_len;
}

esp_err_t i18n_store_load_custom_translation(const char *language_code, char **out_json)
{
    if (language_code == NULL || out_json == NULL) {
        return ESP_ERR_INVALID_ARG;
    }
    *out_json = NULL;

    char lang[APP_UI_LANGUAGE_MAX_LEN] = {0};
    if (!i18n_store_normalize_language_code(language_code, lang, sizeof(lang))) {
        return ESP_ERR_INVALID_ARG;
    }

    char path[96] = {0};
    if (!i18n_store_build_path(lang, path, sizeof(path))) {
        return ESP_ERR_INVALID_ARG;
    }

    FILE *f = fopen(path, "rb");
    if (f == NULL) {
        return ESP_ERR_NOT_FOUND;
    }
    if (fseek(f, 0, SEEK_END) != 0) {
        fclose(f);
        return ESP_FAIL;
    }

    long size = ftell(f);
    if (size <= 0 || (size_t)size > APP_I18N_MAX_JSON_LEN) {
        fclose(f);
        return ESP_ERR_INVALID_SIZE;
    }
    rewind(f);

    char *buf = calloc((size_t)size + 1U, sizeof(char));
    if (buf == NULL) {
        fclose(f);
        return ESP_ERR_NO_MEM;
    }

    size_t read = fread(buf, 1U, (size_t)size, f);
    fclose(f);
    if (read != (size_t)size) {
        free(buf);
        return ESP_FAIL;
    }

    *out_json = buf;
    return ESP_OK;
}

esp_err_t i18n_store_save_custom_translation(const char *language_code, const char *json_payload, size_t payload_len)
{
    if (language_code == NULL || json_payload == NULL || payload_len == 0 || payload_len > APP_I18N_MAX_JSON_LEN) {
        return ESP_ERR_INVALID_ARG;
    }

    char lang[APP_UI_LANGUAGE_MAX_LEN] = {0};
    if (!i18n_store_normalize_language_code(language_code, lang, sizeof(lang))) {
        return ESP_ERR_INVALID_ARG;
    }
    if (!i18n_store_ensure_dir()) {
        return ESP_FAIL;
    }

    char path[96] = {0};
    if (!i18n_store_build_path(lang, path, sizeof(path))) {
        return ESP_ERR_INVALID_ARG;
    }

    FILE *f = fopen(path, "wb");
    if (f == NULL) {
        return ESP_FAIL;
    }
    size_t written = fwrite(json_payload, 1U, payload_len, f);
    fclose(f);
    if (written != payload_len) {
        return ESP_FAIL;
    }
    return ESP_OK;
}

bool i18n_store_custom_translation_exists(const char *language_code)
{
    char lang[APP_UI_LANGUAGE_MAX_LEN] = {0};
    if (!i18n_store_normalize_language_code(language_code, lang, sizeof(lang))) {
        return false;
    }

    char path[96] = {0};
    if (!i18n_store_build_path(lang, path, sizeof(path))) {
        return false;
    }

    struct stat st = {0};
    return stat(path, &st) == 0 && S_ISREG(st.st_mode);
}

static bool i18n_store_add_language(
    char (*out_codes)[APP_UI_LANGUAGE_MAX_LEN],
    size_t max_codes,
    size_t *count,
    const char *code)
{
    if (out_codes == NULL || count == NULL || code == NULL || code[0] == '\0') {
        return false;
    }
    for (size_t i = 0; i < *count; i++) {
        if (strncmp(out_codes[i], code, APP_UI_LANGUAGE_MAX_LEN) == 0) {
            return false;
        }
    }
    if (*count >= max_codes) {
        return false;
    }
    strlcpy(out_codes[*count], code, APP_UI_LANGUAGE_MAX_LEN);
    (*count)++;
    return true;
}

esp_err_t i18n_store_list_languages(
    char (*out_codes)[APP_UI_LANGUAGE_MAX_LEN],
    size_t max_codes,
    size_t *out_count)
{
    if (out_codes == NULL || max_codes == 0 || out_count == NULL) {
        return ESP_ERR_INVALID_ARG;
    }

    size_t count = 0;
    (void)i18n_store_add_language(out_codes, max_codes, &count, "en");
    (void)i18n_store_add_language(out_codes, max_codes, &count, "de");
    (void)i18n_store_add_language(out_codes, max_codes, &count, "es");
    (void)i18n_store_add_language(out_codes, max_codes, &count, "fr");
    (void)i18n_store_add_language(out_codes, max_codes, &count, "pl");
    (void)i18n_store_add_language(out_codes, max_codes, &count, "zh-cn");
    (void)i18n_store_add_language(out_codes, max_codes, &count, "zh-tw");

    if (!i18n_store_ensure_dir()) {
        *out_count = count;
        return ESP_OK;
    }

    DIR *dir = opendir(APP_I18N_DIR);
    if (dir == NULL) {
        *out_count = count;
        return (errno == ENOENT) ? ESP_OK : ESP_FAIL;
    }

    struct dirent *entry = NULL;
    while ((entry = readdir(dir)) != NULL) {
        const char *name = entry->d_name;
        size_t len = strlen(name);
        if (len <= strlen(".json")) {
            continue;
        }
        if (strcmp(name, ".") == 0 || strcmp(name, "..") == 0) {
            continue;
        }
        if (strcmp(name + (len - 5), ".json") != 0) {
            continue;
        }

        char code[APP_UI_LANGUAGE_MAX_LEN] = {0};
        size_t base_len = len - 5;
        if (base_len >= sizeof(code)) {
            continue;
        }
        memcpy(code, name, base_len);
        code[base_len] = '\0';

        char normalized[APP_UI_LANGUAGE_MAX_LEN] = {0};
        if (!i18n_store_normalize_language_code(code, normalized, sizeof(normalized))) {
            continue;
        }

        (void)i18n_store_add_language(out_codes, max_codes, &count, normalized);
    }
    closedir(dir);

    *out_count = count;
    return ESP_OK;
}
