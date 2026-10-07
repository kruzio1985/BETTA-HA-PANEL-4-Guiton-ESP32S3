/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
const GRID = 10;
// Canvas pixel dimensions default to the 4" panel (720x600 content area).
// applyCanvasGeometry() below overrides them at runtime with the values
// returned by /api/version, so the same app.js works on both the 4"
// and 10.1" firmware variants.
let CANVAS_WIDTH = 720;
let CANVAS_HEIGHT = 600;
const MIN_WIDGET_SIZE = 60;
const DEFAULT_SLIDER_DIRECTION = "auto";
const DEFAULT_BUTTON_MODE = "auto";
const DEFAULT_BUTTON_ACCENT_COLOR = "#6fe8ff";
const DEFAULT_SLIDER_ACCENT_COLOR = "#6fe8ff";
const DEFAULT_GRAPH_LINE_COLOR = "#6fe8ff";
const DEFAULT_GRAPH_TIME_WINDOW_MIN = 120;
const GRAPH_POINTS_MIN = 16;
const GRAPH_POINTS_MAX = 64;
const GRAPH_TIME_WINDOW_MIN = 1;
const GRAPH_TIME_WINDOW_MAX = 1440;
const GRAPH_DISPLAY_MODES = ["line", "line_smooth_points", "line_smooth", "bars"];
const DEFAULT_GRAPH_DISPLAY_MODE = "line";
const GRAPH_BAR_BUCKET_MIN_OPTIONS = [5, 10, 15, 30];
const DEFAULT_GRAPH_BAR_BUCKET_MIN = 15;
const ENERGY_PAGE_TYPE = "energy_dashboard";
const MUSIC_PAGE_TYPE = "music_assistant";
const ENERGY_SOURCE_HA = "ha_energy";
const ENERGY_SOURCE_MANUAL = "manual_live";
const ENERGY_SOURCES = new Set([ENERGY_SOURCE_HA, ENERGY_SOURCE_MANUAL]);
const ENERGY_PREVIEW_COLORS = {
  grid: "#039bef",
  solar: "#ff9800",
  battery: "#26a69a",
  idle: "#435566",
};

function isCompactCanvas() {
  return CANVAS_WIDTH <= 480 || CANVAS_HEIGHT <= 380;
}

const ENERGY_ENTITY_KEYS = [
  "home_power_entity_id",
  "solar_power_entity_id",
  "grid_power_entity_id",
  "grid_import_power_entity_id",
  "grid_export_power_entity_id",
  "battery_power_entity_id",
  "battery_charge_power_entity_id",
  "battery_discharge_power_entity_id",
  "battery_soc_entity_id",
];
const ENTITY_AUTOCOMPLETE_DEBOUNCE_MS = 220;
const ENTITY_AUTOCOMPLETE_MAX_ITEMS = 24;
const LIGHT_ENTITY_PICKER_POLL_MS = 700;
const LIGHT_ENTITY_PICKER_MAX_POLLS = 90;
const ENTITY_PICKER_SEARCH_DEBOUNCE_MS = 350;
const SETUP_WIZARD_PENDING_STORAGE_KEY = "betta.setupWizard.pending";
const SETUP_WIZARD_DISMISSED_STORAGE_KEY = "betta.setupWizard.dismissed";
const OTA_RELEASE_REPO = "cptkirki/BETTA-HA-PANEL";
/* Tiles that may stay without an entity; they bind one when it is set. */
const ENTITY_OPTIONAL_WIDGET_TYPES = ["cover_tile", "scene_tile", "person_tile", "timer_tile"];
const ENTITY_PICKER_CONFIGS = {
  sensor: {
    domain: "sensor",
    titleKey: "entity_picker.title_sensor",
    blankKey: "entity_picker.blank_sensor",
    widgetKey: "entity_picker.widget_sensor",
    itemsKey: "entity_picker.items_sensor",
    titleFallback: "Choose Sensor",
    blankFallback: "Blank Sensor Tile",
    widgetFallback: "Sensor tile",
    itemsFallback: "sensors",
    minSearch: 2,
    liveSearch: false,
  },
  light_tile: {
    domain: "light",
    titleKey: "entity_picker.title_light",
    blankKey: "entity_picker.blank_light",
    widgetKey: "entity_picker.widget_light",
    itemsKey: "entity_picker.items_light",
    titleFallback: "Choose Light",
    blankFallback: "Blank Light Tile",
    widgetFallback: "Light tile",
    itemsFallback: "lights",
  },
  button: {
    domain: "switch",
    titleKey: "entity_picker.title_switch",
    blankKey: "entity_picker.blank_button",
    widgetKey: "entity_picker.widget_button",
    itemsKey: "entity_picker.items_switch",
    titleFallback: "Choose Switch",
    blankFallback: "Blank Button Tile",
    widgetFallback: "Button tile",
    itemsFallback: "switches",
  },
  binary_sensor: {
    domain: "binary_sensor",
    titleKey: "entity_picker.title_binary",
    blankKey: "entity_picker.blank_binary",
    widgetKey: "entity_picker.widget_binary",
    itemsKey: "entity_picker.items_binary",
    titleFallback: "Choose Binary Sensor",
    blankFallback: "Blank Binary Sensor Tile",
    widgetFallback: "Binary Sensor tile",
    itemsFallback: "binary sensors",
    minSearch: 2,
    liveSearch: false,
  },
  alarm_tile: {
    domain: "alarm_control_panel",
    titleKey: "entity_picker.title_alarm",
    blankKey: "entity_picker.blank_alarm",
    widgetKey: "entity_picker.widget_alarm",
    itemsKey: "entity_picker.items_alarm",
    titleFallback: "Choose Alarm Panel",
    blankFallback: "Blank Alarm Tile",
    widgetFallback: "Alarm tile",
    itemsFallback: "alarm panels",
    minSearch: 2,
    liveSearch: false,
  },
  heating_tile: {
    domain: "climate",
    titleKey: "entity_picker.title_climate",
    blankKey: "entity_picker.blank_heating",
    widgetKey: "entity_picker.widget_heating",
    itemsKey: "entity_picker.items_climate",
    titleFallback: "Choose Heating",
    blankFallback: "Blank Heating Tile",
    widgetFallback: "Heating tile",
    itemsFallback: "climate entities",
  },
  weather_tile: {
    domain: "weather",
    titleKey: "entity_picker.title_weather",
    blankKey: "entity_picker.blank_weather",
    widgetKey: "entity_picker.widget_weather",
    itemsKey: "entity_picker.items_weather",
    titleFallback: "Choose Weather",
    blankFallback: "Blank Weather Tile",
    widgetFallback: "Weather tile",
    itemsFallback: "weather entities",
  },
  weather_3day: {
    domain: "weather",
    titleKey: "entity_picker.title_weather",
    blankKey: "entity_picker.blank_weather_3day",
    widgetKey: "entity_picker.widget_weather_3day",
    itemsKey: "entity_picker.items_weather",
    titleFallback: "Choose Weather",
    blankFallback: "Blank Weather Forecast Tile",
    widgetFallback: "Weather Forecast tile",
    itemsFallback: "weather entities",
  },
  todo_list: {
    domain: "todo",
    titleKey: "entity_picker.title_todo",
    blankKey: "entity_picker.blank_todo",
    widgetKey: "entity_picker.widget_todo",
    itemsKey: "entity_picker.items_todo",
    titleFallback: "Choose Todo List",
    blankFallback: "Blank Todo List Tile",
    widgetFallback: "Todo List tile",
    itemsFallback: "todo lists",
  },
  media_player: {
    domain: "media_player",
    titleKey: "entity_picker.title_media_player",
    blankKey: "entity_picker.blank_media_player",
    widgetKey: "entity_picker.widget_media_player",
    itemsKey: "entity_picker.items_media_player",
    titleFallback: "Choose Media Player",
    blankFallback: "Blank Media Player Tile",
    widgetFallback: "Media Player tile",
    itemsFallback: "media players",
  },
  roborock_tile: {
    domain: "vacuum",
    titleKey: "entity_picker.title_roborock",
    blankKey: "entity_picker.blank_roborock",
    widgetKey: "entity_picker.widget_roborock",
    itemsKey: "entity_picker.items_vacuum",
    titleFallback: "Choose Roborock",
    blankFallback: "Blank Roborock Tile",
    widgetFallback: "Roborock tile",
    itemsFallback: "vacuum robots",
  },
  graph: {
    domain: "sensor",
    titleKey: "entity_picker.title_sensor",
    blankKey: "entity_picker.blank_graph",
    widgetKey: "entity_picker.widget_graph",
    itemsKey: "entity_picker.items_sensor",
    titleFallback: "Choose Sensor",
    blankFallback: "Blank Graph Tile",
    widgetFallback: "Graph tile",
    itemsFallback: "sensors",
    minSearch: 2,
    liveSearch: false,
  },
  cover_tile: {
    domain: "cover",
    titleKey: "entity_picker.title_cover",
    blankKey: "entity_picker.blank_cover",
    widgetKey: "entity_picker.widget_cover",
    itemsKey: "entity_picker.items_cover",
    titleFallback: "Choose Cover",
    blankFallback: "Blank Cover Tile",
    widgetFallback: "Cover tile",
    itemsFallback: "covers",
  },
  scene_tile: {
    domain: "scene",
    titleKey: "entity_picker.title_scene",
    blankKey: "entity_picker.blank_scene",
    widgetKey: "entity_picker.widget_scene",
    itemsKey: "entity_picker.items_scene",
    titleFallback: "Choose Scene",
    blankFallback: "Blank Scene Tile",
    widgetFallback: "Scene tile",
    itemsFallback: "scenes",
  },
  person_tile: {
    domain: "person",
    titleKey: "entity_picker.title_person",
    blankKey: "entity_picker.blank_person",
    widgetKey: "entity_picker.widget_person",
    itemsKey: "entity_picker.items_person",
    titleFallback: "Choose Person",
    blankFallback: "Blank Person Tile",
    widgetFallback: "Person tile",
    itemsFallback: "people",
  },
  timer_tile: {
    domain: "timer",
    titleKey: "entity_picker.title_timer",
    blankKey: "entity_picker.blank_timer",
    widgetKey: "entity_picker.widget_timer",
    itemsKey: "entity_picker.items_timer",
    titleFallback: "Choose Timer",
    blankFallback: "Blank Timer Tile",
    widgetFallback: "Timer tile",
    itemsFallback: "timers",
  },
};
const SETTINGS_NAV_ITEMS = [
  { sectionId: "settingsWifiSection", headingId: "settingsWifiHeading", labelKey: "settings.wifi.heading" },
  { sectionId: "settingsHaSection", headingId: "settingsHaHeading", labelKey: "settings.ha.heading" },
  { sectionId: "settingsTimeSection", headingId: "settingsTimeHeading", labelKey: "settings.time.heading" },
  { sectionId: "settingsDisplaySection", headingId: "settingsDisplayHeading", labelKey: "settings.display.heading" },
  { sectionId: "settingsSdSection", headingId: "settingsSdHeading", labelKey: "settings.sd.heading" },
  { sectionId: "settingsPagesSection", headingId: "settingsPagesHeading", labelKey: "settings.pages.heading" },
  { sectionId: "settingsMqttSection", headingId: "settingsMqttHeading", labelKey: "settings.mqtt.heading" },
  { sectionId: "settingsUiSection", headingId: "settingsUiHeading", labelKey: "settings.ui.heading" },
  { sectionId: "settingsThemeSection", headingId: "settingsThemeHeading", labelKey: "settings.theme.heading" },
  { sectionId: "settingsApSection", headingId: "settingsApHeading", labelKey: "settings.ap.heading" },
  { sectionId: "settingsOtaSection", headingId: "settingsOtaHeading", labelKey: "settings.ota.heading" },
  { sectionId: "settingsSystemSection", headingId: "settingsSystemHeading", labelKey: "settings.system.heading" },
  { sectionId: "settingsBackupSection", headingId: "settingsBackupHeading", labelKey: "settings.backup.heading" },
  { sectionId: "settingsDiagnosticsSection", headingId: "settingsDiagnosticsHeading", labelKey: "settings.diagnostics.heading" },
  { sectionId: "settingsLogsSection", headingId: "settingsLogsHeading", labelKey: "settings.logs.heading" },
];
const OTA_STATUS_POLL_MS = 900;
const DEFAULT_SLIDER_ENTITY_DOMAIN = "auto";
const SLIDER_DIRECTIONS = new Set([
  "auto",
  "left_to_right",
  "right_to_left",
  "bottom_to_top",
  "top_to_bottom",
]);
const SLIDER_ENTITY_DOMAINS = new Set([
  "auto",
  "light",
  "media_player",
  "cover",
]);
const BUTTON_MODES = new Set([
  "auto",
  "play_pause",
  "stop",
  "next",
  "previous",
]);
const BUTTON_STYLES = new Set([
  "power_toggle",
  "power_status",
  "plug_icon",
  "lamp_icon",
  "highlight",
  "status_text",
]);
const DEFAULT_BUTTON_STYLE = "";
const LANGUAGE_CODE_RE = /^[a-z0-9][a-z0-9_-]{1,14}$/;
const DEFAULT_UI_LANGUAGE = "en";

const WEB_I18N_BUILTIN = {
  en: {
    "tabs.layout": "Layout",
    "tabs.settings": "Settings",
    "sidebar.title": "BETTA Editor",
    "sidebar.subtitle": "Layout source of truth: JSON",
    "layout.pages.heading": "Pages",
    "layout.pages.add": "+ Page",
    "layout.pages.add_energy": "+ Energy Page",
    "layout.pages.add_music": "+ Music Page",
    "layout.pages.delete": "Delete",
    "layout.pages.confirm_delete": "Delete page \"{name}\"? This removes all of its widgets.",
    "layout.pages.title_label": "Page title",
    "layout.pages.title_placeholder": "Page name on the display",
    "layout.pages.apply_title": "Apply page title",
    "layout.pages.new_title": "Page {number}",
    "layout.pages.energy_title": "Energy",
    "layout.pages.music_title": "Music",
    "layout.energy.heading": "Energy Page",
    "layout.energy.hint": "Choose whether the page mirrors Home Assistant Energy or uses manual live sensors.",
    "layout.energy.source": "Data source",
    "layout.energy.source_ha": "Home Assistant Energy",
    "layout.energy.source_manual": "Manual live sensors",
    "layout.energy.source_hint_ha": "Uses the Energy dashboard configured in Home Assistant.",
    "layout.energy.source_hint_manual": "Expert fallback: use explicit W/kW sensors from Home Assistant.",
    "layout.energy.home_power": "Home power",
    "layout.energy.solar_power": "Solar power",
    "layout.energy.grid_power": "Grid power (signed)",
    "layout.energy.grid_import": "Grid import",
    "layout.energy.grid_export": "Grid export",
    "layout.energy.battery_power": "Battery power (signed)",
    "layout.energy.battery_charge": "Battery charge",
    "layout.energy.battery_discharge": "Battery discharge",
    "layout.energy.battery_soc": "Battery state of charge",
    "layout.energy.apply": "Apply energy config",
    "layout.energy.no_widgets": "Energy pages render a dedicated dashboard and do not use widgets.",
    "layout.energy.preview_title": "Energy distribution",
    "layout.energy.sensor_count_one": "{count} sensor",
    "layout.energy.sensor_count_many": "{count} sensors",
    "layout.energy.no_sensor": "no sensor",
    "layout.energy.preview_source_ha": "HA Energy",
    "layout.energy.preview_source_manual": "Live sensors",
    "layout.energy.preview_auto": "automatic from HA",
    "layout.energy.low_carbon": "Low-carbon",
    "layout.energy.grid": "Grid",
    "layout.energy.solar": "Solar",
    "layout.energy.gas": "Gas",
    "layout.energy.home": "Home",
    "layout.energy.battery": "Battery",
    "layout.energy.water": "Water",
    "layout.music.heading": "Music Assistant",
    "layout.music.hint": "Now Playing view with album art, transport, position and volume. Leave the player list empty to auto-discover media players from Home Assistant.",
    "layout.music.player_entity": "Primary player",
    "layout.music.players": "Player list (comma separated)",
    "layout.music.apply": "Apply music config",
    "layout.music.no_widgets": "Music pages render a dedicated Now Playing view and do not use widgets.",
    "layout.music.preview_title": "Now Playing",
    "layout.music.preview_subtitle": "Album art, transport, position and volume",
    "layout.status.energy_page_only": "Energy pages do not accept widgets.",
    "layout.status.music_page_only": "Music pages do not accept widgets.",
    "layout.widgets.heading": "Widgets",
    "layout.widgets.add_sensor": "+ Sensor",
    "layout.widgets.add_binary_sensor": "+ Binary Sensor",
    "layout.widgets.add_button": "+ Button",
    "layout.widgets.add_slider": "+ Slider",
    "layout.widgets.add_graph": "+ Graph",
    "layout.widgets.add_empty_tile": "+ Empty Tile",
    "layout.widgets.add_light_tile": "+ Light Tile",
    "layout.widgets.add_heating_tile": "+ Heating Tile",
    "layout.widgets.add_weather_tile": "+ Weather",
    "layout.widgets.add_weather_3day": "+ Weather Forecast",
    "layout.widgets.add_todo": "+ Todo List",
    "layout.widgets.add_media_player": "+ Media Player",
    "layout.widgets.add_roborock": "+ Roborock",
    "layout.widgets.add_alarm_tile": "+ Alarm Panel",
    "layout.widgets.add_clock": "+ Clock",
    "layout.widgets.quick_setup": "Quick Setup",
    "layout.widgets.delete": "Delete Widget",
    "layout.widgets.confirm_delete": "Delete widget \"{name}\"?",
    "entity_picker.title": "Choose Light",
    "entity_picker.title_sensor": "Choose Sensor",
    "entity_picker.title_binary": "Choose Binary Sensor",
    "entity_picker.title_light": "Choose Light",
    "entity_picker.title_switch": "Choose Switch",
    "entity_picker.title_weather": "Choose Weather",
    "entity_picker.title_climate": "Choose Heating",
    "entity_picker.title_roborock": "Choose Roborock",
    "entity_picker.title_alarm": "Choose Alarm Panel",
    "entity_picker.title_cover": "Choose Cover",
    "entity_picker.title_scene": "Choose Scene",
    "entity_picker.title_person": "Choose Person",
    "entity_picker.title_timer": "Choose Timer",
    "entity_picker.refresh": "Refresh",
    "entity_picker.search": "Search",
    "entity_picker.close": "Close",
    "entity_picker.search_placeholder": "Search by name, entity ID, or room",
    "entity_picker.search_hint": "Type at least {count} characters to search {items}.",
    "entity_picker.search_ready": "Press Enter or Search to query {items}.",
    "entity_picker.blank": "Blank Light Tile",
    "entity_picker.blank_sensor": "Blank Sensor Tile",
    "entity_picker.blank_binary": "Blank Binary Sensor Tile",
    "entity_picker.blank_light": "Blank Light Tile",
    "entity_picker.blank_button": "Blank Button Tile",
    "entity_picker.blank_weather": "Blank Weather Tile",
    "entity_picker.blank_weather_3day": "Blank Weather Forecast Tile",
    "entity_picker.blank_graph": "Blank Graph Tile",
    "entity_picker.blank_heating": "Blank Heating Tile",
    "entity_picker.blank_roborock": "Blank Roborock Tile",
    "entity_picker.blank_alarm": "Blank Alarm Tile",
    "entity_picker.blank_cover": "Blank Cover Tile",
    "entity_picker.blank_scene": "Blank Scene Tile",
    "entity_picker.blank_person": "Blank Person Tile",
    "entity_picker.blank_timer": "Blank Timer Tile",
    "entity_picker.loading": "Loading lights...",
    "entity_picker.loading_items": "Loading {items}...",
    "entity_picker.refreshing": "Refreshing lights...",
    "entity_picker.refreshing_items": "Refreshing {items}...",
    "entity_picker.pending": "Waiting for Home Assistant...",
    "entity_picker.disconnected": "Home Assistant is not connected.",
    "entity_picker.empty": "No light entities found.",
    "entity_picker.empty_items": "No {items} found.",
    "entity_picker.truncated": "List truncated by firmware limit.",
    "entity_picker.unassigned_room": "No room",
    "entity_picker.added": "Light tile added: {entity}",
    "entity_picker.added_widget": "{widget} added: {entity}",
    "entity_picker.fetch_failed": "Light discovery failed: {error}",
    "entity_picker.fetch_failed_items": "{items} discovery failed: {error}",
    "entity_picker.progress": "{loaded} / {target}",
    "entity_picker.progress_total": "{loaded} / {target} of {total}",
    "entity_picker.items_light": "lights",
    "entity_picker.items_sensor": "sensors",
    "entity_picker.items_binary": "binary sensors",
    "entity_picker.items_switch": "switches",
    "entity_picker.items_weather": "weather entities",
    "entity_picker.items_climate": "climate entities",
    "entity_picker.items_vacuum": "vacuum robots",
    "entity_picker.items_alarm": "alarm panels",
    "entity_picker.items_cover": "covers",
    "entity_picker.items_scene": "scenes",
    "entity_picker.items_person": "people",
    "entity_picker.items_timer": "timers",
    "entity_picker.widget_light": "Light tile",
    "entity_picker.widget_sensor": "Sensor tile",
    "entity_picker.widget_binary": "Binary Sensor tile",
    "entity_picker.widget_button": "Button tile",
    "entity_picker.widget_weather": "Weather tile",
    "entity_picker.widget_weather_3day": "Weather Forecast tile",
    "entity_picker.widget_graph": "Graph tile",
    "entity_picker.widget_heating": "Heating tile",
    "entity_picker.widget_roborock": "Roborock tile",
    "entity_picker.widget_alarm": "Alarm tile",
    "entity_picker.widget_cover": "Cover tile",
    "entity_picker.widget_scene": "Scene tile",
    "entity_picker.widget_person": "Person tile",
    "entity_picker.widget_timer": "Timer tile",
    "layout.inspector.heading": "Inspector",
    "layout.inspector.title": "Title",
    "layout.inspector.entity": "Entity",
    "layout.inspector.secondary_entity": "Actual entity (sensor)",
    "layout.inspector.secondary_entity_roborock": "Map entity (image, optional)",
    "layout.inspector.button_mode": "Button mode",
    "layout.inspector.button_accent_color": "Button accent color",
    "layout.inspector.button_style": "Button style",
    "layout.inspector.slider_entity_domain": "Slider entity type",
    "layout.inspector.binary_show_title": "Show title",
    "layout.inspector.binary_color_on": "ON color (empty = auto)",
    "layout.inspector.binary_color_off": "OFF color (empty = auto)",
    "layout.inspector.binary_text_on": "ON text (empty = auto)",
    "layout.inspector.binary_text_off": "OFF text (empty = auto)",
    "layout.inspector.sensor_value_color": "Value color (empty = auto)",
    "layout.inspector.alarm_code": "PIN code (empty = no code)",
    "layout.inspector.alarm_ask_code": "Always ask for PIN (auto: when HA requires it)",
    "layout.inspector.alarm_backend": "Service backend",
    "layout.inspector.alarm_zone_label": "Zone caption (empty = none)",
    "layout.inspector.alarm_show_sensors": "Show open sensors on the tile",
    "layout.inspector.alarm_show_bypassed": "Show bypassed sensor count",
    "layout.inspector.alarm_force_arm": "Ask to force arm when sensors are open",
    "layout.inspector.alarm_skip_delay": "Skip exit delay (Alarmo)",
    "layout.inspector.alarm_modes": "Buttons on the tile",
    "layout.inspector.alarm_mode_away": "Arm away",
    "layout.inspector.alarm_mode_home": "Arm home",
    "layout.inspector.alarm_mode_night": "Arm night",
    "layout.inspector.alarm_mode_vacation": "Arm vacation",
    "layout.inspector.alarm_mode_custom": "Custom bypass",
    "layout.inspector.alarm_mode_disarm": "Disarm",
    "layout.inspector.clock_hint": "Clock tile: shows the current time (and optionally the date).",
    "layout.inspector.clock_show_seconds": "Show seconds",
    "layout.inspector.clock_show_date": "Show date",
    "layout.tile_look.group": "Tile look (this tile)",
    "layout.tile_look.preset": "Preset",
    "layout.tile_look.bg_color": "Background color",
    "layout.tile_look.bg_grad_color": "Gradient end color",
    "layout.tile_look.bg_grad_dir": "Gradient direction",
    "layout.tile_look.border_color": "Border color",
    "layout.tile_look.border_width": "Border width (px)",
    "layout.tile_look.radius": "Corner radius (px)",
    "layout.tile_look.corner_shape": "Corner shape",
    "layout.tile_look.corner_hint": "Square tiles become circles with the max radius.",
    "layout.tile_look.opacity": "BG opacity (%)",
    "layout.tile_look.font_scale": "Font size",
    "layout.tile_look.shadow": "Drop shadow",
    "layout.tile_look.text_color": "Text color (all)",
    "layout.tile_look.title_color": "Title color",
    "layout.tile_look.label_color": "Entity label color",
    "layout.tile_look.value_color": "Value / status color",
    "layout.tile_look.icon_color": "Icon color",
    "layout.tile_look.reset": "Reset tile look",
    "layout.tile_look.hint": "Empty fields use the theme. Colors accept #RRGGBB.",
  "layout.tile_look.copy_source": "Copy look from",
  "layout.tile_look.copy_apply": "Copy look",
  "layout.tile_look.copy_apply_page": "Apply to all tiles",
  "layout.tile_look.copy_placeholder": "Select a tile...",
  "layout.tile_look.copy_empty": "No other tiles to copy from",
  "layout.tile_look.copy_none": "Select a source tile first.",
  "layout.tile_look.copy_done": "Tile look copied from: {source}",
  "layout.tile_look.copy_page_done": "Tile look applied to {count} tile(s).",
  "layout.tile_look.copy_hint": "Copies background, border, colors and font size only - entity, title and size stay untouched.",
    "layout.page_look.heading": "Page look",
    "layout.page_look.group": "Page look (this page)",
    "layout.page_look.preset": "Preset",
    "layout.page_look.bg_color": "Background color",
    "layout.page_look.bg_grad_color": "Gradient end color",
    "layout.page_look.bg_grad_dir": "Gradient direction",
    "layout.page_look.wallpaper": "Use panel wallpaper",
    "layout.page_look.dim": "Darken wallpaper (%)",
    "layout.page_look.reset": "Reset page look",
    "layout.page_look.reset_done": "Page look reset.",
    "layout.page_look.page_theme": "Theme override for this page",
    "layout.page_look.page_theme_hint": "The page is repainted with this theme as soon as it is shown. \"Global\" follows the active / day-night theme.",
    "layout.page_look.theme_none": "- global / day-night theme -",
    "layout.page_look.hint": "Empty fields use the panel background. The wallpaper is dark-tinted on the panel.",
    "layout.option.page_preset.auto": "Panel default",
    "layout.option.page_preset.midnight": "Midnight",
    "layout.option.page_preset.deep_sea": "Deep sea",
    "layout.option.page_preset.forest": "Forest",
    "layout.option.page_preset.sunset": "Sunset",
    "layout.option.page_preset.plum": "Plum",
    "layout.option.page_preset.wallpaper": "Wallpaper",
    "layout.option.page_preset.wallpaper_dim": "Wallpaper (dark)",
    "layout.option.page_grad_dir.none": "None",
    "layout.option.page_grad_dir.hor": "Horizontal",
    "layout.option.page_grad_dir.ver": "Vertical",
    "layout.option.tile_grad_dir.none": "None",
    "layout.option.tile_grad_dir.hor": "Horizontal",
    "layout.option.tile_grad_dir.ver": "Vertical",
    "layout.option.tile_font_scale.auto": "Auto",
    "layout.option.tile_font_scale.s": "Small",
    "layout.option.tile_font_scale.m": "Medium",
    "layout.option.tile_font_scale.l": "Large",
    "layout.option.tile_font_scale.xl": "Extra large",
    "layout.option.tile_preset.auto": "Theme default",
    "layout.option.tile_preset.graphite": "Graphite",
    "layout.option.tile_preset.emerald": "Emerald",
    "layout.option.tile_preset.amber": "Amber",
    "layout.option.tile_preset.violet": "Violet",
    "layout.option.tile_preset.sky": "Sky",
    "layout.option.tile_preset.glass": "Glass",
    "layout.option.tile_corner.custom": "Custom (use radius)",
    "layout.option.tile_corner.square": "Square (0 px)",
    "layout.option.tile_corner.soft": "Soft (10 px)",
    "layout.option.tile_corner.rounded": "Rounded (16 px)",
    "layout.option.tile_corner.pill": "Pill (40 px)",
    "layout.option.tile_corner.circle": "Circle (max radius)",
    "layout.inspector.slider_direction": "Slider direction",
    "layout.inspector.slider_accent_color": "Slider accent color",
    "layout.inspector.graph_line_color": "Graph line color",
    "layout.inspector.graph_time_window_min": "Time window (minutes)",
    "layout.inspector.graph_point_count": "Render points (empty = auto)",
    "layout.inspector.graph_display_mode": "Display mode",
    "layout.inspector.graph_bar_bucket_min": "Bar interval (min)",
    "layout.option.graph_display_mode.line": "Line with points",
    "layout.option.graph_display_mode.line_smooth_points": "Smooth line with points",
    "layout.option.graph_display_mode.line_smooth": "Smooth line",
    "layout.option.graph_display_mode.bars": "Bars",
    "layout.inspector.apply": "Apply",
    "layout.option.button_mode.auto": "auto (default switch)",
    "layout.option.button_style.switch": "switch (default)",
    "layout.option.button_style.power_toggle": "power toggle",
    "layout.option.button_style.power_status": "power status",
    "layout.option.button_style.plug_icon": "plug icon",
    "layout.option.button_style.lamp_icon": "lamp icon",
    "layout.option.button_style.highlight": "highlight",
    "layout.option.button_style.status_text": "status text",
    "layout.option.button_mode.play_pause": "play/pause (media_player)",
    "layout.option.button_mode.stop": "stop (media_player)",
    "layout.option.button_mode.next": "next (media_player)",
    "layout.option.button_mode.previous": "previous (media_player)",
    "layout.option.slider_entity_domain.auto": "auto (light, media_player, cover)",
    "layout.option.slider_entity_domain.light": "light",
    "layout.option.slider_entity_domain.media_player": "media_player",
    "layout.option.slider_entity_domain.cover": "cover",
    "layout.option.slider_direction.auto": "auto (width/height based)",
    "layout.option.slider_direction.left_to_right": "left_to_right (0% -> 100%)",
    "layout.option.slider_direction.right_to_left": "right_to_left (100% -> 0%)",
    "layout.option.slider_direction.bottom_to_top": "bottom_to_top (0% -> 100%)",
    "layout.option.slider_direction.top_to_bottom": "top_to_bottom (100% -> 0%)",
    "layout.actions.heading": "Actions",
    "layout.actions.reload": "Reload",
    "layout.actions.save": "Save",
    "layout.actions.export": "Export",
    "layout.actions.import": "Import JSON",
    "layout.actions.paste_placeholder": "Paste layout JSON here",
    "layout.canvas.title": "Canvas",
    "layout.default_page.title": "Living Room",
    "layout.status.loading": "Loading layout...",
    "layout.status.load_failed": "Layout load failed, using default: {error}",
    "layout.status.loaded": "Layout loaded",
    "layout.status.entity_fetch_failed": "Entity fetch failed: {error}",
    "layout.status.saving": "Saving layout...",
    "layout.status.saved": "Layout saved",
    "layout.status.imported": "Layout imported (not saved yet)",
    "layout.status.at_least_one_page": "At least one page is required",
    "layout.status.entity_domain_required": "Entity must use domain: {domains}",
    "layout.status.expected_domain": "the expected domain",
    "layout.status.secondary_sensor_required": "Actual entity must start with sensor.",
    "layout.status.secondary_image_required": "Map entity must start with image.",
    "layout.status.invalid_json": "Invalid layout JSON",
    "layout.status.save_failed": "Save failed: {error}",
    "layout.status.conflict_title": "Panel layout was changed elsewhere",
    "layout.status.conflict_confirm": "The layout on the panel was changed from another source (another browser tab, the API or a restore).\n\nOK = overwrite it with this editor version\nCancel = keep the panel version (reload the page to discard local edits).",
    "layout.status.conflict_overridden": "Panel changes overwritten by this editor.",
    "layout.status.import_failed": "Import failed: {error}",
    "layout.status.file_import_failed": "File import failed: {error}",
    "setup.title": "Quick Setup",
    "setup.step_ha": "HA connected",
    "setup.step_tiles": "Add tiles",
    "setup.step_save": "Save layout",
    "setup.subtitle": "Pick a few Home Assistant entities for your first dashboard.",
    "setup.page_label": "First page title",
    "setup.page_placeholder": "Living Room",
    "setup.add_light": "+ Light",
    "setup.add_heating": "+ Heating",
    "setup.add_weather": "+ Weather",
    "setup.add_button": "+ Switch",
    "setup.add_sensor": "+ Sensor",
    "setup.close": "Close",
    "setup.skip": "Skip",
    "setup.done": "Save + Done",
    "setup.save": "Save Layout",
    "setup.count_none": "No tiles added yet.",
    "setup.count_one": "1 tile on this page.",
    "setup.count_many": "{count} tiles on this page.",
    "setup.added": "Added: {title}",
    "setup.saving": "Saving layout...",
    "setup.saved": "Layout saved. The panel can use this dashboard now.",
    "setup.save_failed": "Save failed: {error}",
    "provision.wifi.title": "Wi-Fi Provisioning",
    "provision.wifi.subtitle": "Connect the panel to your Wi-Fi.",
    "provision.wifi.ssid": "SSID",
    "provision.wifi.country_code": "Country Code",
    "provision.wifi.password": "Password",
    "provision.wifi.password_placeholder": "Wi-Fi password",
    "provision.wifi.show_password": "Show password",
    "provision.ha.title": "HA Provisioning",
    "provision.ha.subtitle": "Connect the panel to Home Assistant.",
    "provision.ha.ws_url": "WebSocket URL (ws:// or wss://)",
    "provision.ha.token": "Long-lived Access Token",
    "provision.ha.show_token": "Show token",
    "settings.wifi.heading": "Wi-Fi",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "Country Code",
    "settings.wifi.bssid": "BSSID lock (optional)",
    "settings.wifi.password": "Password",
    "settings.wifi.password_placeholder": "Leave empty to keep the stored password",
    "settings.wifi.static_enabled": "Use static IP (instead of DHCP)",
    "settings.wifi.static_ip": "IP address",
    "settings.wifi.static_netmask": "Netmask",
    "settings.wifi.static_gateway": "Gateway",
    "settings.wifi.static_dns": "DNS (optional)",
    "settings.wifi.invalid_static_ip": "IP address, netmask and gateway must be valid IPv4 addresses when static IP is enabled",
    "settings.ha.heading": "Home Assistant",
    "settings.ha.ws_url": "WebSocket URL (ws:// or wss://)",
    "settings.ha.token": "Long-lived Access Token",
    "settings.ha.token_placeholder": "Leave empty to keep the stored token",
    "settings.ha.rest_fallback": "Enable HA REST fallback (Default: Off, WS-only preferred)",
    "settings.time.heading": "Time",
    "settings.time.ntp_server": "NTP Server",
    "settings.time.timezone": "Timezone",
    "settings.time.search": "Search timezone…",
    "settings.time.show_zones": "Show timezones",
    "settings.time.search_hint": "Type part of a city or region, then select a timezone.",
    "settings.time.no_matches": "No matching timezones",
    "settings.time.local_time": "Current local time",
    "settings.time.clock_unavailable": "Device time unavailable or not synchronized",
    "settings.time.legacy_active": "Existing legacy timezone",
    "settings.time.legacy_hint": "Existing timezone is preserved. Select a location to replace it.",
    "settings.time.list_unavailable": "Timezone list unavailable. Reload settings.",
    "settings.ui.heading": "UI",
    "settings.theme.heading": "Theme",
    "settings.ui.language": "Language",
    "settings.ui.reload_languages": "Reload Languages",
    "settings.ui.download_json": "Download JSON",
    "settings.ui.upload_code": "Language Code",
    "settings.ui.upload_file": "Translation JSON File",
    "settings.ui.upload_button": "Upload / Add Language",
    "settings.ap.heading": "Setup AP",
    "settings.ap.hint": "If setup AP is active, connect to it and open <code>http://192.168.4.1</code>.",
    "settings.ota.heading": "Firmware Update",
    "settings.ota.url": "OTA URL",
    "settings.ota.url_placeholder": "https://github.com/cptkirki/BETTA-HA-PANEL/releases/latest/download/...",
    "settings.ota.flash_url": "Flash URL",
    "settings.ota.refresh": "Refresh Status",
    "settings.ota.file": "OTA .bin File",
    "settings.ota.upload": "Upload + Flash",
    "settings.ota.idle": "Ready for an OTA app image. Running: {running}, next slot: {next}, slot size: {size}.",
    "settings.ota.running": "OTA running: {progress}% ({written} / {total})",
    "settings.ota.downloading": "Downloading from URL: {progress}% ({written} / {total})",
    "settings.ota.uploading": "Upload received by panel: {progress}% ({written} / {total})",
    "settings.ota.success": "OTA image written. Rebooting now.",
    "settings.ota.error": "OTA failed: {error}",
    "settings.ota.rebooting": "Device is rebooting. Reopen the panel after it is back online.",
    "settings.ota.no_file": "Choose an OTA .bin file first.",
    "settings.ota.no_url": "Paste an OTA URL first.",
    "settings.ota.starting_url": "Starting OTA from URL...",
    "settings.ota.upload_progress": "Uploading to panel: {progress}% ({written} / {total})",
    "settings.ota.request_failed": "OTA request failed: {error}",
    "settings.ota.target_slot": "Target slot: {partition}",
    "settings.system.heading": "System",
    "settings.system.auto_restart_enabled": "Auto-restart the panel periodically",
    "settings.system.auto_restart_hours": "Restart every (hours)",
    "settings.system.hint": "When enabled, the panel reboots automatically after the configured number of hours (1-168).",
    "settings.backup.heading": "Backup / Restore",
    "settings.backup.hint": "The backup file contains the layout, the public settings and all custom themes. Wi-Fi credentials, the HA token, the MQTT password and the wallpaper image are deliberately NOT included.",
    "settings.backup.download": "Download backup",
    "settings.backup.file": "Backup file to restore",
    "settings.backup.restore": "Restore backup",
    "settings.backup.choose_file": "Choose a backup JSON file first.",
    "settings.backup.downloading": "Downloading backup...",
    "settings.backup.downloaded": "Backup downloaded.",
    "settings.backup.download_failed": "Backup download failed: {error}",
    "settings.backup.restoring": "Restoring backup...",
    "settings.backup.restore_failed": "Restore failed: {error}",
    "settings.backup.restored": "Backup restored: layout {layout}, settings {settings}, themes {themes}.",
    "settings.backup.restart_hint": "Connection settings changed - restart the panel to apply them.",
    "settings.logs.heading": "Logs",
    "settings.logs.refresh": "Refresh",
    "settings.logs.pause": "Pause",
    "settings.logs.resume": "Resume",
    "settings.logs.clear": "Clear",
    "settings.logs.auto_scroll": "Auto-scroll",
    "settings.logs.download": "Download log",
    "settings.logs.loading": "Loading logs...",
    "settings.logs.empty": "No log entries yet. Errors, warnings and crash markers will appear here.",
    "settings.logs.updated": "Updated {time}",
    "settings.logs.fetch_failed": "Could not read logs: {error}",
    "settings.logs.cleared": "Log file cleared.",
    "settings.logs.clear_failed": "Could not clear logs: {error}",
    "settings.diagnostics.heading": "Diagnostics",
    "settings.diagnostics.refresh": "Refresh",
    "settings.diagnostics.auto_refresh": "Auto-refresh (10 s)",
    "settings.diagnostics.loading": "Reading diagnostics...",
    "settings.diagnostics.updated": "Updated {time}",
    "settings.diagnostics.empty": "No data.",
    "settings.diagnostics.fetch_failed": "Could not read diagnostics: {error}",
    "settings.diagnostics.yes": "yes",
    "settings.diagnostics.no": "no",
    "settings.diagnostics.uptime": "Uptime",
    "settings.diagnostics.reset_reason": "Reset reason",
    "settings.diagnostics.boot_count": "Boot count",
    "settings.diagnostics.cpu_temp": "CPU temperature",
    "settings.diagnostics.version": "Firmware version",
    "settings.diagnostics.project": "Build project",
    "settings.diagnostics.idf": "ESP-IDF",
    "settings.diagnostics.build_date": "Built",
    "settings.diagnostics.panel": "Chip",
    "settings.diagnostics.screen": "Screen",
    "settings.diagnostics.heap_free": "Heap free",
    "settings.diagnostics.heap_min": "Heap low watermark",
    "settings.diagnostics.heap_largest": "Largest free block",
    "settings.diagnostics.heap_fragmentation": "Fragmentation",
    "settings.diagnostics.heap_dma": "Internal DMA free / largest",
    "settings.diagnostics.heap_blocks": "Heap blocks used / free",
    "settings.diagnostics.iram_free": "IRAM free",
    "settings.diagnostics.psram_free": "PSRAM free",
    "settings.diagnostics.connected": "Connected",
    "settings.diagnostics.ssid": "SSID",
    "settings.diagnostics.ip": "IP address",
    "settings.diagnostics.rssi": "RSSI",
    "settings.diagnostics.channel": "Channel",
    "settings.diagnostics.wifi_drops": "Wi-Fi disconnects",
    "settings.diagnostics.wifi_reconnects": "Reconnect attempts",
    "settings.diagnostics.wifi_recoveries": "Driver recoveries",
    "settings.diagnostics.wifi_last_drop": "Last disconnect",
    "settings.diagnostics.wifi_session": "Previous session",
    "settings.diagnostics.sync_done": "Initial sync done",
    "settings.diagnostics.base_url": "HA REST URL",
    "settings.diagnostics.cert_cn": "TLS common name",
    "settings.diagnostics.ws_connects": "WS connects",
    "settings.diagnostics.ws_disconnects": "WS disconnects",
    "settings.diagnostics.ws_recoveries": "HA recoveries",
    "settings.diagnostics.ws_last_session": "Last WS session",
    "settings.diagnostics.missing_entities": "Missing entities",
    "settings.diagnostics.mqtt_enabled": "MQTT enabled",
    "settings.diagnostics.mqtt_tls": "MQTT TLS",
    "settings.diagnostics.broker": "Broker",
    "settings.diagnostics.running_partition": "Running partition",
    "settings.diagnostics.next_partition": "Next update slot",
    "settings.diagnostics.image_state": "Image state",
    "settings.diagnostics.rollback_enabled": "Rollback enabled",
    "settings.diagnostics.boot_confirmed": "Image confirmed",
    "settings.diagnostics.card_status": "Status",
    "settings.diagnostics.card_firmware": "Firmware",
    "settings.diagnostics.card_memory": "Memory",
    "settings.diagnostics.card_wifi": "Wi-Fi",
    "settings.diagnostics.card_ha": "Home Assistant",
    "settings.diagnostics.card_mqtt": "MQTT",
    "settings.diagnostics.card_ota": "OTA / rollback",
    "settings.diagnostics.ota_state.new": "new (not booted yet)",
    "settings.diagnostics.ota_state.pending_verify": "pending verification",
    "settings.diagnostics.ota_state.valid": "valid",
    "settings.diagnostics.ota_state.invalid": "invalid",
    "settings.diagnostics.ota_state.aborted": "aborted",
    "settings.diagnostics.ota_state.undefined": "not tracked (bootloader without rollback)",
    "settings.diagnostics.bootloader_note": "The firmware supports rollback, but the bootloader on the panel does not track image state yet. Flash the bootloader once over USB (idf.py flash) to arm automatic rollback after a failed update.",
    "settings.actions.heading": "Settings Actions",
    "settings.actions.reload": "Reload Settings",
    "settings.actions.save": "Save + Reboot",
    "settings.actions.hint": "After save, the device reboots and may switch from setup AP to your home Wi-Fi.",
    "settings.info.configured": "Configured",
    "settings.info.connected": "Connected",
    "settings.info.password_stored": "Password stored",
    "settings.info.country": "Country",
    "settings.info.rssi": "RSSI (connected AP)",
    "settings.info.connected_bssid": "Connected BSSID",
    "settings.info.channel": "Channel",
    "settings.info.token_stored": "Token stored",
    "settings.info.rest_fallback": "REST fallback",
    "common.yes": "yes",
    "common.no": "no",
    "common.scan": "Scan",
    "common.scan_wifi": "Scan Wi-Fi",
    "common.save_reboot": "Save + Reboot",
    "status.idle": "Idle",
    "status.loading_settings": "Loading settings...",
    "status.settings_loaded": "Settings loaded",
    "status.settings_load_failed": "Settings load failed: {error}",
    "status.settings_save_failed": "Settings save failed: {error}",
    "ha_diagnostics.missing_title": "Some entities in this layout were not found in Home Assistant",
    "ha_diagnostics.missing_title_more": "Some entities in this layout were not found in Home Assistant ({total} total, showing {listed})",
    "ha_diagnostics.missing_hint": "Open the affected widget, pick a valid entity and save the layout.",
    "ha_diagnostics.dismiss": "Dismiss",
    "status.saving_settings": "Saving settings...",
    "status.settings_saved_reboot": "Settings saved. Device reboots in ~2s. Reconnect and reopen the panel URL.",
    "status.wifi_scan_running": "Scanning Wi-Fi...",
    "status.wifi_scan_complete": "Wi-Fi scan complete ({count} networks)",
    "status.wifi_scan_failed": "Wi-Fi scan failed: {error}",
    "status.wifi_scan_timeout": "Wi-Fi scan request timed out",
    "common.unknown_error": "Unknown error",
    "wifi.scan_unavailable": "Wi-Fi scan is unavailable in setup AP mode on this hardware. Enter SSID manually.",
    "wifi.scan_click": "Click \"Scan Wi-Fi\" to list nearby networks.",
    "wifi.scan_click_short": "Click \"Scan\" to list nearby networks.",
    "wifi.scan_no_networks": "No networks found. Move closer to your router and scan again.",
    "wifi.scan_found": "{count} network(s) found. Select one to fill SSID.",
    "wifi.scan.connected_tag": "connected",
    "wifi.scan.option_unavailable": "Scan unavailable",
    "wifi.scan.option_scanning": "Scanning...",
    "wifi.scan.option_not_run": "No scan yet",
    "wifi.scan.option_no_networks": "No networks found",
    "wifi.scan.option_select": "Select network ({count} found)",
    "settings.time.info": "Applied after reboot. Time sync starts when Wi-Fi is connected.",
    "settings.display.heading": "Display / Screensaver",
    "settings.display.info": "Brightness and colors apply immediately. Wallpaper upload is stored on the device.",
    "settings.display.brightness": "Brightness (%)",
    "settings.display.screensaver_enabled": "Screensaver",
    "settings.display.screensaver_timeout": "Screensaver timeout (sec)",
    "settings.display.saver_brightness": "Screensaver brightness (%)",
    "settings.display.screen_off_enabled": "Turn off screen",
    "settings.display.screen_off_timeout": "Screen off timeout (sec)",
    "settings.display.clock_format": "Clock format",
    "settings.display.clock_format_h24": "24-hour (European, 23:00)",
    "settings.display.clock_format_h12": "12-hour (AM/PM, 11:00 PM)",
    "settings.display.clock_format_hint": "The 12-hour format shows an AM/PM marker on the screensaver clock and next to the top bar clock.",
    "settings.display.clock_style": "Clock style",
    "settings.display.clock_style_classic": "Classic",
    "settings.display.clock_style_flip": "Flip cards",
    "settings.display.clock_style_hint": "Flip cards animate on every change but show HH:MM only (no seconds).",
    "settings.display.show_seconds": "Show seconds",
    "settings.display.show_date": "Show date",
    "settings.display.clock_color": "Clock color",
    "settings.display.date_color": "Date color",
    "settings.display.night_mode_enabled": "Night schedule (dim / switch off at night)",
    "settings.display.night_start": "Night start",
    "settings.display.night_end": "Night end",
    "settings.display.night_brightness": "Night brightness (%, 0 = screen off)",
    "settings.display.night_wake": "Touch wake inside the night window (sec)",
    "settings.display.night_hint": "Inside the night window the panel forces the night brightness (0% switches the screen off). Touching the screen wakes it up for the configured number of seconds. Requires a synced clock.",
    "settings.display.night_currently_active": "Night mode is active right now.",
    "settings.display.theme_auto_enabled": "Match the theme to the time of day",
    "settings.display.theme_day": "Day theme",
    "settings.display.theme_night": "Night theme",
    "settings.display.theme_auto_none": "- global theme -",
    "settings.display.theme_auto_hint": "Outside the night window the day theme is painted, inside it the night theme. The window comes from the night start/end times below and works even when the night brightness schedule is off. A page that sets page_theme in the layout still overrides both. Requires a synced clock.",
    "settings.display.wallpaper": "Wallpaper",
    "settings.display.wallpaper_hint": "The image is scaled and converted to RGB565 in the browser, then sent to the panel.",
    "settings.display.upload_wallpaper": "Upload wallpaper",
    "settings.display.remove_wallpaper": "Remove wallpaper",
    "settings.display.apply": "Apply now (no reboot)",
    "settings.display.press_fx": "Tap feedback (visual reaction while a tile is held)",
    "settings.display.press_fx_dim": "Dim (%)",
    "settings.display.press_fx_scale": "Shrink (% of size)",
    "settings.display.press_fx_none": "None",
    "settings.display.press_fx_dim_mode": "Dim",
    "settings.display.press_fx_scale_mode": "Shrink",
    "settings.display.press_fx_both": "Dim + shrink",
    "settings.display.press_fx_hint": "Applies to tiles that react to a tap on the whole tile (switch, button, heating). Hold the sample below to preview.",
    "settings.display.press_fx_preview": "Tile",
    "settings.display.value_anim": "Value animation (when a tile value changes)",
    "settings.display.value_anim_ms": "Duration (ms)",
    "settings.display.value_anim_none": "None",
    "settings.display.value_anim_fade": "Fade in",
    "settings.display.value_anim_slide": "Slide in",
    "settings.display.value_anim_count": "Counting digits",
    "settings.display.value_anim_preview": "Preview",
    "settings.display.value_anim_hint": "Animates values that change by themselves (sensors, weather, power). Counting digits keeps the unit in place and works with values like \"22.5 °C\". 0 ms turns the effect off.",
    "settings.display.topbar": "Top bar",
    "settings.display.topbar_show_clock": "Clock",
    "settings.display.topbar_show_date": "Date",
    "settings.display.topbar_show_gear": "Settings icon",
    "settings.display.topbar_show_status": "Wi-Fi / HA icons",
    "settings.display.topbar_icon_text": "Text instead of logos",
    "settings.display.topbar_custom_colors": "Own colours",
    "settings.display.topbar_bg_color": "Bar background",
    "settings.display.topbar_clock_color": "Clock colour",
    "settings.display.topbar_date_color": "Date colour",
    "settings.display.topbar_gear_color": "Settings icon colour",
    "settings.display.topbar_ha_color": "Home Assistant colour",
    "settings.display.topbar_wifi_color": "Wi-Fi colour",
    "settings.display.topbar_hint": "The clock is centred in the space that is left over and its font shrinks automatically, so the elements never overlap. \"Text instead of logos\" replaces the Wi-Fi / Home Assistant / gear glyphs with words.",
    "settings.display.topbar_color_hint": "With \"Own colours\" switched off the top bar follows the active theme.",
    "settings.display.navbar": "Bottom bar (page tabs)",
    "settings.display.nav_custom_colors": "Own colours",
    "settings.display.nav_bar_bg_color": "Bar background",
    "settings.display.nav_bar_border_color": "Bar top border",
    "settings.display.nav_button_bg_color": "Tab background",
    "settings.display.nav_button_border_color": "Tab border",
    "settings.display.nav_tab_idle_color": "Page title colour",
    "settings.display.nav_tab_active_color": "Active page title colour",
    "settings.display.nav_home_idle_color": "Home icon colour",
    "settings.display.nav_home_active_color": "Active home icon colour",
    "settings.display.nav_hint": "The bottom bar shows the home button and one tab per page. Tab titles are shortened with \"...\" when a page name is too long.",
    "settings.display.nav_color_hint": "With \"Own colours\" switched off the bottom bar follows the active theme.",
    "settings.display.applied": "Display settings applied.",
    "settings.display.no_wallpaper_file": "Choose an image file first.",
    "settings.display.converting": "Converting image...",
    "settings.display.convert_failed": "Image conversion failed.",
    "settings.display.uploading": "Uploading wallpaper...",
    "settings.display.wallpaper_uploaded": "Wallpaper uploaded.",
    "settings.display.removing": "Removing wallpaper...",
    "settings.display.wallpaper_removed": "Wallpaper removed.",
    "settings.sd.heading": "microSD card",
    "settings.sd.enabled": "Enable microSD card (TF slot)",
    "settings.sd.refresh": "Refresh",
    "settings.sd.export_logs": "Export logs to card",
    "settings.sd.format": "Format card",
    "settings.sd.format_confirm": "Format the microSD card? Every file on it will be erased.",
    "settings.sd.up": "Up",
    "settings.sd.root": "Card root",
    "settings.sd.logs": "Logs folder",
    "settings.sd.photos": "Photos folder",
    "settings.sd.unsupported": "This board has no microSD socket.",
    "settings.sd.disabled": "microSD support is disabled. Tick the box to mount the card at boot.",
    "settings.sd.no_card": "No card detected in the slot. Insert it and press Refresh - the panel also picks it up on its own while it runs.",
    "settings.sd.no_filesystem": "Card {name} detected, but it carries no FAT filesystem the panel can read. Press \"Format\" to prepare it - this erases the card.",
    "settings.sd.exfat": "Card {name} is formatted as exFAT, which the panel cannot read. Press \"Format\" to convert it to FAT32 - this erases the card.",
    "settings.sd.ntfs": "Card {name} is formatted as NTFS, which the panel cannot read. Press \"Format\" to convert it to FAT32 - this erases the card.",
    "settings.sd.formatting": "Formatting... the first mount of a new card can take a few seconds.",
    "settings.sd.mounted": "Card: {name} - {total} MB total, {free} MB free",
    "settings.sd.empty": "This folder is empty.",
    "settings.sd.loading": "Reading the card...",
    "settings.sd.delete": "Delete",
    "settings.sd.delete_confirm": "Delete {name} from the card?",
    "settings.sd.deleted": "File deleted.",
    "settings.sd.delete_failed": "Could not delete this item.",
    "settings.sd.use_wallpaper": "Use as wallpaper",
    "settings.sd.wallpaper_failed": "Could not convert this image into a wallpaper.",
    "settings.sd.wallpaper_ok": "Image from the card is now the wallpaper.",
    "settings.sd.wallpaper_sd": "Screensaver picture: stored on this microSD card (the panel keeps a single copy and moves it to internal flash when the card is removed).",
    "settings.sd.wallpaper_flash": "Screensaver picture: stored in internal flash (it moves onto the card as soon as one is mounted).",
    "settings.sd.wallpaper_none": "Screensaver picture: none yet - upload one in Display settings.",
    "settings.sd.exporting": "Exporting logs...",
    "settings.sd.exported": "Logs exported to {path}",
    "settings.sd.export_failed": "Log export failed.",
    "settings.sd.formatting": "Formatting...",
    "settings.sd.formatted": "Card formatted.",
    "settings.sd.format_failed": "Format failed.",
    "settings.sd.type_dir": "Folder",
    "settings.sd.status_enabled": "microSD support enabled.",
    "settings.sd.status_disabled": "microSD support disabled.",
    "settings.sd.apply_failed": "Could not apply the microSD setting.",
    "settings.pages.heading": "Pages / Page transition",
    "settings.pages.transition": "Page transition",
    "settings.pages.transition_ms": "Transition duration (ms)",
    "settings.pages.transition_hint": "Animation played when the panel switches pages. 0 ms disables the selected effect.",
    "settings.pages.option_none": "None (instant)",
    "settings.pages.option_fade": "Fade",
    "settings.pages.option_slide": "Slide (left/right)",
    "settings.pages.option_slide_up": "Slide (up/down)",
    "settings.pages.option_fade_slide": "Fade + slide",
    "settings.pages.target": "Show page on panel",
    "settings.pages.reload": "Reload page list",
    "settings.pages.show": "Show now",
    "settings.pages.activated": "Page \"{page}\" is now shown on the panel.",
    "settings.pages.current": "Page currently shown: {page}",
    "settings.pages.apply": "Apply now (no reboot)",
    "settings.pages.applied": "Page transition settings applied.",
    "settings.mqtt.heading": "MQTT / Home Assistant",
    "settings.mqtt.enabled": "Enable MQTT (auto-discovered as a device in Home Assistant)",
    "settings.mqtt.use_tls": "Encrypt the connection (TLS, mqtts / port 8883)",
    "settings.mqtt.tls_hint": "TLS verifies the broker certificate against the ESP trust bundle. The port switches to 8883 automatically when the field still holds 1883.",
    "settings.mqtt.reapply_hint": "Click \"Apply MQTT\" to push the change to the panel.",
    "settings.mqtt.host": "Broker host (empty = derive from HA URL)",
    "settings.mqtt.port": "Broker port",
    "settings.mqtt.username": "Username",
    "settings.mqtt.password": "Password",
    "settings.mqtt.discovery_prefix": "Discovery prefix",
    "settings.mqtt.info": "The panel appears as a device in Home Assistant via MQTT discovery. Changes apply without reboot.",
    "settings.mqtt.apply": "Apply MQTT (no reboot)",
    "settings.mqtt.applied": "MQTT settings applied.",
    "settings.ui.info": "Preview switches immediately. Saved language applies after reboot.",
    "settings.ap.active": "Setup AP active: {ssid}\\nOpen http://192.168.4.1 while connected to this AP.",
    "settings.ap.inactive": "Setup AP inactive.\\nUse the panel IP in your home Wi-Fi network.",
    "settings.translation.info": "Upload a JSON file to add or update a language.",
    "settings.translation.upload_ok": "Language \"{lang}\" uploaded.",
    "settings.translation.upload_fail": "Upload failed: {error}",
    "settings.translation.no_file": "Choose a JSON file first.",
    "settings.translation.invalid_json": "Invalid JSON",
    "settings.translation.object_required": "JSON must be an object",
    "settings.translation.invalid_code": "Language code must use [a-z0-9_-] and be 2-15 chars.",
    "settings.language.invalid_country": "Wi-Fi country code must be a 2-letter ISO code (e.g. US, DE)",
    "settings.language.invalid_bssid": "BSSID must be empty or in format AA:BB:CC:DD:EE:FF",
    "settings.language.invalid_ha_url": "HA URL must start with ws:// or wss://",
    "provision.wifi.required_ssid": "SSID is required.",
    "provision.wifi.required_country": "Country code must be 2 letters (e.g. US, DE).",
    "provision.ha.required_url": "WebSocket URL is required.",
    "provision.ha.invalid_url": "HA URL must start with ws:// or wss://.",
    "provision.ha.required_token": "Long-lived Access Token is required.",
    "provision.saving_reboot": "Saving settings and rebooting...",
    "provision.saved_reboot": "Settings saved. Device reboots in ~2s.",
    "provision.save_failed": "Save failed: {error}",
    "provision.wifi.hint": "Save reboots the panel. After reboot, HA provisioning is shown.",
    "provision.ha.hint": "Save reboots the panel. After reboot, the editor is unlocked.",
    "settings.language.option_de": "Deutsch",
    "settings.language.option_en": "English",
    "settings.language.option_es": "Espanol",
    "settings.language.option_fr": "Francais",
    "settings.language.option_pl": "Polski",
    "settings.language.option_zh-cn": "简体中文",
    "settings.language.option_zh-tw": "繁體中文",
  },
  de: {
    "tabs.layout": "Layout",
    "tabs.settings": "Einstellungen",
    "sidebar.title": "BETTA Editor",
    "sidebar.subtitle": "Layout Quelle: JSON",
    "layout.pages.heading": "Seiten",
    "layout.pages.add": "+ Seite",
    "layout.pages.add_energy": "+ Energie-Seite",
    "layout.pages.add_music": "+ Musik-Seite",
    "layout.pages.delete": "Loeschen",
    "layout.pages.confirm_delete": "Seite \"{name}\" wirklich loeschen? Alle zugehoerigen Widgets werden entfernt.",
    "layout.pages.title_label": "Seitentitel",
    "layout.pages.title_placeholder": "Seitenname auf dem Display",
    "layout.pages.apply_title": "Seitentitel uebernehmen",
    "layout.pages.new_title": "Seite {number}",
    "layout.pages.energy_title": "Energie",
    "layout.pages.music_title": "Musik",
    "layout.energy.heading": "Energie-Seite",
    "layout.energy.hint": "Waehle, ob die Seite Home Assistant Energy spiegelt oder manuelle Live-Sensoren nutzt.",
    "layout.energy.source": "Datenquelle",
    "layout.energy.source_ha": "Home Assistant Energy",
    "layout.energy.source_manual": "Manuelle Live-Sensoren",
    "layout.energy.source_hint_ha": "Verwendet das in Home Assistant konfigurierte Energy Dashboard.",
    "layout.energy.source_hint_manual": "Expert-Fallback: explizite W/kW-Sensoren aus Home Assistant nutzen.",
    "layout.energy.home_power": "Hausleistung",
    "layout.energy.solar_power": "Solarleistung",
    "layout.energy.grid_power": "Netzleistung (signed)",
    "layout.energy.grid_import": "Netzbezug",
    "layout.energy.grid_export": "Netzeinspeisung",
    "layout.energy.battery_power": "Batterieleistung (signed)",
    "layout.energy.battery_charge": "Batterie laden",
    "layout.energy.battery_discharge": "Batterie entladen",
    "layout.energy.battery_soc": "Batterieladestand",
    "layout.energy.apply": "Energie-Konfig uebernehmen",
    "layout.energy.no_widgets": "Energie-Seiten rendern ein eigenes Dashboard und verwenden keine Widgets.",
    "layout.energy.preview_title": "Energieverteilung",
    "layout.energy.sensor_count_one": "{count} Sensor",
    "layout.energy.sensor_count_many": "{count} Sensoren",
    "layout.energy.no_sensor": "kein Sensor",
    "layout.energy.preview_source_ha": "HA Energy",
    "layout.energy.preview_source_manual": "Live-Sensoren",
    "layout.energy.preview_auto": "automatisch aus HA",
    "layout.energy.low_carbon": "Low-carbon",
    "layout.energy.grid": "Netz",
    "layout.energy.solar": "Solar",
    "layout.energy.gas": "Gas",
    "layout.energy.home": "Haus",
    "layout.energy.battery": "Batterie",
    "layout.energy.water": "Wasser",
    "layout.music.heading": "Music Assistant",
    "layout.music.hint": "Now-Playing-Ansicht mit Cover, Transport, Position und Lautstaerke. Lasse die Player-Liste leer, um Media-Player automatisch aus Home Assistant zu erkennen.",
    "layout.music.player_entity": "Primaerer Player",
    "layout.music.players": "Player-Liste (Komma getrennt)",
    "layout.music.apply": "Musik-Konfiguration anwenden",
    "layout.music.no_widgets": "Musik-Seiten rendern eine eigene Now-Playing-Ansicht und nutzen keine Widgets.",
    "layout.music.preview_title": "Jetzt laeuft",
    "layout.music.preview_subtitle": "Cover, Transport, Position und Lautstaerke",
    "layout.status.energy_page_only": "Energie-Seiten akzeptieren keine Widgets.",
    "layout.status.music_page_only": "Musik-Seiten akzeptieren keine Widgets.",
    "layout.widgets.heading": "Widgets",
    "layout.widgets.add_sensor": "+ Sensor",
    "layout.widgets.add_button": "+ Button",
    "layout.widgets.add_slider": "+ Slider",
    "layout.widgets.add_graph": "+ Graph",
    "layout.widgets.add_empty_tile": "+ Empty Tile",
    "layout.widgets.add_light_tile": "+ Light Tile",
    "layout.widgets.add_heating_tile": "+ Heating Tile",
    "layout.widgets.add_weather_tile": "+ Weather",
    "layout.widgets.add_weather_3day": "+ Wetter Vorhersage",
    "layout.widgets.add_todo": "+ Todo Liste",
    "layout.widgets.add_media_player": "+ Media Player",
    "layout.widgets.add_roborock": "+ Roborock",
    "layout.widgets.quick_setup": "Quick Setup",
    "layout.widgets.delete": "Widget loeschen",
    "layout.widgets.confirm_delete": "Widget \"{name}\" wirklich loeschen?",
    "entity_picker.title": "Licht auswaehlen",
    "entity_picker.title_sensor": "Sensor auswaehlen",
    "entity_picker.title_light": "Licht auswaehlen",
    "entity_picker.title_switch": "Schalter auswaehlen",
    "entity_picker.title_weather": "Wetter auswaehlen",
    "entity_picker.title_climate": "Heizung auswaehlen",
    "entity_picker.title_roborock": "Roborock auswaehlen",
    "entity_picker.refresh": "Aktualisieren",
    "entity_picker.search": "Suchen",
    "entity_picker.close": "Schliessen",
    "entity_picker.search_placeholder": "Nach Name, Entitaet oder Raum suchen",
    "entity_picker.search_hint": "Mindestens {count} Zeichen eingeben, um {items} zu suchen.",
    "entity_picker.search_ready": "Enter druecken oder Suchen klicken, um {items} abzufragen.",
    "entity_picker.blank": "Leere Lichtkachel",
    "entity_picker.blank_sensor": "Leere Sensorkachel",
    "entity_picker.blank_light": "Leere Lichtkachel",
    "entity_picker.blank_button": "Leere Button-Kachel",
    "entity_picker.blank_weather": "Leere Wetterkachel",
    "entity_picker.blank_weather_3day": "Leere Wetter-Vorhersage-Kachel",
    "entity_picker.blank_graph": "Leere Graph-Kachel",
    "entity_picker.blank_heating": "Leere Heizungskachel",
    "entity_picker.blank_roborock": "Leere Roborock-Kachel",
    "entity_picker.loading": "Lichter werden geladen...",
    "entity_picker.loading_items": "{items} werden geladen...",
    "entity_picker.refreshing": "Lichter werden aktualisiert...",
    "entity_picker.refreshing_items": "{items} werden aktualisiert...",
    "entity_picker.pending": "Warte auf Home Assistant...",
    "entity_picker.disconnected": "Home Assistant ist nicht verbunden.",
    "entity_picker.empty": "Keine Licht-Entitaeten gefunden.",
    "entity_picker.empty_items": "Keine {items} gefunden.",
    "entity_picker.truncated": "Liste durch Firmware-Limit gekuerzt.",
    "entity_picker.unassigned_room": "Kein Raum",
    "entity_picker.added": "Lichtkachel hinzugefuegt: {entity}",
    "entity_picker.added_widget": "{widget} hinzugefuegt: {entity}",
    "entity_picker.fetch_failed": "Lichtsuche fehlgeschlagen: {error}",
    "entity_picker.fetch_failed_items": "Entitaetssuche fuer {items} fehlgeschlagen: {error}",
    "entity_picker.progress": "{loaded} / {target}",
    "entity_picker.progress_total": "{loaded} / {target} von {total}",
    "entity_picker.items_light": "Lichter",
    "entity_picker.items_sensor": "Sensoren",
    "entity_picker.items_switch": "Schalter",
    "entity_picker.items_weather": "Wetter-Entitaeten",
    "entity_picker.items_climate": "Climate-Entitaeten",
    "entity_picker.items_vacuum": "Saugroboter",
    "entity_picker.widget_light": "Lichtkachel",
    "entity_picker.widget_sensor": "Sensorkachel",
    "entity_picker.widget_button": "Button-Kachel",
    "entity_picker.widget_weather": "Wetterkachel",
    "entity_picker.widget_weather_3day": "Wetter-Vorhersage-Kachel",
    "entity_picker.widget_graph": "Graph-Kachel",
    "entity_picker.widget_heating": "Heizungskachel",
    "entity_picker.widget_roborock": "Roborock-Kachel",
    "layout.inspector.heading": "Inspektor",
    "layout.tile_look.group": "Kachel-Optik (diese Kachel)",
    "layout.tile_look.preset": "Vorlage",
    "layout.tile_look.bg_color": "Hintergrundfarbe",
    "layout.tile_look.bg_grad_color": "Verlaufsendfarbe",
    "layout.tile_look.bg_grad_dir": "Verlaufsrichtung",
    "layout.tile_look.border_color": "Rahmenfarbe",
    "layout.tile_look.border_width": "Rahmenbreite (px)",
    "layout.tile_look.radius": "Eckenradius (px)",
    "layout.tile_look.corner_shape": "Eckenform",
    "layout.tile_look.corner_hint": "Quadratische Kacheln werden beim maximalen Radius zum Kreis.",
    "layout.tile_look.opacity": "Deckkraft Hintergrund (%)",
    "layout.tile_look.font_scale": "Schriftgroesse",
    "layout.tile_look.shadow": "Schlagschatten",
    "layout.tile_look.text_color": "Textfarbe (alle)",
    "layout.tile_look.title_color": "Titelfarbe",
    "layout.tile_look.label_color": "Farbe der Entitaetsbezeichnung",
    "layout.tile_look.value_color": "Farbe fuer Wert / Status",
    "layout.tile_look.icon_color": "Symbolfarbe",
    "layout.tile_look.reset": "Kachel-Optik zuruecksetzen",
    "layout.tile_look.hint": "Leere Felder verwenden das Thema. Farben im Format #RRGGBB.",
  "layout.tile_look.copy_source": "Optik uebernehmen von",
  "layout.tile_look.copy_apply": "Optik uebernehmen",
  "layout.tile_look.copy_apply_page": "Auf alle Kacheln anwenden",
  "layout.tile_look.copy_placeholder": "Kachel waehlen...",
  "layout.tile_look.copy_empty": "Keine weitere Kachel zum Kopieren",
  "layout.tile_look.copy_none": "Zuerst eine Quellkachel waehlen.",
  "layout.tile_look.copy_done": "Kachel-Optik uebernommen von: {source}",
  "layout.tile_look.copy_page_done": "Kachel-Optik auf {count} Kachel(n) angewendet.",
  "layout.tile_look.copy_hint": "Kopiert nur Hintergrund, Rahmen, Farben und Schriftgroesse - Entitaet, Titel und Groesse bleiben unveraendert.",
    "layout.page_look.heading": "Seiten-Optik",
    "layout.page_look.group": "Seiten-Optik (diese Seite)",
    "layout.page_look.preset": "Vorlage",
    "layout.page_look.bg_color": "Hintergrundfarbe",
    "layout.page_look.bg_grad_color": "Farbe des Verlaufsendes",
    "layout.page_look.bg_grad_dir": "Verlaufsrichtung",
    "layout.page_look.wallpaper": "Panel-Hintergrundbild nutzen",
    "layout.page_look.dim": "Hintergrundbild abdunkeln (%)",
    "layout.page_look.reset": "Seiten-Optik zuruecksetzen",
    "layout.page_look.reset_done": "Seiten-Optik zurueckgesetzt.",
    "layout.page_look.page_theme": "Theme nur fuer diese Seite",
    "layout.page_look.page_theme_hint": "Die Seite wird mit diesem Theme neu gezeichnet, sobald sie angezeigt wird. \"Global\" folgt dem aktiven bzw. Tages-/Nacht-Theme.",
    "layout.page_look.theme_none": "- globales / Tag-Nacht-Theme -",
    "layout.page_look.hint": "Leere Felder nutzen den Panel-Hintergrund. Das Hintergrundbild wird am Panel abgedunkelt.",
    "layout.option.page_preset.auto": "Panel-Standard",
    "layout.option.page_preset.midnight": "Mitternacht",
    "layout.option.page_preset.deep_sea": "Tiefsee",
    "layout.option.page_preset.forest": "Wald",
    "layout.option.page_preset.sunset": "Sonnenuntergang",
    "layout.option.page_preset.plum": "Pflaume",
    "layout.option.page_preset.wallpaper": "Hintergrundbild",
    "layout.option.page_preset.wallpaper_dim": "Hintergrundbild (dunkel)",
    "layout.option.page_grad_dir.none": "Keine",
    "layout.option.page_grad_dir.hor": "Horizontal",
    "layout.option.page_grad_dir.ver": "Vertikal",
    "layout.option.tile_grad_dir.none": "Keine",
    "layout.option.tile_grad_dir.hor": "Horizontal",
    "layout.option.tile_grad_dir.ver": "Vertikal",
    "layout.option.tile_font_scale.auto": "Auto",
    "layout.option.tile_font_scale.s": "Klein",
    "layout.option.tile_font_scale.m": "Mittel",
    "layout.option.tile_font_scale.l": "Gross",
    "layout.option.tile_font_scale.xl": "Sehr gross",
    "layout.option.tile_preset.auto": "Themen-Standard",
    "layout.option.tile_preset.graphite": "Graphit",
    "layout.option.tile_preset.emerald": "Smaragd",
    "layout.option.tile_preset.amber": "Bernstein",
    "layout.option.tile_preset.violet": "Violett",
  "layout.option.tile_preset.sky": "Himmel",
    "layout.option.tile_preset.glass": "Glas",
    "layout.option.tile_corner.custom": "Eigener Wert (Radius nutzen)",
    "layout.option.tile_corner.square": "Quadrat (0 px)",
    "layout.option.tile_corner.soft": "Sanft (10 px)",
    "layout.option.tile_corner.rounded": "Abgerundet (16 px)",
    "layout.option.tile_corner.pill": "Pille (40 px)",
    "layout.option.tile_corner.circle": "Kreis (max. Radius)",
    "layout.inspector.title": "Titel",
    "layout.inspector.entity": "Entitaet",
    "layout.inspector.secondary_entity": "Ist-Entitaet (Sensor)",
    "layout.inspector.secondary_entity_roborock": "Karten-Entitaet (image, optional)",
    "layout.inspector.button_mode": "Button Modus",
    "layout.inspector.button_accent_color": "Button Akzentfarbe",
    "layout.inspector.slider_entity_domain": "Slider Entitaetstyp",
    "layout.inspector.slider_direction": "Slider Richtung",
    "layout.inspector.slider_accent_color": "Slider Akzentfarbe",
    "layout.inspector.graph_line_color": "Graph Linienfarbe",
    "layout.inspector.graph_time_window_min": "Zeitfenster (Minuten)",
    "layout.inspector.graph_point_count": "Render Punkte (leer = auto)",
    "layout.inspector.graph_display_mode": "Anzeigeart",
    "layout.inspector.graph_bar_bucket_min": "Balken-Intervall (min)",
    "layout.option.graph_display_mode.line": "Linie mit Punkten",
    "layout.option.graph_display_mode.line_smooth_points": "Glatte Linie mit Punkten",
    "layout.option.graph_display_mode.line_smooth": "Glatte Linie",
    "layout.option.graph_display_mode.bars": "Balken",
    "layout.inspector.apply": "Uebernehmen",
    "layout.option.button_mode.auto": "auto (Default switch)",
    "layout.option.button_mode.play_pause": "play/pause (media_player)",
    "layout.option.button_mode.stop": "stop (media_player)",
    "layout.option.button_mode.next": "next (media_player)",
    "layout.option.button_mode.previous": "previous (media_player)",
    "layout.option.slider_entity_domain.auto": "auto (light, media_player, cover)",
    "layout.option.slider_entity_domain.light": "light",
    "layout.option.slider_entity_domain.media_player": "media_player",
    "layout.option.slider_entity_domain.cover": "cover",
    "layout.option.slider_direction.auto": "auto (nach Breite/Hoehe)",
    "layout.option.slider_direction.left_to_right": "left_to_right (0% -> 100%)",
    "layout.option.slider_direction.right_to_left": "right_to_left (100% -> 0%)",
    "layout.option.slider_direction.bottom_to_top": "bottom_to_top (0% -> 100%)",
    "layout.option.slider_direction.top_to_bottom": "top_to_bottom (100% -> 0%)",
    "layout.actions.heading": "Aktionen",
    "layout.actions.reload": "Neu laden",
    "layout.actions.save": "Speichern",
    "layout.actions.export": "Export",
    "layout.actions.import": "JSON importieren",
    "layout.actions.paste_placeholder": "Layout JSON hier einfuegen",
    "layout.canvas.title": "Canvas",
    "layout.default_page.title": "Wohnzimmer",
    "layout.status.loading": "Layout wird geladen...",
    "layout.status.load_failed": "Layout laden fehlgeschlagen, nutze Default: {error}",
    "layout.status.loaded": "Layout geladen",
    "layout.status.entity_fetch_failed": "Entitaeten laden fehlgeschlagen: {error}",
    "layout.status.saving": "Layout wird gespeichert...",
    "layout.status.saved": "Layout gespeichert",
    "layout.status.imported": "Layout importiert (noch nicht gespeichert)",
    "layout.status.at_least_one_page": "Mindestens eine Seite ist erforderlich",
    "layout.status.entity_domain_required": "Entitaet muss diese Domain nutzen: {domains}",
    "layout.status.expected_domain": "die erwartete Domain",
    "layout.status.secondary_sensor_required": "Ist-Entitaet muss mit sensor. beginnen.",
    "layout.status.secondary_image_required": "Karten-Entitaet muss mit image. beginnen.",
    "layout.status.invalid_json": "Ungueltiges Layout JSON",
    "layout.status.save_failed": "Speichern fehlgeschlagen: {error}",
    "layout.status.conflict_title": "Layout auf dem Panel wurde anderswo geaendert",
    "layout.status.conflict_confirm": "Das Layout auf dem Panel wurde aus einer anderen Quelle geaendert (anderer Browser-Tab, API oder Wiederherstellung).\n\nOK = mit dieser Editor-Version ueberschreiben\nAbbrechen = Panel-Version behalten (Seite neu laden, um lokale Aenderungen zu verwerfen).",
    "layout.status.conflict_overridden": "Aenderungen vom Panel durch diesen Editor ueberschrieben.",
    "layout.status.import_failed": "Import fehlgeschlagen: {error}",
    "layout.status.file_import_failed": "Dateiimport fehlgeschlagen: {error}",
    "setup.title": "Quick Setup",
    "setup.step_ha": "HA verbunden",
    "setup.step_tiles": "Kacheln waehlen",
    "setup.step_save": "Layout speichern",
    "setup.subtitle": "Waehle ein paar Home Assistant Entitaeten fuer dein erstes Dashboard.",
    "setup.page_label": "Titel der ersten Seite",
    "setup.page_placeholder": "Wohnzimmer",
    "setup.add_light": "+ Licht",
    "setup.add_heating": "+ Heizung",
    "setup.add_weather": "+ Wetter",
    "setup.add_button": "+ Schalter",
    "setup.add_sensor": "+ Sensor",
    "setup.close": "Schliessen",
    "setup.skip": "Ueberspringen",
    "setup.done": "Speichern + Fertig",
    "setup.save": "Layout speichern",
    "setup.count_none": "Noch keine Kacheln hinzugefuegt.",
    "setup.count_one": "1 Kachel auf dieser Seite.",
    "setup.count_many": "{count} Kacheln auf dieser Seite.",
    "setup.added": "Hinzugefuegt: {title}",
    "setup.saving": "Layout wird gespeichert...",
    "setup.saved": "Layout gespeichert. Das Panel kann dieses Dashboard jetzt nutzen.",
    "setup.save_failed": "Speichern fehlgeschlagen: {error}",
    "provision.wifi.title": "WLAN Provisioning",
    "provision.wifi.subtitle": "Verbinde das Panel mit deinem WLAN.",
    "provision.wifi.ssid": "SSID",
    "provision.wifi.country_code": "Laendercode",
    "provision.wifi.password": "Passwort",
    "provision.wifi.password_placeholder": "WLAN Passwort",
    "provision.wifi.show_password": "Passwort anzeigen",
    "provision.ha.title": "HA Provisioning",
    "provision.ha.subtitle": "Verbinde das Panel mit Home Assistant.",
    "provision.ha.ws_url": "WebSocket URL (ws:// oder wss://)",
    "provision.ha.token": "Long-lived Access Token",
    "provision.ha.show_token": "Token anzeigen",
    "settings.wifi.heading": "WLAN",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "Laendercode",
    "settings.wifi.bssid": "BSSID Lock (optional)",
    "settings.wifi.password": "Passwort",
    "settings.wifi.password_placeholder": "Leer lassen, um vorhandenes Passwort zu behalten",
    "settings.ha.heading": "Home Assistant",
    "settings.ha.ws_url": "WebSocket URL (ws:// oder wss://)",
    "settings.ha.token": "Long-lived Access Token",
    "settings.ha.token_placeholder": "Leer lassen, um vorhandenen Token zu behalten",
    "settings.ha.rest_fallback": "HA REST Fallback aktivieren (Standard: Aus, WS bevorzugt)",
    "settings.time.heading": "Zeit",
    "settings.time.ntp_server": "NTP Server",
    "settings.time.timezone": "Zeitzone",
    "settings.time.search": "Zeitzone suchen…",
    "settings.time.show_zones": "Zeitzonen anzeigen",
    "settings.time.search_hint": "Gib einen Teil eines Stadt- oder Regionsnamens ein und wähle eine Zeitzone aus.",
    "settings.time.no_matches": "Keine passenden Zeitzonen",
    "settings.time.local_time": "Aktuelle Ortszeit",
    "settings.time.clock_unavailable": "Gerätezeit nicht verfügbar oder noch nicht synchronisiert",
    "settings.time.legacy_active": "Bisherige Zeitzone im alten Format",
    "settings.time.legacy_hint": "Die bisherige Zeitzone bleibt erhalten. Wähle einen Ort aus, um sie zu ersetzen.",
    "settings.time.list_unavailable": "Zeitzonenliste nicht verfügbar. Lade die Einstellungen erneut.",
    "settings.ui.heading": "UI",
    "settings.theme.heading": "Theme",
    "settings.ui.language": "Sprache",
    "settings.ui.reload_languages": "Sprachen neu laden",
    "settings.ui.download_json": "JSON herunterladen",
    "settings.ui.upload_code": "Sprachcode",
    "settings.ui.upload_file": "Uebersetzungsdatei (JSON)",
    "settings.ui.upload_button": "Upload / Sprache hinzufuegen",
    "settings.ap.heading": "Setup AP",
    "settings.ap.hint": "Wenn Setup AP aktiv ist, verbinden und <code>http://192.168.4.1</code> oeffnen.",
    "settings.ota.heading": "Firmware Update",
    "settings.ota.url": "OTA URL",
    "settings.ota.url_placeholder": "https://github.com/cptkirki/BETTA-HA-PANEL/releases/latest/download/...",
    "settings.ota.flash_url": "URL flashen",
    "settings.ota.refresh": "Status aktualisieren",
    "settings.ota.file": "OTA .bin Datei",
    "settings.ota.upload": "Upload + Flash",
    "settings.ota.idle": "Bereit fuer ein OTA App-Image. Laufend: {running}, naechster Slot: {next}, Slotgroesse: {size}.",
    "settings.ota.running": "OTA laeuft: {progress}% ({written} / {total})",
    "settings.ota.downloading": "Download per URL: {progress}% ({written} / {total})",
    "settings.ota.uploading": "Upload vom Panel empfangen: {progress}% ({written} / {total})",
    "settings.ota.success": "OTA Image geschrieben. Neustart laeuft.",
    "settings.ota.error": "OTA fehlgeschlagen: {error}",
    "settings.ota.rebooting": "Geraet startet neu. Oeffne das Panel erneut, sobald es wieder online ist.",
    "settings.ota.no_file": "Bitte zuerst eine OTA .bin Datei waehlen.",
    "settings.ota.no_url": "Bitte zuerst eine OTA URL einfuegen.",
    "settings.ota.starting_url": "OTA per URL wird gestartet...",
    "settings.ota.upload_progress": "Upload zum Panel: {progress}% ({written} / {total})",
    "settings.ota.request_failed": "OTA Anfrage fehlgeschlagen: {error}",
    "settings.ota.target_slot": "Zielslot: {partition}",
    "settings.actions.heading": "Einstellungsaktionen",
    "settings.actions.reload": "Einstellungen neu laden",
    "settings.actions.save": "Speichern + Neustart",
    "settings.actions.hint": "Nach dem Speichern startet das Geraet neu und wechselt ggf. vom Setup AP ins Heim-WLAN.",
    "settings.info.configured": "Konfiguriert",
    "settings.info.connected": "Verbunden",
    "settings.info.password_stored": "Passwort gespeichert",
    "settings.info.country": "Land",
    "settings.info.rssi": "RSSI (verbundener AP)",
    "settings.info.connected_bssid": "Verbundener BSSID",
    "settings.info.channel": "Kanal",
    "settings.info.token_stored": "Token gespeichert",
    "settings.info.rest_fallback": "REST Fallback",
    "common.yes": "ja",
    "common.no": "nein",
    "common.scan": "Scan",
    "common.scan_wifi": "WLAN scannen",
    "common.save_reboot": "Speichern + Neustart",
    "status.idle": "Bereit",
    "status.loading_settings": "Einstellungen werden geladen...",
    "status.settings_loaded": "Einstellungen geladen",
    "status.settings_load_failed": "Einstellungen laden fehlgeschlagen: {error}",
    "status.settings_save_failed": "Einstellungen speichern fehlgeschlagen: {error}",
    "ha_diagnostics.missing_title": "Einige Entitäten aus diesem Layout wurden in Home Assistant nicht gefunden",
    "ha_diagnostics.missing_title_more": "Einige Entitäten aus diesem Layout wurden in Home Assistant nicht gefunden ({total} insgesamt, {listed} angezeigt)",
    "ha_diagnostics.missing_hint": "Öffne das betroffene Widget, wähle eine gültige Entität und speichere das Layout.",
    "ha_diagnostics.dismiss": "Schließen",
    "status.saving_settings": "Einstellungen werden gespeichert...",
    "status.settings_saved_reboot": "Einstellungen gespeichert. Das Geraet startet in ~2s neu.",
    "status.wifi_scan_running": "WLAN Suche laeuft...",
    "status.wifi_scan_complete": "WLAN Scan fertig ({count} Netze)",
    "status.wifi_scan_failed": "WLAN Scan fehlgeschlagen: {error}",
    "status.wifi_scan_timeout": "WLAN Scan Anfrage abgelaufen",
    "common.unknown_error": "Unbekannter Fehler",
    "wifi.scan_unavailable": "WLAN Scan ist im Setup AP Modus auf dieser Hardware nicht verfuegbar. SSID manuell eingeben.",
    "wifi.scan_click": "Auf \"WLAN scannen\" klicken, um Netze zu finden.",
    "wifi.scan_click_short": "Auf \"Scan\" klicken, um Netze zu finden.",
    "wifi.scan_no_networks": "Keine Netze gefunden. Gehe naeher an den Router und versuche es erneut.",
    "wifi.scan_found": "{count} Netzwerk(e) gefunden. SSID auswaehlen.",
    "wifi.scan.connected_tag": "verbunden",
    "wifi.scan.option_unavailable": "Scan nicht verfuegbar",
    "wifi.scan.option_scanning": "Suche laeuft...",
    "wifi.scan.option_not_run": "Noch kein Scan",
    "wifi.scan.option_no_networks": "Keine Netze gefunden",
    "wifi.scan.option_select": "Netz waehlen ({count} gefunden)",
    "settings.time.info": "Wird nach Neustart angewendet. Zeitsync startet bei WLAN Verbindung.",
    "settings.ui.info": "Vorschau wechselt sofort. Gespeicherte Sprache gilt nach Neustart.",
    "settings.ap.active": "Setup AP aktiv: {ssid}\\nhttp://192.168.4.1 im AP oeffnen.",
    "settings.ap.inactive": "Setup AP inaktiv.\\nNutze die Panel-IP im Heimnetz.",
    "settings.translation.info": "JSON hochladen, um eine Sprache hinzuzufuegen oder zu aktualisieren.",
    "settings.translation.upload_ok": "Sprache \"{lang}\" hochgeladen.",
    "settings.translation.upload_fail": "Upload fehlgeschlagen: {error}",
    "settings.translation.no_file": "Bitte zuerst eine JSON Datei auswaehlen.",
    "settings.translation.invalid_json": "Ungueltiges JSON",
    "settings.translation.object_required": "JSON muss ein Objekt sein",
    "settings.translation.invalid_code": "Sprachcode muss [a-z0-9_-] nutzen und 2-15 Zeichen haben.",
    "settings.language.invalid_country": "WLAN Laendercode muss ein 2-stelliger ISO Code sein (z.B. US, DE)",
    "settings.language.invalid_bssid": "BSSID muss leer sein oder Format AA:BB:CC:DD:EE:FF haben",
    "settings.language.invalid_ha_url": "HA URL muss mit ws:// oder wss:// beginnen",
    "provision.wifi.required_ssid": "SSID ist erforderlich.",
    "provision.wifi.required_country": "Laendercode muss 2 Buchstaben haben (z.B. US, DE).",
    "provision.ha.required_url": "WebSocket URL ist erforderlich.",
    "provision.ha.invalid_url": "HA URL muss mit ws:// oder wss:// beginnen.",
    "provision.ha.required_token": "Long-lived Access Token ist erforderlich.",
    "provision.saving_reboot": "Speichere Einstellungen und starte neu...",
    "provision.saved_reboot": "Einstellungen gespeichert. Geraet startet in ~2s neu.",
    "provision.save_failed": "Speichern fehlgeschlagen: {error}",
    "provision.wifi.hint": "Speichern startet das Panel neu. Danach folgt die HA Einrichtung.",
    "provision.ha.hint": "Speichern startet das Panel neu. Danach ist der Editor freigeschaltet.",
    "settings.language.option_de": "Deutsch",
    "settings.language.option_en": "English",
    "settings.language.option_es": "Espanol",
    "settings.language.option_fr": "Francais",
    "settings.language.option_pl": "Polski",
    "settings.language.option_zh-cn": "简体中文",
    "settings.language.option_zh-tw": "繁體中文",
  },
  es: {
    "tabs.layout": "Diseno",
    "tabs.settings": "Configuracion",
    "sidebar.title": "BETTA Editor",
    "sidebar.subtitle": "Fuente de verdad del layout: JSON",
    "layout.pages.heading": "Paginas",
    "layout.pages.add": "+ Pagina",
    "layout.pages.delete": "Eliminar",
    "layout.pages.title_label": "Titulo de pagina",
    "layout.pages.title_placeholder": "Nombre de pagina en la pantalla",
    "layout.pages.apply_title": "Aplicar titulo de pagina",
    "layout.pages.new_title": "Pagina {number}",
    "layout.widgets.heading": "Widgets",
    "layout.widgets.add_sensor": "+ Sensor",
    "layout.widgets.add_button": "+ Boton",
    "layout.widgets.add_slider": "+ Slider",
    "layout.widgets.add_graph": "+ Grafico",
    "layout.widgets.add_empty_tile": "+ Tile vacio",
    "layout.widgets.add_light_tile": "+ Tile de luz",
    "layout.widgets.add_heating_tile": "+ Tile de calefaccion",
    "layout.widgets.add_weather_tile": "+ Clima",
    "layout.widgets.add_weather_3day": "+ Previsão do tempo",
    "layout.widgets.delete": "Eliminar Widget",
    "entity_picker.title": "Elegir luz",
    "entity_picker.refresh": "Actualizar",
    "entity_picker.close": "Cerrar",
    "entity_picker.blank": "Tile de luz vacio",
    "entity_picker.loading": "Cargando luces...",
    "entity_picker.refreshing": "Actualizando luces...",
    "entity_picker.pending": "Esperando Home Assistant...",
    "entity_picker.disconnected": "Home Assistant no esta conectado.",
    "entity_picker.empty": "No se encontraron luces.",
    "entity_picker.truncated": "Lista recortada por limite de firmware.",
    "entity_picker.unassigned_room": "Sin sala",
    "entity_picker.added": "Tile de luz agregado: {entity}",
    "entity_picker.fetch_failed": "Error al buscar luces: {error}",
    "layout.inspector.heading": "Inspector",
    "layout.tile_look.group": "Aspecto del mosaico (este mosaico)",
    "layout.tile_look.preset": "Plantilla",
    "layout.tile_look.bg_color": "Color de fondo",
    "layout.tile_look.bg_grad_color": "Color final del degradado",
    "layout.tile_look.bg_grad_dir": "Direccion del degradado",
    "layout.tile_look.border_color": "Color del borde",
    "layout.tile_look.border_width": "Ancho del borde (px)",
    "layout.tile_look.radius": "Radio de esquina (px)",
    "layout.tile_look.corner_shape": "Forma de las esquinas",
    "layout.tile_look.corner_hint": "Con el radio maximo, un mosaico cuadrado se vuelve un circulo.",
    "layout.tile_look.opacity": "Opacidad del fondo (%)",
    "layout.tile_look.font_scale": "Tamano de fuente",
    "layout.tile_look.shadow": "Sombra",
    "layout.tile_look.text_color": "Color del texto (todo)",
    "layout.tile_look.title_color": "Color del titulo",
    "layout.tile_look.label_color": "Color de la etiqueta de entidad",
    "layout.tile_look.value_color": "Color del valor / estado",
    "layout.tile_look.icon_color": "Color del icono",
    "layout.tile_look.reset": "Restablecer aspecto del mosaico",
    "layout.tile_look.hint": "Los campos vacios usan el tema. Colores en formato #RRGGBB.",
  "layout.tile_look.copy_source": "Copiar aspecto de",
  "layout.tile_look.copy_apply": "Copiar aspecto",
  "layout.tile_look.copy_apply_page": "Aplicar a todos los mosaicos",
  "layout.tile_look.copy_placeholder": "Selecciona un mosaico...",
  "layout.tile_look.copy_empty": "No hay otros mosaicos para copiar",
  "layout.tile_look.copy_none": "Selecciona primero un mosaico de origen.",
  "layout.tile_look.copy_done": "Aspecto copiado de: {source}",
  "layout.tile_look.copy_page_done": "Aspecto aplicado a {count} mosaico(s).",
  "layout.tile_look.copy_hint": "Copia solo fondo, borde, colores y tamano de fuente; la entidad, el titulo y el tamano no cambian.",
    "layout.page_look.heading": "Aspecto de la pagina",
    "layout.page_look.group": "Aspecto de la pagina (esta pagina)",
    "layout.page_look.preset": "Preajuste",
    "layout.page_look.bg_color": "Color de fondo",
    "layout.page_look.bg_grad_color": "Color final del degradado",
    "layout.page_look.bg_grad_dir": "Direccion del degradado",
    "layout.page_look.wallpaper": "Usar fondo de pantalla del panel",
    "layout.page_look.dim": "Oscurecer fondo (%)",
    "layout.page_look.reset": "Restablecer aspecto",
    "layout.page_look.reset_done": "Aspecto de la pagina restablecido.",
    "layout.page_look.page_theme": "Tema solo para esta pagina",
    "layout.page_look.page_theme_hint": "La pagina se repinta con este tema en cuanto se muestra. \"Global\" sigue el tema activo / dia-noche.",
    "layout.page_look.theme_none": "- tema global / dia-noche -",
    "layout.page_look.hint": "Los campos vacios usan el fondo del panel. El fondo se oscurece en el panel.",
    "layout.option.page_preset.auto": "Predeterminado del panel",
    "layout.option.page_preset.midnight": "Medianoche",
    "layout.option.page_preset.deep_sea": "Mar profundo",
    "layout.option.page_preset.forest": "Bosque",
    "layout.option.page_preset.sunset": "Atardecer",
    "layout.option.page_preset.plum": "Ciruela",
    "layout.option.page_preset.wallpaper": "Fondo de pantalla",
    "layout.option.page_preset.wallpaper_dim": "Fondo de pantalla (oscuro)",
    "layout.option.page_grad_dir.none": "Ninguna",
    "layout.option.page_grad_dir.hor": "Horizontal",
    "layout.option.page_grad_dir.ver": "Vertical",
    "layout.option.tile_grad_dir.none": "Ninguna",
    "layout.option.tile_grad_dir.hor": "Horizontal",
    "layout.option.tile_grad_dir.ver": "Vertical",
    "layout.option.tile_font_scale.auto": "Auto",
    "layout.option.tile_font_scale.s": "Pequena",
    "layout.option.tile_font_scale.m": "Media",
    "layout.option.tile_font_scale.l": "Grande",
    "layout.option.tile_font_scale.xl": "Muy grande",
    "layout.option.tile_preset.auto": "Predeterminado del tema",
    "layout.option.tile_preset.graphite": "Grafito",
    "layout.option.tile_preset.emerald": "Esmeralda",
    "layout.option.tile_preset.amber": "Ambar",
    "layout.option.tile_preset.violet": "Violeta",
  "layout.option.tile_preset.sky": "Cielo",
    "layout.option.tile_preset.glass": "Cristal",
    "layout.option.tile_corner.custom": "Personalizado (usa el radio)",
    "layout.option.tile_corner.square": "Cuadrado (0 px)",
    "layout.option.tile_corner.soft": "Suave (10 px)",
    "layout.option.tile_corner.rounded": "Redondeado (16 px)",
    "layout.option.tile_corner.pill": "Pastilla (40 px)",
    "layout.option.tile_corner.circle": "Circulo (radio maximo)",
    "layout.inspector.title": "Titulo",
    "layout.inspector.entity": "Entidad",
    "layout.inspector.secondary_entity": "Entidad real (sensor)",
    "layout.inspector.button_mode": "Modo de boton",
    "layout.inspector.button_accent_color": "Color de acento del boton",
    "layout.inspector.slider_entity_domain": "Tipo de entidad del slider",
    "layout.inspector.slider_direction": "Direccion del slider",
    "layout.inspector.slider_accent_color": "Color de acento del slider",
    "layout.inspector.graph_line_color": "Color de linea del grafico",
    "layout.inspector.graph_time_window_min": "Ventana de tiempo (minutos)",
    "layout.inspector.graph_point_count": "Puntos de render (vacio = auto)",
    "layout.inspector.graph_display_mode": "Modo de visualizacion",
    "layout.inspector.graph_bar_bucket_min": "Intervalo de barras (min)",
    "layout.option.graph_display_mode.line": "Linea con puntos",
    "layout.option.graph_display_mode.line_smooth_points": "Linea suave con puntos",
    "layout.option.graph_display_mode.line_smooth": "Linea suave",
    "layout.option.graph_display_mode.bars": "Barras",
    "layout.inspector.apply": "Aplicar",
    "layout.option.button_mode.auto": "auto (switch por defecto)",
    "layout.option.button_mode.play_pause": "play/pause (media_player)",
    "layout.option.button_mode.stop": "stop (media_player)",
    "layout.option.button_mode.next": "next (media_player)",
    "layout.option.button_mode.previous": "previous (media_player)",
    "layout.option.slider_entity_domain.auto": "auto (light, media_player, cover)",
    "layout.option.slider_entity_domain.light": "light",
    "layout.option.slider_entity_domain.media_player": "media_player",
    "layout.option.slider_entity_domain.cover": "cover",
    "layout.option.slider_direction.auto": "auto (segun ancho/alto)",
    "layout.option.slider_direction.left_to_right": "left_to_right (0% -> 100%)",
    "layout.option.slider_direction.right_to_left": "right_to_left (100% -> 0%)",
    "layout.option.slider_direction.bottom_to_top": "bottom_to_top (0% -> 100%)",
    "layout.option.slider_direction.top_to_bottom": "top_to_bottom (100% -> 0%)",
    "layout.actions.heading": "Acciones",
    "layout.actions.reload": "Recargar",
    "layout.actions.save": "Guardar",
    "layout.actions.export": "Exportar",
    "layout.actions.import": "Importar JSON",
    "layout.actions.paste_placeholder": "Pega aqui el JSON del layout",
    "layout.canvas.title": "Canvas",
    "layout.default_page.title": "Sala",
    "layout.status.loading": "Cargando layout...",
    "layout.status.load_failed": "Error al cargar layout, usando default: {error}",
    "layout.status.loaded": "Layout cargado",
    "layout.status.entity_fetch_failed": "Error al cargar entidades: {error}",
    "layout.status.saving": "Guardando layout...",
    "layout.status.saved": "Layout guardado",
    "layout.status.imported": "Layout importado (aun no guardado)",
    "layout.status.at_least_one_page": "Se requiere al menos una pagina",
    "layout.status.entity_domain_required": "La entidad debe usar el dominio: {domains}",
    "layout.status.expected_domain": "el dominio esperado",
    "layout.status.secondary_sensor_required": "La entidad real debe empezar con sensor.",
    "layout.status.invalid_json": "JSON de layout invalido",
    "layout.status.save_failed": "Error al guardar: {error}",
    "layout.status.conflict_title": "El diseno del panel cambio en otro lugar",
    "layout.status.conflict_confirm": "El diseno del panel se modifico desde otra fuente (otra pestana, la API o una restauracion).\n\nAceptar = sobrescribir con esta version del editor\nCancelar = conservar la version del panel (recarga la pagina para descartar los cambios locales).",
    "layout.status.conflict_overridden": "Cambios del panel sobrescritos por este editor.",
    "layout.status.import_failed": "Error al importar: {error}",
    "layout.status.file_import_failed": "Error al importar archivo: {error}",
    "provision.wifi.title": "Provision Wi-Fi",
    "provision.wifi.subtitle": "Conecta el panel a tu red Wi-Fi.",
    "provision.wifi.ssid": "SSID",
    "provision.wifi.country_code": "Codigo de pais",
    "provision.wifi.password": "Contrasena",
    "provision.wifi.password_placeholder": "Contrasena Wi-Fi",
    "provision.wifi.show_password": "Mostrar contrasena",
    "provision.ha.title": "Provision HA",
    "provision.ha.subtitle": "Conecta el panel a Home Assistant.",
    "provision.ha.ws_url": "URL WebSocket (ws:// o wss://)",
    "provision.ha.token": "Token de acceso de larga duracion",
    "provision.ha.show_token": "Mostrar token",
    "settings.wifi.heading": "Wi-Fi",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "Codigo de pais",
    "settings.wifi.bssid": "Bloqueo BSSID (opcional)",
    "settings.wifi.password": "Contrasena",
    "settings.wifi.password_placeholder": "Dejar vacio para conservar la contrasena guardada",
    "settings.ha.heading": "Home Assistant",
    "settings.ha.ws_url": "URL WebSocket (ws:// o wss://)",
    "settings.ha.token": "Token de acceso de larga duracion",
    "settings.ha.token_placeholder": "Dejar vacio para conservar el token guardado",
    "settings.ha.rest_fallback": "Activar fallback REST de HA (por defecto: off, se prefiere WS)",
    "settings.time.heading": "Hora",
    "settings.time.ntp_server": "Servidor NTP",
    "settings.time.timezone": "Zona horaria",
    "settings.time.search": "Buscar zona horaria…",
    "settings.time.show_zones": "Mostrar zonas horarias",
    "settings.time.search_hint": "Escribe parte del nombre de una ciudad o región y selecciona una zona horaria.",
    "settings.time.no_matches": "No hay zonas horarias coincidentes",
    "settings.time.local_time": "Hora local actual",
    "settings.time.clock_unavailable": "La hora del dispositivo no está disponible o no está sincronizada",
    "settings.time.legacy_active": "Zona horaria existente en formato antiguo",
    "settings.time.legacy_hint": "Se conserva la zona horaria existente. Selecciona una ubicación para reemplazarla.",
    "settings.time.list_unavailable": "La lista de zonas horarias no está disponible. Vuelve a cargar los ajustes.",
    "settings.ui.heading": "UI",
    "settings.theme.heading": "Tema",
    "settings.ui.language": "Idioma",
    "settings.ui.reload_languages": "Recargar idiomas",
    "settings.ui.download_json": "Descargar JSON",
    "settings.ui.upload_code": "Codigo de idioma",
    "settings.ui.upload_file": "Archivo JSON de traduccion",
    "settings.ui.upload_button": "Subir / Agregar idioma",
    "settings.ap.heading": "AP de setup",
    "settings.ap.hint": "Si el AP de setup esta activo, conectate y abre <code>http://192.168.4.1</code>.",
    "settings.ota.heading": "Actualizacion de firmware",
    "settings.ota.url": "URL OTA",
    "settings.ota.url_placeholder": "https://github.com/cptkirki/BETTA-HA-PANEL/releases/latest/download/...",
    "settings.ota.flash_url": "Flashear URL",
    "settings.ota.refresh": "Actualizar estado",
    "settings.ota.file": "Archivo OTA .bin",
    "settings.ota.upload": "Subir + Flashear",
    "settings.ota.idle": "Listo para una imagen OTA de app. Ejecutando: {running}, siguiente slot: {next}, tamano de slot: {size}.",
    "settings.ota.running": "OTA en curso: {progress}% ({written} / {total})",
    "settings.ota.downloading": "Descargando desde URL: {progress}% ({written} / {total})",
    "settings.ota.uploading": "Upload recibido por el panel: {progress}% ({written} / {total})",
    "settings.ota.success": "Imagen OTA escrita. Reiniciando ahora.",
    "settings.ota.error": "OTA fallo: {error}",
    "settings.ota.rebooting": "El dispositivo se esta reiniciando. Abre el panel de nuevo cuando vuelva online.",
    "settings.ota.no_file": "Elige primero un archivo OTA .bin.",
    "settings.ota.no_url": "Pega primero una URL OTA.",
    "settings.ota.starting_url": "Iniciando OTA desde URL...",
    "settings.ota.upload_progress": "Subiendo al panel: {progress}% ({written} / {total})",
    "settings.ota.request_failed": "Solicitud OTA fallida: {error}",
    "settings.ota.target_slot": "Slot destino: {partition}",
    "settings.actions.heading": "Acciones de configuracion",
    "settings.actions.reload": "Recargar configuracion",
    "settings.actions.save": "Guardar + Reiniciar",
    "settings.actions.hint": "Despues de guardar, el dispositivo reinicia y puede cambiar del AP de setup al Wi-Fi de casa.",
    "settings.info.configured": "Configurado",
    "settings.info.connected": "Conectado",
    "settings.info.password_stored": "Contrasena guardada",
    "settings.info.country": "Pais",
    "settings.info.rssi": "RSSI (AP conectado)",
    "settings.info.connected_bssid": "BSSID conectado",
    "settings.info.channel": "Canal",
    "settings.info.token_stored": "Token guardado",
    "settings.info.rest_fallback": "Fallback REST",
    "common.yes": "si",
    "common.no": "no",
    "common.scan": "Escanear",
    "common.scan_wifi": "Escanear Wi-Fi",
    "common.save_reboot": "Guardar + Reiniciar",
    "status.idle": "Listo",
    "status.loading_settings": "Cargando configuracion...",
    "status.settings_loaded": "Configuracion cargada",
    "status.settings_load_failed": "Error al cargar configuracion: {error}",
    "status.settings_save_failed": "Error al guardar configuracion: {error}",
    "status.saving_settings": "Guardando configuracion...",
    "status.settings_saved_reboot": "Configuracion guardada. El dispositivo reinicia en ~2s.",
    "status.wifi_scan_running": "Escaneo Wi-Fi en curso...",
    "status.wifi_scan_complete": "Escaneo Wi-Fi completo ({count} redes)",
    "status.wifi_scan_failed": "Error en escaneo Wi-Fi: {error}",
    "status.wifi_scan_timeout": "Tiempo de espera agotado para escaneo Wi-Fi",
    "common.unknown_error": "Error desconocido",
    "wifi.scan_unavailable": "El escaneo Wi-Fi no esta disponible en modo setup AP en este hardware. Ingresa SSID manualmente.",
    "wifi.scan_click": "Pulsa \"Escanear Wi-Fi\" para listar redes cercanas.",
    "wifi.scan_click_short": "Pulsa \"Escanear\" para listar redes cercanas.",
    "wifi.scan_no_networks": "No se encontraron redes. Acercate al router e intenta de nuevo.",
    "wifi.scan_found": "{count} red(es) encontradas. Selecciona una para llenar SSID.",
    "wifi.scan.connected_tag": "conectado",
    "wifi.scan.option_unavailable": "Escaneo no disponible",
    "wifi.scan.option_scanning": "Escaneando...",
    "wifi.scan.option_not_run": "Sin escaneo",
    "wifi.scan.option_no_networks": "No se encontraron redes",
    "wifi.scan.option_select": "Selecciona red ({count} encontradas)",
    "settings.time.info": "Se aplica despues de reiniciar. La sincronizacion inicia cuando Wi-Fi esta conectado.",
    "settings.ui.info": "La vista previa cambia al instante. El idioma guardado se aplica tras reiniciar.",
    "settings.ap.active": "AP de setup activo: {ssid}\\nAbre http://192.168.4.1 conectado a este AP.",
    "settings.ap.inactive": "AP de setup inactivo.\\nUsa la IP del panel en tu Wi-Fi.",
    "settings.translation.info": "Sube un JSON para agregar o actualizar un idioma.",
    "settings.translation.upload_ok": "Idioma \"{lang}\" subido.",
    "settings.translation.upload_fail": "Error de subida: {error}",
    "settings.translation.no_file": "Selecciona primero un archivo JSON.",
    "settings.translation.invalid_json": "JSON invalido",
    "settings.translation.object_required": "El JSON debe ser un objeto",
    "settings.translation.invalid_code": "El codigo de idioma debe usar [a-z0-9_-] y tener 2-15 caracteres.",
    "settings.language.invalid_country": "El codigo de pais Wi-Fi debe ser ISO de 2 letras (p.ej. US, DE)",
    "settings.language.invalid_bssid": "El BSSID debe estar vacio o en formato AA:BB:CC:DD:EE:FF",
    "settings.language.invalid_ha_url": "La URL HA debe empezar con ws:// o wss://",
    "provision.wifi.required_ssid": "SSID es obligatorio.",
    "provision.wifi.required_country": "El codigo de pais debe tener 2 letras (p.ej. US, DE).",
    "provision.ha.required_url": "La URL WebSocket es obligatoria.",
    "provision.ha.invalid_url": "La URL HA debe empezar con ws:// o wss://.",
    "provision.ha.required_token": "El token de acceso es obligatorio.",
    "provision.saving_reboot": "Guardando configuracion y reiniciando...",
    "provision.saved_reboot": "Configuracion guardada. El dispositivo reinicia en ~2s.",
    "provision.save_failed": "Error al guardar: {error}",
    "provision.wifi.hint": "Guardar reinicia el panel. Despues se muestra la provision de HA.",
    "provision.ha.hint": "Guardar reinicia el panel. Despues se desbloquea el editor.",
    "settings.language.option_de": "Deutsch",
    "settings.language.option_en": "English",
    "settings.language.option_es": "Espanol",
    "settings.language.option_fr": "Francais",
    "settings.language.option_pl": "Polski",
    "settings.language.option_zh-cn": "简体中文",
    "settings.language.option_zh-tw": "繁體中文",
  },
  fr: {
    "tabs.layout": "Layout",
    "tabs.settings": "Parametres",
    "sidebar.title": "BETTA Editor",
    "sidebar.subtitle": "Source du layout: JSON",
    "layout.pages.heading": "Pages",
    "layout.pages.add": "+ Page",
    "layout.pages.delete": "Supprimer",
    "layout.pages.title_label": "Titre de page",
    "layout.pages.title_placeholder": "Nom de page sur l'ecran",
    "layout.pages.apply_title": "Appliquer le titre",
    "layout.pages.new_title": "Page {number}",
    "layout.widgets.heading": "Widgets",
    "layout.widgets.add_sensor": "+ Capteur",
    "layout.widgets.add_button": "+ Bouton",
    "layout.widgets.add_slider": "+ Curseur",
    "layout.widgets.add_graph": "+ Graphe",
    "layout.widgets.add_empty_tile": "+ Tuile vide",
    "layout.widgets.add_light_tile": "+ Tuile lumiere",
    "layout.widgets.add_heating_tile": "+ Tuile chauffage",
    "layout.widgets.add_weather_tile": "+ Meteo",
    "layout.widgets.add_weather_3day": "+ Prévision météo",
    "layout.widgets.delete": "Supprimer le widget",
    "entity_picker.title": "Choisir une lumiere",
    "entity_picker.refresh": "Actualiser",
    "entity_picker.close": "Fermer",
    "entity_picker.blank": "Tuile lumiere vide",
    "entity_picker.loading": "Chargement des lumieres...",
    "entity_picker.refreshing": "Actualisation des lumieres...",
    "entity_picker.pending": "En attente de Home Assistant...",
    "entity_picker.disconnected": "Home Assistant n'est pas connecte.",
    "entity_picker.empty": "Aucune entite lumiere trouvee.",
    "entity_picker.truncated": "Liste limitee par le firmware.",
    "entity_picker.unassigned_room": "Sans piece",
    "entity_picker.added": "Tuile lumiere ajoutee: {entity}",
    "entity_picker.fetch_failed": "Echec de la recherche de lumieres: {error}",
    "layout.inspector.heading": "Inspecteur",
    "layout.tile_look.group": "Aspect de la tuile (cette tuile)",
    "layout.tile_look.preset": "Prereglage",
    "layout.tile_look.bg_color": "Couleur de fond",
    "layout.tile_look.bg_grad_color": "Couleur de fin du degrade",
    "layout.tile_look.bg_grad_dir": "Direction du degrade",
    "layout.tile_look.border_color": "Couleur de bordure",
    "layout.tile_look.border_width": "Epaisseur de bordure (px)",
    "layout.tile_look.radius": "Rayon des coins (px)",
    "layout.tile_look.corner_shape": "Forme des coins",
    "layout.tile_look.corner_hint": "Avec le rayon maximal, une tuile carree devient un cercle.",
    "layout.tile_look.opacity": "Opacite du fond (%)",
    "layout.tile_look.font_scale": "Taille de police",
    "layout.tile_look.shadow": "Ombre portee",
    "layout.tile_look.text_color": "Couleur du texte (tout)",
    "layout.tile_look.title_color": "Couleur du titre",
    "layout.tile_look.label_color": "Couleur du libelle d'entite",
    "layout.tile_look.value_color": "Couleur de la valeur / etat",
    "layout.tile_look.icon_color": "Couleur de l'icone",
    "layout.tile_look.reset": "Reinitialiser l'aspect de la tuile",
    "layout.tile_look.hint": "Les champs vides utilisent le theme. Couleurs au format #RRGGBB.",
  "layout.tile_look.copy_source": "Copier l'aspect de",
  "layout.tile_look.copy_apply": "Copier l'aspect",
  "layout.tile_look.copy_apply_page": "Appliquer a toutes les tuiles",
  "layout.tile_look.copy_placeholder": "Choisir une tuile...",
  "layout.tile_look.copy_empty": "Aucune autre tuile a copier",
  "layout.tile_look.copy_none": "Choisissez d'abord une tuile source.",
  "layout.tile_look.copy_done": "Aspect copie de : {source}",
  "layout.tile_look.copy_page_done": "Aspect applique a {count} tuile(s).",
  "layout.tile_look.copy_hint": "Copie uniquement le fond, la bordure, les couleurs et la taille de police - entite, titre et taille inchanges.",
    "layout.page_look.heading": "Apparence de la page",
    "layout.page_look.group": "Apparence de la page (cette page)",
    "layout.page_look.preset": "Preset",
    "layout.page_look.bg_color": "Couleur de fond",
    "layout.page_look.bg_grad_color": "Couleur de fin du degrade",
    "layout.page_look.bg_grad_dir": "Direction du degrade",
    "layout.page_look.wallpaper": "Utiliser le fond d'ecran du panneau",
    "layout.page_look.dim": "Assombrir le fond (%)",
    "layout.page_look.reset": "Reinitialiser l'apparence",
    "layout.page_look.reset_done": "Apparence de la page reinitialisee.",
    "layout.page_look.page_theme": "Theme pour cette page uniquement",
    "layout.page_look.page_theme_hint": "La page est redessinee avec ce theme des qu'elle est affichee. \"Global\" suit le theme actif / jour-nuit.",
    "layout.page_look.theme_none": "- theme global / jour-nuit -",
    "layout.page_look.hint": "Les champs vides utilisent le fond du panneau. Le fond d'ecran est assombri sur le panneau.",
    "layout.option.page_preset.auto": "Defaut du panneau",
    "layout.option.page_preset.midnight": "Minuit",
    "layout.option.page_preset.deep_sea": "Grand large",
    "layout.option.page_preset.forest": "Foret",
    "layout.option.page_preset.sunset": "Coucher de soleil",
    "layout.option.page_preset.plum": "Prune",
    "layout.option.page_preset.wallpaper": "Fond d'ecran",
    "layout.option.page_preset.wallpaper_dim": "Fond d'ecran (sombre)",
    "layout.option.page_grad_dir.none": "Aucune",
    "layout.option.page_grad_dir.hor": "Horizontal",
    "layout.option.page_grad_dir.ver": "Vertical",
    "layout.option.tile_grad_dir.none": "Aucun",
    "layout.option.tile_grad_dir.hor": "Horizontal",
    "layout.option.tile_grad_dir.ver": "Vertical",
    "layout.option.tile_font_scale.auto": "Auto",
    "layout.option.tile_font_scale.s": "Petite",
    "layout.option.tile_font_scale.m": "Moyenne",
    "layout.option.tile_font_scale.l": "Grande",
    "layout.option.tile_font_scale.xl": "Tres grande",
    "layout.option.tile_preset.auto": "Theme par defaut",
    "layout.option.tile_preset.graphite": "Graphite",
    "layout.option.tile_preset.emerald": "Emeraude",
    "layout.option.tile_preset.amber": "Ambre",
    "layout.option.tile_preset.violet": "Violet",
    "layout.option.tile_preset.sky": "Ciel",
    "layout.option.tile_preset.glass": "Verre",
    "layout.option.tile_corner.custom": "Personnalise (utiliser le rayon)",
    "layout.option.tile_corner.square": "Carre (0 px)",
    "layout.option.tile_corner.soft": "Doux (10 px)",
    "layout.option.tile_corner.rounded": "Arrondi (16 px)",
    "layout.option.tile_corner.pill": "Pilule (40 px)",
    "layout.option.tile_corner.circle": "Cercle (rayon max)",
    "layout.inspector.title": "Titre",
    "layout.inspector.entity": "Entite",
    "layout.inspector.secondary_entity": "Entite reelle (capteur)",
    "layout.inspector.button_mode": "Mode du bouton",
    "layout.inspector.button_accent_color": "Couleur d'accent du bouton",
    "layout.inspector.slider_entity_domain": "Type d'entite du curseur",
    "layout.inspector.slider_direction": "Direction du curseur",
    "layout.inspector.slider_accent_color": "Couleur d'accent du curseur",
    "layout.inspector.graph_line_color": "Couleur de ligne du graphe",
    "layout.inspector.graph_time_window_min": "Fenetre de temps (minutes)",
    "layout.inspector.graph_point_count": "Points de rendu (vide = auto)",
    "layout.inspector.graph_display_mode": "Mode d'affichage",
    "layout.inspector.graph_bar_bucket_min": "Intervalle de barres (min)",
    "layout.option.graph_display_mode.line": "Ligne avec points",
    "layout.option.graph_display_mode.line_smooth_points": "Ligne lissee avec points",
    "layout.option.graph_display_mode.line_smooth": "Ligne lissee",
    "layout.option.graph_display_mode.bars": "Barres",
    "layout.inspector.apply": "Appliquer",
    "layout.option.button_mode.auto": "auto (interrupteur par defaut)",
    "layout.option.button_mode.play_pause": "play/pause (media_player)",
    "layout.option.button_mode.stop": "stop (media_player)",
    "layout.option.button_mode.next": "next (media_player)",
    "layout.option.button_mode.previous": "previous (media_player)",
    "layout.option.slider_entity_domain.auto": "auto (light, media_player, cover)",
    "layout.option.slider_entity_domain.light": "light",
    "layout.option.slider_entity_domain.media_player": "media_player",
    "layout.option.slider_entity_domain.cover": "cover",
    "layout.option.slider_direction.auto": "auto (selon largeur/hauteur)",
    "layout.option.slider_direction.left_to_right": "left_to_right (0% -> 100%)",
    "layout.option.slider_direction.right_to_left": "right_to_left (100% -> 0%)",
    "layout.option.slider_direction.bottom_to_top": "bottom_to_top (0% -> 100%)",
    "layout.option.slider_direction.top_to_bottom": "top_to_bottom (100% -> 0%)",
    "layout.actions.heading": "Actions",
    "layout.actions.reload": "Recharger",
    "layout.actions.save": "Enregistrer",
    "layout.actions.export": "Exporter",
    "layout.actions.import": "Importer JSON",
    "layout.actions.paste_placeholder": "Coller le JSON du layout ici",
    "layout.canvas.title": "Canvas",
    "layout.default_page.title": "Salon",
    "layout.status.loading": "Chargement du layout...",
    "layout.status.load_failed": "Echec du chargement du layout, defaut utilise: {error}",
    "layout.status.loaded": "Layout charge",
    "layout.status.entity_fetch_failed": "Echec du chargement des entites: {error}",
    "layout.status.saving": "Enregistrement du layout...",
    "layout.status.saved": "Layout enregistre",
    "layout.status.imported": "Layout importe (pas encore enregistre)",
    "layout.status.at_least_one_page": "Au moins une page est requise",
    "layout.status.entity_domain_required": "L'entite doit utiliser le domaine: {domains}",
    "layout.status.expected_domain": "le domaine attendu",
    "layout.status.secondary_sensor_required": "L'entite reelle doit commencer par sensor.",
    "layout.status.invalid_json": "JSON de layout invalide",
    "layout.status.save_failed": "Echec de l'enregistrement: {error}",
    "layout.status.conflict_title": "La disposition du panneau a change ailleurs",
    "layout.status.conflict_confirm": "La disposition du panneau a ete modifiee depuis une autre source (autre onglet, API ou restauration).\n\nOK = ecraser avec cette version de l'editeur\nAnnuler = conserver la version du panneau (rechargez la page pour annuler les modifications locales).",
    "layout.status.conflict_overridden": "Modifications du panneau ecrasees par cet editeur.",
    "layout.status.import_failed": "Echec de l'import: {error}",
    "layout.status.file_import_failed": "Echec de l'import du fichier: {error}",
    "provision.wifi.title": "Provision Wi-Fi",
    "provision.wifi.subtitle": "Connectez le panneau a votre Wi-Fi.",
    "provision.wifi.ssid": "SSID",
    "provision.wifi.country_code": "Code pays",
    "provision.wifi.password": "Mot de passe",
    "provision.wifi.password_placeholder": "Mot de passe Wi-Fi",
    "provision.wifi.show_password": "Afficher le mot de passe",
    "provision.ha.title": "Provision HA",
    "provision.ha.subtitle": "Connectez le panneau a Home Assistant.",
    "provision.ha.ws_url": "URL WebSocket (ws:// ou wss://)",
    "provision.ha.token": "Jeton d'acces longue duree",
    "provision.ha.show_token": "Afficher le token",
    "settings.wifi.heading": "Wi-Fi",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "Code pays",
    "settings.wifi.bssid": "Verrou BSSID (optionnel)",
    "settings.wifi.password": "Mot de passe",
    "settings.wifi.password_placeholder": "Laisser vide pour garder le mot de passe stocke",
    "settings.ha.heading": "Home Assistant",
    "settings.ha.ws_url": "URL WebSocket (ws:// ou wss://)",
    "settings.ha.token": "Jeton d'acces longue duree",
    "settings.ha.token_placeholder": "Laisser vide pour garder le token stocke",
    "settings.ha.rest_fallback": "Activer le fallback REST HA (defaut: off, WS prefere)",
    "settings.time.heading": "Temps",
    "settings.time.ntp_server": "Serveur NTP",
    "settings.time.timezone": "Fuseau horaire",
    "settings.time.search": "Rechercher un fuseau horaire…",
    "settings.time.show_zones": "Afficher les fuseaux horaires",
    "settings.time.search_hint": "Saisissez une partie du nom d’une ville ou d’une région, puis sélectionnez un fuseau horaire.",
    "settings.time.no_matches": "Aucun fuseau horaire correspondant",
    "settings.time.local_time": "Heure locale actuelle",
    "settings.time.clock_unavailable": "Heure de l’appareil indisponible ou non synchronisée",
    "settings.time.legacy_active": "Fuseau horaire existant au format ancien",
    "settings.time.legacy_hint": "Le fuseau horaire existant est conservé. Sélectionnez un lieu pour le remplacer.",
    "settings.time.list_unavailable": "Liste des fuseaux horaires indisponible. Rechargez les paramètres.",
    "settings.ui.heading": "UI",
    "settings.theme.heading": "Thème",
    "settings.ui.language": "Langue",
    "settings.ui.reload_languages": "Recharger les langues",
    "settings.ui.download_json": "Telecharger JSON",
    "settings.ui.upload_code": "Code langue",
    "settings.ui.upload_file": "Fichier JSON de traduction",
    "settings.ui.upload_button": "Uploader / Ajouter une langue",
    "settings.ap.heading": "Setup AP",
    "settings.ap.hint": "Si le setup AP est actif, connectez-vous et ouvrez <code>http://192.168.4.1</code>.",
    "settings.ota.heading": "Mise a jour firmware",
    "settings.ota.url": "URL OTA",
    "settings.ota.url_placeholder": "https://github.com/cptkirki/BETTA-HA-PANEL/releases/latest/download/...",
    "settings.ota.flash_url": "Flasher URL",
    "settings.ota.refresh": "Actualiser statut",
    "settings.ota.file": "Fichier OTA .bin",
    "settings.ota.upload": "Upload + Flash",
    "settings.ota.idle": "Pret pour une image OTA app. En cours: {running}, prochain slot: {next}, taille du slot: {size}.",
    "settings.ota.running": "OTA en cours: {progress}% ({written} / {total})",
    "settings.ota.downloading": "Telechargement depuis URL: {progress}% ({written} / {total})",
    "settings.ota.uploading": "Upload recu par le panneau: {progress}% ({written} / {total})",
    "settings.ota.success": "Image OTA ecrite. Redemarrage en cours.",
    "settings.ota.error": "OTA echouee: {error}",
    "settings.ota.rebooting": "L'appareil redemarre. Rouvrez le panneau lorsqu'il est de retour en ligne.",
    "settings.ota.no_file": "Choisissez d'abord un fichier OTA .bin.",
    "settings.ota.no_url": "Collez d'abord une URL OTA.",
    "settings.ota.starting_url": "Demarrage de l'OTA depuis l'URL...",
    "settings.ota.upload_progress": "Upload vers le panneau: {progress}% ({written} / {total})",
    "settings.ota.request_failed": "Requete OTA echouee: {error}",
    "settings.ota.target_slot": "Slot cible: {partition}",
    "settings.actions.heading": "Actions des parametres",
    "settings.actions.reload": "Recharger les parametres",
    "settings.actions.save": "Enregistrer + Redemarrer",
    "settings.actions.hint": "Apres enregistrement, l'appareil redemarre et peut passer du setup AP au Wi-Fi domestique.",
    "settings.info.configured": "Configure",
    "settings.info.connected": "Connecte",
    "settings.info.password_stored": "Mot de passe stocke",
    "settings.info.country": "Pays",
    "settings.info.rssi": "RSSI (AP connecte)",
    "settings.info.connected_bssid": "BSSID connecte",
    "settings.info.channel": "Canal",
    "settings.info.token_stored": "Token stocke",
    "settings.info.rest_fallback": "Fallback REST",
    "common.yes": "oui",
    "common.no": "non",
    "common.scan": "Scanner",
    "common.scan_wifi": "Scanner Wi-Fi",
    "common.save_reboot": "Enregistrer + Redemarrer",
    "status.idle": "Pret",
    "status.loading_settings": "Chargement des parametres...",
    "status.settings_loaded": "Parametres charges",
    "status.settings_load_failed": "Echec du chargement des parametres: {error}",
    "status.settings_save_failed": "Echec de l'enregistrement des parametres: {error}",
    "status.saving_settings": "Enregistrement des parametres...",
    "status.settings_saved_reboot": "Parametres enregistres. L'appareil redemarre dans ~2s.",
    "status.wifi_scan_running": "Scan Wi-Fi en cours...",
    "status.wifi_scan_complete": "Scan Wi-Fi termine ({count} reseaux)",
    "status.wifi_scan_failed": "Echec du scan Wi-Fi: {error}",
    "status.wifi_scan_timeout": "Delai du scan Wi-Fi depasse",
    "common.unknown_error": "Erreur inconnue",
    "wifi.scan_unavailable": "Le scan Wi-Fi est indisponible en mode setup AP sur ce materiel. Entrez le SSID manuellement.",
    "wifi.scan_click": "Cliquez sur \"Scanner Wi-Fi\" pour lister les reseaux proches.",
    "wifi.scan_click_short": "Cliquez sur \"Scanner\" pour lister les reseaux proches.",
    "wifi.scan_no_networks": "Aucun reseau trouve. Rapprochez-vous du routeur et reessayez.",
    "wifi.scan_found": "{count} reseau(x) trouve(s). Selectionnez-en un pour remplir le SSID.",
    "wifi.scan.connected_tag": "connecte",
    "wifi.scan.option_unavailable": "Scan indisponible",
    "wifi.scan.option_scanning": "Scan en cours...",
    "wifi.scan.option_not_run": "Aucun scan",
    "wifi.scan.option_no_networks": "Aucun reseau trouve",
    "wifi.scan.option_select": "Selectionner reseau ({count} trouves)",
    "settings.time.info": "Applique apres redemarrage. La synchronisation demarre quand le Wi-Fi est connecte.",
    "settings.ui.info": "L'apercu change immediatement. La langue enregistree s'applique apres redemarrage.",
    "settings.ap.active": "Setup AP actif: {ssid}\\nOuvrez http://192.168.4.1 en etant connecte a cet AP.",
    "settings.ap.inactive": "Setup AP inactif.\\nUtilisez l'IP du panneau sur votre Wi-Fi.",
    "settings.translation.info": "Uploadez un JSON pour ajouter ou mettre a jour une langue.",
    "settings.translation.upload_ok": "Langue \"{lang}\" uploadee.",
    "settings.translation.upload_fail": "Echec de l'upload: {error}",
    "settings.translation.no_file": "Choisissez d'abord un fichier JSON.",
    "settings.translation.invalid_json": "JSON invalide",
    "settings.translation.object_required": "Le JSON doit etre un objet",
    "settings.translation.invalid_code": "Le code langue doit utiliser [a-z0-9_-] et avoir 2-15 caracteres.",
    "settings.language.invalid_country": "Le code pays Wi-Fi doit etre un code ISO a 2 lettres (ex: US, DE)",
    "settings.language.invalid_bssid": "Le BSSID doit etre vide ou au format AA:BB:CC:DD:EE:FF",
    "settings.language.invalid_ha_url": "L'URL HA doit commencer par ws:// ou wss://",
    "provision.wifi.required_ssid": "SSID requis.",
    "provision.wifi.required_country": "Le code pays doit avoir 2 lettres (ex: US, DE).",
    "provision.ha.required_url": "URL WebSocket requise.",
    "provision.ha.invalid_url": "L'URL HA doit commencer par ws:// ou wss://.",
    "provision.ha.required_token": "Jeton d'acces longue duree requis.",
    "provision.saving_reboot": "Enregistrement des parametres et redemarrage...",
    "provision.saved_reboot": "Parametres enregistres. L'appareil redemarre dans ~2s.",
    "provision.save_failed": "Echec de l'enregistrement: {error}",
    "provision.wifi.hint": "Enregistrer redemarre le panneau. Apres redemarrage, la provision HA s'affiche.",
    "provision.ha.hint": "Enregistrer redemarre le panneau. Apres redemarrage, l'editeur est debloque.",
    "settings.language.option_de": "Deutsch",
    "settings.language.option_en": "English",
    "settings.language.option_es": "Espanol",
    "settings.language.option_fr": "Francais",
    "settings.language.option_pl": "Polski",
    "settings.language.option_zh-cn": "简体中文",
    "settings.language.option_zh-tw": "繁體中文",
  },
  pl: {
    "settings.time.heading": "Czas",
    "settings.time.ntp_server": "Serwer NTP",
    "settings.time.timezone": "Strefa czasowa",
    "settings.time.info": "Zmiany zostaną zastosowane po ponownym uruchomieniu. Synchronizacja czasu rozpoczyna się po połączeniu z Wi-Fi.",
    "settings.time.search": "Szukaj strefy czasowej…",
    "settings.time.show_zones": "Pokaż strefy czasowe",
    "settings.time.search_hint": "Wpisz część nazwy miasta lub regionu, a następnie wybierz strefę czasową.",
    "settings.time.no_matches": "Brak pasujących stref czasowych",
    "settings.time.local_time": "Aktualny czas lokalny",
    "settings.time.clock_unavailable": "Czas urządzenia jest niedostępny lub nie został zsynchronizowany",
    "settings.time.legacy_active": "Dotychczasowa strefa czasowa w starym formacie",
    "settings.time.legacy_hint": "Dotychczasowa strefa czasowa została zachowana. Wybierz lokalizację, aby ją zastąpić.",
    "settings.time.list_unavailable": "Lista stref czasowych jest niedostępna. Wczytaj ustawienia ponownie.",
    "common.yes": "tak",
    "common.no": "nie",
    "common.unknown_error": "nieznany błąd",
    "tabs.layout": "Układ",
    "tabs.settings": "Ustawienia",
    "status.saving_settings": "Zapisywanie ustawień...",
    "status.settings_loaded": "Ustawienia wczytane",
    "status.settings_save_failed": "Zapis ustawień nie powiódł się: {error}",
    "status.settings_load_failed": "Wczytanie ustawień nie powiodło się: {error}",
    "settings.wifi.heading": "Wi-Fi",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "Kod kraju",
    "settings.wifi.bssid": "Blokada BSSID (opcjonalnie)",
    "settings.wifi.password": "Hasło",
    "settings.wifi.password_placeholder": "Pozostaw puste, aby zachować zapisane hasło",
    "settings.wifi.static_enabled": "Stały adres IP (zamiast DHCP)",
    "settings.wifi.static_ip": "Adres IP",
    "settings.wifi.static_netmask": "Maska sieci",
    "settings.wifi.static_gateway": "Brama",
    "settings.wifi.static_dns": "DNS (opcjonalnie)",
    "settings.wifi.invalid_static_ip": "Adres IP, maska i brama muszą być poprawnymi adresami IPv4, gdy włączony jest stały IP",
    "settings.display.heading": "Wyświetlacz / Wygaszacz",
    "settings.display.info": "Jasność i kolory działają natychmiast. Tapeta jest zapisywana w urządzeniu.",
    "settings.display.brightness": "Jasność (%)",
    "settings.display.screensaver_enabled": "Wygaszacz ekranu",
    "settings.display.screensaver_timeout": "Czas wygaszacza (s)",
    "settings.display.saver_brightness": "Jasność wygaszacza (%)",
    "settings.display.screen_off_enabled": "Wyłącz ekran",
    "settings.display.screen_off_timeout": "Czas do wyłączenia (s)",
    "settings.display.clock_format": "Format zegara",
    "settings.display.clock_format_h24": "24-godzinny (europejski, 23:00)",
    "settings.display.clock_format_h12": "12-godzinny (AM/PM, 11:00 PM)",
    "settings.display.clock_format_hint": "Format 12-godzinny pokazuje znacznik AM/PM na zegarze wygaszacza oraz przy zegarze w górnym pasku.",
    "settings.display.clock_style": "Styl zegara",
    "settings.display.clock_style_classic": "Klasyczny",
    "settings.display.clock_style_flip": "Kafelki z przewracaniem",
    "settings.display.clock_style_hint": "Kafelki animują się przy każdej zmianie, ale pokazują tylko HH:MM (bez sekund).",
    "settings.display.show_seconds": "Pokaż sekundy",
    "settings.display.show_date": "Pokaż datę",
    "settings.display.clock_color": "Kolor godziny",
    "settings.display.date_color": "Kolor daty",
    "settings.display.night_mode_enabled": "Harmonogram nocny (przyciemnienie / wyłączenie ekranu w nocy)",
    "settings.display.night_start": "Początek nocy",
    "settings.display.night_end": "Koniec nocy",
    "settings.display.night_brightness": "Jasność w nocy (%, 0 = ekran wyłączony)",
    "settings.display.night_wake": "Wybudzenie dotykiem w oknie nocnym (s)",
    "settings.display.night_hint": "W oknie nocnym panel wymusza jasność nocną (0% wyłącza ekran). Dotknięcie ekranu wybudza go na ustawioną liczbę sekund. Wymaga zsynchronizowanego zegara.",
    "settings.display.night_currently_active": "Tryb nocny jest teraz aktywny.",
    "settings.display.theme_auto_enabled": "Motyw zależny od pory dnia",
    "settings.display.theme_day": "Motyw dzienny",
    "settings.display.theme_night": "Motyw nocny",
    "settings.display.theme_auto_none": "- motyw globalny -",
    "settings.display.theme_auto_hint": "Poza oknem nocnym rysowany jest motyw dzienny, w oknie nocnym motyw nocny. Okno wyznaczają godziny początku i końca nocy poniżej i działa nawet gdy harmonogram jasności nocnej jest wyłączony. Strona z ustawionym page_theme w layoucie i tak ma pierwszeństwo. Wymaga zsynchronizowanego zegara.",
    "settings.display.wallpaper": "Tapeta",
    "settings.display.wallpaper_hint": "Obraz jest skalowany i konwertowany do RGB565 w przeglądarce, a następnie wysyłany do panelu.",
    "settings.display.upload_wallpaper": "Wgraj tapetę",
    "settings.display.remove_wallpaper": "Usuń tapetę",
    "settings.display.apply": "Zastosuj teraz (bez restartu)",
    "settings.display.press_fx": "Reakcja na dotyk (wygląd kafelka przy przytrzymaniu)",
    "settings.display.press_fx_dim": "Przygaszenie (%)",
    "settings.display.press_fx_scale": "Zmniejszenie (% rozmiaru)",
    "settings.display.press_fx_none": "Brak",
    "settings.display.press_fx_dim_mode": "Przygaszenie",
    "settings.display.press_fx_scale_mode": "Zmniejszenie",
    "settings.display.press_fx_both": "Przygaszenie + zmniejszenie",
    "settings.display.press_fx_hint": "Działa dla kafelków reagujących na dotyk całego kafelka (przełącznik, przycisk, ogrzewanie). Przytrzymaj próbkę poniżej, aby zobaczyć efekt.",
    "settings.display.press_fx_preview": "Kafelek",
    "settings.display.value_anim": "Animacja wartości (gdy wartość kafelka się zmienia)",
    "settings.display.value_anim_ms": "Czas trwania (ms)",
    "settings.display.value_anim_none": "Brak",
    "settings.display.value_anim_fade": "Płynne pojawienie",
    "settings.display.value_anim_slide": "Wjazd z dołu",
    "settings.display.value_anim_count": "Przeliczanie cyfr",
    "settings.display.value_anim_preview": "Podgląd",
    "settings.display.value_anim_hint": "Ożywia wartości zmieniające się same (czujniki, pogoda, moc). Przeliczanie cyfr zostawia jednostkę na miejscu i działa dla wartości typu \"22.5 °C\". 0 ms wyłącza efekt.",
    "settings.display.topbar": "Górny pasek",
    "settings.display.topbar_show_clock": "Zegar",
    "settings.display.topbar_show_date": "Data",
    "settings.display.topbar_show_gear": "Ikona ustawień",
    "settings.display.topbar_show_status": "Ikony Wi-Fi / HA",
    "settings.display.topbar_icon_text": "Napisy zamiast logo",
    "settings.display.topbar_custom_colors": "Własne kolory",
    "settings.display.topbar_bg_color": "Tło paska",
    "settings.display.topbar_clock_color": "Kolor zegara",
    "settings.display.topbar_date_color": "Kolor daty",
    "settings.display.topbar_gear_color": "Kolor ikony ustawień",
    "settings.display.topbar_ha_color": "Kolor Home Assistant",
    "settings.display.topbar_wifi_color": "Kolor Wi-Fi",
    "settings.display.topbar_hint": "Zegar jest wyśrodkowany w wolnym miejscu, a jego czcionka sama się zmniejsza, więc elementy nigdy na siebie nie nachodzą. \"Napisy zamiast logo\" zamienia glify Wi-Fi / Home Assistant / zębatki na wyrazy.",
    "settings.display.topbar_color_hint": "Przy wyłączonych \"Własnych kolorach\" górny pasek korzysta z aktywnego motywu.",
    "settings.display.navbar": "Dolny pasek (zakładki stron)",
    "settings.display.nav_custom_colors": "Własne kolory",
    "settings.display.nav_bar_bg_color": "Tło paska",
    "settings.display.nav_bar_border_color": "Górna krawędź paska",
    "settings.display.nav_button_bg_color": "Tło zakładki",
    "settings.display.nav_button_border_color": "Obramowanie zakładki",
    "settings.display.nav_tab_idle_color": "Kolor tytułu strony",
    "settings.display.nav_tab_active_color": "Kolor aktywnego tytułu strony",
    "settings.display.nav_home_idle_color": "Kolor ikony domu",
    "settings.display.nav_home_active_color": "Kolor aktywnej ikony domu",
    "settings.display.nav_hint": "Dolny pasek pokazuje przycisk domu i jedną zakładkę na każdą stronę. Zbyt długie nazwy stron są skracane wielokropkiem.",
    "settings.display.nav_color_hint": "Przy wyłączonych \"Własnych kolorach\" dolny pasek korzysta z aktywnego motywu.",
    "settings.display.applied": "Ustawienia wyświetlacza zastosowane.",
    "settings.display.no_wallpaper_file": "Najpierw wybierz plik obrazu.",
    "settings.display.converting": "Konwertowanie obrazu...",
    "settings.display.convert_failed": "Konwersja obrazu nie powiodła się.",
    "settings.display.uploading": "Wgrywanie tapety...",
    "settings.display.wallpaper_uploaded": "Tapeta wgrana.",
    "settings.display.removing": "Usuwanie tapety...",
    "settings.display.wallpaper_removed": "Tapeta usunięta.",
    "settings.sd.heading": "Karta microSD",
    "settings.sd.enabled": "Włącz kartę microSD (gniazdo TF)",
    "settings.sd.refresh": "Odśwież",
    "settings.sd.export_logs": "Zapisz logi na karcie",
    "settings.sd.format": "Formatuj kartę",
    "settings.sd.format_confirm": "Sformatować kartę microSD? Wszystkie pliki na karcie zostaną usunięte.",
    "settings.sd.up": "W górę",
    "settings.sd.root": "Katalog główny karty",
    "settings.sd.logs": "Folder logów",
    "settings.sd.photos": "Folder zdjęć",
    "settings.sd.unsupported": "Ta płytka nie ma gniazda microSD.",
    "settings.sd.disabled": "Obsługa microSD jest wyłączona. Zaznacz opcję, aby karta była montowana przy starcie.",
    "settings.sd.no_card": "W gniazdku nie ma karty. Włóż kartę i naciśnij Odśwież - panel wykryje ją też sam podczas pracy.",
    "settings.sd.no_filesystem": "Wykryto kartę {name}, ale nie ma na niej systemu plików FAT, który panel potrafi odczytać. Naciśnij Formatuj, aby ją przygotować - to usuwa zawartość karty.",
    "settings.sd.exfat": "Karta {name} ma system plików exFAT, którego panel nie potrafi odczytać. Naciśnij Formatuj, aby zmienić go na FAT32 - to usuwa zawartość karty.",
    "settings.sd.ntfs": "Karta {name} ma system plików NTFS, którego panel nie potrafi odczytać. Naciśnij Formatuj, aby zmienić go na FAT32 - to usuwa zawartość karty.",
    "settings.sd.formatting": "Formatowanie... pierwsze montowanie nowej karty może potrwać kilka sekund.",
    "settings.sd.mounted": "Karta: {name} - razem {total} MB, wolne {free} MB",
    "settings.sd.empty": "Ten folder jest pusty.",
    "settings.sd.loading": "Odczyt karty...",
    "settings.sd.delete": "Usuń",
    "settings.sd.delete_confirm": "Usunąć {name} z karty?",
    "settings.sd.deleted": "Plik usunięty.",
    "settings.sd.delete_failed": "Nie udało się usunąć tego elementu.",
    "settings.sd.use_wallpaper": "Ustaw jako tapetę",
    "settings.sd.wallpaper_failed": "Nie udało się zamienić tego obrazu na tapetę.",
    "settings.sd.wallpaper_ok": "Obraz z karty jest teraz tapetą.",
    "settings.sd.wallpaper_sd": "Obraz wygaszacza: na tej karcie microSD (panel trzyma jedną kopię i przenosi ją do pamięci wewnętrznej po wyjęciu karty).",
    "settings.sd.wallpaper_flash": "Obraz wygaszacza: w pamięci wewnętrznej (przeniesie się na kartę, gdy tylko zostanie włożona).",
    "settings.sd.wallpaper_none": "Obraz wygaszacza: brak - wgraj go w ustawieniach ekranu.",
    "settings.sd.exporting": "Zapisywanie logów...",
    "settings.sd.exported": "Logi zapisane w {path}",
    "settings.sd.export_failed": "Nie udało się zapisać logów.",
    "settings.sd.formatting": "Formatowanie...",
    "settings.sd.formatted": "Karta sformatowana.",
    "settings.sd.format_failed": "Formatowanie nie powiodło się.",
    "settings.sd.type_dir": "Folder",
    "settings.sd.status_enabled": "Obsługa microSD włączona.",
    "settings.sd.status_disabled": "Obsługa microSD wyłączona.",
    "settings.sd.apply_failed": "Nie udało się zastosować ustawienia microSD.",
    "settings.pages.heading": "Strony / Przejścia stron",
    "settings.pages.transition": "Przejście stron",
    "settings.pages.transition_ms": "Czas przejścia (ms)",
    "settings.pages.transition_hint": "Animacja odtwarzana przy zmianie strony panelu. 0 ms wyłącza wybrany efekt.",
    "settings.pages.option_none": "Brak (natychmiast)",
    "settings.pages.option_fade": "Przenikanie",
    "settings.pages.option_slide": "Przesuwanie (lewo/prawo)",
    "settings.pages.option_slide_up": "Przesuwanie (góra/dół)",
    "settings.pages.option_fade_slide": "Przenikanie + przesuwanie",
    "settings.pages.target": "Pokaż stronę na panelu",
    "settings.pages.reload": "Odśwież listę stron",
    "settings.pages.show": "Pokaż teraz",
    "settings.pages.activated": "Strona \"{page}\" jest teraz wyświetlana na panelu.",
    "settings.pages.current": "Aktualnie wyświetlana strona: {page}",
    "settings.pages.apply": "Zastosuj teraz (bez restartu)",
    "settings.pages.applied": "Ustawienia przejść stron zastosowane.",
    "settings.mqtt.heading": "MQTT / Home Assistant",
    "settings.mqtt.enabled": "Włącz MQTT (automatyczne wykrycie jako urządzenie w Home Assistant)",
    "settings.mqtt.use_tls": "Szyfruj połączenie (TLS, mqtts / port 8883)",
    "settings.mqtt.tls_hint": "TLS weryfikuje certyfikat brokera względem wbudowanego zbioru zaufanych certyfikatów ESP. Port przełączy się na 8883 automatycznie, gdy w polu nadal jest 1883.",
    "settings.mqtt.reapply_hint": "Kliknij „Zastosuj MQTT”, aby wysłać zmianę do panelu.",
    "settings.mqtt.host": "Adres brokera (pusty = wyznacz z adresu HA)",
    "settings.mqtt.port": "Port brokera",
    "settings.mqtt.username": "Użytkownik",
    "settings.mqtt.password": "Hasło",
    "settings.mqtt.discovery_prefix": "Prefiks wykrywania",
    "settings.mqtt.info": "Panel pojawia się jako urządzenie w Home Assistant przez wykrywanie MQTT. Zmiany działają bez restartu.",
    "settings.mqtt.apply": "Zastosuj MQTT (bez restartu)",
    "settings.mqtt.applied": "Ustawienia MQTT zastosowane.",
    "layout.status.conflict_title": "Układ na panelu został zmieniony w innym miejscu",
    "layout.status.conflict_confirm": "Układ na panelu został zmieniony z innego źródła (inna karta przeglądarki, API lub przywracanie kopii).\n\nOK = nadpisz wersją z edytora\nAnuluj = zachowaj wersję z panelu (odśwież stronę, aby odrzucić lokalne zmiany).",
    "layout.status.conflict_overridden": "Zmiany z panelu nadpisane przez edytor.",
    "layout.widgets.add_binary_sensor": "+ Czujnik binarny",
    "layout.inspector.button_style": "Styl przycisku",
    "layout.inspector.binary_show_title": "Pokaż tytuł",
    "layout.inspector.binary_color_on": "Kolor ON (puste = auto)",
    "layout.inspector.binary_color_off": "Kolor OFF (puste = auto)",
    "layout.inspector.binary_text_on": "Tekst ON (puste = auto)",
    "layout.inspector.binary_text_off": "Tekst OFF (puste = auto)",
    "layout.inspector.sensor_value_color": "Kolor wartości (puste = auto)",
    "layout.tile_look.group": "Wygląd kafelka (ten kafelek)",
    "layout.tile_look.preset": "Szablon",
    "layout.tile_look.bg_color": "Kolor tła",
    "layout.tile_look.bg_grad_color": "Kolor końca gradientu",
    "layout.tile_look.bg_grad_dir": "Kierunek gradientu",
    "layout.tile_look.border_color": "Kolor obramowania",
    "layout.tile_look.border_width": "Grubość obramowania (px)",
    "layout.tile_look.radius": "Promień narożników (px)",
    "layout.tile_look.corner_shape": "Kształt narożników",
    "layout.tile_look.corner_hint": "Kwadratowy kafelek przy maksymalnym promieniu staje się kołem.",
    "layout.tile_look.opacity": "Krycie tła (%)",
    "layout.tile_look.font_scale": "Rozmiar czcionki",
    "layout.tile_look.shadow": "Cień",
    "layout.tile_look.text_color": "Kolor tekstu (wszystko)",
    "layout.tile_look.title_color": "Kolor tytułu",
    "layout.tile_look.label_color": "Kolor opisu encji",
    "layout.tile_look.value_color": "Kolor wartości / statusu",
    "layout.tile_look.icon_color": "Kolor ikony",
    "layout.tile_look.reset": "Przywróć domyślny wygląd",
    "layout.tile_look.hint": "Puste pola = motyw. Kolory w formacie #RRGGBB.",
  "layout.tile_look.copy_source": "Kopiuj wygląd z",
  "layout.tile_look.copy_apply": "Kopiuj wygląd",
  "layout.tile_look.copy_apply_page": "Zastosuj do wszystkich kafelków",
  "layout.tile_look.copy_placeholder": "Wybierz kafelek...",
  "layout.tile_look.copy_empty": "Brak innych kafelków do skopiowania",
  "layout.tile_look.copy_none": "Najpierw wybierz kafelek źródłowy.",
  "layout.tile_look.copy_done": "Skopiowano wygląd z: {source}",
  "layout.tile_look.copy_page_done": "Zastosowano wygląd do {count} kafelków.",
  "layout.tile_look.copy_hint": "Kopiuje tylko tło, obramowanie, kolory i rozmiar czcionki - encja, tytuł i wymiary bez zmian.",
    "layout.page_look.heading": "Wygląd strony",
    "layout.page_look.group": "Wygląd strony (ta strona)",
    "layout.page_look.preset": "Zestaw",
    "layout.page_look.bg_color": "Kolor tła",
    "layout.page_look.bg_grad_color": "Kolor końca gradientu",
    "layout.page_look.bg_grad_dir": "Kierunek gradientu",
    "layout.page_look.wallpaper": "Użyj tapety panelu",
    "layout.page_look.dim": "Przyciemnienie tapety (%)",
    "layout.page_look.reset": "Reset wyglądu strony",
    "layout.page_look.reset_done": "Wygląd strony zresetowany.",
    "layout.page_look.page_theme": "Motyw tylko dla tej strony",
    "layout.page_look.page_theme_hint": "Strona zostanie przemalowana tym motywem zaraz po jej pokazaniu. \"Globalny\" oznacza aktywny motyw / motyw dzienno-nocny.",
    "layout.page_look.theme_none": "- motyw globalny / dzień-noc -",
    "layout.page_look.hint": "Puste pola oznaczają tło panelu. Tapeta jest na panelu przyciemniana.",
    "layout.option.page_preset.auto": "Domyślny panelu",
    "layout.option.page_preset.midnight": "Północ",
    "layout.option.page_preset.deep_sea": "Głębokie morze",
    "layout.option.page_preset.forest": "Las",
    "layout.option.page_preset.sunset": "Zachód słońca",
    "layout.option.page_preset.plum": "Śliwka",
    "layout.option.page_preset.wallpaper": "Tapeta",
    "layout.option.page_preset.wallpaper_dim": "Tapeta (ciemna)",
    "layout.option.page_grad_dir.none": "Brak",
    "layout.option.page_grad_dir.hor": "Poziomy",
    "layout.option.page_grad_dir.ver": "Pionowy",
    "layout.option.tile_grad_dir.none": "Brak",
    "layout.option.tile_grad_dir.hor": "Poziomy",
    "layout.option.tile_grad_dir.ver": "Pionowy",
    "layout.option.tile_font_scale.auto": "Auto",
    "layout.option.tile_font_scale.s": "Mała",
    "layout.option.tile_font_scale.m": "Średnia",
    "layout.option.tile_font_scale.l": "Duża",
    "layout.option.tile_font_scale.xl": "Bardzo duża",
    "layout.option.tile_preset.auto": "Domyślny motywu",
    "layout.option.tile_preset.graphite": "Grafit",
    "layout.option.tile_preset.emerald": "Szmaragd",
    "layout.option.tile_preset.amber": "Bursztyn",
    "layout.option.tile_preset.violet": "Fiolet",
  "layout.option.tile_preset.sky": "Niebo",
    "layout.option.tile_preset.glass": "Szkło",
    "layout.option.tile_corner.custom": "Własny (użyj promienia)",
    "layout.option.tile_corner.square": "Kwadrat (0 px)",
    "layout.option.tile_corner.soft": "Delikatny (10 px)",
    "layout.option.tile_corner.rounded": "Zaokrąglony (16 px)",
    "layout.option.tile_corner.pill": "Kapsuła (40 px)",
    "layout.option.tile_corner.circle": "Koło (maks. promień)",
    "layout.option.button_style.switch": "przełącznik (domyślny)",
    "layout.option.button_style.power_toggle": "przełącznik zasilania",
    "layout.option.button_style.power_status": "status zasilania",
    "layout.option.button_style.plug_icon": "ikona wtyczki",
    "layout.option.button_style.lamp_icon": "ikona lampy",
    "layout.option.button_style.highlight": "podświetlenie",
    "layout.option.button_style.status_text": "tekst statusu",
    "entity_picker.refresh": "Odśwież",
    "entity_picker.search": "Szukaj",
    "entity_picker.close": "Zamknij",
    "entity_picker.search_placeholder": "Szukaj po nazwie, encji lub pomieszczeniu",
    "entity_picker.search_hint": "Wpisz co najmniej {count} znaki, aby wyszukać {items}.",
    "entity_picker.search_ready": "Naciśnij Enter lub Szukaj, aby wyszukać {items}.",
    "entity_picker.loading_items": "Ładowanie: {items}...",
    "entity_picker.refreshing_items": "Odświeżanie: {items}...",
    "entity_picker.pending": "Czekam na Home Assistant...",
    "entity_picker.disconnected": "Home Assistant nie jest połączony.",
    "entity_picker.empty_items": "Brak wyników: {items}.",
    "entity_picker.truncated": "Lista obcięta limitem firmware.",
    "entity_picker.progress_total": "{loaded} / {target} z {total}",
    "entity_picker.fetch_failed_items": "Błąd wyszukiwania ({items}): {error}",
    "entity_picker.added_widget": "Dodano {widget}: {entity}",
    "entity_picker.title_binary": "Wybierz czujnik binarny",
    "entity_picker.blank_binary": "Pusty kafelek czujnika binarnego",
    "entity_picker.widget_binary": "Kafelek czujnika binarnego",
    "entity_picker.items_binary": "czujniki binarne",
    "entity_picker.title_alarm": "Wybierz panel alarmu",
    "entity_picker.blank_alarm": "Pusty kafelek alarmu",
    "entity_picker.widget_alarm": "Kafelek alarmu",
    "entity_picker.items_alarm": "panele alarmu",
    "entity_picker.items_cover": "rolety",
    "entity_picker.items_scene": "sceny",
    "entity_picker.items_person": "osoby",
    "entity_picker.items_timer": "minutniki",
    "entity_picker.title_cover": "Wybierz roletę",
    "entity_picker.title_scene": "Wybierz scenę",
    "entity_picker.title_person": "Wybierz osobę",
    "entity_picker.title_timer": "Wybierz minutnik",
    "entity_picker.blank_cover": "Pusty kafelek rolety",
    "entity_picker.blank_scene": "Pusty kafelek sceny",
    "entity_picker.blank_person": "Pusty kafelek obecności",
    "entity_picker.blank_timer": "Pusty kafelek minutnika",
    "entity_picker.widget_cover": "Kafelek rolety",
    "entity_picker.widget_scene": "Kafelek sceny",
    "entity_picker.widget_person": "Kafelek obecności",
    "entity_picker.widget_timer": "Kafelek minutnika",
    "layout.widgets.add_alarm_tile": "+ Panel alarmu",
    "layout.inspector.alarm_code": "Kod PIN (puste = bez kodu)",
    "layout.inspector.alarm_ask_code": "Zawsze pytaj o PIN (auto: gdy wymaga HA)",
    "layout.inspector.alarm_backend": "Sposób sterowania",
    "layout.inspector.alarm_zone_label": "Nazwa strefy (puste = brak)",
    "layout.inspector.alarm_show_sensors": "Pokaż otwarte czujniki na kafelku",
    "layout.inspector.alarm_show_bypassed": "Pokaż liczbę pominiętych czujników",
    "layout.inspector.alarm_force_arm": "Pytaj o wymuszone uzbrojenie przy otwartych czujnikach",
    "layout.inspector.alarm_skip_delay": "Pomiń opóźnienie wyjścia (Alarmo)",
    "layout.inspector.alarm_modes": "Przyciski na kafelku",
    "layout.inspector.alarm_mode_away": "Uzbrój poza domem",
    "layout.inspector.alarm_mode_home": "Uzbrój w domu",
    "layout.inspector.alarm_mode_night": "Uzbrój na noc",
    "layout.inspector.alarm_mode_vacation": "Uzbrój na urlop",
    "layout.inspector.alarm_mode_custom": "Uzbrojenie własne",
    "layout.inspector.alarm_mode_disarm": "Rozbrój",
    "layout.widgets.add_clock": "+ Zegar",
    "layout.inspector.clock_hint": "Kafelek zegara: pokazuje aktualną godzinę (i opcjonalnie datę).",
    "layout.inspector.clock_show_seconds": "Pokazuj sekundy",
    "layout.inspector.clock_show_date": "Pokazuj datę",
    "settings.system.heading": "System",
    "settings.system.auto_restart_enabled": "Okresowo restartuj panel",
    "settings.system.auto_restart_hours": "Restart co (godzin)",
    "settings.system.hint": "Po włączeniu panel sam się zrestartuje po ustawionej liczbie godzin (1-168).",
    "settings.backup.heading": "Kopia zapasowa / Przywracanie",
    "settings.backup.hint": "Plik kopii zawiera układ, ustawienia publiczne oraz wszystkie motywy własne. Dane Wi-Fi, token HA, hasło MQTT i tapeta celowo NIE są zapisywane.",
    "settings.backup.download": "Pobierz kopię zapasową",
    "settings.backup.file": "Plik kopii do przywrócenia",
    "settings.backup.restore": "Przywróć kopię",
    "settings.backup.choose_file": "Najpierw wybierz plik JSON kopii zapasowej.",
    "settings.backup.downloading": "Pobieranie kopii...",
    "settings.backup.downloaded": "Kopia zapasowa pobrana.",
    "settings.backup.download_failed": "Nie udało się pobrać kopii: {error}",
    "settings.backup.restoring": "Przywracanie kopii...",
    "settings.backup.restore_failed": "Przywracanie nie udało się: {error}",
    "settings.backup.restored": "Kopia przywrócona: układ {layout}, ustawienia {settings}, motywy {themes}.",
    "settings.backup.restart_hint": "Zmieniły się ustawienia połączenia - zrestartuj panel, aby je zastosować.",
    "settings.logs.heading": "Logi",
    "settings.logs.refresh": "Odśwież",
    "settings.logs.pause": "Wstrzymaj",
    "settings.logs.resume": "Wznów",
    "settings.logs.clear": "Wyczyść",
    "settings.logs.auto_scroll": "Auto-przewijanie",
    "settings.logs.download": "Pobierz log",
    "settings.logs.loading": "Wczytywanie logów...",
    "settings.logs.empty": "Brak wpisów. Pojawią się tu błędy, ostrzeżenia i znaczniki awarii.",
    "settings.logs.updated": "Zaktualizowano {time}",
    "settings.logs.fetch_failed": "Nie udało się odczytać logów: {error}",
    "settings.logs.cleared": "Plik logu wyczyszczony.",
    "settings.logs.clear_failed": "Nie udało się wyczyścić logów: {error}",
    "settings.diagnostics.heading": "Diagnostyka",
    "settings.diagnostics.refresh": "Odśwież",
    "settings.diagnostics.auto_refresh": "Odświeżaj automatycznie (10 s)",
    "settings.diagnostics.loading": "Odczyt diagnostyki...",
    "settings.diagnostics.updated": "Zaktualizowano {time}",
    "settings.diagnostics.empty": "Brak danych.",
    "settings.diagnostics.fetch_failed": "Nie udało się odczytać diagnostyki: {error}",
    "settings.diagnostics.yes": "tak",
    "settings.diagnostics.no": "nie",
    "settings.diagnostics.uptime": "Czas pracy",
    "settings.diagnostics.reset_reason": "Przyczyna restartu",
    "settings.diagnostics.boot_count": "Liczba uruchomień",
    "settings.diagnostics.cpu_temp": "Temperatura CPU",
    "settings.diagnostics.version": "Wersja firmware",
    "settings.diagnostics.project": "Projekt kompilacji",
    "settings.diagnostics.idf": "ESP-IDF",
    "settings.diagnostics.build_date": "Kompilacja",
    "settings.diagnostics.panel": "Układ",
    "settings.diagnostics.screen": "Ekran",
    "settings.diagnostics.heap_free": "Wolny heap",
    "settings.diagnostics.heap_min": "Minimum heapu",
    "settings.diagnostics.heap_largest": "Największy wolny blok",
    "settings.diagnostics.heap_fragmentation": "Fragmentacja",
    "settings.diagnostics.heap_dma": "Wewnętrzne DMA wolne / największy",
    "settings.diagnostics.heap_blocks": "Bloki heapu użyte / wolne",
    "settings.diagnostics.iram_free": "Wolne IRAM",
    "settings.diagnostics.psram_free": "Wolne PSRAM",
    "settings.diagnostics.connected": "Połączono",
    "settings.diagnostics.ssid": "SSID",
    "settings.diagnostics.ip": "Adres IP",
    "settings.diagnostics.rssi": "Sygnał (RSSI)",
    "settings.diagnostics.channel": "Kanał",
    "settings.diagnostics.wifi_drops": "Rozłączenia Wi-Fi",
    "settings.diagnostics.wifi_reconnects": "Próby ponownego połączenia",
    "settings.diagnostics.wifi_recoveries": "Rekowery sterownika",
    "settings.diagnostics.wifi_last_drop": "Ostatnie rozłączenie",
    "settings.diagnostics.wifi_session": "Poprzednia sesja",
    "settings.diagnostics.sync_done": "Synchronizacja wstępna",
    "settings.diagnostics.base_url": "Adres HA REST",
    "settings.diagnostics.cert_cn": "Nazwa w certyfikacie TLS",
    "settings.diagnostics.ws_connects": "Połączenia WS",
    "settings.diagnostics.ws_disconnects": "Rozłączenia WS",
    "settings.diagnostics.ws_recoveries": "Rekowery HA",
    "settings.diagnostics.ws_last_session": "Ostatnia sesja WS",
    "settings.diagnostics.missing_entities": "Brakujące encje",
    "settings.diagnostics.mqtt_enabled": "MQTT włączone",
    "settings.diagnostics.mqtt_tls": "MQTT TLS",
    "settings.diagnostics.broker": "Broker",
    "settings.diagnostics.running_partition": "Aktywna partycja",
    "settings.diagnostics.next_partition": "Slot aktualizacji",
    "settings.diagnostics.image_state": "Stan obrazu",
    "settings.diagnostics.rollback_enabled": "Rollback włączony",
    "settings.diagnostics.boot_confirmed": "Obraz potwierdzony",
    "settings.diagnostics.card_status": "Stan",
    "settings.diagnostics.card_firmware": "Firmware",
    "settings.diagnostics.card_memory": "Pamięć",
    "settings.diagnostics.card_wifi": "Wi-Fi",
    "settings.diagnostics.card_ha": "Home Assistant",
    "settings.diagnostics.card_mqtt": "MQTT",
    "settings.diagnostics.card_ota": "OTA / rollback",
    "settings.diagnostics.ota_state.new": "nowy (jeszcze nie uruchomiony)",
    "settings.diagnostics.ota_state.pending_verify": "czeka na potwierdzenie",
    "settings.diagnostics.ota_state.valid": "poprawny",
    "settings.diagnostics.ota_state.invalid": "niepoprawny",
    "settings.diagnostics.ota_state.aborted": "przerwany",
    "settings.diagnostics.ota_state.undefined": "nie śledzony (bootloader bez rollbacku)",
    "settings.diagnostics.bootloader_note": "Firmware obsługuje rollback, ale bootloader na panelu jeszcze nie śledzi stanu obrazu. Wgraj raz bootloader przez USB (idf.py flash), aby automatyczny powrót do poprzedniej wersji po nieudanej aktualizacji zaczął działać.",
    "settings.language.option_pl": "Polski",
  },
  // BEGIN GENERATED CHINESE CATALOGS
  "zh-cn": {
    "tabs.layout": "布局",
    "tabs.settings": "设置",
    "sidebar.title": "BETTA 编辑器",
    "sidebar.subtitle": "布局以 JSON 为准",
    "layout.pages.heading": "页面",
    "layout.pages.add": "+ 页面",
    "layout.pages.add_energy": "+ 能源页面",
    "layout.pages.add_music": "+ 音乐页面",
    "layout.pages.delete": "删除",
    "layout.pages.confirm_delete": "删除页面“{name}”？该页面中的所有组件也会被删除。",
    "layout.pages.title_label": "页面标题",
    "layout.pages.title_placeholder": "显示屏上的页面名称",
    "layout.pages.apply_title": "应用页面标题",
    "layout.pages.new_title": "页面 {number}",
    "layout.pages.energy_title": "能源",
    "layout.pages.music_title": "音乐",
    "layout.energy.heading": "能源页面",
    "layout.energy.hint": "选择同步 Home Assistant 能源数据，或手动指定实时传感器。",
    "layout.energy.source": "数据来源",
    "layout.energy.source_ha": "Home Assistant 能源",
    "layout.energy.source_manual": "手动实时传感器",
    "layout.energy.source_hint_ha": "使用 Home Assistant 中已配置的能源仪表板。",
    "layout.energy.source_hint_manual": "专业选项：使用 Home Assistant 中指定的 W/kW 实时传感器。",
    "layout.energy.home_power": "家庭用电功率",
    "layout.energy.solar_power": "光伏功率",
    "layout.energy.grid_power": "电网功率（带正负号）",
    "layout.energy.grid_import": "电网取电功率",
    "layout.energy.grid_export": "电网回馈功率",
    "layout.energy.battery_power": "电池功率（带正负号）",
    "layout.energy.battery_charge": "电池充电功率",
    "layout.energy.battery_discharge": "电池放电功率",
    "layout.energy.battery_soc": "电池荷电状态",
    "layout.energy.apply": "应用能源配置",
    "layout.energy.no_widgets": "能源页面使用专用仪表板，不支持添加组件。",
    "layout.energy.preview_title": "能源流向",
    "layout.energy.sensor_count_one": "{count} 个传感器",
    "layout.energy.sensor_count_many": "{count} 个传感器",
    "layout.energy.no_sensor": "未配置传感器",
    "layout.energy.preview_source_ha": "HA 能源数据",
    "layout.energy.preview_source_manual": "实时传感器",
    "layout.energy.preview_auto": "从 HA 自动获取",
    "layout.energy.low_carbon": "低碳",
    "layout.energy.grid": "电网",
    "layout.energy.solar": "光伏",
    "layout.energy.gas": "燃气",
    "layout.energy.home": "家庭用电",
    "layout.energy.battery": "储能",
    "layout.energy.water": "用水",
    "layout.music.heading": "Music Assistant",
    "layout.music.hint": "正在播放页面可显示专辑封面、播放控制、播放进度和音量。播放器列表留空时，将从 Home Assistant 自动发现媒体播放器。",
    "layout.music.player_entity": "主播放器",
    "layout.music.players": "播放器列表（用逗号分隔）",
    "layout.music.apply": "应用音乐配置",
    "layout.music.no_widgets": "音乐页面使用专用的“正在播放”视图，不支持添加组件。",
    "layout.music.preview_title": "正在播放",
    "layout.music.preview_subtitle": "专辑封面、播放控制、播放进度和音量",
    "layout.status.energy_page_only": "能源页面不支持添加组件。",
    "layout.status.music_page_only": "音乐页面不支持添加组件。",
    "layout.widgets.heading": "组件",
    "layout.widgets.add_sensor": "+ 传感器",
    "layout.widgets.add_binary_sensor": "+ 二进制传感器",
    "layout.widgets.add_button": "+ 按钮",
    "layout.widgets.add_slider": "+ 滑块",
    "layout.widgets.add_graph": "+ 图表",
    "layout.widgets.add_empty_tile": "+ 空白卡片",
    "layout.widgets.add_light_tile": "+ 灯光卡片",
    "layout.widgets.add_heating_tile": "+ 温控卡片",
    "layout.widgets.add_weather_tile": "+ 天气",
    "layout.widgets.add_weather_3day": "+ 天气预报",
    "layout.widgets.add_todo": "+ 待办清单",
    "layout.widgets.add_media_player": "+ 媒体播放器",
    "layout.widgets.add_roborock": "+ Roborock",
    "layout.widgets.add_alarm_tile": "+ 安防面板",
    "layout.widgets.add_clock": "+ 时钟",
    "layout.widgets.quick_setup": "快速设置",
    "layout.widgets.delete": "删除组件",
    "layout.widgets.confirm_delete": "删除组件“{name}”？",
    "entity_picker.title": "选择灯光",
    "entity_picker.title_sensor": "选择传感器",
    "entity_picker.title_binary": "选择二进制传感器",
    "entity_picker.title_light": "选择灯光",
    "entity_picker.title_switch": "选择开关",
    "entity_picker.title_weather": "选择天气",
    "entity_picker.title_climate": "选择温控设备",
    "entity_picker.title_roborock": "选择 Roborock",
    "entity_picker.title_alarm": "选择安防面板",
    "entity_picker.title_cover": "选择窗帘设备",
    "entity_picker.title_scene": "选择场景",
    "entity_picker.title_person": "选择人员",
    "entity_picker.title_timer": "选择定时器",
    "entity_picker.refresh": "刷新",
    "entity_picker.search": "搜索",
    "entity_picker.close": "关闭",
    "entity_picker.search_placeholder": "按名称、实体 ID 或房间搜索",
    "entity_picker.search_hint": "至少输入 {count} 个字符以搜索{items}。",
    "entity_picker.search_ready": "按 Enter 或“搜索”查询{items}。",
    "entity_picker.blank": "空白灯光卡片",
    "entity_picker.blank_sensor": "空白传感器卡片",
    "entity_picker.blank_binary": "空白二进制传感器卡片",
    "entity_picker.blank_light": "空白灯光卡片",
    "entity_picker.blank_button": "空白按钮卡片",
    "entity_picker.blank_weather": "空白天气卡片",
    "entity_picker.blank_weather_3day": "空白天气预报卡片",
    "entity_picker.blank_graph": "空白图表卡片",
    "entity_picker.blank_heating": "空白温控卡片",
    "entity_picker.blank_roborock": "空白 Roborock 卡片",
    "entity_picker.blank_alarm": "空白安防卡片",
    "entity_picker.blank_cover": "空白窗帘卡片",
    "entity_picker.blank_scene": "空白场景卡片",
    "entity_picker.blank_person": "空白人员卡片",
    "entity_picker.blank_timer": "空白定时器卡片",
    "entity_picker.loading": "正在加载灯光…",
    "entity_picker.loading_items": "正在加载{items}…",
    "entity_picker.refreshing": "正在刷新灯光…",
    "entity_picker.refreshing_items": "正在刷新{items}…",
    "entity_picker.pending": "正在等待 Home Assistant…",
    "entity_picker.disconnected": "Home Assistant 未连接。",
    "entity_picker.empty": "未找到灯光实体。",
    "entity_picker.empty_items": "未找到 {items}。",
    "entity_picker.truncated": "列表已达到固件数量上限。",
    "entity_picker.unassigned_room": "未分配房间",
    "entity_picker.added": "已添加灯光卡片：{entity}",
    "entity_picker.added_widget": "已添加{widget}：{entity}",
    "entity_picker.fetch_failed": "获取灯光失败：{error}",
    "entity_picker.fetch_failed_items": "获取{items}失败：{error}",
    "entity_picker.progress": "{loaded} / {target}",
    "entity_picker.progress_total": "{loaded} / {target}，共 {total}",
    "entity_picker.items_light": "灯光",
    "entity_picker.items_sensor": "传感器",
    "entity_picker.items_binary": "二进制传感器",
    "entity_picker.items_switch": "开关",
    "entity_picker.items_weather": "天气实体",
    "entity_picker.items_climate": "温控设备",
    "entity_picker.items_vacuum": "扫地机器人",
    "entity_picker.items_alarm": "安防面板",
    "entity_picker.items_cover": "窗帘设备",
    "entity_picker.items_scene": "场景",
    "entity_picker.items_person": "人员",
    "entity_picker.items_timer": "计时器",
    "entity_picker.widget_light": "灯光卡片",
    "entity_picker.widget_sensor": "传感器卡片",
    "entity_picker.widget_binary": "二进制传感器卡片",
    "entity_picker.widget_button": "按钮卡片",
    "entity_picker.widget_weather": "天气卡片",
    "entity_picker.widget_weather_3day": "天气预报卡片",
    "entity_picker.widget_graph": "图表卡片",
    "entity_picker.widget_heating": "温控卡片",
    "entity_picker.widget_roborock": "Roborock 卡片",
    "entity_picker.widget_alarm": "安防卡片",
    "entity_picker.widget_cover": "窗帘卡片",
    "entity_picker.widget_scene": "场景卡片",
    "entity_picker.widget_person": "人员卡片",
    "entity_picker.widget_timer": "定时器卡片",
    "layout.inspector.heading": "属性",
    "layout.inspector.title": "标题",
    "layout.inspector.entity": "实体",
    "layout.inspector.secondary_entity": "实际实体（传感器）",
    "layout.inspector.secondary_entity_roborock": "地图实体（图像，可选）",
    "layout.inspector.button_mode": "按钮模式",
    "layout.inspector.button_accent_color": "按钮强调色",
    "layout.inspector.button_style": "按钮样式",
    "layout.inspector.slider_entity_domain": "滑块实体类型",
    "layout.inspector.binary_show_title": "显示标题",
    "layout.inspector.binary_color_on": "开启颜色（空 = 自动）",
    "layout.inspector.binary_color_off": "关闭颜色（空 = 自动）",
    "layout.inspector.binary_text_on": "开启文本（空 = 自动）",
    "layout.inspector.binary_text_off": "关闭文本（空 = 自动）",
    "layout.inspector.sensor_value_color": "数值颜色（空 = 自动）",
    "layout.inspector.alarm_code": "PIN 码（空 = 无需 PIN）",
    "layout.inspector.alarm_ask_code": "始终要求输入 PIN（自动：仅 HA 要求时）",
    "layout.inspector.alarm_backend": "服务后端",
    "layout.inspector.alarm_zone_label": "防区标题（空 = 不显示）",
    "layout.inspector.alarm_show_sensors": "在卡片上显示未关闭的传感器",
    "layout.inspector.alarm_show_bypassed": "显示已旁路传感器数量",
    "layout.inspector.alarm_force_arm": "传感器未关闭时询问是否强制布防",
    "layout.inspector.alarm_skip_delay": "跳过退出延时（Alarmo）",
    "layout.inspector.alarm_modes": "卡片上显示的按钮",
    "layout.inspector.alarm_mode_away": "离家布防",
    "layout.inspector.alarm_mode_home": "在家布防",
    "layout.inspector.alarm_mode_night": "夜间布防",
    "layout.inspector.alarm_mode_vacation": "假期布防",
    "layout.inspector.alarm_mode_custom": "自定义旁路",
    "layout.inspector.alarm_mode_disarm": "撤防",
    "layout.inspector.clock_hint": "时钟卡片：显示当前时间，也可选择显示日期。",
    "layout.inspector.clock_show_seconds": "显示秒数",
    "layout.inspector.clock_show_date": "显示日期",
    "layout.tile_look.group": "卡片外观（当前卡片）",
    "layout.tile_look.preset": "预设",
    "layout.tile_look.bg_color": "背景颜色",
    "layout.tile_look.bg_grad_color": "渐变结束颜色",
    "layout.tile_look.bg_grad_dir": "渐变方向",
    "layout.tile_look.border_color": "边框颜色",
    "layout.tile_look.border_width": "边框宽度（像素）",
    "layout.tile_look.radius": "圆角半径（像素）",
    "layout.tile_look.corner_shape": "圆角样式",
    "layout.tile_look.corner_hint": "正方形卡片使用最大圆角时将显示为圆形。",
    "layout.tile_look.opacity": "背景不透明度（%）",
    "layout.tile_look.font_scale": "字体大小",
    "layout.tile_look.shadow": "阴影",
    "layout.tile_look.text_color": "文字颜色（全部）",
    "layout.tile_look.title_color": "标题颜色",
    "layout.tile_look.label_color": "实体标签颜色",
    "layout.tile_look.value_color": "数值/状态颜色",
    "layout.tile_look.icon_color": "图标颜色",
    "layout.tile_look.reset": "重置卡片外观",
    "layout.tile_look.hint": "留空则使用主题设置。颜色格式为 #RRGGBB。",
    "layout.tile_look.copy_source": "从其他卡片复制外观",
    "layout.tile_look.copy_apply": "复制外观",
    "layout.tile_look.copy_apply_page": "应用到本页所有卡片",
    "layout.tile_look.copy_placeholder": "选择卡片…",
    "layout.tile_look.copy_empty": "没有其他可供复制的卡片",
    "layout.tile_look.copy_none": "请先选择源卡片。",
    "layout.tile_look.copy_done": "已从“{source}”复制卡片外观。",
    "layout.tile_look.copy_page_done": "已将卡片外观应用到 {count} 张卡片。",
    "layout.tile_look.copy_hint": "仅复制背景、边框、颜色和字号；实体、标题和尺寸保持不变。",
    "layout.page_look.heading": "页面外观",
    "layout.page_look.group": "页面外观（当前页面）",
    "layout.page_look.preset": "预设",
    "layout.page_look.bg_color": "背景颜色",
    "layout.page_look.bg_grad_color": "渐变结束颜色",
    "layout.page_look.bg_grad_dir": "渐变方向",
    "layout.page_look.wallpaper": "使用面板壁纸",
    "layout.page_look.dim": "壁纸加深（%）",
    "layout.page_look.reset": "重置页面外观",
    "layout.page_look.reset_done": "页面外观已重置。",
    "layout.page_look.page_theme": "当前页面主题",
    "layout.page_look.page_theme_hint": "页面显示时立即使用此主题重新绘制。“全局”会跟随当前主题或昼夜主题。",
    "layout.page_look.theme_none": "- 全局/昼夜主题 -",
    "layout.page_look.hint": "留空则使用面板背景。面板会对壁纸加深处理。",
    "layout.option.page_preset.auto": "面板默认",
    "layout.option.page_preset.midnight": "午夜",
    "layout.option.page_preset.deep_sea": "深海",
    "layout.option.page_preset.forest": "森林",
    "layout.option.page_preset.sunset": "日落",
    "layout.option.page_preset.plum": "梅紫",
    "layout.option.page_preset.wallpaper": "壁纸",
    "layout.option.page_preset.wallpaper_dim": "壁纸（深色）",
    "layout.option.page_grad_dir.none": "无",
    "layout.option.page_grad_dir.hor": "水平",
    "layout.option.page_grad_dir.ver": "垂直",
    "layout.option.tile_grad_dir.none": "无",
    "layout.option.tile_grad_dir.hor": "水平",
    "layout.option.tile_grad_dir.ver": "垂直",
    "layout.option.tile_font_scale.auto": "自动",
    "layout.option.tile_font_scale.s": "小",
    "layout.option.tile_font_scale.m": "中",
    "layout.option.tile_font_scale.l": "大",
    "layout.option.tile_font_scale.xl": "特大",
    "layout.option.tile_preset.auto": "主题默认",
    "layout.option.tile_preset.graphite": "石墨",
    "layout.option.tile_preset.emerald": "翡翠绿",
    "layout.option.tile_preset.amber": "琥珀色",
    "layout.option.tile_preset.violet": "紫色",
    "layout.option.tile_preset.sky": "天蓝",
    "layout.option.tile_preset.glass": "玻璃",
    "layout.option.tile_corner.custom": "自定义（使用半径）",
    "layout.option.tile_corner.square": "方角（0 像素）",
    "layout.option.tile_corner.soft": "小圆角（10 像素）",
    "layout.option.tile_corner.rounded": "圆角（16 像素）",
    "layout.option.tile_corner.pill": "胶囊形（40 像素）",
    "layout.option.tile_corner.circle": "圆形（最大圆角）",
    "layout.inspector.slider_direction": "滑块方向",
    "layout.inspector.slider_accent_color": "滑块强调色",
    "layout.inspector.graph_line_color": "图表线条颜色",
    "layout.inspector.graph_time_window_min": "时间窗口（分钟）",
    "layout.inspector.graph_point_count": "数据点数量（空 = 自动）",
    "layout.inspector.graph_display_mode": "显示方式",
    "layout.inspector.graph_bar_bucket_min": "柱状图间隔（分钟）",
    "layout.option.graph_display_mode.line": "折线（带数据点）",
    "layout.option.graph_display_mode.line_smooth_points": "平滑曲线（带数据点）",
    "layout.option.graph_display_mode.line_smooth": "平滑曲线",
    "layout.option.graph_display_mode.bars": "柱状图",
    "layout.inspector.apply": "应用",
    "layout.option.button_mode.auto": "自动（默认开关）",
    "layout.option.button_style.switch": "开关（默认）",
    "layout.option.button_style.power_toggle": "电源切换",
    "layout.option.button_style.power_status": "电源状态",
    "layout.option.button_style.plug_icon": "插头图标",
    "layout.option.button_style.lamp_icon": "灯图标",
    "layout.option.button_style.highlight": "高亮",
    "layout.option.button_style.status_text": "状态文本",
    "layout.option.button_mode.play_pause": "播放/暂停（media_player）",
    "layout.option.button_mode.stop": "停止（media_player）",
    "layout.option.button_mode.next": "下一曲（media_player）",
    "layout.option.button_mode.previous": "上一曲（media_player）",
    "layout.option.slider_entity_domain.auto": "自动（灯光、媒体播放器、窗帘）",
    "layout.option.slider_entity_domain.light": "灯光",
    "layout.option.slider_entity_domain.media_player": "媒体播放器",
    "layout.option.slider_entity_domain.cover": "窗帘",
    "layout.option.slider_direction.auto": "自动（基于宽度/高度）",
    "layout.option.slider_direction.left_to_right": "从左到右（0% → 100%）",
    "layout.option.slider_direction.right_to_left": "从右到左（100% → 0%）",
    "layout.option.slider_direction.bottom_to_top": "从下到上（0% → 100%）",
    "layout.option.slider_direction.top_to_bottom": "从上到下（100% → 0%）",
    "layout.actions.heading": "操作",
    "layout.actions.reload": "重新加载",
    "layout.actions.save": "保存",
    "layout.actions.export": "导出",
    "layout.actions.import": "导入 JSON",
    "layout.actions.paste_placeholder": "将布局 JSON 粘贴到此处",
    "layout.canvas.title": "布局画布",
    "layout.default_page.title": "客厅",
    "layout.status.loading": "正在加载布局…",
    "layout.status.load_failed": "布局加载失败，将使用默认布局：{error}",
    "layout.status.loaded": "布局已加载",
    "layout.status.entity_fetch_failed": "实体获取失败：{error}",
    "layout.status.saving": "正在保存布局…",
    "layout.status.saved": "布局已保存",
    "layout.status.imported": "布局已导入（尚未保存）",
    "layout.status.at_least_one_page": "至少需要一个页面",
    "layout.status.entity_domain_required": "实体必须属于以下域：{domains}",
    "layout.status.expected_domain": "指定域",
    "layout.status.secondary_sensor_required": "实际实体必须以 sensor. 开头。",
    "layout.status.secondary_image_required": "地图实体必须以 image. 开头。",
    "layout.status.invalid_json": "布局 JSON 无效",
    "layout.status.save_failed": "保存失败：{error}",
    "layout.status.conflict_title": "面板布局已在其他位置更改",
    "layout.status.conflict_confirm": "面板布局已被其他来源更改（其他浏览器标签页、API 或备份恢复）。\n\n确定 = 用当前编辑器中的版本覆盖\n取消 = 保留面板上的版本（重新加载页面可放弃本地修改）。",
    "layout.status.conflict_overridden": "已用当前编辑器中的版本覆盖面板布局。",
    "layout.status.import_failed": "导入失败：{error}",
    "layout.status.file_import_failed": "文件导入失败：{error}",
    "setup.title": "快速设置",
    "setup.step_ha": "HA 已连接",
    "setup.step_tiles": "添加卡片",
    "setup.step_save": "保存布局",
    "setup.subtitle": "为首个仪表板选择几个 Home Assistant 实体。",
    "setup.page_label": "第一页标题",
    "setup.page_placeholder": "客厅",
    "setup.add_light": "+ 灯光",
    "setup.add_heating": "+ 温控",
    "setup.add_weather": "+ 天气",
    "setup.add_button": "+ 开关",
    "setup.add_sensor": "+ 传感器",
    "setup.close": "关闭",
    "setup.skip": "跳过",
    "setup.done": "保存并完成",
    "setup.save": "保存布局",
    "setup.count_none": "尚未添加卡片。",
    "setup.count_one": "当前页面有 1 张卡片。",
    "setup.count_many": "当前页面有 {count} 张卡片。",
    "setup.added": "已添加：{title}",
    "setup.saving": "正在保存布局…",
    "setup.saved": "布局已保存，面板现在可以使用此仪表板。",
    "setup.save_failed": "保存失败：{error}",
    "provision.wifi.title": "Wi-Fi 配网",
    "provision.wifi.subtitle": "将面板连接到 Wi-Fi。",
    "provision.wifi.ssid": "SSID",
    "provision.wifi.country_code": "国家/地区代码",
    "provision.wifi.password": "密码",
    "provision.wifi.password_placeholder": "Wi-Fi 密码",
    "provision.wifi.show_password": "显示密码",
    "provision.ha.title": "Home Assistant 配置",
    "provision.ha.subtitle": "将面板连接到 Home Assistant。",
    "provision.ha.ws_url": "WebSocket URL（ws:// 或 wss://）",
    "provision.ha.token": "长期访问令牌",
    "provision.ha.show_token": "显示令牌",
    "settings.wifi.heading": "Wi-Fi",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "国家/地区代码",
    "settings.wifi.bssid": "BSSID 锁定（可选）",
    "settings.wifi.password": "密码",
    "settings.wifi.password_placeholder": "留空则保留已保存的密码",
    "settings.wifi.static_enabled": "使用静态 IP（而不是 DHCP）",
    "settings.wifi.static_ip": "IP 地址",
    "settings.wifi.static_netmask": "网络掩码",
    "settings.wifi.static_gateway": "网关",
    "settings.wifi.static_dns": "DNS（可选）",
    "settings.wifi.invalid_static_ip": "启用静态 IP 时，IP 地址、网络掩码和网关必须是有效的 IPv4 地址",
    "settings.ha.heading": "Home Assistant",
    "settings.ha.ws_url": "WebSocket URL（ws:// 或 wss://）",
    "settings.ha.token": "长期访问令牌",
    "settings.ha.token_placeholder": "留空则保留已保存的令牌",
    "settings.ha.rest_fallback": "启用 HA REST 回退（默认关闭，优先仅使用 WS）",
    "settings.time.heading": "时间",
    "settings.time.ntp_server": "NTP 服务器",
    "settings.time.timezone": "时区",
    "settings.time.search": "搜索时区…",
    "settings.time.show_zones": "显示时区",
    "settings.time.search_hint": "输入城市或区域名称的一部分，然后选择时区。",
    "settings.time.no_matches": "没有匹配的时区",
    "settings.time.local_time": "当前本地时间",
    "settings.time.clock_unavailable": "设备时间不可用或尚未同步",
    "settings.time.legacy_active": "现有旧格式时区",
    "settings.time.legacy_hint": "已保留现有时区。选择一个地点以替换它。",
    "settings.time.list_unavailable": "时区列表不可用，请重新加载设置。",
    "settings.ui.heading": "界面",
    "settings.theme.heading": "主题",
    "settings.ui.language": "语言",
    "settings.ui.reload_languages": "重新加载语言列表",
    "settings.ui.download_json": "下载 JSON",
    "settings.ui.upload_code": "语言代码",
    "settings.ui.upload_file": "翻译 JSON 文件",
    "settings.ui.upload_button": "上传/添加语言",
    "settings.ap.heading": "配网热点",
    "settings.ap.hint": "如果配网热点已启用，请连接该热点并打开 <code>http://192.168.4.1</code>。",
    "settings.ota.heading": "固件更新",
    "settings.ota.url": "OTA URL",
    "settings.ota.url_placeholder": "https://github.com/cptkirki/BETTA-HA-PANEL/releases/latest/download/...",
    "settings.ota.flash_url": "刷写 URL",
    "settings.ota.refresh": "刷新状态",
    "settings.ota.file": "OTA .bin 文件",
    "settings.ota.upload": "上传并刷写",
    "settings.ota.idle": "可开始更新 OTA 应用固件。当前分区：{running}，目标分区：{next}，分区大小：{size}。",
    "settings.ota.running": "OTA 更新中：{progress}%（{written} / {total}）",
    "settings.ota.downloading": "正在从 URL 下载：{progress}%（{written} / {total}）",
    "settings.ota.uploading": "面板已接收：{progress}%（{written} / {total}）",
    "settings.ota.success": "OTA 固件已写入，正在重启。",
    "settings.ota.error": "OTA 失败：{error}",
    "settings.ota.rebooting": "设备正在重启。恢复在线后请重新打开面板页面。",
    "settings.ota.no_file": "请先选择 OTA .bin 文件。",
    "settings.ota.no_url": "请先粘贴 OTA URL。",
    "settings.ota.starting_url": "正在从 URL 启动 OTA…",
    "settings.ota.upload_progress": "正在上传到面板：{progress}%（{written} / {total}）",
    "settings.ota.request_failed": "OTA 请求失败：{error}",
    "settings.ota.target_slot": "目标分区：{partition}",
    "settings.system.heading": "系统",
    "settings.system.auto_restart_enabled": "定期自动重启面板",
    "settings.system.auto_restart_hours": "重启间隔（小时）",
    "settings.system.hint": "启用后，面板将在设定的小时数（1–168）后自动重启。",
    "settings.backup.heading": "备份/恢复",
    "settings.backup.hint": "备份文件包含布局、公开设置和所有自定义主题；不包含 Wi-Fi 凭据、HA 令牌、MQTT 密码和壁纸图像。",
    "settings.backup.download": "下载备份",
    "settings.backup.file": "用于恢复的备份文件",
    "settings.backup.restore": "恢复备份",
    "settings.backup.choose_file": "请先选择备份 JSON 文件。",
    "settings.backup.downloading": "正在下载备份…",
    "settings.backup.downloaded": "备份已下载。",
    "settings.backup.download_failed": "备份下载失败：{error}",
    "settings.backup.restoring": "正在恢复备份…",
    "settings.backup.restore_failed": "恢复失败：{error}",
    "settings.backup.restored": "备份已恢复：布局 {layout}，设置 {settings}，主题 {themes}。",
    "settings.backup.restart_hint": "连接设置已更改，请重启面板使其生效。",
    "settings.logs.heading": "日志",
    "settings.logs.refresh": "刷新",
    "settings.logs.pause": "暂停",
    "settings.logs.resume": "继续",
    "settings.logs.clear": "清除",
    "settings.logs.auto_scroll": "自动滚动",
    "settings.logs.download": "下载日志",
    "settings.logs.loading": "正在加载日志…",
    "settings.logs.empty": "暂无日志。错误、警告和崩溃标记将显示在此处。",
    "settings.logs.updated": "更新于 {time}",
    "settings.logs.fetch_failed": "无法读取日志：{error}",
    "settings.logs.cleared": "日志文件已清除。",
    "settings.logs.clear_failed": "无法清除日志：{error}",
    "settings.diagnostics.heading": "诊断",
    "settings.diagnostics.refresh": "刷新",
    "settings.diagnostics.auto_refresh": "自动刷新（10 秒）",
    "settings.diagnostics.loading": "正在读取诊断信息…",
    "settings.diagnostics.updated": "更新于 {time}",
    "settings.diagnostics.empty": "暂无数据。",
    "settings.diagnostics.fetch_failed": "无法读取诊断信息：{error}",
    "settings.diagnostics.yes": "是",
    "settings.diagnostics.no": "否",
    "settings.diagnostics.uptime": "运行时间",
    "settings.diagnostics.reset_reason": "重启原因",
    "settings.diagnostics.boot_count": "启动次数",
    "settings.diagnostics.cpu_temp": "CPU 温度",
    "settings.diagnostics.version": "固件版本",
    "settings.diagnostics.project": "构建项目",
    "settings.diagnostics.idf": "ESP-IDF",
    "settings.diagnostics.build_date": "构建时间",
    "settings.diagnostics.panel": "芯片",
    "settings.diagnostics.screen": "屏幕",
    "settings.diagnostics.heap_free": "可用堆内存",
    "settings.diagnostics.heap_min": "最低可用堆内存",
    "settings.diagnostics.heap_largest": "最大空闲内存块",
    "settings.diagnostics.heap_fragmentation": "内存碎片率",
    "settings.diagnostics.heap_dma": "内部 DMA 可用/最大",
    "settings.diagnostics.heap_blocks": "堆内存块（已用/空闲）",
    "settings.diagnostics.iram_free": "可用 IRAM",
    "settings.diagnostics.psram_free": "可用 PSRAM",
    "settings.diagnostics.connected": "已连接",
    "settings.diagnostics.ssid": "SSID",
    "settings.diagnostics.ip": "IP 地址",
    "settings.diagnostics.rssi": "RSSI",
    "settings.diagnostics.channel": "信道",
    "settings.diagnostics.wifi_drops": "Wi-Fi 断开次数",
    "settings.diagnostics.wifi_reconnects": "重连尝试次数",
    "settings.diagnostics.wifi_recoveries": "驱动恢复次数",
    "settings.diagnostics.wifi_last_drop": "最近一次断开",
    "settings.diagnostics.wifi_session": "上一次会话",
    "settings.diagnostics.sync_done": "初始同步完成",
    "settings.diagnostics.base_url": "HA REST URL",
    "settings.diagnostics.cert_cn": "TLS 通用名称",
    "settings.diagnostics.ws_connects": "WS 连接次数",
    "settings.diagnostics.ws_disconnects": "WS 断开次数",
    "settings.diagnostics.ws_recoveries": "HA 恢复次数",
    "settings.diagnostics.ws_last_session": "上次 WS 会话",
    "settings.diagnostics.missing_entities": "缺失实体",
    "settings.diagnostics.mqtt_enabled": "MQTT 已启用",
    "settings.diagnostics.mqtt_tls": "MQTT TLS",
    "settings.diagnostics.broker": "代理服务器",
    "settings.diagnostics.running_partition": "当前运行分区",
    "settings.diagnostics.next_partition": "下一个更新分区",
    "settings.diagnostics.image_state": "固件镜像状态",
    "settings.diagnostics.rollback_enabled": "回滚已启用",
    "settings.diagnostics.boot_confirmed": "固件镜像已确认",
    "settings.diagnostics.card_status": "状态",
    "settings.diagnostics.card_firmware": "固件",
    "settings.diagnostics.card_memory": "内存",
    "settings.diagnostics.card_wifi": "Wi-Fi",
    "settings.diagnostics.card_ha": "Home Assistant",
    "settings.diagnostics.card_mqtt": "MQTT",
    "settings.diagnostics.card_ota": "OTA / 回滚",
    "settings.diagnostics.ota_state.new": "新镜像（尚未启动）",
    "settings.diagnostics.ota_state.pending_verify": "等待验证",
    "settings.diagnostics.ota_state.valid": "有效",
    "settings.diagnostics.ota_state.invalid": "无效",
    "settings.diagnostics.ota_state.aborted": "已中止",
    "settings.diagnostics.ota_state.undefined": "未跟踪（引导加载程序不支持回滚）",
    "settings.diagnostics.bootloader_note": "固件支持回滚，但面板的引导加载程序尚未跟踪镜像状态。请通过 USB 刷写一次引导加载程序（idf.py flash），以便更新失败后自动回滚。",
    "settings.actions.heading": "设置操作",
    "settings.actions.reload": "重新加载设置",
    "settings.actions.save": "保存并重启",
    "settings.actions.hint": "保存后设备将重启，并可能从配网热点切换到家庭 Wi-Fi。",
    "settings.info.configured": "已配置",
    "settings.info.connected": "已连接",
    "settings.info.password_stored": "密码已存储",
    "settings.info.country": "国家/地区",
    "settings.info.rssi": "RSSI（连接的 AP）",
    "settings.info.connected_bssid": "已连接的 BSSID",
    "settings.info.channel": "信道",
    "settings.info.token_stored": "令牌已存储",
    "settings.info.rest_fallback": "REST 回退",
    "common.yes": "是",
    "common.no": "否",
    "common.scan": "扫描",
    "common.scan_wifi": "扫描 Wi-Fi",
    "common.save_reboot": "保存并重启",
    "status.idle": "空闲",
    "status.loading_settings": "正在加载设置…",
    "status.settings_loaded": "设置已加载",
    "status.settings_load_failed": "设置加载失败：{error}",
    "status.settings_save_failed": "设置保存失败：{error}",
    "ha_diagnostics.missing_title": "此布局中的部分实体在 Home Assistant 中不存在",
    "ha_diagnostics.missing_title_more": "此布局中的部分实体在 Home Assistant 中不存在（共 {total} 个，显示 {listed} 个）",
    "ha_diagnostics.missing_hint": "打开受影响的组件，选择有效实体并保存布局。",
    "ha_diagnostics.dismiss": "忽略",
    "status.saving_settings": "正在保存设置…",
    "status.settings_saved_reboot": "设置已保存。设备将在约 2 秒后重启，请重新连接并打开面板 URL。",
    "status.wifi_scan_running": "正在扫描 Wi-Fi…",
    "status.wifi_scan_complete": "Wi-Fi 扫描完成（找到 {count} 个网络）",
    "status.wifi_scan_failed": "Wi-Fi 扫描失败：{error}",
    "status.wifi_scan_timeout": "Wi-Fi 扫描请求超时",
    "common.unknown_error": "未知错误",
    "wifi.scan_unavailable": "此硬件在配网热点模式下无法扫描 Wi-Fi，请手动输入 SSID。",
    "wifi.scan_click": "点击“扫描 Wi-Fi”列出附近的网络。",
    "wifi.scan_click_short": "点击“扫描”列出附近的网络。",
    "wifi.scan_no_networks": "未找到网络。请靠近路由器后重新扫描。",
    "wifi.scan_found": "找到 {count} 个网络。请选择一个以填入 SSID。",
    "wifi.scan.connected_tag": "已连接",
    "wifi.scan.option_unavailable": "扫描不可用",
    "wifi.scan.option_scanning": "正在扫描…",
    "wifi.scan.option_not_run": "尚未扫描",
    "wifi.scan.option_no_networks": "未找到网络",
    "wifi.scan.option_select": "选择网络（找到 {count} 个）",
    "settings.time.info": "重启后生效。连接 Wi-Fi 后将开始同步时间。",
    "settings.display.heading": "显示与屏保",
    "settings.display.info": "亮度和颜色立即生效；上传的壁纸保存在设备中。",
    "settings.display.brightness": "亮度（%）",
    "settings.display.screensaver_enabled": "屏保",
    "settings.display.screensaver_timeout": "屏保等待时间（秒）",
    "settings.display.saver_brightness": "屏保亮度（%）",
    "settings.display.screen_off_enabled": "关闭屏幕",
    "settings.display.screen_off_timeout": "屏幕关闭等待时间（秒）",
    "settings.display.clock_format": "时钟格式",
    "settings.display.clock_format_h24": "24 小时制（如 23:00）",
    "settings.display.clock_format_h12": "12 小时制（如 11:00 PM）",
    "settings.display.clock_format_hint": "12 小时制会在屏保时钟和顶栏时钟旁显示 AM/PM。",
    "settings.display.clock_style": "时钟样式",
    "settings.display.clock_style_classic": "经典",
    "settings.display.clock_style_flip": "翻页时钟",
    "settings.display.clock_style_hint": "翻页时钟会在数字变化时播放动画，但只显示 HH:MM，不显示秒数。",
    "settings.display.show_seconds": "显示秒数",
    "settings.display.show_date": "显示日期",
    "settings.display.clock_color": "时钟颜色",
    "settings.display.date_color": "日期颜色",
    "settings.display.night_mode_enabled": "夜间计划（调暗或关闭屏幕）",
    "settings.display.night_start": "夜间开始",
    "settings.display.night_end": "夜间结束",
    "settings.display.night_brightness": "夜间亮度（%，0 = 屏幕关闭）",
    "settings.display.night_wake": "夜间时段触摸唤醒（秒）",
    "settings.display.night_hint": "夜间时段内，面板会强制使用夜间亮度；设为 0% 时关闭屏幕。触摸屏幕可临时唤醒指定秒数。此功能需要时钟已同步。",
    "settings.display.night_currently_active": "当前处于夜间模式。",
    "settings.display.theme_auto_enabled": "根据时间自动切换主题",
    "settings.display.theme_day": "日间主题",
    "settings.display.theme_night": "夜间主题",
    "settings.display.theme_auto_none": "- 全局主题 -",
    "settings.display.theme_auto_hint": "夜间时段外使用日间主题，夜间时段内使用夜间主题。时段取自下方的开始和结束时间，即使未启用夜间亮度计划也会生效。布局中设置了 page_theme 的页面仍会覆盖这两个主题。此功能需要时钟已同步。",
    "settings.display.wallpaper": "壁纸",
    "settings.display.wallpaper_hint": "浏览器会缩放图像并转换为 RGB565，然后发送到面板。",
    "settings.display.upload_wallpaper": "上传壁纸",
    "settings.display.remove_wallpaper": "删除壁纸",
    "settings.display.apply": "立即应用（无需重启）",
    "settings.display.press_fx": "按压反馈（按住卡片时的视觉效果）",
    "settings.display.press_fx_dim": "变暗（%）",
    "settings.display.press_fx_scale": "缩小（占原尺寸的百分比）",
    "settings.display.press_fx_none": "无",
    "settings.display.press_fx_dim_mode": "变暗",
    "settings.display.press_fx_scale_mode": "缩小",
    "settings.display.press_fx_both": "变暗并缩小",
    "settings.display.press_fx_hint": "适用于点击整张卡片即可操作的类型（开关、按钮、温控）。按住下方示例可预览效果。",
    "settings.display.press_fx_preview": "卡片",
    "settings.display.value_anim": "数值动画（卡片数值变化时）",
    "settings.display.value_anim_ms": "持续时间（毫秒）",
    "settings.display.value_anim_none": "无",
    "settings.display.value_anim_fade": "淡入",
    "settings.display.value_anim_slide": "滑入",
    "settings.display.value_anim_count": "数字滚动",
    "settings.display.value_anim_preview": "预览",
    "settings.display.value_anim_hint": "为自动变化的数值（如传感器、天气和功率）播放动画。数字滚动会保持单位位置不变，并支持“22.5 °C”等格式。设为 0 毫秒可关闭效果。",
    "settings.display.topbar": "顶栏",
    "settings.display.topbar_show_clock": "时钟",
    "settings.display.topbar_show_date": "日期",
    "settings.display.topbar_show_gear": "设置图标",
    "settings.display.topbar_show_status": "Wi-Fi / HA 图标",
    "settings.display.topbar_icon_text": "用文字替代图标",
    "settings.display.topbar_custom_colors": "自定义颜色",
    "settings.display.topbar_bg_color": "顶栏背景",
    "settings.display.topbar_clock_color": "时钟颜色",
    "settings.display.topbar_date_color": "日期颜色",
    "settings.display.topbar_gear_color": "设置图标颜色",
    "settings.display.topbar_ha_color": "Home Assistant 颜色",
    "settings.display.topbar_wifi_color": "Wi-Fi 颜色",
    "settings.display.topbar_hint": "时钟会在剩余空间中居中显示，并自动缩小字号以避免元素重叠。“用文字替代图标”会用文字替换 Wi-Fi、Home Assistant 和设置图标。",
    "settings.display.topbar_color_hint": "关闭“自定义颜色”后，顶栏会跟随当前主题。",
    "settings.display.navbar": "底栏（页面标签）",
    "settings.display.nav_custom_colors": "自定义颜色",
    "settings.display.nav_bar_bg_color": "底栏背景",
    "settings.display.nav_bar_border_color": "底栏上边框",
    "settings.display.nav_button_bg_color": "页面标签背景",
    "settings.display.nav_button_border_color": "页面标签边框",
    "settings.display.nav_tab_idle_color": "页面标题颜色",
    "settings.display.nav_tab_active_color": "当前页面标题颜色",
    "settings.display.nav_home_idle_color": "主页图标颜色",
    "settings.display.nav_home_active_color": "当前主页图标颜色",
    "settings.display.nav_hint": "底栏显示主页按钮和各页面标签。页面名称过长时，标签标题会以“…”截断。",
    "settings.display.nav_color_hint": "关闭“自定义颜色”后，底栏会跟随当前主题。",
    "settings.display.applied": "已应用显示设置。",
    "settings.display.no_wallpaper_file": "请先选择图像文件。",
    "settings.display.converting": "正在转换图像…",
    "settings.display.convert_failed": "图像转换失败。",
    "settings.display.uploading": "正在上传壁纸…",
    "settings.display.wallpaper_uploaded": "壁纸已上传。",
    "settings.display.removing": "正在删除壁纸…",
    "settings.display.wallpaper_removed": "壁纸已移除。",
    "settings.sd.heading": "microSD 卡",
    "settings.sd.enabled": "启用 microSD 卡（TF 插槽）",
    "settings.sd.refresh": "刷新",
    "settings.sd.export_logs": "导出日志到存储卡",
    "settings.sd.format": "格式化存储卡",
    "settings.sd.format_confirm": "要格式化 microSD 卡吗？卡内所有文件都将被删除。",
    "settings.sd.up": "上一级",
    "settings.sd.root": "存储卡根目录",
    "settings.sd.logs": "日志文件夹",
    "settings.sd.photos": "图片文件夹",
    "settings.sd.unsupported": "此设备没有 microSD 卡槽。",
    "settings.sd.disabled": "microSD 支持已禁用。勾选此项可在启动时挂载存储卡。",
    "settings.sd.no_card": "卡槽中未检测到存储卡。插入后点击“刷新”；面板运行时也会自动检测。",
    "settings.sd.no_filesystem": "检测到存储卡 {name}，但没有面板可读取的 FAT 文件系统。点击“格式化”进行初始化，此操作会清除存储卡。",
    "settings.sd.exfat": "存储卡 {name} 使用 exFAT 格式，面板无法读取。点击“格式化”可转换为 FAT32，此操作会清除存储卡。",
    "settings.sd.ntfs": "存储卡 {name} 使用 NTFS 格式，面板无法读取。点击“格式化”可转换为 FAT32，此操作会清除存储卡。",
    "settings.sd.formatting": "正在格式化…",
    "settings.sd.mounted": "存储卡：{name}，总容量 {total} MB，可用 {free} MB",
    "settings.sd.empty": "此文件夹为空。",
    "settings.sd.loading": "正在读取存储卡…",
    "settings.sd.delete": "删除",
    "settings.sd.delete_confirm": "要从存储卡中删除“{name}”吗？",
    "settings.sd.deleted": "文件已删除。",
    "settings.sd.delete_failed": "无法删除此项目。",
    "settings.sd.use_wallpaper": "用作壁纸",
    "settings.sd.wallpaper_failed": "无法将此图像转换为壁纸。",
    "settings.sd.wallpaper_ok": "已将存储卡中的图像设为壁纸。",
    "settings.sd.wallpaper_sd": "屏保图片：存储在此 microSD 卡中。面板只保留一个副本，取出存储卡时会将其移至内部闪存。",
    "settings.sd.wallpaper_flash": "屏保图片：存储在内部闪存中。挂载存储卡后会立即移至卡中。",
    "settings.sd.wallpaper_none": "屏保图片：尚未设置，请在“显示”设置中上传。",
    "settings.sd.exporting": "正在导出日志…",
    "settings.sd.exported": "日志已导出到 {path}",
    "settings.sd.export_failed": "日志导出失败。",
    "settings.sd.formatted": "存储卡已格式化。",
    "settings.sd.format_failed": "格式化失败。",
    "settings.sd.type_dir": "文件夹",
    "settings.sd.status_enabled": "microSD 支持已启用。",
    "settings.sd.status_disabled": "microSD 支持已禁用。",
    "settings.sd.apply_failed": "无法应用 microSD 设置。",
    "settings.pages.heading": "页面与切换效果",
    "settings.pages.transition": "页面切换效果",
    "settings.pages.transition_ms": "切换时长（毫秒）",
    "settings.pages.transition_hint": "面板切换页面时播放的动画。设为 0 毫秒可禁用所选效果。",
    "settings.pages.option_none": "无（即时）",
    "settings.pages.option_fade": "淡入淡出",
    "settings.pages.option_slide": "滑动（左/右）",
    "settings.pages.option_slide_up": "滑动（上/下）",
    "settings.pages.option_fade_slide": "淡入淡出并滑动",
    "settings.pages.target": "在面板上显示页面",
    "settings.pages.reload": "重新加载页面列表",
    "settings.pages.show": "立即显示",
    "settings.pages.activated": "面板当前显示页面“{page}”。",
    "settings.pages.current": "当前显示页面：{page}",
    "settings.pages.apply": "立即应用（无需重启）",
    "settings.pages.applied": "页面切换设置已应用。",
    "settings.mqtt.heading": "MQTT / Home Assistant",
    "settings.mqtt.enabled": "启用 MQTT（在 Home Assistant 中自动发现为设备）",
    "settings.mqtt.use_tls": "加密连接（TLS，mqtts/端口 8883）",
    "settings.mqtt.tls_hint": "TLS 会使用 ESP 信任证书包验证 MQTT 代理服务器证书。如果端口仍为 1883，启用后会自动切换到 8883。",
    "settings.mqtt.reapply_hint": "点击“应用 MQTT”将更改推送到面板。",
    "settings.mqtt.host": "代理服务器地址（空 = 从 HA URL 获取）",
    "settings.mqtt.port": "代理服务器端口",
    "settings.mqtt.username": "用户名",
    "settings.mqtt.password": "密码",
    "settings.mqtt.discovery_prefix": "自动发现前缀",
    "settings.mqtt.info": "通过 MQTT 发现，面板会作为设备出现在 Home Assistant 中。更改无需重启即可生效。",
    "settings.mqtt.apply": "应用 MQTT（无需重启）",
    "settings.mqtt.applied": "MQTT 设置已应用。",
    "settings.ui.info": "预览会立即切换；保存的语言将在重启后应用。",
    "settings.ap.active": "配网热点已启用：{ssid}\\n连接此热点后，请打开 http://192.168.4.1。",
    "settings.ap.inactive": "配网热点未启用。\\n请使用家庭 Wi-Fi 网络中的面板 IP 地址。",
    "settings.translation.info": "上传 JSON 文件可添加或更新语言。",
    "settings.translation.upload_ok": "语言“{lang}”已上传。",
    "settings.translation.upload_fail": "上传失败：{error}",
    "settings.translation.no_file": "请先选择 JSON 文件。",
    "settings.translation.invalid_json": "JSON 格式无效",
    "settings.translation.object_required": "JSON 顶层必须是对象",
    "settings.translation.invalid_code": "语言代码只能包含 [a-z0-9_-]，长度须为 2–15 个字符。",
    "settings.language.invalid_country": "Wi-Fi 国家/地区代码必须是 2 位 ISO 代码（例如 US、DE）",
    "settings.language.invalid_bssid": "BSSID 必须留空或使用 AA:BB:CC:DD:EE:FF 格式",
    "settings.language.invalid_ha_url": "HA URL 必须以 ws:// 或 wss:// 开头",
    "provision.wifi.required_ssid": "必须填写 SSID。",
    "provision.wifi.required_country": "国家/地区代码必须为 2 位字母（例如 US、DE）。",
    "provision.ha.required_url": "必须填写 WebSocket URL。",
    "provision.ha.invalid_url": "HA URL 必须以 ws:// 或 wss:// 开头。",
    "provision.ha.required_token": "必须填写长期访问令牌。",
    "provision.saving_reboot": "正在保存设置并重启…",
    "provision.saved_reboot": "设置已保存，设备将在约 2 秒后重启。",
    "provision.save_failed": "保存失败：{error}",
    "provision.wifi.hint": "保存后面板会重启，重启后将显示 Home Assistant 配置。",
    "provision.ha.hint": "保存后面板会重启，重启后将解锁编辑器。",
    "settings.language.option_de": "Deutsch",
    "settings.language.option_en": "English",
    "settings.language.option_es": "Espanol",
    "settings.language.option_fr": "Francais",
    "settings.language.option_pl": "Polski",
    "settings.language.option_zh-cn": "简体中文",
    "settings.language.option_zh-tw": "繁體中文"
  },
  "zh-tw": {
    "tabs.layout": "版面",
    "tabs.settings": "設定",
    "sidebar.title": "BETTA 編輯器",
    "sidebar.subtitle": "版面配置以 JSON 為準",
    "layout.pages.heading": "頁面",
    "layout.pages.add": "+ 頁面",
    "layout.pages.add_energy": "+ 能源頁面",
    "layout.pages.add_music": "+ 音樂頁面",
    "layout.pages.delete": "刪除",
    "layout.pages.confirm_delete": "刪除頁面「{name}」？該頁面中的所有元件也會被刪除。",
    "layout.pages.title_label": "頁面標題",
    "layout.pages.title_placeholder": "面板上顯示的頁面名稱",
    "layout.pages.apply_title": "套用頁面標題",
    "layout.pages.new_title": "頁面 {number}",
    "layout.pages.energy_title": "能源",
    "layout.pages.music_title": "音樂",
    "layout.energy.heading": "能源頁面",
    "layout.energy.hint": "選擇同步 Home Assistant 能源資料，或手動指定即時感測器。",
    "layout.energy.source": "資料來源",
    "layout.energy.source_ha": "Home Assistant 能源",
    "layout.energy.source_manual": "手動即時感測器",
    "layout.energy.source_hint_ha": "使用 Home Assistant 中已設定的能源儀表板。",
    "layout.energy.source_hint_manual": "進階選項：使用 Home Assistant 中指定的 W/kW 即時感測器。",
    "layout.energy.home_power": "家庭用電功率",
    "layout.energy.solar_power": "太陽能功率",
    "layout.energy.grid_power": "電網功率（含正負號）",
    "layout.energy.grid_import": "電網取電功率",
    "layout.energy.grid_export": "電網饋電功率",
    "layout.energy.battery_power": "電池功率（含正負號）",
    "layout.energy.battery_charge": "電池充電功率",
    "layout.energy.battery_discharge": "電池放電功率",
    "layout.energy.battery_soc": "電池荷電狀態",
    "layout.energy.apply": "套用能源設定",
    "layout.energy.no_widgets": "能源頁面使用專用儀表板，不支援新增元件。",
    "layout.energy.preview_title": "能源流向",
    "layout.energy.sensor_count_one": "{count} 個感測器",
    "layout.energy.sensor_count_many": "{count} 個感測器",
    "layout.energy.no_sensor": "未設定感測器",
    "layout.energy.preview_source_ha": "HA 能源資料",
    "layout.energy.preview_source_manual": "即時感測器",
    "layout.energy.preview_auto": "從 HA 自動取得",
    "layout.energy.low_carbon": "低碳",
    "layout.energy.grid": "電網",
    "layout.energy.solar": "太陽能",
    "layout.energy.gas": "天然氣",
    "layout.energy.home": "家庭用電",
    "layout.energy.battery": "儲能",
    "layout.energy.water": "用水",
    "layout.music.heading": "Music Assistant",
    "layout.music.hint": "「正在播放」頁面可顯示專輯封面、播放控制、播放進度和音量。播放器清單留空時，將從 Home Assistant 自動探索媒體播放器。",
    "layout.music.player_entity": "主要播放器",
    "layout.music.players": "播放器清單（以逗號分隔）",
    "layout.music.apply": "套用音樂設定",
    "layout.music.no_widgets": "音樂頁面使用專用的「正在播放」檢視，不支援新增元件。",
    "layout.music.preview_title": "正在播放",
    "layout.music.preview_subtitle": "專輯封面、播放控制、播放進度和音量",
    "layout.status.energy_page_only": "能源頁面不支援新增元件。",
    "layout.status.music_page_only": "音樂頁面不支援新增元件。",
    "layout.widgets.heading": "元件",
    "layout.widgets.add_sensor": "+ 感測器",
    "layout.widgets.add_binary_sensor": "+ 二元感測器",
    "layout.widgets.add_button": "+ 按鈕",
    "layout.widgets.add_slider": "+ 滑桿",
    "layout.widgets.add_graph": "+ 圖表",
    "layout.widgets.add_empty_tile": "+ 空白卡片",
    "layout.widgets.add_light_tile": "+ 燈光卡片",
    "layout.widgets.add_heating_tile": "+ 溫控卡片",
    "layout.widgets.add_weather_tile": "+ 天氣",
    "layout.widgets.add_weather_3day": "+ 天氣預報",
    "layout.widgets.add_todo": "+ 待辦清單",
    "layout.widgets.add_media_player": "+ 媒體播放器",
    "layout.widgets.add_roborock": "+ Roborock",
    "layout.widgets.add_alarm_tile": "+ 警報控制面板",
    "layout.widgets.add_clock": "+ 時鐘",
    "layout.widgets.quick_setup": "快速設定",
    "layout.widgets.delete": "刪除元件",
    "layout.widgets.confirm_delete": "刪除元件「{name}」？",
    "entity_picker.title": "選擇燈光",
    "entity_picker.title_sensor": "選擇感測器",
    "entity_picker.title_binary": "選擇二元感測器",
    "entity_picker.title_light": "選擇燈光",
    "entity_picker.title_switch": "選擇開關",
    "entity_picker.title_weather": "選擇天氣",
    "entity_picker.title_climate": "選擇溫控裝置",
    "entity_picker.title_roborock": "選擇 Roborock",
    "entity_picker.title_alarm": "選擇警報控制面板",
    "entity_picker.title_cover": "選擇窗簾裝置",
    "entity_picker.title_scene": "選擇場景",
    "entity_picker.title_person": "選擇人員",
    "entity_picker.title_timer": "選擇定時器",
    "entity_picker.refresh": "重新整理",
    "entity_picker.search": "搜尋",
    "entity_picker.close": "關閉",
    "entity_picker.search_placeholder": "依名稱、實體 ID 或房間搜尋",
    "entity_picker.search_hint": "至少輸入 {count} 個字元以搜尋{items}。",
    "entity_picker.search_ready": "按 Enter 或「搜尋」查詢{items}。",
    "entity_picker.blank": "空白燈光卡片",
    "entity_picker.blank_sensor": "空白感測器卡片",
    "entity_picker.blank_binary": "空白二元感測器卡片",
    "entity_picker.blank_light": "空白燈光卡片",
    "entity_picker.blank_button": "空白按鈕卡片",
    "entity_picker.blank_weather": "空白天氣卡片",
    "entity_picker.blank_weather_3day": "空白天氣預報卡片",
    "entity_picker.blank_graph": "空白圖表卡片",
    "entity_picker.blank_heating": "空白溫控卡片",
    "entity_picker.blank_roborock": "空白 Roborock 卡片",
    "entity_picker.blank_alarm": "空白警報卡片",
    "entity_picker.blank_cover": "空白窗簾卡片",
    "entity_picker.blank_scene": "空白場景卡片",
    "entity_picker.blank_person": "空白人員卡片",
    "entity_picker.blank_timer": "空白計時器卡片",
    "entity_picker.loading": "正在載入燈光…",
    "entity_picker.loading_items": "正在載入{items}…",
    "entity_picker.refreshing": "正在重新整理燈光…",
    "entity_picker.refreshing_items": "正在重新整理{items}…",
    "entity_picker.pending": "正在等待 Home Assistant…",
    "entity_picker.disconnected": "Home Assistant 尚未連線。",
    "entity_picker.empty": "找不到燈光實體。",
    "entity_picker.empty_items": "找不到{items}。",
    "entity_picker.truncated": "清單已達韌體數量上限。",
    "entity_picker.unassigned_room": "未指定房間",
    "entity_picker.added": "已新增燈光卡片：{entity}",
    "entity_picker.added_widget": "已新增{widget}：{entity}",
    "entity_picker.fetch_failed": "取得燈光失敗：{error}",
    "entity_picker.fetch_failed_items": "取得{items}失敗：{error}",
    "entity_picker.progress": "{loaded} / {target}",
    "entity_picker.progress_total": "{loaded} / {target}，共 {total}",
    "entity_picker.items_light": "燈光",
    "entity_picker.items_sensor": "感測器",
    "entity_picker.items_binary": "二元感測器",
    "entity_picker.items_switch": "開關",
    "entity_picker.items_weather": "天氣實體",
    "entity_picker.items_climate": "溫控裝置",
    "entity_picker.items_vacuum": "掃地機器人",
    "entity_picker.items_alarm": "警報控制面板",
    "entity_picker.items_cover": "窗簾裝置",
    "entity_picker.items_scene": "場景",
    "entity_picker.items_person": "人員",
    "entity_picker.items_timer": "計時器",
    "entity_picker.widget_light": "燈光卡片",
    "entity_picker.widget_sensor": "感測器卡片",
    "entity_picker.widget_binary": "二元感測器卡片",
    "entity_picker.widget_button": "按鈕卡片",
    "entity_picker.widget_weather": "天氣卡片",
    "entity_picker.widget_weather_3day": "天氣預報卡片",
    "entity_picker.widget_graph": "圖表卡片",
    "entity_picker.widget_heating": "溫控卡片",
    "entity_picker.widget_roborock": "Roborock 卡片",
    "entity_picker.widget_alarm": "警報卡片",
    "entity_picker.widget_cover": "窗簾卡片",
    "entity_picker.widget_scene": "場景卡片",
    "entity_picker.widget_person": "人員卡片",
    "entity_picker.widget_timer": "計時器卡片",
    "layout.inspector.heading": "屬性",
    "layout.inspector.title": "標題",
    "layout.inspector.entity": "實體",
    "layout.inspector.secondary_entity": "實際實體（感測器）",
    "layout.inspector.secondary_entity_roborock": "地圖實體（影像，選用）",
    "layout.inspector.button_mode": "按鈕模式",
    "layout.inspector.button_accent_color": "按鈕強調色",
    "layout.inspector.button_style": "按鈕樣式",
    "layout.inspector.slider_entity_domain": "滑桿實體類型",
    "layout.inspector.binary_show_title": "顯示標題",
    "layout.inspector.binary_color_on": "開啟顏色（空白 = 自動）",
    "layout.inspector.binary_color_off": "關閉顏色（空白 = 自動）",
    "layout.inspector.binary_text_on": "開啟文字（空白 = 自動）",
    "layout.inspector.binary_text_off": "關閉文字（空白 = 自動）",
    "layout.inspector.sensor_value_color": "數值顏色（空白 = 自動）",
    "layout.inspector.alarm_code": "PIN 碼（空白 = 不使用 PIN）",
    "layout.inspector.alarm_ask_code": "一律要求輸入 PIN（自動：僅 HA 要求時）",
    "layout.inspector.alarm_backend": "服務後端",
    "layout.inspector.alarm_zone_label": "防區標題（空白 = 不顯示）",
    "layout.inspector.alarm_show_sensors": "在卡片上顯示未關閉的感測器",
    "layout.inspector.alarm_show_bypassed": "顯示已略過的感測器數量",
    "layout.inspector.alarm_force_arm": "感測器未關閉時詢問是否強制設防",
    "layout.inspector.alarm_skip_delay": "略過離開延遲（Alarmo）",
    "layout.inspector.alarm_modes": "卡片上顯示的按鈕",
    "layout.inspector.alarm_mode_away": "外出設防",
    "layout.inspector.alarm_mode_home": "居家設防",
    "layout.inspector.alarm_mode_night": "夜間設防",
    "layout.inspector.alarm_mode_vacation": "假期設防",
    "layout.inspector.alarm_mode_custom": "自訂略過",
    "layout.inspector.alarm_mode_disarm": "解除設防",
    "layout.inspector.clock_hint": "時鐘卡片：顯示目前時間，也可選擇顯示日期。",
    "layout.inspector.clock_show_seconds": "顯示秒數",
    "layout.inspector.clock_show_date": "顯示日期",
    "layout.tile_look.group": "卡片外觀（目前卡片）",
    "layout.tile_look.preset": "預設",
    "layout.tile_look.bg_color": "背景顏色",
    "layout.tile_look.bg_grad_color": "漸層結束顏色",
    "layout.tile_look.bg_grad_dir": "漸層方向",
    "layout.tile_look.border_color": "邊框顏色",
    "layout.tile_look.border_width": "邊框寬度（像素）",
    "layout.tile_look.radius": "圓角半徑（像素）",
    "layout.tile_look.corner_shape": "圓角樣式",
    "layout.tile_look.corner_hint": "正方形卡片使用最大圓角時會顯示為圓形。",
    "layout.tile_look.opacity": "背景不透明度（%）",
    "layout.tile_look.font_scale": "字體大小",
    "layout.tile_look.shadow": "陰影",
    "layout.tile_look.text_color": "文字顏色（全部）",
    "layout.tile_look.title_color": "標題顏色",
    "layout.tile_look.label_color": "實體標籤顏色",
    "layout.tile_look.value_color": "數值/狀態顏色",
    "layout.tile_look.icon_color": "圖示顏色",
    "layout.tile_look.reset": "重設卡片外觀",
    "layout.tile_look.hint": "留空會使用主題設定。顏色格式為 #RRGGBB。",
    "layout.tile_look.copy_source": "從其他卡片複製外觀",
    "layout.tile_look.copy_apply": "複製外觀",
    "layout.tile_look.copy_apply_page": "套用到本頁所有卡片",
    "layout.tile_look.copy_placeholder": "選擇卡片…",
    "layout.tile_look.copy_empty": "沒有其他可供複製的卡片",
    "layout.tile_look.copy_none": "請先選擇來源卡片。",
    "layout.tile_look.copy_done": "已從「{source}」複製卡片外觀。",
    "layout.tile_look.copy_page_done": "已將卡片外觀套用到 {count} 張卡片。",
    "layout.tile_look.copy_hint": "僅複製背景、邊框、顏色和字型大小；實體、標題和尺寸維持不變。",
    "layout.page_look.heading": "頁面外觀",
    "layout.page_look.group": "頁面外觀（目前頁面）",
    "layout.page_look.preset": "預設",
    "layout.page_look.bg_color": "背景顏色",
    "layout.page_look.bg_grad_color": "漸層結束顏色",
    "layout.page_look.bg_grad_dir": "漸層方向",
    "layout.page_look.wallpaper": "使用面板桌布",
    "layout.page_look.dim": "桌布加深（%）",
    "layout.page_look.reset": "重設頁面外觀",
    "layout.page_look.reset_done": "頁面外觀已重設。",
    "layout.page_look.page_theme": "目前頁面主題",
    "layout.page_look.page_theme_hint": "頁面顯示時會立即使用此主題重新繪製。「全域」會跟隨目前主題或日夜主題。",
    "layout.page_look.theme_none": "- 全域/日夜主題 -",
    "layout.page_look.hint": "留空會使用面板背景。面板會對桌布加深處理。",
    "layout.option.page_preset.auto": "面板預設",
    "layout.option.page_preset.midnight": "午夜",
    "layout.option.page_preset.deep_sea": "深海",
    "layout.option.page_preset.forest": "森林",
    "layout.option.page_preset.sunset": "日落",
    "layout.option.page_preset.plum": "梅紫",
    "layout.option.page_preset.wallpaper": "桌布",
    "layout.option.page_preset.wallpaper_dim": "桌布（深色）",
    "layout.option.page_grad_dir.none": "無",
    "layout.option.page_grad_dir.hor": "水平",
    "layout.option.page_grad_dir.ver": "垂直",
    "layout.option.tile_grad_dir.none": "無",
    "layout.option.tile_grad_dir.hor": "水平",
    "layout.option.tile_grad_dir.ver": "垂直",
    "layout.option.tile_font_scale.auto": "自動",
    "layout.option.tile_font_scale.s": "小",
    "layout.option.tile_font_scale.m": "中",
    "layout.option.tile_font_scale.l": "大",
    "layout.option.tile_font_scale.xl": "特大",
    "layout.option.tile_preset.auto": "主題預設",
    "layout.option.tile_preset.graphite": "石墨灰",
    "layout.option.tile_preset.emerald": "翡翠綠",
    "layout.option.tile_preset.amber": "琥珀色",
    "layout.option.tile_preset.violet": "紫羅蘭",
    "layout.option.tile_preset.sky": "天藍",
    "layout.option.tile_preset.glass": "玻璃質感",
    "layout.option.tile_corner.custom": "自訂（使用半徑）",
    "layout.option.tile_corner.square": "方角（0 像素）",
    "layout.option.tile_corner.soft": "小圓角（10 像素）",
    "layout.option.tile_corner.rounded": "圓角（16 像素）",
    "layout.option.tile_corner.pill": "膠囊形（40 像素）",
    "layout.option.tile_corner.circle": "圓形（最大圓角）",
    "layout.inspector.slider_direction": "滑桿方向",
    "layout.inspector.slider_accent_color": "滑桿強調色",
    "layout.inspector.graph_line_color": "圖表線條顏色",
    "layout.inspector.graph_time_window_min": "時間範圍（分鐘）",
    "layout.inspector.graph_point_count": "資料點數量（空白 = 自動）",
    "layout.inspector.graph_display_mode": "顯示模式",
    "layout.inspector.graph_bar_bucket_min": "長條圖間隔（分鐘）",
    "layout.option.graph_display_mode.line": "折線（含資料點）",
    "layout.option.graph_display_mode.line_smooth_points": "平滑曲線（含資料點）",
    "layout.option.graph_display_mode.line_smooth": "平滑曲線",
    "layout.option.graph_display_mode.bars": "長條圖",
    "layout.inspector.apply": "套用",
    "layout.option.button_mode.auto": "自動（預設開關）",
    "layout.option.button_style.switch": "開關（預設）",
    "layout.option.button_style.power_toggle": "電源切換",
    "layout.option.button_style.power_status": "電源狀態",
    "layout.option.button_style.plug_icon": "插頭圖示",
    "layout.option.button_style.lamp_icon": "燈圖示",
    "layout.option.button_style.highlight": "醒目顯示",
    "layout.option.button_style.status_text": "狀態文字",
    "layout.option.button_mode.play_pause": "播放/暫停（media_player）",
    "layout.option.button_mode.stop": "停止（media_player）",
    "layout.option.button_mode.next": "下一首（media_player）",
    "layout.option.button_mode.previous": "上一首（media_player）",
    "layout.option.slider_entity_domain.auto": "自動（燈光、媒體播放器、窗簾）",
    "layout.option.slider_entity_domain.light": "燈光",
    "layout.option.slider_entity_domain.media_player": "媒體播放器",
    "layout.option.slider_entity_domain.cover": "窗簾",
    "layout.option.slider_direction.auto": "自動（依寬度/高度）",
    "layout.option.slider_direction.left_to_right": "由左至右（0% → 100%）",
    "layout.option.slider_direction.right_to_left": "由右至左（100% → 0%）",
    "layout.option.slider_direction.bottom_to_top": "由下至上（0% → 100%）",
    "layout.option.slider_direction.top_to_bottom": "由上至下（100% → 0%）",
    "layout.actions.heading": "操作",
    "layout.actions.reload": "重新載入",
    "layout.actions.save": "儲存",
    "layout.actions.export": "匯出",
    "layout.actions.import": "匯入 JSON",
    "layout.actions.paste_placeholder": "將版面配置 JSON 貼到此處",
    "layout.canvas.title": "版面配置畫布",
    "layout.default_page.title": "客廳",
    "layout.status.loading": "正在載入版面配置…",
    "layout.status.load_failed": "版面配置載入失敗，將使用預設版面：{error}",
    "layout.status.loaded": "版面配置已載入",
    "layout.status.entity_fetch_failed": "實體取得失敗：{error}",
    "layout.status.saving": "正在儲存版面配置…",
    "layout.status.saved": "版面配置已儲存",
    "layout.status.imported": "版面配置已匯入（尚未儲存）",
    "layout.status.at_least_one_page": "至少需要一個頁面",
    "layout.status.entity_domain_required": "實體必須屬於下列網域：{domains}",
    "layout.status.expected_domain": "指定網域",
    "layout.status.secondary_sensor_required": "實際實體必須以 sensor. 開頭。",
    "layout.status.secondary_image_required": "地圖實體必須以 image. 開頭。",
    "layout.status.invalid_json": "版面配置 JSON 無效",
    "layout.status.save_failed": "儲存失敗：{error}",
    "layout.status.conflict_title": "面板版面配置已在其他位置變更",
    "layout.status.conflict_confirm": "面板版面配置已被其他來源變更（其他瀏覽器分頁、API 或備份還原）。\n\n確定 = 以目前編輯器中的版本覆寫\n取消 = 保留面板上的版本（重新載入頁面可捨棄本機變更）。",
    "layout.status.conflict_overridden": "已用目前編輯器中的版本覆寫面板版面配置。",
    "layout.status.import_failed": "匯入失敗：{error}",
    "layout.status.file_import_failed": "檔案匯入失敗：{error}",
    "setup.title": "快速設定",
    "setup.step_ha": "HA 已連線",
    "setup.step_tiles": "新增卡片",
    "setup.step_save": "儲存版面配置",
    "setup.subtitle": "為第一個儀表板選擇幾個 Home Assistant 實體。",
    "setup.page_label": "第一頁標題",
    "setup.page_placeholder": "客廳",
    "setup.add_light": "+ 燈光",
    "setup.add_heating": "+ 溫控",
    "setup.add_weather": "+ 天氣",
    "setup.add_button": "+ 開關",
    "setup.add_sensor": "+ 感測器",
    "setup.close": "關閉",
    "setup.skip": "跳過",
    "setup.done": "儲存並完成",
    "setup.save": "儲存版面配置",
    "setup.count_none": "尚未新增卡片。",
    "setup.count_one": "目前頁面有 1 張卡片。",
    "setup.count_many": "目前頁面有 {count} 張卡片。",
    "setup.added": "已新增：{title}",
    "setup.saving": "正在儲存版面配置…",
    "setup.saved": "版面配置已儲存，面板現在可以使用此儀表板。",
    "setup.save_failed": "儲存失敗：{error}",
    "provision.wifi.title": "Wi-Fi 初始設定",
    "provision.wifi.subtitle": "將面板連線至 Wi-Fi。",
    "provision.wifi.ssid": "SSID",
    "provision.wifi.country_code": "國家/地區代碼",
    "provision.wifi.password": "密碼",
    "provision.wifi.password_placeholder": "Wi-Fi 密碼",
    "provision.wifi.show_password": "顯示密碼",
    "provision.ha.title": "Home Assistant 初始設定",
    "provision.ha.subtitle": "將面板連線至 Home Assistant。",
    "provision.ha.ws_url": "WebSocket URL（ws:// 或 wss://）",
    "provision.ha.token": "長期存取權杖",
    "provision.ha.show_token": "顯示權杖",
    "settings.wifi.heading": "Wi-Fi",
    "settings.wifi.ssid": "SSID",
    "settings.wifi.country_code": "國家/地區代碼",
    "settings.wifi.bssid": "鎖定 BSSID（選用）",
    "settings.wifi.password": "密碼",
    "settings.wifi.password_placeholder": "留空會保留已儲存的密碼",
    "settings.wifi.static_enabled": "使用固定 IP（不使用 DHCP）",
    "settings.wifi.static_ip": "IP 位址",
    "settings.wifi.static_netmask": "子網路遮罩",
    "settings.wifi.static_gateway": "閘道",
    "settings.wifi.static_dns": "DNS（選用）",
    "settings.wifi.invalid_static_ip": "啟用固定 IP 時，IP 位址、子網路遮罩和閘道必須是有效的 IPv4 位址",
    "settings.ha.heading": "Home Assistant",
    "settings.ha.ws_url": "WebSocket URL（ws:// 或 wss://）",
    "settings.ha.token": "長期存取權杖",
    "settings.ha.token_placeholder": "留空會保留已儲存的權杖",
    "settings.ha.rest_fallback": "啟用 HA REST 備援（預設關閉，優先僅使用 WS）",
    "settings.time.heading": "時間",
    "settings.time.ntp_server": "NTP 伺服器",
    "settings.time.timezone": "時區",
    "settings.time.search": "搜尋時區…",
    "settings.time.show_zones": "顯示時區",
    "settings.time.search_hint": "輸入城市或區域名稱的一部分，然後選擇時區。",
    "settings.time.no_matches": "沒有符合的時區",
    "settings.time.local_time": "目前本地時間",
    "settings.time.clock_unavailable": "裝置時間無法取得或尚未同步",
    "settings.time.legacy_active": "現有舊格式時區",
    "settings.time.legacy_hint": "已保留現有時區。選擇一個地點以取代它。",
    "settings.time.list_unavailable": "時區清單無法取得，請重新載入設定。",
    "settings.ui.heading": "使用者介面",
    "settings.theme.heading": "主題",
    "settings.ui.language": "語言",
    "settings.ui.reload_languages": "重新載入語言清單",
    "settings.ui.download_json": "下載 JSON",
    "settings.ui.upload_code": "語言代碼",
    "settings.ui.upload_file": "翻譯 JSON 檔案",
    "settings.ui.upload_button": "上傳/新增語言",
    "settings.ap.heading": "設定用 AP",
    "settings.ap.hint": "如果設定用 AP 已啟用，請連線至該 AP 並開啟 <code>http://192.168.4.1</code>。",
    "settings.ota.heading": "韌體更新",
    "settings.ota.url": "OTA URL",
    "settings.ota.url_placeholder": "https://github.com/cptkirki/BETTA-HA-PANEL/releases/latest/download/...",
    "settings.ota.flash_url": "燒錄 URL",
    "settings.ota.refresh": "重新整理狀態",
    "settings.ota.file": "OTA .bin 檔案",
    "settings.ota.upload": "上傳並燒錄",
    "settings.ota.idle": "可開始更新 OTA 應用程式映像檔。目前分割區：{running}，目標分割區：{next}，分割區大小：{size}。",
    "settings.ota.running": "OTA 更新中：{progress}%（{written} / {total}）",
    "settings.ota.downloading": "正在從 URL 下載：{progress}%（{written} / {total}）",
    "settings.ota.uploading": "面板已接收：{progress}%（{written} / {total}）",
    "settings.ota.success": "OTA 韌體已寫入，正在重新啟動。",
    "settings.ota.error": "OTA 失敗：{error}",
    "settings.ota.rebooting": "裝置正在重新啟動。恢復連線後請重新開啟面板頁面。",
    "settings.ota.no_file": "請先選擇 OTA .bin 檔案。",
    "settings.ota.no_url": "請先貼上 OTA URL。",
    "settings.ota.starting_url": "正在從 URL 啟動 OTA…",
    "settings.ota.upload_progress": "正在上傳到面板：{progress}%（{written} / {total}）",
    "settings.ota.request_failed": "OTA 請求失敗：{error}",
    "settings.ota.target_slot": "目標分割區：{partition}",
    "settings.system.heading": "系統",
    "settings.system.auto_restart_enabled": "定期自動重新啟動面板",
    "settings.system.auto_restart_hours": "重新啟動間隔（小時）",
    "settings.system.hint": "啟用後，面板會在設定的小時數（1–168）後自動重新啟動。",
    "settings.backup.heading": "備份/還原",
    "settings.backup.hint": "備份檔案包含版面配置、公開設定和所有自訂主題；不包含 Wi-Fi 認證資料、HA 權杖、MQTT 密碼和桌布影像。",
    "settings.backup.download": "下載備份",
    "settings.backup.file": "用於還原的備份檔案",
    "settings.backup.restore": "還原備份",
    "settings.backup.choose_file": "請先選擇備份 JSON 檔案。",
    "settings.backup.downloading": "正在下載備份…",
    "settings.backup.downloaded": "備份已下載。",
    "settings.backup.download_failed": "備份下載失敗：{error}",
    "settings.backup.restoring": "正在還原備份…",
    "settings.backup.restore_failed": "還原失敗：{error}",
    "settings.backup.restored": "備份已還原：版面配置 {layout}，設定 {settings}，主題 {themes}。",
    "settings.backup.restart_hint": "連線設定已變更，請重新啟動面板使其生效。",
    "settings.logs.heading": "記錄",
    "settings.logs.refresh": "重新整理",
    "settings.logs.pause": "暫停",
    "settings.logs.resume": "繼續",
    "settings.logs.clear": "清除",
    "settings.logs.auto_scroll": "自動捲動",
    "settings.logs.download": "下載記錄",
    "settings.logs.loading": "正在載入記錄…",
    "settings.logs.empty": "目前沒有記錄。錯誤、警告和當機標記會顯示在這裡。",
    "settings.logs.updated": "更新於 {time}",
    "settings.logs.fetch_failed": "無法讀取記錄：{error}",
    "settings.logs.cleared": "記錄檔已清除。",
    "settings.logs.clear_failed": "無法清除記錄：{error}",
    "settings.diagnostics.heading": "診斷",
    "settings.diagnostics.refresh": "重新整理",
    "settings.diagnostics.auto_refresh": "自動重新整理（10 秒）",
    "settings.diagnostics.loading": "正在讀取診斷資訊…",
    "settings.diagnostics.updated": "更新於 {time}",
    "settings.diagnostics.empty": "目前沒有資料。",
    "settings.diagnostics.fetch_failed": "無法讀取診斷資訊：{error}",
    "settings.diagnostics.yes": "是",
    "settings.diagnostics.no": "否",
    "settings.diagnostics.uptime": "運作時間",
    "settings.diagnostics.reset_reason": "重新啟動原因",
    "settings.diagnostics.boot_count": "啟動次數",
    "settings.diagnostics.cpu_temp": "CPU 溫度",
    "settings.diagnostics.version": "韌體版本",
    "settings.diagnostics.project": "建置專案",
    "settings.diagnostics.idf": "ESP-IDF",
    "settings.diagnostics.build_date": "建置時間",
    "settings.diagnostics.panel": "晶片",
    "settings.diagnostics.screen": "螢幕",
    "settings.diagnostics.heap_free": "可用堆積記憶體",
    "settings.diagnostics.heap_min": "最低可用堆積記憶體",
    "settings.diagnostics.heap_largest": "最大可用記憶體區塊",
    "settings.diagnostics.heap_fragmentation": "記憶體碎片率",
    "settings.diagnostics.heap_dma": "內部 DMA 可用/最大",
    "settings.diagnostics.heap_blocks": "堆積記憶體區塊（已用/可用）",
    "settings.diagnostics.iram_free": "可用 IRAM",
    "settings.diagnostics.psram_free": "可用 PSRAM",
    "settings.diagnostics.connected": "已連線",
    "settings.diagnostics.ssid": "SSID",
    "settings.diagnostics.ip": "IP 位址",
    "settings.diagnostics.rssi": "RSSI",
    "settings.diagnostics.channel": "頻道",
    "settings.diagnostics.wifi_drops": "Wi-Fi 中斷次數",
    "settings.diagnostics.wifi_reconnects": "重新連線嘗試次數",
    "settings.diagnostics.wifi_recoveries": "驅動程式復原次數",
    "settings.diagnostics.wifi_last_drop": "最近一次中斷",
    "settings.diagnostics.wifi_session": "上一次連線階段",
    "settings.diagnostics.sync_done": "初始同步完成",
    "settings.diagnostics.base_url": "HA REST URL",
    "settings.diagnostics.cert_cn": "TLS 一般名稱",
    "settings.diagnostics.ws_connects": "WS 連線次數",
    "settings.diagnostics.ws_disconnects": "WS 中斷次數",
    "settings.diagnostics.ws_recoveries": "HA 復原次數",
    "settings.diagnostics.ws_last_session": "上次 WS 連線階段",
    "settings.diagnostics.missing_entities": "找不到的實體",
    "settings.diagnostics.mqtt_enabled": "MQTT 已啟用",
    "settings.diagnostics.mqtt_tls": "MQTT TLS",
    "settings.diagnostics.broker": "Broker",
    "settings.diagnostics.running_partition": "目前執行分割區",
    "settings.diagnostics.next_partition": "下一個更新分割區",
    "settings.diagnostics.image_state": "韌體映像狀態",
    "settings.diagnostics.rollback_enabled": "已啟用回復機制",
    "settings.diagnostics.boot_confirmed": "韌體映像已確認",
    "settings.diagnostics.card_status": "狀態",
    "settings.diagnostics.card_firmware": "韌體",
    "settings.diagnostics.card_memory": "記憶體",
    "settings.diagnostics.card_wifi": "Wi-Fi",
    "settings.diagnostics.card_ha": "Home Assistant",
    "settings.diagnostics.card_mqtt": "MQTT",
    "settings.diagnostics.card_ota": "OTA / 回復",
    "settings.diagnostics.ota_state.new": "新映像（尚未啟動）",
    "settings.diagnostics.ota_state.pending_verify": "等待驗證",
    "settings.diagnostics.ota_state.valid": "有效",
    "settings.diagnostics.ota_state.invalid": "無效",
    "settings.diagnostics.ota_state.aborted": "已中止",
    "settings.diagnostics.ota_state.undefined": "未追蹤（開機載入程式不支援回復）",
    "settings.diagnostics.bootloader_note": "韌體支援回復，但面板的開機載入程式尚未追蹤映像狀態。請透過 USB 燒錄一次開機載入程式（idf.py flash），以便更新失敗後自動回復。",
    "settings.actions.heading": "設定操作",
    "settings.actions.reload": "重新載入設定",
    "settings.actions.save": "儲存並重新啟動",
    "settings.actions.hint": "儲存後裝置會重新啟動，並可能從設定用 AP 切換到家用 Wi-Fi。",
    "settings.info.configured": "已設定",
    "settings.info.connected": "已連線",
    "settings.info.password_stored": "密碼已儲存",
    "settings.info.country": "國家/地區",
    "settings.info.rssi": "RSSI（已連線 AP）",
    "settings.info.connected_bssid": "已連線的 BSSID",
    "settings.info.channel": "頻道",
    "settings.info.token_stored": "權杖已儲存",
    "settings.info.rest_fallback": "REST 備援",
    "common.yes": "是",
    "common.no": "否",
    "common.scan": "掃描",
    "common.scan_wifi": "掃描 Wi-Fi",
    "common.save_reboot": "儲存並重新啟動",
    "status.idle": "閒置",
    "status.loading_settings": "正在載入設定…",
    "status.settings_loaded": "設定已載入",
    "status.settings_load_failed": "設定載入失敗：{error}",
    "status.settings_save_failed": "設定儲存失敗：{error}",
    "ha_diagnostics.missing_title": "此版面配置中的部分實體在 Home Assistant 中不存在",
    "ha_diagnostics.missing_title_more": "此版面配置中的部分實體在 Home Assistant 中不存在（共 {total} 個，顯示 {listed} 個）",
    "ha_diagnostics.missing_hint": "開啟受影響的元件，選擇有效實體並儲存版面配置。",
    "ha_diagnostics.dismiss": "略過",
    "status.saving_settings": "正在儲存設定…",
    "status.settings_saved_reboot": "設定已儲存。裝置會在約 2 秒後重新啟動，請重新連線並開啟面板 URL。",
    "status.wifi_scan_running": "正在掃描 Wi-Fi…",
    "status.wifi_scan_complete": "Wi-Fi 掃描完成（找到 {count} 個網路）",
    "status.wifi_scan_failed": "Wi-Fi 掃描失敗：{error}",
    "status.wifi_scan_timeout": "Wi-Fi 掃描請求逾時",
    "common.unknown_error": "未知錯誤",
    "wifi.scan_unavailable": "此硬體在設定用 AP 模式下無法掃描 Wi-Fi，請手動輸入 SSID。",
    "wifi.scan_click": "按一下「掃描 Wi-Fi」以列出附近的網路。",
    "wifi.scan_click_short": "按一下「掃描」以列出附近的網路。",
    "wifi.scan_no_networks": "找不到網路。請靠近路由器後重新掃描。",
    "wifi.scan_found": "找到 {count} 個網路。請選擇一個以填入 SSID。",
    "wifi.scan.connected_tag": "已連線",
    "wifi.scan.option_unavailable": "掃描不可用",
    "wifi.scan.option_scanning": "正在掃描…",
    "wifi.scan.option_not_run": "尚未掃描",
    "wifi.scan.option_no_networks": "找不到網路",
    "wifi.scan.option_select": "選擇網路（找到 {count} 個）",
    "settings.time.info": "重新啟動後生效。連線至 Wi-Fi 後會開始同步時間。",
    "settings.display.heading": "顯示與螢幕保護程式",
    "settings.display.info": "亮度和顏色會立即生效；上傳的桌布會儲存在裝置中。",
    "settings.display.brightness": "亮度（%）",
    "settings.display.screensaver_enabled": "螢幕保護程式",
    "settings.display.screensaver_timeout": "螢幕保護程式等待時間（秒）",
    "settings.display.saver_brightness": "螢幕保護程式亮度（%）",
    "settings.display.screen_off_enabled": "關閉螢幕",
    "settings.display.screen_off_timeout": "螢幕關閉等待時間（秒）",
    "settings.display.clock_format": "時鐘格式",
    "settings.display.clock_format_h24": "24 小時制（例如 23:00）",
    "settings.display.clock_format_h12": "12 小時制（例如 11:00 PM）",
    "settings.display.clock_format_hint": "12 小時制會在螢幕保護程式時鐘和頂端列時鐘旁顯示 AM/PM。",
    "settings.display.clock_style": "時鐘樣式",
    "settings.display.clock_style_classic": "經典",
    "settings.display.clock_style_flip": "翻頁時鐘",
    "settings.display.clock_style_hint": "翻頁時鐘會在數字變更時播放動畫，但只顯示 HH:MM，不顯示秒數。",
    "settings.display.show_seconds": "顯示秒數",
    "settings.display.show_date": "顯示日期",
    "settings.display.clock_color": "時鐘顏色",
    "settings.display.date_color": "日期顏色",
    "settings.display.night_mode_enabled": "夜間排程（調暗或關閉螢幕）",
    "settings.display.night_start": "夜間開始",
    "settings.display.night_end": "夜間結束",
    "settings.display.night_brightness": "夜間亮度（%，0 = 螢幕關閉）",
    "settings.display.night_wake": "夜間時段觸控喚醒（秒）",
    "settings.display.night_hint": "夜間時段內，面板會強制使用夜間亮度；設為 0% 時會關閉螢幕。觸控螢幕可暫時喚醒指定秒數。此功能需要時鐘已同步。",
    "settings.display.night_currently_active": "目前處於夜間模式。",
    "settings.display.theme_auto_enabled": "依時間自動切換主題",
    "settings.display.theme_day": "日間主題",
    "settings.display.theme_night": "夜間主題",
    "settings.display.theme_auto_none": "- 全域主題 -",
    "settings.display.theme_auto_hint": "夜間時段外使用日間主題，夜間時段內使用夜間主題。時段取自下方的開始和結束時間，即使未啟用夜間亮度排程也會生效。版面配置中設定了 page_theme 的頁面仍會覆寫這兩個主題。此功能需要時鐘已同步。",
    "settings.display.wallpaper": "桌布",
    "settings.display.wallpaper_hint": "瀏覽器會縮放影像並轉換為 RGB565，然後傳送到面板。",
    "settings.display.upload_wallpaper": "上傳桌布",
    "settings.display.remove_wallpaper": "移除桌布",
    "settings.display.apply": "立即套用（不需重新啟動）",
    "settings.display.press_fx": "按壓回饋（按住卡片時的視覺效果）",
    "settings.display.press_fx_dim": "調暗（%）",
    "settings.display.press_fx_scale": "縮小（占原尺寸的百分比）",
    "settings.display.press_fx_none": "無",
    "settings.display.press_fx_dim_mode": "調暗",
    "settings.display.press_fx_scale_mode": "縮小",
    "settings.display.press_fx_both": "調暗並縮小",
    "settings.display.press_fx_hint": "適用於點按整張卡片即可操作的類型（開關、按鈕、溫控）。按住下方範例可預覽效果。",
    "settings.display.press_fx_preview": "卡片",
    "settings.display.value_anim": "數值動畫（卡片數值變更時）",
    "settings.display.value_anim_ms": "持續時間（毫秒）",
    "settings.display.value_anim_none": "無",
    "settings.display.value_anim_fade": "淡入",
    "settings.display.value_anim_slide": "滑入",
    "settings.display.value_anim_count": "數字滾動",
    "settings.display.value_anim_preview": "預覽",
    "settings.display.value_anim_hint": "為自動變更的數值（例如感測器、天氣和功率）播放動畫。數字滾動會維持單位位置不變，並支援「22.5 °C」等格式。設為 0 毫秒可關閉效果。",
    "settings.display.topbar": "頂端列",
    "settings.display.topbar_show_clock": "時鐘",
    "settings.display.topbar_show_date": "日期",
    "settings.display.topbar_show_gear": "設定圖示",
    "settings.display.topbar_show_status": "Wi-Fi / HA 圖示",
    "settings.display.topbar_icon_text": "以文字取代圖示",
    "settings.display.topbar_custom_colors": "自訂顏色",
    "settings.display.topbar_bg_color": "頂端列背景",
    "settings.display.topbar_clock_color": "時鐘顏色",
    "settings.display.topbar_date_color": "日期顏色",
    "settings.display.topbar_gear_color": "設定圖示顏色",
    "settings.display.topbar_ha_color": "Home Assistant 顏色",
    "settings.display.topbar_wifi_color": "Wi-Fi 顏色",
    "settings.display.topbar_hint": "時鐘會在剩餘空間中置中顯示，並自動縮小字型以避免元素重疊。「以文字取代圖示」會以文字取代 Wi-Fi、Home Assistant 和設定圖示。",
    "settings.display.topbar_color_hint": "關閉「自訂顏色」後，頂端列會跟隨目前主題。",
    "settings.display.navbar": "底部導覽列（頁面分頁）",
    "settings.display.nav_custom_colors": "自訂顏色",
    "settings.display.nav_bar_bg_color": "導覽列背景",
    "settings.display.nav_bar_border_color": "導覽列上框線",
    "settings.display.nav_button_bg_color": "頁面分頁背景",
    "settings.display.nav_button_border_color": "頁面分頁框線",
    "settings.display.nav_tab_idle_color": "頁面標題顏色",
    "settings.display.nav_tab_active_color": "目前頁面標題顏色",
    "settings.display.nav_home_idle_color": "首頁圖示顏色",
    "settings.display.nav_home_active_color": "目前首頁圖示顏色",
    "settings.display.nav_hint": "底部導覽列會顯示首頁按鈕和各頁面分頁。頁面名稱過長時，分頁標題會以「…」截斷。",
    "settings.display.nav_color_hint": "關閉「自訂顏色」後，底部導覽列會跟隨目前主題。",
    "settings.display.applied": "顯示設定已套用。",
    "settings.display.no_wallpaper_file": "請先選擇影像檔案。",
    "settings.display.converting": "正在轉換影像…",
    "settings.display.convert_failed": "影像轉換失敗。",
    "settings.display.uploading": "正在上傳桌布…",
    "settings.display.wallpaper_uploaded": "桌布已上傳。",
    "settings.display.removing": "正在移除桌布…",
    "settings.display.wallpaper_removed": "桌布已移除。",
    "settings.sd.heading": "microSD 記憶卡",
    "settings.sd.enabled": "啟用 microSD 記憶卡（TF 卡槽）",
    "settings.sd.refresh": "重新整理",
    "settings.sd.export_logs": "將記錄匯出到記憶卡",
    "settings.sd.format": "格式化記憶卡",
    "settings.sd.format_confirm": "要格式化 microSD 記憶卡嗎？卡內所有檔案都會被刪除。",
    "settings.sd.up": "上一層",
    "settings.sd.root": "記憶卡根目錄",
    "settings.sd.logs": "記錄資料夾",
    "settings.sd.photos": "相片資料夾",
    "settings.sd.unsupported": "此裝置沒有 microSD 卡槽。",
    "settings.sd.disabled": "microSD 支援已停用。勾選此項可在啟動時掛載記憶卡。",
    "settings.sd.no_card": "卡槽中未偵測到記憶卡。插入後按一下「重新整理」；面板運作時也會自動偵測。",
    "settings.sd.no_filesystem": "偵測到記憶卡 {name}，但沒有面板可讀取的 FAT 檔案系統。按一下「格式化」進行初始化，此操作會清除記憶卡。",
    "settings.sd.exfat": "記憶卡 {name} 使用 exFAT 格式，面板無法讀取。按一下「格式化」可轉換為 FAT32，此操作會清除記憶卡。",
    "settings.sd.ntfs": "記憶卡 {name} 使用 NTFS 格式，面板無法讀取。按一下「格式化」可轉換為 FAT32，此操作會清除記憶卡。",
    "settings.sd.formatting": "正在格式化…",
    "settings.sd.mounted": "記憶卡：{name}，總容量 {total} MB，可用 {free} MB",
    "settings.sd.empty": "此資料夾為空。",
    "settings.sd.loading": "正在讀取記憶卡…",
    "settings.sd.delete": "刪除",
    "settings.sd.delete_confirm": "要從記憶卡中刪除「{name}」嗎？",
    "settings.sd.deleted": "檔案已刪除。",
    "settings.sd.delete_failed": "無法刪除此項目。",
    "settings.sd.use_wallpaper": "設為桌布",
    "settings.sd.wallpaper_failed": "無法將此影像轉換為桌布。",
    "settings.sd.wallpaper_ok": "已將記憶卡中的影像設為桌布。",
    "settings.sd.wallpaper_sd": "螢幕保護程式圖片：儲存在此 microSD 記憶卡中。面板只保留一份副本，取出記憶卡時會將其移至內部快閃記憶體。",
    "settings.sd.wallpaper_flash": "螢幕保護程式圖片：儲存在內部快閃記憶體中。掛載記憶卡後會立即移至卡中。",
    "settings.sd.wallpaper_none": "螢幕保護程式圖片：尚未設定，請在「顯示」設定中上傳。",
    "settings.sd.exporting": "正在匯出記錄…",
    "settings.sd.exported": "記錄已匯出到 {path}",
    "settings.sd.export_failed": "記錄匯出失敗。",
    "settings.sd.formatted": "記憶卡已格式化。",
    "settings.sd.format_failed": "格式化失敗。",
    "settings.sd.type_dir": "資料夾",
    "settings.sd.status_enabled": "microSD 支援已啟用。",
    "settings.sd.status_disabled": "microSD 支援已停用。",
    "settings.sd.apply_failed": "無法套用 microSD 設定。",
    "settings.pages.heading": "頁面與切換效果",
    "settings.pages.transition": "頁面切換效果",
    "settings.pages.transition_ms": "切換時間（毫秒）",
    "settings.pages.transition_hint": "面板切換頁面時播放的動畫。設為 0 毫秒可停用所選效果。",
    "settings.pages.option_none": "無（即時）",
    "settings.pages.option_fade": "淡入淡出",
    "settings.pages.option_slide": "滑動（左/右）",
    "settings.pages.option_slide_up": "滑動（上/下）",
    "settings.pages.option_fade_slide": "淡入淡出並滑動",
    "settings.pages.target": "在面板上顯示頁面",
    "settings.pages.reload": "重新載入頁面清單",
    "settings.pages.show": "立即顯示",
    "settings.pages.activated": "面板目前顯示頁面「{page}」。",
    "settings.pages.current": "目前顯示頁面：{page}",
    "settings.pages.apply": "立即套用（不需重新啟動）",
    "settings.pages.applied": "頁面切換設定已套用。",
    "settings.mqtt.heading": "MQTT / Home Assistant",
    "settings.mqtt.enabled": "啟用 MQTT（在 Home Assistant 中自動探索為裝置）",
    "settings.mqtt.use_tls": "加密連線（TLS，mqtts/連接埠 8883）",
    "settings.mqtt.tls_hint": "TLS 會使用 ESP 信任憑證套件驗證 MQTT Broker 憑證。如果連接埠仍為 1883，啟用後會自動切換到 8883。",
    "settings.mqtt.reapply_hint": "按一下「套用 MQTT」將變更推送到面板。",
    "settings.mqtt.host": "Broker 主機（空白 = 從 HA URL 取得）",
    "settings.mqtt.port": "Broker 連接埠",
    "settings.mqtt.username": "使用者名稱",
    "settings.mqtt.password": "密碼",
    "settings.mqtt.discovery_prefix": "自動探索前綴",
    "settings.mqtt.info": "透過 MQTT 探索，面板會以裝置形式出現在 Home Assistant 中。變更不需重新啟動即可生效。",
    "settings.mqtt.apply": "套用 MQTT（不需重新啟動）",
    "settings.mqtt.applied": "MQTT 設定已套用。",
    "settings.ui.info": "預覽會立即切換；儲存的語言會在重新啟動後套用。",
    "settings.ap.active": "設定用 AP 已啟用：{ssid}\\n連線至此 AP 後，請開啟 http://192.168.4.1。",
    "settings.ap.inactive": "設定用 AP 未啟用。\\n請使用家用 Wi-Fi 網路中的面板 IP 位址。",
    "settings.translation.info": "上傳 JSON 檔案可新增或更新語言。",
    "settings.translation.upload_ok": "語言「{lang}」已上傳。",
    "settings.translation.upload_fail": "上傳失敗：{error}",
    "settings.translation.no_file": "請先選擇 JSON 檔案。",
    "settings.translation.invalid_json": "JSON 格式無效",
    "settings.translation.object_required": "JSON 最上層必須是物件",
    "settings.translation.invalid_code": "語言代碼只能包含 [a-z0-9_-]，長度必須為 2–15 個字元。",
    "settings.language.invalid_country": "Wi-Fi 國家/地區代碼必須是 2 碼 ISO 代碼（例如 US、DE）",
    "settings.language.invalid_bssid": "BSSID 必須留空或使用 AA:BB:CC:DD:EE:FF 格式",
    "settings.language.invalid_ha_url": "HA URL 必須以 ws:// 或 wss:// 開頭",
    "provision.wifi.required_ssid": "必須填寫 SSID。",
    "provision.wifi.required_country": "國家/地區代碼必須為 2 個字母（例如 US、DE）。",
    "provision.ha.required_url": "必須填寫 WebSocket URL。",
    "provision.ha.invalid_url": "HA URL 必須以 ws:// 或 wss:// 開頭。",
    "provision.ha.required_token": "必須填寫長期存取權杖。",
    "provision.saving_reboot": "正在儲存設定並重新啟動…",
    "provision.saved_reboot": "設定已儲存，裝置會在約 2 秒後重新啟動。",
    "provision.save_failed": "儲存失敗：{error}",
    "provision.wifi.hint": "儲存後面板會重新啟動，接著顯示 Home Assistant 初始設定。",
    "provision.ha.hint": "儲存後面板會重新啟動，接著解除編輯器鎖定。",
    "settings.language.option_de": "Deutsch",
    "settings.language.option_en": "English",
    "settings.language.option_es": "Espanol",
    "settings.language.option_fr": "Francais",
    "settings.language.option_pl": "Polski",
    "settings.language.option_zh-cn": "简体中文",
    "settings.language.option_zh-tw": "繁體中文"
  },
  // END GENERATED CHINESE CATALOGS
};

function widgetSizeLimits(type) {
  const compact = isCompactCanvas();
  const fallback = {
    minW: MIN_WIDGET_SIZE,
    minH: MIN_WIDGET_SIZE,
    maxW: CANVAS_WIDTH,
    maxH: CANVAS_HEIGHT,
  };

  switch (type) {
    case "sensor":
    case "binary_sensor":
      return compact
        ? { minW: 90, minH: 60, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 120, minH: 80, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "alarm_tile":
      return compact
        ? { minW: 150, minH: 110, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 200, minH: 140, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "clock_alarm":
      return compact
        ? { minW: 110, minH: 80, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 150, minH: 110, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "button":
      return compact
        ? { minW: 82, minH: 82, maxW: 320, maxH: 260 }
        : { minW: 100, minH: 100, maxW: 480, maxH: 320 };
    case "slider":
      return compact
        ? { minW: 100, minH: 80, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 100, minH: 100, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "graph":
      return compact
        ? { minW: 150, minH: 100, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 220, minH: 140, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "empty_tile":
      return compact
        ? { minW: 100, minH: 70, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 120, minH: 80, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "light_tile":
      return compact
        ? { minW: 140, minH: 140, maxW: 480, maxH: 480 }
        : { minW: 180, minH: 180, maxW: 480, maxH: 480 };
    case "heating_tile":
      return compact
        ? { minW: 150, minH: 150, maxW: 480, maxH: 480 }
        : { minW: 220, minH: 200, maxW: 480, maxH: 480 };
    case "weather_tile":
      return compact
        ? { minW: 160, minH: 150, maxW: 480, maxH: 480 }
        : { minW: 220, minH: 200, maxW: 480, maxH: 480 };
    case "weather_3day":
      return compact
        ? { minW: 280, minH: 180, maxW: 640, maxH: 480 }
        : { minW: 260, minH: 220, maxW: 640, maxH: 480 };
    case "todo_list":
      return compact
        ? { minW: 180, minH: 160, maxW: 640, maxH: 640 }
        : { minW: 220, minH: 200, maxW: 640, maxH: 640 };
    case "media_player":
      return compact
        ? { minW: 200, minH: 170, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 260, minH: 220, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "roborock_tile":
      return compact
        ? { minW: 220, minH: 190, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 240, minH: 220, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "cover_tile":
      return compact
        ? { minW: 140, minH: 110, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT }
        : { minW: 180, minH: 140, maxW: CANVAS_WIDTH, maxH: CANVAS_HEIGHT };
    case "scene_tile":
      return compact
        ? { minW: 96, minH: 90, maxW: 480, maxH: 480 }
        : { minW: 120, minH: 110, maxW: 480, maxH: 480 };
    case "person_tile":
      return compact
        ? { minW: 110, minH: 80, maxW: 640, maxH: 480 }
        : { minW: 140, minH: 100, maxW: 640, maxH: 480 };
    case "timer_tile":
      return compact
        ? { minW: 110, minH: 90, maxW: 480, maxH: 480 }
        : { minW: 140, minH: 110, maxW: 480, maxH: 480 };
    default:
      return fallback;
  }
}

function clampRectToCanvas(rect, type) {
  const limits = widgetSizeLimits(type);
  const maxW = Math.min(limits.maxW, CANVAS_WIDTH);
  const maxH = Math.min(limits.maxH, CANVAS_HEIGHT);
  const minW = Math.min(limits.minW, maxW);
  const minH = Math.min(limits.minH, maxH);

  const w = clamp(snap(Number(rect.w || minW)), minW, maxW);
  const h = clamp(snap(Number(rect.h || minH)), minH, maxH);
  const x = clamp(snap(Number(rect.x || 0)), 0, CANVAS_WIDTH - w);
  const y = clamp(snap(Number(rect.y || 0)), 0, CANVAS_HEIGHT - h);

  return { x, y, w, h };
}

const editor = {
  layout: null,
  layoutSignature: "",
  entities: [],
  states: new Map(),
  energySnapshot: null,
  selectedPageId: null,
  selectedWidgetId: null,
  activePane: "layout",
  activeSettingsSection: "settingsWifiSection",
  provisioningStage: null,
  editorStarted: false,
  settings: null,
  sd: { state: null, busy: false, dir: "", entries: [] },
  appVersion: "",
  appProject: "",
  appScreenW: 0,
  appScreenH: 0,
  haDiagnostics: { total: 0, listed: 0, updatedUnixMs: 0, names: [], dismissedSignature: "" },
  wifiScanItems: [],
  wifiScanHasRun: false,
  wifiScanInProgress: false,
  wifiScanSupported: true,
  lightPicker: {
    items: [],
    itemsByDomain: {},
    loadedByDomain: {},
    domain: "light",
    widgetType: "light_tile",
    search: "",
    searchByDomain: {},
    searchDebounceId: null,
    loading: false,
    hasLoaded: false,
    pollTimerId: null,
    requestSeq: 0,
    lastStatus: "",
  },
  setupWizard: {
    active: false,
    openedManually: false,
    addedSinceOpen: 0,
  },
  ota: {
    status: null,
    pollTimerId: null,
    uploadInProgress: false,
    latestUrl: "",
    autoFilledUrl: "",
    latestUrlLoading: false,
  },
  logs: {
    paused: false,
    pollTimerId: null,
    requestSeq: 0,
    lastEtag: "",
  },
  diagnostics: {
    pollTimerId: null,
    requestSeq: 0,
    lastData: null,
  },
  languageCatalog: [],
  i18nLanguage: DEFAULT_UI_LANGUAGE,
  i18nMap: { ...(WEB_I18N_BUILTIN.en || {}) },
  i18nEffective: {},
  sectionCollapsed: {
    pages: false,
    widgets: false,
    inspector: false,
  },
};

const el = {
  provisioningRoot: document.getElementById("provisioningRoot"),
  provisioningWifiPage: document.getElementById("provisioningWifiPage"),
  provisioningHaPage: document.getElementById("provisioningHaPage"),
  editorShell: document.getElementById("editorShell"),
  sidebarTitleText: document.getElementById("sidebarTitleText"),
  appVersionLabel: document.getElementById("appVersionLabel"),
  layoutTabBtn: document.getElementById("layoutTabBtn"),
  settingsTabBtn: document.getElementById("settingsTabBtn"),
  layoutPane: document.getElementById("layoutPane"),
  settingsPane: document.getElementById("settingsPane"),
  settingsContentPane: document.getElementById("settingsContentPane"),
  settingsNavButtons: [],
  settingsContentSections: [],
  canvasWrap: document.querySelector(".canvas-wrap"),
  actionsPanel: document.querySelector("aside.actions-panel"),
  pagesList: document.getElementById("pagesList"),
  pagesMiniList: document.getElementById("pagesMiniList"),
  widgetsList: document.getElementById("widgetsList"),
  canvas: document.getElementById("canvas"),
  canvasTitle: document.getElementById("canvasTitle"),
  status: document.getElementById("status"),
  haDiagnosticsBanner: document.getElementById("haDiagnosticsBanner"),
  haDiagnosticsTitle: document.getElementById("haDiagnosticsTitle"),
  haDiagnosticsList: document.getElementById("haDiagnosticsList"),
  haDiagnosticsHint: document.getElementById("haDiagnosticsHint"),
  haDiagnosticsDismiss: document.getElementById("haDiagnosticsDismiss"),
  pagesSection: document.getElementById("pagesSection"),
  widgetsSection: document.getElementById("widgetsSection"),
  inspectorSection: document.getElementById("inspectorSection"),
  togglePagesSection: document.getElementById("togglePagesSection"),
  toggleWidgetsSection: document.getElementById("toggleWidgetsSection"),
  toggleInspectorSection: document.getElementById("toggleInspectorSection"),
  addPageBtn: document.getElementById("addPageBtn"),
  addEnergyPageBtn: document.getElementById("addEnergyPageBtn"),
  addMusicPageBtn: document.getElementById("addMusicPageBtn"),
  deletePageBtn: document.getElementById("deletePageBtn"),
  pageTitleInput: document.getElementById("pageTitleInput"),
  applyPageBtn: document.getElementById("applyPageBtn"),
  energyPageOptions: document.getElementById("energyPageOptions"),
  energySource: document.getElementById("energySource"),
  energySourceHint: document.getElementById("energySourceHint"),
  energyManualOptions: document.getElementById("energyManualOptions"),
  energyHomePower: document.getElementById("energyHomePower"),
  energySolarPower: document.getElementById("energySolarPower"),
  energyGridPower: document.getElementById("energyGridPower"),
  energyGridImport: document.getElementById("energyGridImport"),
  energyGridExport: document.getElementById("energyGridExport"),
  energyBatteryPower: document.getElementById("energyBatteryPower"),
  energyBatteryCharge: document.getElementById("energyBatteryCharge"),
  energyBatteryDischarge: document.getElementById("energyBatteryDischarge"),
  energyBatterySoc: document.getElementById("energyBatterySoc"),
  applyEnergyPageBtn: document.getElementById("applyEnergyPageBtn"),
  musicPageOptions: document.getElementById("musicPageOptions"),
  musicPlayerEntity: document.getElementById("musicPlayerEntity"),
  musicPlayers: document.getElementById("musicPlayers"),
  applyMusicPageBtn: document.getElementById("applyMusicPageBtn"),
  addSensorBtn: document.getElementById("addSensorBtn"),
  addButtonBtn: document.getElementById("addButtonBtn"),
  addBinarySensorBtn: document.getElementById("addBinarySensorBtn"),
  addAlarmTileBtn: document.getElementById("addAlarmTileBtn"),
  addCoverTileBtn: document.getElementById("addCoverTileBtn"),
  addSceneTileBtn: document.getElementById("addSceneTileBtn"),
  addPersonTileBtn: document.getElementById("addPersonTileBtn"),
  addTimerTileBtn: document.getElementById("addTimerTileBtn"),
  addClockBtn: document.getElementById("addClockBtn"),
  addSliderBtn: document.getElementById("addSliderBtn"),
  addGraphBtn: document.getElementById("addGraphBtn"),
  addEmptyTileBtn: document.getElementById("addEmptyTileBtn"),
  addLightTileBtn: document.getElementById("addLightTileBtn"),
  openSetupWizardBtn: document.getElementById("openSetupWizardBtn"),
  lightEntityPickerOverlay: document.getElementById("lightEntityPickerOverlay"),
  lightEntityPickerTitle: document.getElementById("lightEntityPickerTitle"),
  lightEntityPickerRefreshBtn: document.getElementById("lightEntityPickerRefreshBtn"),
  lightEntityPickerCloseBtn: document.getElementById("lightEntityPickerCloseBtn"),
  lightEntityPickerBlankBtn: document.getElementById("lightEntityPickerBlankBtn"),
  lightEntityPickerSearch: document.getElementById("lightEntityPickerSearch"),
  lightEntityPickerStatus: document.getElementById("lightEntityPickerStatus"),
  lightEntityPickerProgress: document.getElementById("lightEntityPickerProgress"),
  lightEntityPickerProgressBar: document.getElementById("lightEntityPickerProgressBar"),
  lightEntityPickerProgressText: document.getElementById("lightEntityPickerProgressText"),
  lightEntityPickerRooms: document.getElementById("lightEntityPickerRooms"),
  addHeatingTileBtn: document.getElementById("addHeatingTileBtn"),
  addWeatherTileBtn: document.getElementById("addWeatherTileBtn"),
  addWeather3DayBtn: document.getElementById("addWeather3DayBtn"),
  addTodoListBtn: document.getElementById("addTodoListBtn"),
  addMediaPlayerBtn: document.getElementById("addMediaPlayerBtn"),
  addRoborockTileBtn: document.getElementById("addRoborockTileBtn"),
  deleteWidgetBtn: document.getElementById("deleteWidgetBtn"),
  reloadBtn: document.getElementById("reloadBtn"),
  saveBtn: document.getElementById("saveBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),
  jsonPaste: document.getElementById("jsonPaste"),
  fTitle: document.getElementById("fTitle"),
  fType: document.getElementById("fType"),
  fEntityWrap: document.getElementById("fEntityWrap"),
  fEntity: document.getElementById("fEntity"),
  fSecondaryEntityWrap: document.getElementById("fSecondaryEntityWrap"),
  fSecondaryEntityLabel: document.getElementById("fSecondaryEntityLabel"),
  fSecondaryEntity: document.getElementById("fSecondaryEntity"),
  buttonOptions: document.getElementById("buttonOptions"),
  fButtonMode: document.getElementById("fButtonMode"),
  fSliderEntityDomain: document.getElementById("fSliderEntityDomain"),
  fButtonAccentColor: document.getElementById("fButtonAccentColor"),
  fButtonStyle: document.getElementById("fButtonStyle"),
  sliderOptions: document.getElementById("sliderOptions"),
  fSliderDirection: document.getElementById("fSliderDirection"),
  fSliderAccentColor: document.getElementById("fSliderAccentColor"),
  graphOptions: document.getElementById("graphOptions"),
  fGraphLineColor: document.getElementById("fGraphLineColor"),
  fGraphTimeWindowMin: document.getElementById("fGraphTimeWindowMin"),
  fGraphPointCount: document.getElementById("fGraphPointCount"),
  fGraphPointCountWrap: document.getElementById("fGraphPointCountWrap"),
  fGraphDisplayMode: document.getElementById("fGraphDisplayMode"),
  fGraphDisplayModeLabel: document.getElementById("fGraphDisplayModeLabel"),
  fGraphBarBucketMin: document.getElementById("fGraphBarBucketMin"),
  fGraphBarBucketMinLabel: document.getElementById("fGraphBarBucketMinLabel"),
  fGraphBarBucketMinWrap: document.getElementById("fGraphBarBucketMinWrap"),
  heatingOptions: document.getElementById("heatingOptions"),
  fHeatingStyleVariant: document.getElementById("fHeatingStyleVariant"),
  fHeatingArcOpening: document.getElementById("fHeatingArcOpening"),
  fHeatingArcOpeningWrap: document.getElementById("fHeatingArcOpeningWrap"),
  binaryOptions: document.getElementById("binaryOptions"),
  fBinaryShowTitle: document.getElementById("fBinaryShowTitle"),
  fBinaryColorOn: document.getElementById("fBinaryColorOn"),
  fBinaryColorOff: document.getElementById("fBinaryColorOff"),
  fBinaryTextOn: document.getElementById("fBinaryTextOn"),
  fBinaryTextOff: document.getElementById("fBinaryTextOff"),
  alarmOptions: document.getElementById("alarmOptions"),
  fAlarmCode: document.getElementById("fAlarmCode"),
  fAlarmAskCode: document.getElementById("fAlarmAskCode"),
  fAlarmBackend: document.getElementById("fAlarmBackend"),
  fAlarmZoneLabel: document.getElementById("fAlarmZoneLabel"),
  fAlarmShowSensors: document.getElementById("fAlarmShowSensors"),
  fAlarmShowBypassed: document.getElementById("fAlarmShowBypassed"),
  fAlarmForceArm: document.getElementById("fAlarmForceArm"),
  fAlarmSkipDelay: document.getElementById("fAlarmSkipDelay"),
  fAlarmModes: document.getElementById("fAlarmModes"),
  clockOptions: document.getElementById("clockOptions"),
  fClockShowSeconds: document.getElementById("fClockShowSeconds"),
  fClockShowDate: document.getElementById("fClockShowDate"),
  sensorOptions: document.getElementById("sensorOptions"),
  fSensorValueColor: document.getElementById("fSensorValueColor"),
  tileLookGroup: document.getElementById("tileLookGroup"),
  fTilePreset: document.getElementById("fTilePreset"),
  fTileBgColor: document.getElementById("fTileBgColor"),
  fTileBgColorPick: document.getElementById("fTileBgColorPick"),
  fTileBgGradColor: document.getElementById("fTileBgGradColor"),
  fTileBgGradColorPick: document.getElementById("fTileBgGradColorPick"),
  fTileBgGradDir: document.getElementById("fTileBgGradDir"),
  fTileBorderColor: document.getElementById("fTileBorderColor"),
  fTileBorderColorPick: document.getElementById("fTileBorderColorPick"),
  fTileBorderWidth: document.getElementById("fTileBorderWidth"),
  fTileRadius: document.getElementById("fTileRadius"),
  fTileOpacity: document.getElementById("fTileOpacity"),
  fTileShadow: document.getElementById("fTileShadow"),
  fTileFontScale: document.getElementById("fTileFontScale"),
  fTileTextColor: document.getElementById("fTileTextColor"),
  fTileTextColorPick: document.getElementById("fTileTextColorPick"),
  fTileTitleColor: document.getElementById("fTileTitleColor"),
  fTileTitleColorPick: document.getElementById("fTileTitleColorPick"),
  fTileLabelColor: document.getElementById("fTileLabelColor"),
  fTileLabelColorPick: document.getElementById("fTileLabelColorPick"),
  fTileValueColor: document.getElementById("fTileValueColor"),
  fTileValueColorPick: document.getElementById("fTileValueColorPick"),
  fTileIconColor: document.getElementById("fTileIconColor"),
  fTileIconColorPick: document.getElementById("fTileIconColorPick"),
  fTileResetBtn: document.getElementById("tileLookResetBtn"),
  tileLookResetBtn: document.getElementById("tileLookResetBtn"),
  fTileCornerShape: document.getElementById("fTileCornerShape"),
  fTileCopySource: document.getElementById("fTileCopySource"),
  tileLookCopyBtn: document.getElementById("tileLookCopyBtn"),
  tileLookCopyPageBtn: document.getElementById("tileLookCopyPageBtn"),
  pageLookOptions: document.getElementById("pageLookOptions"),
  fPagePreset: document.getElementById("fPagePreset"),
  fPageBgColor: document.getElementById("fPageBgColor"),
  fPageBgColorPick: document.getElementById("fPageBgColorPick"),
  fPageBgGradColor: document.getElementById("fPageBgGradColor"),
  fPageBgGradColorPick: document.getElementById("fPageBgGradColorPick"),
  fPageBgGradDir: document.getElementById("fPageBgGradDir"),
  fPageWallpaper: document.getElementById("fPageWallpaper"),
  fPageDim: document.getElementById("fPageDim"),
  fPageTheme: document.getElementById("fPageTheme"),
  pageLookResetBtn: document.getElementById("pageLookResetBtn"),
  fX: document.getElementById("fX"),
  fY: document.getElementById("fY"),
  fW: document.getElementById("fW"),
  fH: document.getElementById("fH"),
  applyInspectorBtn: document.getElementById("applyInspectorBtn"),
  entityOptions: document.getElementById("entityOptions"),
  energyEntityOptions: document.getElementById("energyEntityOptions"),
  musicEntityOptions: document.getElementById("musicEntityOptions"),
  sensorEntityOptions: document.getElementById("sensorEntityOptions"),
  settingsWifiSsid: document.getElementById("settingsWifiSsid"),
  settingsWifiCountryCode: document.getElementById("settingsWifiCountryCode"),
  settingsWifiBssid: document.getElementById("settingsWifiBssid"),
  scanWifiBtn: document.getElementById("scanWifiBtn"),
  settingsWifiScanResults: document.getElementById("settingsWifiScanResults"),
  settingsWifiScanInfo: document.getElementById("settingsWifiScanInfo"),
  settingsWifiPassword: document.getElementById("settingsWifiPassword"),
  settingsWifiStaticEnabled: document.getElementById("settingsWifiStaticEnabled"),
  settingsWifiStaticIp: document.getElementById("settingsWifiStaticIp"),
  settingsWifiStaticNetmask: document.getElementById("settingsWifiStaticNetmask"),
  settingsWifiStaticGateway: document.getElementById("settingsWifiStaticGateway"),
  settingsWifiStaticDns: document.getElementById("settingsWifiStaticDns"),
  settingsHaUrl: document.getElementById("settingsHaUrl"),
  settingsHaToken: document.getElementById("settingsHaToken"),
  settingsHaRestEnabled: document.getElementById("settingsHaRestEnabled"),
  settingsNtpServer: document.getElementById("settingsNtpServer"),
  settingsTimezone: document.getElementById("settingsTimezone"),
  settingsLanguage: document.getElementById("settingsLanguage"),
  reloadLanguagesBtn: document.getElementById("reloadLanguagesBtn"),
  downloadLanguageBtn: document.getElementById("downloadLanguageBtn"),
  uploadLanguageCode: document.getElementById("uploadLanguageCode"),
  uploadLanguageFile: document.getElementById("uploadLanguageFile"),
  uploadLanguageBtn: document.getElementById("uploadLanguageBtn"),
  settingsTranslationInfo: document.getElementById("settingsTranslationInfo"),
  settingsWifiInfo: document.getElementById("settingsWifiInfo"),
  settingsHaInfo: document.getElementById("settingsHaInfo"),
  settingsTimeInfo: document.getElementById("settingsTimeInfo"),
  settingsBrightness: document.getElementById("settingsBrightness"),
  settingsScreensaverEnabled: document.getElementById("settingsScreensaverEnabled"),
  settingsScreensaverTimeout: document.getElementById("settingsScreensaverTimeout"),
  settingsSaverBrightness: document.getElementById("settingsSaverBrightness"),
  settingsScreenOffEnabled: document.getElementById("settingsScreenOffEnabled"),
  settingsScreenOffTimeout: document.getElementById("settingsScreenOffTimeout"),
  settingsClockFormat: document.getElementById("settingsClockFormat"),
  settingsClockStyle: document.getElementById("settingsClockStyle"),
  settingsShowSeconds: document.getElementById("settingsShowSeconds"),
  settingsShowDate: document.getElementById("settingsShowDate"),
  settingsClockColor: document.getElementById("settingsClockColor"),
  settingsDateColor: document.getElementById("settingsDateColor"),
  settingsNightModeEnabled: document.getElementById("settingsNightModeEnabled"),
  settingsNightStart: document.getElementById("settingsNightStart"),
  settingsNightEnd: document.getElementById("settingsNightEnd"),
  settingsNightBrightness: document.getElementById("settingsNightBrightness"),
  settingsNightWakeSec: document.getElementById("settingsNightWakeSec"),
  settingsNightHint: document.getElementById("settingsNightHint"),
  settingsThemeAutoEnabled: document.getElementById("settingsThemeAutoEnabled"),
  settingsThemeDaySelect: document.getElementById("settingsThemeDaySelect"),
  settingsThemeNightSelect: document.getElementById("settingsThemeNightSelect"),
  settingsThemeAutoHint: document.getElementById("settingsThemeAutoHint"),
  settingsTilePressFx: document.getElementById("settingsTilePressFx"),
  settingsTilePressFxDim: document.getElementById("settingsTilePressFxDim"),
  settingsTilePressFxScale: document.getElementById("settingsTilePressFxScale"),
  settingsTilePressFxHint: document.getElementById("settingsTilePressFxHint"),
  settingsTilePressFxPreviewTile: document.getElementById("settingsTilePressFxPreviewTile"),
  settingsValueAnim: document.getElementById("settingsValueAnim"),
  settingsValueAnimMs: document.getElementById("settingsValueAnimMs"),
  settingsValueAnimHint: document.getElementById("settingsValueAnimHint"),
  settingsValueAnimPreview: document.getElementById("settingsValueAnimPreview"),
  settingsValueAnimPreviewBtn: document.getElementById("settingsValueAnimPreviewBtn"),
  settingsTopbarShowClock: document.getElementById("settingsTopbarShowClock"),
  settingsTopbarShowDate: document.getElementById("settingsTopbarShowDate"),
  settingsTopbarShowGear: document.getElementById("settingsTopbarShowGear"),
  settingsTopbarShowStatus: document.getElementById("settingsTopbarShowStatus"),
  settingsTopbarIconText: document.getElementById("settingsTopbarIconText"),
  settingsTopbarCustomColors: document.getElementById("settingsTopbarCustomColors"),
  settingsTopbarColors: document.getElementById("settingsTopbarColors"),
  settingsTopbarBgColor: document.getElementById("settingsTopbarBgColor"),
  settingsTopbarClockColor: document.getElementById("settingsTopbarClockColor"),
  settingsTopbarDateColor: document.getElementById("settingsTopbarDateColor"),
  settingsTopbarGearColor: document.getElementById("settingsTopbarGearColor"),
  settingsTopbarHaColor: document.getElementById("settingsTopbarHaColor"),
  settingsTopbarWifiColor: document.getElementById("settingsTopbarWifiColor"),
  settingsTopbarHint: document.getElementById("settingsTopbarHint"),
  settingsTopbarColorHint: document.getElementById("settingsTopbarColorHint"),
  settingsNavCustomColors: document.getElementById("settingsNavCustomColors"),
  settingsNavColors: document.getElementById("settingsNavColors"),
  settingsNavBarBgColor: document.getElementById("settingsNavBarBgColor"),
  settingsNavBarBorderColor: document.getElementById("settingsNavBarBorderColor"),
  settingsNavButtonBgColor: document.getElementById("settingsNavButtonBgColor"),
  settingsNavButtonBorderColor: document.getElementById("settingsNavButtonBorderColor"),
  settingsNavTabIdleColor: document.getElementById("settingsNavTabIdleColor"),
  settingsNavTabActiveColor: document.getElementById("settingsNavTabActiveColor"),
  settingsNavHomeIdleColor: document.getElementById("settingsNavHomeIdleColor"),
  settingsNavHomeActiveColor: document.getElementById("settingsNavHomeActiveColor"),
  settingsNavColorHint: document.getElementById("settingsNavColorHint"),
  settingsPageTransition: document.getElementById("settingsPageTransition"),
  settingsPageTransitionMs: document.getElementById("settingsPageTransitionMs"),
  settingsPageTransitionHint: document.getElementById("settingsPageTransitionHint"),
  settingsPageTarget: document.getElementById("settingsPageTarget"),
  reloadPagesBtn: document.getElementById("reloadPagesBtn"),
  showPageOnPanelBtn: document.getElementById("showPageOnPanelBtn"),
  applyPagesBtn: document.getElementById("applyPagesBtn"),
  settingsPagesInfo: document.getElementById("settingsPagesInfo"),
  settingsPageActivateInfo: document.getElementById("settingsPageActivateInfo"),
  downloadBackupBtn: document.getElementById("downloadBackupBtn"),
  settingsBackupFile: document.getElementById("settingsBackupFile"),
  restoreBackupBtn: document.getElementById("restoreBackupBtn"),
  settingsBackupInfo: document.getElementById("settingsBackupInfo"),
  settingsWallpaperFile: document.getElementById("settingsWallpaperFile"),
  uploadWallpaperBtn: document.getElementById("uploadWallpaperBtn"),
  removeWallpaperBtn: document.getElementById("removeWallpaperBtn"),
  settingsWallpaperInfo: document.getElementById("settingsWallpaperInfo"),
  applyDisplayBtn: document.getElementById("applyDisplayBtn"),
  settingsDisplayInfo: document.getElementById("settingsDisplayInfo"),
  settingsSdEnabled: document.getElementById("settingsSdEnabled"),
  settingsSdStatus: document.getElementById("settingsSdStatus"),
  settingsSdInfo: document.getElementById("settingsSdInfo"),
  sdRefreshBtn: document.getElementById("sdRefreshBtn"),
  sdExportLogsBtn: document.getElementById("sdExportLogsBtn"),
  sdFormatBtn: document.getElementById("sdFormatBtn"),
  sdUpBtn: document.getElementById("sdUpBtn"),
  sdRootBtn: document.getElementById("sdRootBtn"),
  sdLogsBtn: document.getElementById("sdLogsBtn"),
  sdPhotosBtn: document.getElementById("sdPhotosBtn"),
  sdPath: document.getElementById("sdPath"),
  sdFileList: document.getElementById("sdFileList"),
  sdWallpaperStore: document.getElementById("sdWallpaperStore"),
  settingsMqttEnabled: document.getElementById("settingsMqttEnabled"),
  settingsMqttUseTls: document.getElementById("settingsMqttUseTls"),
  settingsMqttTlsHint: document.getElementById("settingsMqttTlsHint"),
  settingsMqttHost: document.getElementById("settingsMqttHost"),
  settingsMqttPort: document.getElementById("settingsMqttPort"),
  settingsMqttUsername: document.getElementById("settingsMqttUsername"),
  settingsMqttPassword: document.getElementById("settingsMqttPassword"),
  settingsMqttDiscoveryPrefix: document.getElementById("settingsMqttDiscoveryPrefix"),
  applyMqttBtn: document.getElementById("applyMqttBtn"),
  settingsMqttInfo: document.getElementById("settingsMqttInfo"),
  settingsUiInfo: document.getElementById("settingsUiInfo"),
  settingsApInfo: document.getElementById("settingsApInfo"),
  settingsOtaUrl: document.getElementById("settingsOtaUrl"),
  startOtaUrlBtn: document.getElementById("startOtaUrlBtn"),
  refreshOtaStatusBtn: document.getElementById("refreshOtaStatusBtn"),
  settingsOtaFile: document.getElementById("settingsOtaFile"),
  uploadOtaBtn: document.getElementById("uploadOtaBtn"),
  settingsOtaProgressBar: document.getElementById("settingsOtaProgressBar"),
  settingsOtaInfo: document.getElementById("settingsOtaInfo"),
  settingsAutoRestartEnabled: document.getElementById("settingsAutoRestartEnabled"),
  settingsAutoRestartHours: document.getElementById("settingsAutoRestartHours"),
  settingsSystemInfo: document.getElementById("settingsSystemInfo"),
  settingsLogsViewer: document.getElementById("settingsLogsViewer"),
  logsRefreshBtn: document.getElementById("logsRefreshBtn"),
  logsPauseBtn: document.getElementById("logsPauseBtn"),
  logsClearBtn: document.getElementById("logsClearBtn"),
  logsAutoScroll: document.getElementById("logsAutoScroll"),
  logsMeta: document.getElementById("logsMeta"),
  logsDownloadLink: document.getElementById("logsDownloadLink"),
  diagnosticsRefreshBtn: document.getElementById("diagnosticsRefreshBtn"),
  diagnosticsAutoRefresh: document.getElementById("diagnosticsAutoRefresh"),
  diagnosticsMeta: document.getElementById("diagnosticsMeta"),
  diagnosticsGrid: document.getElementById("diagnosticsGrid"),
  reloadSettingsBtn: document.getElementById("reloadSettingsBtn"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  provWifiSsid: document.getElementById("provWifiSsid"),
  provWifiCountryCode: document.getElementById("provWifiCountryCode"),
  provScanWifiBtn: document.getElementById("provScanWifiBtn"),
  provWifiScanResults: document.getElementById("provWifiScanResults"),
  provWifiScanInfo: document.getElementById("provWifiScanInfo"),
  provWifiPassword: document.getElementById("provWifiPassword"),
  provWifiShowPassword: document.getElementById("provWifiShowPassword"),
  provWifiInfo: document.getElementById("provWifiInfo"),
  provWifiSaveBtn: document.getElementById("provWifiSaveBtn"),
  provHaUrl: document.getElementById("provHaUrl"),
  provHaToken: document.getElementById("provHaToken"),
  provHaShowToken: document.getElementById("provHaShowToken"),
  provHaInfo: document.getElementById("provHaInfo"),
  provHaSaveBtn: document.getElementById("provHaSaveBtn"),
  setupWizardOverlay: document.getElementById("setupWizardOverlay"),
  setupWizardTitle: document.getElementById("setupWizardTitle"),
  setupWizardCloseBtn: document.getElementById("setupWizardCloseBtn"),
  setupWizardStepHa: document.getElementById("setupWizardStepHa"),
  setupWizardStepTiles: document.getElementById("setupWizardStepTiles"),
  setupWizardStepSave: document.getElementById("setupWizardStepSave"),
  setupWizardSubtitle: document.getElementById("setupWizardSubtitle"),
  setupWizardPageTitle: document.getElementById("setupWizardPageTitle"),
  setupWizardCount: document.getElementById("setupWizardCount"),
  setupWizardStatus: document.getElementById("setupWizardStatus"),
  setupWizardAddLightBtn: document.getElementById("setupWizardAddLightBtn"),
  setupWizardAddHeatingBtn: document.getElementById("setupWizardAddHeatingBtn"),
  setupWizardAddWeatherBtn: document.getElementById("setupWizardAddWeatherBtn"),
  setupWizardAddButtonBtn: document.getElementById("setupWizardAddButtonBtn"),
  setupWizardAddSensorBtn: document.getElementById("setupWizardAddSensorBtn"),
  setupWizardSkipBtn: document.getElementById("setupWizardSkipBtn"),
  setupWizardSaveBtn: document.getElementById("setupWizardSaveBtn"),
  setupWizardDoneBtn: document.getElementById("setupWizardDoneBtn"),
};

const entityAutocomplete = {
  primary: {
    timerId: null,
    requestSeq: 0,
  },
  secondary: {
    timerId: null,
    requestSeq: 0,
  },
};

function normalizeSliderDirection(value) {
  return SLIDER_DIRECTIONS.has(value) ? value : DEFAULT_SLIDER_DIRECTION;
}

function normalizeSliderEntityDomain(value) {
  return SLIDER_ENTITY_DOMAINS.has(value) ? value : DEFAULT_SLIDER_ENTITY_DOMAIN;
}

function normalizeButtonMode(value) {
  return BUTTON_MODES.has(value) ? value : DEFAULT_BUTTON_MODE;
}

function buttonModeRequiresMediaPlayer(value) {
  const mode = normalizeButtonMode(value);
  return mode === "play_pause" || mode === "stop" || mode === "next" || mode === "previous";
}

function normalizeButtonStyle(value) {
  return BUTTON_STYLES.has(value) ? value : DEFAULT_BUTTON_STYLE;
}

function normalizeBinaryText(value) {
  return typeof value === "string" ? value : "";
}

const ALARM_MODES = new Set(["away", "home", "night", "vacation", "custom", "disarm"]);
const ALARM_BACKENDS = new Set(["auto", "alarmo", "builtin"]);
const DEFAULT_ALARM_MODES = "away,home,night,disarm";

function normalizeAlarmCode(value) {
  const source = typeof value === "string" ? value.trim() : "";
  return source.slice(0, 24);
}

function normalizeAlarmBackend(value) {
  const source = typeof value === "string" ? value.trim().toLowerCase() : "";
  return ALARM_BACKENDS.has(source) ? source : "auto";
}

function normalizeAlarmZoneLabel(value) {
  const source = typeof value === "string" ? value.trim() : "";
  return source.slice(0, 63);
}

function normalizeAlarmModes(value) {
  const source = typeof value === "string" ? value : "";
  const modes = source
    .split(/[,;\s]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => ALARM_MODES.has(entry));
  const unique = [...new Set(modes)];
  return unique.length > 0 ? unique.join(",") : DEFAULT_ALARM_MODES;
}

function alarmModeInputs() {
  if (!el.fAlarmModes) return [];
  return Array.from(el.fAlarmModes.querySelectorAll("input[data-alarm-mode]"));
}

/* Language neutral preview of the clock in the editor canvas. */
function clockPreviewState() {
  return "12:34";
}

function resetClockInspectorFields() {
  if (el.fClockShowSeconds) el.fClockShowSeconds.checked = false;
  if (el.fClockShowDate) el.fClockShowDate.checked = true;
}

function normalizeBoolDefaultTrue(value) {
  return value === false ? false : true;
}

function normalizeHexColor(value, fallback = DEFAULT_SLIDER_ACCENT_COLOR) {
  const source = (typeof value === "string" ? value : "").trim();
  const fallbackNorm = typeof fallback === "string" ? fallback.trim().toLowerCase() : DEFAULT_SLIDER_ACCENT_COLOR;
  if (!source) return fallbackNorm;

  let hex = source.toLowerCase();
  if (hex.startsWith("0x")) {
    hex = `#${hex.slice(2)}`;
  }
  if (!hex.startsWith("#")) {
    hex = `#${hex}`;
  }

  if (/^#[0-9a-f]{6}$/.test(hex)) {
    return hex;
  }
  return fallbackNorm;
}

function normalizeGraphPointCount(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string" && value.trim() === "") return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;

  const rounded = Math.round(parsed);
  if (rounded <= 0) return 0;
  return clamp(rounded, GRAPH_POINTS_MIN, GRAPH_POINTS_MAX);
}

function normalizeGraphTimeWindowMin(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_GRAPH_TIME_WINDOW_MIN;
  const rounded = Math.round(parsed);
  if (rounded <= 0) return DEFAULT_GRAPH_TIME_WINDOW_MIN;
  return clamp(rounded, GRAPH_TIME_WINDOW_MIN, GRAPH_TIME_WINDOW_MAX);
}

function normalizeGraphDisplayMode(value) {
  if (typeof value === "string" && GRAPH_DISPLAY_MODES.includes(value)) {
    return value;
  }
  return DEFAULT_GRAPH_DISPLAY_MODE;
}

function normalizeGraphBarBucketMin(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_GRAPH_BAR_BUCKET_MIN;
  const rounded = Math.round(parsed);
  if (GRAPH_BAR_BUCKET_MIN_OPTIONS.includes(rounded)) return rounded;
  return DEFAULT_GRAPH_BAR_BUCKET_MIN;
}

/* --- Per-tile visual overrides (mirrors main/ui/ui_tile_style.h) -------------- */

const TILE_LOOK_COLOR_KEYS = [
  "tile_bg_color",
  "tile_bg_grad_color",
  "tile_border_color",
  "tile_text_color",
  "tile_title_color",
  "tile_label_color",
  "tile_value_color",
  "tile_icon_color",
];
const TILE_LOOK_GRAD_DIRS = ["none", "hor", "ver"];
const TILE_LOOK_FONT_SCALES = ["auto", "s", "m", "l", "xl"];
const TILE_LOOK_INT_KEYS = [
  ["tile_border_width", 0, 16],
  ["tile_radius", 0, 128],
  ["tile_opacity", 0, 100],
];
const TILE_LOOK_PRESETS = {
  auto: {},
  graphite: {
    tile_bg_color: "#1a1f27",
    tile_bg_grad_color: "#0d1117",
    tile_bg_grad_dir: "ver",
    tile_border_color: "#313a45",
    tile_border_width: 1,
    tile_radius: 14,
    tile_opacity: 100,
    tile_text_color: "#c9d1d9",
    tile_title_color: "#e6edf3",
    tile_label_color: "#8b949e",
    tile_value_color: "#ffffff",
    tile_icon_color: "#8b949e",
    tile_font_scale: "auto",
  },
  emerald: {
    tile_bg_color: "#0f2a22",
    tile_bg_grad_color: "#07130f",
    tile_bg_grad_dir: "ver",
    tile_border_color: "#2ecc9a",
    tile_border_width: 1,
    tile_radius: 16,
    tile_opacity: 100,
    tile_text_color: "#d8f7ec",
    tile_title_color: "#7dffcf",
    tile_label_color: "#8fd9c1",
    tile_value_color: "#ffffff",
    tile_icon_color: "#3ddba6",
    tile_font_scale: "m",
  },
  amber: {
    tile_bg_color: "#2a1d0a",
    tile_bg_grad_color: "#150e04",
    tile_bg_grad_dir: "ver",
    tile_border_color: "#ffb648",
    tile_border_width: 2,
    tile_radius: 12,
    tile_opacity: 100,
    tile_text_color: "#ffeeda",
    tile_title_color: "#ffc978",
    tile_label_color: "#e0b483",
    tile_value_color: "#ffffff",
    tile_icon_color: "#ffa726",
    tile_font_scale: "l",
  },
  violet: {
    tile_bg_color: "#211a35",
    tile_bg_grad_color: "#0f0a1c",
    tile_bg_grad_dir: "ver",
    tile_border_color: "#a37bff",
    tile_border_width: 1,
    tile_radius: 18,
    tile_opacity: 100,
    tile_text_color: "#ece6ff",
    tile_title_color: "#c9b6ff",
    tile_label_color: "#a99ccf",
    tile_value_color: "#ffffff",
    tile_icon_color: "#b794ff",
    tile_font_scale: "m",
  },
  sky: {
    tile_bg_color: "#143a63",
    tile_bg_grad_color: "#0b2038",
    tile_bg_grad_dir: "ver",
    tile_border_color: "#4f9dff",
    tile_border_width: 1,
    tile_radius: 16,
    tile_opacity: 100,
    tile_text_color: "#e8f1f8",
    tile_title_color: "#cfe6ff",
    tile_label_color: "#9fc0e0",
    tile_value_color: "#ffffff",
    tile_icon_color: "#6fb6ff",
    tile_font_scale: "m",
  },
  glass: {
    tile_bg_color: "#22303d",
    tile_bg_grad_color: "#16202b",
    tile_bg_grad_dir: "hor",
    tile_border_color: "#5a7d99",
    tile_border_width: 1,
    tile_radius: 20,
    tile_opacity: 60,
    tile_text_color: "#eaf4ff",
    tile_title_color: "#ffffff",
    tile_label_color: "#a9c0d3",
    tile_value_color: "#ffffff",
    tile_icon_color: "#9fd8ff",
    tile_font_scale: "auto",
  },
};

/* Corner shape presets: value = tile_radius in px (LVGL clamps the radius to
   half of the smaller side, so a square tile + max radius becomes a circle). */
const TILE_CORNER_SHAPES = {
  square: 0,
  soft: 10,
  rounded: 16,
  pill: 40,
  circle: 128,
};

function tileCornerShapeKey(radius) {
  const value = normalizeTileIntField(radius, 0, 128);
  if (value === "") return "custom";
  for (const [key, px] of Object.entries(TILE_CORNER_SHAPES)) {
    if (px === value) return key;
  }
  return "custom";
}

function applyTileCornerShape(shapeKey) {
  const radius = TILE_CORNER_SHAPES[shapeKey];
  if (radius === undefined || !el.fTileRadius) return;
  el.fTileRadius.value = String(radius);
  autoApplyInspector({ softEntityValidation: true });
}

function syncTileCornerShapeSelect() {
  if (!el.fTileCornerShape) return;
  const radius = el.fTileRadius ? el.fTileRadius.value : "";
  el.fTileCornerShape.value = tileCornerShapeKey(radius);
}

function normalizeTileColorValue(value) {
  return normalizeHexColor(value, "");
}

function normalizeTileGradDir(value) {
  const source = (typeof value === "string" ? value : "").trim().toLowerCase();
  return TILE_LOOK_GRAD_DIRS.includes(source) ? source : "";
}

function normalizeTileFontScale(value) {
  const source = (typeof value === "string" ? value : "").trim().toLowerCase();
  return TILE_LOOK_FONT_SCALES.includes(source) ? source : "";
}

function normalizeTileIntField(value, min, max) {
  if (value === null || value === undefined || value === "") return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function normalizeTileLook(widget) {
  if (!widget || typeof widget !== "object") return;
  for (const key of TILE_LOOK_COLOR_KEYS) {
    const value = normalizeTileColorValue(widget[key]);
    if (value) {
      widget[key] = value;
    } else {
      delete widget[key];
    }
  }
  const gradDir = normalizeTileGradDir(widget.tile_bg_grad_dir);
  if (gradDir && gradDir !== "none") {
    widget.tile_bg_grad_dir = gradDir;
  } else {
    delete widget.tile_bg_grad_dir;
  }
  const fontScale = normalizeTileFontScale(widget.tile_font_scale);
  if (fontScale && fontScale !== "auto") {
    widget.tile_font_scale = fontScale;
  } else {
    delete widget.tile_font_scale;
  }
  for (const [key, min, max] of TILE_LOOK_INT_KEYS) {
    const value = normalizeTileIntField(widget[key], min, max);
    if (value === "") {
      delete widget[key];
    } else {
      widget[key] = value;
    }
  }
  if (widget.tile_shadow === true) {
    widget.tile_shadow = true;
  } else {
    delete widget.tile_shadow;
  }
}

const TILE_LOOK_KEYS = [
  ...TILE_LOOK_COLOR_KEYS,
  "tile_bg_grad_dir",
  "tile_font_scale",
  ...TILE_LOOK_INT_KEYS.map(([key]) => key),
  "tile_shadow",
];

function tileLookColorFields() {
  return [
    ["tile_bg_color", el.fTileBgColor, el.fTileBgColorPick],
    ["tile_bg_grad_color", el.fTileBgGradColor, el.fTileBgGradColorPick],
    ["tile_border_color", el.fTileBorderColor, el.fTileBorderColorPick],
    ["tile_text_color", el.fTileTextColor, el.fTileTextColorPick],
    ["tile_title_color", el.fTileTitleColor, el.fTileTitleColorPick],
    ["tile_label_color", el.fTileLabelColor, el.fTileLabelColorPick],
    ["tile_value_color", el.fTileValueColor, el.fTileValueColorPick],
    ["tile_icon_color", el.fTileIconColor, el.fTileIconColorPick],
  ];
}

function setTileColorField(textInput, colorInput, value) {
  const hex = normalizeTileColorValue(value);
  if (textInput) {
    textInput.value = hex;
  }
  if (colorInput) {
    if (!colorInput.dataset.autoColor) {
      colorInput.dataset.autoColor = colorInput.value;
    }
    colorInput.value = hex || colorInput.dataset.autoColor;
  }
}

function renderTileLookInspector(widget) {
  for (const [key, textInput, colorInput] of tileLookColorFields()) {
    setTileColorField(textInput, colorInput, widget ? widget[key] : "");
  }
  if (el.fTileBgGradDir) {
    el.fTileBgGradDir.value = (widget && normalizeTileGradDir(widget.tile_bg_grad_dir)) || "none";
  }
  if (el.fTileFontScale) {
    el.fTileFontScale.value = (widget && normalizeTileFontScale(widget.tile_font_scale)) || "auto";
  }
  if (el.fTileBorderWidth) {
    el.fTileBorderWidth.value = widget ? normalizeTileIntField(widget.tile_border_width, 0, 16) : "";
  }
  if (el.fTileRadius) {
    el.fTileRadius.value = widget ? normalizeTileIntField(widget.tile_radius, 0, 128) : "";
  }
  if (el.fTileCornerShape) {
    el.fTileCornerShape.value = tileCornerShapeKey(widget ? widget.tile_radius : "");
  }
  if (el.fTileOpacity) {
    el.fTileOpacity.value = widget ? normalizeTileIntField(widget.tile_opacity, 0, 100) : "";
  }
  if (el.fTileShadow) {
    el.fTileShadow.checked = !!(widget && widget.tile_shadow === true);
  }
  if (el.fTilePreset) {
    el.fTilePreset.value = "auto";
  }
  renderTileLookCopyOptions(widget);
}

function applyTileLookFromInspector(widget) {
  if (!widget) return;
  for (const [key, textInput] of tileLookColorFields()) {
    const value = normalizeTileColorValue(textInput?.value);
    if (value) {
      widget[key] = value;
    } else {
      delete widget[key];
    }
  }
  const gradDir = normalizeTileGradDir(el.fTileBgGradDir?.value);
  if (gradDir && gradDir !== "none") {
    widget.tile_bg_grad_dir = gradDir;
  } else {
    delete widget.tile_bg_grad_dir;
  }
  const fontScale = normalizeTileFontScale(el.fTileFontScale?.value);
  if (fontScale && fontScale !== "auto") {
    widget.tile_font_scale = fontScale;
  } else {
    delete widget.tile_font_scale;
  }
  const borderWidth = normalizeTileIntField(el.fTileBorderWidth?.value, 0, 16);
  if (borderWidth === "") {
    delete widget.tile_border_width;
  } else {
    widget.tile_border_width = borderWidth;
  }
  const radius = normalizeTileIntField(el.fTileRadius?.value, 0, 128);
  if (radius === "") {
    delete widget.tile_radius;
  } else {
    widget.tile_radius = radius;
  }
  const opacity = normalizeTileIntField(el.fTileOpacity?.value, 0, 100);
  if (opacity === "") {
    delete widget.tile_opacity;
  } else {
    widget.tile_opacity = opacity;
  }
  if (el.fTileShadow?.checked) {
    widget.tile_shadow = true;
  } else {
    delete widget.tile_shadow;
  }
}

function clearTileLookInspector() {
  for (const [, textInput, colorInput] of tileLookColorFields()) {
    setTileColorField(textInput, colorInput, "");
  }
  if (el.fTileBgGradDir) el.fTileBgGradDir.value = "none";
  if (el.fTileFontScale) el.fTileFontScale.value = "auto";
  if (el.fTileBorderWidth) el.fTileBorderWidth.value = "";
  if (el.fTileRadius) el.fTileRadius.value = "";
  if (el.fTileCornerShape) el.fTileCornerShape.value = "custom";
  if (el.fTileOpacity) el.fTileOpacity.value = "";
  if (el.fTileShadow) el.fTileShadow.checked = false;
  if (el.fTilePreset) el.fTilePreset.value = "auto";
  renderTileLookCopyOptions(null);
}

function applyTileLookPreset(presetKey) {
  const preset = TILE_LOOK_PRESETS[presetKey];
  if (!preset) return;
  for (const [key, textInput, colorInput] of tileLookColorFields()) {
    setTileColorField(textInput, colorInput, preset[key]);
  }
  if (el.fTileBgGradDir) el.fTileBgGradDir.value = preset.tile_bg_grad_dir || "none";
  if (el.fTileFontScale) el.fTileFontScale.value = preset.tile_font_scale || "auto";
  if (el.fTileBorderWidth) el.fTileBorderWidth.value = preset.tile_border_width ?? "";
  if (el.fTileRadius) el.fTileRadius.value = preset.tile_radius ?? "";
  if (el.fTileCornerShape) el.fTileCornerShape.value = tileCornerShapeKey(preset.tile_radius ?? "");
  if (el.fTileOpacity) el.fTileOpacity.value = preset.tile_opacity ?? "";
  if (el.fTileShadow) el.fTileShadow.checked = preset.tile_shadow === true;
  applyTileLookFromInspector(selectedWidget());
  if (el.fTilePreset) el.fTilePreset.value = "auto";
  renderInspectorChange(false);
}

function tileLookSnapshot(widget) {
  const snapshot = {};
  if (!widget) return snapshot;
  for (const key of TILE_LOOK_KEYS) {
    if (Object.prototype.hasOwnProperty.call(widget, key)) {
      snapshot[key] = widget[key];
    }
  }
  return snapshot;
}

function applyTileLookSnapshot(widget, snapshot) {
  if (!widget) return;
  for (const key of TILE_LOOK_KEYS) {
    delete widget[key];
  }
  for (const key of TILE_LOOK_KEYS) {
    if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
      widget[key] = snapshot[key];
    }
  }
  normalizeTileLook(widget);
}

function tileLookCopyCandidates(targetWidget) {
  const candidates = [];
  const pages = editor.layout && Array.isArray(editor.layout.pages) ? editor.layout.pages : [];
  for (const page of pages) {
    if (!page || !Array.isArray(page.widgets)) continue;
    for (const widget of page.widgets) {
      if (!widget || typeof widget !== "object" || !widget.id) continue;
      if (targetWidget && widget.id === targetWidget.id) continue;
      candidates.push({ widget, page });
    }
  }
  return candidates;
}

function tileLookCopyLabel(widget, page) {
  const title = (widget.title || "").trim();
  const typeLabel = widget.type ? ` · ${widget.type}` : "";
  const pageTitle = (page && (page.title || page.id)) || "";
  const name = title.length ? title : (widget.id || widget.type);
  return pageTitle.length ? `${name}${typeLabel} — ${pageTitle}` : `${name}${typeLabel}`;
}

function renderTileLookCopyOptions(targetWidget) {
  const select = el.fTileCopySource;
  if (!select) return;
  const candidates = tileLookCopyCandidates(targetWidget);
  const previous = select.value;
  select.textContent = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = candidates.length
    ? t("layout.tile_look.copy_placeholder")
    : t("layout.tile_look.copy_empty");
  select.appendChild(placeholder);
  for (const { widget, page } of candidates) {
    const option = document.createElement("option");
    option.value = widget.id;
    option.textContent = tileLookCopyLabel(widget, page);
    select.appendChild(option);
  }
  if (previous && candidates.some(({ widget }) => widget.id === previous)) {
    select.value = previous;
  }
  select.disabled = !targetWidget || candidates.length === 0;
  if (el.tileLookCopyBtn) {
    el.tileLookCopyBtn.disabled = !targetWidget || candidates.length === 0;
  }
  if (el.tileLookCopyPageBtn) {
    el.tileLookCopyPageBtn.disabled = !targetWidget;
  }
}

function copyTileLookFromSource() {
  const target = selectedWidget();
  if (!target) return;
  const sourceId = el.fTileCopySource ? el.fTileCopySource.value : "";
  const source = tileLookCopyCandidates(target).find(({ widget }) => widget.id === sourceId);
  if (!source) {
    setStatus(t("layout.tile_look.copy_none"), true);
    return;
  }
  applyTileLookSnapshot(target, tileLookSnapshot(source.widget));
  renderTileLookInspector(target);
  if (autoApplyInspector({ softEntityValidation: true }) !== false) {
    setStatus(t("layout.tile_look.copy_done", { source: tileLookCopyLabel(source.widget, source.page) }));
  }
}

function applyTileLookToPage() {
  const target = selectedWidget();
  const page = selectedPage();
  if (!target || !page || !Array.isArray(page.widgets)) return;
  const snapshot = tileLookSnapshot(target);
  let count = 0;
  for (const widget of page.widgets) {
    if (!widget || widget.id === target.id) continue;
    applyTileLookSnapshot(widget, snapshot);
    count += 1;
  }
  renderAll();
  setStatus(t("layout.tile_look.copy_page_done", { count }));
}

function bindTileColorPair(textInput, colorInput) {
  if (!colorInput) return;
  if (!colorInput.dataset.autoColor) {
    colorInput.dataset.autoColor = colorInput.value;
  }
  if (textInput) {
    const syncFromText = () => {
      const value = normalizeTileColorValue(textInput.value);
      if (value) {
        colorInput.value = value;
      }
    };
    textInput.addEventListener("input", syncFromText);
    textInput.addEventListener("change", () => {
      const value = normalizeTileColorValue(textInput.value);
      textInput.value = value;
      colorInput.value = value || colorInput.dataset.autoColor;
    });
  }
  colorInput.addEventListener("input", () => {
    if (textInput) {
      textInput.value = colorInput.value.toUpperCase();
    }
  });
  colorInput.addEventListener("change", () => {
    if (textInput) {
      textInput.value = colorInput.value.toUpperCase();
    }
    autoApplyInspector({ softEntityValidation: true });
  });
}

function tileLookPreviewColor(widget, colorKey, fallback) {
  return normalizeTileColorValue(widget[colorKey]) || fallback;
}

function applyTileLookPreview(box, widget) {
  if (!box || !widget) return;
  const bg = normalizeTileColorValue(widget.tile_bg_color);
  const grad = normalizeTileColorValue(widget.tile_bg_grad_color);
  const gradDir = normalizeTileGradDir(widget.tile_bg_grad_dir);
  const opacity = normalizeTileIntField(widget.tile_opacity, 0, 100);
  const alpha = opacity === "" ? 1 : opacity / 100;
  const withAlpha = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  if (bg && grad && gradDir && gradDir !== "none") {
    const angle = gradDir === "hor" ? "90deg" : "180deg";
    box.style.background = `linear-gradient(${angle}, ${withAlpha(bg)}, ${withAlpha(grad)})`;
  } else if (bg) {
    box.style.background = withAlpha(bg);
  } else if (opacity !== "" && opacity < 100) {
    box.style.opacity = String(alpha);
  }
  const border = normalizeTileColorValue(widget.tile_border_color);
  const borderWidth = normalizeTileIntField(widget.tile_border_width, 0, 16);
  if (borderWidth !== "") box.style.borderWidth = `${borderWidth}px`;
  if (border) box.style.borderColor = border;
  const radius = normalizeTileIntField(widget.tile_radius, 0, 128);
  if (radius !== "") box.style.borderRadius = `${radius}px`;

  const textColor = normalizeTileColorValue(widget.tile_text_color);
  const roles = [
    [".w-title", tileLookPreviewColor(widget, "tile_title_color", textColor)],
    [".w-state", tileLookPreviewColor(widget, "tile_value_color", textColor)],
    [".w-type", tileLookPreviewColor(widget, "tile_label_color", textColor)],
  ];
  const fontScale = normalizeTileFontScale(widget.tile_font_scale);
  const scale = fontScale === "s" ? 0.85 : fontScale === "l" ? 1.2 : fontScale === "xl" ? 1.4 : 1;
  for (const [selector, color] of roles) {
    const node = box.querySelector(selector);
    if (!node) continue;
    if (color) node.style.color = color;
    if (scale !== 1) node.style.fontSize = `${scale}em`;
  }
  if (widget.tile_shadow === true) {
    box.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.55)";
  }
}

/* ---------------------------------------------------------------- page look */
/* Per-page background, stored on the page object itself:
 *   page_bg_color / page_bg_grad_color  "#RRGGBB" ("" = panel background)
 *   page_bg_grad_dir                    "none" | "hor" | "ver"
 *   page_wallpaper                      true = paint the panel wallpaper
 *   page_dim                            0..90 % darkening of that wallpaper */
const PAGE_LOOK_COLOR_KEYS = ["page_bg_color", "page_bg_grad_color"];
const PAGE_LOOK_KEYS = [...PAGE_LOOK_COLOR_KEYS, "page_bg_grad_dir", "page_wallpaper", "page_dim", "page_theme"];
const PAGE_LOOK_GRAD_DIRS = ["none", "hor", "ver"];
const PAGE_LOOK_DIM_MAX = 90;

const PAGE_LOOK_PRESETS = {
  auto: {},
  midnight: { page_bg_color: "#0d1826", page_bg_grad_color: "#1b2f45", page_bg_grad_dir: "ver" },
  deep_sea: { page_bg_color: "#062a3a", page_bg_grad_color: "#0f5c73", page_bg_grad_dir: "ver" },
  forest: { page_bg_color: "#0e2418", page_bg_grad_color: "#1d4a2e", page_bg_grad_dir: "ver" },
  sunset: { page_bg_color: "#3a1420", page_bg_grad_color: "#8a3a1f", page_bg_grad_dir: "hor" },
  plum: { page_bg_color: "#221331", page_bg_grad_color: "#4a2360", page_bg_grad_dir: "ver" },
  wallpaper: { page_wallpaper: true, page_dim: 0 },
  wallpaper_dim: { page_wallpaper: true, page_dim: 45 },
};

function normalizePageGradDir(value) {
  const source = (typeof value === "string" ? value : "").trim().toLowerCase();
  return PAGE_LOOK_GRAD_DIRS.includes(source) ? source : "none";
}

function normalizePageLook(page) {
  if (!page || typeof page !== "object") return;
  for (const key of PAGE_LOOK_COLOR_KEYS) {
    const value = normalizeTileColorValue(page[key]);
    if (value) {
      page[key] = value;
    } else {
      delete page[key];
    }
  }
  const gradDir = normalizePageGradDir(page.page_bg_grad_dir);
  if (gradDir !== "none") {
    page.page_bg_grad_dir = gradDir;
  } else {
    delete page.page_bg_grad_dir;
  }
  if (page.page_wallpaper === true) {
    page.page_wallpaper = true;
  } else {
    delete page.page_wallpaper;
  }
  const dim = normalizeTileIntField(page.page_dim, 0, PAGE_LOOK_DIM_MAX);
  if (dim === "" || dim <= 0) {
    delete page.page_dim;
  } else {
    page.page_dim = dim;
  }
  /* page_theme: built-in preset id or a saved custom theme id. */
  const pageTheme = typeof page.page_theme === "string" ? page.page_theme.trim() : "";
  if (pageTheme && /^[A-Za-z0-9_-]{1,31}$/.test(pageTheme)) {
    page.page_theme = pageTheme;
  } else {
    delete page.page_theme;
  }
}

/* Everything the preview needs, or null when the page keeps the panel default. */
function pageLookStyle(page) {
  if (!page) return null;
  const bgColor = normalizeTileColorValue(page.page_bg_color);
  const gradColor = normalizeTileColorValue(page.page_bg_grad_color);
  const gradDir = normalizePageGradDir(page.page_bg_grad_dir);
  const wallpaper = page.page_wallpaper === true;
  if (!bgColor && !gradColor && !wallpaper) return null;
  const dim = normalizeTileIntField(page.page_dim, 0, PAGE_LOOK_DIM_MAX);
  return { bgColor, gradColor, gradDir, wallpaper, dim: dim === "" ? 0 : dim };
}

/* The panel keeps the wallpaper as a raw little endian RGB565 frame, so it is
   downloaded once, converted here and cached as a data URL for the preview. */
const pageLookWallpaper = { url: "", pending: false, failed: false };

function rgb565ToDataUrl(buffer, width, height) {
  const view = new DataView(buffer);
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, src = 0; i < pixels.length; i += 4, src += 2) {
    const value = view.getUint16(src, true);
    pixels[i] = (((value >> 11) & 0x1f) * 255 + 15) / 31;
    pixels[i + 1] = (((value >> 5) & 0x3f) * 255 + 31) / 63;
    pixels[i + 2] = ((value & 0x1f) * 255 + 15) / 31;
    pixels[i + 3] = 255;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").putImageData(new ImageData(pixels, width, height), 0, 0);
  return canvas.toDataURL("image/png");
}

async function loadPageLookWallpaper() {
  if (pageLookWallpaper.url || pageLookWallpaper.pending || pageLookWallpaper.failed) return;
  const screenW = editor.appScreenW || CANVAS_WIDTH;
  const screenH = editor.appScreenH || CANVAS_HEIGHT;
  pageLookWallpaper.pending = true;
  try {
    const response = await fetch("/api/display/wallpaper", { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status}`);
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength !== screenW * screenH * 2) throw new Error("unexpected wallpaper size");
    pageLookWallpaper.url = rgb565ToDataUrl(buffer, screenW, screenH);
  } catch (_) {
    pageLookWallpaper.failed = true;
  } finally {
    pageLookWallpaper.pending = false;
  }
  applyPageLookPreview(selectedPage());
}

function applyPageLookPreview(page) {
  if (!el.canvas) return;
  el.canvas.style.backgroundImage = "";
  el.canvas.style.backgroundColor = "";
  el.canvas.style.backgroundSize = "";
  el.canvas.style.backgroundPosition = "";
  el.canvas.style.backgroundRepeat = "";

  const style = pageLookStyle(page);
  if (!style) return;

  if (style.wallpaper) {
    const screenW = editor.appScreenW || CANVAS_WIDTH;
    const screenH = editor.appScreenH || CANVAS_HEIGHT;
    if (!pageLookWallpaper.url) {
      void loadPageLookWallpaper();
      el.canvas.style.backgroundColor = "#0d1826";
      el.canvas.style.backgroundImage =
        "repeating-linear-gradient(45deg, #14263a 0 12px, #10202e 12px 24px)";
      return;
    }
    /* The firmware crops the content box out of the middle of the screen. */
    const offsetY = Math.max(0, Math.round((screenH - CANVAS_HEIGHT) / 2));
    const shade = `rgba(0, 0, 0, ${style.dim / 100})`;
    el.canvas.style.backgroundColor = style.bgColor || "#000000";
    el.canvas.style.backgroundImage = `linear-gradient(${shade}, ${shade}), url("${pageLookWallpaper.url}")`;
    el.canvas.style.backgroundSize = `100% 100%, ${screenW}px ${screenH}px`;
    el.canvas.style.backgroundPosition = `0 0, 0 -${offsetY}px`;
    el.canvas.style.backgroundRepeat = "no-repeat, no-repeat";
    return;
  }

  const bg = style.bgColor || "#10202e";
  if (style.gradColor && style.gradDir !== "none") {
    const angle = style.gradDir === "hor" ? "90deg" : "180deg";
    el.canvas.style.backgroundImage = `linear-gradient(${angle}, ${bg}, ${style.gradColor})`;
  } else {
    el.canvas.style.backgroundColor = bg;
  }
}

function renderPageLookInspector(page) {
  if (!page) {
    clearPageLookInspector();
    return;
  }
  if (el.pageLookOptions) {
    el.pageLookOptions.classList.remove("hidden");
  }
  setTileColorField(el.fPageBgColor, el.fPageBgColorPick, page.page_bg_color);
  setTileColorField(el.fPageBgGradColor, el.fPageBgGradColorPick, page.page_bg_grad_color);
  if (el.fPageBgGradDir) {
    el.fPageBgGradDir.value = normalizePageGradDir(page.page_bg_grad_dir);
  }
  if (el.fPageWallpaper) {
    el.fPageWallpaper.checked = page.page_wallpaper === true;
  }
  if (el.fPageDim) {
    el.fPageDim.value = normalizeTileIntField(page.page_dim, 0, PAGE_LOOK_DIM_MAX);
  }
  if (el.fPageTheme) {
    pagePopulateThemeSelect();
    el.fPageTheme.value = typeof page.page_theme === "string" ? page.page_theme : "";
    if (el.fPageTheme.selectedIndex < 0) el.fPageTheme.value = "";
  }
  if (el.fPagePreset) {
    el.fPagePreset.value = "auto";
  }
}

function clearPageLookInspector() {
  if (el.pageLookOptions) {
    el.pageLookOptions.classList.add("hidden");
  }
  setTileColorField(el.fPageBgColor, el.fPageBgColorPick, "");
  setTileColorField(el.fPageBgGradColor, el.fPageBgGradColorPick, "");
  if (el.fPageBgGradDir) el.fPageBgGradDir.value = "none";
  if (el.fPageWallpaper) el.fPageWallpaper.checked = false;
  if (el.fPageDim) el.fPageDim.value = "";
  if (el.fPagePreset) el.fPagePreset.value = "auto";
}

/* Options for the per-page theme override: the theme list when it is already
 * loaded, otherwise just the "follow the global theme" entry. */
function pagePopulateThemeSelect() {
  const sel = el.fPageTheme;
  if (!sel) return;
  const wanted = sel.options.length > 0 ? sel.value || "" : "";
  sel.innerHTML = "";
  const none = document.createElement("option");
  none.value = "";
  none.textContent = t("layout.page_look.theme_none");
  sel.appendChild(none);
  for (const entry of themeState.list) {
    const opt = document.createElement("option");
    opt.value = entry.id;
    opt.textContent = themeAutoOptionLabel(entry);
    sel.appendChild(opt);
  }
  sel.value = wanted;
  if (sel.selectedIndex < 0) sel.value = "";
}

function applyPageLookFromInspector(page) {
  if (!page) return;
  for (const [key, textInput] of [
    ["page_bg_color", el.fPageBgColor],
    ["page_bg_grad_color", el.fPageBgGradColor],
  ]) {
    const value = normalizeTileColorValue(textInput?.value);
    if (value) {
      page[key] = value;
    } else {
      delete page[key];
    }
  }
  const gradDir = normalizePageGradDir(el.fPageBgGradDir?.value);
  if (gradDir !== "none") {
    page.page_bg_grad_dir = gradDir;
  } else {
    delete page.page_bg_grad_dir;
  }
  if (el.fPageWallpaper?.checked) {
    page.page_wallpaper = true;
  } else {
    delete page.page_wallpaper;
  }
  const dim = normalizeTileIntField(el.fPageDim?.value, 0, PAGE_LOOK_DIM_MAX);
  if (dim === "" || dim <= 0) {
    delete page.page_dim;
  } else {
    page.page_dim = dim;
  }
  const pageTheme = (el.fPageTheme?.value || "").trim();
  if (pageTheme) {
    page.page_theme = pageTheme;
  } else {
    delete page.page_theme;
  }
}

function applyPageLookPreset(presetKey) {
  const preset = PAGE_LOOK_PRESETS[presetKey];
  const page = selectedPage();
  if (!preset || !page) return;
  for (const key of PAGE_LOOK_KEYS) {
    delete page[key];
  }
  for (const [key, value] of Object.entries(preset)) {
    page[key] = value;
  }
  normalizePageLook(page);
  renderPageLookInspector(page);
  applyPageLookPreview(page);
}

function bindPageColorPair(textInput, colorInput) {
  if (!colorInput) return;
  if (!colorInput.dataset.autoColor) {
    colorInput.dataset.autoColor = colorInput.value;
  }
  const push = () => {
    const page = selectedPage();
    applyPageLookFromInspector(page);
    applyPageLookPreview(page);
  };
  if (textInput) {
    textInput.addEventListener("input", () => {
      const value = normalizeTileColorValue(textInput.value);
      if (value) colorInput.value = value;
      push();
    });
    textInput.addEventListener("change", () => {
      const value = normalizeTileColorValue(textInput.value);
      textInput.value = value;
      colorInput.value = value || colorInput.dataset.autoColor;
      push();
    });
  }
  colorInput.addEventListener("input", () => {
    if (textInput) textInput.value = colorInput.value.toUpperCase();
    push();
  });
}

function bindPageLookInputs() {
  bindPageColorPair(el.fPageBgColor, el.fPageBgColorPick);
  bindPageColorPair(el.fPageBgGradColor, el.fPageBgGradColorPick);
  const onSelectChange = (input) => input?.addEventListener("change", () => {
    const page = selectedPage();
    applyPageLookFromInspector(page);
    applyPageLookPreview(page);
  });
  onSelectChange(el.fPageBgGradDir);
  onSelectChange(el.fPageWallpaper);
  if (el.fPageDim) {
    const pushDim = () => {
      const page = selectedPage();
      applyPageLookFromInspector(page);
      applyPageLookPreview(page);
    };
    el.fPageDim.addEventListener("input", pushDim);
    el.fPageDim.addEventListener("change", () => {
      const page = selectedPage();
      applyPageLookFromInspector(page);
      renderPageLookInspector(page);
      applyPageLookPreview(page);
    });
  }
  if (el.fPagePreset) {
    el.fPagePreset.addEventListener("change", () => applyPageLookPreset(el.fPagePreset.value));
  }
  if (el.fPageTheme) {
    el.fPageTheme.addEventListener("change", () => {
      const page = selectedPage();
      applyPageLookFromInspector(page);
      applyPageLookPreview(page);
    });
  }
  if (el.pageLookResetBtn) {
    el.pageLookResetBtn.addEventListener("click", () => {
      const page = selectedPage();
      if (!page) return;
      for (const key of PAGE_LOOK_KEYS) {
        delete page[key];
      }
      renderPageLookInspector(page);
      applyPageLookPreview(page);
      setStatus(t("layout.page_look.reset_done"));
    });
  }
}

function normalizeLayoutWidgets(layout) {
  if (!layout || !Array.isArray(layout.pages)) return;
  for (const page of layout.pages) {
    normalizePageLook(page);
    if (isEnergyPage(page)) {
      normalizeEnergyConfig(page);
      continue;
    }
    if (isMusicPage(page)) {
      normalizeMusicConfig(page);
      continue;
    }
    if (!page || !Array.isArray(page.widgets)) continue;
    for (const widget of page.widgets) {
      if (!widget || typeof widget !== "object") continue;
      if (widget.type === "button") {
        widget.button_accent_color = normalizeHexColor(widget.button_accent_color, DEFAULT_BUTTON_ACCENT_COLOR);
        const buttonMode = normalizeButtonMode(widget.button_mode);
        if (buttonModeRequiresMediaPlayer(buttonMode) && !String(widget.entity_id || "").startsWith("media_player.")) {
          widget.button_mode = DEFAULT_BUTTON_MODE;
        } else {
          widget.button_mode = buttonMode;
        }
        const buttonStyle = normalizeButtonStyle(widget.style_variant);
        if (buttonModeRequiresMediaPlayer(widget.button_mode) || buttonStyle === "") {
          delete widget.style_variant;
        } else {
          widget.style_variant = buttonStyle;
        }
      }
      if (widget.type === "slider") {
        widget.slider_direction = normalizeSliderDirection(widget.slider_direction);
        widget.slider_accent_color = normalizeHexColor(widget.slider_accent_color, DEFAULT_SLIDER_ACCENT_COLOR);
        widget.slider_entity_domain = normalizeSliderEntityDomain(widget.slider_entity_domain);
      }
      if (widget.type === "graph") {
        widget.graph_line_color = normalizeHexColor(widget.graph_line_color, DEFAULT_GRAPH_LINE_COLOR);
        widget.graph_time_window_min = normalizeGraphTimeWindowMin(widget.graph_time_window_min);
        widget.graph_display_mode = normalizeGraphDisplayMode(widget.graph_display_mode);
        widget.graph_bar_bucket_min = normalizeGraphBarBucketMin(widget.graph_bar_bucket_min);
        const normalizedGraphPoints = normalizeGraphPointCount(widget.graph_point_count);
        if (normalizedGraphPoints > 0) {
          widget.graph_point_count = normalizedGraphPoints;
        } else {
          delete widget.graph_point_count;
        }
      }
      if (widget.type === "binary_sensor") {
        widget.binary_show_title = normalizeBoolDefaultTrue(widget.binary_show_title);
        widget.binary_text_on = normalizeBinaryText(widget.binary_text_on);
        widget.binary_text_off = normalizeBinaryText(widget.binary_text_off);
        widget.binary_color_on = normalizeHexColor(widget.binary_color_on, "");
        widget.binary_color_off = normalizeHexColor(widget.binary_color_off, "");
      }
      if (widget.type === "alarm_tile") {
        widget.alarm_code = normalizeAlarmCode(widget.alarm_code);
        widget.alarm_modes = normalizeAlarmModes(widget.alarm_modes);
        widget.alarm_ask_code = widget.alarm_ask_code === true;
        widget.alarm_backend = normalizeAlarmBackend(widget.alarm_backend);
        const zoneLabel = normalizeAlarmZoneLabel(widget.alarm_zone_label);
        if (zoneLabel) {
          widget.alarm_zone_label = zoneLabel;
        } else {
          delete widget.alarm_zone_label;
        }
        widget.alarm_show_sensors = normalizeBoolDefaultTrue(widget.alarm_show_sensors);
        widget.alarm_show_bypassed = normalizeBoolDefaultTrue(widget.alarm_show_bypassed);
        widget.alarm_force_arm = normalizeBoolDefaultTrue(widget.alarm_force_arm);
        widget.alarm_skip_delay = widget.alarm_skip_delay === true;
      }
      if (widget.type === "clock_alarm") {
        delete widget.clock_alarm_enabled;
        delete widget.clock_alarm_hour;
        delete widget.clock_alarm_minute;
        delete widget.clock_alarm_days;
        delete widget.clock_alarm_snooze_min;
        delete widget.clock_alarm_action;
        delete widget.clock_alarm_tone;
        delete widget.clock_alarm_entity;
        widget.clock_show_seconds = widget.clock_show_seconds === true;
        widget.clock_show_date = normalizeBoolDefaultTrue(widget.clock_show_date);
      }
      if (widget.type === "sensor") {
        widget.sensor_value_color = normalizeHexColor(widget.sensor_value_color, "");
      }
      normalizeTileLook(widget);
    }
  }
}

function setStatus(text, isError = false) {
  el.status.textContent = text;
  el.status.style.color = isError ? "#ff8f94" : "#9db0c3";
}

function getWifiScanUi(scope = "settings") {
  if (scope === "provisioning") {
    return {
      scanButton: el.provScanWifiBtn,
      ssidInput: el.provWifiSsid,
      resultsSelect: el.provWifiScanResults,
      info: el.provWifiScanInfo,
    };
  }

  return {
    scanButton: el.scanWifiBtn,
    ssidInput: el.settingsWifiSsid,
    resultsSelect: el.settingsWifiScanResults,
    info: el.settingsWifiScanInfo,
  };
}

function setWifiScanInfo(text, isError = false, scope = "settings") {
  const ui = getWifiScanUi(scope);
  if (!ui.info) return;
  ui.info.textContent = text;
  ui.info.classList.toggle("error", isError);
}

function setProvisioningInfo(stage, text, isError = false) {
  const target = stage === "wifi" ? el.provWifiInfo : el.provHaInfo;
  if (!target) return;
  target.textContent = text;
  target.classList.toggle("error", isError);
}

function normalizeCountryCode(value) {
  const normalized = (value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

function normalizeBssid(value) {
  const normalized = (value || "").trim().toUpperCase().replace(/-/g, ":");
  if (!normalized) return "";
  return /^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/.test(normalized) ? normalized : "";
}

function isValidIpv4(value) {
  const parts = String(value || "").trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function normalizeLanguageCode(value, fallback = "") {
  const normalized = (typeof value === "string" ? value : "").trim().toLowerCase();
  if (!normalized) return fallback;
  return LANGUAGE_CODE_RE.test(normalized) ? normalized : fallback;
}

function normalizeUiLanguage(value) {
  return normalizeLanguageCode(value, DEFAULT_UI_LANGUAGE);
}

function templateString(text, vars = {}) {
  return String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(vars, key)) return match;
    return String(vars[key]);
  });
}

function t(key, vars = {}, fallbackText = null) {
  const source = editor.i18nMap || {};
  const fallback = WEB_I18N_BUILTIN.en || {};
  const raw = source[key] ?? fallback[key] ?? fallbackText ?? key;
  return templateString(raw, vars);
}

function storageGet(key) {
  try {
    return window.localStorage?.getItem(key) || "";
  } catch (_) {
    return "";
  }
}

function storageSet(key, value) {
  try {
    window.localStorage?.setItem(key, value);
  } catch (_) {}
}

function storageRemove(key) {
  try {
    window.localStorage?.removeItem(key);
  } catch (_) {}
}

function flattenTranslationObject(obj, prefix = "", out = {}) {
  if (!obj || typeof obj !== "object") return out;
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenTranslationObject(value, path, out);
    } else if (typeof value === "string") {
      out[path] = value;
    }
  }
  return out;
}

function setTextById(id, key, vars) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = t(key, vars);
}

function setPlaceholderById(id, key, vars) {
  const node = document.getElementById(id);
  if (!node) return;
  node.placeholder = t(key, vars);
}

function renderAppVersion() {
  const version = typeof editor.appVersion === "string" ? editor.appVersion.trim() : "";
  if (el.appVersionLabel) {
    el.appVersionLabel.textContent = version;
    el.appVersionLabel.hidden = version.length === 0;
  }
  document.title = version
    ? `BETTA HA Panel - BETTA Editor ${version}`
    : "BETTA HA Panel - BETTA Editor";
}

async function loadAppVersion() {
  try {
    const payload = await apiGet("/api/version");
    document.getElementById("remoteTabBtn").classList.toggle("hidden", payload?.remote_display !== true);
    document.querySelector(".mode-tabs").classList.toggle("has-remote", payload?.remote_display === true);
    editor.appVersion = typeof payload?.version === "string" ? payload.version : "";
    editor.appProject = typeof payload?.project === "string" ? payload.project : "";
    editor.appScreenW = Number(payload?.screen_w) || 0;
    editor.appScreenH = Number(payload?.screen_h) || 0;
    applyCanvasGeometry(payload);
  } catch (_) {
    editor.appVersion = "";
    editor.appProject = "";
    editor.appScreenW = 0;
    editor.appScreenH = 0;
  }
  renderAppVersion();
  void refreshLatestOtaUrl();
}

function otaPanelVariant() {
  const project = (editor.appProject || "").toLowerCase();
  if (project.includes("10.1") || project.includes("panel10") || editor.appScreenW >= 1000) {
    return "panel10";
  }
  return "panel4";
}

function otaCurrentVersionTag() {
  const version = (editor.appVersion || "").trim();
  return /^v\d+\.\d+\.\d+/.test(version) ? version : "";
}

function otaLatestFallbackUrl() {
  const version = otaCurrentVersionTag();
  if (!version) return "";
  const variant = otaPanelVariant();
  return `https://github.com/${OTA_RELEASE_REPO}/releases/latest/download/betta86-ha-panel-${version}-${variant}.ota.bin`;
}

function applyLatestOtaUrl(url) {
  if (!url) return;
  const previousAuto = editor.ota.autoFilledUrl || "";
  editor.ota.latestUrl = url;
  if (el.settingsOtaUrl) {
    el.settingsOtaUrl.placeholder = url;
    const current = el.settingsOtaUrl.value.trim();
    if (!current || current === previousAuto) {
      el.settingsOtaUrl.value = url;
      editor.ota.autoFilledUrl = url;
    }
  }
}

async function refreshLatestOtaUrl() {
  if (editor.ota.latestUrlLoading) return;

  const fallback = otaLatestFallbackUrl();
  if (fallback) {
    applyLatestOtaUrl(fallback);
  }

  editor.ota.latestUrlLoading = true;
  try {
    const response = await fetch(`https://api.github.com/repos/${OTA_RELEASE_REPO}/releases/latest`, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return;
    const payload = await response.json();
    const assets = Array.isArray(payload?.assets) ? payload.assets : [];
    const variant = otaPanelVariant();
    const suffix = `-${variant}.ota.bin`;
    const asset = assets.find((item) =>
      typeof item?.name === "string" &&
      item.name.startsWith("betta86-ha-panel-") &&
      item.name.endsWith(suffix)
    );
    if (asset?.name) {
      applyLatestOtaUrl(`https://github.com/${OTA_RELEASE_REPO}/releases/latest/download/${asset.name}`);
    } else if (typeof asset?.browser_download_url === "string") {
      applyLatestOtaUrl(asset.browser_download_url);
    }
  } catch (_) {
    /* Keep the firmware-version fallback URL. */
  } finally {
    editor.ota.latestUrlLoading = false;
  }
}

async function loadHaDiagnostics() {
  try {
    const payload = await apiGet("/api/ha/diagnostics");
    if (!payload || typeof payload !== "object") return;
    const names = Array.isArray(payload.missing_entities)
      ? payload.missing_entities.filter((n) => typeof n === "string")
      : [];
    editor.haDiagnostics.total = Number(payload.missing_total) || 0;
    editor.haDiagnostics.listed = Number(payload.missing_listed) || names.length;
    editor.haDiagnostics.updatedUnixMs = Number(payload.updated_unix_ms) || 0;
    editor.haDiagnostics.names = names;
  } catch (_) {
    /* keep previous state */
  }
  renderHaDiagnosticsBanner();
}

function haDiagnosticsSignature() {
  const d = editor.haDiagnostics;
  if (!d || !d.total) return "";
  const names = Array.isArray(d.names) ? [...d.names].sort().join("|") : "";
  return `${d.total}:${names}`;
}

function renderHaDiagnosticsBanner() {
  const banner = el.haDiagnosticsBanner;
  if (!banner) return;
  const d = editor.haDiagnostics;
  const signature = haDiagnosticsSignature();
  if (!d || !d.total || !signature) {
    banner.hidden = true;
    return;
  }
  if (d.dismissedSignature && d.dismissedSignature === signature) {
    banner.hidden = true;
    return;
  }
  if (el.haDiagnosticsTitle) {
    if (d.total > d.listed && d.listed > 0) {
      el.haDiagnosticsTitle.textContent = t("ha_diagnostics.missing_title_more", {
        total: d.total,
        listed: d.listed,
      });
    } else {
      el.haDiagnosticsTitle.textContent = t("ha_diagnostics.missing_title");
    }
  }
  if (el.haDiagnosticsHint) {
    el.haDiagnosticsHint.textContent = t("ha_diagnostics.missing_hint");
  }
  if (el.haDiagnosticsDismiss) {
    el.haDiagnosticsDismiss.setAttribute("aria-label", t("ha_diagnostics.dismiss"));
    el.haDiagnosticsDismiss.title = t("ha_diagnostics.dismiss");
  }
  if (el.haDiagnosticsList) {
    el.haDiagnosticsList.innerHTML = "";
    for (const name of Array.isArray(d.names) ? d.names : []) {
      const li = document.createElement("li");
      li.textContent = name;
      el.haDiagnosticsList.appendChild(li);
    }
  }
  banner.hidden = false;
}

function applyCanvasGeometry(payload) {
  if (!payload || typeof payload !== "object") return;
  const w = Number(payload.canvas_w);
  const h = Number(payload.canvas_h);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  if (w === CANVAS_WIDTH && h === CANVAS_HEIGHT) return;
  CANVAS_WIDTH = Math.round(w);
  CANVAS_HEIGHT = Math.round(h);
  if (el.canvas) {
    el.canvas.style.width = `${CANVAS_WIDTH}px`;
    el.canvas.style.height = `${CANVAS_HEIGHT}px`;
    applyPageLookPreview(selectedPage());
  }
}

function setSelectOptionText(select, value, key, vars) {
  if (!select || !select.options) return;
  for (const option of select.options) {
    if (option.value === value) {
      option.textContent = t(key, vars);
      return;
    }
  }
}

function renderLanguageOptions() {
  if (!el.settingsLanguage) return;

  const optionCodes = new Set();
  optionCodes.add(DEFAULT_UI_LANGUAGE);
  optionCodes.add("en");
  optionCodes.add("de");
  optionCodes.add("es");
  optionCodes.add("fr");
  optionCodes.add("pl");
  optionCodes.add("zh-cn");
  optionCodes.add("zh-tw");
  optionCodes.add(editor.i18nLanguage || DEFAULT_UI_LANGUAGE);
  for (const language of editor.languageCatalog || []) {
    const code = normalizeLanguageCode(language?.code, "");
    if (code) optionCodes.add(code);
  }

  const current = normalizeUiLanguage(editor.i18nLanguage || el.settingsLanguage.value);
  const sorted = Array.from(optionCodes).sort((a, b) => a.localeCompare(b));
  el.settingsLanguage.innerHTML = "";
  for (const code of sorted) {
    const option = document.createElement("option");
    option.value = code;
    const optionKey = `settings.language.option_${code}`;
    option.textContent = (editor.i18nMap && editor.i18nMap[optionKey]) || code.toUpperCase();
    el.settingsLanguage.appendChild(option);
  }
  el.settingsLanguage.value = sorted.includes(current) ? current : (sorted[0] || DEFAULT_UI_LANGUAGE);

  if (el.uploadLanguageCode) {
    el.uploadLanguageCode.value = el.settingsLanguage.value;
  }
}

async function loadLanguageCatalog() {
  const payload = await apiGet("/api/i18n/languages");
  if (!payload || !Array.isArray(payload.languages)) {
    throw new Error("Invalid language catalog");
  }
  editor.languageCatalog = payload.languages;
  return payload;
}

async function loadEffectiveTranslation(language) {
  const lang = normalizeUiLanguage(language);
  const response = await fetch(`/api/i18n/effective?lang=${encodeURIComponent(lang)}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function loadI18nLanguage(language, refreshCatalog = false) {
  const lang = normalizeUiLanguage(language);

  if (refreshCatalog || !Array.isArray(editor.languageCatalog) || editor.languageCatalog.length === 0) {
    try {
      await loadLanguageCatalog();
    } catch (_) {}
  }

  let effective = {};
  try {
    effective = await loadEffectiveTranslation(lang);
  } catch (_) {
    effective = {};
  }

  const builtin = WEB_I18N_BUILTIN[lang] || {};
  const webCustom = flattenTranslationObject(effective?.web || {});
  editor.i18nMap = {
    ...(WEB_I18N_BUILTIN.en || {}),
    ...builtin,
    ...webCustom,
  };
  editor.i18nEffective = effective || {};
  editor.i18nLanguage = lang;
  document.documentElement.lang = lang;

  applyWebTranslations();
  renderLanguageOptions();
  if (editor.layout) {
    renderCanvas();
  }
}

function applyWebTranslations() {
  setTextById("layoutTabBtn", "tabs.layout");
  setTextById("settingsTabBtn", "tabs.settings");
  setTextById("sidebarTitleText", "sidebar.title");
  setTextById("sidebarSubtitle", "sidebar.subtitle");
  renderAppVersion();

  setTextById("pagesHeading", "layout.pages.heading");
  setTextById("addPageBtn", "layout.pages.add");
  setTextById("addEnergyPageBtn", "layout.pages.add_energy");
  setTextById("deletePageBtn", "layout.pages.delete");
  setTextById("pageTitleLabel", "layout.pages.title_label");
  setPlaceholderById("pageTitleInput", "layout.pages.title_placeholder");
  setTextById("applyPageBtn", "layout.pages.apply_title");
  setTextById("energyPageHeading", "layout.energy.heading");
  setTextById("energyPageHint", "layout.energy.hint");
  setTextById("energySourceLabel", "layout.energy.source");
  setTextById("energySourceHaOption", "layout.energy.source_ha");
  setTextById("energySourceManualOption", "layout.energy.source_manual");
  setTextById("energyHomePowerLabel", "layout.energy.home_power");
  setTextById("energySolarPowerLabel", "layout.energy.solar_power");
  setTextById("energyGridPowerLabel", "layout.energy.grid_power");
  setTextById("energyGridImportLabel", "layout.energy.grid_import");
  setTextById("energyGridExportLabel", "layout.energy.grid_export");
  setTextById("energyBatteryPowerLabel", "layout.energy.battery_power");
  setTextById("energyBatteryChargeLabel", "layout.energy.battery_charge");
  setTextById("energyBatteryDischargeLabel", "layout.energy.battery_discharge");
  setTextById("energyBatterySocLabel", "layout.energy.battery_soc");
  setTextById("applyEnergyPageBtn", "layout.energy.apply");
  setTextById("addMusicPageBtn", "layout.pages.add_music");
  setTextById("musicPageHeading", "layout.music.heading");
  setTextById("musicPageHint", "layout.music.hint");
  setTextById("musicPlayerEntityLabel", "layout.music.player_entity");
  setTextById("musicPlayersLabel", "layout.music.players");
  setTextById("applyMusicPageBtn", "layout.music.apply");

  setTextById("widgetsHeading", "layout.widgets.heading");
  setTextById("addSensorBtn", "layout.widgets.add_sensor");
  setTextById("addButtonBtn", "layout.widgets.add_button");
  setTextById("addSliderBtn", "layout.widgets.add_slider");
  setTextById("addGraphBtn", "layout.widgets.add_graph");
  setTextById("addEmptyTileBtn", "layout.widgets.add_empty_tile");
  setTextById("addLightTileBtn", "layout.widgets.add_light_tile");
  setTextById("openSetupWizardBtn", "layout.widgets.quick_setup");
  setTextById("addHeatingTileBtn", "layout.widgets.add_heating_tile");
  setTextById("addWeatherTileBtn", "layout.widgets.add_weather_tile");
  setTextById("addWeather3DayBtn", "layout.widgets.add_weather_3day");
  setTextById("addTodoListBtn", "layout.widgets.add_todo");
  setTextById("addMediaPlayerBtn", "layout.widgets.add_media_player");
  setTextById("addRoborockTileBtn", "layout.widgets.add_roborock");
  setTextById("addClockBtn", "layout.widgets.add_clock");
  setTextById("addClockMenuItem", "layout.widgets.add_clock");
  setTextById("deleteWidgetBtn", "layout.widgets.delete");
  setTextById("lightEntityPickerTitle", "entity_picker.title");
  setTextById("lightEntityPickerRefreshBtn", "entity_picker.refresh");
  setTextById("lightEntityPickerCloseBtn", "entity_picker.close");
  setTextById("lightEntityPickerBlankBtn", "entity_picker.blank");
  setPlaceholderById("lightEntityPickerSearch", "entity_picker.search_placeholder");

  setTextById("inspectorHeading", "layout.inspector.heading");
  setTextById("fTitleLabel", "layout.inspector.title");
  setTextById("fEntityLabel", "layout.inspector.entity");
  setTextById("fSecondaryEntityLabel", "layout.inspector.secondary_entity");
  setTextById("fButtonModeLabel", "layout.inspector.button_mode");
  setTextById("fButtonAccentColorLabel", "layout.inspector.button_accent_color");
  setTextById("fButtonStyleLabel", "layout.inspector.button_style");
  setTextById("fBinaryShowTitleLabel", "layout.inspector.binary_show_title");
  setTextById("fBinaryColorOnLabel", "layout.inspector.binary_color_on");
  setTextById("fBinaryColorOffLabel", "layout.inspector.binary_color_off");
  setTextById("fBinaryTextOnLabel", "layout.inspector.binary_text_on");
  setTextById("fBinaryTextOffLabel", "layout.inspector.binary_text_off");
  setTextById("fAlarmCodeLabel", "layout.inspector.alarm_code");
  setTextById("fAlarmAskCodeLabel", "layout.inspector.alarm_ask_code");
  setTextById("fAlarmBackendLabel", "layout.inspector.alarm_backend");
  setTextById("fAlarmZoneLabelText", "layout.inspector.alarm_zone_label");
  setTextById("fAlarmShowSensorsLabel", "layout.inspector.alarm_show_sensors");
  setTextById("fAlarmShowBypassedLabel", "layout.inspector.alarm_show_bypassed");
  setTextById("fAlarmForceArmLabel", "layout.inspector.alarm_force_arm");
  setTextById("fAlarmSkipDelayLabel", "layout.inspector.alarm_skip_delay");
  setTextById("fAlarmModesLabel", "layout.inspector.alarm_modes");
  setTextById("fAlarmModeAwayLabel", "layout.inspector.alarm_mode_away");
  setTextById("fAlarmModeHomeLabel", "layout.inspector.alarm_mode_home");
  setTextById("fAlarmModeNightLabel", "layout.inspector.alarm_mode_night");
  setTextById("fAlarmModeVacationLabel", "layout.inspector.alarm_mode_vacation");
  setTextById("fAlarmModeCustomLabel", "layout.inspector.alarm_mode_custom");
  setTextById("fAlarmModeDisarmLabel", "layout.inspector.alarm_mode_disarm");
  setTextById("fClockHint", "layout.inspector.clock_hint");
  setTextById("fClockShowSecondsLabel", "layout.inspector.clock_show_seconds");
  setTextById("fClockShowDateLabel", "layout.inspector.clock_show_date");
  setTextById("fSensorValueColorLabel", "layout.inspector.sensor_value_color");
  setTextById("inspectorGroupTileLookLabel", "layout.tile_look.group");
  setTextById("fTilePresetLabel", "layout.tile_look.preset");
  setTextById("fTileBgColorLabel", "layout.tile_look.bg_color");
  setTextById("fTileBgGradColorLabel", "layout.tile_look.bg_grad_color");
  setTextById("fTileBgGradDirLabel", "layout.tile_look.bg_grad_dir");
  setTextById("fTileBorderColorLabel", "layout.tile_look.border_color");
  setTextById("fTileBorderWidthLabel", "layout.tile_look.border_width");
  setTextById("fTileRadiusLabel", "layout.tile_look.radius");
  setTextById("fTileOpacityLabel", "layout.tile_look.opacity");
  setTextById("fTileFontScaleLabel", "layout.tile_look.font_scale");
  setTextById("fTileShadowLabel", "layout.tile_look.shadow");
  setTextById("fTileTextColorLabel", "layout.tile_look.text_color");
  setTextById("fTileTitleColorLabel", "layout.tile_look.title_color");
  setTextById("fTileLabelColorLabel", "layout.tile_look.label_color");
  setTextById("fTileValueColorLabel", "layout.tile_look.value_color");
  setTextById("fTileIconColorLabel", "layout.tile_look.icon_color");
  setTextById("tileLookResetBtn", "layout.tile_look.reset");
  setTextById("tileLookHint", "layout.tile_look.hint");
  setTextById("fTileCopySourceLabel", "layout.tile_look.copy_source");
  setTextById("tileLookCopyBtn", "layout.tile_look.copy_apply");
  setTextById("tileLookCopyPageBtn", "layout.tile_look.copy_apply_page");
  setTextById("tileLookCopyHint", "layout.tile_look.copy_hint");
  setTextById("fTileCornerShapeLabel", "layout.tile_look.corner_shape");
  setTextById("tileCornerShapeHint", "layout.tile_look.corner_hint");
  setTextById("inspectorGroupPageLookLabel", "layout.page_look.group");
  setTextById("pageLookHeading", "layout.page_look.heading");
  setTextById("fPagePresetLabel", "layout.page_look.preset");
  setTextById("fPageBgColorLabel", "layout.page_look.bg_color");
  setTextById("fPageBgGradColorLabel", "layout.page_look.bg_grad_color");
  setTextById("fPageBgGradDirLabel", "layout.page_look.bg_grad_dir");
  setTextById("fPageWallpaperLabel", "layout.page_look.wallpaper");
  setTextById("fPageDimLabel", "layout.page_look.dim");
  setTextById("fPageThemeLabel", "layout.page_look.page_theme");
  setTextById("fPageThemeHint", "layout.page_look.page_theme_hint");
  setTextById("pageLookResetBtn", "layout.page_look.reset");
  setTextById("pageLookHint", "layout.page_look.hint");
  setSelectOptionText(el.fPagePreset, "auto", "layout.option.page_preset.auto");
  setSelectOptionText(el.fPagePreset, "midnight", "layout.option.page_preset.midnight");
  setSelectOptionText(el.fPagePreset, "deep_sea", "layout.option.page_preset.deep_sea");
  setSelectOptionText(el.fPagePreset, "forest", "layout.option.page_preset.forest");
  setSelectOptionText(el.fPagePreset, "sunset", "layout.option.page_preset.sunset");
  setSelectOptionText(el.fPagePreset, "plum", "layout.option.page_preset.plum");
  setSelectOptionText(el.fPagePreset, "wallpaper", "layout.option.page_preset.wallpaper");
  setSelectOptionText(el.fPagePreset, "wallpaper_dim", "layout.option.page_preset.wallpaper_dim");
  setSelectOptionText(el.fPageBgGradDir, "none", "layout.option.page_grad_dir.none");
  setSelectOptionText(el.fPageBgGradDir, "hor", "layout.option.page_grad_dir.hor");
  setSelectOptionText(el.fPageBgGradDir, "ver", "layout.option.page_grad_dir.ver");
  setSelectOptionText(el.fTileBgGradDir, "none", "layout.option.tile_grad_dir.none");
  setSelectOptionText(el.fTileBgGradDir, "hor", "layout.option.tile_grad_dir.hor");
  setSelectOptionText(el.fTileBgGradDir, "ver", "layout.option.tile_grad_dir.ver");
  setSelectOptionText(el.fTileFontScale, "auto", "layout.option.tile_font_scale.auto");
  setSelectOptionText(el.fTileFontScale, "s", "layout.option.tile_font_scale.s");
  setSelectOptionText(el.fTileFontScale, "m", "layout.option.tile_font_scale.m");
  setSelectOptionText(el.fTileFontScale, "l", "layout.option.tile_font_scale.l");
  setSelectOptionText(el.fTileFontScale, "xl", "layout.option.tile_font_scale.xl");
  setSelectOptionText(el.fTilePreset, "auto", "layout.option.tile_preset.auto");
  setSelectOptionText(el.fTilePreset, "graphite", "layout.option.tile_preset.graphite");
  setSelectOptionText(el.fTilePreset, "emerald", "layout.option.tile_preset.emerald");
  setSelectOptionText(el.fTilePreset, "amber", "layout.option.tile_preset.amber");
  setSelectOptionText(el.fTilePreset, "violet", "layout.option.tile_preset.violet");
  setSelectOptionText(el.fTilePreset, "sky", "layout.option.tile_preset.sky");
  setSelectOptionText(el.fTilePreset, "glass", "layout.option.tile_preset.glass");
  setSelectOptionText(el.fTileCornerShape, "custom", "layout.option.tile_corner.custom");
  setSelectOptionText(el.fTileCornerShape, "square", "layout.option.tile_corner.square");
  setSelectOptionText(el.fTileCornerShape, "soft", "layout.option.tile_corner.soft");
  setSelectOptionText(el.fTileCornerShape, "rounded", "layout.option.tile_corner.rounded");
  setSelectOptionText(el.fTileCornerShape, "pill", "layout.option.tile_corner.pill");
  setSelectOptionText(el.fTileCornerShape, "circle", "layout.option.tile_corner.circle");
  setTextById("fSliderEntityDomainLabel", "layout.inspector.slider_entity_domain");
  setTextById("fSliderDirectionLabel", "layout.inspector.slider_direction");
  setTextById("fSliderAccentColorLabel", "layout.inspector.slider_accent_color");
  setTextById("fGraphLineColorLabel", "layout.inspector.graph_line_color");
  setTextById("fGraphTimeWindowMinLabel", "layout.inspector.graph_time_window_min");
  setTextById("fGraphPointCountLabel", "layout.inspector.graph_point_count");
  setTextById("fGraphDisplayModeLabel", "layout.inspector.graph_display_mode");
  setTextById("fGraphBarBucketMinLabel", "layout.inspector.graph_bar_bucket_min");
  setSelectOptionText(el.fGraphDisplayMode, "line", "layout.option.graph_display_mode.line");
  setSelectOptionText(el.fGraphDisplayMode, "line_smooth_points", "layout.option.graph_display_mode.line_smooth_points");
  setSelectOptionText(el.fGraphDisplayMode, "line_smooth", "layout.option.graph_display_mode.line_smooth");
  setSelectOptionText(el.fGraphDisplayMode, "bars", "layout.option.graph_display_mode.bars");
  setTextById("applyInspectorBtn", "layout.inspector.apply");
  setSelectOptionText(el.fButtonMode, "auto", "layout.option.button_mode.auto");
  setSelectOptionText(el.fButtonMode, "play_pause", "layout.option.button_mode.play_pause");
  setSelectOptionText(el.fButtonMode, "stop", "layout.option.button_mode.stop");
  setSelectOptionText(el.fButtonMode, "next", "layout.option.button_mode.next");
  setSelectOptionText(el.fButtonMode, "previous", "layout.option.button_mode.previous");
  setSelectOptionText(el.fButtonStyle, "", "layout.option.button_style.switch");
  setSelectOptionText(el.fButtonStyle, "power_toggle", "layout.option.button_style.power_toggle");
  setSelectOptionText(el.fButtonStyle, "power_status", "layout.option.button_style.power_status");
  setSelectOptionText(el.fButtonStyle, "plug_icon", "layout.option.button_style.plug_icon");
  setSelectOptionText(el.fButtonStyle, "lamp_icon", "layout.option.button_style.lamp_icon");
  setSelectOptionText(el.fButtonStyle, "highlight", "layout.option.button_style.highlight");
  setSelectOptionText(el.fButtonStyle, "status_text", "layout.option.button_style.status_text");
  setSelectOptionText(el.fSliderEntityDomain, "auto", "layout.option.slider_entity_domain.auto");
  setSelectOptionText(el.fSliderEntityDomain, "light", "layout.option.slider_entity_domain.light");
  setSelectOptionText(el.fSliderEntityDomain, "media_player", "layout.option.slider_entity_domain.media_player");
  setSelectOptionText(el.fSliderEntityDomain, "cover", "layout.option.slider_entity_domain.cover");
  setSelectOptionText(el.fSliderDirection, "auto", "layout.option.slider_direction.auto");
  setSelectOptionText(el.fSliderDirection, "left_to_right", "layout.option.slider_direction.left_to_right");
  setSelectOptionText(el.fSliderDirection, "right_to_left", "layout.option.slider_direction.right_to_left");
  setSelectOptionText(el.fSliderDirection, "bottom_to_top", "layout.option.slider_direction.bottom_to_top");
  setSelectOptionText(el.fSliderDirection, "top_to_bottom", "layout.option.slider_direction.top_to_bottom");

  setTextById("layoutActionsHeading", "layout.actions.heading");
  setTextById("reloadBtn", "layout.actions.reload");
  setTextById("saveBtn", "layout.actions.save");
  setTextById("exportBtn", "layout.actions.export");
  setTextById("importBtn", "layout.actions.import");
  setPlaceholderById("jsonPaste", "layout.actions.paste_placeholder");

  setTextById("provWifiTitle", "provision.wifi.title");
  setTextById("provWifiSubtitle", "provision.wifi.subtitle");
  setTextById("provWifiSsidLabel", "provision.wifi.ssid");
  setTextById("provWifiCountryCodeLabel", "provision.wifi.country_code");
  setTextById("provWifiPasswordLabel", "provision.wifi.password");
  setPlaceholderById("provWifiPassword", "provision.wifi.password_placeholder");
  setTextById("provWifiShowPasswordLabel", "provision.wifi.show_password");
  setTextById("provScanWifiBtn", "common.scan");
  setTextById("provHaTitle", "provision.ha.title");
  setTextById("provHaSubtitle", "provision.ha.subtitle");
  setTextById("provHaUrlLabel", "provision.ha.ws_url");
  setTextById("provHaTokenLabel", "provision.ha.token");
  setTextById("provHaShowTokenLabel", "provision.ha.show_token");
  setTextById("provWifiSaveBtn", "common.save_reboot");
  setTextById("provHaSaveBtn", "common.save_reboot");

  setTextById("settingsWifiHeading", "settings.wifi.heading");
  setTextById("settingsWifiSsidLabel", "settings.wifi.ssid");
  setTextById("settingsWifiCountryCodeLabel", "settings.wifi.country_code");
  setTextById("settingsWifiBssidLabel", "settings.wifi.bssid");
  setTextById("settingsWifiPasswordLabel", "settings.wifi.password");
  setPlaceholderById("settingsWifiPassword", "settings.wifi.password_placeholder");
  setTextById("settingsWifiStaticEnabledLabel", "settings.wifi.static_enabled");
  setTextById("settingsWifiStaticIpLabel", "settings.wifi.static_ip");
  setTextById("settingsWifiStaticNetmaskLabel", "settings.wifi.static_netmask");
  setTextById("settingsWifiStaticGatewayLabel", "settings.wifi.static_gateway");
  setTextById("settingsWifiStaticDnsLabel", "settings.wifi.static_dns");
  setTextById("scanWifiBtn", "common.scan_wifi");

  setTextById("settingsHaHeading", "settings.ha.heading");
  setTextById("settingsHaUrlLabel", "settings.ha.ws_url");
  setTextById("settingsHaTokenLabel", "settings.ha.token");
  setPlaceholderById("settingsHaToken", "settings.ha.token_placeholder");
  setTextById("settingsHaRestEnabledLabel", "settings.ha.rest_fallback");

  setTextById("settingsTimeHeading", "settings.time.heading");
  setTextById("settingsNtpServerLabel", "settings.time.ntp_server");
  setTextById("settingsTimezoneLabel", "settings.time.timezone");

  setTextById("settingsDisplayHeading", "settings.display.heading");
  setTextById("settingsBrightnessLabel", "settings.display.brightness");
  setTextById("settingsScreensaverEnabledLabel", "settings.display.screensaver_enabled");
  setTextById("settingsScreensaverTimeoutLabel", "settings.display.screensaver_timeout");
  setTextById("settingsSaverBrightnessLabel", "settings.display.saver_brightness");
  setTextById("settingsScreenOffEnabledLabel", "settings.display.screen_off_enabled");
  setTextById("settingsScreenOffTimeoutLabel", "settings.display.screen_off_timeout");
  setTextById("settingsClockFormatLabel", "settings.display.clock_format");
  setTextById("settingsClockFormat24hOption", "settings.display.clock_format_h24");
  setTextById("settingsClockFormat12hOption", "settings.display.clock_format_h12");
  setTextById("settingsClockFormatHint", "settings.display.clock_format_hint");
  setTextById("settingsClockStyleLabel", "settings.display.clock_style");
  setTextById("settingsClockStyleClassicOption", "settings.display.clock_style_classic");
  setTextById("settingsClockStyleFlipOption", "settings.display.clock_style_flip");
  syncClockStyleUi();
  setTextById("settingsShowSecondsLabel", "settings.display.show_seconds");
  setTextById("settingsShowDateLabel", "settings.display.show_date");
  setTextById("settingsClockColorLabel", "settings.display.clock_color");
  setTextById("settingsDateColorLabel", "settings.display.date_color");
  setTextById("settingsWallpaperLabel", "settings.display.wallpaper");
  setTextById("settingsWallpaperHint", "settings.display.wallpaper_hint");
  setTextById("uploadWallpaperBtn", "settings.display.upload_wallpaper");
  setTextById("removeWallpaperBtn", "settings.display.remove_wallpaper");
  setTextById("applyDisplayBtn", "settings.display.apply");
  setTextById("settingsNightModeEnabledLabel", "settings.display.night_mode_enabled");
  setTextById("settingsNightStartLabel", "settings.display.night_start");
  setTextById("settingsNightEndLabel", "settings.display.night_end");
  setTextById("settingsNightBrightnessLabel", "settings.display.night_brightness");
  setTextById("settingsNightWakeLabel", "settings.display.night_wake");
  setTextById("settingsThemeAutoEnabledLabel", "settings.display.theme_auto_enabled");
  setTextById("settingsThemeDaySelectLabel", "settings.display.theme_day");
  setTextById("settingsThemeNightSelectLabel", "settings.display.theme_night");
  const themeAutoHint = document.getElementById("settingsThemeAutoHint");
  if (themeAutoHint) themeAutoHint.textContent = t("settings.display.theme_auto_hint");
  const nightHint = document.getElementById("settingsNightHint");
  if (nightHint) nightHint.textContent = t("settings.display.night_hint");
  setTextById("settingsTilePressFxLabel", "settings.display.press_fx");
  setTextById("settingsTilePressFxDimLabel", "settings.display.press_fx_dim");
  setTextById("settingsTilePressFxScaleLabel", "settings.display.press_fx_scale");
  setTextById("settingsTilePressFxNoneOption", "settings.display.press_fx_none");
  setTextById("settingsTilePressFxDimOption", "settings.display.press_fx_dim_mode");
  setTextById("settingsTilePressFxScaleOption", "settings.display.press_fx_scale_mode");
  setTextById("settingsTilePressFxBothOption", "settings.display.press_fx_both");
  setTextById("settingsTilePressFxPreviewLabel", "settings.display.press_fx_preview");
  const pressFxHint = document.getElementById("settingsTilePressFxHint");
  if (pressFxHint) pressFxHint.textContent = t("settings.display.press_fx_hint");

  setTextById("settingsValueAnimLabel", "settings.display.value_anim");
  setTextById("settingsValueAnimMsLabel", "settings.display.value_anim_ms");
  setTextById("settingsValueAnimNoneOption", "settings.display.value_anim_none");
  setTextById("settingsValueAnimFadeOption", "settings.display.value_anim_fade");
  setTextById("settingsValueAnimSlideOption", "settings.display.value_anim_slide");
  setTextById("settingsValueAnimCountOption", "settings.display.value_anim_count");
  setTextById("settingsValueAnimPreviewBtn", "settings.display.value_anim_preview");
  const valueAnimHint = document.getElementById("settingsValueAnimHint");
  if (valueAnimHint) valueAnimHint.textContent = t("settings.display.value_anim_hint");

  setTextById("settingsTopbarHeading", "settings.display.topbar");
  setTextById("settingsTopbarShowClockLabel", "settings.display.topbar_show_clock");
  setTextById("settingsTopbarShowDateLabel", "settings.display.topbar_show_date");
  setTextById("settingsTopbarShowGearLabel", "settings.display.topbar_show_gear");
  setTextById("settingsTopbarShowStatusLabel", "settings.display.topbar_show_status");
  setTextById("settingsTopbarIconTextLabel", "settings.display.topbar_icon_text");
  setTextById("settingsTopbarCustomColorsLabel", "settings.display.topbar_custom_colors");
  setTextById("settingsTopbarBgColorLabel", "settings.display.topbar_bg_color");
  setTextById("settingsTopbarClockColorLabel", "settings.display.topbar_clock_color");
  setTextById("settingsTopbarDateColorLabel", "settings.display.topbar_date_color");
  setTextById("settingsTopbarGearColorLabel", "settings.display.topbar_gear_color");
  setTextById("settingsTopbarHaColorLabel", "settings.display.topbar_ha_color");
  setTextById("settingsTopbarWifiColorLabel", "settings.display.topbar_wifi_color");
  const topbarHint = document.getElementById("settingsTopbarHint");
  if (topbarHint) topbarHint.textContent = t("settings.display.topbar_hint");
  const topbarColorHint = document.getElementById("settingsTopbarColorHint");
  if (topbarColorHint) topbarColorHint.textContent = t("settings.display.topbar_color_hint");

  setTextById("settingsNavHeading", "settings.display.navbar");
  setTextById("settingsNavCustomColorsLabel", "settings.display.nav_custom_colors");
  setTextById("settingsNavBarBgColorLabel", "settings.display.nav_bar_bg_color");
  setTextById("settingsNavBarBorderColorLabel", "settings.display.nav_bar_border_color");
  setTextById("settingsNavButtonBgColorLabel", "settings.display.nav_button_bg_color");
  setTextById("settingsNavButtonBorderColorLabel", "settings.display.nav_button_border_color");
  setTextById("settingsNavTabIdleColorLabel", "settings.display.nav_tab_idle_color");
  setTextById("settingsNavTabActiveColorLabel", "settings.display.nav_tab_active_color");
  setTextById("settingsNavHomeIdleColorLabel", "settings.display.nav_home_idle_color");
  setTextById("settingsNavHomeActiveColorLabel", "settings.display.nav_home_active_color");
  const navHint = document.getElementById("settingsNavHint");
  if (navHint) navHint.textContent = t("settings.display.nav_hint");
  const navColorHint = document.getElementById("settingsNavColorHint");
  if (navColorHint) navColorHint.textContent = t("settings.display.nav_color_hint");

  setTextById("settingsSdHeading", "settings.sd.heading");
  setTextById("settingsSdEnabledLabel", "settings.sd.enabled");
  setTextById("sdRefreshBtn", "settings.sd.refresh");
  setTextById("sdExportLogsBtn", "settings.sd.export_logs");
  setTextById("sdFormatBtn", "settings.sd.format");
  setTextById("sdUpBtn", "settings.sd.up");
  setTextById("sdRootBtn", "settings.sd.root");
  setTextById("sdLogsBtn", "settings.sd.logs");
  setTextById("sdPhotosBtn", "settings.sd.photos");

  setTextById("settingsPagesHeading", "settings.pages.heading");
  setTextById("settingsPageTransitionLabel", "settings.pages.transition");
  setTextById("settingsPageTransitionMsLabel", "settings.pages.transition_ms");
  const pageTransitionHint = document.getElementById("settingsPageTransitionHint");
  if (pageTransitionHint) pageTransitionHint.textContent = t("settings.pages.transition_hint");
  setTextById("settingsPageTransitionNoneOption", "settings.pages.option_none");
  setTextById("settingsPageTransitionFadeOption", "settings.pages.option_fade");
  setTextById("settingsPageTransitionSlideOption", "settings.pages.option_slide");
  setTextById("settingsPageTransitionSlideUpOption", "settings.pages.option_slide_up");
  setTextById("settingsPageTransitionFadeSlideOption", "settings.pages.option_fade_slide");
  setTextById("settingsPageTargetLabel", "settings.pages.target");
  setTextById("reloadPagesBtn", "settings.pages.reload");
  setTextById("showPageOnPanelBtn", "settings.pages.show");
  setTextById("applyPagesBtn", "settings.pages.apply");

  setTextById("settingsMqttHeading", "settings.mqtt.heading");
  setTextById("settingsMqttEnabledLabel", "settings.mqtt.enabled");
  setTextById("settingsMqttUseTlsLabel", "settings.mqtt.use_tls");
  setTextById("settingsMqttTlsHint", "settings.mqtt.tls_hint");
  setTextById("settingsMqttHostLabel", "settings.mqtt.host");
  setTextById("settingsMqttPortLabel", "settings.mqtt.port");
  setTextById("settingsMqttUsernameLabel", "settings.mqtt.username");
  setTextById("settingsMqttPasswordLabel", "settings.mqtt.password");
  setTextById("settingsMqttDiscoveryPrefixLabel", "settings.mqtt.discovery_prefix");
  setTextById("applyMqttBtn", "settings.mqtt.apply");

  setTextById("settingsUiHeading", "settings.ui.heading");
  setTextById("settingsLanguageLabel", "settings.ui.language");
  setTextById("reloadLanguagesBtn", "settings.ui.reload_languages");
  setTextById("downloadLanguageBtn", "settings.ui.download_json");
  setTextById("uploadLanguageCodeLabel", "settings.ui.upload_code");
  setTextById("uploadLanguageFileLabel", "settings.ui.upload_file");
  setTextById("uploadLanguageBtn", "settings.ui.upload_button");

  setTextById("settingsApHeading", "settings.ap.heading");
  const apHint = document.getElementById("settingsApHint");
  if (apHint) apHint.innerHTML = t("settings.ap.hint");

  setTextById("settingsOtaHeading", "settings.ota.heading");
  setTextById("settingsOtaUrlLabel", "settings.ota.url");
  setPlaceholderById("settingsOtaUrl", "settings.ota.url_placeholder");
  setTextById("startOtaUrlBtn", "settings.ota.flash_url");
  setTextById("refreshOtaStatusBtn", "settings.ota.refresh");
  setTextById("settingsOtaFileLabel", "settings.ota.file");
  setTextById("uploadOtaBtn", "settings.ota.upload");

  setTextById("settingsSystemHeading", "settings.system.heading");
  setTextById("settingsAutoRestartEnabledLabel", "settings.system.auto_restart_enabled");
  setTextById("settingsAutoRestartHoursLabel", "settings.system.auto_restart_hours");
  const systemHint = document.getElementById("settingsSystemInfo");
  if (systemHint) systemHint.textContent = t("settings.system.hint");

  setTextById("settingsBackupHeading", "settings.backup.heading");
  setTextById("downloadBackupBtn", "settings.backup.download");
  setTextById("settingsBackupFileLabel", "settings.backup.file");
  setTextById("restoreBackupBtn", "settings.backup.restore");
  const backupHint = document.getElementById("settingsBackupHint");
  if (backupHint) backupHint.textContent = t("settings.backup.hint");

  setTextById("settingsActionsHeading", "settings.actions.heading");
  setTextById("reloadSettingsBtn", "settings.actions.reload");
  setTextById("saveSettingsBtn", "settings.actions.save");
  setTextById("settingsActionsHint", "settings.actions.hint");
  setTextById("settingsLogsHeading", "settings.logs.heading");
  setTextById("logsRefreshBtn", "settings.logs.refresh");
  setTextById("logsClearBtn", "settings.logs.clear");
  setTextById("logsAutoScrollLabel", "settings.logs.auto_scroll");
  setTextById("logsDownloadLink", "settings.logs.download");
  syncLogsPauseButtonText();
  setTextById("settingsDiagnosticsHeading", "settings.diagnostics.heading");
  setTextById("diagnosticsRefreshBtn", "settings.diagnostics.refresh");
  setTextById("diagnosticsAutoRefreshLabel", "settings.diagnostics.auto_refresh");
  setTextById("setupWizardTitle", "setup.title");
  setTextById("setupWizardCloseBtn", "setup.close");
  setTextById("setupWizardStepHa", "setup.step_ha");
  setTextById("setupWizardStepTiles", "setup.step_tiles");
  setTextById("setupWizardStepSave", "setup.step_save");
  setTextById("setupWizardSubtitle", "setup.subtitle");
  setTextById("setupWizardPageLabel", "setup.page_label");
  setPlaceholderById("setupWizardPageTitle", "setup.page_placeholder");
  setTextById("setupWizardAddLightBtn", "setup.add_light");
  setTextById("setupWizardAddHeatingBtn", "setup.add_heating");
  setTextById("setupWizardAddWeatherBtn", "setup.add_weather");
  setTextById("setupWizardAddButtonBtn", "setup.add_button");
  setTextById("setupWizardAddSensorBtn", "setup.add_sensor");
  setTextById("setupWizardSkipBtn", "setup.skip");
  setTextById("setupWizardDoneBtn", "setup.done");
  setTextById("setupWizardSaveBtn", "setup.save");
  applySettingsNavTranslations();

  if (el.settingsTranslationInfo && !el.settingsTranslationInfo.classList.contains("error")) {
    el.settingsTranslationInfo.textContent = t("settings.translation.info");
  }

  if (el.uploadLanguageCode) {
    el.uploadLanguageCode.placeholder = "fr";
  }
  if (editor.setupWizard.active) {
    renderSetupWizard();
  }
}

function downloadLanguageJson() {
  const lang = normalizeUiLanguage(el.settingsLanguage?.value || editor.i18nLanguage);
  const web = {};
  for (const [key, value] of Object.entries(editor.i18nMap || {})) {
    web[key] = value;
  }

  const payload = {
    meta: {
      code: lang,
      exported_at: new Date().toISOString(),
    },
    web,
    lvgl: editor.i18nEffective?.lvgl || {},
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `betta-i18n-${lang}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function uploadLanguageJson() {
  const lang = normalizeLanguageCode(el.uploadLanguageCode?.value, "");
  if (!lang) {
    throw new Error(t("settings.translation.invalid_code"));
  }
  const file = el.uploadLanguageFile?.files?.[0];
  if (!file) {
    throw new Error(t("settings.translation.no_file"));
  }

  const text = await file.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (_) {
    throw new Error(t("settings.translation.invalid_json"));
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(t("settings.translation.object_required"));
  }

  const response = await fetch(`/api/i18n/custom?lang=${encodeURIComponent(lang)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = json.error || detail;
    } catch (_) {}
    throw new Error(detail);
  }
}

function setProvisioningVisible(visible) {
  if (el.provisioningRoot) {
    el.provisioningRoot.classList.toggle("hidden", !visible);
  }
  if (el.editorShell) {
    el.editorShell.classList.toggle("hidden", visible);
  }
}

function provisioningStageForSettings(settings) {
  const wifiConfigured = Boolean(settings?.wifi?.configured);
  const wifiSetupApActive = Boolean(settings?.wifi?.setup_ap_active);
  const haConfigured = Boolean(settings?.ha?.configured);
  if (wifiSetupApActive) return "wifi";
  if (!wifiConfigured) return "wifi";
  if (!haConfigured) return "ha";
  return null;
}

function showProvisioningStage(stage, settings) {
  if (!stage) {
    editor.provisioningStage = null;
    setProvisioningVisible(false);
    return false;
  }

  editor.provisioningStage = stage;
  const wifi = settings?.wifi || {};
  const ha = settings?.ha || {};
  editor.wifiScanSupported = wifi.scan_supported !== false;

  if (el.provisioningWifiPage) {
    el.provisioningWifiPage.classList.toggle("hidden", stage !== "wifi");
  }
  if (el.provisioningHaPage) {
    el.provisioningHaPage.classList.toggle("hidden", stage !== "ha");
  }
  setProvisioningVisible(true);

  if (el.provWifiSsid) {
    el.provWifiSsid.value = wifi.ssid || "";
  }
  if (el.provWifiCountryCode) {
    el.provWifiCountryCode.value = normalizeCountryCode(wifi.country_code) || "US";
  }
  if (el.provWifiPassword) {
    el.provWifiPassword.value = "";
    el.provWifiPassword.type = "password";
  }
  if (el.provWifiShowPassword) {
    el.provWifiShowPassword.checked = false;
  }
  if (el.provHaUrl) {
    el.provHaUrl.value = ha.ws_url || "";
  }
  if (el.provHaToken) {
    el.provHaToken.value = "";
    el.provHaToken.type = "password";
  }
  if (el.provHaShowToken) {
    el.provHaShowToken.checked = false;
  }

  if (el.provScanWifiBtn) {
    el.provScanWifiBtn.disabled = !editor.wifiScanSupported || editor.wifiScanInProgress;
  }
  renderWifiScanResults(editor.wifiScanItems, "provisioning");

  if (!editor.wifiScanSupported) {
    setWifiScanInfo(t("wifi.scan_unavailable"), false, "provisioning");
  } else if (!editor.wifiScanHasRun && !editor.wifiScanInProgress) {
    setWifiScanInfo(t("wifi.scan_click_short"), false, "provisioning");
  }

  setProvisioningInfo(
    stage,
    stage === "wifi"
      ? t("provision.wifi.hint", {}, "Save reboots the panel. After reboot, HA provisioning is shown.")
      : t("provision.ha.hint", {}, "Save reboots the panel. After reboot, the editor is unlocked.")
  );
  return true;
}

function setupSettingsWorkspace() {
  if (el.settingsContentPane || !el.settingsPane) return;

  const workspaceBody = document.querySelector(".workspace-body");
  el.canvasWrap = el.canvasWrap || document.querySelector(".canvas-wrap");
  el.actionsPanel = el.actionsPanel || document.querySelector("aside.actions-panel");
  if (!workspaceBody || !el.canvasWrap) return;

  const contentPane = document.createElement("div");
  contentPane.id = "settingsContentPane";
  contentPane.className = "settings-content hidden";
  workspaceBody.insertBefore(contentPane, el.canvasWrap);

  const navSection = document.createElement("section");
  navSection.className = "settings-nav-section";

  const navHeading = document.createElement("h2");
  navHeading.id = "settingsNavHeading";
  navHeading.textContent = t("tabs.settings");
  navSection.appendChild(navHeading);

  const nav = document.createElement("div");
  nav.id = "settingsNav";
  nav.className = "settings-nav";
  const actionsHeading = document.getElementById("settingsActionsHeading");
  const actionsSection = actionsHeading?.closest("section") || null;

  for (const item of SETTINGS_NAV_ITEMS) {
    const heading = document.getElementById(item.headingId);
    const section = heading?.closest("section");
    if (!section) continue;

    section.id = item.sectionId;
    section.classList.add("settings-content-section", "hidden");
    contentPane.appendChild(section);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "settings-nav-btn";
    button.dataset.settingsSection = item.sectionId;
    button.dataset.i18nKey = item.labelKey;
    button.textContent = t(item.labelKey);
    nav.appendChild(button);
  }

  navSection.appendChild(nav);
  if (actionsSection) {
    actionsSection.id = "settingsSidebarActions";
    actionsSection.classList.add("settings-sidebar-actions");
    actionsHeading.classList.add("hidden");
    el.settingsPane.replaceChildren(navSection, actionsSection);
  } else {
    el.settingsPane.replaceChildren(navSection);
  }
  el.settingsContentPane = contentPane;
  el.settingsNavButtons = Array.from(nav.querySelectorAll(".settings-nav-btn"));
  el.settingsContentSections = Array.from(contentPane.querySelectorAll(".settings-content-section"));
  setActiveSettingsSection(editor.activeSettingsSection);
}

function applySettingsNavTranslations() {
  setTextById("settingsNavHeading", "tabs.settings");
  for (const button of el.settingsNavButtons || []) {
    const key = button.dataset.i18nKey;
    if (key) {
      button.textContent = t(key);
    }
  }
  if (editor.activePane === "settings") {
    setActiveSettingsSection(editor.activeSettingsSection);
  }
}

function activeSettingsNavItem(sectionId = editor.activeSettingsSection) {
  return SETTINGS_NAV_ITEMS.find((item) => item.sectionId === sectionId) || SETTINGS_NAV_ITEMS[0];
}

function setActiveSettingsSection(sectionId) {
  setupSettingsWorkspace();
  const item = activeSettingsNavItem(sectionId);
  if (!item) return;

  editor.activeSettingsSection = item.sectionId;
  for (const section of el.settingsContentSections || []) {
    section.classList.toggle("hidden", section.id !== item.sectionId);
  }
  for (const button of el.settingsNavButtons || []) {
    const active = button.dataset.settingsSection === item.sectionId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }
  if (editor.activePane === "settings" && el.canvasTitle) {
    el.canvasTitle.textContent = t(item.labelKey);
  }
  if (item.sectionId === "settingsLogsSection") {
    startLogsPoll();
  } else {
    clearLogsPoll();
  }
  if (item.sectionId === "settingsDiagnosticsSection") {
    void loadDiagnostics(true);
  } else {
    clearDiagnosticsPoll();
  }
}

function setActivePane(pane) {
  setupSettingsWorkspace();
  editor.activePane = pane === "remote" ? "remote" : pane === "settings" ? "settings" : "layout";
  const showLayout = editor.activePane === "layout";
  const showSettings = editor.activePane === "settings";
  const showRemote = editor.activePane === "remote";
  window.RemoteDisplay?.setVisible(showRemote);
  el.layoutPane.classList.toggle("hidden", !showLayout);
  el.settingsPane.classList.toggle("hidden", !showSettings);
  if (el.settingsContentPane) {
    el.settingsContentPane.classList.toggle("hidden", !showSettings);
  }
  if (el.canvasWrap) {
    el.canvasWrap.classList.toggle("hidden", !showLayout);
  }
  if (el.actionsPanel) {
    el.actionsPanel.classList.toggle("hidden", !showLayout);
  }
  el.layoutTabBtn.classList.toggle("active", showLayout);
  el.settingsTabBtn.classList.toggle("active", showSettings);
  if (!showSettings) {
    clearOtaStatusPoll();
    clearLogsPoll();
    clearDiagnosticsPoll();
    if (showLayout) renderCanvas();
    if (showRemote && el.canvasTitle) el.canvasTitle.textContent = document.getElementById("remoteTabBtn").textContent;
  } else if (editor.ota.status?.running || editor.ota.status?.rebooting) {
    setActiveSettingsSection(editor.activeSettingsSection);
    scheduleOtaStatusPoll();
  } else {
    setActiveSettingsSection(editor.activeSettingsSection);
  }
}

// System log monitor (settings > Logs)
// ============================================================
const LOGS_POLL_MS = 2000;
const LOGS_MAX_LINES = 600;

function logsShouldPoll() {
  return (
    editor.activePane === "settings" &&
    editor.activeSettingsSection === "settingsLogsSection" &&
    !editor.logs.paused
  );
}

function syncLogsPauseButtonText() {
  if (!el.logsPauseBtn) return;
  el.logsPauseBtn.textContent = t(editor.logs.paused ? "settings.logs.resume" : "settings.logs.pause");
}

function clearLogsPoll() {
  if (editor.logs.pollTimerId) {
    window.clearTimeout(editor.logs.pollTimerId);
    editor.logs.pollTimerId = null;
  }
}

function scheduleLogsPoll() {
  clearLogsPoll();
  if (!logsShouldPoll()) return;
  editor.logs.pollTimerId = window.setTimeout(() => {
    editor.logs.pollTimerId = null;
    void loadLogs(false);
  }, LOGS_POLL_MS);
}

function startLogsPoll() {
  clearLogsPoll();
  if (!logsShouldPoll()) return;
  void loadLogs(false);
}

function setLogsPaused(paused) {
  editor.logs.paused = Boolean(paused);
  syncLogsPauseButtonText();
  if (editor.logs.paused) {
    clearLogsPoll();
  } else {
    startLogsPoll();
  }
}

function classifyLogLine(line) {
  if (/^!!! CRASH:/.test(line)) return "log-crash";
  if (/^=== boot /.test(line)) return "log-boot";
  if (/^E /i.test(line)) return "log-E";
  if (/^W /i.test(line)) return "log-W";
  if (/^I /i.test(line)) return "log-I";
  return "log-plain";
}

function renderLogLines(text) {
  const viewer = el.settingsLogsViewer;
  if (!viewer) return;
  if (typeof text !== "string" || text.length === 0) {
    viewer.textContent = t("settings.logs.empty");
    if (el.logsMeta) el.logsMeta.textContent = "";
    return;
  }

  const lines = text.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  if (lines.length === 0) {
    viewer.textContent = t("settings.logs.empty");
    if (el.logsMeta) el.logsMeta.textContent = "";
    return;
  }

  const start = Math.max(0, lines.length - LOGS_MAX_LINES);
  const fragment = document.createDocumentFragment();
  for (let i = start; i < lines.length; i++) {
    const line = document.createElement("div");
    line.className = "log-line " + classifyLogLine(lines[i]);
    line.textContent = lines[i];
    fragment.appendChild(line);
  }
  viewer.textContent = "";
  viewer.appendChild(fragment);
  if (el.logsMeta) {
    el.logsMeta.textContent = t("settings.logs.updated", { time: new Date().toLocaleTimeString() });
  }
}

async function loadLogs(manual = true) {
  if (!el.settingsLogsViewer) return;
  const seq = ++editor.logs.requestSeq;
  if (manual && el.logsMeta) {
    el.logsMeta.textContent = t("settings.logs.loading");
  }
  try {
    const response = await fetch("/api/logs", { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const text = await response.text();
    if (seq !== editor.logs.requestSeq) return;
    renderLogLines(text);
    if (el.logsAutoScroll && el.logsAutoScroll.checked && el.settingsLogsViewer) {
      el.settingsLogsViewer.scrollTop = el.settingsLogsViewer.scrollHeight;
    }
  } catch (err) {
    if (seq !== editor.logs.requestSeq) return;
    if (el.logsMeta) {
      el.logsMeta.textContent = t("settings.logs.fetch_failed", {
        error: err?.message || String(err),
      });
    }
  } finally {
    if (seq === editor.logs.requestSeq) {
      scheduleLogsPoll();
    }
  }
}

async function clearLogs() {
  if (el.logsMeta) el.logsMeta.textContent = t("settings.logs.loading");
  try {
    const response = await fetch("/api/logs", { method: "DELETE", cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    if (el.logsMeta) el.logsMeta.textContent = t("settings.logs.cleared");
  } catch (err) {
    if (el.logsMeta) {
      el.logsMeta.textContent = t("settings.logs.clear_failed", {
        error: err?.message || String(err),
      });
    }
  }
  void loadLogs(false);
}

const DIAGNOSTICS_POLL_MS = 10000;

function formatDuration(ms) {
  const num = Number(ms);
  if (!Number.isFinite(num) || num <= 0) return "—";
  return formatUptimeMinutes(Math.round(num / 60000));
}

function formatUptimeMinutes(minutes) {
  const mins = Math.max(0, Math.round(Number(minutes) || 0));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const rest = mins % 60;
  if (days > 0) return `${days}d ${hours}h ${rest}m`;
  if (hours > 0) return `${hours}h ${rest}m`;
  return `${rest}m`;
}

function diagnosticsRow(key, value, tone) {
  const row = document.createElement("div");
  row.className = "diag-row";
  const keySpan = document.createElement("span");
  keySpan.className = "diag-key";
  keySpan.textContent = key;
  const valueSpan = document.createElement("span");
  valueSpan.className = "diag-value" + (tone ? ` diag-${tone}` : "");
  valueSpan.textContent = value === undefined || value === null || value === "" ? "—" : String(value);
  row.appendChild(keySpan);
  row.appendChild(valueSpan);
  return row;
}

function diagnosticsCard(title, rows, note) {
  const card = document.createElement("div");
  card.className = "diag-card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  card.appendChild(heading);
  for (const row of rows) {
    if (row) card.appendChild(row);
  }
  if (note) {
    const noteEl = document.createElement("p");
    noteEl.className = "diag-note";
    noteEl.textContent = note;
    card.appendChild(noteEl);
  }
  return card;
}

function diagnosticsOtaStateLabel(state) {
  const table = {
    new: t("settings.diagnostics.ota_state.new"),
    pending_verify: t("settings.diagnostics.ota_state.pending_verify"),
    valid: t("settings.diagnostics.ota_state.valid"),
    invalid: t("settings.diagnostics.ota_state.invalid"),
    aborted: t("settings.diagnostics.ota_state.aborted"),
  };
  return table[state] || t("settings.diagnostics.ota_state.undefined");
}

function renderDiagnostics(data) {
  const grid = el.diagnosticsGrid;
  if (!grid) return;
  grid.textContent = "";
  if (!data || typeof data !== "object") {
    if (el.diagnosticsMeta) el.diagnosticsMeta.textContent = t("settings.diagnostics.empty");
    return;
  }

  const app = data.app || {};
  const chip = data.chip || {};
  const memory = data.memory || {};
  const wifi = data.wifi || {};
  const ha = data.ha || {};
  const haLink = ha.link || {};
  const mqtt = data.mqtt || {};
  const ota = data.ota || {};

  const statusCard = diagnosticsCard(t("settings.diagnostics.card_status"), [
    diagnosticsRow(t("settings.diagnostics.uptime"), formatUptimeMinutes((Number(data.uptime_ms) || 0) / 60000)),
    diagnosticsRow(t("settings.diagnostics.reset_reason"), ota.reset_reason),
    diagnosticsRow(t("settings.diagnostics.boot_count"), ota.boot_count),
    diagnosticsRow(
      t("settings.diagnostics.cpu_temp"),
      data.cpu_temp_c === undefined ? "—" : `${Number(data.cpu_temp_c).toFixed(1)} °C`,
      data.cpu_temp_c === undefined ? null : "ok"
    ),
  ]);

  const fwCard = diagnosticsCard(t("settings.diagnostics.card_firmware"), [
    diagnosticsRow(t("settings.diagnostics.version"), app.version),
    diagnosticsRow(t("settings.diagnostics.project"), app.project),
    diagnosticsRow(t("settings.diagnostics.idf"), app.idf_version),
    diagnosticsRow(t("settings.diagnostics.build_date"), `${app.build_date || ""} ${app.build_time || ""}`.trim()),
    diagnosticsRow(t("settings.diagnostics.panel"), `${chip.model || "—"} (${chip.cores || "?"} cores, r${chip.revision})`),
    diagnosticsRow(t("settings.diagnostics.screen"), `${chip.screen_w || "?"}x${chip.screen_h || "?"}`),
  ]);

  const memoryRegions = memory.regions || {};
  const internalRegion = memoryRegions.internal || {};
  const dmaRegion = memoryRegions.internal_dma || {};
  // The RGB panel bounce buffers need two DMA-capable blocks of roughly 15 kB
  // each, therefore a small largest block is the early warning that the driver
  // is about to fail its next allocation.
  const dmaLargest = Number(dmaRegion.largest_block);
  const dmaStatus = Number.isFinite(dmaLargest) ? (dmaLargest < 20480 ? "warn" : "ok") : null;
  const internalBlocks =
    internalRegion.alloc_blocks === undefined
      ? "n/a"
      : `${internalRegion.alloc_blocks} / ${internalRegion.free_blocks}`;

  const memoryCard = diagnosticsCard(t("settings.diagnostics.card_memory"), [
    diagnosticsRow(t("settings.diagnostics.heap_free"), formatBytes(memory.heap_free)),
    diagnosticsRow(t("settings.diagnostics.heap_min"), formatBytes(memory.heap_free_min)),
    diagnosticsRow(t("settings.diagnostics.heap_largest"), formatBytes(memory.heap_largest_block)),
    diagnosticsRow(
      t("settings.diagnostics.heap_fragmentation"),
      `${Number(memory.heap_fragmentation_pct || 0).toFixed(0)} %`,
      Number(memory.heap_fragmentation_pct || 0) >= 40 ? "warn" : "ok"
    ),
    diagnosticsRow(
      t("settings.diagnostics.heap_dma"),
      `${formatBytes(dmaRegion.free)} / ${formatBytes(dmaRegion.largest_block)}`,
      dmaStatus
    ),
    diagnosticsRow(t("settings.diagnostics.heap_blocks"), internalBlocks),
    diagnosticsRow(t("settings.diagnostics.iram_free"), formatBytes(memory.iram_free)),
    diagnosticsRow(t("settings.diagnostics.psram_free"), formatBytes(memory.psram_free)),
  ]);

  const wifiCard = diagnosticsCard(t("settings.diagnostics.card_wifi"), [
    diagnosticsRow(
      t("settings.diagnostics.connected"),
      wifi.connected ? t("settings.diagnostics.yes") : t("settings.diagnostics.no"),
      wifi.connected ? "ok" : "bad"
    ),
    diagnosticsRow(t("settings.diagnostics.ssid"), wifi.ssid),
    diagnosticsRow(t("settings.diagnostics.ip"), wifi.ip),
    diagnosticsRow(
      t("settings.diagnostics.rssi"),
      wifi.rssi === undefined ? "—" : `${wifi.rssi} dBm`,
      wifi.rssi === undefined ? null : Number(wifi.rssi) <= -75 ? "warn" : "ok"
    ),
    diagnosticsRow(t("settings.diagnostics.channel"), wifi.channel),
    diagnosticsRow(t("settings.diagnostics.wifi_drops"), wifi.disconnect_count),
    diagnosticsRow(t("settings.diagnostics.wifi_reconnects"), wifi.reconnect_count),
    diagnosticsRow(t("settings.diagnostics.wifi_recoveries"), wifi.hard_recover_count),
    diagnosticsRow(
      t("settings.diagnostics.wifi_last_drop"),
      wifi.disconnect_count ? `${wifi.last_disconnect_reason} (${wifiDisconnectReasonLabel(wifi.last_disconnect_reason)})` : "—"
    ),
    diagnosticsRow(t("settings.diagnostics.wifi_session"), formatDuration(wifi.last_session_ms)),
  ]);

  const haCard = diagnosticsCard(t("settings.diagnostics.card_ha"), [
    diagnosticsRow(
      t("settings.diagnostics.connected"),
      ha.connected ? t("settings.diagnostics.yes") : t("settings.diagnostics.no"),
      ha.connected ? "ok" : "bad"
    ),
    diagnosticsRow(
      t("settings.diagnostics.sync_done"),
      ha.initial_sync_done ? t("settings.diagnostics.yes") : t("settings.diagnostics.no"),
      ha.initial_sync_done ? "ok" : "warn"
    ),
    diagnosticsRow(t("settings.diagnostics.base_url"), ha.base_url),
    diagnosticsRow(t("settings.diagnostics.cert_cn"), ha.cert_common_name),
    diagnosticsRow(t("settings.diagnostics.ws_connects"), haLink.connect_count),
    diagnosticsRow(t("settings.diagnostics.ws_disconnects"), haLink.disconnect_count),
    diagnosticsRow(t("settings.diagnostics.ws_recoveries"), haLink.recover_count),
    diagnosticsRow(
      t("settings.diagnostics.ws_last_session"),
      formatDuration(haLink.last_session_ms)
    ),
    diagnosticsRow(
      t("settings.diagnostics.missing_entities"),
      ha.missing_entities ? String(ha.missing_entities) : "0",
      ha.missing_entities ? "warn" : "ok"
    ),
  ]);

  const mqttCard = diagnosticsCard(t("settings.diagnostics.card_mqtt"), [
    diagnosticsRow(
      t("settings.diagnostics.mqtt_enabled"),
      mqtt.enabled ? t("settings.diagnostics.yes") : t("settings.diagnostics.no")
    ),
    diagnosticsRow(
      t("settings.diagnostics.connected"),
      mqtt.connected ? t("settings.diagnostics.yes") : t("settings.diagnostics.no"),
      mqtt.connected ? "ok" : mqtt.enabled ? "warn" : null
    ),
    diagnosticsRow(t("settings.diagnostics.mqtt_tls"), mqtt.tls ? t("settings.diagnostics.yes") : t("settings.diagnostics.no")),
    diagnosticsRow(t("settings.diagnostics.broker"), mqtt.broker_uri),
  ]);

  const otaState = ota.image_state || "";
  const rollbackArmed = otaState === "pending_verify";
  const bootloaderNote =
    ota.rollback_enabled && (!otaState || otaState === "undefined")
      ? t("settings.diagnostics.bootloader_note")
      : null;

  const otaCard = diagnosticsCard(
    t("settings.diagnostics.card_ota"),
    [
      diagnosticsRow(t("settings.diagnostics.running_partition"), ota.running_partition),
      diagnosticsRow(t("settings.diagnostics.next_partition"), ota.next_update_partition),
      diagnosticsRow(
        t("settings.diagnostics.image_state"),
        otaState ? diagnosticsOtaStateLabel(otaState) : "—",
        rollbackArmed ? "warn" : otaState && otaState !== "undefined" ? "ok" : null
      ),
      diagnosticsRow(
        t("settings.diagnostics.rollback_enabled"),
        ota.rollback_enabled ? t("settings.diagnostics.yes") : t("settings.diagnostics.no"),
        ota.rollback_enabled ? "ok" : "warn"
      ),
      diagnosticsRow(
        t("settings.diagnostics.boot_confirmed"),
        rollbackArmed
          ? t("settings.diagnostics.no")
          : ota.boot_confirmed
            ? t("settings.diagnostics.yes")
            : "—",
        rollbackArmed ? "warn" : null
      ),
    ],
    bootloaderNote
  );

  grid.appendChild(statusCard);
  grid.appendChild(fwCard);
  grid.appendChild(memoryCard);
  grid.appendChild(wifiCard);
  grid.appendChild(haCard);
  grid.appendChild(mqttCard);
  grid.appendChild(otaCard);

  if (el.diagnosticsMeta) {
    el.diagnosticsMeta.textContent = t("settings.diagnostics.updated", { time: new Date().toLocaleTimeString() });
  }
}

function wifiDisconnectReasonLabel(reason) {
  const table = {
    1: "UNSPECIFIED",
    2: "AUTH_EXPIRE",
    3: "AUTH_LEAVE",
    4: "ASSOC_EXPIRE",
    5: "ASSOC_TOOMANY",
    6: "NOT_AUTHED",
    7: "NOT_ASSOCED",
    8: "ASSOC_LEAVE",
    9: "ASSOC_NOT_AUTHED",
    15: "4WAY_HANDSHAKE_TIMEOUT",
    16: "GROUP_KEY_UPDATE_TIMEOUT",
    17: "IE_IN_4WAY_DIFFERS",
    18: "GROUP_CIPHER_INVALID",
    19: "PAIRWISE_CIPHER_INVALID",
    20: "AKMP_INVALID",
    21: "UNSUPP_GROUP_CIPHER",
    22: "UNSUPP_PAIRWISE_CIPHER",
    23: "UNSUPP_AKMP",
    24: "UNSUPP_RSN_IE_VERSION",
    25: "INVALID_RSN_IE_CAP",
    26: "802_1X_AUTH_FAILED",
    27: "CIPHER_SUITE_REJECTED",
    200: "BEACON_TIMEOUT",
    201: "NO_AP_FOUND",
    202: "AUTH_FAIL",
    203: "ASSOC_FAIL",
    204: "HANDSHAKE_TIMEOUT",
    205: "CONNECTION_FAIL",
  };
  return table[Number(reason)] || "UNKNOWN";
}

function clearDiagnosticsPoll() {
  if (editor.diagnostics.pollTimerId) {
    window.clearTimeout(editor.diagnostics.pollTimerId);
    editor.diagnostics.pollTimerId = null;
  }
}

function scheduleDiagnosticsPoll() {
  clearDiagnosticsPoll();
  if (!el.diagnosticsAutoRefresh || !el.diagnosticsAutoRefresh.checked) return;
  editor.diagnostics.pollTimerId = window.setTimeout(() => {
    editor.diagnostics.pollTimerId = null;
    void loadDiagnostics(false);
  }, DIAGNOSTICS_POLL_MS);
}

async function loadDiagnostics(manual = true) {
  if (!el.diagnosticsGrid) return;
  const seq = ++editor.diagnostics.requestSeq;
  if (manual && el.diagnosticsMeta) {
    el.diagnosticsMeta.textContent = t("settings.diagnostics.loading");
  }
  try {
    const response = await fetch("/api/diagnostics", { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    if (seq !== editor.diagnostics.requestSeq) return;
    editor.diagnostics.lastData = data;
    renderDiagnostics(data);
  } catch (err) {
    if (seq !== editor.diagnostics.requestSeq) return;
    if (el.diagnosticsMeta) {
      el.diagnosticsMeta.classList.add("error");
      el.diagnosticsMeta.textContent = t("settings.diagnostics.fetch_failed", {
        error: err?.message || String(err),
      });
    }
  } finally {
    if (seq === editor.diagnostics.requestSeq) {
      scheduleDiagnosticsPoll();
    }
  }
}

function setSectionCollapsed(sectionKey, collapsed) {
  const map = {
    pages: { section: el.pagesSection, toggle: el.togglePagesSection },
    widgets: { section: el.widgetsSection, toggle: el.toggleWidgetsSection },
    inspector: { section: el.inspectorSection, toggle: el.toggleInspectorSection },
  };
  const entry = map[sectionKey];
  if (!entry || !entry.section || !entry.toggle) return;

  const nextCollapsed = Boolean(collapsed);
  editor.sectionCollapsed[sectionKey] = nextCollapsed;
  entry.section.classList.toggle("collapsed", nextCollapsed);
  entry.toggle.textContent = nextCollapsed ? "+" : "-";
  entry.toggle.setAttribute("aria-expanded", nextCollapsed ? "false" : "true");
}

function toggleSection(sectionKey) {
  setSectionCollapsed(sectionKey, !editor.sectionCollapsed[sectionKey]);
}

function applySectionCollapseState() {
  setSectionCollapsed("pages", editor.sectionCollapsed.pages);
  setSectionCollapsed("widgets", editor.sectionCollapsed.widgets);
  setSectionCollapsed("inspector", editor.sectionCollapsed.inspector);
}

function rgbIntToHex(value) {
  const v = Number(value) || 0;
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgbInt(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return 0xffffff;
  return parseInt(m[1], 16) & 0xffffff;
}

/* Flip mode has no seconds digit, so the option is disabled while it is picked. */
function syncClockStyleUi() {
  const flip = el.settingsClockStyle ? el.settingsClockStyle.value === "flip" : false;
  if (el.settingsShowSeconds) el.settingsShowSeconds.disabled = flip;
  const hint = document.getElementById("settingsClockStyleHint");
  if (hint) hint.textContent = flip ? t("settings.display.clock_style_hint") : "";
}

function renderSettings() {
  const settings = editor.settings || {};
  const wifi = settings.wifi || {};
  const ha = settings.ha || {};
  const time = settings.time || {};
  const ui = settings.ui || {};
  const display = settings.display || {};
  const mqtt = settings.mqtt || {};
  const system = settings.system || {};
  const scanSupported = wifi.scan_supported !== false;
  editor.wifiScanSupported = scanSupported;

  el.settingsWifiSsid.value = wifi.ssid || "";
  if (el.settingsWifiCountryCode) {
    el.settingsWifiCountryCode.value = normalizeCountryCode(wifi.country_code) || "US";
  }
  if (el.settingsWifiBssid) {
    el.settingsWifiBssid.value = normalizeBssid(wifi.bssid || "");
  }
  if (el.settingsWifiStaticEnabled) {
    el.settingsWifiStaticEnabled.checked = wifi.static_enabled === true;
  }
  if (el.settingsWifiStaticIp) {
    el.settingsWifiStaticIp.value = wifi.static_ip || "";
  }
  if (el.settingsWifiStaticNetmask) {
    el.settingsWifiStaticNetmask.value = wifi.static_netmask || "";
  }
  if (el.settingsWifiStaticGateway) {
    el.settingsWifiStaticGateway.value = wifi.static_gateway || "";
  }
  if (el.settingsWifiStaticDns) {
    el.settingsWifiStaticDns.value = wifi.static_dns || "";
  }
  el.settingsWifiPassword.value = "";
  el.settingsHaUrl.value = ha.ws_url || "";
  el.settingsHaToken.value = "";
  if (el.settingsHaRestEnabled) {
    el.settingsHaRestEnabled.checked = ha.rest_enabled === true;
  }
  el.settingsNtpServer.value = time.ntp_server || "";
  renderTimezoneSettings(time);
  if (el.settingsLanguage) {
    el.settingsLanguage.value = normalizeUiLanguage(ui.language);
  }
  renderLanguageOptions();

  const connectedRssiText = Number.isFinite(Number(wifi.rssi_dbm))
    ? `${Math.round(Number(wifi.rssi_dbm))} dBm`
    : "n/a";
  const connectedBssid = normalizeBssid(wifi.connected_bssid || "");
  const connectedChannel = Number.isFinite(Number(wifi.connected_channel))
    ? String(Math.round(Number(wifi.connected_channel)))
    : "n/a";

  el.settingsWifiInfo.textContent = [
    `${t("settings.info.configured")}: ${wifi.configured ? t("common.yes") : t("common.no")}`,
    `${t("settings.info.connected")}: ${wifi.connected ? t("common.yes") : t("common.no")}`,
    `${t("settings.info.password_stored")}: ${wifi.password_set ? t("common.yes") : t("common.no")}`,
    `${t("settings.info.country")}: ${normalizeCountryCode(wifi.country_code) || "US"}`,
    `${t("settings.info.rssi")}: ${connectedRssiText}`,
    `${t("settings.info.connected_bssid")}: ${connectedBssid || "n/a"}`,
    `${t("settings.info.channel")}: ${connectedChannel}`,
  ].join(" | ");

  el.settingsHaInfo.textContent = [
    `${t("settings.info.configured")}: ${ha.configured ? t("common.yes") : t("common.no")}`,
    `${t("settings.info.connected")}: ${ha.connected ? t("common.yes") : t("common.no")}`,
    `${t("settings.info.token_stored")}: ${ha.access_token_set ? t("common.yes") : t("common.no")}`,
    `${t("settings.info.rest_fallback")}: ${ha.rest_enabled ? t("common.yes") : t("common.no")}`,
  ].join(" | ");

  el.settingsTimeInfo.textContent = t("settings.time.info");

  if (el.settingsBrightness) {
    el.settingsBrightness.value = Math.round(clamp(Number(display.brightness) || 0, 1, 100));
  }
  if (el.settingsScreensaverEnabled) {
    el.settingsScreensaverEnabled.checked = display.screensaver_enabled === true;
  }
  if (el.settingsScreensaverTimeout) {
    el.settingsScreensaverTimeout.value = Math.round(clamp(Number(display.screensaver_timeout_sec) || 0, 5, 7200));
  }
  if (el.settingsSaverBrightness) {
    el.settingsSaverBrightness.value = Math.round(clamp(Number(display.saver_brightness) || 0, 1, 100));
  }
  if (el.settingsScreenOffEnabled) {
    el.settingsScreenOffEnabled.checked = display.screen_off_enabled === true;
  }
  if (el.settingsScreenOffTimeout) {
    el.settingsScreenOffTimeout.value = Math.round(clamp(Number(display.screen_off_timeout_sec) || 0, 5, 7200));
  }
  if (el.settingsClockFormat) {
    /* Anything but an explicit false is 24 hour, matching the firmware default. */
    el.settingsClockFormat.value = display.clock_24h === false ? "h12" : "h24";
  }
  if (el.settingsClockStyle) {
    el.settingsClockStyle.value = Number(display.saver_clock_style) === 1 ? "flip" : "classic";
    if (el.settingsClockStyle.dataset.clockStyleBound !== "1") {
      el.settingsClockStyle.dataset.clockStyleBound = "1";
      el.settingsClockStyle.addEventListener("change", syncClockStyleUi);
    }
    syncClockStyleUi();
  }
  if (el.settingsShowSeconds) {
    el.settingsShowSeconds.checked = display.saver_show_seconds === true;
  }
  if (el.settingsShowDate) {
    el.settingsShowDate.checked = display.saver_show_date !== false;
  }
  if (el.settingsClockColor) {
    el.settingsClockColor.value = rgbIntToHex(display.saver_clock_color);
  }
  if (el.settingsDateColor) {
    el.settingsDateColor.value = rgbIntToHex(display.saver_date_color);
  }
  if (el.settingsNightModeEnabled) {
    el.settingsNightModeEnabled.checked = display.night_mode_enabled === true;
  }
  if (el.settingsNightStart) {
    el.settingsNightStart.value = minutesToTimeString(clampInt(display.night_start_min, 0, 1439, 1320));
  }
  if (el.settingsNightEnd) {
    el.settingsNightEnd.value = minutesToTimeString(clampInt(display.night_end_min, 0, 1439, 360));
  }
  if (el.settingsNightBrightness) {
    el.settingsNightBrightness.value = clampInt(display.night_brightness, 0, 100, 0);
  }
  if (el.settingsNightWakeSec) {
    el.settingsNightWakeSec.value = clampInt(display.night_wake_sec, 0, 3600, 20);
  }
  if (el.settingsNightHint) {
    el.settingsNightHint.textContent =
      display.night_active === true
        ? `${t("settings.display.night_hint")} ${t("settings.display.night_currently_active")}`
        : t("settings.display.night_hint");
  }
  autoThemeState.enabled = display.theme_auto_enabled === true;
  autoThemeState.dayId = typeof display.theme_day_id === "string" ? display.theme_day_id : "";
  autoThemeState.nightId = typeof display.theme_night_id === "string" ? display.theme_night_id : "";
  if (el.settingsThemeAutoEnabled) {
    el.settingsThemeAutoEnabled.checked = autoThemeState.enabled;
  }
  themePopulateAutoSelects();
  if (el.settingsDisplayInfo) {
    el.settingsDisplayInfo.textContent = t("settings.display.info");
  }
  if (el.settingsPageTransition) {
    const mode = typeof display.page_transition === "string" ? display.page_transition : "fade";
    el.settingsPageTransition.value = PAGE_TRANSITION_MODES.indexOf(mode) >= 0 ? mode : "fade";
  }
  if (el.settingsPageTransitionMs) {
    el.settingsPageTransitionMs.value = clampInt(display.page_transition_ms, 0, 1200, 220);
  }
  if (el.settingsPageTransitionHint) {
    el.settingsPageTransitionHint.textContent = t("settings.pages.transition_hint");
  }
  if (el.settingsTilePressFx) {
    const mode = typeof display.tile_press_fx === "string" ? display.tile_press_fx : "both";
    el.settingsTilePressFx.value = TILE_PRESS_FX_MODES.indexOf(mode) >= 0 ? mode : "both";
  }
  if (el.settingsTilePressFxDim) {
    el.settingsTilePressFxDim.value = clampInt(display.tile_press_fx_dim, 0, 60, 15);
  }
  if (el.settingsTilePressFxScale) {
    el.settingsTilePressFxScale.value = clampInt(display.tile_press_fx_scale, 90, 100, 97);
  }
  if (el.settingsTilePressFxHint) {
    el.settingsTilePressFxHint.textContent = t("settings.display.press_fx_hint");
  }
  updatePressFxCss();
  if (el.settingsValueAnim) {
    const mode = typeof display.value_anim === "string" ? display.value_anim : "count";
    el.settingsValueAnim.value = VALUE_ANIM_MODES.indexOf(mode) >= 0 ? mode : "count";
  }
  if (el.settingsValueAnimMs) {
    el.settingsValueAnimMs.value = clampInt(display.value_anim_ms, 0, 1500, 320);
  }
  if (el.settingsValueAnimHint) {
    el.settingsValueAnimHint.textContent = t("settings.display.value_anim_hint");
  }
  updateValueAnimCss();

  if (el.settingsTopbarShowClock) {
    el.settingsTopbarShowClock.checked = display.topbar_show_clock !== false;
  }
  if (el.settingsTopbarShowDate) {
    el.settingsTopbarShowDate.checked = display.topbar_show_date !== false;
  }
  if (el.settingsTopbarShowGear) {
    el.settingsTopbarShowGear.checked = display.topbar_show_gear !== false;
  }
  if (el.settingsTopbarShowStatus) {
    el.settingsTopbarShowStatus.checked = display.topbar_show_status !== false;
  }
  if (el.settingsTopbarIconText) {
    el.settingsTopbarIconText.checked = display.topbar_icon_text === true;
  }
  if (el.settingsTopbarCustomColors) {
    el.settingsTopbarCustomColors.checked = display.topbar_custom_colors === true;
  }
  if (el.settingsTopbarBgColor) {
    el.settingsTopbarBgColor.value = rgbIntToHex(display.topbar_bg_color, "#0D1723");
  }
  if (el.settingsTopbarClockColor) {
    el.settingsTopbarClockColor.value = rgbIntToHex(display.topbar_clock_color, "#EAF2FA");
  }
  if (el.settingsTopbarDateColor) {
    el.settingsTopbarDateColor.value = rgbIntToHex(display.topbar_date_color, "#A1B1C1");
  }
  if (el.settingsTopbarGearColor) {
    el.settingsTopbarGearColor.value = rgbIntToHex(display.topbar_gear_color, "#A1B1C1");
  }
  if (el.settingsTopbarHaColor) {
    el.settingsTopbarHaColor.value = rgbIntToHex(display.topbar_ha_color, "#C7D1DB");
  }
  if (el.settingsTopbarWifiColor) {
    el.settingsTopbarWifiColor.value = rgbIntToHex(display.topbar_wifi_color, "#C7D1DB");
  }
  if (el.settingsTopbarHint) {
    el.settingsTopbarHint.textContent = t("settings.display.topbar_hint");
  }
  if (el.settingsTopbarColorHint) {
    el.settingsTopbarColorHint.textContent = t("settings.display.topbar_color_hint");
  }
  if (el.settingsNavCustomColors) {
    el.settingsNavCustomColors.checked = display.nav_custom_colors === true;
  }
  if (el.settingsNavBarBgColor) {
    el.settingsNavBarBgColor.value = rgbIntToHex(display.nav_bar_bg_color, "#0D1723");
  }
  if (el.settingsNavBarBorderColor) {
    el.settingsNavBarBorderColor.value = rgbIntToHex(display.nav_bar_border_color, "#2A3D50");
  }
  if (el.settingsNavButtonBgColor) {
    el.settingsNavButtonBgColor.value = rgbIntToHex(display.nav_button_bg_color, "#1B2A3A");
  }
  if (el.settingsNavButtonBorderColor) {
    el.settingsNavButtonBorderColor.value = rgbIntToHex(display.nav_button_border_color, "#385064");
  }
  if (el.settingsNavTabIdleColor) {
    el.settingsNavTabIdleColor.value = rgbIntToHex(display.nav_tab_idle_color, "#A9C3D0");
  }
  if (el.settingsNavTabActiveColor) {
    el.settingsNavTabActiveColor.value = rgbIntToHex(display.nav_tab_active_color, "#6FE8FF");
  }
  if (el.settingsNavHomeIdleColor) {
    el.settingsNavHomeIdleColor.value = rgbIntToHex(display.nav_home_idle_color, "#9EB8C7");
  }
  if (el.settingsNavHomeActiveColor) {
    el.settingsNavHomeActiveColor.value = rgbIntToHex(display.nav_home_active_color, "#53E5FF");
  }
  if (el.settingsNavColorHint) {
    el.settingsNavColorHint.textContent = t("settings.display.nav_color_hint");
  }
  updateTopbarCss();
  updateNavCss();

  if (el.settingsMqttEnabled) {
    el.settingsMqttEnabled.checked = mqtt.enabled === true;
  }
  if (el.settingsMqttUseTls) {
    el.settingsMqttUseTls.checked = mqtt.use_tls === true;
  }
  if (el.settingsMqttTlsHint) {
    el.settingsMqttTlsHint.textContent = t("settings.mqtt.tls_hint");
  }
  if (el.settingsMqttHost) {
    el.settingsMqttHost.value = mqtt.host || "";
  }
  if (el.settingsMqttPort) {
    el.settingsMqttPort.value = Math.round(clamp(Number(mqtt.port) || 0, 1, 65535));
  }
  if (el.settingsMqttUsername) {
    el.settingsMqttUsername.value = mqtt.username || "";
  }
  if (el.settingsMqttPassword) {
    el.settingsMqttPassword.value = "";
  }
  if (el.settingsMqttDiscoveryPrefix) {
    el.settingsMqttDiscoveryPrefix.value = mqtt.discovery_prefix || "homeassistant";
  }
  if (el.settingsMqttInfo) {
    el.settingsMqttInfo.textContent = [
      t("settings.mqtt.info"),
      `${t("settings.info.connected")}: ${mqtt.connected ? t("common.yes") : t("common.no")}`,
      `${t("settings.info.password_stored")}: ${mqtt.password_set ? t("common.yes") : t("common.no")}`,
    ].join(" | ");
  }

  if (el.settingsAutoRestartEnabled) {
    el.settingsAutoRestartEnabled.checked = system.auto_restart_enabled === true;
  }
  if (el.settingsAutoRestartHours) {
    el.settingsAutoRestartHours.value = Math.round(clamp(Number(system.auto_restart_hours) || 0, 1, 168));
  }
  if (el.settingsSystemInfo) {
    el.settingsSystemInfo.textContent = t("settings.system.hint");
  }

  if (el.settingsUiInfo) {
    el.settingsUiInfo.textContent = t("settings.ui.info");
  }
  if (el.settingsTranslationInfo && !el.settingsTranslationInfo.classList.contains("error")) {
    el.settingsTranslationInfo.textContent = t("settings.translation.info");
  }

  if (wifi.setup_ap_active) {
    const ssid = wifi.setup_ap_ssid || "(unknown)";
    el.settingsApInfo.textContent = t("settings.ap.active", { ssid });
  } else {
    el.settingsApInfo.textContent = t("settings.ap.inactive");
  }

  if (!scanSupported) {
    setWifiScanInfo(t("wifi.scan_unavailable"));
  } else if (!editor.wifiScanHasRun && !editor.wifiScanInProgress) {
    setWifiScanInfo(t("wifi.scan_click"));
  }
  if (el.scanWifiBtn) {
    el.scanWifiBtn.disabled = !scanSupported || editor.wifiScanInProgress;
  }
  renderOtaStatus(editor.ota.status);
  if (editor.ota.latestUrl) {
    applyLatestOtaUrl(editor.ota.latestUrl);
  } else {
    void refreshLatestOtaUrl();
  }
  renderWifiScanResults(editor.wifiScanItems);
  void loadPanelPages(false);
  void loadSdState(true);
  renderSdFiles();
}

function renderWifiScanResults(items, scope = "settings") {
  const ui = getWifiScanUi(scope);
  const select = ui.resultsSelect;
  if (!select) return;

  const currentSsid = ui.ssidInput ? ui.ssidInput.value.trim() : "";
  select.innerHTML = "";
  if (!editor.wifiScanSupported) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("wifi.scan.option_unavailable", {}, "Scan unavailable");
    select.appendChild(option);
    return;
  }

  if (editor.wifiScanInProgress) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("wifi.scan.option_scanning", {}, "Scanning...");
    select.appendChild(option);
    return;
  }

  if (!editor.wifiScanHasRun) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("wifi.scan.option_not_run", {}, "No scan yet");
    select.appendChild(option);
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("wifi.scan.option_no_networks", {}, "No networks found");
    select.appendChild(option);
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("wifi.scan.option_select", { count: items.length }, `Select network (${items.length} found)`);
  select.appendChild(placeholder);

  let firstMatchingSsidValue = "";
  for (let idx = 0; idx < items.length; idx++) {
    const net = items[idx];
    if (!net || typeof net.ssid !== "string" || !net.ssid.length) continue;

    const bssid = normalizeBssid(net.bssid || "");
    const rssiText = Number.isFinite(Number(net.rssi)) ? `${Math.round(Number(net.rssi))} dBm` : "n/a";
    const authmodeText = (typeof net.authmode === "string" && net.authmode.length) ? net.authmode : "unknown";
    const channelText = Number.isFinite(Number(net.channel)) ? `ch ${Math.round(Number(net.channel))}` : "ch ?";
    const details = [rssiText, authmodeText, channelText];
    if (bssid) {
      details.push(bssid);
    }
    if (net.connected === true) {
      details.push(t("wifi.scan.connected_tag", {}, "connected"));
    }

    const option = document.createElement("option");
    option.value = bssid || `${net.ssid}#${idx}`;
    option.dataset.ssid = net.ssid;
    option.dataset.bssid = bssid;
    option.textContent = `${net.ssid} (${details.join(", ")})`;
    select.appendChild(option);

    if (!firstMatchingSsidValue && currentSsid && net.ssid === currentSsid) {
      firstMatchingSsidValue = option.value;
    }
  }

  if (firstMatchingSsidValue) {
    select.value = firstMatchingSsidValue;
  }
}

async function scanWifiNetworks(scope = "settings") {
  const ui = getWifiScanUi(scope);
  if (!ui.scanButton) return;
  if (!editor.wifiScanSupported) {
    setWifiScanInfo(
      t("wifi.scan_unavailable"),
      false,
      scope
    );
    return;
  }
  if (editor.wifiScanInProgress) return;

  editor.wifiScanInProgress = true;
  ui.scanButton.disabled = true;
  renderWifiScanResults([], scope);
  setWifiScanInfo(t("status.wifi_scan_running"), false, scope);
  setStatus(t("status.wifi_scan_running"));

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch("/api/wifi/scan", {
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await response.text();
    let data = null;
    if (body) {
      try {
        data = JSON.parse(body);
      } catch (_) {
        data = null;
      }
    }

    if (!response.ok) {
      const detail = data?.message || data?.error || `${response.status} ${response.statusText}`;
      throw new Error(detail);
    }

    data = data || {};
    editor.wifiScanItems = Array.isArray(data.items) ? data.items : [];
    editor.wifiScanHasRun = true;
    renderWifiScanResults(editor.wifiScanItems, scope);

    if (editor.wifiScanItems.length > 0) {
      setWifiScanInfo(
        t("wifi.scan_found", { count: editor.wifiScanItems.length }),
        false,
        scope
      );
    } else {
      setWifiScanInfo(t("wifi.scan_no_networks"), false, scope);
    }
    setStatus(t("status.wifi_scan_complete", { count: editor.wifiScanItems.length }));
  } catch (err) {
    editor.wifiScanHasRun = true;
    renderWifiScanResults(editor.wifiScanItems, scope);
    const detail = err?.name === "AbortError"
      ? t("status.wifi_scan_timeout")
      : (err?.message || t("common.unknown_error"));
    setWifiScanInfo(detail, true, scope);
    setStatus(t("status.wifi_scan_failed", { error: detail }), true);
  } finally {
    window.clearTimeout(timeoutId);
    editor.wifiScanInProgress = false;
    renderWifiScanResults(editor.wifiScanItems, scope);
    ui.scanButton.disabled = false;
  }
}

const timezonePicker = { names: [], matches: [], index: -1, bound: false, timer: null,
  clock: NaN, received: 0, requested: -Infinity, busy: false, active: "" };

function timezoneSelectionLabel() {
  const value = el.settingsTimezone.value;
  return timezonePicker.names.includes(value) ? value : "";
}

function closeTimezoneOptions() {
  document.getElementById("settingsTimezoneOptions").hidden = true;
  const search = document.getElementById("settingsTimezoneSearch");
  search.setAttribute("aria-expanded", "false");
  search.removeAttribute("aria-activedescendant");
  document.getElementById("settingsTimezoneToggle").setAttribute("aria-expanded", "false");
  search.value = timezoneSelectionLabel();
}

function selectTimezone(name) {
  el.settingsTimezone.value = name;
  document.getElementById("settingsTimezoneHint").textContent = t("settings.time.search_hint");
  closeTimezoneOptions();
}

function showTimezoneOptions(query = "") {
  const search = document.getElementById("settingsTimezoneSearch");
  const list = document.getElementById("settingsTimezoneOptions");
  timezonePicker.matches = timezonePicker.names.filter(name => name.toLowerCase().includes(query.trim().toLowerCase()));
  timezonePicker.index = -1;
  search.removeAttribute("aria-activedescendant");
  list.replaceChildren(...timezonePicker.matches.map((name, index) => {
    const option = document.createElement("div");
    option.className = "timezone-option";
    option.id = `timezone-option-${index}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(name === el.settingsTimezone.value));
    option.textContent = name;
    option.onmousedown = event => event.preventDefault();
    option.onclick = () => selectTimezone(name);
    return option;
  }));
  if (!timezonePicker.matches.length) {
    const empty = document.createElement("div");
    empty.className = "timezone-empty";
    empty.setAttribute("role", "status");
    empty.textContent = t("settings.time.no_matches");
    list.append(empty);
  }
  list.hidden = false;
  search.setAttribute("aria-expanded", "true");
  document.getElementById("settingsTimezoneToggle").setAttribute("aria-expanded", "true");
}

function timezoneKeydown(event) {
  const list = document.getElementById("settingsTimezoneOptions");
  const search = document.getElementById("settingsTimezoneSearch");
  if (event.key === "Escape" || event.key === "Tab") {
    closeTimezoneOptions();
    if (event.key === "Escape") event.preventDefault();
    return;
  }
  if (event.key === "Enter" && !list.hidden) {
    event.preventDefault();
    const name = timezonePicker.matches[timezonePicker.index] ||
      (timezonePicker.matches.length === 1 ? timezonePicker.matches[0] : null);
    if (name) selectTimezone(name);
    return;
  }
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  if (list.hidden) showTimezoneOptions();
  const count = timezonePicker.matches.length;
  if (!count) return;
  const down = event.key === "ArrowDown";
  timezonePicker.index = timezonePicker.index < 0 ? (down ? 0 : count - 1)
    : (timezonePicker.index + (down ? 1 : -1) + count) % count;
  [...list.children].forEach((option, i) => option.classList.toggle("active", i === timezonePicker.index));
  const option = list.children[timezonePicker.index];
  search.setAttribute("aria-activedescendant", option.id);
  option.scrollIntoView({ block: "nearest" });
}

function receiveTimezoneClock(time) {
  // The server's civil time reflects its actual POSIX rules, including legacy TZ.
  // UTC formatting below avoids applying the browser's own timezone a second time.
  timezonePicker.clock = time.clock_valid && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(time.local_time || "")
    ? Date.parse(`${time.local_time}Z`) : NaN;
  timezonePicker.received = performance.now();
  timezonePicker.requested = timezonePicker.received;
  timezonePicker.active = time.active_timezone || "";
  updateTimezoneClock();
}

function formatTimezoneLocalTime(milliseconds) {
  const options = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit",
    minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "UTC" };
  const locale = (editor.settings?.ui?.language || "en").replace(/^en$/, "en-GB");
  let formatter;
  try { formatter = new Intl.DateTimeFormat(locale, options); }
  catch { formatter = new Intl.DateTimeFormat("en-GB", options); }
  return formatter.format(new Date(milliseconds));
}

function updateTimezoneClock() {
  const age = performance.now() - timezonePicker.received;
  const valid = Number.isFinite(timezonePicker.clock) && age < 15000;
  document.getElementById("settingsLocalTime").textContent = valid
    ? formatTimezoneLocalTime(timezonePicker.clock + age)
    : t("settings.time.clock_unavailable");
  document.getElementById("settingsActiveTimezone").textContent = timezonePicker.names.includes(timezonePicker.active)
    ? timezonePicker.active : t("settings.time.legacy_active");
}

async function tickTimezoneClock() {
  const output = document.getElementById("settingsLocalTime");
  if (document.hidden || output.offsetParent === null) return;
  updateTimezoneClock();
  if (timezonePicker.busy || performance.now() - timezonePicker.requested < 5000) return;
  timezonePicker.busy = true;
  timezonePicker.requested = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4000);
  try { receiveTimezoneClock(await apiGet("/api/settings?time_only=1", controller.signal)); }
  catch { /* A stale clock becomes unavailable instead of running indefinitely. */ }
  finally { window.clearTimeout(timeout); timezonePicker.busy = false; }
}

function renderTimezoneSettings(time) {
  timezonePicker.names = Array.isArray(time.timezones) ? time.timezones.filter(name => typeof name === "string").sort() : [];
  el.settingsTimezone.value = time.timezone || "";
  const search = document.getElementById("settingsTimezoneSearch");
  const toggle = document.getElementById("settingsTimezoneToggle");
  search.placeholder = t("settings.time.search");
  toggle.setAttribute("aria-label", t("settings.time.show_zones"));
  search.disabled = toggle.disabled = !timezonePicker.names.length;
  document.getElementById("settingsLocalTimeLabel").textContent = t("settings.time.local_time");
  document.getElementById("settingsTimezoneHint").textContent = !timezonePicker.names.length
    ? t("settings.time.list_unavailable") : timezoneSelectionLabel()
      ? t("settings.time.search_hint") : t("settings.time.legacy_hint");
  closeTimezoneOptions();
  if (timezonePicker.source !== time) {
    timezonePicker.source = time;
    receiveTimezoneClock(time);
  }
  if (timezonePicker.bound) return;
  timezonePicker.bound = true;
  search.onfocus = () => { showTimezoneOptions(); search.select(); };
  search.onclick = () => { if (document.getElementById("settingsTimezoneOptions").hidden) showTimezoneOptions(); };
  search.oninput = () => showTimezoneOptions(search.value);
  search.onkeydown = timezoneKeydown;
  toggle.onclick = () => {
    if (!document.getElementById("settingsTimezoneOptions").hidden) closeTimezoneOptions();
    else { search.focus(); showTimezoneOptions(); }
  };
  document.getElementById("settingsTimezonePicker").onfocusout = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeTimezoneOptions();
  };
  timezonePicker.timer = window.setInterval(tickTimezoneClock, 1000);
}

async function loadSettings(silent = false) {
  if (!silent) {
    setStatus(t("status.loading_settings"));
  }
  try {
    editor.settings = await apiGet("/api/settings");
    await loadI18nLanguage(editor.settings?.ui?.language || DEFAULT_UI_LANGUAGE, true);
    renderSettings();
    if (!silent) {
      setStatus(t("status.settings_loaded"));
    }
    return editor.settings;
  } catch (err) {
    if (!silent) {
      setStatus(t("status.settings_load_failed", { error: err.message }), true);
    }
    return null;
  }
}

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "n/a";
  if (n === 0) return "0 B";
  const units = ["B", "KB", "MB"];
  let value = n;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const decimals = unitIndex === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

function parseJsonMaybe(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function otaProgressVars(status) {
  const written = Math.max(0, Number(status?.written) || 0);
  const total = Math.max(0, Number(status?.total) || 0);
  const rawProgress = Number(status?.progress);
  const progress = total > 0
    ? Math.min(100, Math.max(0, Number.isFinite(rawProgress) ? rawProgress : (written * 100) / total))
    : 0;
  return {
    progress: total > 0 ? String(Math.round(progress)) : "--",
    written: formatBytes(written),
    total: total > 0 ? formatBytes(total) : "n/a",
  };
}

function clearOtaStatusPoll() {
  if (editor.ota.pollTimerId) {
    window.clearTimeout(editor.ota.pollTimerId);
    editor.ota.pollTimerId = null;
  }
}

function scheduleOtaStatusPoll() {
  clearOtaStatusPoll();
  if (editor.activePane !== "settings") return;
  editor.ota.pollTimerId = window.setTimeout(() => {
    void loadOtaStatus(true);
  }, OTA_STATUS_POLL_MS);
}

function setOtaInfo(text, isError = false) {
  if (!el.settingsOtaInfo) return;
  el.settingsOtaInfo.textContent = text;
  el.settingsOtaInfo.classList.toggle("error", isError);
}

function setOtaProgress(percent) {
  if (!el.settingsOtaProgressBar) return;
  const n = Number(percent);
  const clamped = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
  el.settingsOtaProgressBar.style.width = `${clamped}%`;
}

function setOtaControlsDisabled(disabled) {
  const busy = Boolean(disabled);
  if (el.startOtaUrlBtn) {
    el.startOtaUrlBtn.disabled = busy;
  }
  if (el.uploadOtaBtn) {
    el.uploadOtaBtn.disabled = busy;
  }
  if (el.settingsOtaUrl) {
    el.settingsOtaUrl.disabled = busy;
  }
  if (el.settingsOtaFile) {
    el.settingsOtaFile.disabled = busy;
  }
}

function renderOtaStatus(status) {
  if (!el.settingsOtaInfo) return;

  const hasStatus = status && typeof status === "object";
  if (!hasStatus) {
    setOtaProgress(0);
    setOtaControlsDisabled(editor.ota.uploadInProgress);
    return;
  }

  const vars = otaProgressVars(status);
  const state = typeof status.state === "string" ? status.state : "idle";
  const running = Boolean(status.running);
  const rebooting = Boolean(status.rebooting);
  const progress = Number(vars.progress);
  setOtaProgress(Number.isFinite(progress) ? progress : 0);

  let text = "";
  let isError = false;
  if (state === "error") {
    text = t("settings.ota.error", { error: status.error || t("common.unknown_error") });
    isError = true;
  } else if (rebooting) {
    text = t("settings.ota.rebooting");
  } else if (state === "success") {
    text = t("settings.ota.success");
  } else if (running && state === "url") {
    text = t("settings.ota.downloading", vars);
  } else if (running && state === "upload") {
    text = t("settings.ota.uploading", vars);
  } else if (running) {
    text = t("settings.ota.running", vars);
  } else {
    text = t("settings.ota.idle", {
      running: status.running_partition || "n/a",
      next: status.next_partition || "n/a",
      size: status.slot_size ? formatBytes(status.slot_size) : "n/a",
    });
  }

  const imageInfo = [
    status.project_name || "",
    status.version || "",
  ].filter(Boolean).join(" ");
  if (imageInfo) {
    text += `\n${imageInfo}`;
  }
  const targetPartition = status.partition || (running ? status.next_partition : "");
  if (targetPartition) {
    text += `\n${t("settings.ota.target_slot", { partition: targetPartition })}`;
  }

  setOtaInfo(text, isError);
  setOtaControlsDisabled(editor.ota.uploadInProgress || running || rebooting);
}

async function loadOtaStatus(silent = false) {
  if (!silent && el.settingsOtaInfo) {
    setOtaInfo(t("settings.ota.refresh"));
  }
  try {
    const status = await apiGet("/api/ota/status");
    editor.ota.status = status;
    renderOtaStatus(status);
    if (status?.running || status?.rebooting) {
      scheduleOtaStatusPoll();
    } else {
      clearOtaStatusPoll();
    }
    return status;
  } catch (err) {
    const wasRebooting = Boolean(editor.ota.status?.rebooting);
    setOtaInfo(
      wasRebooting ? t("settings.ota.rebooting") : t("settings.ota.request_failed", { error: err.message }),
      !wasRebooting
    );
    if (!wasRebooting) {
      clearOtaStatusPoll();
    }
    return null;
  }
}

async function startOtaFromUrl() {
  const url = el.settingsOtaUrl?.value.trim() || "";
  if (!url) {
    setOtaInfo(t("settings.ota.no_url"), true);
    return;
  }

  clearOtaStatusPoll();
  setOtaProgress(0);
  setOtaControlsDisabled(true);
  setOtaInfo(t("settings.ota.starting_url"));

  try {
    const response = await fetch("/api/ota/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const body = await response.text();
    const payload = parseJsonMaybe(body) || {};
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `${response.status} ${response.statusText}`);
    }
    editor.ota.status = payload;
    renderOtaStatus(payload);
    if (payload.running || payload.rebooting) {
      scheduleOtaStatusPoll();
    }
  } catch (err) {
    setOtaInfo(t("settings.ota.request_failed", { error: err.message }), true);
    setOtaControlsDisabled(false);
  }
}

async function uploadOtaFile() {
  const file = el.settingsOtaFile?.files?.[0];
  if (!file) {
    setOtaInfo(t("settings.ota.no_file"), true);
    return;
  }

  clearOtaStatusPoll();
  editor.ota.uploadInProgress = true;
  setOtaProgress(0);
  setOtaControlsDisabled(true);
  setOtaInfo(t("settings.ota.upload_progress", {
    progress: "0",
    written: "0 B",
    total: formatBytes(file.size),
  }));

  try {
    const payload = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/ota/upload");
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const progress = Math.min(100, Math.max(0, (event.loaded * 100) / event.total));
        setOtaProgress(progress);
        setOtaInfo(t("settings.ota.upload_progress", {
          progress: String(Math.round(progress)),
          written: formatBytes(event.loaded),
          total: formatBytes(event.total),
        }));
      };
      xhr.onload = () => {
        const data = parseJsonMaybe(xhr.responseText) || {};
        if (xhr.status < 200 || xhr.status >= 300 || data.ok === false) {
          reject(new Error(data.error || `${xhr.status} ${xhr.statusText}`));
          return;
        }
        resolve(data);
      };
      xhr.onerror = () => reject(new Error(t("common.unknown_error")));
      xhr.onabort = () => reject(new Error("aborted"));
      xhr.send(file);
    });

    editor.ota.status = payload;
    renderOtaStatus(payload);
    if (el.settingsOtaFile) {
      el.settingsOtaFile.value = "";
    }
    if (payload?.running || payload?.rebooting) {
      scheduleOtaStatusPoll();
    }
  } catch (err) {
    setOtaInfo(t("settings.ota.request_failed", { error: err.message }), true);
    setOtaProgress(0);
  } finally {
    editor.ota.uploadInProgress = false;
    setOtaControlsDisabled(Boolean(editor.ota.status?.running || editor.ota.status?.rebooting));
  }
}

async function putSettings(payload) {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = json.error || detail;
    } catch (_) {}
    throw new Error(detail);
  }
}

function setBackupInfo(text, isError = false) {
  if (!el.settingsBackupInfo) return;
  el.settingsBackupInfo.textContent = text;
  el.settingsBackupInfo.classList.toggle("error", isError);
}

async function downloadBackup() {
  setBackupInfo(t("settings.backup.downloading"));
  const response = await fetch("/api/backup");
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = json.error || detail;
    } catch (_) {}
    throw new Error(detail || response.statusText);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "betta-ha-panel-backup.json";
  link.click();
  URL.revokeObjectURL(url);
  setBackupInfo(t("settings.backup.downloaded"));
}

async function restoreBackup() {
  const file = el.settingsBackupFile?.files?.[0];
  if (!file) {
    setBackupInfo(t("settings.backup.choose_file"), true);
    return;
  }
  setBackupInfo(t("settings.backup.restoring"));
  let body;
  try {
    body = await file.text();
  } catch (err) {
    throw new Error(String(err?.message || err));
  }
  const response = await fetch("/api/backup/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {}
  if (!response.ok || payload.ok !== true) {
    throw new Error(payload.error || response.statusText);
  }
  const summary = t("settings.backup.restored", {
    layout: payload.layout_restored ? t("common.yes") : t("common.no"),
    settings: payload.settings_restored ? t("common.yes") : t("common.no"),
    themes: payload.themes_restored ? t("common.yes") : t("common.no"),
  });
  setBackupInfo(payload.restart_required ? `${summary} ${t("settings.backup.restart_hint")}` : summary);
  await loadSettings(true);
  await loadLayout();
  if (typeof themeLoadAndRender === "function") {
    try {
      await themeLoadAndRender();
    } catch (_) {}
  }
}

async function saveWifiProvisioning() {
  const ssid = el.provWifiSsid?.value.trim() || "";
  const password = el.provWifiPassword?.value || "";
  const countryCode = normalizeCountryCode(el.provWifiCountryCode?.value) || "";

  if (!ssid) {
    setProvisioningInfo("wifi", t("provision.wifi.required_ssid"), true);
    return;
  }
  if (!countryCode) {
    setProvisioningInfo("wifi", t("provision.wifi.required_country"), true);
    return;
  }

  const payload = {
    wifi: {
      ssid,
      country_code: countryCode,
      bssid: null,
    },
    reboot: true,
  };
  if (password.length > 0) {
    payload.wifi.password = password;
  }

  setProvisioningInfo("wifi", t("provision.saving_reboot"));
  await putSettings(payload);
  setProvisioningInfo("wifi", t("provision.saved_reboot"));
}

async function saveHaProvisioning() {
  const wsUrl = el.provHaUrl?.value.trim() || "";
  const accessToken = el.provHaToken?.value.trim() || "";

  if (!wsUrl) {
    setProvisioningInfo("ha", t("provision.ha.required_url"), true);
    return;
  }
  if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
    setProvisioningInfo("ha", t("provision.ha.invalid_url"), true);
    return;
  }
  if (!accessToken) {
    setProvisioningInfo("ha", t("provision.ha.required_token"), true);
    return;
  }

  const payload = {
    ha: {
      ws_url: wsUrl,
      access_token: accessToken,
    },
    reboot: true,
  };

  setProvisioningInfo("ha", t("provision.saving_reboot"));
  markSetupWizardPending();
  try {
    await putSettings(payload);
  } catch (err) {
    storageRemove(SETUP_WIZARD_PENDING_STORAGE_KEY);
    throw err;
  }
  setProvisioningInfo("ha", t("provision.saved_reboot"));
}

async function saveSettings() {
  const wifiSsid = el.settingsWifiSsid.value.trim();
  const wifiPassword = el.settingsWifiPassword.value;
  const wifiCountryCode = normalizeCountryCode(el.settingsWifiCountryCode?.value) || "";
  const wifiBssidRaw = el.settingsWifiBssid?.value || "";
  const wifiBssid = normalizeBssid(wifiBssidRaw);
  const wifiStaticEnabled = Boolean(el.settingsWifiStaticEnabled?.checked);
  const wifiStaticIp = (el.settingsWifiStaticIp?.value || "").trim();
  const wifiStaticNetmask = (el.settingsWifiStaticNetmask?.value || "").trim();
  const wifiStaticGateway = (el.settingsWifiStaticGateway?.value || "").trim();
  const wifiStaticDns = (el.settingsWifiStaticDns?.value || "").trim();
  const haUrl = el.settingsHaUrl.value.trim();
  const haToken = el.settingsHaToken.value.trim();
  const haRestEnabled = Boolean(el.settingsHaRestEnabled?.checked);
  const ntpServer = el.settingsNtpServer.value.trim();
  const timezone = el.settingsTimezone.value.trim();
  const language = normalizeUiLanguage(el.settingsLanguage?.value);

  if (!wifiCountryCode) {
    setStatus(t("settings.language.invalid_country"), true);
    return;
  }
  if (wifiBssidRaw.trim().length > 0 && !wifiBssid) {
    setStatus(t("settings.language.invalid_bssid"), true);
    return;
  }
  if (wifiStaticEnabled) {
    if (!isValidIpv4(wifiStaticIp) || !isValidIpv4(wifiStaticNetmask) || !isValidIpv4(wifiStaticGateway)) {
      setStatus(t("settings.wifi.invalid_static_ip"), true);
      return;
    }
  }
  if (wifiStaticDns && !isValidIpv4(wifiStaticDns)) {
    setStatus(t("settings.wifi.invalid_static_ip"), true);
    return;
  }
  if (haUrl && !haUrl.startsWith("ws://") && !haUrl.startsWith("wss://")) {
    setStatus(t("settings.language.invalid_ha_url"), true);
    return;
  }

  const payload = {
    wifi: {
      ssid: wifiSsid,
      country_code: wifiCountryCode,
      bssid: wifiBssid || null,
      static_enabled: wifiStaticEnabled,
      static_ip: wifiStaticIp || null,
      static_netmask: wifiStaticNetmask || null,
      static_gateway: wifiStaticGateway || null,
      static_dns: wifiStaticDns || null,
    },
    ha: {
      ws_url: haUrl,
      rest_enabled: haRestEnabled,
    },
    time: {
      ntp_server: ntpServer,
      timezone,
    },
    ui: {
      language,
    },
    display: collectDisplayPayload(),
    mqtt: collectMqttPayload(),
    system: collectSystemPayload(),
    reboot: true,
  };
  if (wifiPassword.length > 0) {
    payload.wifi.password = wifiPassword;
  }
  if (haToken.length > 0) {
    payload.ha.access_token = haToken;
  }

  setStatus(t("status.saving_settings"));
  await putSettings(payload);
  setStatus(t("status.settings_saved_reboot"));
}

function collectDisplayPayload() {
  const num = (input, min, max) => {
    if (!input) return undefined;
    const n = Math.round(clamp(Number(input.value) || 0, min, max));
    return Number.isFinite(n) ? n : undefined;
  };

  const display = {};
  const brightness = num(el.settingsBrightness, 1, 100);
  if (brightness !== undefined) display.brightness = brightness;
  const saverTimeout = num(el.settingsScreensaverTimeout, 5, 7200);
  if (saverTimeout !== undefined) display.screensaver_timeout_sec = saverTimeout;
  const saverBrightness = num(el.settingsSaverBrightness, 1, 100);
  if (saverBrightness !== undefined) display.saver_brightness = saverBrightness;
  const offTimeout = num(el.settingsScreenOffTimeout, 5, 7200);
  if (offTimeout !== undefined) display.screen_off_timeout_sec = offTimeout;
  if (el.settingsScreensaverEnabled) display.screensaver_enabled = el.settingsScreensaverEnabled.checked;
  if (el.settingsScreenOffEnabled) display.screen_off_enabled = el.settingsScreenOffEnabled.checked;
  if (el.settingsClockFormat) display.clock_24h = el.settingsClockFormat.value !== "h12";
  if (el.settingsClockStyle) display.saver_clock_style = el.settingsClockStyle.value === "flip" ? 1 : 0;
  if (el.settingsShowSeconds) display.saver_show_seconds = el.settingsShowSeconds.checked;
  if (el.settingsShowDate) display.saver_show_date = el.settingsShowDate.checked;
  if (el.settingsClockColor) display.saver_clock_color = hexToRgbInt(el.settingsClockColor.value);
  if (el.settingsDateColor) display.saver_date_color = hexToRgbInt(el.settingsDateColor.value);
  if (el.settingsNightModeEnabled) display.night_mode_enabled = el.settingsNightModeEnabled.checked;
  if (el.settingsNightStart) {
    display.night_start_min = timeStringToMinutes(el.settingsNightStart.value, 22 * 60);
  }
  if (el.settingsNightEnd) {
    display.night_end_min = timeStringToMinutes(el.settingsNightEnd.value, 7 * 60);
  }
  const nightBrightness = num(el.settingsNightBrightness, 0, 100);
  if (nightBrightness !== undefined) display.night_brightness = nightBrightness;
  const nightWake = num(el.settingsNightWakeSec, 0, 3600);
  if (nightWake !== undefined) display.night_wake_sec = nightWake;
  if (el.settingsThemeAutoEnabled) display.theme_auto_enabled = el.settingsThemeAutoEnabled.checked;
  if (el.settingsThemeDaySelect) display.theme_day_id = el.settingsThemeDaySelect.value || "";
  if (el.settingsThemeNightSelect) display.theme_night_id = el.settingsThemeNightSelect.value || "";
  if (el.settingsPageTransition && PAGE_TRANSITION_MODES.indexOf(el.settingsPageTransition.value) >= 0) {
    display.page_transition = el.settingsPageTransition.value;
  }
  const transitionMs = num(el.settingsPageTransitionMs, 0, 1200);
  if (transitionMs !== undefined) display.page_transition_ms = transitionMs;
  if (el.settingsTilePressFx && TILE_PRESS_FX_MODES.indexOf(el.settingsTilePressFx.value) >= 0) {
    display.tile_press_fx = el.settingsTilePressFx.value;
  }
  const pressFxDim = num(el.settingsTilePressFxDim, 0, 60);
  if (pressFxDim !== undefined) display.tile_press_fx_dim = pressFxDim;
  const pressFxScale = num(el.settingsTilePressFxScale, 90, 100);
  if (pressFxScale !== undefined) display.tile_press_fx_scale = pressFxScale;
  if (el.settingsValueAnim && VALUE_ANIM_MODES.indexOf(el.settingsValueAnim.value) >= 0) {
    display.value_anim = el.settingsValueAnim.value;
  }
  const valueAnimMs = num(el.settingsValueAnimMs, 0, 1500);
  if (valueAnimMs !== undefined) display.value_anim_ms = valueAnimMs;
  if (el.settingsTopbarShowClock) display.topbar_show_clock = el.settingsTopbarShowClock.checked;
  if (el.settingsTopbarShowDate) display.topbar_show_date = el.settingsTopbarShowDate.checked;
  if (el.settingsTopbarShowGear) display.topbar_show_gear = el.settingsTopbarShowGear.checked;
  if (el.settingsTopbarShowStatus) display.topbar_show_status = el.settingsTopbarShowStatus.checked;
  if (el.settingsTopbarIconText) display.topbar_icon_text = el.settingsTopbarIconText.checked;
  if (el.settingsTopbarCustomColors) display.topbar_custom_colors = el.settingsTopbarCustomColors.checked;
  if (el.settingsTopbarBgColor) display.topbar_bg_color = hexToRgbInt(el.settingsTopbarBgColor.value);
  if (el.settingsTopbarClockColor) display.topbar_clock_color = hexToRgbInt(el.settingsTopbarClockColor.value);
  if (el.settingsTopbarDateColor) display.topbar_date_color = hexToRgbInt(el.settingsTopbarDateColor.value);
  if (el.settingsTopbarGearColor) display.topbar_gear_color = hexToRgbInt(el.settingsTopbarGearColor.value);
  if (el.settingsTopbarHaColor) display.topbar_ha_color = hexToRgbInt(el.settingsTopbarHaColor.value);
  if (el.settingsTopbarWifiColor) display.topbar_wifi_color = hexToRgbInt(el.settingsTopbarWifiColor.value);
  if (el.settingsNavCustomColors) display.nav_custom_colors = el.settingsNavCustomColors.checked;
  if (el.settingsNavBarBgColor) display.nav_bar_bg_color = hexToRgbInt(el.settingsNavBarBgColor.value);
  if (el.settingsNavBarBorderColor) display.nav_bar_border_color = hexToRgbInt(el.settingsNavBarBorderColor.value);
  if (el.settingsNavButtonBgColor) display.nav_button_bg_color = hexToRgbInt(el.settingsNavButtonBgColor.value);
  if (el.settingsNavButtonBorderColor) display.nav_button_border_color = hexToRgbInt(el.settingsNavButtonBorderColor.value);
  if (el.settingsNavTabIdleColor) display.nav_tab_idle_color = hexToRgbInt(el.settingsNavTabIdleColor.value);
  if (el.settingsNavTabActiveColor) display.nav_tab_active_color = hexToRgbInt(el.settingsNavTabActiveColor.value);
  if (el.settingsNavHomeIdleColor) display.nav_home_idle_color = hexToRgbInt(el.settingsNavHomeIdleColor.value);
  if (el.settingsNavHomeActiveColor) display.nav_home_active_color = hexToRgbInt(el.settingsNavHomeActiveColor.value);
  return display;
}

async function applyDisplaySettings(statusEl, appliedKey = "settings.display.applied") {
  const display = collectDisplayPayload();
  if (!Object.keys(display).length) return;
  const info = statusEl || el.settingsDisplayInfo;
  if (info) {
    info.textContent = t("status.saving_settings");
    info.classList.remove("error");
  }
  await putSettings({ display, reboot: false });
  await loadSettings(true);
  if (info) {
    info.textContent = t(appliedKey);
    info.classList.remove("error");
  }
}

const SD_MAX_UPLOAD_BYTES = 512 * 1024;

function setSdInfo(text, isError = false) {
  if (!el.settingsSdInfo) return;
  el.settingsSdInfo.textContent = text;
  el.settingsSdInfo.classList.toggle("error", isError);
}

function formatMib(bytes) {
  const value = Number(bytes) || 0;
  if (value <= 0) return "0";
  return String(Math.round((value / (1024 * 1024)) * 10) / 10);
}

function setSdStatus(text, isError = false) {
  if (!el.settingsSdStatus) return;
  el.settingsSdStatus.textContent = text;
  el.settingsSdStatus.classList.toggle("error", isError);
}

function formatKib(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round((value / 1024) * 10) / 10} kB`;
  return `${Math.round((value / (1024 * 1024)) * 10) / 10} MB`;
}

/* The panel answers a failed microSD request with a short code ("no_card",
 * "no_filesystem", "off", "unsupported") instead of a bare HTTP status, so the
 * user learns what to do next. */
function sdErrorMessage(message, fallbackKey) {
  const code = String(message || "").trim();
  if (code && !/^\d{3}\b/.test(code)) {
    const key = `settings.sd.${code}`;
    const text = t(key);
    return text === key ? code : text;
  }
  return t(fallbackKey);
}

function renderSdSettings() {
  const state = editor.sd.state || {};
  const supported = state.supported === true;
  const enabled = state.enabled === true;
  const mounted = state.mounted === true;
  const detected = state.detected === true;
  if (el.settingsSdEnabled) {
    el.settingsSdEnabled.checked = enabled;
    el.settingsSdEnabled.disabled = !supported || editor.sd.busy;
  }
  for (const button of [el.sdRefreshBtn, el.sdExportLogsBtn, el.sdFormatBtn, el.sdLogsBtn, el.sdPhotosBtn]) {
    if (button) button.disabled = editor.sd.busy;
  }
  /* Formatting is exactly what an unmounted card needs - a card without a FAT
   * filesystem cannot be mounted before it is formatted. */
  if (el.sdFormatBtn) el.sdFormatBtn.disabled = !supported || !enabled || editor.sd.busy;
  if (el.sdExportLogsBtn) el.sdExportLogsBtn.disabled = !mounted || editor.sd.busy;
  if (el.sdUpBtn) el.sdUpBtn.disabled = !mounted || editor.sd.busy || editor.sd.dir.length === 0;
  if (el.sdRootBtn) el.sdRootBtn.disabled = !mounted || editor.sd.busy;
  if (el.sdLogsBtn) el.sdLogsBtn.disabled = !mounted || editor.sd.busy;
  if (el.sdPhotosBtn) el.sdPhotosBtn.disabled = !mounted || editor.sd.busy;
  const vars = { name: state.card_name || "SD" };
  /* The panel sends a machine-readable state; older builds only send the flags,
   * so fall back to deriving it here. */
  let stateCode = typeof state.state === "string" ? state.state : "";
  if (!stateCode) {
    stateCode = !supported ? "unsupported" : !enabled ? "off" : mounted ? "ok" : detected ? "no_filesystem" : "no_card";
  }
  if (stateCode === "unsupported") {
    setSdStatus(t("settings.sd.unsupported"), true);
  } else if (stateCode === "off") {
    setSdStatus(t("settings.sd.disabled"));
  } else if (stateCode === "ok") {
    setSdStatus(
      t("settings.sd.mounted", {
        name: vars.name,
        total: formatMib(state.capacity_bytes),
        free: formatMib(state.free_bytes),
      }),
    );
  } else if (stateCode === "no_filesystem" || stateCode === "exfat" || stateCode === "ntfs") {
    setSdStatus(t(`settings.sd.${stateCode}`, vars), true);
  } else {
    setSdStatus(t("settings.sd.no_card"), true);
  }

  /* Where the screensaver picture lives right now.  The panel reports the store
   * itself; older builds do not send it, in which case the line stays hidden. */
  if (el.sdWallpaperStore) {
    const store = state.wallpaper_store;
    if (store === "sd" || store === "flash" || store === "none") {
      el.sdWallpaperStore.textContent = t(`settings.sd.wallpaper_${store}`);
      el.sdWallpaperStore.style.display = "";
    } else {
      el.sdWallpaperStore.textContent = "";
      el.sdWallpaperStore.style.display = "none";
    }
  }
}

function sdDirJoin(base, name) {
  return base ? `${base}/${name}` : name;
}

function sdDirParent(dir) {
  const index = dir.lastIndexOf("/");
  return index < 0 ? "" : dir.slice(0, index);
}

function renderSdFiles() {
  if (el.sdPath) el.sdPath.textContent = `/${editor.sd.dir}`;
  if (!el.sdFileList) return;
  el.sdFileList.textContent = "";
  const entries = editor.sd.entries || [];
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.textContent = t("settings.sd.empty");
    el.sdFileList.appendChild(empty);
    return;
  }
  for (const entry of entries) {
    const row = document.createElement("div");
    row.className = "sd-file-row";
    const full = sdDirJoin(editor.sd.dir, entry.name);
    const isDir = entry.dir === true;
    const icon = document.createElement("span");
    icon.className = "sd-file-icon";
    icon.textContent = isDir ? "📁" : "📄";
    row.appendChild(icon);
    const label = document.createElement("button");
    label.type = "button";
    label.className = "sd-file-name";
    label.textContent = entry.name;
    if (isDir) {
      label.onclick = () => {
        void loadSdFiles(full);
      };
    } else {
      label.onclick = () => {
        window.open(`/api/sd/file?path=${encodeURIComponent(full)}`, "_blank");
      };
    }
    row.appendChild(label);
    const size = document.createElement("span");
    size.className = "meta sd-file-size";
    size.textContent = isDir ? t("settings.sd.type_dir") : formatKib(entry.size);
    row.appendChild(size);
    if (!isDir && isWallpaperCandidate(entry.name)) {
      const wallpaper = document.createElement("button");
      wallpaper.type = "button";
      wallpaper.className = "btn small";
      wallpaper.textContent = t("settings.sd.use_wallpaper");
      wallpaper.onclick = () => {
        void setWallpaperFromSdFile(full);
      };
      row.appendChild(wallpaper);
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn small danger";
    remove.textContent = t("settings.sd.delete");
    remove.onclick = () => {
      void deleteSdEntry(full, entry.name);
    };
    row.appendChild(remove);
    el.sdFileList.appendChild(row);
  }
}

function isWallpaperCandidate(name) {
  const lower = String(name || "").toLowerCase();
  return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".bmp");
}

async function sdApiRequest(path, method, body) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (_) {
      payload = null;
    }
  }
  if (!response.ok) {
    throw new Error(payload?.error || `${response.status} ${response.statusText}`);
  }
  return payload;
}

async function loadSdState(silent = true) {
  try {
    const state = await apiGet("/api/sd");
    editor.sd.state = state;
    renderSdSettings();
    if (state?.mounted === true) {
      await loadSdFiles(editor.sd.dir, true);
    } else {
      editor.sd.entries = [];
      renderSdFiles();
    }
    return state;
  } catch (err) {
    if (!silent) {
      setSdInfo(String(err?.message || err), true);
    }
    return null;
  }
}

async function loadSdFiles(dir, silent = false) {
  if (editor.sd.busy) return;
  editor.sd.busy = true;
  renderSdSettings();
  if (!silent) setSdInfo(t("settings.sd.loading"));
  try {
    const payload = await apiGet(`/api/sd/files?dir=${encodeURIComponent(dir || "")}`);
    editor.sd.dir = typeof payload?.dir === "string" ? payload.dir : dir || "";
    editor.sd.entries = Array.isArray(payload?.entries) ? payload.entries : [];
    renderSdFiles();
    renderSdSettings();
    if (!silent) setSdInfo("");
  } catch (err) {
    setSdInfo(String(err?.message || err), true);
  } finally {
    editor.sd.busy = false;
    renderSdSettings();
  }
}

async function setSdEnabled(enabled) {
  if (editor.sd.busy) return;
  editor.sd.busy = true;
  renderSdSettings();
  try {
    const state = await sdApiRequest("/api/sd", "PUT", { enabled: enabled === true });
    editor.sd.state = state;
    renderSdSettings();
    if (state?.mounted === true) {
      await loadSdFiles(editor.sd.dir, true);
    } else {
      editor.sd.entries = [];
      renderSdFiles();
    }
    setSdInfo(t(state?.enabled === true ? "settings.sd.status_enabled" : "settings.sd.status_disabled"));
  } catch (err) {
    setSdInfo(sdErrorMessage(err?.message, "settings.sd.apply_failed"), true);
    await loadSdState(true);
  } finally {
    editor.sd.busy = false;
    renderSdSettings();
  }
}

async function formatSdCard() {
  if (editor.sd.busy) return;
  if (!window.confirm(t("settings.sd.format_confirm"))) return;
  editor.sd.busy = true;
  renderSdSettings();
  setSdInfo(t("settings.sd.formatting"));
  try {
    await sdApiRequest("/api/sd/format", "POST");
    editor.sd.dir = "";
    editor.sd.entries = [];
    setSdInfo(t("settings.sd.formatted"));
  } catch (err) {
    setSdInfo(sdErrorMessage(err?.message, "settings.sd.format_failed"), true);
  } finally {
    editor.sd.busy = false;
    renderSdSettings();
    await loadSdState(true);
  }
}

async function exportSdLogs() {
  if (editor.sd.busy) return;
  editor.sd.busy = true;
  renderSdSettings();
  setSdInfo(t("settings.sd.exporting"));
  try {
    const payload = await sdApiRequest("/api/sd/logs/export", "POST");
    setSdInfo(t("settings.sd.exported", { path: `/sd/${payload?.dir || "logs"}/${payload?.file || ""}` }));
  } catch (err) {
    setSdInfo(sdErrorMessage(err?.message, "settings.sd.export_failed"), true);
  } finally {
    editor.sd.busy = false;
    renderSdSettings();
    if (editor.sd.dir === "logs") {
      await loadSdFiles("logs", true);
    }
  }
}

async function deleteSdEntry(path, name) {
  if (editor.sd.busy) return;
  if (!window.confirm(t("settings.sd.delete_confirm", { name }))) return;
  editor.sd.busy = true;
  renderSdSettings();
  try {
    await sdApiRequest(`/api/sd/file?path=${encodeURIComponent(path)}`, "DELETE");
    setSdInfo(t("settings.sd.deleted"));
  } catch (err) {
    setSdInfo(sdErrorMessage(err?.message, "settings.sd.delete_failed"), true);
  } finally {
    editor.sd.busy = false;
    renderSdSettings();
    await loadSdFiles(editor.sd.dir, true);
  }
}

async function setWallpaperFromSdFile(path) {
  try {
    const response = await fetch(`/api/sd/file?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const blob = await response.blob();
    const frame = await imageFileToRgb565(blob, Number(editor.appScreenW) || 480, Number(editor.appScreenH) || 480);
    if (!frame) throw new Error(t("settings.sd.wallpaper_failed"));
    const upload = await fetch("/api/display/wallpaper", {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: frame,
    });
    if (!upload.ok) throw new Error(`${upload.status} ${upload.statusText}`);
    setSdInfo(t("settings.sd.wallpaper_ok"));
  } catch (err) {
    setSdInfo(String(err?.message || err) || t("settings.sd.wallpaper_failed"), true);
  }
}

function bindSdSettings() {
  if (el.settingsSdEnabled) {
    el.settingsSdEnabled.onchange = () => {
      void setSdEnabled(el.settingsSdEnabled.checked === true);
    };
  }
  if (el.sdRefreshBtn) {
    el.sdRefreshBtn.onclick = () => {
      void loadSdState(false).then(() => {
        if (editor.sd.state?.mounted === true) void loadSdFiles(editor.sd.dir, false);
      });
    };
  }
  if (el.sdExportLogsBtn) {
    el.sdExportLogsBtn.onclick = () => {
      void exportSdLogs();
    };
  }
  if (el.sdFormatBtn) {
    el.sdFormatBtn.onclick = () => {
      void formatSdCard();
    };
  }
  if (el.sdUpBtn) {
    el.sdUpBtn.onclick = () => {
      void loadSdFiles(sdDirParent(editor.sd.dir));
    };
  }
  if (el.sdRootBtn) {
    el.sdRootBtn.onclick = () => {
      void loadSdFiles("");
    };
  }
  if (el.sdLogsBtn) {
    el.sdLogsBtn.onclick = () => {
      void loadSdFiles("logs");
    };
  }
  if (el.sdPhotosBtn) {
    el.sdPhotosBtn.onclick = () => {
      void loadSdFiles("photos");
    };
  }
}

const PAGE_TRANSITION_MODES = ["none", "fade", "slide", "slide_up", "fade_slide"];
const TILE_PRESS_FX_MODES = ["none", "dim", "scale", "both"];

function pressFxIntOrFallback(input, min, max, fallback) {
  if (!input || String(input.value).trim() === "") return fallback;
  return clampInt(input.value, min, max, fallback);
}

/* Mirrors the on-panel effect in the sample tile so the numbers can be judged
 * without flashing the firmware. */
function updatePressFxCss() {
  const host = el.settingsTilePressFxPreviewTile;
  if (!host) return;
  const mode =
    el.settingsTilePressFx && TILE_PRESS_FX_MODES.indexOf(el.settingsTilePressFx.value) >= 0
      ? el.settingsTilePressFx.value
      : "both";
  const dim = pressFxIntOrFallback(el.settingsTilePressFxDim, 0, 60, 15);
  const scale = pressFxIntOrFallback(el.settingsTilePressFxScale, 90, 100, 97);
  const useDim = (mode === "dim" || mode === "both") && dim > 0;
  const useScale = (mode === "scale" || mode === "both") && scale < 100;
  host.style.setProperty("--press-fx-opa", useDim ? String(Math.max(0, 100 - dim) / 100) : "1");
  host.style.setProperty("--press-fx-scale", useScale ? String(scale / 100) : "1");
  if (!useDim && !useScale) host.classList.remove("is-pressed");
}

function bindPressFxPreview() {
  const host = el.settingsTilePressFxPreviewTile;
  if (!host || host.dataset.pressFxBound === "1") return;
  host.dataset.pressFxBound = "1";
  const press = () => host.classList.add("is-pressed");
  const release = () => host.classList.remove("is-pressed");
  host.addEventListener("pointerdown", press);
  host.addEventListener("pointerup", release);
  host.addEventListener("pointerleave", release);
  host.addEventListener("pointercancel", release);
  for (const input of [el.settingsTilePressFx, el.settingsTilePressFxDim, el.settingsTilePressFxScale]) {
    if (!input) continue;
    input.addEventListener("input", updatePressFxCss);
    input.addEventListener("change", updatePressFxCss);
  }
  updatePressFxCss();
}

const VALUE_ANIM_MODES = ["none", "fade", "slide", "count"];
/* Two sample readings the preview counts between. */
const VALUE_ANIM_PREVIEW_VALUES = [21.4, 23.8];
const VALUE_ANIM_PREVIEW_SUFFIX = " °C";
let valueAnimPreviewIndex = 0;

function valueAnimModeFromControls() {
  const mode = el.settingsValueAnim ? el.settingsValueAnim.value : "count";
  return VALUE_ANIM_MODES.indexOf(mode) >= 0 ? mode : "count";
}

function valueAnimMsFromControls() {
  return pressFxIntOrFallback(el.settingsValueAnimMs, 0, 1500, 320);
}

function valueAnimPreviewText(value) {
  return `${value.toFixed(1)}${VALUE_ANIM_PREVIEW_SUFFIX}`;
}

function updateValueAnimCss() {
  const host = el.settingsValueAnimPreview;
  if (!host) return;
  host.style.setProperty("--value-anim-ms", `${Math.max(1, valueAnimMsFromControls())}ms`);
}

/* Replays the selected effect on a sample value so the mode and the duration
 * can be judged without waiting for a sensor to change. */
function playValueAnimPreview() {
  const host = el.settingsValueAnimPreview;
  if (!host) return;

  const mode = valueAnimModeFromControls();
  const duration = valueAnimMsFromControls();
  const from = VALUE_ANIM_PREVIEW_VALUES[valueAnimPreviewIndex];
  const to = VALUE_ANIM_PREVIEW_VALUES[1 - valueAnimPreviewIndex];
  valueAnimPreviewIndex = 1 - valueAnimPreviewIndex;

  if (host.dataset.animRaf) {
    cancelAnimationFrame(Number(host.dataset.animRaf));
    host.dataset.animRaf = "";
  }
  host.classList.remove("is-fading", "is-sliding");

  if (mode === "none" || duration === 0) {
    host.textContent = valueAnimPreviewText(to);
    return;
  }

  if (mode === "count") {
    const started = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      host.textContent = valueAnimPreviewText(from + (to - from) * eased);
      if (progress < 1) {
        host.dataset.animRaf = String(requestAnimationFrame(step));
      } else {
        host.dataset.animRaf = "";
        host.textContent = valueAnimPreviewText(to);
      }
    };
    host.dataset.animRaf = String(requestAnimationFrame(step));
    return;
  }

  // Restart the CSS animation even when the same class is already applied.
  void host.offsetWidth;
  host.textContent = valueAnimPreviewText(to);
  host.classList.add(mode === "slide" ? "is-sliding" : "is-fading");
}

function bindValueAnimPreview() {
  const host = el.settingsValueAnimPreview;
  if (!host || host.dataset.valueAnimBound === "1") return;
  host.dataset.valueAnimBound = "1";
  host.textContent = valueAnimPreviewText(VALUE_ANIM_PREVIEW_VALUES[0]);
  if (el.settingsValueAnimPreviewBtn) {
    el.settingsValueAnimPreviewBtn.addEventListener("click", playValueAnimPreview);
  }
  for (const input of [el.settingsValueAnim, el.settingsValueAnimMs]) {
    if (!input) continue;
    input.addEventListener("change", () => {
      updateValueAnimCss();
      playValueAnimPreview();
    });
  }
  updateValueAnimCss();
}

/* Colour pickers for the top bar. They stay on screen even while the theme owns
 * the colours - only dimmed - so the options can be found without having to tick
 * "Own colours" first. */
const TOPBAR_COLOR_INPUTS = [
  "settingsTopbarBg",
  "settingsTopbarClockColor",
  "settingsTopbarDateColor",
  "settingsTopbarGearColor",
  "settingsTopbarHaColor",
  "settingsTopbarWifiColor",
];

function topbarCustomColorsOn() {
  return Boolean(el.settingsTopbarCustomColors && el.settingsTopbarCustomColors.checked);
}

function updateTopbarCss() {
  const on = topbarCustomColorsOn();
  if (el.settingsTopbarColors) {
    el.settingsTopbarColors.classList.remove("hidden");
    el.settingsTopbarColors.classList.toggle("grid-dimmed", !on);
  }
}

/* Same treatment for the bottom bar. */
const NAV_COLOR_INPUTS = [
  "settingsNavBarBgColor",
  "settingsNavBarBorderColor",
  "settingsNavButtonBgColor",
  "settingsNavButtonBorderColor",
  "settingsNavTabIdleColor",
  "settingsNavTabActiveColor",
  "settingsNavHomeIdleColor",
  "settingsNavHomeActiveColor",
];

function navCustomColorsOn() {
  return Boolean(el.settingsNavCustomColors && el.settingsNavCustomColors.checked);
}

function updateNavCss() {
  if (el.settingsNavColors) {
    el.settingsNavColors.classList.remove("hidden");
    el.settingsNavColors.classList.toggle("grid-dimmed", !navCustomColorsOn());
  }
}

function bindNav() {
  if (el.settingsNavCustomColors) {
    el.settingsNavCustomColors.addEventListener("change", updateNavCss);
  }
  for (const key of NAV_COLOR_INPUTS) {
    const input = el[key];
    if (!input || input.dataset.navBound === "1") continue;
    input.dataset.navBound = "1";
    // Picking a colour implies the user wants the bottom bar to own its palette.
    input.addEventListener("change", () => {
      if (el.settingsNavCustomColors) el.settingsNavCustomColors.checked = true;
      updateNavCss();
    });
  }
  updateNavCss();
}

function bindTopbar() {
  if (el.settingsTopbarCustomColors) {
    el.settingsTopbarCustomColors.addEventListener("change", updateTopbarCss);
  }
  for (const key of TOPBAR_COLOR_INPUTS) {
    const input = el[key];
    if (!input || input.dataset.topbarBound === "1") continue;
    input.dataset.topbarBound = "1";
    // Picking a colour implies the user wants the top bar to own its palette.
    input.addEventListener("change", () => {
      if (el.settingsTopbarCustomColors) el.settingsTopbarCustomColors.checked = true;
      updateTopbarCss();
    });
  }
  updateTopbarCss();
}

function renderPanelPages(pages) {
  if (!el.settingsPageTarget) return;
  const previous = el.settingsPageTarget.value;
  el.settingsPageTarget.innerHTML = "";
  for (const page of pages) {
    if (!page || typeof page.id !== "string" || !page.id.length) continue;
    const option = document.createElement("option");
    option.value = page.id;
    option.textContent = page.title ? `${page.title} (${page.id})` : page.id;
    el.settingsPageTarget.appendChild(option);
  }
  const target = pages.some((page) => page && page.id === previous && page.active !== true)
    ? previous
    : pages.find((page) => page && typeof page.id === "string" && !page.active)?.id;
  if (target) {
    el.settingsPageTarget.value = target;
  }
}

/* The page list is owned by the firmware; the editor only mirrors it. */
async function loadPanelPages(showStatus) {
  if (!el.settingsPageTarget) return;
  if (showStatus && el.settingsPageActivateInfo) {
    el.settingsPageActivateInfo.textContent = t("status.loading_settings");
    el.settingsPageActivateInfo.classList.remove("error");
  }
  try {
    const data = await apiGet("/api/pages");
    const pages = Array.isArray(data.pages) ? data.pages : [];
    renderPanelPages(pages);
    if (el.settingsPageActivateInfo) {
      const active = pages.find((page) => page && page.active === true);
      el.settingsPageActivateInfo.textContent = t("settings.pages.current", {
        page: active ? active.title || active.id : "-",
      });
      el.settingsPageActivateInfo.classList.remove("error");
    }
  } catch (err) {
    if (el.settingsPageActivateInfo) {
      el.settingsPageActivateInfo.textContent = String(err?.message || err);
      el.settingsPageActivateInfo.classList.add("error");
    }
  }
}

async function activatePanelPage(pageId) {
  const response = await fetch("/api/pages/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: pageId }),
  });
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = json.error || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return response.json();
}

/* Keeps the port field in step with the TLS checkbox without ever overriding a
 * custom port the user typed in: only the well-known 1883/8883 pair is swapped. */
function syncMqttPortForTls() {
  if (!el.settingsMqttPort || !el.settingsMqttUseTls) return;
  const current = Number(el.settingsMqttPort.value) || 0;
  if (el.settingsMqttUseTls.checked) {
    if (current === 0 || current === 1883) el.settingsMqttPort.value = 8883;
  } else if (current === 8883) {
    el.settingsMqttPort.value = 1883;
  }
}

function collectMqttPayload() {
  const mqtt = {};
  if (el.settingsMqttEnabled) mqtt.enabled = el.settingsMqttEnabled.checked;
  if (el.settingsMqttUseTls) mqtt.use_tls = el.settingsMqttUseTls.checked;
  if (el.settingsMqttHost) mqtt.host = el.settingsMqttHost.value.trim();
  if (el.settingsMqttPort) {
    const port = Math.round(clamp(Number(el.settingsMqttPort.value) || 0, 1, 65535));
    if (Number.isFinite(port)) mqtt.port = port;
  }
  if (el.settingsMqttUsername) mqtt.username = el.settingsMqttUsername.value.trim();
  if (el.settingsMqttPassword && el.settingsMqttPassword.value.length > 0) {
    mqtt.password = el.settingsMqttPassword.value;
  }
  if (el.settingsMqttDiscoveryPrefix) {
    const prefix = el.settingsMqttDiscoveryPrefix.value.trim().replace(/^\/+|\/+$/g, "");
    if (prefix) mqtt.discovery_prefix = prefix;
  }
  return mqtt;
}

function collectSystemPayload() {
  const system = {};
  if (el.settingsAutoRestartEnabled) {
    system.auto_restart_enabled = el.settingsAutoRestartEnabled.checked;
  }
  if (el.settingsAutoRestartHours) {
    const hours = Math.round(clamp(Number(el.settingsAutoRestartHours.value) || 0, 1, 168));
    if (Number.isFinite(hours)) system.auto_restart_hours = hours;
  }
  return system;
}

async function applyMqttSettings() {
  const mqtt = collectMqttPayload();
  if (!Object.keys(mqtt).length) return;
  if (el.settingsMqttInfo) {
    el.settingsMqttInfo.textContent = t("status.saving_settings");
    el.settingsMqttInfo.classList.remove("error");
  }
  await putSettings({ mqtt, reboot: false });
  await loadSettings(true);
  if (el.settingsMqttInfo) {
    el.settingsMqttInfo.textContent = t("settings.mqtt.applied");
    el.settingsMqttInfo.classList.remove("error");
  }
}

function imageFileToRgb565(file, w, h) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, dx, dy, dw, dh);
        const imageData = ctx.getImageData(0, 0, w, h);
        const px = imageData.data;
        const bytes = new Uint8Array(w * h * 2);
        let o = 0;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i] >> 3;
          const g = px[i + 1] >> 2;
          const b = px[i + 2] >> 3;
          const v = (r << 11) | (g << 5) | b;
          bytes[o++] = v & 0xff;
          bytes[o++] = (v >> 8) & 0xff;
        }
        resolve(bytes);
      } catch (_) {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function uploadWallpaper() {
  const file = el.settingsWallpaperFile?.files?.[0];
  if (!file) {
    if (el.settingsWallpaperInfo) {
      el.settingsWallpaperInfo.textContent = t("settings.display.no_wallpaper_file");
      el.settingsWallpaperInfo.classList.add("error");
    }
    return;
  }

  const w = Number(editor.appScreenW) || 480;
  const h = Number(editor.appScreenH) || 480;
  if (el.settingsWallpaperInfo) {
    el.settingsWallpaperInfo.textContent = t("settings.display.converting");
    el.settingsWallpaperInfo.classList.remove("error");
  }
  const data = await imageFileToRgb565(file, w, h);
  if (!data) {
    if (el.settingsWallpaperInfo) {
      el.settingsWallpaperInfo.textContent = t("settings.display.convert_failed");
      el.settingsWallpaperInfo.classList.add("error");
    }
    return;
  }

  if (el.settingsWallpaperInfo) {
    el.settingsWallpaperInfo.textContent = t("settings.display.uploading");
  }
  const response = await fetch("/api/display/wallpaper", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: data,
  });
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = json.error || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  if (el.settingsWallpaperInfo) {
    el.settingsWallpaperInfo.textContent = t("settings.display.wallpaper_uploaded");
    el.settingsWallpaperInfo.classList.remove("error");
  }
}

async function removeWallpaper() {
  if (el.settingsWallpaperInfo) {
    el.settingsWallpaperInfo.textContent = t("settings.display.removing");
    el.settingsWallpaperInfo.classList.remove("error");
  }
  const response = await fetch("/api/display/wallpaper", { method: "DELETE" });
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = json.error || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  if (el.settingsWallpaperInfo) {
    el.settingsWallpaperInfo.textContent = t("settings.display.wallpaper_removed");
    el.settingsWallpaperInfo.classList.remove("error");
  }
}

function defaultLayout() {
  return {
    version: 1,
    pages: [
      {
        id: "living",
        title: t("layout.default_page.title"),
        widgets: [],
      },
    ],
  };
}

function defaultEnergyConfig() {
  return ENERGY_ENTITY_KEYS.reduce((config, key) => {
    config[key] = "";
    return config;
  }, { source: ENERGY_SOURCE_HA });
}

function isEnergyPage(page) {
  return page?.type === ENERGY_PAGE_TYPE;
}

function energyPageUsesHaSource(page) {
  if (!isEnergyPage(page)) return false;
  const source = typeof page.energy?.source === "string" ? page.energy.source.trim() : "";
  return source !== ENERGY_SOURCE_MANUAL;
}

function layoutHasHaEnergyPage() {
  return (editor.layout?.pages || []).some((page) => energyPageUsesHaSource(page));
}

function normalizeEnergyConfig(page) {
  if (!page || !isEnergyPage(page)) return;
  if (!page.energy || typeof page.energy !== "object" || Array.isArray(page.energy)) {
    page.energy = defaultEnergyConfig();
  }
  const source = typeof page.energy.source === "string" ? page.energy.source.trim() : "";
  const hasManualSensors = ENERGY_ENTITY_KEYS.some((key) => typeof page.energy[key] === "string" && page.energy[key].trim());
  page.energy.source = ENERGY_SOURCES.has(source) ? source : (hasManualSensors ? ENERGY_SOURCE_MANUAL : ENERGY_SOURCE_HA);
  for (const key of ENERGY_ENTITY_KEYS) {
    page.energy[key] = typeof page.energy[key] === "string" ? page.energy[key].trim() : "";
  }
  page.widgets = [];
}

function getEnergyInputs() {
  return {
    home_power_entity_id: el.energyHomePower,
    solar_power_entity_id: el.energySolarPower,
    grid_power_entity_id: el.energyGridPower,
    grid_import_power_entity_id: el.energyGridImport,
    grid_export_power_entity_id: el.energyGridExport,
    battery_power_entity_id: el.energyBatteryPower,
    battery_charge_power_entity_id: el.energyBatteryCharge,
    battery_discharge_power_entity_id: el.energyBatteryDischarge,
    battery_soc_entity_id: el.energyBatterySoc,
  };
}

function defaultMusicConfig() {
  return {
    player_entity_id: "",
    players: [],
  };
}

function isMusicPage(page) {
  return page?.type === MUSIC_PAGE_TYPE;
}

function normalizeMusicConfig(page) {
  if (!page || !isMusicPage(page)) return;
  if (!page.music || typeof page.music !== "object" || Array.isArray(page.music)) {
    page.music = defaultMusicConfig();
  }
  page.music.player_entity_id =
    typeof page.music.player_entity_id === "string" ? page.music.player_entity_id.trim() : "";
  const players = Array.isArray(page.music.players) ? page.music.players : [];
  page.music.players = players
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
  page.widgets = [];
}

function musicPlayersFromText(text) {
  return String(text || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function applyMusicPageConfig(options = {}) {
  const page = selectedPage();
  if (!page || !isMusicPage(page)) return false;
  normalizeMusicConfig(page);
  page.music.player_entity_id = (el.musicPlayerEntity?.value || "").trim();
  page.music.players = musicPlayersFromText(el.musicPlayers?.value);
  if (options.render !== false) {
    renderAll();
  }
  return true;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampInt(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.round(clamp(num, min, max));
}

function minutesToTimeString(minutes) {
  const total = clampInt(minutes, 0, 1439, 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function timeStringToMinutes(value, fallback) {
  if (typeof value !== "string") return fallback;
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(value.trim());
  if (!match) return fallback;
  return clampInt(Number(match[1]) * 60 + Number(match[2]), 0, 1439, fallback);
}

function snap(value) {
  return Math.round(value / GRID) * GRID;
}

function selectedPage() {
  if (!editor.layout) return null;
  return editor.layout.pages.find((p) => p.id === editor.selectedPageId) || null;
}

function selectedWidget() {
  const page = selectedPage();
  if (!page) return null;
  if (!Array.isArray(page.widgets)) return null;
  return page.widgets.find((w) => w.id === editor.selectedWidgetId) || null;
}

function inspectorWidgetType() {
  return selectedWidget()?.type || el.fType?.value || "sensor";
}

function inspectorSliderEntityDomain() {
  if (el.fSliderEntityDomain) {
    return normalizeSliderEntityDomain(el.fSliderEntityDomain.value);
  }
  return normalizeSliderEntityDomain(selectedWidget()?.slider_entity_domain);
}

function inspectorButtonMode() {
  if (el.fButtonMode) {
    return normalizeButtonMode(el.fButtonMode.value);
  }
  return normalizeButtonMode(selectedWidget()?.button_mode);
}

function allowedEntityDomainsForWidgetType(
  type,
  sliderDomain = DEFAULT_SLIDER_ENTITY_DOMAIN,
  buttonMode = DEFAULT_BUTTON_MODE,
) {
  if (type === "empty_tile") return [];
  if (type === "clock_alarm") return [];
  if (type === "sensor" || type === "graph") return ["sensor"];
  if (type === "binary_sensor") return ["binary_sensor"];
  if (type === "alarm_tile") return ["alarm_control_panel"];
  if (type === "button") {
    const normalizedMode = normalizeButtonMode(buttonMode);
    return buttonModeRequiresMediaPlayer(normalizedMode) ? ["media_player"] : ["switch", "media_player"];
  }
  if (type === "light_tile") return ["light"];
  if (type === "heating_tile") return ["climate"];
  if (type === "weather_tile" || type === "weather_3day") return ["weather"];
  if (type === "todo_list") return ["todo"];
  if (type === "media_player") return ["media_player"];
  if (type === "roborock_tile") return ["vacuum"];
  if (type === "cover_tile") return ["cover"];
  if (type === "scene_tile") return ["scene"];
  if (type === "person_tile") return ["person"];
  if (type === "timer_tile") return ["timer"];
  if (type === "slider") {
    const normalized = normalizeSliderEntityDomain(sliderDomain);
    if (normalized === "auto") {
      return ["light", "media_player", "cover"];
    }
    return [normalized];
  }
  return [];
}

function expectedDomainForWidgetType(
  type,
  sliderDomain = DEFAULT_SLIDER_ENTITY_DOMAIN,
  buttonMode = DEFAULT_BUTTON_MODE,
) {
  const domains = allowedEntityDomainsForWidgetType(type, sliderDomain, buttonMode);
  return domains.length === 1 ? domains[0] : "";
}

function secondaryEntityConfigForWidgetType(type) {
  if (type === "heating_tile") {
    return {
      enabled: true,
      domain: "sensor",
      optional: false,
      labelKey: "layout.inspector.secondary_entity",
      labelFallback: "Actual entity (sensor)",
      invalidStatusKey: "layout.status.secondary_sensor_required",
    };
  }
  if (type === "roborock_tile") {
    return {
      enabled: true,
      domain: "image",
      optional: true,
      labelKey: "layout.inspector.secondary_entity_roborock",
      labelFallback: "Map entity (image, optional)",
      invalidStatusKey: "layout.status.secondary_image_required",
    };
  }
  return {
    enabled: false,
    domain: "",
    optional: true,
    labelKey: "layout.inspector.secondary_entity",
    labelFallback: "Actual entity (sensor)",
    invalidStatusKey: "layout.status.secondary_sensor_required",
  };
}

function listEntitiesByDomain(domain) {
  if (!domain) return editor.entities;
  return editor.entities.filter((entity) => typeof entity.id === "string" && entity.id.startsWith(`${domain}.`));
}

function entityMatchesWidgetType(
  entity,
  type,
  sliderDomain = DEFAULT_SLIDER_ENTITY_DOMAIN,
  buttonMode = DEFAULT_BUTTON_MODE,
) {
  if (type === "empty_tile") return true;
  if (type === "clock_alarm") return true;

  const id = typeof entity?.id === "string" ? entity.id : "";
  /* These tiles also work without an entity and bind one when it is set. */
  if (!id) return ENTITY_OPTIONAL_WIDGET_TYPES.includes(type);

  const allowedDomains = allowedEntityDomainsForWidgetType(type, sliderDomain, buttonMode);
  if (!allowedDomains.length) return true;
  const matchesDomain = allowedDomains.some((domain) => id.startsWith(`${domain}.`));
  if (!matchesDomain) return false;
  const modelEntity = entity?.capabilities
    ? entity
    : editor.entities.find((candidate) => candidate?.id === id);
  if (type === "slider" && id.startsWith("light.") && modelEntity?.capabilities?.dimming === false) {
    return false;
  }
  return true;
}

function listEntitiesForWidgetType(
  type,
  sliderDomain = DEFAULT_SLIDER_ENTITY_DOMAIN,
  buttonMode = DEFAULT_BUTTON_MODE,
) {
  if (type === "empty_tile") return [];
  if (type === "clock_alarm") return [];
  return editor.entities.filter((entity) => entityMatchesWidgetType(entity, type, sliderDomain, buttonMode));
}

function pickDefaultEntityForWidgetType(
  type,
  sliderDomain = DEFAULT_SLIDER_ENTITY_DOMAIN,
  buttonMode = DEFAULT_BUTTON_MODE,
) {
  if (type === "empty_tile") return "";
  if (type === "clock_alarm") return "";
  /* A timer tile is standalone (local countdown) unless an entity is picked. */
  if (type === "timer_tile") return "";
  const matching = listEntitiesForWidgetType(type, sliderDomain, buttonMode);
  if (matching.length > 0) return matching[0].id;
  return "";
}

function uniqueId(prefix, list, accessor = (x) => x.id) {
  let i = 1;
  while (true) {
    const candidate = `${prefix}_${i}`;
    if (!list.some((entry) => accessor(entry) === candidate)) return candidate;
    i += 1;
  }
}

function sanitizeIdPart(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "item";
}

function createWidgetIdForPage(page, type) {
  const pagePart = sanitizeIdPart(page?.id || page?.title || "page");
  const typePart = sanitizeIdPart(type || "widget");
  const allWidgets = editor.layout?.pages?.flatMap((p) => (Array.isArray(p.widgets) ? p.widgets : [])) || [];

  let i = 1;
  while (true) {
    const candidate = `${pagePart}_${typePart}_${i}`;
    if (!allWidgets.some((widget) => widget?.id === candidate)) {
      return candidate;
    }
    i += 1;
  }
}

async function apiGet(path, signal) {
  const response = await fetch(path, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function setEntityOptionsList(target, entities) {
  target.innerHTML = "";
  for (const entity of entities) {
    if (!entity || typeof entity.id !== "string" || !entity.id.length) continue;
    const option = document.createElement("option");
    option.value = entity.id;
    option.label = `${entity.id} (${entity.name || entity.id})`;
    target.appendChild(option);
  }
}

function normalizeEntitySearchTerm(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const wildcardIndex = trimmed.indexOf("*");
  if (wildcardIndex < 0) return trimmed;
  return trimmed.slice(wildcardIndex + 1).trim();
}

function parseEntitySearchInput(rawValue, fallbackDomain = "") {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";
  let domain = typeof fallbackDomain === "string" ? fallbackDomain.trim().toLowerCase() : "";
  let search = value;

  const dotIndex = value.indexOf(".");
  if (dotIndex > 0) {
    const candidateDomain = value.slice(0, dotIndex).trim().toLowerCase();
    if (/^[a-z0-9_]+$/.test(candidateDomain)) {
      domain = candidateDomain;
      search = value.slice(dotIndex + 1);
    }
  }

  search = normalizeEntitySearchTerm(search);
  return { domain, search };
}

function entityContainsSearch(entity, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  const id = String(entity?.id || "").toLowerCase();
  const name = String(entity?.name || "").toLowerCase();
  return id.includes(needle) || name.includes(needle);
}

function filterLocalEntitySuggestions(source, domain, search, maxItems) {
  const results = [];
  for (const entity of source) {
    if (!entity || typeof entity.id !== "string" || entity.id.length === 0) continue;
    if (domain && !entity.id.startsWith(`${domain}.`)) continue;
    if (!entityContainsSearch(entity, search)) continue;
    results.push(entity);
    if (results.length >= maxItems) break;
  }
  return results;
}

async function fetchEntitySuggestions(domain, search, limit) {
  const params = new URLSearchParams();
  if (domain) params.set("domain", domain);
  if (search) params.set("search", search);
  params.set("limit", String(limit));
  const data = await apiGet(`/api/entities?${params.toString()}`);
  return Array.isArray(data.items) ? data.items : [];
}

function primaryEntitySource() {
  const inspectorType = inspectorWidgetType();
  const sliderDomain = inspectorSliderEntityDomain();
  const buttonMode = inspectorButtonMode();
  const typedOptions = listEntitiesForWidgetType(inspectorType, sliderDomain, buttonMode);
  return typedOptions.length > 0 ? typedOptions : editor.entities;
}

function defaultPrimaryEntityDomain() {
  return expectedDomainForWidgetType(inspectorWidgetType(), inspectorSliderEntityDomain(), inspectorButtonMode());
}

function scheduleEntityAutocomplete(kind, immediate = false) {
  const isSecondary = kind === "secondary";
  const state = isSecondary ? entityAutocomplete.secondary : entityAutocomplete.primary;
  const input = isSecondary ? el.fSecondaryEntity : el.fEntity;
  const options = isSecondary ? el.sensorEntityOptions : el.entityOptions;
  const secondaryConfig = secondaryEntityConfigForWidgetType(inspectorWidgetType());
  if (!input || !options) return;
  if (!isSecondary && input.disabled) return;
  if (isSecondary && input.disabled) return;
  if (isSecondary && !secondaryConfig.enabled) return;

  if (state.timerId !== null) {
    window.clearTimeout(state.timerId);
    state.timerId = null;
  }

  const run = async () => {
    const requestSeq = ++state.requestSeq;
    const raw = input.value || "";
    const fallbackDomain = isSecondary ? secondaryConfig.domain : defaultPrimaryEntityDomain();
    const { domain, search } = parseEntitySearchInput(raw, fallbackDomain);
    const source = isSecondary ? listEntitiesByDomain(secondaryConfig.domain) : primaryEntitySource();
    const allowedDomains = isSecondary
      ? [secondaryConfig.domain]
      : allowedEntityDomainsForWidgetType(inspectorWidgetType(), inspectorSliderEntityDomain(), inspectorButtonMode());

    if (domain && allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
      setEntityOptionsList(options, []);
      return;
    }

    const localResults = filterLocalEntitySuggestions(source, domain, search, ENTITY_AUTOCOMPLETE_MAX_ITEMS);
    setEntityOptionsList(options, localResults);

    const shouldQueryApi = domain.length > 0 || search.length >= 2;
    if (!shouldQueryApi) return;

    try {
      const remoteResults = await fetchEntitySuggestions(domain, search, ENTITY_AUTOCOMPLETE_MAX_ITEMS);
      if (requestSeq !== state.requestSeq) return;
      if (remoteResults.length > 0) {
        setEntityOptionsList(options, remoteResults);
      }
    } catch (_) {
      // Keep local fallback options.
    }
  };

  if (immediate) {
    void run();
    return;
  }

  state.timerId = window.setTimeout(() => {
    state.timerId = null;
    void run();
  }, ENTITY_AUTOCOMPLETE_DEBOUNCE_MS);
}

async function loadLayout() {
  setStatus(t("layout.status.loading"));
  try {
    editor.layout = await apiGet("/api/layout");
    if (!editor.layout || !Array.isArray(editor.layout.pages)) {
      editor.layout = defaultLayout();
    }
  } catch (err) {
    editor.layout = defaultLayout();
    setStatus(t("layout.status.load_failed", { error: err.message }), true);
  }

  if (!editor.layout.pages.length) {
    editor.layout.pages.push(defaultLayout().pages[0]);
  }
  normalizeLayoutWidgets(editor.layout);
  editor.layoutSignature = layoutSignatureOf(editor.layout);
  editor.selectedPageId = editor.layout.pages[0].id;
  editor.selectedWidgetId = null;
  renderAll();
  setStatus(t("layout.status.loaded"));
}

async function loadEntities() {
  try {
    const data = await apiGet("/api/entities");
    editor.entities = Array.isArray(data.items) ? data.items : [];
    renderEntityOptions();
  } catch (err) {
    setStatus(t("layout.status.entity_fetch_failed", { error: err.message }), true);
  }
}

async function refreshStates() {
  try {
    const data = await apiGet("/api/state");
    editor.states = new Map();
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        editor.states.set(item.entity_id, item.state);
      }
    }
    renderCanvas();
  } catch (_) {
    // Keep previous preview values.
  }
}

async function loadEnergyPreview() {
  if (!layoutHasHaEnergyPage()) {
    if (editor.energySnapshot !== null) {
      editor.energySnapshot = null;
      renderCanvas();
    }
    return;
  }
  try {
    editor.energySnapshot = await apiGet("/api/ha/energy");
    renderCanvas();
  } catch (_) {
    if (editor.energySnapshot !== null) {
      editor.energySnapshot = null;
      renderCanvas();
    }
  }
}

function clearLightEntityPickerPoll() {
  if (editor.lightPicker.pollTimerId !== null) {
    window.clearTimeout(editor.lightPicker.pollTimerId);
    editor.lightPicker.pollTimerId = null;
  }
}

function clearLightEntityPickerSearchDebounce() {
  if (editor.lightPicker.searchDebounceId !== null) {
    window.clearTimeout(editor.lightPicker.searchDebounceId);
    editor.lightPicker.searchDebounceId = null;
  }
}

function cancelLightEntityPickerRequest() {
  const config = entityPickerConfig();
  const params = new URLSearchParams();
  params.set("domain", config.domain);
  const search = entityPickerSearchValue();
  if (search) params.set("search", search);
  fetch(`/api/ha/light_entities?${params.toString()}`, { method: "DELETE", cache: "no-store" }).catch(() => {});
}

function entityPickerConfig(widgetType = editor.lightPicker.widgetType) {
  const normalizedWidgetType = ENTITY_PICKER_CONFIGS[widgetType] ? widgetType : "light_tile";
  return {
    widgetType: normalizedWidgetType,
    ...ENTITY_PICKER_CONFIGS[normalizedWidgetType],
  };
}

function entityPickerItemsLabel(config = entityPickerConfig()) {
  return t(config.itemsKey, {}, config.itemsFallback);
}

function entityPickerSearchValue() {
  return String(editor.lightPicker.search || "").trim();
}

function entityPickerSearchReady(config = entityPickerConfig()) {
  const minSearch = Number(config.minSearch || 0);
  return minSearch <= 0 || entityPickerSearchValue().length >= minSearch;
}

function entityPickerLiveSearchEnabled(config = entityPickerConfig()) {
  return config.liveSearch !== false;
}

function entityPickerCacheKey(domain, search = entityPickerSearchValue()) {
  return `${domain}|${String(search || "").trim().toLowerCase()}`;
}

function normalizeEntityPickerItems(items, domain) {
  if (!Array.isArray(items)) return [];
  const prefix = `${domain}.`;
  return items
    .filter((item) => item && typeof item.id === "string" && item.id.startsWith(prefix))
    .map((item) => ({
      id: item.id,
      name: String(item.name || item.id),
      room: String(item.room || ""),
      area_id: String(item.area_id || ""),
      icon: String(item.icon || ""),
    }));
}

function entityPickerRoomLabel(item) {
  return item.room || t("entity_picker.unassigned_room");
}

function mergeEntityPickerItemsIntoEntities(items, domain) {
  if (!Array.isArray(items) || !items.length) return;
  const byId = new Map(editor.entities.map((entity) => [entity.id, entity]));
  for (const item of items) {
    if (!item?.id || byId.has(item.id)) continue;
    const entity = {
      id: item.id,
      name: item.name || item.id,
      domain,
      icon: item.icon || "",
      capabilities: {},
    };
    editor.entities.push(entity);
    byId.set(item.id, entity);
  }
  renderEntityOptions();
}

function groupEntityPickerItemsByRoom(items) {
  const groups = new Map();
  for (const item of items) {
    const label = entityPickerRoomLabel(item);
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(item);
  }
  return [...groups.entries()]
    .map(([room, entries]) => ({
      room,
      entries: entries.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
    }))
    .sort((a, b) => {
      const unassigned = t("entity_picker.unassigned_room");
      if (a.room === unassigned && b.room !== unassigned) return 1;
      if (b.room === unassigned && a.room !== unassigned) return -1;
      return a.room.localeCompare(b.room);
    });
}

function renderLightEntityPicker(data = {}) {
  if (!el.lightEntityPickerRooms || !el.lightEntityPickerStatus) return;

  const config = entityPickerConfig();
  const domain = config.domain;
  const search = entityPickerSearchValue();
  const cacheKey = entityPickerCacheKey(domain, search);
  const widgetLabel = t(config.widgetKey, {}, config.widgetFallback);
  const itemsLabel = entityPickerItemsLabel(config);
  const searchReady = entityPickerSearchReady(config);
  const liveSearch = entityPickerLiveSearchEnabled(config);
  const sourceItems = Object.prototype.hasOwnProperty.call(data, "items")
    ? data.items
    : editor.lightPicker.items;
  const items = normalizeEntityPickerItems(sourceItems, domain);

  if (el.lightEntityPickerTitle) {
    el.lightEntityPickerTitle.textContent = t(config.titleKey, {}, config.titleFallback);
  }
  if (el.lightEntityPickerBlankBtn) {
    el.lightEntityPickerBlankBtn.textContent = t(config.blankKey, {}, config.blankFallback);
  }
  if (el.lightEntityPickerRefreshBtn) {
    el.lightEntityPickerRefreshBtn.textContent = liveSearch ? t("entity_picker.refresh") : t("entity_picker.search");
  }
  if (el.lightEntityPickerSearch && el.lightEntityPickerSearch.value !== editor.lightPicker.search) {
    el.lightEntityPickerSearch.value = editor.lightPicker.search;
  }

  if (items.length > 0 || data.status === "ready" || data.status === "refreshing") {
    editor.lightPicker.items = items;
    editor.lightPicker.itemsByDomain[cacheKey] = items;
    editor.lightPicker.hasLoaded = true;
    editor.lightPicker.loadedByDomain[cacheKey] = true;
    mergeEntityPickerItemsIntoEntities(items, domain);
  }
  editor.lightPicker.lastStatus = data.status || editor.lightPicker.lastStatus;

  const pending = data.pending === true || editor.lightPicker.loading;
  let statusText = "";
  if (data.status === "disconnected") {
    statusText = t("entity_picker.disconnected");
  } else if (!searchReady && !editor.lightPicker.items.length) {
    statusText = t("entity_picker.search_hint", { count: config.minSearch, items: itemsLabel });
  } else if (!liveSearch && searchReady && !editor.lightPicker.hasLoaded && !pending && !editor.lightPicker.items.length) {
    statusText = t("entity_picker.search_ready", { items: itemsLabel });
  } else if (data.status === "refreshing") {
    statusText = t("entity_picker.refreshing_items", { items: itemsLabel });
  } else if (pending && !editor.lightPicker.items.length) {
    statusText = t("entity_picker.pending");
  } else if (!editor.lightPicker.items.length) {
    statusText = t("entity_picker.empty_items", { items: itemsLabel });
  }
  if (data.truncated) {
    statusText = statusText ? `${statusText}\n${t("entity_picker.truncated")}` : t("entity_picker.truncated");
  }
  el.lightEntityPickerStatus.textContent = statusText;

  const loaded = Number.isFinite(Number(data.loaded)) ? Number(data.loaded) : editor.lightPicker.items.length;
  const rawTotal = Number.isFinite(Number(data.total)) ? Number(data.total) : 0;
  const limit = Number.isFinite(Number(data.limit)) && Number(data.limit) > 0 ? Number(data.limit) : loaded;
  const target = rawTotal > 0 ? Math.min(rawTotal, limit) : limit;
  const progressVisible = searchReady && (pending || rawTotal > 0 || data.truncated === true);
  if (el.lightEntityPickerProgress && el.lightEntityPickerProgressBar && el.lightEntityPickerProgressText) {
    el.lightEntityPickerProgress.classList.toggle("hidden", !progressVisible);
    const pct = target > 0 ? Math.min(100, Math.max(0, (loaded * 100) / target)) : (pending ? 8 : 0);
    el.lightEntityPickerProgressBar.style.width = `${pct}%`;
    el.lightEntityPickerProgressText.textContent = rawTotal > 0
      ? t("entity_picker.progress_total", {
        loaded: Math.min(loaded, target),
        target,
        total: rawTotal,
      })
      : t("entity_picker.progress", { loaded, target: target || "..." });
  }

  const groups = groupEntityPickerItemsByRoom(editor.lightPicker.items);
  el.lightEntityPickerRooms.innerHTML = "";
  for (const group of groups) {
    const details = document.createElement("details");
    details.className = "light-picker-room";
    details.open = groups.length <= 3 || group.entries.length <= 8;

    const summary = document.createElement("summary");
    summary.textContent = `${group.room} (${group.entries.length})`;
    details.appendChild(summary);

    const list = document.createElement("div");
    list.className = "light-picker-room-list";
    for (const item of group.entries) {
      const button = document.createElement("button");
      button.className = "light-picker-entity";
      button.type = "button";
      button.title = item.id;
      button.innerHTML = `<strong></strong><span></span>`;
      button.querySelector("strong").textContent = item.name || item.id;
      button.querySelector("span").textContent = item.id;
      button.onclick = () => {
        addWidget(config.widgetType || editor.lightPicker.widgetType, {
          entityId: item.id,
          title: item.name || item.id,
        });
        closeLightEntityPicker();
        setStatus(t("entity_picker.added_widget", { widget: widgetLabel, entity: item.id }));
      };
      list.appendChild(button);
    }
    details.appendChild(list);
    el.lightEntityPickerRooms.appendChild(details);
  }
}

async function fetchLightEntityPicker(options = {}) {
  const refresh = options.refresh === true;
  const pollCount = Number(options.pollCount || 0);
  const config = entityPickerConfig();
  const domain = config.domain;
  const search = entityPickerSearchValue();
  const itemsLabel = entityPickerItemsLabel(config);
  if (!entityPickerSearchReady(config)) {
    editor.lightPicker.loading = false;
    renderLightEntityPicker({
      status: "idle",
      pending: false,
      items: editor.lightPicker.items,
    });
    return;
  }
  const requestSeq = ++editor.lightPicker.requestSeq;
  editor.lightPicker.loading = true;
  if (pollCount === 0 || refresh) {
    const startStatus = refresh && editor.lightPicker.items.length > 0 ? "refreshing" : "pending";
    renderLightEntityPicker({
      status: startStatus,
      pending: true,
      items: editor.lightPicker.items,
    });
  }

  const params = new URLSearchParams();
  params.set("domain", domain);
  if (search) params.set("search", search);
  if (refresh) params.set("refresh", "1");

  try {
    const data = await apiGet(`/api/ha/light_entities${params.toString() ? `?${params.toString()}` : ""}`);
    if (requestSeq !== editor.lightPicker.requestSeq) return;
    editor.lightPicker.loading = data.pending === true;
    renderLightEntityPicker(data);

    if (data.pending === true && pollCount < LIGHT_ENTITY_PICKER_MAX_POLLS) {
      clearLightEntityPickerPoll();
      editor.lightPicker.pollTimerId = window.setTimeout(() => {
        editor.lightPicker.pollTimerId = null;
        void fetchLightEntityPicker({ refresh: false, pollCount: pollCount + 1 });
      }, LIGHT_ENTITY_PICKER_POLL_MS);
    }
  } catch (err) {
    if (requestSeq !== editor.lightPicker.requestSeq) return;
    editor.lightPicker.loading = false;
    const message = t("entity_picker.fetch_failed_items", { items: itemsLabel, error: err.message });
    el.lightEntityPickerStatus.textContent = message;
    setStatus(message, true);
  }
}

function openLightEntityPicker(widgetType = "light_tile") {
  const config = entityPickerConfig(widgetType);
  if (!el.lightEntityPickerOverlay) {
    addWidget(config.widgetType || widgetType);
    return;
  }
  editor.lightPicker.widgetType = widgetType;
  editor.lightPicker.domain = config.domain;
  editor.lightPicker.search = editor.lightPicker.searchByDomain[config.domain] || "";
  if (el.lightEntityPickerSearch) {
    el.lightEntityPickerSearch.value = editor.lightPicker.search;
  }
  const cacheKey = entityPickerCacheKey(config.domain);
  editor.lightPicker.items = editor.lightPicker.itemsByDomain[cacheKey] || [];
  editor.lightPicker.hasLoaded = editor.lightPicker.loadedByDomain[cacheKey] === true;
  const shouldAutoFetch =
    !editor.lightPicker.hasLoaded && entityPickerSearchReady(config) && entityPickerLiveSearchEnabled(config);
  el.lightEntityPickerOverlay.classList.remove("hidden");
  renderLightEntityPicker({
    status: editor.lightPicker.hasLoaded ? "ready" : (shouldAutoFetch ? "pending" : "idle"),
    pending: shouldAutoFetch,
    items: editor.lightPicker.items,
  });
  if (shouldAutoFetch) {
    void fetchLightEntityPicker();
  }
}

function closeLightEntityPicker() {
  clearLightEntityPickerPoll();
  clearLightEntityPickerSearchDebounce();
  editor.lightPicker.requestSeq += 1;
  cancelLightEntityPickerRequest();
  editor.lightPicker.loading = false;
  if (el.lightEntityPickerOverlay) {
    el.lightEntityPickerOverlay.classList.add("hidden");
  }
}

function layoutWidgetCount() {
  return (editor.layout?.pages || []).reduce((count, page) => (
    count + (Array.isArray(page.widgets) ? page.widgets.length : 0)
  ), 0);
}

function setupWizardPending() {
  return storageGet(SETUP_WIZARD_PENDING_STORAGE_KEY) === "1";
}

function markSetupWizardPending() {
  storageSet(SETUP_WIZARD_PENDING_STORAGE_KEY, "1");
  storageRemove(SETUP_WIZARD_DISMISSED_STORAGE_KEY);
}

function markSetupWizardDismissed() {
  storageRemove(SETUP_WIZARD_PENDING_STORAGE_KEY);
  storageSet(SETUP_WIZARD_DISMISSED_STORAGE_KEY, "1");
}

function setupWizardShouldAutoOpen() {
  if (!el.setupWizardOverlay || !editor.layout) return false;
  if (setupWizardPending()) return true;
  if (storageGet(SETUP_WIZARD_DISMISSED_STORAGE_KEY) === "1") return false;
  return Boolean(editor.settings?.ha?.configured) && layoutWidgetCount() === 0;
}

function setupWizardCountText() {
  const count = selectedPage()?.widgets?.length || 0;
  if (count <= 0) return t("setup.count_none");
  if (count === 1) return t("setup.count_one");
  return t("setup.count_many", { count });
}

function applySetupWizardPageTitle() {
  const page = selectedPage();
  if (!page || !el.setupWizardPageTitle) return;
  const title = el.setupWizardPageTitle.value.trim();
  if (title) {
    page.title = title;
    renderAll();
  }
}

function renderSetupWizard() {
  if (!el.setupWizardOverlay) return;
  if (el.setupWizardPageTitle && document.activeElement !== el.setupWizardPageTitle) {
    el.setupWizardPageTitle.value = selectedPage()?.title || t("layout.default_page.title");
  }
  if (el.setupWizardCount) {
    el.setupWizardCount.textContent = setupWizardCountText();
  }
}

function openSetupWizard(options = {}) {
  if (!el.setupWizardOverlay || !editor.layout) return;
  editor.setupWizard.active = true;
  editor.setupWizard.openedManually = options.manual === true;
  editor.setupWizard.addedSinceOpen = 0;
  if (el.setupWizardStatus) {
    el.setupWizardStatus.textContent = "";
    el.setupWizardStatus.classList.remove("error");
  }
  renderSetupWizard();
  el.setupWizardOverlay.classList.remove("hidden");
}

function closeSetupWizard(dismiss = true) {
  editor.setupWizard.active = false;
  if (dismiss) {
    markSetupWizardDismissed();
  }
  if (el.setupWizardOverlay) {
    el.setupWizardOverlay.classList.add("hidden");
  }
}

function openSetupWizardEntityPicker(widgetType) {
  applySetupWizardPageTitle();
  openLightEntityPicker(widgetType);
}

function onSetupWizardWidgetAdded(widget) {
  if (!editor.setupWizard.active || !widget) return;
  editor.setupWizard.addedSinceOpen += 1;
  if (el.setupWizardStatus) {
    el.setupWizardStatus.textContent = t("setup.added", { title: widget.title || widget.id });
    el.setupWizardStatus.classList.remove("error");
  }
  renderSetupWizard();
}

async function saveSetupWizardLayout(options = {}) {
  applySetupWizardPageTitle();
  if (el.setupWizardStatus) {
    el.setupWizardStatus.textContent = t("setup.saving");
    el.setupWizardStatus.classList.remove("error");
  }
  try {
    await saveLayout();
    if (el.setupWizardStatus) {
      el.setupWizardStatus.textContent = t("setup.saved");
      el.setupWizardStatus.classList.remove("error");
    }
    markSetupWizardDismissed();
    if (options.closeOnSuccess === true) {
      closeSetupWizard(false);
    }
    return true;
  } catch (err) {
    if (el.setupWizardStatus) {
      el.setupWizardStatus.textContent = t("setup.save_failed", { error: err.message });
      el.setupWizardStatus.classList.add("error");
    }
    return false;
  }
}

function renderEntityOptions() {
  const inspectorType = inspectorWidgetType();
  const sliderDomain = inspectorSliderEntityDomain();
  const buttonMode = inspectorButtonMode();
  const secondaryConfig = secondaryEntityConfigForWidgetType(inspectorType);
  const inspectorOptions = listEntitiesForWidgetType(inspectorType, sliderDomain, buttonMode);
  const primaryOptions = inspectorOptions.length > 0 ? inspectorOptions : editor.entities;
  setEntityOptionsList(el.entityOptions, primaryOptions.slice(0, ENTITY_AUTOCOMPLETE_MAX_ITEMS));

  setEntityOptionsList(
    el.sensorEntityOptions,
    secondaryConfig.domain
      ? listEntitiesByDomain(secondaryConfig.domain).slice(0, ENTITY_AUTOCOMPLETE_MAX_ITEMS)
      : [],
  );
  if (el.energyEntityOptions) {
    setEntityOptionsList(el.energyEntityOptions, listEntitiesByDomain("sensor").slice(0, ENTITY_AUTOCOMPLETE_MAX_ITEMS));
  }
  if (el.musicEntityOptions) {
    setEntityOptionsList(el.musicEntityOptions, listEntitiesByDomain("media_player").slice(0, ENTITY_AUTOCOMPLETE_MAX_ITEMS));
  }
  if (el.clockEntityOptions) {
    setEntityOptionsList(
      el.clockEntityOptions,
      listEntitiesByDomain("script")
        .concat(listEntitiesByDomain("media_player"))
        .slice(0, ENTITY_AUTOCOMPLETE_MAX_ITEMS),
    );
  }

  if (el.fSecondaryEntityLabel) {
    el.fSecondaryEntityLabel.textContent = t(secondaryConfig.labelKey, {}, secondaryConfig.labelFallback);
  }

  const secondaryEnabled = secondaryConfig.enabled;
  if (el.fSecondaryEntityWrap) {
    el.fSecondaryEntityWrap.classList.toggle("hidden", !secondaryEnabled);
  }
  el.fSecondaryEntity.disabled = !secondaryEnabled;
  if (!secondaryEnabled) {
    el.fSecondaryEntity.value = "";
  }

  const primaryEnabled = inspectorType !== "empty_tile" && inspectorType !== "clock_alarm";
  if (el.fEntityWrap) {
    el.fEntityWrap.classList.toggle("hidden", !primaryEnabled);
  }
  if (el.fEntity) {
    el.fEntity.disabled = !primaryEnabled;
    if (!primaryEnabled) {
      el.fEntity.value = "";
    }
  }
}

function renderPages() {
  el.pagesList.innerHTML = "";
  for (const page of editor.layout.pages) {
    const li = document.createElement("li");
    li.className = `list-item ${page.id === editor.selectedPageId ? "active selected" : ""}`;

    const label = document.createElement("span");
    const badge = isEnergyPage(page) ? " ⚡" : (isMusicPage(page) ? " 🎵" : "");
    label.textContent = `${page.title || page.id}${badge}`;
    label.title = `[${page.id}] ${isEnergyPage(page) ? "energy" : (isMusicPage(page) ? "music" : "page")}`;
    label.className = "list-item-label";
    li.appendChild(label);
    li.onclick = () => {
      editor.selectedPageId = page.id;
      editor.selectedWidgetId = null;
      renderAll();
    };

    const actions = document.createElement("span");
    actions.className = "row-actions";

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "row-icon-btn";
    renameBtn.title = t("layout.pages.rename") || "Rename";
    renameBtn.textContent = "✎";
    renameBtn.onclick = (ev) => {
      ev.stopPropagation();
      startInlinePageRename(li, label, page);
    };
    actions.appendChild(renameBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "row-icon-btn row-delete-btn";
    delBtn.title = t("layout.pages.delete") || "Delete";
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", t("layout.pages.delete") || "Delete");
    delBtn.onclick = (ev) => {
      ev.stopPropagation();
      editor.selectedPageId = page.id;
      deletePage();
    };
    actions.appendChild(delBtn);

    li.appendChild(actions);
    el.pagesList.appendChild(li);
  }
  renderPagesMini();
}

function startInlinePageRename(li, labelSpan, page) {
  if (!li || !page) return;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "row-rename-input";
  input.value = page.title || page.id;
  input.maxLength = 63;

  const commit = (save) => {
    if (save) {
      const next = input.value.trim();
      page.title = next || page.id;
      if (isEnergyPage(page)) {
        applyEnergyPageConfig({ render: false });
      } else if (isMusicPage(page)) {
        normalizeMusicConfig(page);
      }
    }
    renderAll();
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      commit(false);
    }
  };
  input.onblur = () => commit(true);

  li.replaceChild(input, labelSpan);
  input.focus();
  input.select();
}

function renderPagesMini() {
  if (!el.pagesMiniList) return;
  el.pagesMiniList.innerHTML = "";
  for (const page of editor.layout.pages) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-page-btn ${page.id === editor.selectedPageId ? "active" : ""}`;
    button.textContent = `${isEnergyPage(page) ? "E " : (isMusicPage(page) ? "M " : "")}${page.title || page.id}`;
    button.title = `${page.title || page.id} [${page.id}]`;
    button.onclick = () => {
      editor.selectedPageId = page.id;
      editor.selectedWidgetId = null;
      renderAll();
    };
    el.pagesMiniList.appendChild(button);
  }
}

function renderPageEditor() {
  const page = selectedPage();
  if (!page) {
    el.pageTitleInput.value = "";
    el.pageTitleInput.disabled = true;
    el.applyPageBtn.disabled = true;
    if (el.energyPageOptions) {
      el.energyPageOptions.classList.add("hidden");
    }
    if (el.musicPageOptions) {
      el.musicPageOptions.classList.add("hidden");
    }
    clearPageLookInspector();
    return;
  }
  el.pageTitleInput.disabled = false;
  el.applyPageBtn.disabled = false;
  el.pageTitleInput.value = page.title || page.id;

  const energyPage = isEnergyPage(page);
  const musicPage = isMusicPage(page);
  if (el.energyPageOptions) {
    el.energyPageOptions.classList.toggle("hidden", !energyPage);
  }
  if (el.musicPageOptions) {
    el.musicPageOptions.classList.toggle("hidden", !musicPage);
  }
  renderPageLookInspector(page);
  if (energyPage) {
    normalizeEnergyConfig(page);
    if (el.energySource) {
      el.energySource.value = page.energy.source || ENERGY_SOURCE_HA;
    }
    updateEnergySourceUi(page.energy.source);
    const inputs = getEnergyInputs();
    for (const key of ENERGY_ENTITY_KEYS) {
      if (inputs[key]) {
        inputs[key].value = page.energy[key] || "";
      }
    }
  }
  if (musicPage) {
    normalizeMusicConfig(page);
    if (el.musicPlayerEntity) {
      el.musicPlayerEntity.value = page.music.player_entity_id || "";
    }
    if (el.musicPlayers) {
      el.musicPlayers.value = (page.music.players || []).join(", ");
    }
  }
}

function updateEnergySourceUi(source) {
  const checkedSource = ENERGY_SOURCES.has(source) ? source : ENERGY_SOURCE_HA;
  const isManual = checkedSource === ENERGY_SOURCE_MANUAL;
  if (el.energyManualOptions) {
    el.energyManualOptions.classList.toggle("hidden", !isManual);
  }
  if (el.energySourceHint) {
    el.energySourceHint.textContent = t(isManual ? "layout.energy.source_hint_manual" : "layout.energy.source_hint_ha");
  }
}

function renderWidgets() {
  const page = selectedPage();
  el.widgetsList.innerHTML = "";
  if (!page) return;

  const energyPage = isEnergyPage(page);
  const musicPage = isMusicPage(page);
  const dedicatedPage = energyPage || musicPage;
  const addButtons = [
    el.addSensorBtn,
    el.addButtonBtn,
    el.addSliderBtn,
    el.addGraphBtn,
    el.addEmptyTileBtn,
    el.addLightTileBtn,
    el.addHeatingTileBtn,
    el.addWeatherTileBtn,
    el.addWeather3DayBtn,
    el.addTodoListBtn,
    el.addMediaPlayerBtn,
    el.addClockBtn,
  ];
  for (const button of addButtons) {
    if (button) button.disabled = dedicatedPage;
  }
  if (el.openSetupWizardBtn) {
    el.openSetupWizardBtn.disabled = dedicatedPage;
  }
  if (el.deleteWidgetBtn) {
    el.deleteWidgetBtn.disabled = dedicatedPage || !editor.selectedWidgetId;
  }

  if (dedicatedPage) {
    const li = document.createElement("li");
    li.className = "list-item muted";
    li.textContent = t(musicPage ? "layout.music.no_widgets" : "layout.energy.no_widgets");
    el.widgetsList.appendChild(li);
    return;
  }

  for (const widget of page.widgets) {
    const li = document.createElement("li");
    li.className = `list-item ${widget.id === editor.selectedWidgetId ? "active selected" : ""}`;

    const label = document.createElement("span");
    label.className = "list-item-label";
    label.textContent = `${widgetDisplayLabel(widget)}`;
    label.title = `[${widget.id}] ${widget.type}`;
    li.appendChild(label);
    li.onclick = () => {
      editor.selectedWidgetId = widget.id;
      renderAll();
    };

    const actions = document.createElement("span");
    actions.className = "row-actions";
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "row-icon-btn row-delete-btn";
    delBtn.title = t("layout.widgets.delete") || "Delete";
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", t("layout.widgets.delete") || "Delete");
    delBtn.onclick = (ev) => {
      ev.stopPropagation();
      editor.selectedWidgetId = widget.id;
      if (typeof el.deleteWidgetBtn?.click === "function") {
        el.deleteWidgetBtn.click();
      }
    };
    actions.appendChild(delBtn);
    li.appendChild(actions);

    el.widgetsList.appendChild(li);
  }
}

function widgetDisplayLabel(widget) {
  const title = (widget.title || "").trim();
  if (title) return `${title} · ${widget.type}`;
  return `${widget.type} [${widget.id}]`;
}

function geometryStyle(node, rect) {
  node.style.left = `${rect.x}px`;
  node.style.top = `${rect.y}px`;
  node.style.width = `${rect.w}px`;
  node.style.height = `${rect.h}px`;
}

function selectWidgetLive(widgetId, selectedBox) {
  editor.selectedWidgetId = widgetId;
  document.querySelectorAll(".widget-box.selected").forEach((node) => node.classList.remove("selected"));
  if (selectedBox) {
    selectedBox.classList.add("selected");
  }
  renderWidgets();
  renderInspector();
}

function attachDragAndResize(box, widget) {
  const startMove = (mode, downEvent, captureTarget) => {
    downEvent.preventDefault();
    downEvent.stopPropagation();
    const startX = downEvent.clientX;
    const startY = downEvent.clientY;
    const startRect = { ...widget.rect };
    const pointerId = downEvent.pointerId;
    let moved = false;
    let finished = false;

    // Capture all subsequent pointer events on this element so they don't get
    // hijacked by native drag, hover over iframes/images, or focus changes.
    try { captureTarget.setPointerCapture(pointerId); } catch (_) { /* ignore */ }

    // Suppress full canvas re-renders triggered by HA state pushes / other
    // async events while the user is interacting with the tile.
    editor.canvasInteractionActive = true;
    editor.canvasRenderPending = false;

    box.classList.add(mode === "drag" ? "dragging" : "resizing");

    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const limits = widgetSizeLimits(widget.type);
      const maxW = Math.min(limits.maxW, CANVAS_WIDTH);
      const maxH = Math.min(limits.maxH, CANVAS_HEIGHT);
      const minW = Math.min(limits.minW, maxW);
      const minH = Math.min(limits.minH, maxH);
      let nextX = widget.rect.x;
      let nextY = widget.rect.y;
      let nextW = widget.rect.w;
      let nextH = widget.rect.h;

      if (mode === "drag") {
        nextX = clamp(snap(startRect.x + dx), 0, CANVAS_WIDTH - startRect.w);
        nextY = clamp(snap(startRect.y + dy), 0, CANVAS_HEIGHT - startRect.h);
      } else {
        nextW = clamp(snap(startRect.w + dx), minW, Math.min(maxW, CANVAS_WIDTH - startRect.x));
        nextH = clamp(snap(startRect.h + dy), minH, Math.min(maxH, CANVAS_HEIGHT - startRect.y));
      }

      if (nextX !== widget.rect.x || nextY !== widget.rect.y || nextW !== widget.rect.w || nextH !== widget.rect.h) {
        moved = true;
        widget.rect.x = nextX;
        widget.rect.y = nextY;
        widget.rect.w = nextW;
        widget.rect.h = nextH;
        geometryStyle(box, widget.rect);
        renderInspector();
      }
    };

    const cleanup = () => {
      if (finished) return;
      finished = true;
      captureTarget.removeEventListener("pointermove", onMove);
      captureTarget.removeEventListener("pointerup", onUp);
      captureTarget.removeEventListener("pointercancel", onUp);
      captureTarget.removeEventListener("lostpointercapture", onUp);
      try { captureTarget.releasePointerCapture(pointerId); } catch (_) { /* ignore */ }
      box.classList.remove("dragging");
      box.classList.remove("resizing");
      editor.canvasInteractionActive = false;
      const hadPendingRender = editor.canvasRenderPending;
      editor.canvasRenderPending = false;
      if (moved) {
        renderWidgets();
        renderInspector();
      }
      if (hadPendingRender) {
        // Flush any canvas updates that async events requested while we were
        // dragging (e.g. HA state pushes). The geometry is already live via
        // geometryStyle(), so this only matters for content changes.
        renderCanvas();
      }
    };

    const onUp = (upEvent) => {
      if (upEvent && upEvent.pointerId !== undefined && upEvent.pointerId !== pointerId) return;
      cleanup();
    };

    captureTarget.addEventListener("pointermove", onMove);
    captureTarget.addEventListener("pointerup", onUp);
    captureTarget.addEventListener("pointercancel", onUp);
    captureTarget.addEventListener("lostpointercapture", onUp);
  };

  box.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.classList.contains("resize-handle")) return;
    selectWidgetLive(widget.id, box);
    startMove("drag", event, box);
  });

  const resizeHandle = box.querySelector(".resize-handle");
  resizeHandle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    selectWidgetLive(widget.id, box);
    startMove("resize", event, resizeHandle);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function energyPreviewSensorCount(count) {
  return t(count === 1 ? "layout.energy.sensor_count_one" : "layout.energy.sensor_count_many", { count });
}

function energyPreviewEntityLabel(entityId) {
  return escapeHtml(entityId || t("layout.energy.no_sensor"));
}

function energyPreviewNodeMarkup(id, label, value, style = "") {
  const styleAttr = style ? ` style="${escapeHtml(style)}"` : "";
  return `<div class="energy-preview-node ${id}"${styleAttr}><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function energyPreviewLabelMarkup(id, title, detail) {
  return `<div class="energy-preview-label ${id}"><strong>${escapeHtml(title)}</strong><small>${energyPreviewEntityLabel(detail)}</small></div>`;
}

function energyPreviewNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function energyPreviewPositive(value) {
  const n = energyPreviewNumber(value);
  return n === null ? 0 : Math.max(n, 0);
}

function energyPreviewFormatValue(value, unit = "") {
  const n = energyPreviewNumber(value);
  const suffix = String(unit || "").trim();
  if (n === null) return suffix ? `-- ${suffix}` : "--";
  const abs = Math.abs(n);
  const decimals = abs === 0 || abs >= 100 ? 0 : 1;
  const text = n.toFixed(decimals);
  return suffix ? `${text} ${suffix}` : text;
}

function energyPreviewFormatKwh(value) {
  return energyPreviewFormatValue(value, "kWh");
}

function energyPreviewComputeFlows(snapshot) {
  let fromGrid = energyPreviewPositive(snapshot?.from_grid_kwh);
  let toGrid = energyPreviewPositive(snapshot?.to_grid_kwh);
  let solar = energyPreviewPositive(snapshot?.solar_kwh);
  let toBattery = energyPreviewPositive(snapshot?.to_battery_kwh);
  let fromBattery = energyPreviewPositive(snapshot?.from_battery_kwh);
  const out = {
    usedSolar: 0,
    usedGrid: 0,
    usedBattery: 0,
    usedTotal: fromGrid + solar + fromBattery - toGrid - toBattery,
    gridToBattery: 0,
    batteryToGrid: 0,
    solarToBattery: 0,
    solarToGrid: 0,
  };
  let remaining = Math.max(out.usedTotal, 0);

  const gridToBattery = Math.max(0, Math.min(toBattery, fromGrid - remaining));
  out.gridToBattery += gridToBattery;
  toBattery -= gridToBattery;
  fromGrid -= gridToBattery;

  out.solarToBattery = Math.min(solar, toBattery);
  toBattery -= out.solarToBattery;
  solar -= out.solarToBattery;

  out.solarToGrid = Math.min(solar, toGrid);
  toGrid -= out.solarToGrid;
  solar -= out.solarToGrid;

  out.batteryToGrid = Math.min(fromBattery, toGrid);
  fromBattery -= out.batteryToGrid;
  toGrid -= out.batteryToGrid;

  const secondGridToBattery = Math.min(fromGrid, toBattery);
  out.gridToBattery += secondGridToBattery;
  fromGrid -= secondGridToBattery;
  toBattery -= secondGridToBattery;

  out.usedSolar = Math.min(remaining, solar);
  remaining -= out.usedSolar;
  out.usedBattery = Math.min(fromBattery, remaining);
  remaining -= out.usedBattery;
  out.usedGrid = Math.min(remaining, fromGrid);
  return out;
}

function energyPreviewHomeRingStyle(flows) {
  const parts = [
    { color: ENERGY_PREVIEW_COLORS.solar, value: energyPreviewPositive(flows?.usedSolar) },
    { color: ENERGY_PREVIEW_COLORS.battery, value: energyPreviewPositive(flows?.usedBattery) },
    { color: ENERGY_PREVIEW_COLORS.grid, value: energyPreviewPositive(flows?.usedGrid) },
  ].filter((part) => part.value > 0.001);
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  if (total <= 0.001 || parts.length === 0) {
    return `--energy-home-ring: ${ENERGY_PREVIEW_COLORS.idle} 0deg 360deg;`;
  }

  let start = 0;
  const segments = parts.map((part, index) => {
    if (index === parts.length - 1) {
      return `${part.color} ${start}deg 360deg`;
    }
    const remainingSegments = parts.length - index - 1;
    const maxEnd = 360 - remainingSegments;
    let end = Math.round(start + (part.value / total) * 360);
    end = Math.max(start + 1, Math.min(maxEnd, end));
    const segment = `${part.color} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });
  return `--energy-home-ring: ${segments.join(", ")};`;
}

function energyPreviewFlowMarkup(id, visible, path, dot) {
  if (!visible) return "";
  const dotMarkup = dot ? `<circle class="dot ${id}" cx="${dot[0]}" cy="${dot[1]}" r="5" />` : "";
  return `<path class="flow ${id}" d="${path}" />${dotMarkup}`;
}

function renderEnergyCanvasPreview(page) {
  const compact = isCompactCanvas();
  const energy = page.energy || {};
  const source = energy.source === ENERGY_SOURCE_MANUAL ? ENERGY_SOURCE_MANUAL : ENERGY_SOURCE_HA;
  const isManual = source === ENERGY_SOURCE_MANUAL;
  const configured = ENERGY_ENTITY_KEYS.filter((key) => energy[key]).length;
  const autoLabel = t("layout.energy.preview_auto");
  const headerBadge = isManual ? energyPreviewSensorCount(configured) : t("layout.energy.preview_source_ha");
  const snapshot = !isManual && editor.energySnapshot?.available === true ? editor.energySnapshot : null;
  const snapshotFlows = snapshot ? energyPreviewComputeFlows(snapshot) : null;
  const solarEntity = isManual ? energy.solar_power_entity_id : autoLabel;
  const gridEntity = isManual
    ? (energy.grid_power_entity_id || energy.grid_import_power_entity_id || energy.grid_export_power_entity_id)
    : autoLabel;
  const homeEntity = isManual ? energy.home_power_entity_id : autoLabel;
  const batteryEntity = isManual
    ? (energy.battery_power_entity_id || energy.battery_charge_power_entity_id ||
      energy.battery_discharge_power_entity_id || energy.battery_soc_entity_id)
    : autoLabel;
  const nodes = isManual ? {
    lowCarbon: false,
    solar: !!solarEntity,
    gas: false,
    grid: !!gridEntity,
    home: !!homeEntity || configured > 0,
    battery: !!batteryEntity,
    water: false,
  } : {
    lowCarbon: false,
    solar: snapshot?.has_solar === true,
    gas: snapshot?.has_gas === true,
    grid: snapshot?.has_grid === true,
    home: true,
    battery: snapshot?.has_battery === true,
    water: snapshot?.has_water === true,
  };
  if (isManual && configured === 0) {
    nodes.home = true;
  }
  const homeValue = snapshot ? energyPreviewFormatKwh(Math.max(snapshotFlows?.usedTotal || 0, 0)) : (isManual ? "-- W" : "-- kWh");
  const solarValue = snapshot ? energyPreviewFormatKwh(snapshot.solar_kwh) : (isManual ? "-- W" : "-- kWh");
  const gridImport = energyPreviewPositive(snapshot?.from_grid_kwh);
  const gridExport = energyPreviewPositive(snapshot?.to_grid_kwh);
  const gridValue = snapshot
    ? `${gridExport > gridImport && gridExport > 0.01 ? "out" : "in"} ${energyPreviewFormatKwh(Math.max(gridImport, gridExport))}`
    : (isManual ? "-- W" : "-- kWh");
  const batteryCharge = energyPreviewPositive(snapshot?.to_battery_kwh);
  const batteryDischarge = energyPreviewPositive(snapshot?.from_battery_kwh);
  const batteryValue = snapshot
    ? `${batteryCharge > batteryDischarge && batteryCharge > 0.01 ? "chg" : "out"} ${energyPreviewFormatKwh(Math.max(batteryCharge, batteryDischarge))}`
    : (isManual ? "--%" : "-- kWh");
  const gasValue = snapshot ? energyPreviewFormatValue(snapshot.gas_value, snapshot.gas_unit) : "--";
  const waterValue = snapshot ? energyPreviewFormatValue(snapshot.water_value, snapshot.water_unit) : "--";
  const homeRingStyle = energyPreviewHomeRingStyle(snapshotFlows);
  const flows = (compact ? [
    energyPreviewFlowMarkup("low-carbon", nodes.lowCarbon && nodes.grid, "M76 126 V162", [76, 150]),
    energyPreviewFlowMarkup("solar-return", nodes.solar && nodes.grid, "M225 125 V169 A24 24 0 0 1 201 193 H119", [174, 193]),
    energyPreviewFlowMarkup("solar", nodes.solar && nodes.home, "M255 125 V169 A24 24 0 0 0 279 193 H356", [318, 193]),
    energyPreviewFlowMarkup("battery-in", nodes.solar && nodes.battery, "M240 125 V247", [240, 186]),
    energyPreviewFlowMarkup("grid", nodes.grid && nodes.home, "M119 205 H356", [238, 205]),
    energyPreviewFlowMarkup("battery-out", nodes.battery && nodes.home, "M255 247 V241 A24 24 0 0 0 279 217 H356", [310, 217]),
    energyPreviewFlowMarkup("return", nodes.grid && nodes.battery, "M119 217 H201 A24 24 0 0 1 225 241 V247", [176, 217]),
    energyPreviewFlowMarkup("gas", nodes.gas && nodes.home, "M404 125 V157", [404, 145]),
    energyPreviewFlowMarkup("water", nodes.water && nodes.home, "M404 247 V253", [404, 250]),
  ] : [
    energyPreviewFlowMarkup("low-carbon", nodes.lowCarbon && nodes.grid, "M96 190 V282", [96, 254]),
    energyPreviewFlowMarkup("solar-return", nodes.solar && nodes.grid, "M312 190 V286 A40 40 0 0 1 272 326 H150", [250, 326]),
    energyPreviewFlowMarkup("solar", nodes.solar && nodes.home, "M312 190 V286 A40 40 0 0 0 352 326 H522", [402, 326]),
    energyPreviewFlowMarkup("battery-in", nodes.solar && nodes.battery, "M312 190 V452", [312, 312]),
    energyPreviewFlowMarkup("grid", nodes.grid && nodes.home, "M150 346 H522", [244, 346]),
    energyPreviewFlowMarkup("battery-out", nodes.battery && nodes.home, "M336 452 V386 A40 40 0 0 1 376 346 H522", [394, 346]),
    energyPreviewFlowMarkup("return", nodes.grid && nodes.battery, "M150 368 H272 A40 40 0 0 1 312 408 V452", [216, 368]),
    energyPreviewFlowMarkup("gas", nodes.gas && nodes.home, "M528 190 V282", [528, 254]),
    energyPreviewFlowMarkup("water", nodes.water && nodes.home, "M528 452 V402", [528, 426]),
  ]).join("");
  const nodeMarkup = [
    nodes.lowCarbon ? energyPreviewNodeMarkup("low-carbon", "LC", "-- kWh") : "",
    nodes.solar ? energyPreviewNodeMarkup("solar", "PV", solarValue) : "",
    nodes.gas ? energyPreviewNodeMarkup("gas", "GAS", gasValue) : "",
    nodes.grid ? energyPreviewNodeMarkup("grid", "GRID", gridValue) : "",
    nodes.home ? energyPreviewNodeMarkup("home", "HOME", homeValue, homeRingStyle) : "",
    nodes.battery ? energyPreviewNodeMarkup("battery", "BAT", batteryValue) : "",
    nodes.water ? energyPreviewNodeMarkup("water", "H2O", waterValue) : "",
  ].join("");
  const labelMarkup = [
    nodes.lowCarbon ? energyPreviewLabelMarkup("low-carbon", t("layout.energy.low_carbon"), autoLabel) : "",
    nodes.solar ? energyPreviewLabelMarkup("solar", t("layout.energy.solar"), solarEntity) : "",
    nodes.gas ? energyPreviewLabelMarkup("gas", t("layout.energy.gas"), autoLabel) : "",
    nodes.grid ? energyPreviewLabelMarkup("grid", t("layout.energy.grid"), gridEntity) : "",
    nodes.home ? energyPreviewLabelMarkup("home", t("layout.energy.home"), homeEntity) : "",
    nodes.battery ? energyPreviewLabelMarkup("battery", t("layout.energy.battery"), batteryEntity) : "",
    nodes.water ? energyPreviewLabelMarkup("water", t("layout.energy.water"), autoLabel) : "",
  ].join("");
  const node = document.createElement("div");
  node.className = compact ? "energy-page-preview compact" : "energy-page-preview";
  const viewBox = compact ? "0 0 480 360" : "0 0 720 600";
  node.innerHTML = `
    <div class="energy-preview-card">
      <div class="energy-preview-heading">
        <strong>${escapeHtml(t("layout.energy.preview_title"))}</strong>
        <span>${escapeHtml(headerBadge)}</span>
      </div>
      <svg class="energy-preview-flow" viewBox="${viewBox}" aria-hidden="true">
        ${flows}
      </svg>
      ${nodeMarkup}
      ${labelMarkup}
    </div>
  `;
  el.canvas.appendChild(node);
}

function renderMusicCanvasPreview(page) {
  normalizeMusicConfig(page);
  const music = page.music || defaultMusicConfig();
  const player = music.player_entity_id || "";
  const playersText = music.players && music.players.length
    ? music.players.join(", ")
    : t("layout.music.preview_auto", {}, "auto-discover");
  const compact = isCompactCanvas();
  const node = document.createElement("div");
  node.className = compact ? "music-page-preview compact" : "music-page-preview";
  node.innerHTML = `
    <div class="music-preview-card">
      <div class="music-preview-heading">
        <strong>${escapeHtml(t("layout.music.preview_title"))}</strong>
        <span>${escapeHtml(t("layout.music.preview_subtitle"))}</span>
      </div>
      <div class="music-preview-player">${escapeHtml(player || playersText)}</div>
      <div class="music-preview-art">
        <div class="music-preview-cover">♪</div>
        <div class="music-preview-lines">
          <div class="music-preview-title">${escapeHtml(t("layout.music.preview_title"))}</div>
          <div class="music-preview-artist">Music Assistant</div>
          <div class="music-preview-controls"><span>⏮</span><span class="play">▶</span><span>⏭</span></div>
        </div>
      </div>
      <div class="music-preview-progress"><div class="music-preview-fill"></div></div>
      <div class="music-preview-times"><span>0:00</span><span>0:00</span></div>
      <div class="music-preview-volume"><span>🔊</span><div class="music-preview-track"><div class="music-preview-trackfill"></div></div></div>
    </div>
  `;
  el.canvas.appendChild(node);
}

function renderCanvas() {
  if (editor.activePane === "remote") return;
  if (editor.activePane === "settings") {
    setActiveSettingsSection(editor.activeSettingsSection);
    return;
  }
  // While the user is actively dragging or resizing a tile we must not rebuild
  // the canvas DOM — doing so would destroy the element that owns the pointer
  // capture and cause the drag to "let go" mid-motion. Remember that a render
  // was requested and replay it once the interaction ends.
  if (editor.canvasInteractionActive) {
    editor.canvasRenderPending = true;
    return;
  }
  const page = selectedPage();
  el.canvas.innerHTML = "";
  if (!page) {
    el.canvasTitle.textContent = t("layout.canvas.title");
    applyPageLookPreview(null);
    return;
  }

  el.canvasTitle.textContent = `${t("layout.canvas.title")}: ${page.title || page.id}`;
  applyPageLookPreview(page);

  if (isEnergyPage(page)) {
    renderEnergyCanvasPreview(page);
    return;
  }

  if (isMusicPage(page)) {
    renderMusicCanvasPreview(page);
    return;
  }

  for (const widget of page.widgets) {
    const box = document.createElement("div");
    const isEmptyTile = widget.type === "empty_tile";
    const isClockAlarmTile = widget.type === "clock_alarm";
    const isTimerTile = widget.type === "timer_tile";
    const isMediaPlayerButton = widget.type === "button" && String(widget.entity_id || "").startsWith("media_player.");
    const previewTitle = (isMediaPlayerButton && !String(widget.title || "").trim()) ? "" : (widget.title || widget.id);
    box.className = `widget-box ${isEmptyTile ? "empty-tile" : ""} ${widget.id === editor.selectedWidgetId ? "selected" : ""}`;
    box.dataset.widgetId = widget.id;
    box.style.zIndex = isEmptyTile ? "1" : "10";
    const previewState = isEmptyTile
      ? "design"
      : isClockAlarmTile
        ? clockPreviewState()
        : (isTimerTile && !String(widget.entity_id || "").trim())
          ? "timer"
          : (editor.states.get(widget.entity_id) || "unavailable");
    let extraHint = "";
    if (widget.type === "weather_3day") {
      /* Mirrors the firmware layout in w_weather_tile.c:
       *   compact/panels3: ROWS_TOP=108, BOTTOM_PAD=12, ROW_HEIGHT=36, ROW_GAP=2
       *   default:         ROWS_TOP=150, BOTTOM_PAD=12, ROW_HEIGHT=44, ROW_GAP=4
       *   visible rows = clamp(floor((h-162+4)/48), 2, 6)
       *   forecast days = visible rows - 1 (the "Now" row).
       * Keep these constants in sync when the tile layout changes. */
      const h = Number(widget.rect && widget.rect.h) || 0;
      const compactForecast = isCompactCanvas();
      const rowsTop = compactForecast ? 108 : 150;
      const rowHeight = compactForecast ? 36 : 44;
      const rowGap = compactForecast ? 2 : 4;
      const avail = h - rowsTop - 12;
      let rows = 2;
      if (avail > rowHeight) {
        rows = Math.floor((avail + rowGap) / (rowHeight + rowGap));
      }
      if (rows < 2) rows = 2;
      if (rows > 6) rows = 6;
      const days = rows - 1;
      extraHint = `<div class="w-hint">forecast days ${days}/5</div>`;
    }
    box.innerHTML = `
      <div class="w-type">${widget.type}</div>
      <div class="w-title">${previewTitle}</div>
      <div class="w-state">${previewState}</div>
      ${extraHint}
      <div class="resize-handle"></div>
    `;
    geometryStyle(box, widget.rect);
    applyTileLookPreview(box, widget);
    attachDragAndResize(box, widget);
    el.canvas.appendChild(box);
  }
}

function renderInspector() {
  const widget = selectedWidget();
  if (!widget) {
    el.fTitle.value = "";
    el.fType.value = "sensor";
    el.fEntity.value = "";
    el.fSecondaryEntity.value = "";
    el.fX.value = "";
    el.fY.value = "";
    el.fW.value = "";
    el.fH.value = "";
    if (el.buttonOptions) {
      el.buttonOptions.classList.add("hidden");
    }
    if (el.sliderOptions) {
      el.sliderOptions.classList.add("hidden");
    }
    if (el.graphOptions) {
      el.graphOptions.classList.add("hidden");
    }
    if (el.fSliderDirection) {
      el.fSliderDirection.value = DEFAULT_SLIDER_DIRECTION;
    }
    if (el.fSliderEntityDomain) {
      el.fSliderEntityDomain.value = DEFAULT_SLIDER_ENTITY_DOMAIN;
    }
    if (el.fButtonAccentColor) {
      el.fButtonAccentColor.value = DEFAULT_BUTTON_ACCENT_COLOR;
    }
    if (el.fButtonMode) {
      el.fButtonMode.value = DEFAULT_BUTTON_MODE;
    }
    if (el.fSliderAccentColor) {
      el.fSliderAccentColor.value = DEFAULT_SLIDER_ACCENT_COLOR;
    }
    if (el.fGraphLineColor) {
      el.fGraphLineColor.value = DEFAULT_GRAPH_LINE_COLOR;
    }
    if (el.fGraphTimeWindowMin) {
      el.fGraphTimeWindowMin.value = String(DEFAULT_GRAPH_TIME_WINDOW_MIN);
    }
    if (el.fGraphPointCount) {
      el.fGraphPointCount.value = "";
    }
    if (el.fGraphDisplayMode) {
      el.fGraphDisplayMode.value = DEFAULT_GRAPH_DISPLAY_MODE;
    }
    if (el.fGraphBarBucketMin) {
      el.fGraphBarBucketMin.value = String(DEFAULT_GRAPH_BAR_BUCKET_MIN);
    }
    if (el.fGraphBarBucketMinWrap) {
      el.fGraphBarBucketMinWrap.classList.add("hidden");
    }
    if (el.heatingOptions) {
      el.heatingOptions.classList.add("hidden");
    }
    if (el.fHeatingStyleVariant) {
      el.fHeatingStyleVariant.value = "default";
    }
    if (el.fHeatingArcOpening) {
      el.fHeatingArcOpening.value = "left";
    }
    if (el.fHeatingArcOpeningWrap) {
      el.fHeatingArcOpeningWrap.classList.add("hidden");
    }
    if (el.binaryOptions) {
      el.binaryOptions.classList.add("hidden");
    }
    if (el.fBinaryShowTitle) {
      el.fBinaryShowTitle.checked = true;
    }
    if (el.fBinaryColorOn) {
      el.fBinaryColorOn.value = "";
    }
    if (el.fBinaryColorOff) {
      el.fBinaryColorOff.value = "";
    }
    if (el.fBinaryTextOn) {
      el.fBinaryTextOn.value = "";
    }
    if (el.fBinaryTextOff) {
      el.fBinaryTextOff.value = "";
    }
    if (el.sensorOptions) {
      el.sensorOptions.classList.add("hidden");
    }
    if (el.fSensorValueColor) {
      el.fSensorValueColor.value = "";
    }
    if (el.clockOptions) {
      el.clockOptions.classList.add("hidden");
    }
    resetClockInspectorFields();
    clearTileLookInspector();
    renderEntityOptions();
    return;
  }
  el.fTitle.value = widget.title || "";
  el.fType.value = widget.type;
  el.fEntity.value = widget.entity_id || "";
  el.fSecondaryEntity.value = widget.secondary_entity_id || "";
  el.fX.value = widget.rect.x;
  el.fY.value = widget.rect.y;
  el.fW.value = widget.rect.w;
  el.fH.value = widget.rect.h;

  const isButton = widget.type === "button";
  const isSlider = widget.type === "slider";
  const isGraph = widget.type === "graph";
  const isHeating = widget.type === "heating_tile";
  const isBinary = widget.type === "binary_sensor";
  const isAlarm = widget.type === "alarm_tile";
  const isClockAlarm = widget.type === "clock_alarm";
  const isSensor = widget.type === "sensor";
  if (el.buttonOptions) {
    el.buttonOptions.classList.toggle("hidden", !isButton);
  }
  if (el.sliderOptions) {
    el.sliderOptions.classList.toggle("hidden", !isSlider);
  }
  if (el.graphOptions) {
    el.graphOptions.classList.toggle("hidden", !isGraph);
  }
  if (el.heatingOptions) {
    el.heatingOptions.classList.toggle("hidden", !isHeating);
  }
  if (el.binaryOptions) {
    el.binaryOptions.classList.toggle("hidden", !isBinary);
  }
  if (el.alarmOptions) {
    el.alarmOptions.classList.toggle("hidden", !isAlarm);
  }
  if (el.clockOptions) {
    el.clockOptions.classList.toggle("hidden", !isClockAlarm);
  }
  if (el.sensorOptions) {
    el.sensorOptions.classList.toggle("hidden", !isSensor);
  }
  if (isButton) {
    const accent = normalizeHexColor(widget.button_accent_color, DEFAULT_BUTTON_ACCENT_COLOR);
    const buttonMode = normalizeButtonMode(widget.button_mode);
    widget.button_accent_color = accent;
    widget.button_mode = buttonMode;
    if (el.fButtonAccentColor) {
      el.fButtonAccentColor.value = accent;
    }
    if (el.fButtonMode) {
      el.fButtonMode.value = buttonMode;
    }
    if (el.fButtonStyle) {
      el.fButtonStyle.value = normalizeButtonStyle(widget.style_variant);
    }
  } else {
    if (el.fButtonAccentColor) {
      el.fButtonAccentColor.value = DEFAULT_BUTTON_ACCENT_COLOR;
    }
    if (el.fButtonMode) {
      el.fButtonMode.value = DEFAULT_BUTTON_MODE;
    }
    if (el.fButtonStyle) {
      el.fButtonStyle.value = DEFAULT_BUTTON_STYLE;
    }
  }
  if (isSlider) {
    const sliderEntityDomain = normalizeSliderEntityDomain(widget.slider_entity_domain);
    const direction = normalizeSliderDirection(widget.slider_direction);
    const accent = normalizeHexColor(widget.slider_accent_color, DEFAULT_SLIDER_ACCENT_COLOR);
    widget.slider_entity_domain = sliderEntityDomain;
    widget.slider_direction = direction;
    widget.slider_accent_color = accent;
    if (el.fSliderEntityDomain) {
      el.fSliderEntityDomain.value = sliderEntityDomain;
    }
    if (el.fSliderDirection) {
      el.fSliderDirection.value = direction;
    }
    if (el.fSliderAccentColor) {
      el.fSliderAccentColor.value = accent;
    }
  } else {
    if (el.fSliderEntityDomain) {
      el.fSliderEntityDomain.value = DEFAULT_SLIDER_ENTITY_DOMAIN;
    }
    if (el.fSliderDirection) {
      el.fSliderDirection.value = DEFAULT_SLIDER_DIRECTION;
    }
    if (el.fSliderAccentColor) {
      el.fSliderAccentColor.value = DEFAULT_SLIDER_ACCENT_COLOR;
    }
  }
  if (isGraph) {
    const lineColor = normalizeHexColor(widget.graph_line_color, DEFAULT_GRAPH_LINE_COLOR);
    const timeWindowMin = normalizeGraphTimeWindowMin(widget.graph_time_window_min);
    const pointCount = normalizeGraphPointCount(widget.graph_point_count);
    const displayMode = normalizeGraphDisplayMode(widget.graph_display_mode);
    const barBucketMin = normalizeGraphBarBucketMin(widget.graph_bar_bucket_min);
    widget.graph_line_color = lineColor;
    widget.graph_time_window_min = timeWindowMin;
    widget.graph_display_mode = displayMode;
    widget.graph_bar_bucket_min = barBucketMin;
    if (pointCount > 0) {
      widget.graph_point_count = pointCount;
    } else {
      delete widget.graph_point_count;
    }
    if (el.fGraphLineColor) {
      el.fGraphLineColor.value = lineColor;
    }
    if (el.fGraphTimeWindowMin) {
      el.fGraphTimeWindowMin.value = String(widget.graph_time_window_min);
    }
    if (el.fGraphPointCount) {
      el.fGraphPointCount.value = pointCount > 0 ? String(pointCount) : "";
    }
    if (el.fGraphDisplayMode) {
      el.fGraphDisplayMode.value = displayMode;
    }
    if (el.fGraphBarBucketMin) {
      el.fGraphBarBucketMin.value = String(barBucketMin);
    }
    if (el.fGraphBarBucketMinWrap) {
      el.fGraphBarBucketMinWrap.classList.toggle("hidden", displayMode !== "bars");
    }
    if (el.fGraphPointCountWrap) {
      el.fGraphPointCountWrap.classList.toggle("hidden", displayMode !== "line");
    }
  } else {
    if (el.fGraphLineColor) {
      el.fGraphLineColor.value = DEFAULT_GRAPH_LINE_COLOR;
    }
    if (el.fGraphTimeWindowMin) {
      el.fGraphTimeWindowMin.value = String(DEFAULT_GRAPH_TIME_WINDOW_MIN);
    }
    if (el.fGraphPointCount) {
      el.fGraphPointCount.value = "";
    }
    if (el.fGraphDisplayMode) {
      el.fGraphDisplayMode.value = DEFAULT_GRAPH_DISPLAY_MODE;
    }
    if (el.fGraphBarBucketMin) {
      el.fGraphBarBucketMin.value = String(DEFAULT_GRAPH_BAR_BUCKET_MIN);
    }
    if (el.fGraphBarBucketMinWrap) {
      el.fGraphBarBucketMinWrap.classList.add("hidden");
    }
  }

  if (isHeating) {
    const styleVariant = widget.style_variant === "arc_semi" ? "arc_semi" : "default";
    const arcOpening = ["left", "right", "top", "bottom"].includes(widget.arc_opening) ? widget.arc_opening : "left";
    widget.style_variant = styleVariant;
    widget.arc_opening = arcOpening;
    if (el.fHeatingStyleVariant) {
      el.fHeatingStyleVariant.value = styleVariant;
    }
    if (el.fHeatingArcOpening) {
      el.fHeatingArcOpening.value = arcOpening;
    }
    if (el.fHeatingArcOpeningWrap) {
      el.fHeatingArcOpeningWrap.classList.toggle("hidden", styleVariant !== "arc_semi");
    }
  } else {
    if (el.fHeatingStyleVariant) {
      el.fHeatingStyleVariant.value = "default";
    }
    if (el.fHeatingArcOpening) {
      el.fHeatingArcOpening.value = "left";
    }
    if (el.fHeatingArcOpeningWrap) {
      el.fHeatingArcOpeningWrap.classList.add("hidden");
    }
  }

  if (isBinary) {
    const showTitle = normalizeBoolDefaultTrue(widget.binary_show_title);
    const colorOn = normalizeHexColor(widget.binary_color_on, "");
    const colorOff = normalizeHexColor(widget.binary_color_off, "");
    const textOn = normalizeBinaryText(widget.binary_text_on);
    const textOff = normalizeBinaryText(widget.binary_text_off);
    widget.binary_show_title = showTitle;
    widget.binary_color_on = colorOn;
    widget.binary_color_off = colorOff;
    widget.binary_text_on = textOn;
    widget.binary_text_off = textOff;
    if (el.fBinaryShowTitle) {
      el.fBinaryShowTitle.checked = showTitle;
    }
    if (el.fBinaryColorOn) {
      el.fBinaryColorOn.value = colorOn;
    }
    if (el.fBinaryColorOff) {
      el.fBinaryColorOff.value = colorOff;
    }
    if (el.fBinaryTextOn) {
      el.fBinaryTextOn.value = textOn;
    }
    if (el.fBinaryTextOff) {
      el.fBinaryTextOff.value = textOff;
    }
  } else {
    if (el.fBinaryShowTitle) {
      el.fBinaryShowTitle.checked = true;
    }
    if (el.fBinaryColorOn) {
      el.fBinaryColorOn.value = "";
    }
    if (el.fBinaryColorOff) {
      el.fBinaryColorOff.value = "";
    }
    if (el.fBinaryTextOn) {
      el.fBinaryTextOn.value = "";
    }
    if (el.fBinaryTextOff) {
      el.fBinaryTextOff.value = "";
    }
  }

  if (isAlarm) {
    const alarmCode = normalizeAlarmCode(widget.alarm_code);
    const alarmModes = normalizeAlarmModes(widget.alarm_modes).split(",");
    const askCode = widget.alarm_ask_code === true;
    const backend = normalizeAlarmBackend(widget.alarm_backend);
    const zoneLabel = normalizeAlarmZoneLabel(widget.alarm_zone_label);
    const showSensors = normalizeBoolDefaultTrue(widget.alarm_show_sensors);
    const showBypassed = normalizeBoolDefaultTrue(widget.alarm_show_bypassed);
    const forceArm = normalizeBoolDefaultTrue(widget.alarm_force_arm);
    const skipDelay = widget.alarm_skip_delay === true;
    widget.alarm_code = alarmCode;
    widget.alarm_modes = alarmModes.join(",");
    widget.alarm_ask_code = askCode;
    widget.alarm_backend = backend;
    widget.alarm_show_sensors = showSensors;
    widget.alarm_show_bypassed = showBypassed;
    widget.alarm_force_arm = forceArm;
    widget.alarm_skip_delay = skipDelay;
    if (zoneLabel) {
      widget.alarm_zone_label = zoneLabel;
    } else {
      delete widget.alarm_zone_label;
    }
    if (el.fAlarmCode) {
      el.fAlarmCode.value = alarmCode;
    }
    if (el.fAlarmAskCode) {
      el.fAlarmAskCode.checked = askCode;
    }
    if (el.fAlarmBackend) {
      el.fAlarmBackend.value = backend;
    }
    if (el.fAlarmZoneLabel) {
      el.fAlarmZoneLabel.value = zoneLabel;
    }
    if (el.fAlarmShowSensors) {
      el.fAlarmShowSensors.checked = showSensors;
    }
    if (el.fAlarmShowBypassed) {
      el.fAlarmShowBypassed.checked = showBypassed;
    }
    if (el.fAlarmForceArm) {
      el.fAlarmForceArm.checked = forceArm;
    }
    if (el.fAlarmSkipDelay) {
      el.fAlarmSkipDelay.checked = skipDelay;
    }
    for (const input of alarmModeInputs()) {
      input.checked = alarmModes.includes(input.dataset.alarmMode);
    }
  } else {
    if (el.fAlarmCode) {
      el.fAlarmCode.value = "";
    }
    if (el.fAlarmAskCode) {
      el.fAlarmAskCode.checked = false;
    }
    if (el.fAlarmBackend) {
      el.fAlarmBackend.value = "auto";
    }
    if (el.fAlarmZoneLabel) {
      el.fAlarmZoneLabel.value = "";
    }
    if (el.fAlarmShowSensors) {
      el.fAlarmShowSensors.checked = true;
    }
    if (el.fAlarmShowBypassed) {
      el.fAlarmShowBypassed.checked = true;
    }
    if (el.fAlarmForceArm) {
      el.fAlarmForceArm.checked = true;
    }
    if (el.fAlarmSkipDelay) {
      el.fAlarmSkipDelay.checked = false;
    }
    const defaultModes = DEFAULT_ALARM_MODES.split(",");
    for (const input of alarmModeInputs()) {
      input.checked = defaultModes.includes(input.dataset.alarmMode);
    }
  }

  if (isClockAlarm) {
    const showSeconds = widget.clock_show_seconds === true;
    const showDate = widget.clock_show_date !== false;
    widget.clock_show_seconds = showSeconds;
    widget.clock_show_date = showDate;
    if (el.fClockShowSeconds) {
      el.fClockShowSeconds.checked = showSeconds;
    }
    if (el.fClockShowDate) {
      el.fClockShowDate.checked = showDate;
    }
  } else {
    resetClockInspectorFields();
  }

  if (isSensor) {
    widget.sensor_value_color = valueColor;
    if (el.fSensorValueColor) {
      el.fSensorValueColor.value = valueColor;
    }
  } else {
    if (el.fSensorValueColor) {
      el.fSensorValueColor.value = "";
    }
  }

  renderTileLookInspector(widget);
  renderEntityOptions();
}

function renderAll() {
  normalizeLayoutWidgets(editor.layout);
  renderPages();
  renderPageEditor();
  renderWidgets();
  renderInspector();
  renderCanvas();
}

function addPage() {
  const pageId = uniqueId("page", editor.layout.pages);
  const pageNumber = editor.layout.pages.length + 1;
  editor.layout.pages.push({
    id: pageId,
    title: t("layout.pages.new_title", { number: pageNumber }),
    widgets: [],
  });
  editor.selectedPageId = pageId;
  editor.selectedWidgetId = null;
  renderAll();
}

function addEnergyPage() {
  const pageId = uniqueId("energy", editor.layout.pages);
  editor.layout.pages.push({
    id: pageId,
    type: ENERGY_PAGE_TYPE,
    title: t("layout.pages.energy_title"),
    energy: defaultEnergyConfig(),
    widgets: [],
  });
  editor.selectedPageId = pageId;
  editor.selectedWidgetId = null;
  renderAll();
  void loadEnergyPreview();
}

function addMusicPage() {
  const pageId = uniqueId("music", editor.layout.pages);
  editor.layout.pages.push({
    id: pageId,
    type: MUSIC_PAGE_TYPE,
    title: t("layout.pages.music_title"),
    music: defaultMusicConfig(),
    widgets: [],
  });
  editor.selectedPageId = pageId;
  editor.selectedWidgetId = null;
  renderAll();
}

function deletePage() {
  if (!editor.layout.pages.length || !editor.selectedPageId) return;
  if (editor.layout.pages.length === 1) {
    setStatus(t("layout.status.at_least_one_page"), true);
    return;
  }
  const page = editor.layout.pages.find((p) => p.id === editor.selectedPageId);
  if (!page) return;
  const name = page.title || page.id;
  if (!window.confirm(t("layout.pages.confirm_delete", { name }))) return;
  editor.layout.pages = editor.layout.pages.filter((p) => p.id !== editor.selectedPageId);
  editor.selectedPageId = editor.layout.pages[0].id;
  editor.selectedWidgetId = null;
  renderAll();
}

function applyPageName() {
  const page = selectedPage();
  if (!page) return;
  const nextTitle = el.pageTitleInput.value.trim();
  page.title = nextTitle || page.id;
  if (isEnergyPage(page)) {
    applyEnergyPageConfig({ render: false });
  } else if (isMusicPage(page)) {
    normalizeMusicConfig(page);
  }
  renderAll();
}

function applyEnergyPageConfig(options = {}) {
  const page = selectedPage();
  if (!isEnergyPage(page)) return false;
  normalizeEnergyConfig(page);
  const selectedSource = (el.energySource?.value || page.energy.source || ENERGY_SOURCE_HA).trim();
  page.energy.source = ENERGY_SOURCES.has(selectedSource) ? selectedSource : ENERGY_SOURCE_HA;
  const inputs = getEnergyInputs();
  for (const key of ENERGY_ENTITY_KEYS) {
    page.energy[key] = (inputs[key]?.value || "").trim();
  }
  updateEnergySourceUi(page.energy.source);
  if (options.render !== false) {
    renderAll();
  }
  if (page.energy.source === ENERGY_SOURCE_HA) {
    void loadEnergyPreview();
  }
  return true;
}

function addWidget(type, options = {}) {
  const page = selectedPage();
  if (!page) return;
  if (isEnergyPage(page)) {
    setStatus(t("layout.status.energy_page_only"), true);
    return null;
  }
  if (isMusicPage(page)) {
    setStatus(t("layout.status.music_page_only"), true);
    return null;
  }
  const sliderDomain = DEFAULT_SLIDER_ENTITY_DOMAIN;
  const id = createWidgetIdForPage(page, type);
  const entityId = typeof options.entityId === "string" ? options.entityId : pickDefaultEntityForWidgetType(type, sliderDomain);
  const secondaryEntityId = type === "heating_tile" ? pickDefaultEntityForWidgetType("sensor") : "";
  const compact = isCompactCanvas();
  const defaultW = compact
    ? type === "weather_3day" ? 420
      : type === "todo_list" ? 300
      : type === "media_player" ? 300
      : type === "roborock_tile" ? 460
      : type === "weather_tile" ? 220
      : type === "alarm_tile" ? 220
      : type === "clock_alarm" ? 220
      : type === "cover_tile" ? 180
      : type === "scene_tile" ? 140
      : type === "person_tile" ? 150
      : type === "timer_tile" ? 150
      : (type === "light_tile" || type === "empty_tile") ? 140
      : type === "heating_tile" ? 150
      : 180
    : type === "weather_3day" ? 360
      : type === "todo_list" ? 360
      : type === "media_player" ? 360
      : type === "roborock_tile" ? 360
      : type === "alarm_tile" ? 300
      : type === "clock_alarm" ? 300
      : type === "cover_tile" ? 220
      : type === "scene_tile" ? 160
      : type === "person_tile" ? 180
      : type === "timer_tile" ? 180
      : (type === "light_tile" || type === "heating_tile" || type === "weather_tile" || type === "empty_tile") ? 300
      : 220;
  const defaultH = compact
    ? type === "weather_3day" ? 240
      : type === "todo_list" ? 220
      : type === "media_player" ? 220
      : type === "roborock_tile" ? 300
      : type === "weather_tile" ? 180
      : type === "alarm_tile" ? 220
      : type === "clock_alarm" ? 220
      : type === "cover_tile" ? 150
      : type === "scene_tile" ? 130
      : type === "person_tile" ? 100
      : type === "timer_tile" ? 120
      : (type === "light_tile" || type === "empty_tile") ? 140
      : type === "heating_tile" ? 150
      : 110
    : type === "weather_3day" ? 260
      : type === "todo_list" ? 360
      : type === "media_player" ? 280
      : type === "roborock_tile" ? 300
      : type === "alarm_tile" ? 260
      : type === "clock_alarm" ? 260
      : type === "cover_tile" ? 180
      : type === "scene_tile" ? 150
      : type === "person_tile" ? 120
      : type === "timer_tile" ? 140
      : (type === "light_tile" || type === "heating_tile" || type === "weather_tile" || type === "empty_tile") ? 260
      : 120;
  const rect = clampRectToCanvas({ x: 20, y: 20, w: defaultW, h: defaultH }, type);

  const widget = {
    id,
    type,
    title: typeof options.title === "string" && options.title.trim() ? options.title.trim() : id,
    entity_id: entityId,
    secondary_entity_id: secondaryEntityId,
    rect,
  };
  if (type === "slider") {
    widget.slider_entity_domain = DEFAULT_SLIDER_ENTITY_DOMAIN;
    widget.slider_direction = DEFAULT_SLIDER_DIRECTION;
    widget.slider_accent_color = DEFAULT_SLIDER_ACCENT_COLOR;
  }
  if (type === "button") {
    widget.button_mode = DEFAULT_BUTTON_MODE;
    widget.button_accent_color = DEFAULT_BUTTON_ACCENT_COLOR;
  }
  if (type === "graph") {
    widget.graph_line_color = DEFAULT_GRAPH_LINE_COLOR;
    widget.graph_time_window_min = DEFAULT_GRAPH_TIME_WINDOW_MIN;
  }
  if (type === "binary_sensor") {
    widget.binary_show_title = true;
    widget.binary_text_on = "";
    widget.binary_text_off = "";
    widget.binary_color_on = "";
    widget.binary_color_off = "";
  }
  if (type === "alarm_tile") {
    widget.alarm_code = "";
    widget.alarm_modes = DEFAULT_ALARM_MODES;
    widget.alarm_ask_code = false;
    widget.alarm_backend = "auto";
    widget.alarm_show_sensors = true;
    widget.alarm_show_bypassed = true;
    widget.alarm_force_arm = true;
    widget.alarm_skip_delay = false;
  }

  if (type === "clock_alarm") {
    widget.clock_show_seconds = false;
    widget.clock_show_date = true;
  }

  page.widgets.push(widget);
  editor.selectedWidgetId = id;
  renderAll();
  onSetupWizardWidgetAdded(widget);
  return widget;
}

function deleteWidget() {
  const page = selectedPage();
  if (!page || !editor.selectedWidgetId) return;
  const widget = page.widgets.find((w) => w.id === editor.selectedWidgetId);
  if (!widget) return;
  const name = widgetDisplayLabel(widget);
  if (!window.confirm(t("layout.widgets.confirm_delete", { name }))) return;
  page.widgets = page.widgets.filter((w) => w.id !== editor.selectedWidgetId);
  editor.selectedWidgetId = null;
  renderAll();
}

function renderInspectorChange(refreshInspector) {
  if (refreshInspector) {
    renderAll();
    return;
  }
  renderWidgets();
  renderCanvas();
}

function applyInspector(options = {}) {
  const widget = selectedWidget();
  if (!widget) return false;

  const refreshInspector = options.refreshInspector !== false;
  const softEntityValidation = options.softEntityValidation === true;

  const widgetType = widget.type;
  const sliderDomain = widgetType === "slider"
    ? normalizeSliderEntityDomain(el.fSliderEntityDomain?.value)
    : DEFAULT_SLIDER_ENTITY_DOMAIN;
  const buttonMode = widgetType === "button"
    ? normalizeButtonMode(el.fButtonMode?.value)
    : DEFAULT_BUTTON_MODE;
  const secondaryConfig = secondaryEntityConfigForWidgetType(widgetType);
  const nextEntityId = el.fEntity.value.trim() || pickDefaultEntityForWidgetType(widgetType, sliderDomain, buttonMode);

  const primaryEntityValid = entityMatchesWidgetType({ id: nextEntityId }, widgetType, sliderDomain, buttonMode);
  if (!primaryEntityValid && !softEntityValidation) {
    const allowedDomains = allowedEntityDomainsForWidgetType(widgetType, sliderDomain, buttonMode);
    const allowedHint = allowedDomains.length ? allowedDomains.join(", ") : t("layout.status.expected_domain");
    setStatus(t("layout.status.entity_domain_required", { domains: allowedHint }), true);
    return false;
  }

  widget.title = el.fTitle.value.trim();
  if (primaryEntityValid) {
    widget.entity_id = nextEntityId;
  }
  if (secondaryConfig.enabled) {
    const typedSecondaryEntityId = el.fSecondaryEntity.value.trim();
    const secondaryEntityId = secondaryConfig.optional
      ? typedSecondaryEntityId
      : (typedSecondaryEntityId || pickDefaultEntityForWidgetType(secondaryConfig.domain));
    if (secondaryEntityId.length > 0 && !secondaryEntityId.startsWith(`${secondaryConfig.domain}.`)) {
      if (!softEntityValidation) {
        setStatus(t(secondaryConfig.invalidStatusKey), true);
        return false;
      }
    } else {
      widget.secondary_entity_id = secondaryEntityId;
    }
  } else {
    widget.secondary_entity_id = "";
  }
  if (widgetType === "button") {
    widget.button_mode = buttonMode;
    widget.button_accent_color = normalizeHexColor(el.fButtonAccentColor?.value, DEFAULT_BUTTON_ACCENT_COLOR);
  } else {
    delete widget.button_mode;
    delete widget.button_accent_color;
  }
  if (widgetType === "slider") {
    widget.slider_entity_domain = sliderDomain;
    widget.slider_direction = normalizeSliderDirection(el.fSliderDirection?.value);
    widget.slider_accent_color = normalizeHexColor(el.fSliderAccentColor?.value, DEFAULT_SLIDER_ACCENT_COLOR);
  } else {
    delete widget.slider_entity_domain;
    delete widget.slider_direction;
    delete widget.slider_accent_color;
  }
  if (widgetType === "graph") {
    widget.graph_line_color = normalizeHexColor(el.fGraphLineColor?.value, DEFAULT_GRAPH_LINE_COLOR);
    widget.graph_time_window_min = normalizeGraphTimeWindowMin(el.fGraphTimeWindowMin?.value);
    widget.graph_display_mode = normalizeGraphDisplayMode(el.fGraphDisplayMode?.value);
    widget.graph_bar_bucket_min = normalizeGraphBarBucketMin(el.fGraphBarBucketMin?.value);
    const graphPointCount = normalizeGraphPointCount(el.fGraphPointCount?.value);
    if (graphPointCount > 0) {
      widget.graph_point_count = graphPointCount;
    } else {
      delete widget.graph_point_count;
    }
  } else {
    delete widget.graph_line_color;
    delete widget.graph_time_window_min;
    delete widget.graph_point_count;
    delete widget.graph_display_mode;
    delete widget.graph_bar_bucket_min;
  }
  if (widgetType === "heating_tile") {
    const variant = el.fHeatingStyleVariant?.value === "arc_semi" ? "arc_semi" : "default";
    widget.style_variant = variant;
    if (variant === "arc_semi") {
      const opening = el.fHeatingArcOpening?.value;
      widget.arc_opening = ["left", "right", "top", "bottom"].includes(opening) ? opening : "left";
    } else {
      delete widget.arc_opening;
    }
  } else if (widgetType === "button") {
    const variant = normalizeButtonStyle(el.fButtonStyle?.value);
    if (!buttonModeRequiresMediaPlayer(buttonMode) && variant !== "") {
      widget.style_variant = variant;
    } else {
      delete widget.style_variant;
    }
    delete widget.arc_opening;
  } else {
    delete widget.style_variant;
    delete widget.arc_opening;
  }
  if (widgetType === "binary_sensor") {
    widget.binary_show_title = el.fBinaryShowTitle ? !!el.fBinaryShowTitle.checked : true;
    widget.binary_text_on = normalizeBinaryText(el.fBinaryTextOn?.value);
    widget.binary_text_off = normalizeBinaryText(el.fBinaryTextOff?.value);
    widget.binary_color_on = normalizeHexColor(el.fBinaryColorOn?.value, "");
    widget.binary_color_off = normalizeHexColor(el.fBinaryColorOff?.value, "");
  } else {
    delete widget.binary_show_title;
    delete widget.binary_text_on;
    delete widget.binary_text_off;
    delete widget.binary_color_on;
    delete widget.binary_color_off;
  }
  if (widgetType === "alarm_tile") {
    widget.alarm_code = normalizeAlarmCode(el.fAlarmCode?.value);
    widget.alarm_modes = normalizeAlarmModes(
      alarmModeInputs()
        .filter((input) => input.checked)
        .map((input) => input.dataset.alarmMode)
        .join(","),
    );
    widget.alarm_ask_code = el.fAlarmAskCode ? !!el.fAlarmAskCode.checked : false;
    widget.alarm_backend = normalizeAlarmBackend(el.fAlarmBackend?.value);
    const alarmZoneLabel = normalizeAlarmZoneLabel(el.fAlarmZoneLabel?.value);
    if (alarmZoneLabel) {
      widget.alarm_zone_label = alarmZoneLabel;
    } else {
      delete widget.alarm_zone_label;
    }
    widget.alarm_show_sensors = el.fAlarmShowSensors ? !!el.fAlarmShowSensors.checked : true;
    widget.alarm_show_bypassed = el.fAlarmShowBypassed ? !!el.fAlarmShowBypassed.checked : true;
    widget.alarm_force_arm = el.fAlarmForceArm ? !!el.fAlarmForceArm.checked : true;
    widget.alarm_skip_delay = el.fAlarmSkipDelay ? !!el.fAlarmSkipDelay.checked : false;
  } else {
    delete widget.alarm_code;
    delete widget.alarm_modes;
    delete widget.alarm_ask_code;
    delete widget.alarm_backend;
    delete widget.alarm_zone_label;
    delete widget.alarm_show_sensors;
    delete widget.alarm_show_bypassed;
    delete widget.alarm_force_arm;
    delete widget.alarm_skip_delay;
  }
  if (widgetType === "clock_alarm") {
    widget.clock_show_seconds = el.fClockShowSeconds ? !!el.fClockShowSeconds.checked : false;
    widget.clock_show_date = el.fClockShowDate ? !!el.fClockShowDate.checked : true;
  } else {
    delete widget.clock_show_seconds;
    delete widget.clock_show_date;
  }
  if (widgetType === "sensor") {
    widget.sensor_value_color = normalizeHexColor(el.fSensorValueColor?.value, "");
  } else {
    delete widget.sensor_value_color;
  }
  applyTileLookFromInspector(widget);
  widget.rect = clampRectToCanvas(
    {
      x: Number(el.fX.value || 0),
      y: Number(el.fY.value || 0),
      w: Number(el.fW.value || widget.rect.w),
      h: Number(el.fH.value || widget.rect.h),
    },
    widgetType
  );
  editor.selectedWidgetId = widget.id;
  renderInspectorChange(refreshInspector);
  return true;
}

function autoApplyInspector(options = {}) {
  return applyInspector({
    refreshInspector: false,
    ...options,
  });
}

function bindInspectorAutoApply(input, events = ["change"], options = {}) {
  if (!input) return;
  const handler = () => autoApplyInspector(options);
  for (const eventName of events) {
    input.addEventListener(eventName, handler);
  }
}

/* Key order independent JSON text, used to detect that the layout on the panel
   changed (another tab, the API or a restore) since this editor loaded it. */
function canonicalLayoutJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalLayoutJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalLayoutJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

function layoutSignatureOf(layout) {
  return layout ? canonicalLayoutJson(layout) : "";
}

async function confirmLayoutSaveOverConflict() {
  if (!editor.layoutSignature) return true;
  let remoteSignature = "";
  try {
    const remote = await apiGet("/api/layout");
    if (!remote || !Array.isArray(remote.pages)) return true;
    normalizeLayoutWidgets(remote);
    remoteSignature = layoutSignatureOf(remote);
  } catch (_) {
    return true;
  }
  if (!remoteSignature || remoteSignature === editor.layoutSignature) return true;
  if (window.confirm(t("layout.status.conflict_confirm"))) {
    setStatus(t("layout.status.conflict_overridden"));
    return true;
  }
  setStatus(t("layout.status.conflict_title"), true);
  return false;
}

async function saveLayout() {
  if (isEnergyPage(selectedPage())) {
    applyEnergyPageConfig({ render: false });
  }
  normalizeLayoutWidgets(editor.layout);
  if (!(await confirmLayoutSaveOverConflict())) {
    return;
  }
  setStatus(t("layout.status.saving"));
  const response = await fetch("/api/layout", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editor.layout),
  });
  if (!response.ok) {
    let detail = await response.text();
    try {
      const json = JSON.parse(detail);
      detail = (json.errors || []).join(", ") || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  editor.layoutSignature = layoutSignatureOf(editor.layout);
  setStatus(t("layout.status.saved"));
}

function exportLayout() {
  if (isEnergyPage(selectedPage())) {
    applyEnergyPageConfig({ render: false });
  }
  normalizeLayoutWidgets(editor.layout);
  const blob = new Blob([JSON.stringify(editor.layout, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "betta-layout.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importLayoutFromText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.pages)) {
    throw new Error(t("layout.status.invalid_json"));
  }
  normalizeLayoutWidgets(parsed);
  editor.layout = parsed;
  editor.selectedPageId = parsed.pages[0]?.id || null;
  editor.selectedWidgetId = null;
  renderAll();
  setStatus(t("layout.status.imported"));
}

function bindUi() {
  setupSettingsWorkspace();
  for (const button of el.settingsNavButtons || []) {
    button.onclick = () => setActiveSettingsSection(button.dataset.settingsSection);
  }
  if (el.toggleWidgetsSection) {
    el.toggleWidgetsSection.onclick = () => toggleSection("widgets");
  }
  if (el.toggleInspectorSection) {
    el.toggleInspectorSection.onclick = () => toggleSection("inspector");
  }
  applySectionCollapseState();

  if (el.logsRefreshBtn) {
    el.logsRefreshBtn.onclick = () => loadLogs(true);
  }
  if (el.logsPauseBtn) {
    el.logsPauseBtn.onclick = () => setLogsPaused(!editor.logs.paused);
  }
  if (el.logsClearBtn) {
    el.logsClearBtn.onclick = () => clearLogs();
  }
  if (el.diagnosticsRefreshBtn) {
    el.diagnosticsRefreshBtn.onclick = () => {
      void loadDiagnostics(true);
    };
  }
  if (el.diagnosticsAutoRefresh) {
    el.diagnosticsAutoRefresh.onchange = () => {
      if (el.diagnosticsAutoRefresh.checked) {
        void loadDiagnostics(true);
      } else {
        clearDiagnosticsPoll();
      }
    };
  }
  if (el.logsAutoScroll) {
    el.logsAutoScroll.onchange = () => {
      if (el.logsAutoScroll.checked && el.settingsLogsViewer) {
        el.settingsLogsViewer.scrollTop = el.settingsLogsViewer.scrollHeight;
      }
    };
  }

  el.layoutTabBtn.onclick = () => setActivePane("layout");
  document.getElementById("remoteTabBtn").onclick = () => setActivePane("remote");
  el.settingsTabBtn.onclick = async () => {
    setActivePane("settings");
    await loadSettings(true);
    await loadOtaStatus(true);
  };
  el.addPageBtn.onclick = addPage;
  if (el.addEnergyPageBtn) {
    el.addEnergyPageBtn.onclick = addEnergyPage;
  }
  if (el.addMusicPageBtn) {
    el.addMusicPageBtn.onclick = addMusicPage;
  }
  el.deletePageBtn.onclick = deletePage;
  el.applyPageBtn.onclick = applyPageName;
  initSimpleUiMenus();
  if (el.applyEnergyPageBtn) {
    el.applyEnergyPageBtn.onclick = () => applyEnergyPageConfig();
  }
  if (el.energySource) {
    el.energySource.onchange = () => applyEnergyPageConfig();
  }
  for (const input of Object.values(getEnergyInputs())) {
    if (!input) continue;
    input.onchange = () => applyEnergyPageConfig();
    input.onblur = () => applyEnergyPageConfig();
  }
  if (el.applyMusicPageBtn) {
    el.applyMusicPageBtn.onclick = () => applyMusicPageConfig();
  }
  for (const input of [el.musicPlayerEntity, el.musicPlayers]) {
    if (!input) continue;
    input.onchange = () => applyMusicPageConfig();
    input.onblur = () => applyMusicPageConfig();
  }
  el.addSensorBtn.onclick = () => openLightEntityPicker("sensor");
  el.addButtonBtn.onclick = () => openLightEntityPicker("button");
  if (el.addBinarySensorBtn) {
    el.addBinarySensorBtn.onclick = () => openLightEntityPicker("binary_sensor");
  }
  if (el.addAlarmTileBtn) {
    el.addAlarmTileBtn.onclick = () => openLightEntityPicker("alarm_tile");
  }
  if (el.addCoverTileBtn) {
    el.addCoverTileBtn.onclick = () => openLightEntityPicker("cover_tile");
  }
  if (el.addSceneTileBtn) {
    el.addSceneTileBtn.onclick = () => openLightEntityPicker("scene_tile");
  }
  if (el.addPersonTileBtn) {
    el.addPersonTileBtn.onclick = () => openLightEntityPicker("person_tile");
  }
  if (el.addTimerTileBtn) {
    /* The timer tile also works standalone, so its picker offers a blank option too. */
    el.addTimerTileBtn.onclick = () => openLightEntityPicker("timer_tile");
  }
  if (el.addClockBtn) {
    el.addClockBtn.onclick = () => addWidget("clock_alarm");
  }
  el.addSliderBtn.onclick = () => addWidget("slider");
  el.addGraphBtn.onclick = () => openLightEntityPicker("graph");
  el.addEmptyTileBtn.onclick = () => addWidget("empty_tile");
  el.addLightTileBtn.onclick = () => openLightEntityPicker("light_tile");
  if (el.openSetupWizardBtn) {
    el.openSetupWizardBtn.onclick = () => openSetupWizard({ manual: true });
  }
  el.addHeatingTileBtn.onclick = () => openLightEntityPicker("heating_tile");
  el.addWeatherTileBtn.onclick = () => openLightEntityPicker("weather_tile");
  el.addWeather3DayBtn.onclick = () => openLightEntityPicker("weather_3day");
  if (el.addTodoListBtn) {
    el.addTodoListBtn.onclick = () => openLightEntityPicker("todo_list");
  }
  if (el.addMediaPlayerBtn) {
    el.addMediaPlayerBtn.onclick = () => openLightEntityPicker("media_player");
  }
  if (el.addRoborockTileBtn) {
    el.addRoborockTileBtn.onclick = () => openLightEntityPicker("roborock_tile");
  }
  if (el.lightEntityPickerRefreshBtn) {
    el.lightEntityPickerRefreshBtn.onclick = () => {
      const config = entityPickerConfig();
      const cacheKey = entityPickerCacheKey(config.domain);
      editor.lightPicker.hasLoaded = false;
      editor.lightPicker.loadedByDomain[cacheKey] = false;
      clearLightEntityPickerPoll();
      clearLightEntityPickerSearchDebounce();
      void fetchLightEntityPicker({ refresh: true });
    };
  }
  if (el.lightEntityPickerSearch) {
    el.lightEntityPickerSearch.oninput = () => {
      const config = entityPickerConfig();
      const search = el.lightEntityPickerSearch.value || "";
      editor.lightPicker.search = search;
      editor.lightPicker.searchByDomain[config.domain] = search;
      const cacheKey = entityPickerCacheKey(config.domain, search);
      editor.lightPicker.items = editor.lightPicker.itemsByDomain[cacheKey] || [];
      editor.lightPicker.hasLoaded = editor.lightPicker.loadedByDomain[cacheKey] === true;
      clearLightEntityPickerPoll();
      clearLightEntityPickerSearchDebounce();
      const shouldAutoFetch =
        !editor.lightPicker.hasLoaded && entityPickerSearchReady(config) && entityPickerLiveSearchEnabled(config);
      editor.lightPicker.requestSeq += 1;
      editor.lightPicker.loading = shouldAutoFetch;
      renderLightEntityPicker({
        status: editor.lightPicker.hasLoaded ? "ready" : (shouldAutoFetch ? "pending" : "idle"),
        pending: shouldAutoFetch,
        items: editor.lightPicker.items,
      });
      if (shouldAutoFetch) {
        editor.lightPicker.searchDebounceId = window.setTimeout(() => {
          editor.lightPicker.searchDebounceId = null;
          void fetchLightEntityPicker({ refresh: true });
        }, ENTITY_PICKER_SEARCH_DEBOUNCE_MS);
      }
    };
    el.lightEntityPickerSearch.onkeydown = (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const config = entityPickerConfig();
      const cacheKey = entityPickerCacheKey(config.domain);
      editor.lightPicker.hasLoaded = false;
      editor.lightPicker.loadedByDomain[cacheKey] = false;
      clearLightEntityPickerPoll();
      clearLightEntityPickerSearchDebounce();
      void fetchLightEntityPicker({ refresh: true });
    };
  }
  if (el.lightEntityPickerCloseBtn) {
    el.lightEntityPickerCloseBtn.onclick = closeLightEntityPicker;
  }
  if (el.lightEntityPickerBlankBtn) {
    el.lightEntityPickerBlankBtn.onclick = () => {
      addWidget(editor.lightPicker.widgetType || "light_tile");
      closeLightEntityPicker();
    };
  }
  if (el.lightEntityPickerOverlay) {
    el.lightEntityPickerOverlay.addEventListener("click", (event) => {
      if (event.target === el.lightEntityPickerOverlay) {
        closeLightEntityPicker();
      }
    });
  }
  if (el.setupWizardAddLightBtn) {
    el.setupWizardAddLightBtn.onclick = () => openSetupWizardEntityPicker("light_tile");
  }
  if (el.setupWizardAddHeatingBtn) {
    el.setupWizardAddHeatingBtn.onclick = () => openSetupWizardEntityPicker("heating_tile");
  }
  if (el.setupWizardAddWeatherBtn) {
    el.setupWizardAddWeatherBtn.onclick = () => openSetupWizardEntityPicker("weather_tile");
  }
  if (el.setupWizardAddButtonBtn) {
    el.setupWizardAddButtonBtn.onclick = () => openSetupWizardEntityPicker("button");
  }
  if (el.setupWizardAddSensorBtn) {
    el.setupWizardAddSensorBtn.onclick = () => openSetupWizardEntityPicker("sensor");
  }
  if (el.setupWizardPageTitle) {
    el.setupWizardPageTitle.onchange = applySetupWizardPageTitle;
    el.setupWizardPageTitle.onblur = applySetupWizardPageTitle;
  }
  if (el.setupWizardCloseBtn) {
    el.setupWizardCloseBtn.onclick = () => closeSetupWizard(true);
  }
  if (el.setupWizardSkipBtn) {
    el.setupWizardSkipBtn.onclick = () => closeSetupWizard(true);
  }
  if (el.setupWizardDoneBtn) {
    el.setupWizardDoneBtn.onclick = () => {
      void saveSetupWizardLayout({ closeOnSuccess: true });
    };
  }
  if (el.setupWizardSaveBtn) {
    el.setupWizardSaveBtn.onclick = () => {
      void saveSetupWizardLayout();
    };
  }
  if (el.setupWizardOverlay) {
    el.setupWizardOverlay.addEventListener("click", (event) => {
      if (event.target === el.setupWizardOverlay) {
        closeSetupWizard(true);
      }
    });
  }
  el.deleteWidgetBtn.onclick = deleteWidget;
  if (el.applyInspectorBtn) {
    el.applyInspectorBtn.onclick = () => applyInspector();
  }
  el.reloadBtn.onclick = () => loadLayout();
  el.fType.onchange = () => {
    const sliderDomain = normalizeSliderEntityDomain(el.fSliderEntityDomain?.value);
    const buttonMode = normalizeButtonMode(el.fButtonMode?.value);
    if (el.buttonOptions) {
      el.buttonOptions.classList.toggle("hidden", el.fType.value !== "button");
    }
    if (el.sliderOptions) {
      el.sliderOptions.classList.toggle("hidden", el.fType.value !== "slider");
    }
    if (el.graphOptions) {
      el.graphOptions.classList.toggle("hidden", el.fType.value !== "graph");
    }
    if (el.binaryOptions) {
      el.binaryOptions.classList.toggle("hidden", el.fType.value !== "binary_sensor");
    }
    if (el.alarmOptions) {
      el.alarmOptions.classList.toggle("hidden", el.fType.value !== "alarm_tile");
    }
    if (el.clockOptions) {
      el.clockOptions.classList.toggle("hidden", el.fType.value !== "clock_alarm");
    }
    if (el.sensorOptions) {
      el.sensorOptions.classList.toggle("hidden", el.fType.value !== "sensor");
    }
    if (el.fType.value === "button") {
      if (el.fButtonMode) {
        el.fButtonMode.value = buttonMode;
      }
      if (el.fButtonAccentColor) {
        el.fButtonAccentColor.value = normalizeHexColor(el.fButtonAccentColor.value, DEFAULT_BUTTON_ACCENT_COLOR);
      }
      if (el.fButtonStyle) {
        el.fButtonStyle.value = normalizeButtonStyle(el.fButtonStyle.value);
      }
    } else {
      if (el.fButtonMode) {
        el.fButtonMode.value = DEFAULT_BUTTON_MODE;
      }
      if (el.fButtonAccentColor) {
        el.fButtonAccentColor.value = DEFAULT_BUTTON_ACCENT_COLOR;
      }
      if (el.fButtonStyle) {
        el.fButtonStyle.value = DEFAULT_BUTTON_STYLE;
      }
    }
    if (el.fType.value === "slider") {
      if (el.fSliderEntityDomain) {
        el.fSliderEntityDomain.value = sliderDomain;
      }
      if (el.fSliderDirection) {
        el.fSliderDirection.value = normalizeSliderDirection(el.fSliderDirection.value);
      }
      if (el.fSliderAccentColor) {
        el.fSliderAccentColor.value = normalizeHexColor(el.fSliderAccentColor.value, DEFAULT_SLIDER_ACCENT_COLOR);
      }
    }
    if (el.fType.value === "graph") {
      if (el.fGraphLineColor) {
        el.fGraphLineColor.value = normalizeHexColor(el.fGraphLineColor.value, DEFAULT_GRAPH_LINE_COLOR);
      }
      if (el.fGraphTimeWindowMin) {
        el.fGraphTimeWindowMin.value = String(normalizeGraphTimeWindowMin(el.fGraphTimeWindowMin.value));
      }
      if (el.fGraphPointCount) {
        const normalizedGraphPoints = normalizeGraphPointCount(el.fGraphPointCount.value);
        el.fGraphPointCount.value = normalizedGraphPoints > 0 ? String(normalizedGraphPoints) : "";
      }
      if (el.fGraphDisplayMode) {
        el.fGraphDisplayMode.value = normalizeGraphDisplayMode(el.fGraphDisplayMode.value);
      }
      if (el.fGraphBarBucketMin) {
        el.fGraphBarBucketMin.value = String(normalizeGraphBarBucketMin(el.fGraphBarBucketMin.value));
      }
    } else {
      if (el.fGraphLineColor) {
        el.fGraphLineColor.value = DEFAULT_GRAPH_LINE_COLOR;
      }
      if (el.fGraphTimeWindowMin) {
        el.fGraphTimeWindowMin.value = String(DEFAULT_GRAPH_TIME_WINDOW_MIN);
      }
      if (el.fGraphPointCount) {
        el.fGraphPointCount.value = "";
      }
      if (el.fGraphDisplayMode) {
        el.fGraphDisplayMode.value = DEFAULT_GRAPH_DISPLAY_MODE;
      }
      if (el.fGraphBarBucketMin) {
        el.fGraphBarBucketMin.value = String(DEFAULT_GRAPH_BAR_BUCKET_MIN);
      }
    }
    if (el.fType.value === "binary_sensor") {
      if (el.fBinaryColorOn) {
        el.fBinaryColorOn.value = normalizeHexColor(el.fBinaryColorOn.value, "");
      }
      if (el.fBinaryColorOff) {
        el.fBinaryColorOff.value = normalizeHexColor(el.fBinaryColorOff.value, "");
      }
      if (el.fBinaryTextOn) {
        el.fBinaryTextOn.value = normalizeBinaryText(el.fBinaryTextOn.value);
      }
      if (el.fBinaryTextOff) {
        el.fBinaryTextOff.value = normalizeBinaryText(el.fBinaryTextOff.value);
      }
    } else {
      if (el.fBinaryShowTitle) {
        el.fBinaryShowTitle.checked = true;
      }
      if (el.fBinaryColorOn) {
        el.fBinaryColorOn.value = "";
      }
      if (el.fBinaryColorOff) {
        el.fBinaryColorOff.value = "";
      }
      if (el.fBinaryTextOn) {
        el.fBinaryTextOn.value = "";
      }
      if (el.fBinaryTextOff) {
        el.fBinaryTextOff.value = "";
      }
    }
    if (el.fType.value === "sensor") {
      if (el.fSensorValueColor) {
        el.fSensorValueColor.value = normalizeHexColor(el.fSensorValueColor.value, "");
      }
    } else {
      if (el.fSensorValueColor) {
        el.fSensorValueColor.value = "";
      }
    }
    renderEntityOptions();
    const currentEntity = el.fEntity.value.trim();
    const effectiveButtonMode = el.fType.value === "button"
      ? normalizeButtonMode(el.fButtonMode?.value)
      : DEFAULT_BUTTON_MODE;
    if (!entityMatchesWidgetType({ id: currentEntity }, el.fType.value, sliderDomain, effectiveButtonMode)) {
      el.fEntity.value = pickDefaultEntityForWidgetType(el.fType.value, sliderDomain, effectiveButtonMode);
    }
    if (el.fType.value === "heating_tile") {
      const sensorEntity = el.fSecondaryEntity.value.trim();
      if (!sensorEntity.startsWith("sensor.")) {
        el.fSecondaryEntity.value = pickDefaultEntityForWidgetType("sensor");
      }
    } else {
      el.fSecondaryEntity.value = "";
    }
  };
  if (el.fEntity) {
    el.fEntity.oninput = () => scheduleEntityAutocomplete("primary");
    el.fEntity.onfocus = () => scheduleEntityAutocomplete("primary", true);
    el.fEntity.onchange = () => autoApplyInspector();
    el.fEntity.onblur = () => autoApplyInspector();
  }
  if (el.fButtonMode) {
    el.fButtonMode.onchange = () => {
      el.fButtonMode.value = normalizeButtonMode(el.fButtonMode.value);
      if (inspectorWidgetType() !== "button") return;
      if (buttonModeRequiresMediaPlayer(el.fButtonMode.value) && el.fButtonStyle) {
        el.fButtonStyle.value = DEFAULT_BUTTON_STYLE;
      }
      renderEntityOptions();
      scheduleEntityAutocomplete("primary", true);
      const currentEntity = el.fEntity.value.trim();
      const buttonMode = inspectorButtonMode();
      if (!entityMatchesWidgetType({ id: currentEntity }, "button", DEFAULT_SLIDER_ENTITY_DOMAIN, buttonMode)) {
        el.fEntity.value = pickDefaultEntityForWidgetType("button", DEFAULT_SLIDER_ENTITY_DOMAIN, buttonMode);
      }
      autoApplyInspector();
    };
  }
  if (el.fSliderEntityDomain) {
    el.fSliderEntityDomain.onchange = () => {
      el.fSliderEntityDomain.value = normalizeSliderEntityDomain(el.fSliderEntityDomain.value);
      if (inspectorWidgetType() !== "slider") return;
      scheduleEntityAutocomplete("primary", true);
      const currentEntity = el.fEntity.value.trim();
      const sliderDomain = inspectorSliderEntityDomain();
      if (!entityMatchesWidgetType({ id: currentEntity }, "slider", sliderDomain)) {
        el.fEntity.value = pickDefaultEntityForWidgetType("slider", sliderDomain);
      }
      autoApplyInspector();
    };
  }
  if (el.fSecondaryEntity) {
    el.fSecondaryEntity.oninput = () => scheduleEntityAutocomplete("secondary");
    el.fSecondaryEntity.onfocus = () => scheduleEntityAutocomplete("secondary", true);
    el.fSecondaryEntity.onchange = () => autoApplyInspector();
    el.fSecondaryEntity.onblur = () => autoApplyInspector();
  }
  bindInspectorAutoApply(el.fTitle, ["input"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fButtonAccentColor, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fButtonStyle, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fBinaryShowTitle, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fBinaryColorOn, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fBinaryColorOff, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fBinaryTextOn, ["input"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fBinaryTextOff, ["input"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fSensorValueColor, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fClockShowSeconds, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fClockShowDate, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmCode, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmAskCode, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmBackend, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmZoneLabel, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmShowSensors, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmShowBypassed, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmForceArm, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fAlarmSkipDelay, ["change"], { softEntityValidation: true });
  for (const alarmModeInput of alarmModeInputs()) {
    bindInspectorAutoApply(alarmModeInput, ["change"], { softEntityValidation: true });
  }
  for (const [key, textInput, colorInput] of tileLookColorFields()) {
    bindTileColorPair(textInput, colorInput);
    bindInspectorAutoApply(textInput, ["input", "change"], { softEntityValidation: true });
  }
  bindInspectorAutoApply(el.fTileBgGradDir, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fTileFontScale, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fTileBorderWidth, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fTileRadius, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fTileOpacity, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fTileShadow, ["change"], { softEntityValidation: true });
  if (el.fTilePreset) {
    el.fTilePreset.addEventListener("change", () => applyTileLookPreset(el.fTilePreset.value));
  }
  if (el.fTileCornerShape) {
    el.fTileCornerShape.addEventListener("change", () => applyTileCornerShape(el.fTileCornerShape.value));
  }
  if (el.fTileRadius) {
    el.fTileRadius.addEventListener("change", syncTileCornerShapeSelect);
  }
  if (el.fTileResetBtn) {
    el.fTileResetBtn.addEventListener("click", () => {
      clearTileLookInspector();
      applyTileLookFromInspector(selectedWidget());
      renderInspectorChange(false);
    });
  }
  if (el.tileLookCopyBtn) {
    el.tileLookCopyBtn.addEventListener("click", () => copyTileLookFromSource());
  }
  if (el.tileLookCopyPageBtn) {
    el.tileLookCopyPageBtn.addEventListener("click", () => applyTileLookToPage());
  }
  bindPageLookInputs();
  bindInspectorAutoApply(el.fSliderDirection, ["change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fSliderAccentColor, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fGraphLineColor, ["input", "change"], { softEntityValidation: true });
  bindInspectorAutoApply(el.fGraphTimeWindowMin, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fGraphPointCount, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fGraphDisplayMode, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fGraphBarBucketMin, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fHeatingStyleVariant, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fHeatingArcOpening, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fX, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fY, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fW, ["change"], { refreshInspector: true, softEntityValidation: true });
  bindInspectorAutoApply(el.fH, ["change"], { refreshInspector: true, softEntityValidation: true });
  el.reloadSettingsBtn.onclick = async () => {
    await loadSettings();
    await loadOtaStatus(true);
  };
  if (el.startOtaUrlBtn) {
    el.startOtaUrlBtn.onclick = () => {
      void startOtaFromUrl();
    };
  }
  if (el.refreshOtaStatusBtn) {
    el.refreshOtaStatusBtn.onclick = () => {
      void loadOtaStatus();
    };
  }
  if (el.uploadOtaBtn) {
    el.uploadOtaBtn.onclick = () => {
      void uploadOtaFile();
    };
  }
  el.scanWifiBtn.onclick = () => scanWifiNetworks("settings");
  el.settingsWifiScanResults.onchange = () => {
    const option = el.settingsWifiScanResults.selectedOptions?.[0];
    const ssid = option?.dataset?.ssid || "";
    if (ssid) {
      el.settingsWifiSsid.value = ssid;
    }
    const bssid = normalizeBssid(option?.dataset?.bssid || "");
    if (bssid && el.settingsWifiBssid) {
      el.settingsWifiBssid.value = bssid;
    }
  };
  if (el.settingsWifiCountryCode) {
    el.settingsWifiCountryCode.oninput = () => {
      const cleaned = (el.settingsWifiCountryCode.value || "")
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2);
      el.settingsWifiCountryCode.value = cleaned;
    };
  }
  if (el.settingsWifiBssid) {
    el.settingsWifiBssid.oninput = () => {
      const cleaned = (el.settingsWifiBssid.value || "")
        .toUpperCase()
        .replace(/[^0-9A-F:-]/g, "")
        .slice(0, 17);
      el.settingsWifiBssid.value = cleaned;
    };
  }
  if (el.uploadLanguageCode) {
    el.uploadLanguageCode.oninput = () => {
      const cleaned = (el.uploadLanguageCode.value || "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 15);
      el.uploadLanguageCode.value = cleaned;
    };
  }
  if (el.settingsLanguage) {
    el.settingsLanguage.onchange = async () => {
      const lang = normalizeUiLanguage(el.settingsLanguage.value);
      if (!editor.settings) editor.settings = {};
      if (!editor.settings.ui) editor.settings.ui = {};
      editor.settings.ui.language = lang;
      await loadI18nLanguage(lang);
      if (el.uploadLanguageCode) {
        el.uploadLanguageCode.value = lang;
      }
      renderSettings();
    };
  }
  if (el.reloadLanguagesBtn) {
    el.reloadLanguagesBtn.onclick = async () => {
      try {
        await loadLanguageCatalog();
        renderLanguageOptions();
        if (el.settingsTranslationInfo) {
          el.settingsTranslationInfo.textContent = t("settings.translation.info");
        }
      } catch (err) {
        if (el.settingsTranslationInfo) {
          el.settingsTranslationInfo.textContent = t("settings.translation.upload_fail", { error: err.message });
          el.settingsTranslationInfo.classList.add("error");
        }
      }
    };
  }
  if (el.downloadLanguageBtn) {
    el.downloadLanguageBtn.onclick = async () => {
      const lang = normalizeUiLanguage(el.settingsLanguage?.value || editor.i18nLanguage);
      await loadI18nLanguage(lang);
      downloadLanguageJson();
    };
  }
  if (el.uploadLanguageBtn) {
    el.uploadLanguageBtn.onclick = async () => {
      if (el.settingsTranslationInfo) {
        el.settingsTranslationInfo.classList.remove("error");
      }
      try {
        const targetLang = normalizeLanguageCode(el.uploadLanguageCode?.value, "");
        await uploadLanguageJson();
        if (el.settingsTranslationInfo) {
          el.settingsTranslationInfo.textContent = t("settings.translation.upload_ok", { lang: targetLang });
          el.settingsTranslationInfo.classList.remove("error");
        }
        if (el.uploadLanguageFile) {
          el.uploadLanguageFile.value = "";
        }
        await loadI18nLanguage(targetLang || editor.i18nLanguage, true);
        renderSettings();
      } catch (err) {
        if (el.settingsTranslationInfo) {
          el.settingsTranslationInfo.textContent = t("settings.translation.upload_fail", { error: err.message });
          el.settingsTranslationInfo.classList.add("error");
        }
      }
    };
  }
  if (el.provScanWifiBtn) {
    el.provScanWifiBtn.onclick = () => scanWifiNetworks("provisioning");
  }
  if (el.provWifiScanResults) {
    el.provWifiScanResults.onchange = () => {
      const option = el.provWifiScanResults.selectedOptions?.[0];
      const ssid = option?.dataset?.ssid || "";
      if (ssid && el.provWifiSsid) {
        el.provWifiSsid.value = ssid;
      }
    };
  }
  if (el.provWifiCountryCode) {
    el.provWifiCountryCode.oninput = () => {
      const cleaned = (el.provWifiCountryCode.value || "")
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2);
      el.provWifiCountryCode.value = cleaned;
    };
  }
  if (el.provWifiShowPassword && el.provWifiPassword) {
    el.provWifiShowPassword.onchange = () => {
      el.provWifiPassword.type = el.provWifiShowPassword.checked ? "text" : "password";
    };
  }
  if (el.provHaShowToken && el.provHaToken) {
    el.provHaShowToken.onchange = () => {
      el.provHaToken.type = el.provHaShowToken.checked ? "text" : "password";
    };
  }
  if (el.provWifiSaveBtn) {
    el.provWifiSaveBtn.onclick = async () => {
      try {
        await saveWifiProvisioning();
      } catch (err) {
        setProvisioningInfo("wifi", t("provision.save_failed", { error: err.message }), true);
      }
    };
  }
  if (el.provHaSaveBtn) {
    el.provHaSaveBtn.onclick = async () => {
      try {
        await saveHaProvisioning();
      } catch (err) {
        setProvisioningInfo("ha", t("provision.save_failed", { error: err.message }), true);
      }
    };
  }
  el.saveSettingsBtn.onclick = async () => {
    try {
      await saveSettings();
    } catch (err) {
      setStatus(t("status.settings_save_failed", { error: err.message }), true);
    }
  };
  if (el.applyDisplayBtn) {
    el.applyDisplayBtn.onclick = async () => {
      try {
        await applyDisplaySettings();
      } catch (err) {
        if (el.settingsDisplayInfo) {
          el.settingsDisplayInfo.textContent = String(err?.message || err);
          el.settingsDisplayInfo.classList.add("error");
        }
      }
    };
  }
  bindPressFxPreview();
  bindValueAnimPreview();
  bindSdSettings();
  bindTopbar();
  bindNav();
  if (el.applyPagesBtn) {
    el.applyPagesBtn.onclick = async () => {
      try {
        await applyDisplaySettings(el.settingsPagesInfo, "settings.pages.applied");
      } catch (err) {
        if (el.settingsPagesInfo) {
          el.settingsPagesInfo.textContent = String(err?.message || err);
          el.settingsPagesInfo.classList.add("error");
        }
      }
    };
  }
  if (el.reloadPagesBtn) {
    el.reloadPagesBtn.onclick = () => {
      loadPanelPages(true);
    };
  }
  if (el.showPageOnPanelBtn) {
    el.showPageOnPanelBtn.onclick = async () => {
      const page = el.settingsPageTarget?.value;
      if (!page) return;
      if (el.settingsPageActivateInfo) {
        el.settingsPageActivateInfo.textContent = t("status.saving_settings");
        el.settingsPageActivateInfo.classList.remove("error");
      }
      try {
        await activatePanelPage(page);
        if (el.settingsPageActivateInfo) {
          el.settingsPageActivateInfo.textContent = t("settings.pages.activated", { page });
        }
        loadPanelPages(false);
      } catch (err) {
        if (el.settingsPageActivateInfo) {
          el.settingsPageActivateInfo.textContent = String(err?.message || err);
          el.settingsPageActivateInfo.classList.add("error");
        }
      }
    };
  }
  if (el.applyMqttBtn) {
    el.applyMqttBtn.onclick = async () => {
      try {
        await applyMqttSettings();
      } catch (err) {
        if (el.settingsMqttInfo) {
          el.settingsMqttInfo.textContent = String(err?.message || err);
          el.settingsMqttInfo.classList.add("error");
        }
      }
    };
  }
  if (el.settingsMqttUseTls) {
    el.settingsMqttUseTls.onchange = () => {
      syncMqttPortForTls();
      if (el.settingsMqttInfo) {
        el.settingsMqttInfo.classList.remove("error");
        el.settingsMqttInfo.textContent = t("settings.mqtt.reapply_hint");
      }
    };
  }
  if (el.settingsMqttEnabled) {
    el.settingsMqttEnabled.onchange = () => {
      if (el.settingsMqttInfo) {
        el.settingsMqttInfo.classList.remove("error");
        el.settingsMqttInfo.textContent = t("settings.mqtt.reapply_hint");
      }
    };
  }
  if (el.uploadWallpaperBtn) {
    el.uploadWallpaperBtn.onclick = async () => {
      try {
        await uploadWallpaper();
      } catch (err) {
        if (el.settingsWallpaperInfo) {
          el.settingsWallpaperInfo.textContent = String(err?.message || err);
          el.settingsWallpaperInfo.classList.add("error");
        }
      }
    };
  }
  if (el.removeWallpaperBtn) {
    el.removeWallpaperBtn.onclick = async () => {
      try {
        await removeWallpaper();
      } catch (err) {
        if (el.settingsWallpaperInfo) {
          el.settingsWallpaperInfo.textContent = String(err?.message || err);
          el.settingsWallpaperInfo.classList.add("error");
        }
      }
    };
  }
  if (el.downloadBackupBtn) {
    el.downloadBackupBtn.onclick = async () => {
      try {
        await downloadBackup();
      } catch (err) {
        setBackupInfo(t("settings.backup.download_failed", { error: String(err?.message || err) }), true);
      }
    };
  }
  if (el.restoreBackupBtn) {
    el.restoreBackupBtn.onclick = async () => {
      try {
        await restoreBackup();
      } catch (err) {
        setBackupInfo(t("settings.backup.restore_failed", { error: String(err?.message || err) }), true);
      }
    };
  }
  el.saveBtn.onclick = async () => {
    try {
      await saveLayout();
    } catch (err) {
      setStatus(t("layout.status.save_failed", { error: err.message }), true);
    }
  };
  el.exportBtn.onclick = exportLayout;
  el.importBtn.onclick = () => {
    const text = el.jsonPaste.value.trim();
    if (!text) return;
    try {
      importLayoutFromText(text);
    } catch (err) {
      setStatus(t("layout.status.import_failed", { error: err.message }), true);
    }
  };
  el.importFile.onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      importLayoutFromText(text);
    } catch (err) {
      setStatus(t("layout.status.file_import_failed", { error: err.message }), true);
    }
  };
}

async function startEditor() {
  if (editor.editorStarted) return;
  editor.editorStarted = true;
  setProvisioningVisible(false);
  setActivePane("layout");
  await Promise.all([loadLayout(), loadEntities(), refreshStates()]);
  await loadEnergyPreview();
  await loadHaDiagnostics();
  if (setupWizardShouldAutoOpen()) {
    openSetupWizard();
  }
  /* Poll diagnostics again shortly after startup so the banner appears automatically
   * once the ha_client watchdog has classified the missing entities (typically ~5-8 s
   * after WebSocket auth). Further refreshes are less frequent. */
  window.setTimeout(loadHaDiagnostics, 3000);
  window.setTimeout(loadHaDiagnostics, 8000);
  window.setTimeout(loadHaDiagnostics, 15000);
  window.setInterval(refreshStates, 5000);
  window.setInterval(loadEnergyPreview, 15000);
  window.setInterval(loadHaDiagnostics, 30000);
}

async function bootstrap() {
  bindUi();
  initThemeSection();
  setStatus(t("status.idle"));
  await loadAppVersion();
  const settings = await loadSettings(true);
  const stage = provisioningStageForSettings(settings);
  if (stage) {
    showProvisioningStage(stage, settings);
    return;
  }
  await startEditor();
}


// ============================================================
// Theme management (appended)
// ============================================================
const themeState = {
  list: [],
  activeId: "",
  editing: null,
  baseId: "",
};

/* Day/night automatic theme, mirrored from /api/settings and kept here because
 * the theme list is loaded separately from the display settings. */
const autoThemeState = {
  enabled: false,
  dayId: "",
  nightId: "",
};

function themeAutoOptionLabel(entry) {
  return (entry.builtin ? "[built-in] " : "[custom] ") + (entry.name || entry.id);
}

/* Fills both day/night dropdowns from the loaded theme list. The current
 * selection is preserved, an id that no longer exists shows as unset. */
function themePopulateAutoSelects() {
  const daySel = themeEl("settingsThemeDaySelect");
  const nightSel = themeEl("settingsThemeNightSelect");
  if (!daySel || !nightSel) return;

  const fill = (sel, current) => {
    /* Keep what the user picked in this session; the passed value is only used
     * for the very first fill, before any option exists. */
    const wanted = sel.options.length > 0 ? sel.value || "" : current || "";
    sel.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = t("settings.display.theme_auto_none");
    sel.appendChild(none);
    for (const entry of themeState.list) {
      const opt = document.createElement("option");
      opt.value = entry.id;
      opt.textContent = themeAutoOptionLabel(entry);
      sel.appendChild(opt);
    }
    sel.value = wanted;
    if (sel.selectedIndex < 0) sel.value = "";
  };

  fill(daySel, autoThemeState.dayId);
  fill(nightSel, autoThemeState.nightId);
  autoThemeState.dayId = daySel.value || "";
  autoThemeState.nightId = nightSel.value || "";
}

function themeEl(id) {
  return document.getElementById(id);
}

function themeSetInfo(msg, isError) {
  const info = themeEl("settingsThemeInfo");
  if (info) {
    info.textContent = msg || "";
    info.style.color = isError ? "#ff6b6b" : "";
  }
}

async function themeFetchList() {
  const resp = await fetch("/api/themes");
  if (!resp.ok) throw new Error("themes list failed");
  const data = await resp.json();
  if (Array.isArray(data)) {
    return { themes: data, active_id: "" };
  }
  return {
    themes: Array.isArray(data && data.themes) ? data.themes : [],
    active_id: (data && data.active_id) || "",
  };
}

async function themeFetchActive() {
  const resp = await fetch("/api/themes/active");
  if (!resp.ok) throw new Error("themes active failed");
  return resp.json();
}

async function themeFetchById(id) {
  const resp = await fetch("/api/themes/get?id=" + encodeURIComponent(id));
  if (!resp.ok) throw new Error("theme get failed");
  return resp.json();
}

function themePopulateSelect() {
  const sel = themeEl("settingsThemeSelect");
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = "";
  for (const entry of themeState.list) {
    const opt = document.createElement("option");
    opt.value = entry.id;
    opt.textContent = (entry.builtin ? "[built-in] " : "[custom] ") + (entry.name || entry.id);
    sel.appendChild(opt);
  }
  if (themeState.activeId) {
    sel.value = themeState.activeId;
  } else if (prev) {
    sel.value = prev;
  }
}

function themeSnapTo565(hex) {
  if (typeof hex !== "string") return hex;
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  let r = (v >> 16) & 0xff;
  let g = (v >> 8) & 0xff;
  let b = v & 0xff;
  const r5 = Math.round((r * 31) / 255);
  const g6 = Math.round((g * 63) / 255);
  const b5 = Math.round((b * 31) / 255);
  r = (r5 << 3) | (r5 >> 2);
  g = (g6 << 2) | (g6 >> 4);
  b = (b5 << 3) | (b5 >> 2);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

const THEME_COLOR_GROUPS = [
  {
    id: "screen",
    label: "Screen & Content",
    keys: ["screen_bg", "screen_bg_grad", "content_bg", "content_border"],
  },
  {
    id: "topbar",
    label: "Top Bar",
    keys: [
      "topbar_bg",
      "topbar_border",
      "topbar_text",
      "topbar_muted",
      "topbar_chip_bg",
      "topbar_chip_border",
      "topbar_status_on",
      "topbar_status_off",
    ],
  },
  {
    id: "text",
    label: "Text",
    keys: ["text_primary", "text_soft", "text_muted"],
  },
  {
    id: "nav",
    label: "Navigation",
    keys: [
      "nav_bg",
      "nav_border",
      "nav_btn_bg_idle",
      "nav_btn_bg_active",
      "nav_tab_idle",
      "nav_tab_active",
      "nav_home_idle",
      "nav_home_active",
    ],
  },
  {
    id: "status",
    label: "Status & Connectivity",
    keys: ["ok", "error", "wifi_off"],
  },
  {
    id: "cards",
    label: "Cards (generic tiles)",
    keys: [
      "card_bg_off",
      "card_bg_on",
      "card_border",
      "card_icon_off",
      "card_icon_on",
      "state_on",
      "state_off",
    ],
  },
  {
    id: "light",
    label: "Light Tiles",
    keys: [
      "light_icon_on",
      "light_track_on",
      "light_track_off",
      "light_ind_on",
      "light_ind_off",
      "light_knob_on",
      "light_knob_off",
    ],
  },
  {
    id: "heat",
    label: "Heating Tiles",
    keys: [
      "heat_icon_on",
      "heat_track_on",
      "heat_track_off",
      "heat_ind_on",
      "heat_ind_off",
      "heat_knob_on",
      "heat_knob_off",
    ],
  },
  {
    id: "weather",
    label: "Weather",
    keys: ["weather_icon"],
  },
];

function themeHumanizeKey(key) {
  if (!key) return "";
  return key
    .replace(/_/g, " ")
    .replace(/\bbg\b/gi, "background")
    .replace(/\bind\b/gi, "indicator")
    .replace(/\bbtn\b/gi, "button")
    .replace(/\btxt\b/gi, "text")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function themeRenderColorGrid(palette) {
  const grid = themeEl("settingsThemeColors");
  if (!grid) return;
  grid.innerHTML = "";
  const colors = (palette && palette.colors) || {};
  const seen = new Set();

  const renderInput = (container, key) => {
    if (!(key in colors)) return;
    seen.add(key);
    const lbl = document.createElement("label");
    const span = document.createElement("span");
    span.textContent = themeHumanizeKey(key);
    span.title = key;
    const input = document.createElement("input");
    input.type = "color";
    input.dataset.key = key;
    const snapped = themeSnapTo565(colors[key]);
    input.value = snapped;
    if (themeState.editing && themeState.editing.colors) {
      themeState.editing.colors[key] = snapped;
    }
    input.addEventListener("input", () => {
      const snappedLive = themeSnapTo565(input.value);
      if (snappedLive !== input.value) {
        input.value = snappedLive;
      }
      themeState.editing.colors[key] = snappedLive;
      themeRenderPreview();
    });
    lbl.appendChild(span);
    lbl.appendChild(input);
    container.appendChild(lbl);
  };

  const appendGroup = (label, keys, { open = true } = {}) => {
    const available = keys.filter((k) => k in colors && !seen.has(k));
    if (available.length === 0) return;
    const group = document.createElement("details");
    group.className = "theme-color-group";
    if (open) group.open = true;
    const summary = document.createElement("summary");
    summary.textContent = label;
    group.appendChild(summary);
    const body = document.createElement("div");
    body.className = "theme-color-group-body";
    for (const key of available) renderInput(body, key);
    group.appendChild(body);
    grid.appendChild(group);
  };

  for (const g of THEME_COLOR_GROUPS) {
    appendGroup(g.label, g.keys, { open: true });
  }

  // Any keys not covered by a known group — render as "Other" collapsed.
  const leftover = Object.keys(colors)
    .filter((k) => !seen.has(k))
    .sort();
  if (leftover.length > 0) {
    appendGroup("Other", leftover, { open: false });
  }
}

function themeRenderPreview() {
  const canvas = themeEl("settingsThemePreviewCanvas");
  if (!canvas || !themeState.editing) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const c = themeState.editing.colors || {};
  const bg = c.screen_bg || "#121212";
  const cardOff = c.card_bg_off || "#2a2a2a";
  const cardOn = c.card_bg_on || "#3a3a3a";
  const text = c.text_primary || "#ffffff";
  const soft = c.text_soft || "#cccccc";
  const accent = c.nav_tab_active || "#6fe8ff";
  const heatInd = c.heat_ind_on || accent;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Tile 1 (off)
  ctx.fillStyle = cardOff;
  themeRoundRect(ctx, 10, 10, 100, 90, 12, true);
  ctx.fillStyle = text;
  ctx.font = "11px sans-serif";
  ctx.fillText("Sensor", 18, 28);
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("21.5°", 18, 60);
  ctx.font = "10px sans-serif";
  ctx.fillStyle = soft;
  ctx.fillText("off", 18, 88);

  // Tile 2 (on)
  ctx.fillStyle = cardOn;
  themeRoundRect(ctx, 120, 10, 100, 90, 12, true);
  ctx.fillStyle = text;
  ctx.font = "11px sans-serif";
  ctx.fillText("Light", 128, 28);
  ctx.fillStyle = accent;
  ctx.fillRect(128, 40, 80, 8);
  ctx.fillStyle = text;
  ctx.font = "10px sans-serif";
  ctx.fillText("on", 128, 88);

  // Tile 3 (heating arc)
  ctx.fillStyle = cardOn;
  themeRoundRect(ctx, 230, 10, 120, 200, 12, true);
  ctx.strokeStyle = c.heat_track_on || "#555";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(290, 110, 45, Math.PI * 0.8, Math.PI * 0.2, false);
  ctx.stroke();
  ctx.strokeStyle = heatInd;
  ctx.beginPath();
  ctx.arc(290, 110, 45, Math.PI * 0.8, Math.PI * 1.4, false);
  ctx.stroke();
  ctx.fillStyle = text;
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("22.5°", 272, 115);
  ctx.fillStyle = soft;
  ctx.font = "10px sans-serif";
  ctx.fillText("Target 22.5", 270, 170);

  // Bottom nav area
  ctx.fillStyle = c.topbar_bg || "#1a1a1a";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
  ctx.fillStyle = accent;
  ctx.fillRect(10, canvas.height - 26, 40, 22);
  ctx.fillStyle = text;
  ctx.font = "11px sans-serif";
  ctx.fillText("Home", 14, canvas.height - 12);
}

function themeRoundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  else ctx.stroke();
}

async function themeLoadAndRender() {
  try {
    const listResp = await themeFetchList();
    themeState.list = listResp.themes;
    const active = await themeFetchActive();
    themeState.activeId = (active && active.id) || listResp.active_id || "";
    themeState.baseId = themeState.activeId;
    themeState.editing = JSON.parse(JSON.stringify(active));
    themePopulateSelect();
    themePopulateAutoSelects();
    if (el.fPageTheme) pagePopulateThemeSelect();
    themeRenderColorGrid(themeState.editing);
    themeRenderPreview();
    themeSyncEditFields();
    themeSetInfo("");
  } catch (e) {
    themeSetInfo("Load failed: " + (e && e.message ? e.message : e), true);
  }
}

/* Prefill the "Custom theme ID / name" inputs based on what's in the
 * dropdown + the currently loaded palette, so that selecting an existing
 * custom theme makes it immediately editable (Save overwrites the same id).
 * For built-in themes we clear the inputs so the user has to pick a new id. */
function themeSyncEditFields() {
  const idInput = themeEl("settingsThemeNewId");
  const nameInput = themeEl("settingsThemeNewName");
  const baseMeta = themeEl("settingsThemeBase");
  if (!idInput || !nameInput) return;

  const editing = themeState.editing || {};
  const entry = themeState.list.find((e) => e.id === editing.id);
  const isCustom = entry && !entry.builtin;

  if (isCustom) {
    idInput.value = editing.id || "";
    nameInput.value = editing.name || entry.name || "";
    idInput.readOnly = true;
    idInput.title = "Editing existing custom theme. Clear to save as a new one.";
    if (baseMeta) {
      baseMeta.textContent =
        "Editing custom theme \"" + (editing.name || editing.id) +
        "\". Changes are saved back to id \"" + editing.id + "\".";
    }
  } else {
    idInput.value = "";
    nameInput.value = "";
    idInput.readOnly = false;
    idInput.title = "";
    if (baseMeta) {
      baseMeta.textContent =
        "Base palette: " + (editing.name || editing.id || "active theme") +
        ". Edit colors below, then \"Save as custom\".";
    }
  }

  const saveBtn = themeEl("settingsThemeSaveCustomBtn");
  if (saveBtn) {
    saveBtn.textContent = isCustom ? "Save changes" : "Save as custom";
  }
}

async function themeApplyActive() {
  const sel = themeEl("settingsThemeSelect");
  if (!sel || !sel.value) return;
  try {
    const resp = await fetch("/api/themes/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sel.value }),
    });
    if (!resp.ok) throw new Error(await resp.text());
    themeSetInfo("Active theme set to " + sel.value);
    await themeLoadAndRender();
  } catch (e) {
    themeSetInfo("Apply failed: " + e.message, true);
  }
}

async function themeExportActive() {
  const sel = themeEl("settingsThemeSelect");
  const id = (sel && sel.value) || themeState.activeId;
  if (!id) return;
  try {
    const theme = await themeFetchById(id);
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme-" + id + ".json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    themeSetInfo("Export failed: " + e.message, true);
  }
}

async function themeImportFile() {
  const input = themeEl("settingsThemeImportFile");
  if (!input || !input.files || !input.files[0]) {
    themeSetInfo("Choose a JSON file first", true);
    return;
  }
  try {
    const text = await input.files[0].text();
    const theme = JSON.parse(text);
    if (!theme || !theme.id) throw new Error("invalid theme JSON: missing id");
    const resp = await fetch("/api/themes/custom", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    if (!resp.ok) throw new Error(await resp.text());
    themeSetInfo("Imported theme " + theme.id);
    await themeLoadAndRender();
  } catch (e) {
    themeSetInfo("Import failed: " + e.message, true);
  }
}

async function themeSaveCustom() {
  const idInput = themeEl("settingsThemeNewId");
  const nameInput = themeEl("settingsThemeNewName");
  let id = (idInput && idInput.value || "").trim();
  let name = (nameInput && nameInput.value || "").trim();
  // If the inputs are empty but we are editing an existing custom theme,
  // reuse its id/name so "Save" overwrites the same theme.
  const editing = themeState.editing || {};
  const editingEntry = themeState.list.find((e) => e.id === editing.id);
  if (!id && editingEntry && !editingEntry.builtin) {
    id = editing.id || "";
    if (!name) name = editing.name || editing.id || "";
  }
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    themeSetInfo("Custom theme ID must be alphanumeric (_-) only", true);
    return;
  }
  if (!themeState.editing || !themeState.editing.colors) {
    themeSetInfo("No palette to save", true);
    return;
  }
  const payload = {
    id,
    name: name || id,
    builtin: false,
    colors: themeState.editing.colors,
  };
  try {
    const resp = await fetch("/api/themes/custom", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error(await resp.text());
    themeSetInfo("Saved custom theme " + id);
    await themeLoadAndRender();
    // Re-select the just-saved theme so editing continues on it.
    const selAfter = themeEl("settingsThemeSelect");
    if (selAfter) {
      selAfter.value = id;
      if (typeof selAfter.onchange === "function") {
        await selAfter.onchange();
      }
    }
  } catch (e) {
    themeSetInfo("Save failed: " + e.message, true);
  }
}

async function themeDeleteCustom() {
  const sel = themeEl("settingsThemeSelect");
  if (!sel || !sel.value) return;
  const entry = themeState.list.find((e) => e.id === sel.value);
  if (!entry) return;
  if (entry.builtin) {
    themeSetInfo("Cannot delete built-in themes", true);
    return;
  }
  if (!window.confirm("Delete theme " + entry.id + "?")) return;
  try {
    const resp = await fetch("/api/themes/custom?id=" + encodeURIComponent(entry.id), { method: "DELETE" });
    if (!resp.ok) throw new Error(await resp.text());
    themeSetInfo("Deleted " + entry.id);
    await themeLoadAndRender();
  } catch (e) {
    themeSetInfo("Delete failed: " + e.message, true);
  }
}

function themeResetToActive() {
  void themeLoadAndRender();
}

function initThemeSection() {
  const applyBtn = themeEl("settingsThemeApplyBtn");
  if (applyBtn) applyBtn.onclick = () => void themeApplyActive();
  const exportBtn = themeEl("settingsThemeExportBtn");
  if (exportBtn) exportBtn.onclick = () => void themeExportActive();
  const importBtn = themeEl("settingsThemeImportBtn");
  if (importBtn) importBtn.onclick = () => void themeImportFile();
  const delBtn = themeEl("settingsThemeDeleteBtn");
  if (delBtn) delBtn.onclick = () => void themeDeleteCustom();
  const saveBtn = themeEl("settingsThemeSaveCustomBtn");
  if (saveBtn) saveBtn.onclick = () => void themeSaveCustom();
  const resetBtn = themeEl("settingsThemeResetBtn");
  if (resetBtn) resetBtn.onclick = () => themeResetToActive();
  const sel = themeEl("settingsThemeSelect");
  if (sel) {
    sel.onchange = async () => {
      try {
        const theme = await themeFetchById(sel.value);
        themeState.editing = theme;
        themeState.baseId = theme.id;
        themeRenderColorGrid(themeState.editing);
        themeRenderPreview();
        themeSyncEditFields();
      } catch (e) {
        themeSetInfo("Load failed: " + e.message, true);
      }
    };
  }
  void themeLoadAndRender();
}

// ============================================================
// Simplified layout UI: + Add dropdowns for Pages / Widgets.
// The original buttons are kept hidden (.legacy-hidden) so every
// existing handler keeps working — menu items just click them.
// ============================================================
function initSimpleUiMenus() {
  bindDropdown("addPageMenuBtn", "addPageMenu");
  bindDropdown("addWidgetMenuBtn", "addWidgetMenu");

  const pageNormal = document.getElementById("addPageMenuNormal");
  if (pageNormal) {
    pageNormal.onclick = () => {
      closeAllDropdowns();
      if (el.addPageBtn) el.addPageBtn.click();
    };
  }
  const pageEnergy = document.getElementById("addPageMenuEnergy");
  if (pageEnergy) {
    pageEnergy.onclick = () => {
      closeAllDropdowns();
      if (el.addEnergyPageBtn) el.addEnergyPageBtn.click();
    };
  }
  const pageMusic = document.getElementById("addPageMenuMusic");
  if (pageMusic) {
    pageMusic.onclick = () => {
      closeAllDropdowns();
      if (el.addMusicPageBtn) el.addMusicPageBtn.click();
    };
  }

  const widgetMenu = document.getElementById("addWidgetMenu");
  if (widgetMenu) {
    widgetMenu.querySelectorAll("[data-add-target]").forEach((item) => {
      item.onclick = () => {
        closeAllDropdowns();
        const targetId = item.getAttribute("data-add-target");
        const btn = document.getElementById(targetId);
        if (btn) btn.click();
      };
    });
  }

  document.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".dropdown")) return;
    closeAllDropdowns();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeAllDropdowns();
  });
}

function bindDropdown(toggleId, menuId) {
  const toggle = document.getElementById(toggleId);
  const menu = document.getElementById(menuId);
  if (!toggle || !menu) return;
  toggle.onclick = (ev) => {
    ev.stopPropagation();
    const willOpen = menu.classList.contains("hidden");
    closeAllDropdowns();
    if (willOpen) {
      menu.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
    }
  };
}

function closeAllDropdowns() {
  for (const menu of document.querySelectorAll(".dropdown-menu")) {
    menu.classList.add("hidden");
  }
  for (const toggle of document.querySelectorAll(".dropdown-toggle")) {
    toggle.setAttribute("aria-expanded", "false");
  }
}

bootstrap();
