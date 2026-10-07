/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#pragma once

/* Open the settings overlay with a compact fixed header and content-sized cards.
 * Only the card viewport scrolls; touching controls does not auto-scroll it.
 * Card icons and simple-toggle switches stay vertically centered in each card.
 * Changes apply immediately; the close control saves the runtime settings. */
void ui_screen_settings_open(void);

/* Must be called by ui_pages_init() before it cleans the active screen: the
 * settings page is a child of that screen and is deleted by the clean-up, so
 * the cached handles have to be dropped to avoid deleting freed objects later. */
void ui_screen_settings_handle_screen_clean(void);
