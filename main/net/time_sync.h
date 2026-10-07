/* SPDX-License-Identifier: LicenseRef-FNCL-1.1
 * Copyright (c) 2026 Cpt_Kirk
 */
#pragma once

#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

#include "esp_err.h"

/* Apply a named timezone without restarting SNTP. Does not persist settings.
 * Unknown/empty names fail without changing the clock. */
esp_err_t time_sync_set_tz(const char *name);
/* Active name (or legacy POSIX text), valid until the next setter call.
 * Call setters/getter from serialized application contexts. Empty before init. */
const char *time_sync_get_tz(void);
const char *time_sync_tz_rules(const char *name);
/* NULL when index is out of range; returned strings have static lifetime. */
const char *time_sync_tz_name(size_t index);
/* Compatibility boot entry point: accepts named zones or legacy POSIX rules. */
esp_err_t time_sync_set_timezone(const char *tz);
esp_err_t time_sync_start(const char *ntp_server);
bool time_sync_wait_for_sync(uint32_t timeout_ms);
